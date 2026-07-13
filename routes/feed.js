// routes/feed.js
const express = require('express');
const Reel = require('../models/reel');

const router = express.Router();

// --- GET /feed (Get hyper-local videos) ---
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // Default 5km radius

    if (!lat || !lng) {
      return res.status(400).json({ error: "Location coordinates are required" });
    }

    // Fetch videos based on proximity
    const feed = await Reel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitude, Latitude]
          },
          $maxDistance: parseInt(radius) // Distance in meters
        }
      }
    })
    .populate('creator', 'username profilePicture') // Pulls in the uploader's info!
    .limit(10); // Pagination: Just send 10 at a time

    // Map the data to match what our React frontend expects
    const formattedFeed = feed.map(reel => ({
      id: reel._id,
      videoUrl: reel.videoUrl,
      restaurant: reel.restaurant,
      dishName: reel.dishName,
      price: reel.price,
      creator: reel.creator.username, // Now we have the actual username
      likeCount: reel.likeCount,
      commentCount: reel.commentCount,
      lng: reel.location?.coordinates?.[0],
      lat: reel.location?.coordinates?.[1]
    }));

    res.json(formattedFeed);

  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ error: 'Server crashed while fetching the feed' });
  }
});

module.exports = router;