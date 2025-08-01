import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { getDashboardData } from '../api';

export default function Dashboard() {
  const [data, setData] = useState({ leaderboard: [], callStats: {}, appointmentsToday: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardData()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-subtitle">Welcome back! Here's what's happening with your CRM.</div>
      </div>
      
      {loading ? (
        <div className="stats-grid">
          <div className="stat-card skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-number"></div>
          </div>
          <div className="stat-card skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-number"></div>
          </div>
          <div className="stat-card skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-number"></div>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card contacts-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Sales Leaderboard</h3>
              <p className="stat-number">{data.leaderboard.length}</p>
              <div className="stat-trend">Active users</div>
            </div>
          </div>
          <div className="stat-card calls-card">
            <div className="stat-icon">📞</div>
            <div className="stat-content">
              <h3>Call Stats</h3>
              <p className="stat-number">{(data.callStats.answered || 0) + (data.callStats.missed || 0)}</p>
              <div className="stat-trend">{data.callStats.answered || 0} answered, {data.callStats.missed || 0} missed</div>
            </div>
          </div>
          <div className="stat-card appointments-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Appointments Today</h3>
              <p className="stat-number">{data.appointmentsToday.length}</p>
              <div className="stat-trend">Scheduled for today</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}      