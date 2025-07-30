import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './Navbar.css';
import logo from '../../karuslogo.jpeg'; // Adjust path if necessary

export default function Navbar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const currentUser = user ? user.name : 'Guest';

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout(null);
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo Section */}
        <div className="logo-container">
          <img src={logo} alt="Karus Logo" className="karus-logo" />
          <h1 className="logo-text">Karus CRM</h1>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/calls">Calls</Link>
          <Link to="/appointments">Appointments</Link>
          <Link to="/outlook-calendar">Outlook Calendar</Link>
        </div>
        <div className="nav-spacer" />

        {/* User Section */}
        <div className="user-section" onClick={toggleDropdown}>
          <span className="username">{currentUser}</span>
          <FaUserCircle className="user-icon" />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Profile</Link>
              <button className="dropdown-item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}  