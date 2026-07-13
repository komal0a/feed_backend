const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  restaurant: String,
  dishName: String,
  price: String,
  location: {
    type: {
      type: String,
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  // Denormalized counters to save DB queries on the main feed
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 }
}, { timestamps: true });

// The geospatial index for the hyper-local feed
reelSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Reel || mongoose.model('Reel', reelSchema);