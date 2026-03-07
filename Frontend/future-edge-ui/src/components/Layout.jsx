import { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/dashboard.css";

function Layout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard">

      <Sidebar isOpen={sidebarOpen} />

      {/* Overlay that closes sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <main className="main-content">

        <button onClick={toggleSidebar} className="menu-btn">
          ☰
        </button>

        {children}

      </main>

    </div>
  );
}

export default Layout;