const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const colors = ['#4F46E5', '#0EA5E9', '#059669', '#DB2777', '#EA580C', '#7C3AED'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const user = await User.create({ name, email, passwordHash, bio: bio || '', avatarColor });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, data: { user: user.toSafeObject(), token } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = generateToken(user._id);
  res.json({ success: true, data: { user: user.toSafeObject(), token } });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
});

module.exports = { register, login, getMe };
