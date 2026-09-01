import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;