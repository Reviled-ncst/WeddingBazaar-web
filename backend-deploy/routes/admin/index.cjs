/**
 * Admin API Routes Index
 * Centralized module for all admin-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import admin modules with error handling
let usersRoutes, bookingsRoutes;

try {
  console.log('🔍 Loading admin users routes...');
  usersRoutes = require('./users.cjs');
  console.log('✅ Users routes loaded successfully');
  console.log('   - Type:', typeof usersRoutes);
  console.log('   - Is router:', usersRoutes?.stack !== undefined);
  
  if (!usersRoutes || typeof usersRoutes !== 'function') {
    throw new Error('Users routes did not export a valid Express router');
  }
} catch (error) {
  console.error('❌ Failed to load admin users routes:', error);
  throw error;
}

try {
  console.log('🔍 Loading admin bookings routes...');
  bookingsRoutes = require('./bookings.cjs');
  console.log('✅ Bookings routes loaded successfully');
  console.log('   - Type:', typeof bookingsRoutes);
  console.log('   - Is router:', bookingsRoutes?.stack !== undefined);
  
  if (!bookingsRoutes || typeof bookingsRoutes !== 'function') {
    throw new Error('Bookings routes did not export a valid Express router');
  }
} catch (error) {
  console.error('❌ Failed to load admin bookings routes:', error);
  throw error;
}

// Mount routes
router.use('/users', usersRoutes);
router.use('/bookings', bookingsRoutes);

// Health check for admin API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API is running',
    timestamp: new Date().toISOString(),
    modules: {
      users: 'active',
      bookings: 'active'
    }
  });
});

module.exports = router;
