const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const outlookService = require('../services/outlook');

router.use(auth);

router.get('/events', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const events = await outlookService.getCalendarEvents(userId, startDate, endDate);
    res.json(events);
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    next(err);
  }
});

module.exports = router;
