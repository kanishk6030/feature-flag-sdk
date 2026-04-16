const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
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

module.exports = mongoose.model('Flag', flagSchema);