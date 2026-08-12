const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, data: notifications, meta: { unreadCount } });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  res.json({ success: true, data: notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, data: { updated: true } });
});

module.exports = { getNotifications, markRead, markAllRead };
