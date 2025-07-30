class OutlookService {
  async getCalendarEvents(userId, startDate, endDate) {
    console.log(`Fetching calendar events for user ${userId}`);
    return [
      {
        id: 'event_1',
        subject: 'Team Meeting',
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
        location: { displayName: 'Conference Room A' }
      },
      {
        id: 'event_2', 
        subject: 'Client Call',
        start: { dateTime: new Date(Date.now() + 7200000).toISOString() },
        end: { dateTime: new Date(Date.now() + 10800000).toISOString() },
        location: { displayName: 'Virtual' }
      }
    ];
  }
}

module.exports = new OutlookService();
