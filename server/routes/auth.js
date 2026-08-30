import express from "express";
// import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
const r = express.Router();
const token = (u) =>
  jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
r.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });
    const role =
      process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
        ? "admin"
        : "user";
    const u = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
    });
    res.status(201).json({
      token: token(u),
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        plan: u.plan,
        role: u.role,
        likedSongs: u.likedSongs || [],
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body,
      u = await User.findOne({ email });
    if (!u || !(await bcrypt.compare(password, u.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({
      token: token(u),
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        plan: u.plan,
        premiumUntil: u.premiumUntil,
        role: u.role,
        likedSongs: u.likedSongs || [],
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
r.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("recentlyPlayed.song");

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        premiumUntil: user.premiumUntil,
        role: user.role,
        likedSongs: user.likedSongs || [],
        recentlyPlayed: user.recentlyPlayed || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

r.put("/profile", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    req.user.name = name.trim();

    await req.user.save();

    res.json({
      message: "Profile updated",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

r.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      req.user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    req.user.password = await bcrypt.hash(
      newPassword,
      12
    );

    await req.user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});


export default r;
