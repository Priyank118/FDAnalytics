import React from 'react';
import './PricingSection.css';

function PricingSection() {
  return (
    <div id="pricing" className="pricing-section">
      <div className="pricing-container">
        <h2>Choose a Plan to Elevate Your Journey</h2>
        <div className="pricing-card">
          <h3>Beta Plan</h3>
          <p className="price">Free</p>
          <ul>
            <li>✔️ Unlimited Performance Analysis</li>
            <li>✔️ Dedicated Discord Support</li>
            <li>✔️ Detailed Knowledge Access</li>
            <li>✔️ Priority Feature Access</li>
          </ul>
          <button className="pricing-btn">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default PricingSection;