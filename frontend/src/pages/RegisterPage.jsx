import React from 'react';
import Register from '../components/Register';
import './Auth.css';

function RegisterPage() {
  // Random image URLs (replace with your own high-res, gaming-themed images if desired)
  const imageUrls = [
    'https://via.placeholder.com/600x800/C9F0D8/407050?text=REGISTER+ILLUSTRATION+1',
    'https://via.placeholder.com/600x800/E0F0D0/506040?text=REGISTER+ILLUSTRATION+2',
    'https://via.placeholder.com/600x800/D9E9F0/506878?text=REGISTER+ILLUSTRATION+3',
    '/assets/register-illustration.png' // Your original illustration
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
          {/* <img src={randomImage} alt="Gaming Sign Up Illustration" /> */}
        </div>
        <div className="form-panel">
          <Register />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;