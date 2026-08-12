const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const eventBus = require('../services/eventBus');

const createBooking = asyncHandler(async (req, res) => {
  const { listingId, message, startDate, endDate } = req.body;
  if (!listingId || !startDate || !endDate) {
    throw new ApiError(400, 'listingId, startDate and endDate are required');
  }

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.owner) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot book your own listing');
  }
  if (listing.status !== 'available') {
    throw new ApiError(400, 'This listing is not currently available');
  }

  const booking = await Booking.create({
    listing: listing._id,
    requester: req.user._id,
    owner: listing.owner,
    message: message || '',
    startDate,
    endDate,
  });

  eventBus.emit('booking:requested', { booking, listingTitle: listing.title });

  res.status(201).json({ success: true, data: booking });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const { role = 'requester', status } = req.query;
  const field = role === 'owner' ? 'owner' : 'requester';
  const query = { [field]: req.user._id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('listing', 'title category type accentColor')
    .populate('requester', 'name avatarColor trustScore')
    .populate('owner', 'name avatarColor trustScore')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['approved', 'rejected', 'completed', 'cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);

  const booking = await Booking.findById(req.params.id).populate('listing');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = String(booking.owner) === String(req.user._id);
  const isRequester = String(booking.requester) === String(req.user._id);

  if (['approved', 'rejected'].includes(status) && !isOwner) {
    throw new ApiError(403, 'Only the listing owner can approve or reject a request');
  }
  if (status === 'cancelled' && !isRequester) {
    throw new ApiError(403, 'Only the requester can cancel a request');
  }
  if (status === 'completed' && !isOwner) {
    throw new ApiError(403, 'Only the listing owner can mark a booking completed');
  }

  booking.status = status;
  await booking.save();

  if (status === 'approved') {
    await Listing.findByIdAndUpdate(booking.listing._id, { status: 'booked' });
  }
  if (['completed', 'rejected', 'cancelled'].includes(status)) {
    await Listing.findByIdAndUpdate(booking.listing._id, {
      status: status === 'completed' ? 'completed' : 'available',
    });
  }
  if (status === 'completed') {
    await User.findByIdAndUpdate(booking.requester, { $inc: { trustScore: 3 } });
    await User.findByIdAndUpdate(booking.owner, { $inc: { trustScore: 2 } });
  }

  eventBus.emit('booking:statusChanged', { booking, listingTitle: booking.listing.title });

  res.json({ success: true, data: booking });
});

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status !== 'completed') throw new ApiError(400, 'Can only review completed bookings');

  const isParticipant =
    String(booking.requester) === String(req.user._id) || String(booking.owner) === String(req.user._id);
  if (!isParticipant) throw new ApiError(403, 'You were not part of this booking');

  const reviewee = String(booking.requester) === String(req.user._id) ? booking.owner : booking.requester;

  const review = await Review.create({
    booking: booking._id,
    reviewer: req.user._id,
    reviewee,
    rating,
    comment: comment || '',
  });

  res.status(201).json({ success: true, data: review });
});

module.exports = { createBooking, getMyBookings, updateBookingStatus, addReview };
