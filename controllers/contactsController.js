const prisma = require('../prisma/client');
const path = require('path');

exports.createContact = async (req, res, next) => {
  try {
    const { type, first_name, last_name, mobile, email, companyName, notes } = req.body;

    if (!type || !mobile) {
      return res.status(400).json({ error: 'Type and mobile are required.' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Missing user ID in token.' });
    }

    const newContact = await prisma.contact.create({
      data: {
        type,
        firstName: first_name || null,
        lastName: last_name || null,
        mobile,
        email: email || null,
        companyName: companyName || null,
        notes: notes || null,
        createdBy: userId
      }
    });

    res.status(201).json(newContact);
  } catch (err) {
    console.error('Error creating contact:', err);
    next(err);
  }
};

exports.getAllContacts = async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { isDeleted: false },
      include: { documents: true }
    });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    next(err);
  }
};

exports.getContactById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { documents: true }
    });

    if (!contact || contact.isDeleted) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    res.json(contact);
  } catch (err) {
    console.error('Error fetching contact by ID:', err);
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { type, first_name, last_name, mobile, email, companyName, notes } = req.body;

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        type: type || undefined,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        mobile: mobile || undefined,
        email: email || undefined,
        companyName: companyName || undefined,
        notes: notes || undefined,
      }
    });

    res.json(updatedContact);
  } catch (err) {
    console.error('Error updating contact:', err);
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.contact.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Contact soft-deleted successfully.' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    next(err);
  }
};

exports.uploadDocuments = async (req, res, next) => {
  try {
    const contactId = Number(req.params.id);
    const userId    = req.user.id;
    const files     = req.files; // multer.array('documents')
    const created   = [];
    for (let f of files) {
      created.push(
        await prisma.contactDocument.create({
          data: {
            contactId,
            documentType: f.originalname,
            filePath: `uploads/${f.filename}`,
            uploadedBy: userId,
          }
        })
      );
    }
    res.status(201).json(created);
  } catch (err) { next(err) }
};

exports.listDocuments = async (req, res, next) => {
  try {
    const contactId = Number(req.params.id);
    const docs = await prisma.contactDocument.findMany({
      where: { contactId, isDeleted: false },
      orderBy: { uploadedAt: 'desc' },
    });
    res.json(docs);
  } catch (err) { next(err) }
};
