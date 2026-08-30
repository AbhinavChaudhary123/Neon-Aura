import express from "express";
import Playlist from "../models/Playlist.js";
import { auth } from "../middleware/auth.js";
const r = express.Router();
r.use(auth);
r.get("/", async (req, res) =>
  res.json(
    await Playlist.find({
      $or: [{ owner: req.user._id }, { isPublic: true }],
    }).populate("songs"),
  ),
);
r.post("/", async (req, res) =>
  res
    .status(201)
    .json(
      await Playlist.create({
        name: req.body.name,
        description: req.body.description,
        owner: req.user._id,
        isPublic: req.body.isPublic !== false,
      }),
    ),
);
r.get("/:id", async (req, res) => {
  const p = await Playlist.findById(req.params.id).populate("songs");
  if (!p) return res.status(404).json({ message: "Playlist not found" });
  res.json(p);
});
r.post("/:id/songs/:songId", async (req, res) => {
  const p = await Playlist.findById(req.params.id);
  if (!p || p.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not allowed" });
  if (!p.songs.some((x) => x.toString() === req.params.songId))
    p.songs.push(req.params.songId);
  await p.save();
  res.json(await p.populate("songs"));
});
r.delete("/:id/songs/:songId", async (req, res) => {
  const p = await Playlist.findById(req.params.id);
  if (!p || p.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not allowed" });
  p.songs = p.songs.filter((x) => x.toString() !== req.params.songId);
  await p.save();
  res.json(await p.populate("songs"));
});
r.delete("/:id", async (req, res) => {
  const p = await Playlist.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!p) return res.status(404).json({ message: "Playlist not found" });
  res.json({ message: "Deleted" });
});
export default r;
