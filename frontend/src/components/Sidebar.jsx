import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FaThLarge, FaHistory , FaUsers } from 'react-icons/fa'; // Example icons

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">FDAnalytics</div>
      </div>
      <nav className="sidebar-nav">
        <p className="nav-category">PERFORMANCE TRACKING</p>
        <NavLink to="/dashboard" className="nav-link" end>
          <FaThLarge />
          <span>Overview</span>
        </NavLink>
        <NavLink to="/dashboard/history" className="nav-link">
          <FaHistory />
          <span>Matches History</span>
        </NavLink>
        <NavLink to="/dashboard/my-team" className="nav-link">
  <FaUsers />
  <span>My Team</span>
</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;