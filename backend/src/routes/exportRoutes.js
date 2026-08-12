const express = require('express');
const { exportBookingsCsv, downloadCertificate } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Streams demo
router.get('/bookings.csv', protect, exportBookingsCsv);
// Buffers demo
router.get('/certificate/:userId', protect, downloadCertificate);

module.exports = router;
