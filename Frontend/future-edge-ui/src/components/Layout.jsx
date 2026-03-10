import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {

  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (

    <div>

      <Navbar />

      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
      />

      <main
        style={{
          marginTop: "70px",
          marginLeft: collapsed ? "70px" : "230px",
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