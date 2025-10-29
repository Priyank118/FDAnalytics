import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FaDiscord, FaTwitter, FaInstagram } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-section about">
          <h3 className="footer-logo">FDAnalytics</h3>
          <p>Your personal esports companion, turning passion into progress with data-driven insights.</p>
        </div>
        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/#features">Features</Link></li>
            <li><Link to="/#pricing">Pricing</Link></li>
            <li><Link to="/#faq">FAQs</Link></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="#" target="_blank" rel="noopener noreferrer"><FaDiscord /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} BGMI Performance FDAnalytics. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;