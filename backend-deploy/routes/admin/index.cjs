/**
 * Admin API Routes Index
 * Centralized module for all admin-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import admin modules
const usersRoutes = require('./users.cjs');

// Mount routes
router.use('/users', usersRoutes);

// Health check for admin API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is running',
    timestamp: new Date().toISOString(),
    modules: {
      users: 'active'
    }
  });
});

module.exports = router;
