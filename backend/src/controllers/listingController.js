const Listing = require('../models/Listing');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const eventBus = require('../services/eventBus');

const ACCENTS = ['#4F46E5', '#0EA5E9', '#059669', '#DB2777', '#EA580C', '#7C3AED', '#0891B2', '#CA8A04'];

const getListings = asyncHandler(async (req, res) => {
  const { search, category, type, status, page = 1, limit = 12, mine } = req.query;
  const query = {};

  if (mine === 'true') {
    query.owner = req.user._id;
  } else {
    query.status = status || 'available';
  }
  if (category) query.category = category;
  if (type) query.type = type;
  if (search) query.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

  const [items, total] = await Promise.all([
    Listing.find(query)
      .populate('owner', 'name trustScore avatarColor')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Listing.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 },
  });
});

const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('owner', 'name trustScore avatarColor bio');
  if (!listing) throw new ApiError(404, 'Listing not found');
  res.json({ success: true, data: listing });
});

const createListing = asyncHandler(async (req, res) => {
  const { title, description, category, type, tags, locationHint } = req.body;
  if (!title || !description || !category || !type) {
    throw new ApiError(400, 'title, description, category and type are required');
  }

  const listing = await Listing.create({
    owner: req.user._id,
    title,
    description,
    category,
    type,
    locationHint,
    tags: Array.isArray(tags) ? tags.slice(0, 8) : [],
    accentColor: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
  });

  eventBus.emit('listing:created', { listing });

  res.status(201).json({ success: true, data: listing });
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own listings');
  }

  const editable = ['title', 'description', 'category', 'type', 'status', 'tags', 'locationHint'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });

  await listing.save();
  res.json({ success: true, data: listing });
});

const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (String(listing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own listings');
  }
  await listing.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = { getListings, getListing, createListing, updateListing, deleteListing };
