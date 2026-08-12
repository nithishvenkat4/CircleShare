require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load event subscribers (registers EventEmitter listeners as a side effect)
require('./services/notificationService');

const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CircleShare API is running', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[server] CircleShare API listening on port ${PORT}`));
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
