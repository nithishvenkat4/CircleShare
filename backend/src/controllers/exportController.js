const Booking = require('../models/Booking');
const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { streamBookingsAsCsv } = require('../services/csvExport');

// Demonstrates Node.js Streams: exports the current user's booking history as CSV,
// piping rows to the response instead of building the full string in memory.
const exportBookingsCsv = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ $or: [{ owner: req.user._id }, { requester: req.user._id }] })
    .populate('listing', 'title')
    .sort({ createdAt: -1 });

  const rows = bookings.map((b) => ({
    listingTitle: b.listing ? b.listing.title : 'Deleted listing',
    role: String(b.owner) === String(req.user._id) ? 'owner' : 'requester',
    status: b.status,
    startDate: b.startDate,
    endDate: b.endDate,
    createdAt: b.createdAt,
  }));

  streamBookingsAsCsv(res, rows);
});

// Demonstrates Node.js Buffers: builds a small trust certificate as a binary Buffer
// and sends it as a downloadable plain-text file. Isolated technical demo endpoint.
const downloadCertificate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(user._id) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only download your own certificate');
  }

  const text = [
    '==============================================',
    '           CIRCLESHARE TRUST CERTIFICATE',
    '==============================================',
    `Member: ${user.name}`,
    `Member since: ${user.createdAt.toDateString()}`,
    `Trust score: ${user.trustScore} / 100`,
    `Issued: ${new Date().toDateString()}`,
    '==============================================',
    'Generated server-side as a Node.js Buffer.',
  ].join('\n');

  const buffer = Buffer.from(text, 'utf-8');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="trust-certificate-${user._id}.txt"`);
  res.setHeader('Content-Length', buffer.length);
  res.end(buffer);
});

module.exports = { exportBookingsCsv, downloadCertificate };
