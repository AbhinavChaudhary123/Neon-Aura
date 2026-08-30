import jwt from "jsonwebtoken";
import User from "../models/User.js";
export async function auth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer "))
      return res.status(401).json({ message: "Authentication required" });
    const p = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(p.id);
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
export function admin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
}
