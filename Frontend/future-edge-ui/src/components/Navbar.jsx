import "../styles/navbar.css";
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="navbar">

      <div className="logo-container">
        <img src={logo} alt="FutureEdge Logo" className="logo-img" />
      </div>

      <div className="nav-right">
        <FaUserCircle
          className="user-icon"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="profile-dropdown">
            <p onClick={() => navigate("/profile")}>Profile</p>
            <p onClick={handleLogout}>Sign Out</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default Navbar;