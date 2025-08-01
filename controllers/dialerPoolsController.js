const prisma = require('../prisma/client');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

exports.createPool = async (req, res, next) => {
  try {
    const { pool_name, uploaded_by } = req.body;

    if (!pool_name) {
      return res.status(400).json({ error: 'Pool name is required.' });
    }

    const pool = await prisma.dialerPool.create({
      data: {
        poolName: pool_name,
        uploadedBy: uploaded_by ? parseInt(uploaded_by) : null
      }
    });

    res.status(201).json(pool);
  } catch (err) {
    console.error('Error creating dialer pool:', err);
    next(err);
  }
};

exports.getAllPools = async (req, res, next) => {
  try {
    const pools = await prisma.dialerPool.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pools);
  } catch (err) {
    console.error('Error fetching dialer pools:', err);
    next(err);
  }
};

exports.getPoolNumbers = async (req, res, next) => {
  try {
    const poolId = parseInt(req.params.id);

    const numbers = await prisma.dialerNumber.findMany({
      where: { poolId, isDeleted: false },
      orderBy: { id: 'asc' }
    });

    res.json(numbers);
  } catch (err) {
    console.error('Error fetching dialer numbers:', err);
    next(err);
  }
};

exports.uploadExcel = async (req, res, next) => {
  try {
    const poolId = parseInt(req.params.id);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const validNumbers = [];

    rows.forEach(row => {
      const phone = row[0] ? row[0].toString().trim() : '';
      if (/^\d+$/.test(phone)) {
        validNumbers.push({ poolId, phoneNumber: phone });
      }
    });

    if (validNumbers.length > 0) {
      await prisma.dialerNumber.createMany({ data: validNumbers });
    }

    fs.unlinkSync(filePath); // Delete file after processing

    res.json({
      message: `Imported ${validNumbers.length} numbers successfully.`,
      totalRows: rows.length
    });
  } catch (err) {
    console.error('Error uploading Excel file:', err);
    next(err);
  }
};

exports.deletePool = async (req, res, next) => {
  try {
    const poolId = parseInt(req.params.id);

    await prisma.dialerPool.update({
      where: { id: poolId },
      data: { isDeleted: true }
    });

    res.json({ message: 'Dialer pool soft-deleted successfully.' });
  } catch (err) {
    console.error('Error deleting dialer pool:', err);
    next(err);
  }
};
