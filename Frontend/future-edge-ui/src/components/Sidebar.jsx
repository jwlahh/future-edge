import { Link } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({ isOpen }) {

  return (
    <div className={isOpen ? "sidebar open" : "sidebar"}>

      <h2 className="logo">Future Edge</h2>

      <ul className="nav-links">

        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/analysis">Resume Analysis</Link>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;