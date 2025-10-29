import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UploadModal from './UploadModal';
import AddMatchModal from './AddMatchModal';
import AdvancedTable from './AdvancedTable'; // 1. Import the new component
import './MatchesHistory.css';

function MatchesHistory() {
  const [matches, setMatches] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [roster, setRoster] = useState([]);

  const fetchData = async () => {
    try {
      const [matchRes, rosterRes] = await Promise.all([
          axios.get('/api/matches'),
          axios.get('/api/team') // Fetch the roster
      ]);
      setMatches(matchRes.data);
      setRoster(rosterRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleDelete = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match event? This will delete stats for all players in this match.')) {
      try {
        await axios.delete(`/api/matches/${matchId}`);
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete match:', error);
      }
    }
  };

  return (
    <>
      <UploadModal isOpen={isUploadModalOpen} onRequestClose={() => setIsUploadModalOpen(false)} onUploadComplete={fetchData} />
      <AddMatchModal isOpen={isManualModalOpen} onRequestClose={() => setIsManualModalOpen(false)} onMatchAdded={fetchData} roster={roster}/>

      <div className="history-container" style={{maxWidth: '100%', flexBasis: '100%'}}>
        <div className="history-header">
          <h3>Matches History</h3>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setIsManualModalOpen(true)}>📝 Add Manually</button>
            <button className="btn-primary" onClick={() => setIsUploadModalOpen(true)}>📄 Upload Result</button>
          </div>
        </div>
        
        {/* 2. Replace the old <table> with our new component */}
        <AdvancedTable data={matches} handleDelete={handleDelete} />

      </div>
    </>
  );
}

export default MatchesHistory;