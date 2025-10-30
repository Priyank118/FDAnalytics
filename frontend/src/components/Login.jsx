import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('/api/login', { username, password });
      login(response.data.user);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
    
      <div className="logo">FDAnalytics</div>
      <h2>Welcome Back, Champion!</h2>
      <p className="subtitle">Sign in to sharpen your skills and dominate the leaderboard.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Email or Username</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="form-options">
          <a href="#">Forgot Password?</a>
        </div>
        <button type="submit">Sign In</button>
      </form>
      
     
      
      
      <div className="separator">or</div>

  {/* This is now an anchor tag pointing to the backend */}
  <a href="https://fdanalytics-backend.onrender.com/api/google/login" className="google-btn">
    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" width="20" style={{marginRight: '10px'}} />
    Sign In with Google
  </a>
      
      <p style={{textAlign: 'center', marginTop: '30px', color: '#666'}}>
        New on our platform? <Link to="/register">Create an account</Link>
      </p>

      {message && <p style={{color: '#e74c3c', textAlign: 'center'}}>{message}</p>}
    </>
  );
}

export default Login;