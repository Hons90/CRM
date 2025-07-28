const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express(); // <--- Moved this up

// Enable CORS for frontend (adjust origin if needed)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// JSON Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug middleware for logging requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Test route


// Routers
const authRouter = require('./routes/auth');
const contactsRouter = require('./routes/contacts');
const dialerPoolsRouter = require('./routes/dialerPools');
const appointmentsRouter = require('./routes/appointments');
const dashboardRouter = require('./routes/dashboard');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/dialer-pools', dialerPoolsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/dashboard', dashboardRouter);

// Download endpoint to force file download
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const file = path.join(__dirname, 'uploads', filename);
  res.download(file, filename, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = 5050
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
