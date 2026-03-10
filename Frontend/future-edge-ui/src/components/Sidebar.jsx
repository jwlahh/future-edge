import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFileAlt,
  FaChartBar
} from "react-icons/fa";

import "../styles/sidebar.css";

function Sidebar({ collapsed, toggleSidebar }) {

  const location = useLocation();

  return (

    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <button
        className="collapse-btn"
        onClick={toggleSidebar}
      >
        {collapsed ? ">" : "<"}
      </button>

      <ul className="nav-links">

        <li className={location.pathname === "/dashboard" ? "active" : ""}>
          <Link to="/dashboard">
            <span className="icon icon-dashboard"><FaHome/></span>
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </li>

        <li className={location.pathname === "/analysis" ? "active" : ""}>
          <Link to="/analysis">
            <span className="icon icon-analysis"><FaFileAlt/></span>
            {!collapsed && <span>Resume Analysis</span>}
          </Link>
        </li>

        <li className={location.pathname === "/skill-gap" ? "active" : ""}>
          <Link to="/skill-gap">
            <span className="icon icon-skillgap"><FaChartBar/></span>
            {!collapsed && <span>Skill Gap</span>}
          </Link>
        </li>

      </ul>

    </div>

  );
}

export default Sidebar;