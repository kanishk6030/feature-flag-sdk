const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  ownerType: {
    type: String,
    default: 'user'
  },
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
