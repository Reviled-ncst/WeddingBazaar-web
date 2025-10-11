const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// =============================================================================
// CRITICAL BOOKING FIX DEPLOYMENT - 2025/10/12 18:35:00
// Fixed vendor booking ID mismatch issue
// Now searches for both full vendor ID (2-2025-003) and legacy ID (2)
// This should resolve the "new request" issue for vendors with existing bookings
// =============================================================================

// Get bookings for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('📅 Getting bookings for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    // Handle both full vendor ID format (2-2025-003) and legacy format (2)
    // Extract the base number from full ID format for backward compatibility
    const legacyVendorId = vendorId.includes('-') ? vendorId.split('-')[0] : vendorId;
    
    console.log(`🔍 Searching for bookings with vendor_id: "${vendorId}" or "${legacyVendorId}"`);
    
    let query = `
      SELECT * FROM bookings 
      WHERE vendor_id = $1 OR vendor_id = $2
    `;
    let params = [vendorId, legacyVendorId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const bookings = await sql(query, params);
    
    console.log(`✅ Found ${bookings.length} bookings for vendor ${vendorId} (searched both "${vendorId}" and "${legacyVendorId}")`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Vendor bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get booking statistics
router.get('/stats', async (req, res) => {
  console.log('📊 Getting booking stats:', req.query);
  
  try {
    const { vendorId, userId } = req.query;
    
    if (!vendorId && !userId) {
      return res.status(400).json({
        success: false,
        error: 'vendorId or userId parameter is required',
        timestamp: new Date().toISOString()
      });
    }
    
    let whereClause = '';
    let param = '';
    
    if (vendorId) {
      whereClause = 'vendor_id = $1';
      param = vendorId;
    } else {
      whereClause = 'user_id = $1';
      param = userId;
    }
    
    // Get booking statistics
    const stats = await sql(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN CAST(total_amount AS DECIMAL) END), 0) as total_revenue
      FROM bookings 
      WHERE ${whereClause}
    `, [param]);
    
    console.log(`✅ Generated stats for ${vendorId ? 'vendor' : 'user'} ${param}`);
    
    res.json({
      success: true,
      stats: stats[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Booking stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get bookings for a user (individual/couple)
router.get('/user/:userId', async (req, res) => {
  console.log('📅 Getting bookings for user:', req.params.userId);
  
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM bookings 
      WHERE user_id = $1
    `;
    let params = [userId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const bookings = await sql(query, params);
    
    console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ User bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  console.log('➕ Creating new booking:', req.body);
  
  try {
    const {
      userId,
      vendorId,
      serviceId,
      eventDate,
      eventTime,
      venue,
      totalAmount,
      specialRequests,
      contactInfo
    } = req.body;
    
    if (!userId || !vendorId || !eventDate || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'userId, vendorId, eventDate, and totalAmount are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const bookingId = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const booking = await sql`
      INSERT INTO bookings (
        id, user_id, vendor_id, service_id, event_date, event_time,
        venue, total_amount, special_requests, contact_info, status,
        created_at, updated_at
      ) VALUES (
        ${bookingId}, ${userId}, ${vendorId}, ${serviceId}, ${eventDate}, ${eventTime},
        ${venue}, ${totalAmount}, ${specialRequests}, ${JSON.stringify(contactInfo)}, 'pending',
        NOW(), NOW()
      ) RETURNING *
    `;
    
    console.log(`✅ Booking created: ${bookingId}`);
    
    res.json({
      success: true,
      booking: booking[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Update booking status
router.patch('/:bookingId/status', async (req, res) => {
  console.log('🔄 Updating booking status:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    const { status, reason, vendor_notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'quote_sent'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Build update query dynamically based on status
    let updateQuery = `
      UPDATE bookings 
      SET status = $1, 
          status_reason = $2,
          vendor_notes = $3,
          updated_at = NOW()
    `;
    
    let queryParams = [status, reason || null, vendor_notes || null];
    
    // Add quote_sent_date if status is quote_sent
    if (status === 'quote_sent') {
      updateQuery += `, quote_sent_date = NOW()`;
    }
    
    updateQuery += ` WHERE id = $4 RETURNING *`;
    queryParams.push(bookingId);
    
    const booking = await sql.unsafe(updateQuery, queryParams);
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Booking status updated: ${bookingId} -> ${status}`);
    
    res.json({
      success: true,
      booking: booking[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Alternative endpoint for booking status updates (matches frontend expectations)
router.put('/:bookingId/update-status', async (req, res) => {
  console.log('🔄 [PUT] Updating booking status:', req.params.bookingId, req.body);
  
  try {
    const { bookingId } = req.params;
    const { status, reason, vendor_notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'quote_sent'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Build update query dynamically based on status
    let updateFields = {
      status,
      status_reason: reason || null,
      vendor_notes: vendor_notes || null,
      updated_at: new Date().toISOString()
    };
    
    // Add quote_sent_date if status is quote_sent
    if (status === 'quote_sent') {
      updateFields.quote_sent_date = new Date().toISOString();
    }
    
    const booking = await sql`
      UPDATE bookings 
      SET status = ${updateFields.status}, 
          status_reason = ${updateFields.status_reason},
          vendor_notes = ${updateFields.vendor_notes},
          quote_sent_date = ${status === 'quote_sent' ? sql`NOW()` : sql`quote_sent_date`},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ [PUT] Booking status updated: ${bookingId} -> ${status}`);
    
    res.json({
      success: true,
      id: booking[0].id,
      status: booking[0].status,
      updated_at: booking[0].updated_at,
      vendor_notes: booking[0].vendor_notes,
      quote_sent_date: booking[0].quote_sent_date,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PUT] Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
