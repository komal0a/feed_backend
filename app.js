require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Route Imports
const authRoutes = require('./routes/auth');
const reelRoutes = require('./routes/reels');
const feedRoutes = require('./routes/feed');
const userRoutes = require('./routes/users');
const checkoutRoutes = require('./routes/checkout');

const app = express();

// Security & Middleware
app.set('trust proxy', 1); // Required for cookies behind cloud proxies like Render
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Required to accept cross-domain JWT cookies
}));

app.use(express.json());
app.use(cookieParser());

// Route Mounts
app.use('/auth', authRoutes);
app.use('/reels', reelRoutes);
app.use('/api/feed', feedRoutes);
app.use('/users', userRoutes);
app.use('/checkout', checkoutRoutes);

// Export the configured app so server.js can start it
module.exports = app;