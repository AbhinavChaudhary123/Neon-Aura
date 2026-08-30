import { useEffect, useState } from "react";
import { ArrowRight, Headphones, Search, Sparkles } from "lucide-react";
import api from "../services/api";
import SongCard from "../components/SongCard";
const demo = [
  {
    _id: "1",
    title: "Midnight Bloom",
    artist: "Luna Vale",
    genre: "Dream Pop",
    coverUrl:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=700",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    _id: "2",
    title: "Electric Hearts",
    artist: "Nova Lane",
    genre: "Synthwave",
    coverUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    _id: "3",
    title: "Blue Hour",
    artist: "Mira Skye",
    genre: "Indie",
    coverUrl:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    _id: "4",
    title: "Afterglow",
    artist: "The Satellites",
    genre: "Alternative",
    coverUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=700",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];
export default function Home() {
  const [songs, setSongs] = useState(demo);
  const [q, setQ] = useState("");
  useEffect(() => {
    api
      .get("/songs")
      .then((r) => r.data.length && setSongs(r.data))
      .catch(() => {});
  }, []);
  const filtered = songs.filter((s) =>
    `${s.title} ${s.artist} ${s.genre}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <main className="page">
      <header className="topbar">
        <div className="search">
          <Search size={18} />
          <input
            placeholder="Search songs, artists, moods..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="top-actions">
          <button className="icon-btn">
            <Headphones size={19} />
          </button>
          <button className="avatar">NA</button>
        </div>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={14} /> YOUR SOUND, YOUR AURA
          </div>
          <h1>
            Music that
            <br />
            <em>feels like you.</em>
          </h1>
          <p>
            Discover immersive sounds, build your world of music and let Neon
            Aura follow your mood.
          </p>
          <div>
            <button className="primary">
              Explore your vibe <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="hero-art">
          <div className="orb o1" />
          <div className="orb o2" />
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000" />
          <div className="floating">
            ✦ <span>Tonight's aura</span>
            <b>Electric · 92%</b>
          </div>
        </div>
      </section>
      <section>
        <div className="section-head">
          <div>
            <span className="kicker">CURATED FOR YOU</span>
            <h2>Made for your mood</h2>
          </div>
          <button>
            See all <ArrowRight size={16} />
          </button>
        </div>
        <div className="song-grid">
          {filtered.map((s) => (
            <SongCard key={s._id} song={s} queue={filtered} />
          ))}
        </div>
      </section>
      <section className="moods">
        <div>
          <span className="kicker">DISCOVER</span>
          <h2>Choose an aura</h2>
        </div>
        <div className="mood-grid">
          {[
            "Late Night",
            "Focus Flow",
            "Golden Hour",
            "Deep Chill",
            "High Energy",
          ].map((x, i) => (
            <div className={`mood m${i}`} key={x}>
              <span>{["☾", "◌", "☀", "◒", "✦"][i]}</span>
              <b>{x}</b>
              <small>
                {
                  [
                    "Dreamy sounds",
                    "Stay in the zone",
                    "Warm & nostalgic",
                    "Slow it down",
                    "Turn it up",
                  ][i]
                }
              </small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
