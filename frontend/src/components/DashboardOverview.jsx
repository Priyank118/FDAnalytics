import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';
import KillsBarChart from './KillsBarChart';
import WinRateDonutChart from './WinRateDonutChart';
import './DashboardOverview.css';
import { FaGamepad, FaCrosshairs, FaHeartbeat, FaPercentage, FaUserFriends, FaMedkit, FaHistory, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function DashboardOverview() {
  const { user } = useAuth();
  const [roster, setRoster] = useState([]);
  const [selectedIgn, setSelectedIgn] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the team roster
  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const response = await axios.get('/api/players');
        setRoster(response.data);
        if (response.data.length > 0) {
          const userIgn = user?.bgmi_username;
          if (userIgn && response.data.includes(userIgn)) {
            setSelectedIgn(userIgn);
          } else {
            setSelectedIgn(response.data[0]);
          }
        } else {
          setLoading(false); // No roster, so stop loading
        }
      } catch (err) {
        console.error("Failed to fetch roster", err);
        setLoading(false);
      }
    };
    fetchRoster();
  }, [user]);

  // Fetch stats for the selected player
  useEffect(() => {
    if (!selectedIgn) {
      setLoading(false); // Stop loading if no player is selected
      return;
    }
    const fetchStats = async () => {
      setLoading(true); setError('');
      try {
        const response = await axios.get(`/api/stats/overview?player_ign=${selectedIgn}`);
        setStats(response.data);
      } catch (err) {
        setError('Failed to load statistics for this player.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedIgn]);

  // --- THIS IS THE FIX ---
  // Make the formatTime function robust
  const formatTime = (totalSeconds) => {
      if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds === 0) {
          return '0m 0s'; // Return a clean zero
      }
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}m ${seconds}s`;
  };

  if (loading && !stats) {
    return <div className="loading-text">Loading Stats...</div>;
  }
  
  return (
    <div className="overview-container">
      <div className="overview-header">
        <h1>Performance Analytics</h1>
        <div className="player-filter">
          <select value={selectedIgn} onChange={(e) => setSelectedIgn(e.target.value)}>
            {roster.length > 0 ? (
              roster.map(ign => (<option key={ign} value={ign}>{ign}</option>))
            ) : (
              <option disabled>No players on roster</option>
            )}
          </select>
        </div>
      </div>
      {error && <p style={{ color: '#e74c3c' }}>{error}</p>}
      {!stats || stats.total_matches === 0 ? (
        <p style={{color: '#b0c4de', fontSize: '1.2rem'}}>No match data found for {selectedIgn}. Upload a match result to see their stats!</p>
      ) : (
        <>
          <div className="stats-grid full">
            <StatCard icon={<FaGamepad />} title="Total Matches" value={stats.total_matches} />
            <StatCard icon={<FaCrosshairs />} title="Average Kills" value={stats.avg_kills} />
            <StatCard icon={<FaHeartbeat />} title="Average Damage" value={stats.avg_damage} />
            <StatCard icon={<FaUserFriends />} title="Average Assists" value={stats.avg_assists} />
            <StatCard icon={<FaPercentage />} title="Win Rate" value={`${stats.win_rate}%`} />
            <StatCard icon={<FaHistory />} title="Avg. Survival" value={formatTime(stats.avg_survival_time_sec)} />
            <StatCard icon={<FaMedkit />} title="Average Revives" value={stats.avg_revives} />
            <StatCard icon={<FaStar />} title="Average Rating" value={stats.avg_rating} />
          </div>
          <div className="charts-grid">
            <WinRateDonutChart stats={stats} />
            <KillsBarChart chartData={stats.recent_performance} />
          </div>
          {stats.overall_recommendations && stats.overall_recommendations.length > 0 && (
            <div className="recommendations-overview card-style">
              <h3>Tips for Improvement:</h3>
              <ul>
                {stats.overall_recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardOverview;