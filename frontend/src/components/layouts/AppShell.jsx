import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

import "./AppShell.css";

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  // Close the mobile sidebar when navigating to another page.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {isAdminRoute ? (
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />
      ) : (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />
      )}

      <div className="app-shell-content">
        <Navbar onMenuClick={handleOpenSidebar} />

        <main className="app-shell-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;