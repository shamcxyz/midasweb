// server.js

const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
require("dotenv").config();

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log("MongoDB connection error:", err));

// User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: { type: String, unique: true },
  password: String,
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  groupAffiliationStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
});

const User = mongoose.model("User", userSchema);

// Group schema and model
const groupSchema = new mongoose.Schema({
  name: String,
  adminCode: { type: String, unique: true }, // Represents the group code
  adminEmail: String, // Email of the group admin
});

const Group = mongoose.model("Group", groupSchema);

// AffiliationRequest schema and model
const affiliationRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const AffiliationRequest = mongoose.model("AffiliationRequest", affiliationRequestSchema);

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key", // Replace with your actual secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use true if HTTPS is enabled
  })
);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  // Configure your email service settings
  service: 'gmail', // Example using Gmail
  auth: {
    user: 'your_email@gmail.com', // Replace with your email
    pass: 'your_email_password',  // Replace with your email password
  },
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
}

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { name, company, email, password, confirmPassword } = req.body;

  // Validate required fields
  if (!name || !company || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  // Check password length
  if (password.length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters long." });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      company,
      email,
      password: hashedPassword,
      role: 'user',
      groupAffiliationStatus: 'none',
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error registering user", error });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Incorrect password" });

    req.session.userId = user._id; // Store user ID in session
    res.json({
      message: "Login successful!",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        groupAffiliationStatus: user.groupAffiliationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Endpoint to get logged-in user profile
app.get("/api/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('group');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      groupAffiliationStatus: user.groupAffiliationStatus,
      group: user.group ? { name: user.group.name, adminCode: user.group.adminCode } : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
});

// Route to request group affiliation
app.post('/api/request-affiliation', isAuthenticated, async (req, res) => {
  const { adminCode } = req.body;
  const userId = req.session.userId;

  try {
    const group = await Group.findOne({ adminCode });
    if (!group) {
      return res.status(400).json({ message: 'Invalid admin code.' });
    }

    // Check if user already has a pending or approved request
    const existingRequest = await AffiliationRequest.findOne({ user: userId, group: group._id });
    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({ message: 'You already have a pending request for this group.' });
    }
    if (existingRequest && existingRequest.status === 'approved') {
      return res.status(400).json({ message: 'You are already a member of this group.' });
    }

    // Create a new affiliation request
    const affiliationRequest = new AffiliationRequest({
      user: userId,
      group: group._id,
    });
    await affiliationRequest.save();

    // Update user's affiliation status
    await User.findByIdAndUpdate(userId, { groupAffiliationStatus: 'pending' });

    // Send email to group admin
    const approvalLink = `http://localhost:4999/api/approve-affiliation/${affiliationRequest._id}`;
    const emailContent = `User ${user.email} has requested to join your group. Click the link to approve: ${approvalLink}`;
    const mailOptions = {
      from: 'your_email@gmail.com', // Replace with your email
      to: group.adminEmail,
      subject: 'Group Affiliation Request',
      text: emailContent,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email to group admin.' });
      } else {
        console.log('Email sent:', info.response);
        res.json({ message: 'Affiliation request sent to group admin.' });
      }
    });
  } catch (error) {
    console.error('Error requesting affiliation:', error);
    res.status(500).json({ message: 'Error requesting affiliation.' });
  }
});

// Route to approve affiliation
app.get('/api/approve-affiliation/:requestId', async (req, res) => {
  const { requestId } = req.params;

  try {
    const affiliationRequest = await AffiliationRequest.findById(requestId).populate('group user');
    if (!affiliationRequest) {
      return res.status(404).json({ message: 'Affiliation request not found.' });
    }

    // Update the request status and user's group affiliation
    affiliationRequest.status = 'approved';
    await affiliationRequest.save();

    await User.findByIdAndUpdate(affiliationRequest.user._id, {
      group: affiliationRequest.group._id,
      groupAffiliationStatus: 'approved',
    });

    res.send('User affiliation approved successfully.');
  } catch (error) {
    console.error('Error approving affiliation:', error);
    res.status(500).json({ message: 'Error approving affiliation.' });
  }
});

// Route to create a group (for testing purposes)
app.post('/api/create-group', async (req, res) => {
  const { name, adminCode, adminEmail } = req.body;

  // Validate required fields
  if (!name || !adminCode || !adminEmail) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Check if group with same adminCode already exists
  const existingGroup = await Group.findOne({ adminCode });
  if (existingGroup) {
    return res.status(400).json({ message: "Group with this admin code already exists." });
  }

  try {
    const group = new Group({
      name,
      adminCode,
      adminEmail,
    });
    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Failed to log out" });
    res.clearCookie("connect.sid"); // Clear session cookie
    res.json({ message: "Logged out successfully" });
  });
});

app.listen(4999, () => console.log("Server running on http://localhost:4999"));
