import { useAuth } from "../context/AuthContext";

export const Header = () => {
  const { user, logout } = useAuth();
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div>
        <p className="page-label">Welcome back,</p>
        <h2>Welcome back, {user?.name || "Team"}</h2>
        <p className="helper-text">Here&apos;s what&apos;s happening with your business today.</p>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button">
          3
        </button>
        <div className="user-chip">
          <div className="user-avatar">{initials || "HD"}</div>
          <div>
            <strong>{user?.name || "HD Admin"}</strong>
            <p>Administrator</p>
          </div>
        </div>
        <button className="secondary-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};
