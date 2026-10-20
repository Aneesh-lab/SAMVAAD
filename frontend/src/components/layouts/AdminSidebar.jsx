import { useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const adminNavigationItems = [
  {
    label: "Dashboard",
    icon: "dashboard",
    path: "/admin/dashboard",
  },
  {
    label: "Courses",
    icon: "menu_book",
    path: "/admin/courses",
  },
  {
    label: "Quizzes",
    icon: "quiz",
    path: "/admin/quizzes",
  },
  {
    label: "Students",
    icon: "group",
    path: "/admin/students",
  },
];

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
    onClose();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`admin-sidebar ${
          isOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-brand-mark">
            S
          </div>

          <div className="admin-sidebar-brand-copy">
            <span className="admin-sidebar-brand-name">
              SAMVAAD
            </span>

            <span className="admin-sidebar-brand-caption">
              Administration
            </span>
          </div>
        </div>

        <div className="admin-sidebar-section-label">
          WORKSPACE
        </div>

        <nav
          className="admin-sidebar-nav"
          aria-label="Admin navigation"
        >
          {adminNavigationItems.map((item) => {
            const isActive =
              item.path === "/admin/dashboard"
                ? location.pathname === item.path
                : location.pathname === item.path ||
                  location.pathname.startsWith(
                    `${item.path}/`
                  );

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`admin-sidebar-nav-item ${
                  isActive
                    ? "admin-sidebar-nav-item-active"
                    : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className="material-symbols-rounded admin-sidebar-nav-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-role">
            <span className="material-symbols-rounded">
              shield_person
            </span>

            <div>
              <span className="admin-sidebar-role-title">
                Administrator
              </span>

              <span className="admin-sidebar-role-caption">
                Platform management
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar-logout"
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

export default AdminSidebar;