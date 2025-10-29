import React from 'react';
import './FeaturesSection.css';
import { FaBrain, FaCrosshairs, FaCloudUploadAlt, FaChartLine, FaMobileAlt } from 'react-icons/fa';

// We define the feature data here to keep the JSX clean
const featuresData = [
  {
    icon: <FaBrain />,
    title: 'Computer Vision-Powered Analysis',
    description: 'Our AI detects in-game elements, extracts key insights, and helps you make smarter tactical decisions.'
  },
  {
    icon: <FaChartLine />,
    title: 'Deeper Performance Insights',
    description: 'Go beyond K/D. Track your gameplay, analyze detailed stats, and refine your strategies with advanced data.'
  },
  {
    icon: <FaCloudUploadAlt />,
    title: 'Cloud-Based & Secure',
    description: 'Access, store, and share your analysis from any device, anytime. Your data is securely stored with us.'
  },
  {
    icon: <FaMobileAlt />,
    title: 'User-Friendly & Responsive',
    description: 'Enjoy a seamless, intuitive experience across all platforms and devices, optimized for your convenience.'
  }
];

function FeaturesSection() {
  return (
    <div id="features" className="features-section">
      <div className="features-container">
        <h2>Level Up Your Esports Career</h2>
        <p className="features-subtitle">Effortlessly store, create, and refine your in-game strategies with our smartest solutions.</p>
        <div className="features-grid">
          {featuresData.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturesSection;