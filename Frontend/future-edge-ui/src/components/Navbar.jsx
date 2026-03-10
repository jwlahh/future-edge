import "../styles/navbar.css";
import { FaUserCircle } from "react-icons/fa";

function Navbar() {

  return (

    <div className="navbar">

      <div className="nav-left">
        <h2 className="logo">FutureEdge</h2>
      </div>

      <div className="nav-right">
        <FaUserCircle className="user-icon" />
      </div>

    </div>

  );
}

export default Navbar;