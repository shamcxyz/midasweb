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
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.model("User", userSchema);

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

// // Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
}

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { name, company, email, password, confirmPassword, isAdmin } = req.body;

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
    if (isAdmin) {
      role = 'admin';
    } else {
      role = 'user';
    }
    const user = new User({
      name,
      company,
      email,
      password: hashedPassword,
      role: role,
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

    // Save the code to the database (you'll need to create an InviteCode model)
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
    const users = await User.find({ 
      joinCode: { $in: await InviteCode.find({ createdBy: admin._id }).distinct('code') }
    }).select('-password');

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

// Add this schema for invite codes
const inviteCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 7*24*60*60*1000) } // 7 days expiry
});

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);

app.listen(4999, () => console.log("Server running on http://localhost:4999"));