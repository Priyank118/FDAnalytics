import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
// The path was likely missing the .jsx extension or had a typo.
// Let's use a clear, correct path.
import DashboardHeader from '../components/DashboardHeader.jsx'; 
import './DashboardPage.css';

function DashboardPage() {
  const location = useLocation();
  
  // Function to get a clean title from the URL path
  const getPageTitle = (pathname) => {
    // This handles nested routes like /dashboard/history/:matchId
    const segments = pathname.split('/').filter(Boolean); // e.g., ['dashboard', 'history', '123']
    const lastSegment = segments[segments.length - 1];

    if (lastSegment === 'dashboard') return 'Overview';
    if (!isNaN(lastSegment)) return `Match #${lastSegment} Details`; // Check if it's a number (ID)

    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ');
  };
  
  const title = getPageTitle(location.pathname);

  return (
    <div className="dashboard-page-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <DashboardHeader title={title} />
        <div className="dashboard-content">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;