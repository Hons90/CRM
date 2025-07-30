import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Contacts from './pages/Contacts';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';
import OutlookCalendar from './pages/OutlookCalendar';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Calls from './pages/Calls';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  return (
    <Router>
      <Navbar user={user} onLogout={setUser} />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/contacts" element={user ? <Contacts /> : <Navigate to="/login" />} />
        <Route path="/calls" element={user ? <Calls /> : <Navigate to="/login" />} />
        <Route path="/appointments" element={user ? <Appointments /> : <Navigate to="/login" />} />
        <Route path="/outlook-calendar" element={user ? <OutlookCalendar /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
