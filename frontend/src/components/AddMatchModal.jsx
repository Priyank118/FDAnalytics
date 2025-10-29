import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './AddMatchModal.css'; // Reuse styles
import { FaTimes } from 'react-icons/fa';

Modal.setAppElement('#root');

// The roster prop will be passed down from MatchesHistory
function AddMatchModal({ isOpen, onRequestClose, onMatchAdded, roster }) {
  const initialFormState = {
    player_ign: '',
    map_name: 'Erangel',
    team_rank: '',
    kills: '', assists: '', damage: '', revives: '',
    survival_minutes: '', survival_seconds: '',
    recall: '', rating: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgmiMaps = ['Erangel', 'Miramar', 'Sanhok', 'Livik', 'Karakin', 'Vikendi', 'Nusa'];

  // Set default player when modal opens or roster changes
  useEffect(() => {
    if (isOpen && roster && roster.length > 0) {
      setFormData(prev => ({ ...initialFormState, player_ign: roster[0] }));
    } else if (isOpen) {
        setFormData(initialFormState); // Reset if roster is empty
    }
  }, [isOpen, roster]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.player_ign) {
        setMessage('Please select a player.');
        return;
    }
    setMessage('');
    setIsSubmitting(true);

    // Prepare payload for a single performance
    const performanceData = {
        player_ign: formData.player_ign,
        kills: parseInt(formData.kills) || 0,
        assists: parseInt(formData.assists) || 0,
        damage: parseInt(formData.damage) || 0,
        revives: parseInt(formData.revives) || 0,
        survival_minutes: parseInt(formData.survival_minutes) || 0,
        survival_seconds: parseInt(formData.survival_seconds) || 0,
        recall: parseInt(formData.recall) || 0,
        rating: parseFloat(formData.rating) || 0.0,
    };

    try {
      const response = await axios.post('/api/add-manual-match', {
        team_rank: parseInt(formData.team_rank),
        map_name: formData.map_name,
        performances: [performanceData] // Send as an array
      });
      setMessage(response.data.message);
      onMatchAdded(); // Refresh list in parent
      setTimeout(() => { // Close after delay
          handleClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
      setFormData(initialFormState);
      setMessage('');
      onRequestClose();
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} className="modal-content" overlayClassName="modal-overlay">
      <div className="modal-header">
        <h2>Manually Add Match Stats</h2>
        <button onClick={handleClose} className="close-btn"><FaTimes /></button>
      </div>
      <form onSubmit={handleSubmit} className="add-match-form">
        <div className="form-grid full"> {/* Use wider grid */}
            <div className="form-column">
                <label>Player In-Game Name</label>
                {/* --- Player Dropdown --- */}
                <select name="player_ign" value={formData.player_ign} onChange={handleChange} required>
                    <option value="" disabled>-- Select Player --</option>
                    {roster && roster.length > 0 ? (
                        roster.map(name => <option key={name} value={name}>{name}</option>)
                    ) : (
                        <option value="" disabled>No players on roster</option>
                    )}
                </select>
            </div>
             <div className="form-column">
                <label>Map Name</label>
                {/* --- Map Dropdown --- */}
                <select name="map_name" value={formData.map_name} onChange={handleChange}>
                    {bgmiMaps.map(map => <option key={map} value={map}>{map}</option>)}
                </select>
            </div>
             <div className="form-column">
                <label>Team Rank</label>
                <input name="team_rank" type="number" value={formData.team_rank} onChange={handleChange} placeholder="e.g., 2" required />
            </div>
            <div className="form-column">
                <label>Kills</label>
                <input name="kills" type="number" value={formData.kills} onChange={handleChange} placeholder="e.g., 8" />
            </div>
            <div className="form-column">
                <label>Assists</label>
                <input name="assists" type="number" value={formData.assists} onChange={handleChange} placeholder="e.g., 10" />
            </div>
            <div className="form-column">
                <label>Damage</label>
                <input name="damage" type="number" value={formData.damage} onChange={handleChange} placeholder="e.g., 1500" />
            </div>
             <div className="form-column">
                <label>Revives</label>
                <input name="revives" type="number" value={formData.revives} onChange={handleChange} placeholder="e.g., 2" />
            </div>
            {/* --- New Fields --- */}
             <div className="form-column time">
                <label>Survival Time</label>
                 <div>
                    <input type="number" name="survival_minutes" value={formData.survival_minutes} onChange={handleChange} placeholder="Min"/>m
                    <input type="number" name="survival_seconds" value={formData.survival_seconds} onChange={handleChange} placeholder="Sec"/>s
                </div>
            </div>
             <div className="form-column">
                <label>Recall</label>
                <input name="recall" type="number" value={formData.recall} onChange={handleChange} placeholder="e.g., 1" />
            </div>
             <div className="form-column">
                <label>Rating</label>
                <input name="rating" type="number" step="0.1" value={formData.rating} onChange={handleChange} placeholder="e.g., 98.5" />
            </div>
        </div>
        {message && <p className={message.includes('success') ? "success-message" : "error-message"}>{message}</p>}
        <div className="form-actions">
          <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || !roster || roster.length === 0}>
            {isSubmitting ? 'Adding...' : 'Add Match'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddMatchModal;