import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardHeader.css';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

function DashboardHeader({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} 
            alt="avatar" 
            className="user-avatar" 
          />
          <span className="user-name">{user.username}</span>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/dashboard/profile" className="dropdown-item">
                <FaUserCircle /> My Profile
              </Link>
              {/* This link now points to /dashboard/settings */}
              <Link to="/dashboard/settings" className="dropdown-item">
                <FaCog /> Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;