import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../api';

export default function Dashboard() {
  const [data, setData] = useState({ leaderboard: [], callStats: {}, appointmentsToday: [] });

  useEffect(() => {
    getDashboardData()
      .then((res) => setData(res.data))
      .catch((err) => console.error('Failed to load dashboard:', err));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px', flex: 1 }}>
          <h3>Leaderboard</h3>
          {data.leaderboard.length === 0 ? <p>No sales data.</p> :
            <ul>
              {data.leaderboard.map((entry, i) => (
                <li key={i}>User {entry.userId}: ${entry._sum.amount}</li>
              ))}
            </ul>}
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px', flex: 1 }}>
          <h3>Call Stats</h3>
          <p>Answered: {data.callStats.answered || 0}</p>
          <p>Missed: {data.callStats.missed || 0}</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px', flex: 1 }}>
          <h3>Appointments Today</h3>
          {data.appointmentsToday.length === 0 ? <p>No appointments today.</p> :
            data.appointmentsToday.map((app) => <p key={app.id}>{app.title}</p>)}
        </div>
      </div>
    </div>
  );
} 