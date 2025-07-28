import React, { useState, useEffect } from 'react';
import { getAppointments } from '../api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error('Failed to fetch appointments:', err));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Appointments</h2>
      {appointments.length === 0 && <p>No appointments found.</p>}
      {appointments.map((app) => (
        <div key={app.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>{app.title}</strong> ({app.status})</p>
          <p>{new Date(app.startTime).toLocaleString()} - {new Date(app.endTime).toLocaleString()}</p>
          <p>{app.description}</p>
        </div>
      ))}
    </div>
  );
} 