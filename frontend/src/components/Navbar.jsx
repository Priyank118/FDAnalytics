import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FDAnalytics
        </Link>
        <div className="nav-menu">
          <Link to="/#features" className="nav-links">Features</Link>
          <Link to="/#pricing" className="nav-links">Pricing</Link>
          <Link to="/#faq" className="nav-links">FAQs</Link>
        </div>
        <div className="nav-buttons">
          <Link to="/login" className="nav-btn-login">Login</Link>
          <Link to="/register" className="nav-btn-signup">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;