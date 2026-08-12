const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { getRecentActivity } = require('../services/notificationService');

const myDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [listingsCount, activeBookings, completedBookings, pendingIncoming] = await Promise.all([
    Listing.countDocuments({ owner: userId, status: { $ne: 'removed' } }),
    Booking.countDocuments({ $or: [{ owner: userId }, { requester: userId }], status: { $in: ['pending', 'approved'] } }),
    Booking.countDocuments({ $or: [{ owner: userId }, { requester: userId }], status: 'completed' }),
    Booking.countDocuments({ owner: userId, status: 'pending' }),
  ]);

  const bookingsByCategory = await Booking.aggregate([
    { $match: { $or: [{ owner: userId }, { requester: userId }] } },
    { $lookup: { from: 'listings', localField: 'listing', foreignField: '_id', as: 'listing' } },
    { $unwind: '$listing' },
    { $group: { _id: '$listing.category', count: { $sum: 1 } } },
    { $project: { category: '$_id', count: 1, _id: 0 } },
  ]);

  res.json({
    success: true,
    data: {
      listingsCount,
      activeBookings,
      completedBookings,
      pendingIncoming,
      trustScore: req.user.trustScore,
      bookingsByCategory,
    },
  });
});

const adminOverview = asyncHandler(async (req, res) => {
  const [totalUsers, totalListings, totalBookings, activeListings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({ status: { $ne: 'removed' } }),
    Booking.countDocuments(),
    Listing.countDocuments({ status: 'available' }),
  ]);

  const listingsByCategory = await Listing.aggregate([
    { $match: { status: { $ne: 'removed' } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { category: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);

  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const bookingsOverTime = await Booking.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $project: { date: '$_id', count: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ]);

  const topTrustedUsers = await User.find().sort({ trustScore: -1 }).limit(5).select('name trustScore avatarColor');

  res.json({
    success: true,
    data: {
      totalUsers,
      totalListings,
      totalBookings,
      activeListings,
      listingsByCategory,
      bookingsByStatus,
      bookingsOverTime,
      topTrustedUsers,
      recentActivity: getRecentActivity().slice(0, 15),
    },
  });
});

module.exports = { myDashboard, adminOverview };
