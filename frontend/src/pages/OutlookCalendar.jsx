import React, { useState, useEffect } from 'react';
import { getCalendarEvents } from '../api';
import './OutlookCalendar.css';

export default function OutlookCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getCalendarEvents();
      setEvents(response.data);
    } catch (err) {
      console.error('Error loading calendar events:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="calendar-container">Loading calendar events...</div>;
  }

  return (
    <div className="calendar-container">
      <h1>📅 Outlook Calendar</h1>
      <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.subject}</h3>
              <p className="event-time">
                {new Date(event.start.dateTime).toLocaleString()} - 
                {new Date(event.end.dateTime).toLocaleString()}
              </p>
              {event.location?.displayName && (
                <p className="event-location">📍 {event.location.displayName}</p>
              )}
            </div>
          ))
        ) : (
          <p>No calendar events found.</p>
        )}
      </div>
    </div>
  );
}   