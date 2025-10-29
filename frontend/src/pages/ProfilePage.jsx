import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileView from '../components/ProfileView';
import './ProfilePage.css';

// The Edit Form component
const ProfileEditForm = ({ initialData, onSave, onCancel }) => {
  const [profileData, setProfileData] = useState(initialData);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.username || !profileData.email) {
      setMessage('Username and Email cannot be empty.');
      setIsSuccess(false);
      return;
    }
    setMessage('Saving...');
    try {
      const response = await axios.put('/api/profile', profileData);
      setMessage(response.data.message);
      setIsSuccess(true);
      onSave(profileData);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-header"><h2>Account Settings / Profile Details</h2></div>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group"><label>First Name</label><input name="first_name" value={profileData.first_name || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Last Name</label><input name="last_name" value={profileData.last_name || ''} onChange={handleChange} /></div>
        
        {/* --- THIS IS THE CORRECT FIELD --- */}
        <div className="form-group">
          <label>BGMI Username (In-Game Name)</label>
          <input name="bgmi_username" value={profileData.bgmi_username || ''} onChange={handleChange} placeholder="Your exact in-game name" required />
        </div>
        
        <div className="form-group">
          <label>Website Username</label>
          <input name="username" value={profileData.username || ''} onChange={handleChange} required />
        </div>

        <div className="form-group"><label>Email</label><input name="email" type="email" value={profileData.email || ''} onChange={handleChange} required /></div>
        <div className="form-group full-width"><label>Description (Bio)</label><textarea name="bio" value={profileData.bio || ''} onChange={handleChange} rows="4" placeholder="Tell us about yourself..."></textarea></div>
        <div className="form-group"><label>Country</label><input name="country" value={profileData.country || ''} onChange={handleChange} placeholder="e.g., India" /></div>
        <div className="form-group"><label>Instagram Username</label><input name="instagram_url" value={profileData.instagram_url || ''} onChange={handleChange} placeholder="username" /></div>
        <div className="form-group"><label>YouTube Channel URL</label><input name="youtube_url" value={profileData.youtube_url || ''} onChange={handleChange} placeholder="https://youtube.com/..." /></div>
        <div className="form-actions">
          {message && <p style={{ color: isSuccess ? 'green' : '#e74c3c', marginRight: 'auto' }}>{message}</p>}
          <button type="button" onClick={onCancel} className="btn-reset">Cancel</button>
          <button type="submit" className="btn-save">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

// Main Page Controller
function ProfilePage({ mode }) {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setIsEditing(mode === 'edit'); }, [mode]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setProfileData(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isEditing]); // Refetch data when you exit edit mode

  if (loading) return <div className="loading-text">Loading Profile...</div>;
  if (!profileData) return <p>Could not load profile.</p>;

  return isEditing ? (
    <ProfileEditForm 
      initialData={profileData} 
      onSave={(updatedData) => {
        setProfileData(updatedData);
        setIsEditing(false);
      }}
      onCancel={() => setIsEditing(false)}
    />
  ) : (
    <ProfileView 
      profile={profileData} 
      onEditClick={() => setIsEditing(true)}
    />
  );
}

export default ProfilePage;