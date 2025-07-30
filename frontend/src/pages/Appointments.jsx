import React, { useState, useEffect } from 'react';
import { getAppointments } from '../api';
import './Appointments.css';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAppointments()
      .then((res) => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch appointments:', err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'past';
      case 'confirmed': return 'upcoming';
      case 'pending': return 'today';
      default: return 'upcoming';
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>Appointments</h1>
        <p>Manage your scheduled meetings and appointments</p>
      </div>

      {loading ? (
        <div className="appointments-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="appointment-card skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No appointments scheduled</h3>
          <p>Your upcoming appointments will appear here</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => {
            const startDateTime = formatDateTime(appointment.startTime);
            const endDateTime = formatDateTime(appointment.endTime);
            return (
              <div
                key={appointment.id}
                className={`appointment-card ${getStatusColor(appointment.status)}`}
              >
                <div className="appointment-status">
                  <span className="status-indicator"></span>
                  <span className="status-text">{appointment.status || 'Scheduled'}</span>
                </div>
                
                <div className="appointment-content">
                  <h3 className="appointment-title">{appointment.title}</h3>
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{startDateTime.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕒</span>
                      <span>{startDateTime.time} - {endDateTime.time}</span>
                    </div>
                    {appointment.description && (
                      <div className="detail-item">
                        <span className="detail-icon">📝</span>
                        <span>{appointment.description}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="appointment-actions">
                  <button className="action-button edit">Edit</button>
                  <button className="action-button cancel">Cancel</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}     