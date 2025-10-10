const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get bookings for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('📅 Getting bookings for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM bookings 
      WHERE vendor_id = $1
    `;
    let params = [vendorId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const bookings = await sql(query, params);
    
    console.log(`✅ Found ${bookings.length} bookings for vendor ${vendorId}`);
    
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
    const { status, reason } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    const booking = await sql`
      UPDATE bookings 
      SET status = ${status}, 
          status_reason = ${reason || null},
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

module.exports = router;
