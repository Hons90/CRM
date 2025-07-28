const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// Health check/test endpoint
router.get('/test', (req, res) => {
  console.log("Auth test route hit");
  res.json({ message: 'Auth route is working!' });
});

// POST /api/auth/login
router.post('/login', authController.login);

// Update current user profile
router.put('/users/me', auth, authController.updateMe);

module.exports = router;
