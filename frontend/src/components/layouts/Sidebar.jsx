import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const navigationItems = [
  {
    label: "Dashboard",
    icon: "dashboard",
    path: "/student/dashboard",
  },
  {
    label: "Learn",
    icon: "menu_book",
    path: "/student/learn",
  },
  {
    label: "Practice",
    icon: "sign_language",
    path: "/student/practice",
  },
  {
    label: "Progress",
    icon: "trending_up",
    path: "/student/progress",
  },
  {
    label: "Achievements",
    icon: "emoji_events",
    path: "/student/achievements",
  },
  {
    label: "Profile",
    icon: "person",
    path: "/student/profile",
  },
];

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          SAMVAAD
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const isActive =
              location.pathname === item.path;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  handleNavigation(item.path)
                }
                className={`sidebar-nav-item ${
                  isActive
                    ? "sidebar-nav-item-active"
                    : ""
                }`}
              >
                <span className="material-symbols-rounded">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout"
          >
            <span className="material-symbols-rounded">
              logout
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;