import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  return (
    <div className="hero-container">
      <p className="pre-headline">Built for <span>eSports Gamers.</span></p>
      <h1>Your Personal Esports Companion.</h1>
      <p>Turn your passion into progress. Stop feeling stuck, analyze your gameplay, and become the esports athlete you dream to be.</p>
      <div className="hero-btns">
        <Link to="/register" className="hero-cta-btn">
          Get Started Now &gt;
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;