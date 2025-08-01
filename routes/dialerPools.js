const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const adminCheck = require('../middlewares/adminCheck');
const path = require('path');
const multer = require('multer');
const dialerPoolsController = require('../controllers/dialerPoolsController');

// Multer config: store in ./uploads, accept only .xlsx
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.xlsx') {
      return cb(new Error('Only .xlsx files are allowed'));
    }
    cb(null, true);
  }
});

// Protect all routes
router.use(auth);

// Create a new dialer pool (admin only)
router.post('/', adminCheck, dialerPoolsController.createPool);

// Upload Excel file to a pool (admin only)
router.post(
  '/:id/upload',
  adminCheck,
  upload.single('file'),
  dialerPoolsController.uploadExcel      // <-- use the correct controller method
);

// Get all dialer pools
router.get('/', dialerPoolsController.getAllPools);

// Get all numbers for a pool
router.get('/:id/numbers', dialerPoolsController.getPoolNumbers);

// Soft-delete a dialer pool (admin only)
router.delete('/:id', adminCheck, dialerPoolsController.deletePool);

module.exports = router;
