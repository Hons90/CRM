const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const callsController = require('../controllers/callsController');

router.use(auth);

router.post('/dial', callsController.dialNumber);
router.post('/:id/qualify', callsController.qualifyCall);
router.get('/logs', callsController.getCallLogs);

module.exports = router;
