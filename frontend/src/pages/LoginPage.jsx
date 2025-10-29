import React from 'react';
import Login from '../components/Login';
import './Auth.css';

function LoginPage() {
  // Random image URLs (replace with your own high-res, gaming-themed images if desired)
  const imageUrls = [
    'https://via.placeholder.com/600x800/A0D9D9/2E5D5D?text=LOGIN+ILLUSTRATION+1',
    'https://via.placeholder.com/600x800/D0E0E0/304040?text=LOGIN+ILLUSTRATION+2',
    'https://via.placeholder.com/600x800/B0C4DE/465B6D?text=LOGIN+ILLUSTRATION+3',
    '/assets/login-illustration.png' // Your original illustration
  ];

  // Pick a random image
  const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

  return (
    <div className="auth-page-container">
      <div className="auth-panel">
        {/* The illustration panel with random background image */}
        <div 
          className="illustration-panel" 
          style={{ backgroundImage: `url(${randomImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          {/* We're using background-image now, so the <img> tag can be removed or you can layer an SVG */}
          {/* <img src={randomImage} alt="Gaming Illustration" /> */}
        </div>
        <div className="form-panel">
          <Login />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;