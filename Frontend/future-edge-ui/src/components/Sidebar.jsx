import { Link, useLocation } from "react-router-dom";
import { useState } from "react"; // ✅ ADD THIS
import {
  FaHome,
  FaFileAlt,
  FaChartBar,
  FaClipboardList,
  FaChevronDown,
  FaChevronRight 
} from "react-icons/fa";

import "../styles/sidebar.css";

function Sidebar({ collapsed, toggleSidebar }) {

  const location = useLocation();
  const [assessmentOpen, setAssessmentOpen] = useState(false);

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

        <li className={assessmentOpen ? "active" : ""}>
          <div
            className="nav-link"
            onClick={() => setAssessmentOpen(!assessmentOpen)}
          >
            <span className="icon icon-assessment">
              <FaClipboardList />
            </span>

            {!collapsed && <span>Assessment</span>}

            {!collapsed && (
              <span className={`arrow ${assessmentOpen ? "open" : ""}`}>
                <FaChevronRight />
              </span>
            )}
          </div>

          {assessmentOpen && !collapsed && (
            <ul className="submenu">
              <li>
                <Link to="/assessment/mock-test">Skill Assessment</Link>
              </li>
              <li>
                <Link to="/assessment/mock-interview">
                  Aptitude & Verbal
                </Link>
              </li>
            </ul>
          )}

        </li>

      </ul>

    </div>
  );
}

export default Sidebar;