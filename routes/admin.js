const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const adminCheck = require('../middlewares/adminCheck');
const adminController = require('../controllers/adminController');

router.use(auth);
router.use(adminCheck);

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
