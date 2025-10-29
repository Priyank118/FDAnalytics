import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Chart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function KillsBarChart({ chartData }) {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Kills per Match',
        data: chartData.kills_data,
        backgroundColor: 'rgba(0, 170, 255, 0.6)',
        borderColor: 'rgba(0, 170, 255, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#b0c4de' },
        grid: { color: 'rgba(176, 196, 222, 0.1)' }
      },
      x: {
        ticks: { color: '#b0c4de' },
        grid: { color: 'rgba(176, 196, 222, 0.1)' }
      },
    },
  };

  return (
    <div className="chart-container">
        <h2>Recent Kills Performance</h2>
        <Bar options={options} data={data} />
    </div>
  );
}

export default KillsBarChart;