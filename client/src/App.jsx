import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Home,
  Search,
  Library as LibraryIcon,
  Heart,
  Radio,
  Settings,
  LogOut,
  UserRound,
  ShieldCheck,
  Upload,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Crown,
  Music2,
  ListMusic,
  Shuffle,
  Repeat2,
} from "lucide-react";
import api from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import "./styles.css";
function AuthPage() {
  const { login, register, user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState("login"),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [err, setErr] = useState("");
  useEffect(() => {
    if (user) nav("/");
  }, [user]);
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      mode === "login"
        ? await login(email, password)
        : await register(name, email, password);
    } catch (x) {
      setErr(x.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="auth">
      <div className="auth-art">
        <div className="orb o1" />
        <div className="orb o2" />
        <span className="eyebrow">NEON AURA</span>
        <h1>
          Sound, but
          <br />
          <i>make it yours.</i>
        </h1>
        <p>
          An original music space for discovering, collecting and sharing the
          tracks that shape your mood.
        </p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <Music2 size={30} />
        <h2>{mode === "login" ? "Welcome back" : "Create your aura"}</h2>
        <p>
          {mode === "login"
            ? "Sign in to continue listening."
            : "Join the community in seconds."}
        </p>
        {mode === "register" && (
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (6+ chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength="6"
          required
        />
        {err && <div className="error">{err}</div>}
        <button className="primary">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "New here? Create account"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside>
      <div className="brand">
        <span>NA</span>
        <div>
          <b>NEON AURA</b>
          <small>music, remixed</small>
        </div>
      </div>
      <nav>
        <NavLink to="/">
          <Home />
          Home
        </NavLink>
        <NavLink to="/search">
          <Search />
          Discover
        </NavLink>
        <NavLink to="/library">
          <LibraryIcon />
          Library
        </NavLink>
        <NavLink to="/radio">
          <Radio />
          Radio
        </NavLink>
        <NavLink to="/liked">
          <Heart />
          Liked songs
        </NavLink>
      </nav>
      <div className="side-bottom">
        {user?.role === "admin" && (
          <NavLink to="/admin">
            <ShieldCheck />
            Admin studio
          </NavLink>
        )}
        <NavLink to="/premium">
          <Crown />
          Premium
        </NavLink>
        <NavLink to="/settings">
          <Settings />
          Settings
        </NavLink>
        <button onClick={logout}>
          <LogOut />
          Log out
        </button>
      </div>
    </aside>
  );
}
function Layout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <main>{children}</main>
      <Player />
    </div>
  );
}
function Player() {
  const p = usePlayer();
  const [queueOpen, setQueueOpen] = useState(false);

  const {
    current,
    playing,
    progress,
    duration,
    toggle,
    next,
    prev,
    seek,
    volume,
    setVolume,
    queue = [],
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    load,
  } = p;

  if (!current) {
    return (
      <div className="player empty-player-bar">
        Choose a track to start your aura ✦
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

        <div className="now-info">
          <b>{current.title}</b>
          <small>{current.artist}</small>
        </div>
      </div>

      {/* CENTER PLAYER */}
      <div className="player-center">

        {/* BUTTONS */}
        <div className="player-buttons">

          {/* SHUFFLE */}
          <button
            className={shuffle ? "active-control" : ""}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>

          {/* PREVIOUS */}
          <button onClick={prev} title="Previous">
            <SkipBack size={19} />
          </button>

          {/* PLAY / PAUSE */}
          <button
            className="player-play"
            onClick={toggle}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause size={20} />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>

          {/* NEXT */}
          <button onClick={next} title="Next">
            <SkipForward size={19} />
          </button>

          {/* REPEAT */}
          <button
            className={repeat ? "active-control" : ""}
            onClick={toggleRepeat}
            title="Repeat"
          >
            <Repeat2 size={18} />
          </button>

        </div>

        {/* PROGRESS */}
        <div className="seek">

          <span>{fmt(progress)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={(e) => seek(e.target.value)}
          />

          <span>{fmt(duration)}</span>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="player-right">

        {/* QUEUE */}
        <button
          className={`queue-btn ${queueOpen ? "active-control" : ""}`}
          onClick={() => setQueueOpen(!queueOpen)}
          title="Queue"
        >
          <ListMusic size={19} />
        </button>

        {/* VOLUME */}
        <Volume2 size={18} />

        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
        />

        {/* QUEUE PANEL */}
        {queueOpen && (
          <div className="queue-panel">

            <div className="queue-header">
              <div>
                <small>UP NEXT</small>
                <h3>Queue</h3>
              </div>

              <button
                className="queue-close"
                onClick={() => setQueueOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="queue-list">

              {queue.length === 0 ? (
                <div className="queue-empty">
                  <ListMusic size={28} />
                  <span>Your queue is empty</span>
                </div>
              ) : (
                queue.map((song, i) => (
                  <div
                    key={`${song._id}-${i}`}
                    className={`queue-song ${
                      song._id === current._id ? "current" : ""
                    }`}
                    onClick={() => {
                      load(song, queue);
                      setQueueOpen(false);
                    }}
                  >
                    <img
                      src={
                        song.coverUrl ||
                        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100"
                      }
                      alt={song.title}
                    />

                    <div className="queue-song-info">
                      <b>{song.title}</b>
                      <small>{song.artist}</small>
                    </div>

                    {song._id === current._id && (
                      <span className="playing-indicator">▶</span>
                    )}
                  </div>
                ))
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
const fmt = (s) => {
  s = Number(s) || 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};
function SongCard({ song, list }) {
  const { load } = usePlayer();
  const { user, refreshUser } = useAuth();

  const [liked, setLiked] = useState(
    user?.likedSongs?.some((id) => id?.toString() === song._id?.toString()) ||
      false,
  );

  const toggleLike = async (e) => {
    e.stopPropagation();

    if (!user) return;

    try {
      const res = await api.post(`/songs/${song._id}/like`);

      setLiked(res.data.liked);

      // Refresh user so likedSongs gets updated
      await refreshUser();
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  return (
    <div className="song" onDoubleClick={() => load(song, list)}>
      <img
        src={
          song.coverUrl ||
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"
        }
      />
      <div className="song-info">
        <b>{song.title}</b>
        <small>
          <span
            className="clickable-text"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/artist/${encodeURIComponent(
                song.artist,
              )}`;
            }}
          >
            {song.artist}
          </span>

          {" · "}

          <span
            className="clickable-text"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/album/${encodeURIComponent(song.album)}`;
            }}
          >
            {song.album}
          </span>
        </small>
      </div>
      <button onClick={toggleLike} title={liked ? "Unlike" : "Like"}>
        <Heart size={16} fill={liked ? "currentColor" : "none"} />
      </button>
      <button onClick={() => load(song, list)}>
        <Play size={16} fill="currentColor" />
      </button>
    </div>
  );
}
function HomePage() {
  const [songs, setSongs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const songsRes = await api.get("/songs");
        setSongs(songsRes.data);

        const meRes = await api.get("/auth/me");

        const recentlyPlayed =
          meRes.data.user?.recentlyPlayed || [];

        const recentSongs = recentlyPlayed
          .map((item) => item.song)
          .filter((song) => song && song._id);

        setRecent(recentSongs);

        try {
          const recRes = await api.get(
            "/songs/recommendations"
          );

          setRecommendations(recRes.data || []);
        } catch (error) {
          console.log(
            "Recommendations unavailable:",
            error
          );
        }
      } catch (error) {
        console.error(
          "Failed to load home:",
          error
        );
      }
    };

    loadHome();
  }, []);

  return (
    <>
      <Header title="Good evening" />

      <section className="hero">
        <div>
          <span className="eyebrow">
            YOUR NEXT OBSESSION
          </span>

          <h1>
            Find the frequency
            <br />
            <i>that feels like you.</i>
          </h1>

          <p>
            Fresh discoveries, familiar favorites and a
            little beautiful chaos.
          </p>
        </div>

        <div className="hero-disc">
          <div>✦</div>
        </div>
      </section>

      {/* Recently Played */}
      {recent.length > 0 && (
        <Section title="Recently played">
          <div className="grid">
            {recent.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                queue={recent}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Made For You */}
      {recommendations.length > 0 && (
        <Section title="✨ Made For You">
          <div className="grid">
            {recommendations.slice(0, 8).map((song) => (
              <SongCard
                key={song._id}
                song={song}
                queue={recommendations}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Fresh Signals */}
      <Section title="Fresh signals">
        <div className="grid">
          {songs.slice(0, 8).map((song) => (
            <SongCard
              key={song._id}
              song={song}
              queue={songs}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
function Header({ title }) {
  const { user } = useAuth();
  return (
    <header>
      <div>
        <span className="eyebrow">DISCOVER / 01</span>
        <h2>{title}</h2>
      </div>
      <div className="avatar">{user?.name?.[0]?.toUpperCase() || "N"}</div>
    </header>
  );
}
function Section({ title, children }) {
  return (
    <section className="section">
      <div className="section-title">
        <h3>{title}</h3>
        <span>View all</span>
      </div>
      {children}
    </section>
  );
}

function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const saveProfile = async () => {
    if (!name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await api.put("/auth/profile", {
        name: name.trim(),
      });

      await refreshUser();

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="Your Profile" />

      <section className="profile-page">
        <div className="profile-hero">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "U"
            )}
          </div>

          <div>
            <span className="eyebrow">NEON AURA MEMBER</span>

            <h1>{user?.name}</h1>

            <p>{user?.email}</p>
          </div>

          {user?.plan === "premium" && (
            <div className="premium-status">
              <Crown size={16} />
              PREMIUM
            </div>
          )}
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <span className="eyebrow">ACCOUNT</span>

            <h2>Edit profile</h2>

            <label>Name</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <label>Email</label>

            <input value={user?.email || ""} disabled />

            <button className="primary" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>

            {message && <p className="profile-message">{message}</p>}
          </div>

          <div className="profile-card">
            <span className="eyebrow">YOUR AURA</span>

            <h2>Listening stats</h2>

            <div className="profile-stats">
              <div>
                <b>{user?.likedSongs?.length || 0}</b>
                <span>Liked songs</span>
              </div>

              <div>
                <b>{user?.recentlyPlayed?.length || 0}</b>
                <span>Recently played</span>
              </div>
            </div>
          </div>
        </div>

        {user?.plan === "premium" && (
          <div className="profile-card premium-card">
            <Crown size={30} />

            <div>
              <span className="eyebrow">PREMIUM MEMBER</span>

              <h2>Your Premium is active</h2>

              <p>
                Valid until{" "}
                {user.premiumUntil
                  ? new Date(user.premiumUntil).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [autoplay, setAutoplay] = useState(
    localStorage.getItem("na_autoplay") !== "false",
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("na_notifications") !== "false",
  );

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage("Enter both passwords.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");

      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to change password.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAutoplay = () => {
    const value = !autoplay;

    setAutoplay(value);
    localStorage.setItem("na_autoplay", value);
  };

  const toggleNotifications = () => {
    const value = !notifications;

    setNotifications(value);
    localStorage.setItem("na_notifications", value);
  };

  return (
    <>
      <Header title="Settings" />

      <section className="settings-page">
        {/* Account */}
        <div className="settings-card">
          <span className="eyebrow">ACCOUNT</span>

          <h2>Account settings</h2>

          <div className="settings-row">
            <div>
              <b>{user?.name}</b>
              <small>{user?.email}</small>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="settings-card">
          <span className="eyebrow">SECURITY</span>

          <h2>Change password</h2>

          <label>Current password</label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
          />

          <label>New password</label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />

          <button
            className="primary"
            onClick={changePassword}
            disabled={saving}
          >
            {saving ? "Updating..." : "Change password"}
          </button>

          {message && <p className="settings-message">{message}</p>}
        </div>

        {/* Premium */}
        <div className="settings-card">
          <span className="eyebrow">SUBSCRIPTION</span>

          <h2>Premium</h2>

          {user?.plan === "premium" ? (
            <div className="premium-setting">
              <Crown size={26} />

              <div>
                <b>Premium is active</b>

                <small>
                  Valid until{" "}
                  {user.premiumUntil
                    ? new Date(user.premiumUntil).toLocaleDateString()
                    : "N/A"}
                </small>
              </div>
            </div>
          ) : (
            <>
              <p>Unlock premium songs and the complete Neon Aura experience.</p>

              <button
                className="primary"
                onClick={() => (window.location.href = "/premium")}
              >
                <Crown size={17} />
                Upgrade to Premium
              </button>
            </>
          )}
        </div>

        {/* Playback */}
        <div className="settings-card">
          <span className="eyebrow">PLAYBACK</span>

          <h2>Playback preferences</h2>

          <div className="settings-toggle-row">
            <div>
              <b>Autoplay</b>
              <small>Continue playing the next track automatically.</small>
            </div>

            <button
              className={autoplay ? "toggle active" : "toggle"}
              onClick={toggleAutoplay}
            >
              <span />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <span className="eyebrow">NOTIFICATIONS</span>

          <h2>Notification preferences</h2>

          <div className="settings-toggle-row">
            <div>
              <b>Music updates</b>

              <small>
                Get notified about new releases and recommendations.
              </small>
            </div>

            <button
              className={notifications ? "toggle active" : "toggle"}
              onClick={toggleNotifications}
            >
              <span />
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="settings-card danger-card">
          <span className="eyebrow">SESSION</span>

          <h2>Sign out</h2>

          <p>Sign out from this Neon Aura account.</p>

          <button className="logout-setting" onClick={logout}>
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </section>
    </>
  );
}

function SearchPage() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const genres = [
    "Pop",
    "Rock",
    "Hip-Hop",
    "R&B",
    "Electronic",
    "Jazz",
    "Classical",
    "Lo-fi",
    "Indie",
    "Other",
  ];

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const params = {};

        if (q.trim()) {
          params.search = q.trim();
        }

        if (genre) {
          params.genre = genre;
        }

        const r = await api.get("/songs", {
          params,
        });

        setSongs(r.data);
      } catch (error) {
        console.error("Search failed:", error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q, genre]);

  const clearSearch = () => {
    setQ("");
    setGenre("");
  };

  return (
    <>
      <Header title="Discover" />

      <div className="search-area">
        <div className="search-box">
          <Search size={20} />

          <input
            className="search"
            placeholder="Search songs, artists or albums..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {q && (
            <button className="ghost" onClick={clearSearch} type="button">
              Clear
            </button>
          )}
        </div>

        <div className="genre-filters">
          <button
            className={!genre ? "filter active" : "filter"}
            onClick={() => setGenre("")}
          >
            All
          </button>

          {genres.map((g) => (
            <button
              key={g}
              className={genre === g ? "filter active" : "filter"}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <Section
        title={
          q ? `Results for "${q}"` : genre ? `${genre} music` : "All signals"
        }
      >
        {loading ? (
          <div className="empty">
            <p>Searching...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="empty">
            <Search size={48} />

            <h3>No music found</h3>

            <p>Try another song, artist, album or genre.</p>

            {(q || genre) && (
              <button className="primary" onClick={clearSearch}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="search-meta">
              {songs.length} {songs.length === 1 ? "track" : "tracks"} found
            </div>

            <div className="list">
              {songs.map((song) => (
                <SongCard key={song._id} song={song} list={songs} />
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}

function ArtistPage() {
  const { artistName } = useParams();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const loadArtist = async () => {
      try {
        const r = await api.get("/songs", {
          params: {
            search: artistName,
          },
        });

        const artistSongs = r.data.filter(
          (song) => song.artist?.toLowerCase() === artistName.toLowerCase(),
        );

        setSongs(artistSongs);
      } catch (error) {
        console.error("Failed to load artist:", error);
      }
    };

    loadArtist();
  }, [artistName]);

  const albums = [...new Map(songs.map((song) => [song.album, song])).values()];

  return (
    <>
      <Header title="Artist" />

      <section className="artist-hero">
        <div className="artist-avatar">{artistName?.[0]?.toUpperCase()}</div>

        <div>
          <span className="eyebrow">ARTIST</span>

          <h1>{artistName}</h1>

          <p>
            {songs.length} {songs.length === 1 ? "track" : "tracks"}
          </p>
        </div>
      </section>

      <Section title="Popular tracks">
        <div className="list">
          {songs.map((song) => (
            <SongCard key={song._id} song={song} list={songs} />
          ))}
        </div>
      </Section>

      <Section title="Albums">
        <div className="playlist-grid">
          {albums.map((album) => (
            <div className="playlist" key={album.album}>
              <div className="playlist-art">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.album} />
                ) : (
                  "♫"
                )}
              </div>

              <b>{album.album}</b>

              <small>
                {songs.filter((s) => s.album === album.album).length} tracks
              </small>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function AlbumPage() {
  const { albumName } = useParams();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const loadAlbum = async () => {
      try {
        const r = await api.get("/songs", {
          params: {
            search: albumName,
          },
        });

        const albumSongs = r.data.filter(
          (song) => song.album?.toLowerCase() === albumName.toLowerCase(),
        );

        setSongs(albumSongs);
      } catch (error) {
        console.error("Failed to load album:", error);
      }
    };

    loadAlbum();
  }, [albumName]);

  const cover = songs[0]?.coverUrl;

  const playAlbum = () => {
    if (songs.length > 0) {
      // SongCard/player will handle normal playback
      document.querySelector(".song button:last-child")?.click();
    }
  };

  return (
    <>
      <Header title="Album" />

      <section className="album-hero">
        <div className="album-cover">
          {cover ? <img src={cover} alt={albumName} /> : "♫"}
        </div>

        <div>
          <span className="eyebrow">ALBUM</span>

          <h1>{albumName}</h1>

          <p>{songs[0]?.artist || "Various artists"}</p>

          <span>{songs.length} tracks</span>
        </div>
      </section>

      <div className="album-actions">
        {songs.length > 0 && (
          <button className="primary" onClick={playAlbum}>
            <Play size={18} fill="currentColor" />
            Play album
          </button>
        )}
      </div>

      <Section title="Tracklist">
        <div className="list">
          {songs.map((song) => (
            <SongCard key={song._id} song={song} list={songs} />
          ))}
        </div>
      </Section>
    </>
  );
}

function LikedPage() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const loadLiked = async () => {
      try {
        const res = await api.get("/songs");
        const likedIds = user?.likedSongs || [];
        const liked = res.data.filter((song) =>
          likedIds.some((id) => id?.toString() === song._id?.toString()),
        );
        setSongs(liked);
      } catch (error) {
        console.error("Failed to load liked songs:", error);
      }
    };

    if (user) loadLiked();
    else setSongs([]);
  }, [user]);

  return (
    <>
      <Header title="Liked songs" />
      <Section title={`${songs.length} liked tracks`}>
        {songs.length === 0 ? (
          <div className="empty">
            <Heart size={48} />
            <h3>No liked songs yet.</h3>
            <p>Like songs while listening and they will appear here.</p>
          </div>
        ) : (
          <div className="list">
            {songs.map((song) => (
              <SongCard key={song._id} song={song} list={songs} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function Library() {
  const [ps, setPs] = useState([]);
  const { user } = useAuth();
  const { load } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPlaylists = async () => {
    try {
      const r = await api.get("/playlists");
      setPs(r.data);
    } catch (error) {
      console.error("Failed to load playlists:", error);
    }
  };

  const loadSongs = async () => {
    try {
      const r = await api.get("/songs");
      setSongs(r.data);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadPlaylists();
      loadSongs();
    }
  }, [user]);

  const create = async () => {
    const name = prompt("Playlist name");

    if (!name?.trim()) return;

    try {
      await api.post("/playlists", {
        name: name.trim(),
      });

      await loadPlaylists();

      alert("Playlist created!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create playlist");
    }
  };

  const openPlaylist = async (id) => {
    try {
      setLoading(true);

      const r = await api.get(`/playlists/${id}`);

      setSelected(r.data);
    } catch (error) {
      console.error("Failed to open playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSong = async (songId) => {
    if (!selected) return;

    try {
      const r = await api.post(`/playlists/${selected._id}/songs/${songId}`);

      setSelected(r.data);
      await loadPlaylists();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add song");
    }
  };

  const removeSong = async (songId) => {
    if (!selected) return;

    try {
      const r = await api.delete(`/playlists/${selected._id}/songs/${songId}`);

      setSelected(r.data);
      await loadPlaylists();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove song");
    }
  };

  const deletePlaylist = async () => {
    if (!selected) return;

    const confirmDelete = window.confirm(`Delete "${selected.name}"?`);

    if (!confirmDelete) return;

    try {
      await api.delete(`/playlists/${selected._id}`);

      setSelected(null);
      await loadPlaylists();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete playlist");
    }
  };

  return (
    <>
      <Header title="Your library" />

      <div className="library-actions">
        <button className="primary" onClick={create}>
          <Plus />
          New playlist
        </button>
      </div>

      {!selected ? (
        <>
          <Section title="Your playlists">
            {ps.length === 0 ? (
              <div className="empty">
                <LibraryIcon size={48} />

                <h3>No playlists yet.</h3>

                <p>
                  Create your first playlist and start collecting your favorite
                  tracks.
                </p>
              </div>
            ) : (
              <div className="playlist-grid">
                {ps.map((p) => (
                  <div
                    className="playlist"
                    key={p._id}
                    onClick={() => openPlaylist(p._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="playlist-art">♫</div>

                    <b>{p.name}</b>

                    <small>{p.songs?.length || 0} tracks</small>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      ) : (
        <>
          <div className="playlist-header">
            <button className="ghost" onClick={() => setSelected(null)}>
              ← Back to Library
            </button>

            <div>
              <span className="eyebrow">PLAYLIST</span>

              <h1>{selected.name}</h1>

              {selected.description && <p>{selected.description}</p>}

              <small>{selected.songs?.length || 0} tracks</small>
            </div>

            <button className="ghost" onClick={deletePlaylist}>
              Delete playlist
            </button>
          </div>

          <Section title="Tracks">
            {selected.songs?.length === 0 ? (
              <div className="empty">
                <Music2 size={48} />

                <h3>This playlist is empty.</h3>

                <p>Add songs from the list below.</p>
              </div>
            ) : (
              <div className="list">
                {selected.songs.map((song) => (
                  <div className="song" key={song._id}>
                    <img
                      src={
                        song.coverUrl ||
                        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"
                      }
                    />

                    <div className="song-info">
                      <b>{song.title}</b>

                      <small>
                        {song.artist} · {song.album}
                      </small>
                    </div>

                    <button onClick={() => load(song, selected.songs)}>
                      <Play size={16} fill="currentColor" />
                    </button>

                    <button onClick={() => removeSong(song._id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Add songs">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="list">
                {songs.map((song) => {
                  const alreadyAdded = selected.songs?.some(
                    (x) => x._id.toString() === song._id.toString(),
                  );

                  return (
                    <div className="song" key={song._id}>
                      <img
                        src={
                          song.coverUrl ||
                          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"
                        }
                      />

                      <div className="song-info">
                        <b>{song.title}</b>

                        <small>
                          {song.artist} · {song.album}
                        </small>
                      </div>

                      {alreadyAdded ? (
                        <span>Added ✓</span>
                      ) : (
                        <button onClick={() => addSong(song._id)}>
                          <Plus size={16} />
                          Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
}

function PremiumPage() {
  const upgradePremium = async () => {
    try {
      const { data: order } = await api.post("/payments/order", {
        amount: 199,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "Neon Aura",

        description: "Neon Aura Premium - 30 Days",

        order_id: order.id,

        handler: async function (response) {
          try {
            const verify = await api.post("/payments/verify", response);

            alert(
              `Premium activated until ${new Date(
                verify.data.premiumUntil,
              ).toLocaleDateString()}`,
            );

            window.location.reload();
          } catch (error) {
            alert(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },

        theme: {
          color: "#8b5cf6",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);

      alert(error.response?.data?.message || "Unable to start payment");
    }
  };

  return (
    <>
      <Header title="Neon Aura Premium" />

      <div className="premium-card">
        <Crown size={48} />

        <h1>Unlock Neon Aura Premium</h1>

        <p>Get the complete Neon Aura listening experience.</p>

        <button className="primary" onClick={upgradePremium}>
          <Crown size={18} />
          Upgrade to Premium · ₹199
        </button>
      </div>
    </>
  );
}

function Premium() {
  const { user } = useAuth();
  const pay = async () => {
    try {
      const r = await api.post("/payments/order", { amount: 199 });
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => {
        new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
          amount: r.data.amount,
          currency: r.data.currency,
          name: "Neon Aura",
          description: "30 day Premium",
          order_id: r.data.id,
          handler: async (x) => {
            await api.post("/payments/verify", x);
            location.reload();
          },
        }).open();
      };
      document.body.appendChild(s);
    } catch (e) {
      alert(e.response?.data?.message || "Configure Razorpay first");
    }
  };
  return (
    <div className="premium">
      <span className="eyebrow">NEON AURA PLUS</span>
      <h1>
        Turn the lights
        <br />
        <i>all the way up.</i>
      </h1>
      <p>
        Unlimited discovery, premium releases and a calmer listening experience.
      </p>
      <div className="price">
        ₹199 <small>/ 30 days</small>
      </div>
      {user?.plan === "premium" ? (
        <div className="success">
          Premium active until{" "}
          {new Date(user.premiumUntil || Date.now()).toLocaleDateString()}
        </div>
      ) : (
        <button className="primary" onClick={pay}>
          <Crown /> Unlock Premium
        </button>
      )}
    </div>
  );
}
function Admin() {
  const [songs, setSongs] = useState([]);

  const [f, setF] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "Other",
    duration: 0,
    isPremium: false,
    featured: false,
  });

  const [a, setA] = useState(null);
  const [c, setC] = useState(null);

  const load = async () => {
    try {
      const r = await api.get("/songs");
      setSongs(r.data);
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!a) {
      alert("Please select an audio file.");
      return;
    }

    const d = new FormData();

    Object.entries(f).forEach(([k, v]) => {
      d.append(k, v);
    });

    d.append("audio", a);

    if (c) {
      d.append("cover", c);
    }

    try {
      await api.post("/songs/upload", d);

      setF({
        title: "",
        artist: "",
        album: "",
        genre: "Other",
        duration: 0,
        isPremium: false,
        featured: false,
      });

      setA(null);
      setC(null);

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');

      fileInputs.forEach((input) => {
        input.value = "";
      });

      await load();

      alert("Uploaded to Cloudinary + MongoDB");
    } catch (x) {
      console.error("Upload error:", x);
      alert(
        x.response?.data?.message ||
          "Upload failed. Check the backend terminal.",
      );
    }
  };

  return (
    <>
      <Header title="Admin studio" />

      <div className="admin-grid">
        {/* Upload Form */}
        <form className="panel" onSubmit={submit}>
          <h3>Upload a release</h3>

          {["title", "artist", "album", "genre", "duration"].map((k) => (
            <input
              key={k}
              placeholder={k}
              value={f[k]}
              onChange={(e) =>
                setF({
                  ...f,
                  [k]: e.target.value,
                })
              }
              required={k === "title" || k === "artist"}
            />
          ))}

          <label>
            Audio file
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                setA(e.target.files?.[0] || null);
              }}
              required
            />
          </label>

          <label>
            Cover image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setC(e.target.files?.[0] || null);
              }}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={f.featured}
              onChange={(e) =>
                setF({
                  ...f,
                  featured: e.target.checked,
                })
              }
            />{" "}
            Featured
          </label>

          <label>
            <input
              type="checkbox"
              checked={f.isPremium}
              onChange={(e) =>
                setF({
                  ...f,
                  isPremium: e.target.checked,
                })
              }
            />{" "}
            Premium
          </label>

          <button className="primary" type="submit">
            <Upload /> Upload
          </button>
        </form>

        {/* Song Catalog */}
        <div className="panel">
          <h3>Catalog · {songs.length}</h3>

          {songs.length === 0 ? (
            <p>No songs uploaded yet.</p>
          ) : (
            songs.slice(0, 10).map((s) => (
              <div className="admin-song" key={s._id}>
                <span>
                  {s.title} · {s.artist}
                </span>

                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/songs/${s._id}`);
                      await load();
                    } catch (error) {
                      console.error("Delete error:", error);

                      alert(
                        error.response?.data?.message ||
                          "Failed to delete song",
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
function Simple({ name, icon: Icon }) {
  return (
    <>
      <Header title={name} />
      <div className="empty">
        <Icon size={48} />
        <h3>{name} is ready for your next move.</h3>
        <p>Use the player, discover tracks, or build your library.</p>
      </div>
    </>
  );
}
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}
function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="*"
              element={
                <Protected>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route
                        path="/artist/:artistName"
                        element={<ArtistPage />}
                      />

                      <Route path="/album/:albumName" element={<AlbumPage />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/premium" element={<Premium />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route
                        path="/radio"
                        element={<Simple name="Radio" icon={Radio} />}
                      />
                      <Route path="/liked" element={<LikedPage />} />
                      <Route path="/premium" element={<PremiumPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </Protected>
              }
            />
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}
export default App;
