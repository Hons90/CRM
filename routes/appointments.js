const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const appointmentsController = require('../controllers/appointmentsController');

// All appointments routes now require a valid token
router.use(auth);

router.post('/', appointmentsController.createAppointment);
router.get('/', appointmentsController.getUserAppointments);
router.get('/all', appointmentsController.getAllAppointments);
router.put('/:id', appointmentsController.updateAppointment);
router.delete('/:id', appointmentsController.deleteAppointment);

module.exports = router;
