import { Heart, MoreHorizontal, Play, Crown, Lock } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";

export default function SongCard({ song, queue }) {
  const p = usePlayer();
  const { user } = useAuth();

  const isPremiumUser = user?.plan === "premium";
  const isLocked = song.isPremium && !isPremiumUser;

  const handlePlay = () => {
    if (isLocked) {
      alert("This is a Premium song. Upgrade to Neon Aura Premium to listen.");
      return;
    }

    p.load(song, queue);
  };

  return (
    <article className={`song-card ${isLocked ? "premium-locked" : ""}`}>
      <div className="cover">
        <img
          src={
            song.coverUrl ||
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600"
          }
          alt={song.title}
        />

        {isLocked ? (
          <button
            onClick={handlePlay}
            className="premium-lock-button"
            title="Premium song"
          >
            <Lock size={19} />
          </button>
        ) : (
          <button onClick={handlePlay}>
            <Play fill="currentColor" size={19} />
          </button>
        )}

        {song.isPremium && (
          <span className="premium-badge">
            <Crown size={12} />
            PREMIUM
          </span>
        )}
      </div>

      <div className="song-meta">
        <b>{song.title}</b>
        <span>{song.artist}</span>
      </div>

      <div className="card-actions">
        <Heart size={16} />
        <MoreHorizontal size={17} />
      </div>
    </article>
  );
}