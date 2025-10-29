import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardOverview from './components/DashboardOverview';
import MatchesHistory from './components/MatchesHistory';
import MatchDetailsPage from './pages/MatchDetailsPage';
import ProfilePage from './pages/ProfilePage';
import MyTeamPage from './pages/MyTeamPage';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public pages with Navbar and Footer --- */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* --- Standalone pages without the main Layout --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* --- Protected dashboard with nested routes --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        >
          <Route index element={<DashboardOverview />} />
          <Route path="history" element={<MatchesHistory />} />
          <Route path="history/:matchId" element={<MatchDetailsPage />} />
          
          {/* Default profile route will be the VIEW page */}
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Settings route will be the EDIT page */}
          <Route path="settings" element={<ProfilePage mode="edit" />} />
          <Route path="my-team" element={<MyTeamPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;