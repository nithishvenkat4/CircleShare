const Notification = require('../models/Notification');
const eventBus = require('./eventBus');

// In-memory recent activity log (demonstrates events feeding a lightweight log)
const recentActivity = [];
const MAX_ACTIVITY = 50;

function logActivity(entry) {
  recentActivity.unshift({ ...entry, at: new Date() });
  if (recentActivity.length > MAX_ACTIVITY) recentActivity.pop();
}

function getRecentActivity() {
  return recentActivity;
}

eventBus.on('booking:requested', async ({ booking, listingTitle }) => {
  try {
    await Notification.create({
      user: booking.owner,
      type: 'booking_requested',
      message: `New request for "${listingTitle}"`,
      relatedBooking: booking._id,
    });
    logActivity({ type: 'booking_requested', bookingId: booking._id.toString() });
  } catch (err) {
    console.error('[eventBus] Failed to create booking_requested notification:', err.message);
  }
});

eventBus.on('booking:statusChanged', async ({ booking, listingTitle }) => {
  try {
    const typeMap = {
      approved: 'booking_approved',
      rejected: 'booking_rejected',
      completed: 'booking_completed',
    };
    const type = typeMap[booking.status];
    if (!type) return;
    const verbMap = { approved: 'approved', rejected: 'declined', completed: 'marked completed' };
    await Notification.create({
      user: booking.requester,
      type,
      message: `Your request for "${listingTitle}" was ${verbMap[booking.status]}`,
      relatedBooking: booking._id,
    });
    logActivity({ type, bookingId: booking._id.toString() });
  } catch (err) {
    console.error('[eventBus] Failed to create status-change notification:', err.message);
  }
});

eventBus.on('listing:created', ({ listing }) => {
  logActivity({ type: 'listing_created', listingId: listing._id.toString(), title: listing.title });
});

module.exports = { getRecentActivity };
