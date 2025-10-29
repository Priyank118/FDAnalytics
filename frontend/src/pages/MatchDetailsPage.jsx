import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/StatCard';
import AddPerformanceModal from '../components/AddPerformanceModal'; // Import the add player modal
import './MatchDetailsPage.css'; // Ensure CSS is imported
import { FaCrosshairs, FaUserFriends, FaHeartbeat, FaMedkit, FaHistory, FaStar, FaUndo, FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';

// --- Reusable Edit Form Component ---
const EditPerformanceForm = ({ performance, roster, onSave, onCancel, onDelete }) => {
  // Convert survival seconds to minutes and seconds for the form
  const initialMinutes = Math.floor((performance.survival_time_sec || 0) / 60);
  const initialSeconds = Math.floor((performance.survival_time_sec || 0) % 60);

  const [editData, setEditData] = useState({
    player_ign: performance.player_ign || '',
    kills: performance.kills ?? '',
    assists: performance.assists ?? '',
    damage: performance.damage ?? '',
    revives: performance.revives ?? '',
    survival_minutes: initialMinutes,
    survival_seconds: initialSeconds,
    recall: performance.recall ?? '',
    rating: performance.rating ?? '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setMessage('Saving...');
    try {
      // Send the data, including separate minutes and seconds
      const payload = {
          player_ign: editData.player_ign, // Send the potentially edited name
          kills: parseInt(editData.kills) || 0,
          assists: parseInt(editData.assists) || 0,
          damage: parseInt(editData.damage) || 0,
          revives: parseInt(editData.revives) || 0,
          survival_minutes: parseInt(editData.survival_minutes) || 0, // Send M/S for backend conversion
          survival_seconds: parseInt(editData.survival_seconds) || 0,
          recall: parseInt(editData.recall) || 0,
          rating: parseFloat(editData.rating) || 0.0,
      };
      await axios.put(`/api/performances/${performance.id}`, payload); // Send the full payload
      setMessage('Saved successfully!');
      onSave(performance.id, payload); // Notify parent (parent will refetch)
    } catch (error) {
        setMessage(error.response?.data?.message || 'Save failed.');
        console.error("Save Error:", error.response || error);
    }
  };

  const handleDeleteClick = () => {
      if (window.confirm(`Are you sure you want to delete this performance record for ${performance.player_ign}?`)) {
          onDelete(performance.id);
      }
  }

  return (
    <div className="edit-mode-container">
      <div className="edit-grid full">
        <div className="edit-stat-input">
            <label>Player IGN</label>
            {/* Dropdown for IGN */}
            <select name="player_ign" value={editData.player_ign} onChange={handleChange}>
                {roster.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
        </div>
        <div className="edit-stat-input"><label>Kills</label><input type="number" name="kills" value={editData.kills} onChange={handleChange} /></div>
        <div className="edit-stat-input"><label>Assists</label><input type="number" name="assists" value={editData.assists} onChange={handleChange} /></div>
        <div className="edit-stat-input"><label>Damage</label><input type="number" name="damage" value={editData.damage} onChange={handleChange} /></div>
        <div className="edit-stat-input"><label>Revives</label><input type="number" name="revives" value={editData.revives} onChange={handleChange} /></div>
        <div className="edit-stat-input time">
            <label>Survived</label>
            <div>
                <input type="number" name="survival_minutes" value={editData.survival_minutes} onChange={handleChange} placeholder="Min"/>m
                <input type="number" name="survival_seconds" value={editData.survival_seconds} onChange={handleChange} placeholder="Sec"/>s
            </div>
        </div>
        <div className="edit-stat-input"><label>Recall</label><input type="number" name="recall" value={editData.recall} onChange={handleChange} /></div>
        <div className="edit-stat-input"><label>Rating</label><input type="number" step="0.1" name="rating" value={editData.rating} onChange={handleChange} /></div>
      </div>
      <div className="edit-actions">
        {message && <span style={{marginRight: 'auto', fontStyle: 'italic', color: message.includes('success') ? 'lightgreen' : '#ff6b6b'}}>{message}</span>}
        <button onClick={handleDeleteClick} className="delete-btn"><FaTrash /> Delete Record</button>
        <button onClick={onCancel} className="btn-secondary"><FaTimes /> Cancel</button>
        <button onClick={handleSave} className="btn-primary"><FaSave /> Save</button>
      </div>
    </div>
  );
};


// --- Main Page Component ---
function MatchDetailsPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [matchEvent, setMatchEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [roster, setRoster] = useState([]); // State for team roster
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerEditData, setHeaderEditData] = useState({ map_name: '', team_rank: '' });

  const bgmiMaps = ['Erangel', 'Miramar', 'Sanhok', 'Livik', 'Karakin', 'Vikendi', 'Nusa'];

  // Fetch data function
  const fetchMatchDetails = async () => {
    // No need for setLoading(true) here as it's handled in the main useEffect
    setError('');
    try {
        const [matchRes, rosterRes] = await Promise.all([
            axios.get(`/api/matches/${matchId}`),
            axios.get('/api/team') // Fetch the roster
        ]);
        setMatchEvent(matchRes.data);
        setRoster(rosterRes.data);
        setHeaderEditData({
            map_name: matchRes.data?.map_name || '',
            team_rank: matchRes.data?.team_rank || ''
        });
    } catch (err) {
      setError('Failed to load page data.'); console.error("Fetch Error:", err);
    } finally {
      // setLoading(false) should be in the useEffect that calls this
    }
  };

  // Fetch data on load and when matchId changes
  useEffect(() => {
    setLoading(true); // Set loading true only when starting the fetch sequence
    fetchMatchDetails().finally(() => setLoading(false));
  }, [matchId]);

  // Handle successful save from player edit form
  const handleSaveEdit = (performanceId, updatedData) => {
      setEditingPlayerId(null);
      fetchMatchDetails(); // Refetch the entire match details after saving
  };

  // Handle deleting a single performance record
  const handleDeletePerformance = async (performanceId) => {
      try {
          await axios.delete(`/api/performances/${performanceId}`);
          fetchMatchDetails(); // Refetch data
          if (matchEvent && matchEvent.performances.length === 1) {
              navigate('/dashboard/history');
          }
      } catch (error) {
          setError("Failed to delete performance record.");
          console.error("Delete Error:", error.response || error);
      }
  };

   // Handle successfully adding a new player
  const handlePlayerAdded = () => {
    setIsAddPlayerModalOpen(false);
    fetchMatchDetails();
  };

   // --- Header Edit Functions ---
  const handleHeaderEditClick = () => {
    setIsEditingHeader(true);
  };
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderEditData(prev => ({ ...prev, [name]: value }));
  };
  const handleHeaderSave = async () => {
    try {
      await axios.put(`/api/matches/${matchId}`, headerEditData);
      setMatchEvent(prev => ({ ...prev, ...headerEditData }));
      setIsEditingHeader(false);
    } catch (err) {
      setError("Failed to update match info.");
      console.error("Header Save Error:", err.response || err);
    }
  };
  // --- End Header Edit Functions ---

  // Render states
  if (loading) return <div className="loading-text">Loading Match Details...</div>;
  if (error) return <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>;
  if (!matchEvent) return <p>Match not found.</p>;

  return (
    <div className="details-page-container">
      <Link to="/dashboard/history" className="back-link">&larr; Back to Matches History</Link>
      
      {/* Header Section */}
      <header className="details-header editable-header">
        {isEditingHeader ? (
          <div className="header-edit-form">
            <h1>Edit Match #{matchEvent.id} Info</h1>
            <select name="map_name" value={headerEditData.map_name} onChange={handleHeaderChange}>
                {bgmiMaps.map(map => <option key={map} value={map}>{map}</option>)}
            </select>
            <input name="team_rank" type="number" value={headerEditData.team_rank} onChange={handleHeaderChange} placeholder="Rank"/>
            <button onClick={handleHeaderSave} className="action-btn"><FaSave /> Save</button>
            <button onClick={() => setIsEditingHeader(false)} className="delete-btn"><FaTimes /> Cancel</button>
          </div>
        ) : (
          <>
           {/* --- THIS IS THE FIX --- */}
            <div className="header-title-group">
              <h1>Match #{matchEvent.id} Details</h1>
              <button onClick={handleHeaderEditClick} className="action-btn header-edit-btn">
                <FaEdit /> Edit Match Info
              </button>
            </div>
            {/* --- END FIX --- */}
            <div className="header-meta">
              <div className="meta-item">Date<span>{matchEvent.match_date ? matchEvent.match_date.split(' ')[0] : 'N/A'}</span></div>
              <div className="meta-item">Map<span>{matchEvent.map_name || 'N/A'}</span></div>
              <div className="meta-item">Rank<span>#{matchEvent.team_rank || 'N/A'}</span></div>
            </div>
          </>
        )}
      </header>

      {/* Player Performance Sections */}
      {matchEvent.performances && matchEvent.performances.map((player) => {
        const displayMinutes = Math.floor((player.survival_time_sec || 0) / 60);
        const displaySeconds = Math.floor((player.survival_time_sec || 0) % 60);
        const displaySurvival = `${displayMinutes}m ${displaySeconds}s`;

        return (
          <div key={player.id} className="player-performance-section">
            <div className="player-header">
              <h2>Performance for: {player.player_ign}</h2>
              {editingPlayerId !== player.id && (
                <button className="action-btn" onClick={() => setEditingPlayerId(player.id)}>
                  <FaEdit /> Edit Stats
                </button>
              )}
            </div>
            {editingPlayerId === player.id ? (
              <EditPerformanceForm
                performance={player}
                roster={roster} // Pass roster for dropdown
                onSave={handleSaveEdit}
                onCancel={() => setEditingPlayerId(null)}
                onDelete={handleDeletePerformance}
              />
            ) : (
              <div className="details-grid">
                <StatCard icon={<FaCrosshairs />} title="Kills" value={player.kills ?? 'N/A'} />
                <StatCard icon={<FaUserFriends />} title="Assists" value={player.assists ?? 'N/A'} />
                <StatCard icon={<FaHeartbeat />} title="Damage Dealt" value={player.damage ?? 'N/A'} />
                <StatCard icon={<FaMedkit />} title="Revives (Rescue)" value={player.revives ?? 'N/A'} />
                <StatCard icon={<FaHistory />} title="Survived" value={displaySurvival} />
                <StatCard icon={<FaUndo />} title="Recall" value={player.recall ?? 'N/A'} />
                <StatCard icon={<FaStar />} title="Rating" value={player.rating ?? 'N/A'} />
              </div>
              
            )}
            {player.recommendations && player.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h4>Recommendations:</h4>
                <ul>
                  {player.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Missing Player Section */}
      <div className="add-player-section">
          <button className="btn-secondary" onClick={() => setIsAddPlayerModalOpen(true)}>
              ➕ Add Missing Player Stats
          </button>
      </div>

      {/* Render the Add Player Modal */}
      <AddPerformanceModal
          isOpen={isAddPlayerModalOpen}
          onRequestClose={() => setIsAddPlayerModalOpen(false)}
          matchId={matchId}
          onPlayerAdded={handlePlayerAdded}
          roster={roster} // Pass roster for dropdown
          currentPerformances={matchEvent?.performances || []} // Pass current players to filter dropdown
      />
    </div>
  );
}

export default MatchDetailsPage;