const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['booking_requested', 'booking_approved', 'booking_rejected', 'booking_completed', 'listing_created'],
      required: true,
    },
    message: { type: String, required: true },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
