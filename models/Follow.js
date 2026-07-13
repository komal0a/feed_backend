const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: { // The person clicking "Follow"
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: { // The creator being followed
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// You cannot follow the same person twice
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);