import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setMessage('You must agree to the terms and conditions.');
      return;
    }
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <>
      <div className="logo">FDAnalytics</div>
      <h2>Join the Game-Changers</h2>
      <p className="subtitle">Create your account to start your esports journey.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input name="username" type="text" value={formData.username} onChange={handleChange} required />
        </div>
        <div style={{display: 'flex', gap: '20px'}}>
          <div className="input-group" style={{flex: 1}}>
            <label>First Name</label>
            <input name="first_name" type="text" value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="input-group" style={{flex: 1}}>
            <label>Last Name</label>
            <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} />
          </div>
        </div>
        <div className="input-group">
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required />
          <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="form-options">
          <label className="checkbox-group">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            I agree to <a href="#">privacy policy & terms</a>
          </label>
        </div>
        <button type="submit" className="btn-primary">Sign Up</button> {/* Apply new class */}
      </form>
      <div className="separator">or</div>
<a href="http://localhost:5000/api/google/login" className="google-btn">
  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" width="20" style={{marginRight: '10px'}} />
  Sign Up with Google
</a>
      <p style={{textAlign: 'center', marginTop: '30px', color: '#666'}}>
        Already have an account? <Link to="/login">Sign in instead</Link>
      </p>

      {message && <p style={{color: message.includes('successfully') ? 'green' : '#e74c3c', textAlign: 'center'}}>{message}</p>}
    </>
  );
}

export default Register;