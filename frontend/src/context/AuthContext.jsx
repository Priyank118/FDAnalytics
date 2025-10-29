import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // We start in a loading state

  // This effect runs once when the app starts to check for an active session
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // We ask the server for our status
        const response = await axios.get('http://localhost:5000/api/status');
        // If successful, the server sends user data, and we set it
        setUser(response.data);
      } catch (error) {
        // If it fails (like a 401 error), we know we're not logged in
        setUser(null);
      } finally {
        // No matter what, we are done loading
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await axios.post('http://localhost:5000/api/logout');
    setUser(null);
  };

  // We pass down the user, the loading status, and the functions
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  return useContext(AuthContext);
};