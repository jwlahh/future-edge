import "../styles/navbar.css";
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react"; // ✅ added
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null); // ✅ added
  const navigate = useNavigate();

  // ✅ FETCH USER NAME
  useEffect(() => {
    const getProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("First_name, Last_Name")
        .eq("user_id", user.id)
        .single();

      setProfile(userData);
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="navbar">

      <div className="logo-container">
        <img src={logo} alt="FutureEdge Logo" className="logo-img" />
      </div>

      <div className="nav-right">

      <div className="user-section" onClick={() => setOpen(!open)}>
        <span className="user-name">
          {profile?.First_name || "User"} {profile?.Last_Name || ""}
        </span>

        <FaUserCircle className="user-icon" />
      </div>

      {open && (
        <div className="profile-dropdown">
          <div onClick={() => navigate("/profile")}>Profile</div>
          <div onClick={handleLogout}>Log Out</div>
        </div>
      )}

    </div>

    </div>
  );
}

export default Navbar;