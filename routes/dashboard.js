const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// All dashboard routes now require a valid token
router.use(auth);

router.get('/', dashboardController.getDashboard);

module.exports = router;
