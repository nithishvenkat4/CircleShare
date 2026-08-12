const express = require('express');
const { createBooking, getMyBookings, updateBookingStatus, addReview } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/mine', protect, getMyBookings);
router.patch('/:id/status', protect, updateBookingStatus);
router.post('/:id/review', protect, addReview);

module.exports = router;
