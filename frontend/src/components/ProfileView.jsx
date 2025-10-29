import React from 'react';
import './ProfileView.css';

function ProfileView({ profile, onEditClick }) {
  // Calculate profile completion percentage on the fly
  const calculateCompletion = () => {
    const fields = ['first_name', 'last_name', 'bio', 'country'];
    const filledFields = fields.filter(field => profile[field] && profile[field].trim() !== '').length;
    const totalFields = fields.length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className="profile-view-container">
      <div className="profile-view-header">
        <h3>User Profile / My Profile</h3>
        <button className="edit-profile-btn" onClick={onEditClick}>
          ✏️ Edit Profile
        </button>
      </div>

      {completion < 100 && (
        <div className="completion-card">
          <div className="completion-info">
            <strong>Complete Your Profile</strong>
            <p>Your profile is {completion}% complete. Finish it to get noticed!</p>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${completion}%` }}></div>
          </div>
          <button className="complete-now-btn" onClick={onEditClick}>Complete Now</button>
        </div>
      )}

      <div className="profile-main-card">
        <img 
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} 
          alt="avatar" 
          className="profile-avatar"
        />
        <div className="profile-main-info">
          <h2>{profile.first_name} {profile.last_name}</h2>
          <p>Username: {profile.username} &bull; Location: {profile.country || 'Unknown'}</p>
        </div>
      </div>

      <div className="profile-bio-card">
        <h3>Bio</h3>
        <p>{profile.bio || 'No bio available. Click "Edit Profile" to add one.'}</p>
      </div>
    </div>
  );
}

export default ProfileView;