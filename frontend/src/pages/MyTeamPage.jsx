import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyTeamPage.css';
import { FaTrash } from 'react-icons/fa';

function MyTeamPage() {
  const [roster, setRoster] = useState([]);
  const [newPlayerIgn, setNewPlayerIgn] = useState('');
  const [message, setMessage] = useState('');

  const fetchRoster = async () => {
    try {
      const response = await axios.get('/api/team');
      setRoster(response.data);
    } catch (error) {
      console.error("Failed to fetch roster", error);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerIgn) return;
    try {
      const response = await axios.post('/api/team/add', { player_ign: newPlayerIgn });
      setMessage(response.data.message);
      setNewPlayerIgn('');
      fetchRoster(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add player.');
    }
  };

  const handleRemovePlayer = async (player_ign) => {
    if (window.confirm(`Are you sure you want to remove ${player_ign}? This cannot be undone.`)) {
      try {
        const response = await axios.post('/api/team/remove', { player_ign });
        setMessage(response.data.message);
        fetchRoster(); // Refresh the list
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to remove player.');
      }
    }
  };

  return (
    <div className="my-team-container">
      <h1>My Team Roster</h1>
      <div className="team-management-panel">
        <div className="add-player-form">
          <h3>Add New Player</h3>
          <form onSubmit={handleAddPlayer}>
            <input 
              type="text" 
              value={newPlayerIgn}
              onChange={(e) => setNewPlayerIgn(e.target.value)}
              placeholder="Enter player's exact In-Game Name" 
            />
            <button type="submit" className="btn-primary">Add to Roster</button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
        <div className="roster-list">
          <h3>Current Roster</h3>
          {roster.length > 0 ? (
            <ul>
              {roster.map(ign => (
                <li key={ign}>
                  <span>{ign}</span>
                  <button onClick={() => handleRemovePlayer(ign)} className="remove-btn">
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your roster is empty. Add a player to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTeamPage;