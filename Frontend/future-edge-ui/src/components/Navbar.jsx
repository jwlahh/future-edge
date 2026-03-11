import "../styles/navbar.css";
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";

function Navbar() {

  return (

    <div className="navbar">

      <div className="logo-container">
        <img src={logo} alt="FutureEdge Logo" className="logo-img" />
      </div>

      <div className="nav-right">
        <FaUserCircle className="user-icon" />
      </div>

    </div>

  );
}

export default Navbar;