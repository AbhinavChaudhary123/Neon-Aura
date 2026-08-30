import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import songs from "./routes/songs.js";
import playlists from "./routes/playlists.js";
import payments from "./routes/payments.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL , credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.get("/api/health", (req, res) => res.json({ ok: true, app: "Neon Aura" }));
app.use("/api/auth", auth);
app.use("/api/songs", songs);
app.use("/api/playlists", playlists);
app.use("/api/payments", payments);
app.use((err, req, res, next) =>
  res.status(500).json({ message: err.message || "Server error" }),
);
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(port, () =>
      console.log(`Neon Aura API running on http://localhost:${port}`),
    ),
  )
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
