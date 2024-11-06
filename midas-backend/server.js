// server.js
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use true if HTTPS is enabled
  })
);

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { name, company, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, company, email, password: hashedPassword });
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
    res.json({ message: "Login successful!", user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Endpoint to get logged-in user profile
app.get("/api/profile", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });

  User.findById(req.session.userId)
    .then(user => {
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ name: user.name, email: user.email, company: user.company });
    })
    .catch(error => res.status(500).json({ message: "Error fetching profile", error }));
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
