// routes/reels.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const Reel = require('../models/reel');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer to save files to the 'temp' directory
const upload = multer({ dest: 'temp/' });

// --- POST /reels (Upload a new video) ---
// Note: 'video' is the name of the form-data field the frontend will send
router.post('/', protectRoute, upload.single('video'), async (req, res) => {
  try {
    // 1. Ensure a file was actually uploaded
     console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { restaurant, dishName, price, lat, lng } = req.body;

    // 2. Upload to Cloudinary
    // We specify resource_type: "video" so Cloudinary knows how to encode it
    const cloudResponse = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'crave_reels' 
    });

    // 3. Delete the temporary file from our local server to free up space
    fs.unlinkSync(req.file.path);

    // 4. Save to MongoDB using our geospatial schema
    const newReel = new Reel({
      creator: req.user._id, // Got this from the protectRoute middleware!
      videoUrl: cloudResponse.secure_url,
      restaurant,
      dishName,
      price,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitude, Latitude]
      }
    });

    await newReel.save();

    res.status(201).json({
      message: 'Reel uploaded successfully',
      reel: newReel
    });

  } catch (error) {
    console.error('Upload Error:', error);
    // Cleanup local file if upload fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload reel' });
  }
});

// --- POST /reels/:id/like (Toggle Like) ---
router.post('/:id/like', protectRoute, async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.user._id;

    // 1. Check if the user already liked this video
    const existingLike = await Like.findOne({ user: userId, reel: reelId });

    if (existingLike) {
      // 2a. If they did, UNLIKE it (Delete the record and decrease the counter)
      await Like.findByIdAndDelete(existingLike._id);
      await Reel.findByIdAndUpdate(reelId, { $inc: { likeCount: -1 } });
      
      return res.json({ message: 'Reel unliked', isLiked: false });
    } else {
      // 2b. If they didn't, LIKE it (Create a record and increase the counter)
      await Like.create({ user: userId, reel: reelId });
      await Reel.findByIdAndUpdate(reelId, { $inc: { likeCount: 1 } });
      
      return res.json({ message: 'Reel liked', isLiked: true });
    }
  } catch (error) {
    console.error('Like Error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// --- POST /reels/:id/comment (Add a Comment) ---
router.post('/:id/comment', protectRoute, async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // 1. Create the comment
    const newComment = await Comment.create({
      user: userId,
      reel: reelId,
      text
    });

    // 2. Increase the comment counter on the reel
    await Reel.findByIdAndUpdate(reelId, { $inc: { commentCount: 1 } });

    // 3. Populate user info so the frontend can immediately show their profile pic/name
    await newComment.populate('user', 'username profilePicture');

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Comment Error:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// --- GET /reels/:id/comments (Fetch Comments) ---
// Notice: No protectRoute here. Anyone can READ comments, even if not logged in.
router.get('/:id/comments', async (req, res) => {
  try {
    // Find all comments for this specific reel, newest first
    const comments = await Comment.find({ reel: req.params.id })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 }); 

    res.json(comments);
  } catch (error) {
    console.error('Fetch Comments Error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

module.exports = router;