import {
  ListMusic,
  ChevronDown,
  Heart,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

import { usePlayer } from "../context/PlayerContext";

export default function Player() {
  const {
    current,
    playing,
    progress,
    duration,
    volume,
    queue,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  if (!current) {
    return (
      <div className="player empty">
        Choose a track to start your session ✦
      </div>
    );
  }

  return (
    <div className="player">

      {/* CURRENT SONG */}
      <div className="now">
        <img
          src={
            current.coverUrl ||
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200"
          }
          alt={current.title}
        />

        <div>
          <b>{current.title}</b>
          <span>{current.artist}</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="controls">

        <div className="main-controls">

          {/* SHUFFLE */}
          <button
            onClick={toggleShuffle}
            className={shuffle ? "active" : ""}
            title="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          {/* PREVIOUS */}
          <button
            onClick={prev}
            title="Previous"
          >
            <SkipBack size={20} />
          </button>

          {/* PLAY / PAUSE */}
          <button
            className="play"
            onClick={toggle}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause size={19} />
            ) : (
              <Play size={19} />
            )}
          </button>

          {/* NEXT */}
          <button
            onClick={next}
            title="Next"
          >
            <SkipForward size={20} />
          </button>

          {/* REPEAT */}
          <button
            onClick={toggleRepeat}
            className={repeat ? "active" : ""}
            title="Repeat"
          >
            <Repeat2 size={17} />
          </button>

        </div>

        {/* TIMELINE */}
        <div className="timeline">

          <span>
            {fmt(progress)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={(e) =>
              seek(e.target.value)
            }
          />

          <span>
            {fmt(duration)}
          </span>

        </div>

      </div>

      {/* RIGHT ACTIONS */}
      <div className="actions">

        {/* LIKE */}
        <button
          className="player-action"
          title="Like"
        >
          <Heart size={18} />
        </button>

        {/* VOLUME */}
        <Volume2 size={18} />

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) =>
            setVolume(e.target.value)
          }
        />

        {/* QUEUE */}
        <button
          className="player-action"
          title={`Queue (${queue?.length || 0})`}
          onClick={() => {
            window.dispatchEvent(
              new Event("toggle-queue")
            );
          }}
        >
          <ListMusic size={19} />
        </button>

        {/* EXTRA */}
        <ChevronDown size={18} />

      </div>
    </div>
  );
}

const fmt = (s = 0) =>
  `${Math.floor(s / 60)}:${String(
    Math.floor(s % 60)
  ).padStart(2, "0")}`;