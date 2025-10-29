import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './AddMatchModal.css'; // Reuse styles
import { FaTimes } from 'react-icons/fa';

Modal.setAppElement('#root');

function AddPerformanceModal({ isOpen, onRequestClose, matchId, onPlayerAdded, roster, currentPerformances }) {
  const initialFormState = { player_ign: '', kills: '', assists: '', damage: '', revives: '' };
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter roster to show only players *not* already in this match
  const playersInMatch = currentPerformances.map(p => p.player_ign);
  const availablePlayers = roster.filter(name => !playersInMatch.includes(name));

  // Set default player when modal opens or available players change
  useEffect(() => {
    if (isOpen && availablePlayers.length > 0) {
      setFormData(prev => ({ ...initialFormState, player_ign: availablePlayers[0] }));
    } else if (isOpen) {
        setFormData(initialFormState); // Reset if no available players
    }
  }, [isOpen, roster]); // Re-run if roster changes while open

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

    const payload = {
        player_ign: formData.player_ign,
        kills: parseInt(formData.kills) || 0,
        assists: parseInt(formData.assists) || 0,
        damage: parseInt(formData.damage) || 0,
        revives: parseInt(formData.revives) || 0,
    };

    try {
      const response = await axios.post(`/api/matches/${matchId}/performances`, payload);
      setMessage(response.data.message);
      // Don't reset form immediately, let user see success message
      onPlayerAdded(); // Call parent callback
      setTimeout(() => { // Close after delay
          handleClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add player stats.');
      console.error("Add Player Error:", error.response || error);
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
        <h2>Add Player Performance</h2>
        <button onClick={handleClose} className="close-btn"><FaTimes /></button>
      </div>
      <form onSubmit={handleSubmit} className="add-match-form">
         <div className="form-group">
            <label>Player In-Game Name</label>
            <select name="player_ign" value={formData.player_ign} onChange={handleChange} required>
                <option value="" disabled>-- Select Player --</option>
                {availablePlayers.length > 0 ? (
                    availablePlayers.map(name => <option key={name} value={name}>{name}</option>)
                ) : (
                    <option value="" disabled>No available players on roster</option>
                )}
            </select>
         </div>
         <div className="form-grid simple">
            <div className="form-column"><label>Kills</label><input name="kills" type="number" value={formData.kills} onChange={handleChange} /></div>
            <div className="form-column"><label>Assists</label><input name="assists" type="number" value={formData.assists} onChange={handleChange} /></div>
            <div className="form-column"><label>Damage</label><input name="damage" type="number" value={formData.damage} onChange={handleChange} /></div>
            <div className="form-column"><label>Revives</label><input name="revives" type="number" value={formData.revives} onChange={handleChange} /></div>
         </div>
         {message && <p className={message.includes('successfully') ? "success-message" : "error-message"}>{message}</p>}
         <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || availablePlayers.length === 0}>
              {isSubmitting ? 'Adding...' : 'Add Performance'}
            </button>
         </div>
      </form>
    </Modal>
  );
}
export default AddPerformanceModal;