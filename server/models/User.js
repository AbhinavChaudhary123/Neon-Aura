import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    recentlyPlayed: [
      {
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        playedAt: { type: Date, default: Date.now },
      },
    ],
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    premiumUntil: { type: Date },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);
export default mongoose.model("User", userSchema);
