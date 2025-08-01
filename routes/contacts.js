const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const contactsController = require('../controllers/contactsController');
const upload = require('../middlewares/upload'); // Multer middleware for file uploads

// All contacts routes now require a valid token
router.use(auth);

// CRUD endpoints
router.post('/', contactsController.createContact);
router.get('/', contactsController.getAllContacts);
router.get('/:id', contactsController.getContactById);
router.put('/:id', contactsController.updateContact);
router.delete('/:id', contactsController.deleteContact);

// File uploads (ID card + application forms)
router.post('/:id/documents', upload.array('documents', 3), contactsController.uploadDocuments);

// List documents for a contact
router.get('/:id/documents', auth, contactsController.listDocuments);

module.exports = router;
