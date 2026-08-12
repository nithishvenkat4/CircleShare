const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Books', 'Sports', 'Tools', 'Tutoring', 'Music', 'Design', 'Other'],
    },
    type: { type: String, required: true, enum: ['lend', 'exchange', 'skill'] },
    status: { type: String, enum: ['available', 'booked', 'completed', 'removed'], default: 'available' },
    tags: [{ type: String, trim: true, lowercase: true }],
    accentColor: { type: String, default: '#4F46E5' },
    locationHint: { type: String, default: 'Campus', maxlength: 80 },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
