import "./Navbar.css";

function Navbar({ onMenuClick }) {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName = user.name || "User";

  return (
    <header className="navbar">

      <div className="navbar-left">

        <button
          type="button"
          onClick={onMenuClick}
          className="navbar-menu-button"
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <div className="navbar-page-title">
          Dashboard
        </div>

      </div>

      <div className="navbar-right">

        <button
          type="button"
          className="navbar-icon-button"
          aria-label="Notifications"
        >
          🔔
        </button>

        <button
          type="button"
          className="navbar-profile"
        >
          <div className="navbar-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <span className="navbar-username">
            {userName}
          </span>
        </button>

      </div>

    </header>
  );
}

export default Navbar;