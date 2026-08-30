import express from "express";
import multer from "multer";
import Song from "../models/Song.js";
import User from "../models/User.js";
import { auth, admin } from "../middleware/auth.js";
import cloudinary from "../services/cloudinary.js";
const r = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 120 * 1024 * 1024 },
});
const uploadBuffer = (buf, folder, resource_type = "auto") =>
  new Promise((resolve, reject) => {
    const s = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (e, x) => (e ? reject(e) : resolve(x)),
    );
    s.end(buf);
  });
r.get("/", async (req, res) => {
  try {
    const { search, genre, featured } = req.query;
    const q = {};
    if (search)
      q.$or = [
        { title: new RegExp(search, "i") },
        { artist: new RegExp(search, "i") },
        { album: new RegExp(search, "i") },
      ];
    if (genre) q.genre = genre;
    if (featured === "true") q.featured = true;
    const songs = await Song.find(q).sort({ createdAt: -1 }).limit(100);
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
r.get("/trending", async (req, res) =>
  res.json(await Song.find().sort({ plays: -1 }).limit(12)),
);
r.get("/recommendations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("likedSongs")
      .populate("recentlyPlayed.song");

    const likedSongs = user.likedSongs || [];
    const recentSongs = (user.recentlyPlayed || [])
      .map((item) => item.song)
      .filter(Boolean);

    // Collect user's favorite artists and genres
    const artists = [
      ...new Set(
        [...likedSongs, ...recentSongs]
          .map((song) => song?.artist)
          .filter(Boolean),
      ),
    ];

    const genres = [
      ...new Set(
        [...likedSongs, ...recentSongs]
          .map((song) => song?.genre)
          .filter(Boolean),
      ),
    ];

    // IDs already listened to / liked
    const excludedIds = [
      ...likedSongs.map((song) => song._id),
      ...recentSongs.map((song) => song._id),
    ];

    const recommendationQuery = {
      _id: { $nin: excludedIds },
      $or: [
        ...(artists.length ? [{ artist: { $in: artists } }] : []),

        ...(genres.length ? [{ genre: { $in: genres } }] : []),
      ],
    };

    let recommendations = await Song.find(recommendationQuery)
      .sort({
        plays: -1,
        likes: -1,
        createdAt: -1,
      })
      .limit(20);

    // Fallback if user doesn't have enough history
    if (recommendations.length < 8) {
      const fallback = await Song.find({
        _id: {
          $nin: [...excludedIds, ...recommendations.map((song) => song._id)],
        },
      })
        .sort({
          plays: -1,
          likes: -1,
          createdAt: -1,
        })
        .limit(20 - recommendations.length);

      recommendations = [...recommendations, ...fallback];
    }

    res.json(recommendations);
  } catch (error) {
    console.error("RECOMMENDATIONS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});
r.post("/:id/play", auth, async (req, res) => {
  const s = await Song.findByIdAndUpdate(
    req.params.id,
    { $inc: { plays: 1 } },
    { new: true },
  );
  req.user.recentlyPlayed = req.user.recentlyPlayed
    .filter((x) => x.song?.toString() !== req.params.id)
    .slice(0, 19);
  req.user.recentlyPlayed.unshift({ song: s._id, playedAt: new Date() });
  await req.user.save();
  res.json(s);
});
r.post("/:id/like", auth, async (req, res) => {
  const s = await Song.findById(req.params.id);
  const has = req.user.likedSongs.some(
    (x) => x.toString() === s._id.toString(),
  );
  if (has) {
    req.user.likedSongs.pull(s._id);
    s.likes = Math.max(0, s.likes - 1);
  } else {
    req.user.likedSongs.push(s._id);
    s.likes++;
  }
  await Promise.all([req.user.save(), s.save()]);
  res.json({ liked: !has, likes: s.likes });
});
r.post(
  "/upload",
  auth,
  admin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME)
        return res
          .status(503)
          .json({ message: "Cloudinary is not configured" });
      if (!req.files?.audio?.[0])
        return res.status(400).json({ message: "Audio file required" });
      const a = await uploadBuffer(
        req.files.audio[0].buffer,
        "neon-aura/songs",
        "video",
      );
      const c = req.files.cover?.[0]
        ? await uploadBuffer(
            req.files.cover[0].buffer,
            "neon-aura/covers",
            "image",
          )
        : null;
      const s = await Song.create({
        ...req.body,
        duration: Number(req.body.duration || 0),
        isPremium: req.body.isPremium === "true",
        featured: req.body.featured === "true",
        audioUrl: a.secure_url,
        cloudinaryAudioId: a.public_id,
        coverUrl: c?.secure_url || "",
        cloudinaryCoverId: c?.public_id || "",
      });
      res.status(201).json(s);
    } catch (e) {
      console.error("SONG UPLOAD ERROR:", e);
      res.status(500).json({ message: e.message });
    }
  },
);
r.delete("/:id", auth, admin, async (req, res) => {
  const s = await Song.findByIdAndDelete(req.params.id);
  if (!s) return res.status(404).json({ message: "Song not found" });
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    if (s.cloudinaryAudioId)
      await cloudinary.uploader.destroy(s.cloudinaryAudioId, {
        resource_type: "video",
      });
    if (s.cloudinaryCoverId)
      await cloudinary.uploader.destroy(s.cloudinaryCoverId);
  }
  res.json({ message: "Deleted" });
});
export default r;
