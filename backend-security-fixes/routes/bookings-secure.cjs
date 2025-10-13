// CRITICAL SECURITY FIX: Enhanced Booking Routes with Access Control
// File: backend-security-fixes/routes/bookings-secure.cjs

const express = require('express');
const router = express.Router();

// Import database and middleware
const { sql } = require('../config/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

/**
 * SECURITY ENHANCEMENT: Get vendor bookings with strict access control
 * This fixes the cross-vendor data leakage vulnerability
 */
router.get('/vendor/:vendorId', authenticateToken, async (req, res) => {
  try {
    const requestedVendorId = req.params.vendorId;
    const authenticatedUserId = req.user.id;
    const authenticatedUserType = req.user.user_type;
    
    console.log(`🔐 SECURITY CHECK: User ${authenticatedUserId} requesting vendor ${requestedVendorId} bookings`);
    
    // CRITICAL SECURITY CHECK 1: Only vendors can access vendor endpoints
    if (authenticatedUserType !== 'vendor') {
      console.log(`🚨 SECURITY ALERT: Non-vendor user ${authenticatedUserId} attempted to access vendor endpoint`);
      return res.status(403).json({
        success: false,
        error: 'Access denied. Vendor privileges required.',
        code: 'VENDOR_ACCESS_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }
    
    // CRITICAL SECURITY CHECK 2: Detect malformed user IDs that could cause confusion
    if (isMalformedUserId(authenticatedUserId)) {
      console.log(`🚨 SECURITY ALERT: Malformed user ID detected: ${authenticatedUserId}`);
      return res.status(403).json({
        success: false,
        error: 'Account security issue detected. Please contact support.',
        code: 'MALFORMED_USER_ID',
        timestamp: new Date().toISOString()
      });
    }
    
    // CRITICAL SECURITY CHECK 3: Get the actual vendor record for this user
    const vendorRecord = await sql`
      SELECT id, user_id, business_name 
      FROM vendors 
      WHERE user_id = ${authenticatedUserId}
    `;
    
    if (vendorRecord.length === 0) {
      console.log(`🚨 SECURITY ALERT: User ${authenticatedUserId} marked as vendor but no vendor record found`);
      return res.status(403).json({
        success: false,
        error: 'Vendor record not found. Contact support.',
        code: 'VENDOR_RECORD_MISSING',
        timestamp: new Date().toISOString()
      });
    }
    
    const actualVendorId = vendorRecord[0].id.toString();
    
    // CRITICAL SECURITY CHECK 4: Requested vendor ID must match authenticated vendor
    if (actualVendorId !== requestedVendorId) {
      console.log(`🚨 SECURITY ALERT: Vendor ${actualVendorId} (user: ${authenticatedUserId}) attempted to access vendor ${requestedVendorId} data`);
      return res.status(403).json({
        success: false,
        error: 'Access denied. Cannot access other vendor data.',
        code: 'CROSS_VENDOR_ACCESS_DENIED',
        timestamp: new Date().toISOString()
      });
    }
    
    // SECURITY AUDIT LOG
    console.log(`✅ AUTHORIZED ACCESS: Vendor ${actualVendorId} (user: ${authenticatedUserId}) accessing own bookings`);
    
    // Safe to proceed with booking query - only return bookings for this specific vendor
    const bookings = await sql`
      SELECT 
        b.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM bookings b
      LEFT JOIN users u ON b.couple_id = u.id
      WHERE b.vendor_id = ${actualVendorId}
      ORDER BY b.created_at DESC
    `;
    
    // SECURITY VALIDATION: Double-check that all returned bookings belong to this vendor
    const securityCheck = bookings.every(booking => booking.vendor_id === actualVendorId);
    if (!securityCheck) {
      console.log(`🚨 SECURITY ERROR: Query returned bookings not belonging to vendor ${actualVendorId}`);
      return res.status(500).json({
        success: false,
        error: 'Data integrity error',
        code: 'DATA_INTEGRITY_VIOLATION',
        timestamp: new Date().toISOString()
      });
    }
    
    // Return secure response with vendor validation
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      vendorId: actualVendorId,
      securityValidated: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Vendor bookings security error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * SECURITY UTILITY: Check for malformed user IDs that could cause data leakage
 */
function isMalformedUserId(userId) {
  // Check for the problematic pattern: "2-2025-001"
  const problematicPatterns = [
    /^\d+-\d{4}-\d{3}$/,  // Pattern: number-year-sequence
    /^[12]-2025-\d+$/     // Specific pattern causing the issue
  ];
  
  return problematicPatterns.some(pattern => pattern.test(userId));
}

/**
 * SECURITY ENHANCEMENT: Get booking statistics with vendor validation
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const authenticatedUserId = req.user.id;
    const authenticatedUserType = req.user.user_type;
    
    // Same security checks as above
    if (authenticatedUserType !== 'vendor') {
      return res.status(403).json({
        success: false,
        error: 'Vendor access required',
        code: 'VENDOR_ACCESS_REQUIRED'
      });
    }
    
    if (isMalformedUserId(authenticatedUserId)) {
      return res.status(403).json({
        success: false,
        error: 'Account security issue detected',
        code: 'MALFORMED_USER_ID'
      });
    }
    
    // Validate vendor ownership
    const vendorRecord = await sql`
      SELECT id FROM vendors WHERE user_id = ${authenticatedUserId}
    `;
    
    if (vendorRecord.length === 0 || vendorRecord[0].id.toString() !== vendorId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'CROSS_VENDOR_ACCESS_DENIED'
      });
    }
    
    // Get stats only for this vendor
    const stats = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'pending_review') as pending_review,
        COUNT(*) FILTER (WHERE status = 'quote_sent') as quotes_sent,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_booking_value
      FROM bookings 
      WHERE vendor_id = ${vendorId}
    `;
    
    const result = stats[0];
    const conversionRate = result.total_bookings > 0 ? 
      (result.confirmed / result.total_bookings * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        totalBookings: parseInt(result.total_bookings),
        pendingReview: parseInt(result.pending_review),
        quotesSent: parseInt(result.quotes_sent),
        confirmed: parseInt(result.confirmed),
        totalRevenue: parseFloat(result.total_revenue),
        averageBookingValue: parseFloat(result.average_booking_value),
        conversionRate: parseFloat(conversionRate.toFixed(1))
      },
      vendorId: vendorId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Booking stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * SECURITY ENHANCEMENT: Update booking status with vendor validation
 */
router.put('/:id/update-status', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, vendorNotes } = req.body;
    const authenticatedUserId = req.user.id;
    const authenticatedUserType = req.user.user_type;
    
    // Security checks
    if (authenticatedUserType !== 'vendor') {
      return res.status(403).json({
        success: false,
        error: 'Vendor access required',
        code: 'VENDOR_ACCESS_REQUIRED'
      });
    }
    
    if (isMalformedUserId(authenticatedUserId)) {
      return res.status(403).json({
        success: false,
        error: 'Account security issue detected',
        code: 'MALFORMED_USER_ID'
      });
    }
    
    // Get vendor ID for this user
    const vendorRecord = await sql`
      SELECT id FROM vendors WHERE user_id = ${authenticatedUserId}
    `;
    
    if (vendorRecord.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Vendor record not found',
        code: 'VENDOR_RECORD_MISSING'
      });
    }
    
    const actualVendorId = vendorRecord[0].id.toString();
    
    // Verify this booking belongs to this vendor
    const booking = await sql`
      SELECT vendor_id FROM bookings WHERE id = ${bookingId}
    `;
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    if (booking[0].vendor_id !== actualVendorId) {
      console.log(`🚨 SECURITY ALERT: Vendor ${actualVendorId} attempted to modify booking ${bookingId} belonging to vendor ${booking[0].vendor_id}`);
      return res.status(403).json({
        success: false,
        error: 'Cannot modify other vendor bookings',
        code: 'CROSS_VENDOR_ACCESS_DENIED'
      });
    }
    
    // Safe to update
    const updateData = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    if (vendorNotes) {
      updateData.vendor_notes = vendorNotes;
    }
    
    if (status === 'quote_sent') {
      updateData.quote_sent_date = new Date().toISOString();
    }
    
    await sql`
      UPDATE bookings 
      SET ${sql(updateData)}
      WHERE id = ${bookingId}
    `;
    
    console.log(`✅ SECURE UPDATE: Vendor ${actualVendorId} updated booking ${bookingId} to status: ${status}`);
    
    res.json({
      success: true,
      id: bookingId,
      status: status,
      updated_at: updateData.updated_at,
      vendorId: actualVendorId
    });
    
  } catch (error) {
    console.error('❌ Booking update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
