import {
  Compass,
  Home,
  Library,
  LogIn,
  Music2,
  Plus,
  Radio,
  Settings,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
export default function Sidebar() {
  const loc = useLocation();
  const items = [
    ["/", "Home", Home],
    ["/discover", "Discover", Compass],
    ["/library", "Your Library", Library],
    ["/radio", "Aura Radio", Radio],
    ["/profile", "Profile", UserRound],
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">
          <Music2 />
        </div>
        <div>
          <strong>NEON</strong>
          <span>AURA</span>
        </div>
      </div>
      <p className="label">EXPLORE</p>
      {items.map(([to, n, I]) => (
        <Link
          className={loc.pathname === to ? "nav active" : "nav"}
          key={to}
          to={to}
        >
          <I size={19} />
          {n}
        </Link>
      ))}
      <p className="label space">COLLECTION</p>
      <Link className="nav" to="/playlists">
        <Plus size={19} />
        New Playlist
      </Link>
      <Link className="nav" to="/premium">
        <Radio size={19} />
        Go Premium
      </Link>
      <div className="sidebar-bottom">
        <Link className="nav" to="/settings">
          <Settings size={19} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
