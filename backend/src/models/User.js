const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    bio: { type: String, default: '', maxlength: 300 },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    avatarColor: { type: String, default: '#4F46E5' },
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    bio: this.bio,
    trustScore: this.trustScore,
    avatarColor: this.avatarColor,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
