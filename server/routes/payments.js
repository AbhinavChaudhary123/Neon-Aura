import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
const r = express.Router();
r.post("/order", auth, async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    return res.status(503).json({ message: "Razorpay is not configured" });
  const rz = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const order = await rz.orders.create({
    amount: Number(req.body.amount || 199) * 100,
    currency: "INR",
    receipt: `na_${Date.now()}`,
    notes: { userId: req.user._id.toString() },
  });
  res.json(order);
});
r.post("/verify", auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expected !== razorpay_signature)
    return res.status(400).json({ message: "Payment verification failed" });
  req.user.plan = "premium";
  req.user.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await req.user.save();
  res.json({
    message: "Premium activated",
    premiumUntil: req.user.premiumUntil,
  });
});
export default r;
