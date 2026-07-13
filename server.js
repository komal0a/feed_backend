const app = require('./app');
const mongoose = require('mongoose');

// Use Render's port if available, otherwise default to 3000 locally
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to the Matrix (MongoDB)');
    
    // Only start accepting API requests AFTER the database is successfully connected
    app.listen(PORT, () => {
      console.log(`Server is live and listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed', err);
    process.exit(1); // Kill the server if the database fails to connect
  });