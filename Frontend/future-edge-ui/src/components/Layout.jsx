import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children, hideSidebar }) {

  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div>

      {/* ✅ Navbar */}
      {!hideSidebar && <Navbar />}

      {/* ✅ Sidebar */}
      {!hideSidebar && (
        <Sidebar
          collapsed={collapsed}
          toggleSidebar={toggleSidebar}
        />
      )}

      {/* ✅ Main */}
      <main
        style={{
          marginTop: hideSidebar ? "0px" : "70px",
          marginLeft: hideSidebar
            ? "0px"
            : collapsed
            ? "70px"
            : "230px",
          padding: "40px",
          transition: "0.3s"
        }}
      >
        {children}
      </main>

    </div>
  );
}

export default Layout;