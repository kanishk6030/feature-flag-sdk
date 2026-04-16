const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

adminUserSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
