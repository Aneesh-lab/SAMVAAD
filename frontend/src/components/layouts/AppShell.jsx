import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import "./AppShell.css";

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

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