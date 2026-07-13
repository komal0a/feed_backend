// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from the cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user and attach to the request object
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user deleted' });
    }

    // 4. Move to the next function (the actual API route)
    next();

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

module.exports = { protectRoute };