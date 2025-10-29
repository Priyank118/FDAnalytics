import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import axios from 'axios';

// --- THIS IS THE FIX ---
axios.defaults.baseURL = 'https://fdanalytics-backend.onrender.com'; // Set base URL for all requests
axios.defaults.withCredentials = true; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);