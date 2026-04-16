const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  keyHash: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
