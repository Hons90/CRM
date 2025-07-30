import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { getAppointments } from '../api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './OutlookCalendar.css';

const localizer = momentLocalizer(moment);

export default function OutlookCalendar() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    contactId: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getAppointments();
      const formattedEvents = response.data.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
        resource: appointment
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
    setEventForm({
      title: event.resource.title,
      description: event.resource.description || '',
      startTime: moment(event.resource.startTime).format('YYYY-MM-DDTHH:mm'),
      endTime: moment(event.resource.endTime).format('YYYY-MM-DDTHH:mm'),
      contactId: event.resource.contactId || ''
    });
    setShowEventModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      startTime: moment(start).format('YYYY-MM-DDTHH:mm'),
      endTime: moment(end).format('YYYY-MM-DDTHH:mm'),
      contactId: ''
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    
    const eventData = {
      title: eventForm.title,
      description: eventForm.description,
      startTime: new Date(eventForm.startTime).toISOString(),
      endTime: new Date(eventForm.endTime).toISOString(),
      contactId: eventForm.contactId ? parseInt(eventForm.contactId) : null
    };

    try {
      const url = selectedEvent 
        ? `/api/appointments/${selectedEvent.id}`
        : '/api/appointments';
      
      const method = selectedEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        closeModal();
        loadEvents();
      } else {
        alert('Failed to save event');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Failed to save event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/appointments/${selectedEvent.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        closeModal();
        loadEvents();
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      contactId: ''
    });
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#091C47',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return <div className="loading">Loading calendar events...</div>;
  }

  return (
    <div className="outlook-calendar-container">
      <div className="calendar-header">
        <h1>📅 Outlook Calendar</h1>
        <div className="view-controls">
          <button 
            className={`view-button ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Day
          </button>
          <button 
            className={`view-button ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button 
            className={`view-button ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          popup
          views={['month', 'week', 'day']}
        />
      </div>

      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedEvent ? 'Edit Event' : 'Create New Event'}</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSaveEvent} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Enter event description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                {selectedEvent && (
                  <button 
                    type="button" 
                    className="delete-button"
                    onClick={handleDeleteEvent}
                  >
                    Delete Event
                  </button>
                )}
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}      