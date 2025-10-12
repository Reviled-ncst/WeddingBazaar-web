/**
 * BACKEND DEPLOYMENT FIX PACKAGE
 * 
 * This file contains all the necessary backend fixes to support the enhanced booking system:
 * 1. Add missing GET /api/bookings/:id endpoint
 * 2. Update status validation to support 16 statuses instead of 4
 * 3. Add database schema fallback handling
 * 4. Add quote-specific API endpoints
 */

// ======================================
// 1. MISSING API ENDPOINTS
// ======================================

/**  
 * Add this to your backend routes/bookings.js file:
 */

// GET /api/bookings/:id - Get individual booking details
router.get('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [API] Getting individual booking:', id);
    
    const booking = await bookingService.getBookingById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      booking: booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error getting individual booking:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/bookings/:id/status - Alternative endpoint for status updates
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, status_reason } = req.body;
    
    console.log('🔄 [API] PUT status update:', { id, status, message, status_reason });
    
    const updatedBooking = await bookingService.updateBookingStatus(id, status, message, status_reason);
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error updating booking status (PUT):', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/:id/quote - Send quote for booking
router.post('/bookings/:id/quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { quoteData, vendorId } = req.body;
    
    console.log('📋 [API] Sending quote for booking:', bookingId);
    
    const result = await bookingService.sendQuote(bookingId, quoteData, vendorId);
    
    res.json({
      success: true,
      booking: result,
      message: 'Quote sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error sending quote:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bookings/:id/accept-quote - Accept quote (client action)
router.post('/bookings/:id/accept-quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { coupleId, message } = req.body;
    
    console.log('✅ [API] Accepting quote for booking:', bookingId);
    
    const result = await bookingService.acceptQuote(bookingId, coupleId, message);
    
    res.json({
      success: true,
      booking: result,
      message: 'Quote accepted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error accepting quote:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ======================================
// 2. ENHANCED STATUS VALIDATION
// ======================================

/**
 * Update your existing PATCH /api/bookings/:id/status endpoint:
 */

router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, status_reason } = req.body;
    
    console.log('🔄 [API] PATCH status update:', { id, status, message, status_reason });
    
    // REMOVE OLD VALIDATION - This is what's causing the 400 errors
    /*
    // OLD CODE - REMOVE THIS:
    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    */
    
    // NEW CODE - Let the service handle validation
    const updatedBooking = await bookingService.updateBookingStatus(id, status, message, status_reason);
    
    res.json({
      success: true,
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [API] Error updating booking status:', error);
    
    // Check if it's a validation error from the service
    if (error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ======================================
// 3. DATABASE MIGRATION SCRIPT
// ======================================

/**
 * Run this SQL in your Neon PostgreSQL database:
 */

const DATABASE_MIGRATION_SQL = `
-- Add missing columns to comprehensive_bookings table
ALTER TABLE comprehensive_bookings 
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS quote_data JSONB,
ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_accepted_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_rejected_date TIMESTAMP;

-- Update any existing bookings to use new status values if needed
-- (This is safe as it only updates NULL or empty values)
UPDATE comprehensive_bookings 
SET status = 'quote_requested' 
WHERE status IS NULL OR status = '';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_status ON comprehensive_bookings(status);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_quote_sent_date ON comprehensive_bookings(quote_sent_date);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_vendor_id ON comprehensive_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_couple_id ON comprehensive_bookings(couple_id);

-- Ensure booking_timeline table exists
CREATE TABLE IF NOT EXISTS booking_timeline (
  id VARCHAR PRIMARY KEY,
  booking_id VARCHAR NOT NULL,
  actor_id VARCHAR,
  actor_type VARCHAR DEFAULT 'system',
  action VARCHAR NOT NULL,
  old_status VARCHAR,
  new_status VARCHAR,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES comprehensive_bookings(id) ON DELETE CASCADE
);

-- Add index for timeline
CREATE INDEX IF NOT EXISTS idx_booking_timeline_booking_id ON booking_timeline(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_timeline_created_at ON booking_timeline(created_at);
`;

// ======================================
// 4. DEPLOYMENT CHECKLIST
// ======================================

/**
 * DEPLOYMENT STEPS:
 * 
 * 1. Update Backend Files:
 *    - Replace services/bookingService.js with enhanced version
 *    - Replace services/bookingService.ts with enhanced version  
 *    - Add missing API endpoints to routes/bookings.js
 *    - Remove old status validation from PATCH endpoint
 * 
 * 2. Database Migration:
 *    - Run the DATABASE_MIGRATION_SQL in Neon PostgreSQL
 *    - Verify new columns are added
 * 
 * 3. Deploy to Render:
 *    - Commit all changes to Git
 *    - Push to main branch
 *    - Render will auto-deploy
 *    - Check deployment logs
 * 
 * 4. Test Deployment:
 *    - Run test-enhanced-booking-backend.js
 *    - Verify all 4 tests pass
 *    - Test individual booking retrieval
 *    - Test enhanced status updates
 * 
 * 5. Update Frontend:
 *    - Ensure frontend uses new status values
 *    - Test quote workflow end-to-end
 *    - Verify fallback mechanisms still work
 */

console.log('📋 Backend Deployment Fix Package Generated');
console.log('👆 Copy the API endpoints above to your routes/bookings.js file');
console.log('💾 Run the DATABASE_MIGRATION_SQL in your Neon PostgreSQL database');
console.log('🚀 Deploy to Render and test with test-enhanced-booking-backend.js');

module.exports = {
  DATABASE_MIGRATION_SQL,
  deployment_checklist: [
    'Update bookingService.js and bookingService.ts',
    'Add missing API endpoints to routes/bookings.js', 
    'Remove old status validation',
    'Run database migration SQL',
    'Deploy to Render',
    'Test with enhanced booking test script'
  ]
};
