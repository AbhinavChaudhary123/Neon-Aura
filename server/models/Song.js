import mongoose from "mongoose";
const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true },
    album: { type: String, default: "Singles" },
    genre: { type: String, default: "Other" },
    duration: { type: Number, default: 0 },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, default: "" },
    cloudinaryAudioId: { type: String, default: "" },
    cloudinaryCoverId: { type: String, default: "" },
    plays: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export default mongoose.model("Song", songSchema);
