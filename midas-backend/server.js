// server.js

const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer"); // For handling file uploads
const mammoth = require("mammoth"); // For parsing .docx files
const axios = require("axios"); // For making HTTP requests to Python API
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

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
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  joinCode: { type: String, default: null }, // Added joinCode field
});

const User = mongoose.model("User", userSchema);

// InviteCode schema and model
const inviteCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days expiry
});

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);

// ReimbursementRequest schema and model
const reimbursementRequestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  adminEmail: { type: String, required: true },
  reimbursementDetails: { type: String, required: true },
  receiptPath: { type: String, required: true },
  status: { type: String, enum: ['Approved', 'Rejected'], required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ReimbursementRequest = mongoose.model("ReimbursementRequest", reimbursementRequestSchema);

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key", // Ensure SESSION_SECRET is set in .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Serve the 'uploads' directory as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return cb(new Error('Only .docx files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Function to extract text from .docx file (optional if Python API handles it)
async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; // The extracted text
  } catch (error) {
    console.error("Error extracting text from .docx:", error);
    return null;
  }
}

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
  const { name, company, email, password, confirmPassword, isAdmin, joinCode } = req.body;

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
    let role = 'user';
    if (isAdmin) {
      role = 'admin';
    }

    let userJoinCode = null;
    if (joinCode) {
      const code = await InviteCode.findOne({ code: joinCode, used: false, expiresAt: { $gt: new Date() } });
      if (!code) {
        return res.status(400).json({ message: "Invalid or expired invite code." });
      }
      userJoinCode = code.code;
      code.used = true;
      code.usedBy = existingUser ? existingUser._id : null;
      await code.save();
    }

    const user = new User({
      name,
      company,
      email,
      password: hashedPassword,
      role: role,
      joinCode: userJoinCode,
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Endpoint to get logged-in user profile
app.get("/api/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
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

// Generate invite code endpoint
app.post("/api/admin/generate-code", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate a random 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Save the code to the database
    const inviteCode = new InviteCode({
      code,
      createdBy: user._id,
      used: false
    });
    await inviteCode.save();

    res.json({ code });
  } catch (error) {
    res.status(500).json({ message: "Error generating code", error });
  }
});

// Get users for admin
app.get("/api/admin/users", isAuthenticated, async (req, res) => {
  try {
    const admin = await User.findById(req.session.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all users who joined using this admin's codes
    const adminInviteCodes = await InviteCode.find({ createdBy: admin._id }).distinct('code');
    const users = await User.find({ joinCode: { $in: adminInviteCodes } }).select('-password');

    res.json({ 
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        joinCode: user.joinCode,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// Join group endpoint
app.post("/api/join_group", isAuthenticated, async (req, res) => {
  const { group_code } = req.body;

  if (!group_code) {
    return res.status(400).json({ message: "Group code is required." });
  }

  try {
    const code = await InviteCode.findOne({ code: group_code, used: false, expiresAt: { $gt: new Date() } });
    if (!code) {
      return res.status(400).json({ message: "Invalid or expired group code." });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.joinCode) {
      return res.status(400).json({ message: "User has already joined a group." });
    }

    // Assign the invite code to the user
    user.joinCode = code.code;
    await user.save();

    // Mark the invite code as used
    code.used = true;
    code.usedBy = user._id;
    await code.save();

    res.json({ message: "Successfully joined the group." });
  } catch (error) {
    res.status(500).json({ message: "Error joining group", error });
  }
});

// Function to forward reimbursement requests to Python API
async function forwardReimbursementRequest(data, receiptPath) {
  try {
    // Create form data to send to Python API
    const FormData = require('form-data');
    const form = new FormData();
    form.append('role', data.role);
    form.append('name', data.name);
    form.append('email', data.email);
    form.append('admin_email', data.admin_email);
    form.append('reimbursement_details', data.reimbursement_details);
    form.append('receipt', fs.createReadStream(receiptPath));

    // Make POST request to Python API's reimbursement endpoint
    const response = await axios.post(`${process.env.PYTHON_API_URL}/api/request_reimbursement`, form, {
      headers: form.getHeaders()
    });

    return response.data;
  } catch (error) {
    console.error("Error forwarding to Python API:", error.response ? error.response.data : error.message);
    throw error;
  }
}

// Reimbursement Request Endpoint (Forward to Python API)
app.post("/api/request_reimbursement", upload.single('receipt'), isAuthenticated, async (req, res) => {
  const { name, email, admin_email, reimbursement_details } = req.body;
  const receipt = req.file;

  try {
    // Retrieve user from session
    const user = await User.findById(req.session.userId);
    if (!user) {
      // Delete the uploaded file if user is not authenticated
      if (receipt && fs.existsSync(receipt.path)) {
        fs.unlinkSync(receipt.path);
      }
      return res.status(401).json({ error: "User not authenticated." });
    }

    // Validate role
    if (user.role !== 'user') {
      // Delete the uploaded file if role is not 'user'
      if (receipt && fs.existsSync(receipt.path)) {
        fs.unlinkSync(receipt.path);
      }
      return res.status(403).json({ error: "Only users with 'user' role can submit reimbursement requests." });
    }

    // Validate receipt file
    if (!receipt) {
      return res.status(400).json({ error: "Receipt file is required and must be a .docx file." });
    }

    // Forward the request to Python API
    const pythonResponse = await forwardReimbursementRequest(
      { role: user.role, name, email, admin_email, reimbursement_details },
      receipt.path
    );

    res.status(200).json(pythonResponse);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

// Admin Dashboard to View Reimbursement Requests
app.get("/api/admin/reimbursements", isAuthenticated, async (req, res) => {
  try {
    const admin = await User.findById(req.session.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find all reimbursement requests associated with this admin
    const reimbursements = await ReimbursementRequest.find({ adminEmail: admin.email }).sort({ createdAt: -1 });

    res.status(200).json({ reimbursements });
  } catch (error) {
    console.error("Error fetching reimbursements:", error);
    res.status(500).json({ message: "Error fetching reimbursements", error });
  }
});

// Error-handling middleware for Multer (Moved after all routes)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // An unknown error occurred.
    return res.status(500).json({ error: err.message });
  }
  next();
});

// Start the server
const PORT = process.env.PORT || 4999;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
