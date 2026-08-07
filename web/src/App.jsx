import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { apiFetch } from './lib/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (token) {
      // Verify token and fetch user
      apiFetch('/api/auth/me', { token })
        .then(setUser)
        .catch(() => {
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return token && user ? (
    <Dashboard token={token} user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}
