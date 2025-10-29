import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Chart.css';

// Register the necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function WinRateDonutChart({ stats }) {
  // Calculate wins and losses from the stats object
  const total_wins = Math.round((stats.total_matches * stats.win_rate) / 100);
  const total_losses = stats.total_matches - total_wins;

  const data = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        label: 'Matches',
        data: [total_wins, total_losses],
        backgroundColor: [
          'rgba(0, 170, 255, 0.7)',  // Blue for Wins
          'rgba(255, 255, 255, 0.1)', // Muted color for Losses
        ],
        borderColor: [
          'rgba(0, 170, 255, 1)',
          'rgba(255, 255, 255, 0.2)',
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: '70%', // This makes it a "donut" chart
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#b0c4de',
          font: {
            size: 14,
          },
          boxWidth: 20,
          padding: 20,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
      <h2>Win Overview</h2>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '52%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{stats.win_rate}%</div>
        <div style={{ fontSize: '1rem', color: '#b0c4de' }}>Win Rate</div>
      </div>
    </div>
  );
}

export default WinRateDonutChart;