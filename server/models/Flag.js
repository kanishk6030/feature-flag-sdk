const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    unique: false
  },
  type: {
    type: String,
    enum: ['boolean', 'percentage', 'segment'],
    default: 'boolean'
  },
  enabled: {
    type: Boolean,
    default: false
  },
  rolloutPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rules: [{
    attribute: String,
    value: String
  }]
}, { timestamps: true });

flagSchema.index({ ownerId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Flag', flagSchema);