// routes/users.js
const express = require('express');
const User = require('../models/User');
const Reel = require('../models/reel');
const Like = require('../models/Like');

const router = express.Router();

// --- GET /users/:id/profile ---
router.get('/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Fetch basic user info (excluding the password!)
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Fetch the videos this user created
    const uploads = await Reel.find({ creator: userId }).sort({ createdAt: -1 });

    // 3. Fetch the videos this user liked
    // We use .populate() to pull the actual Reel data out of the Like junction table
    const likes = await Like.find({ user: userId })
      .populate('reel')
      .sort({ createdAt: -1 });
    
    // Clean up the likes array to just return the reel objects
    const likedReels = likes
      .map(like => like.reel)
      .filter(reel => reel !== null); // Filter out any deleted videos

    res.json({
      user,
      uploads,
      likedReels
    });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

module.exports = router;