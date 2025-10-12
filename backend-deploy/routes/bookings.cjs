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
    
    const rawBookings = await sql(query, params);
    
    // Process bookings to interpret quote_sent status from notes
    const bookings = rawBookings.map(booking => {
      const processedBooking = { ...booking };
      
      // If notes start with "QUOTE_SENT:", interpret as quote_sent status
      if (booking.notes && booking.notes.startsWith('QUOTE_SENT:')) {
        processedBooking.status = 'quote_sent';
        processedBooking.vendor_notes = booking.notes.substring('QUOTE_SENT:'.length).trim();
        processedBooking.quote_sent_date = booking.updated_at;
      } else {
        processedBooking.vendor_notes = booking.notes;
      }
      
      return processedBooking;
    });
    
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
    
    // Use couple_id since that's the actual column name
    let query = `
      SELECT * FROM bookings 
      WHERE couple_id = $1
    `;
    let params = [userId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const rawBookings = await sql(query, params);
    
    // Process bookings to interpret quote_sent status from notes
    const bookings = rawBookings.map(booking => {
      const processedBooking = { ...booking };
      
      // If notes start with "QUOTE_SENT:", interpret as quote_sent status
      if (booking.notes && booking.notes.startsWith('QUOTE_SENT:')) {
        processedBooking.status = 'quote_sent';
        processedBooking.vendor_notes = booking.notes.substring('QUOTE_SENT:'.length).trim();
        processedBooking.quote_sent_date = booking.updated_at;
      } else {
        processedBooking.vendor_notes = booking.notes;
      }
      
      return processedBooking;
    });
    
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

// Get bookings for a couple (alias for user endpoint)
router.get('/couple/:userId', async (req, res) => {
  console.log('📅 Getting bookings for couple:', req.params.userId);
  
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    // Handle both full user ID format (1-2025-001) and legacy format
    const searchUserId = userId;
    
    console.log(`🔍 Searching for bookings with couple_id: "${searchUserId}"`);
    
    let query = `
      SELECT * FROM bookings 
      WHERE couple_id = $1
    `;
    let params = [searchUserId];
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const rawBookings = await sql(query, params);
    
    // Process bookings to interpret all payment workflow statuses from notes (same enhanced logic as vendor endpoint)
    const bookings = rawBookings.map(booking => {
      const processedBooking = { ...booking };
      
      // Enhanced status processing for complete payment workflow
      if (booking.notes) {
        if (booking.notes.startsWith('QUOTE_SENT:')) {
          processedBooking.status = 'quote_sent';
          processedBooking.vendor_notes = booking.notes.substring('QUOTE_SENT:'.length).trim();
          processedBooking.quote_sent_date = booking.updated_at;
        } else if (booking.notes.startsWith('QUOTE_ACCEPTED:')) {
          processedBooking.status = 'quote_accepted';
          processedBooking.vendor_notes = booking.notes.substring('QUOTE_ACCEPTED:'.length).trim();
          processedBooking.quote_accepted_date = booking.updated_at;
        } else if (booking.notes.startsWith('DEPOSIT_PAID:')) {
          processedBooking.status = 'deposit_paid';
          processedBooking.vendor_notes = booking.notes.substring('DEPOSIT_PAID:'.length).trim();
          processedBooking.payment_date = booking.updated_at;
          
          // Extract amount paid from notes
          const amountMatch = booking.notes.match(/₱([\d,]+)/);
          if (amountMatch) {
            processedBooking.amount_paid = parseInt(amountMatch[1].replace(',', ''));
          }
        } else if (booking.notes.startsWith('FULLY_PAID:') || booking.notes.startsWith('BALANCE_PAID:')) {
          processedBooking.status = 'fully_paid';
          processedBooking.vendor_notes = booking.notes.substring(
            booking.notes.startsWith('FULLY_PAID:') ? 'FULLY_PAID:'.length : 'BALANCE_PAID:'.length
          ).trim();
          processedBooking.payment_date = booking.updated_at;
          
          // Extract amount paid from notes
          const amountMatch = booking.notes.match(/₱([\d,]+)/);
          if (amountMatch) {
            processedBooking.amount_paid = parseInt(amountMatch[1].replace(',', ''));
          }
        } else {
          processedBooking.vendor_notes = booking.notes;
        }
      } else {
        processedBooking.vendor_notes = booking.notes;
      }
      
      return processedBooking;
    });
    
    console.log(`✅ Found ${bookings.length} bookings for couple ${userId}`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Couple bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced bookings endpoint with additional data
router.get('/enhanced', async (req, res) => {
  console.log('📅 Getting enhanced bookings:', req.query);
  
  try {
    const { coupleId, vendorId, page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    if (!coupleId && !vendorId) {
      return res.status(400).json({
        success: false,
        error: 'coupleId or vendorId parameter is required',
        timestamp: new Date().toISOString()
      });
    }
    
    let query = `
      SELECT * FROM bookings 
      WHERE 1=1
    `;
    let params = [];
    
    if (coupleId) {
      query += ` AND couple_id = $${params.length + 1}`;
      params.push(coupleId);
    }
    
    if (vendorId) {
      // Handle both full vendor ID format and legacy format
      const legacyVendorId = vendorId.includes('-') ? vendorId.split('-')[0] : vendorId;
      query += ` AND (vendor_id = $${params.length + 1} OR vendor_id = $${params.length + 2})`;
      params.push(vendorId, legacyVendorId);
    }
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const rawBookings = await sql(query, params);
    
    // Process bookings to interpret all payment workflow statuses from notes (same enhanced logic)
    const bookings = rawBookings.map(booking => {
      const processedBooking = { ...booking };
      
      // Enhanced status processing for complete payment workflow
      if (booking.notes) {
        if (booking.notes.startsWith('QUOTE_SENT:')) {
          processedBooking.status = 'quote_sent';
          processedBooking.vendor_notes = booking.notes.substring('QUOTE_SENT:'.length).trim();
          processedBooking.quote_sent_date = booking.updated_at;
        } else if (booking.notes.startsWith('QUOTE_ACCEPTED:')) {
          processedBooking.status = 'quote_accepted';
          processedBooking.vendor_notes = booking.notes.substring('QUOTE_ACCEPTED:'.length).trim();
          processedBooking.quote_accepted_date = booking.updated_at;
        } else if (booking.notes.startsWith('DEPOSIT_PAID:')) {
          processedBooking.status = 'deposit_paid';
          processedBooking.vendor_notes = booking.notes.substring('DEPOSIT_PAID:'.length).trim();
          processedBooking.payment_date = booking.updated_at;
          
          // Extract amount paid from notes
          const amountMatch = booking.notes.match(/₱([\d,]+)/);
          if (amountMatch) {
            processedBooking.amount_paid = parseInt(amountMatch[1].replace(',', ''));
          }
        } else if (booking.notes.startsWith('FULLY_PAID:') || booking.notes.startsWith('BALANCE_PAID:')) {
          processedBooking.status = 'fully_paid';
          processedBooking.vendor_notes = booking.notes.substring(
            booking.notes.startsWith('FULLY_PAID:') ? 'FULLY_PAID:'.length : 'BALANCE_PAID:'.length
          ).trim();
          processedBooking.payment_date = booking.updated_at;
          
          // Extract amount paid from notes
          const amountMatch = booking.notes.match(/₱([\d,]+)/);
          if (amountMatch) {
            processedBooking.amount_paid = parseInt(amountMatch[1].replace(',', ''));
          }
        } else {
          processedBooking.vendor_notes = booking.notes;
        }
      } else {
        processedBooking.vendor_notes = booking.notes;
      }
      
      return processedBooking;
    });
    
    console.log(`✅ Found ${bookings.length} enhanced bookings`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
      currentPage: parseInt(page),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Enhanced bookings error:', error);
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
    
    const validStatuses = ['request', 'pending', 'confirmed', 'cancelled', 'completed', 'quote_sent', 'quote_accepted', 'deposit_paid', 'fully_paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle status mapping for enhanced payment workflow
    // This works around database constraints while providing full functionality
    let actualStatus = status;
    let statusNote = vendor_notes || null;
    
    if (status === 'quote_sent') {
      actualStatus = 'request';
      statusNote = `QUOTE_SENT: ${vendor_notes || 'Quote has been sent to client'}`;
    } else if (status === 'quote_accepted') {
      actualStatus = 'request';
      statusNote = `QUOTE_ACCEPTED: ${vendor_notes || 'Quote accepted by couple - ready for payment'}`;
    } else if (status === 'deposit_paid') {
      actualStatus = 'request';
      statusNote = `DEPOSIT_PAID: ${vendor_notes || 'Deposit payment received'}`;
    } else if (status === 'fully_paid') {
      actualStatus = 'request';
      statusNote = `FULLY_PAID: ${vendor_notes || 'Full payment received'}`;
    }
    
    const booking = await sql`
      UPDATE bookings 
      SET status = ${actualStatus}, 
          notes = ${statusNote},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    // Return the expected response format for enhanced statuses
    if (booking.length > 0 && ['quote_sent', 'quote_accepted', 'deposit_paid', 'fully_paid'].includes(status)) {
      console.log(`✅ Booking status updated: ${bookingId} -> ${status} (stored as ${actualStatus})`);
      
      res.json({
        success: true,
        booking: {
          ...booking[0],
          status: status // Return the actual status the frontend expects
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    
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
    
    const validStatuses = ['request', 'pending', 'confirmed', 'cancelled', 'completed', 'quote_sent', 'quote_accepted', 'deposit_paid', 'fully_paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle status mapping for enhanced payment workflow (PUT endpoint)
    let actualStatus = status;
    let statusNote = vendor_notes || null;
    
    if (status === 'quote_sent') {
      actualStatus = 'request';
      statusNote = `QUOTE_SENT: ${vendor_notes || 'Quote has been sent to client'}`;
    } else if (status === 'quote_accepted') {
      actualStatus = 'request';
      statusNote = `QUOTE_ACCEPTED: ${vendor_notes || 'Quote accepted by couple - ready for payment'}`;
    } else if (status === 'deposit_paid') {
      actualStatus = 'request';
      statusNote = `DEPOSIT_PAID: ${vendor_notes || 'Deposit payment received'}`;
    } else if (status === 'fully_paid') {
      actualStatus = 'request';
      statusNote = `FULLY_PAID: ${vendor_notes || 'Full payment received'}`;
    }
    
    const booking = await sql`
      UPDATE bookings 
      SET status = ${actualStatus}, 
          notes = ${statusNote},
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
    
    console.log(`✅ [PUT] Booking status updated: ${bookingId} -> ${status} (stored as ${actualStatus})`);
    
    // Return response in format that frontend expects
    const response = {
      success: true,
      id: booking[0].id,
      status: status, // Return the requested status to frontend
      updated_at: booking[0].updated_at,
      vendor_notes: booking[0].notes, // Map notes field to vendor_notes
      timestamp: new Date().toISOString()
    };
    
    // Add quote_sent_date if it's a quote_sent status (simulate the field)
    if (status === 'quote_sent') {
      response.quote_sent_date = booking[0].updated_at;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [PUT] Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =============================================================================
// PAYMENT WORKFLOW IMPLEMENTATION - 2025/01/18
// Added new booking statuses and payment endpoints to support complete payment flow
// Statuses: quote_accepted -> payment_pending -> deposit_paid/fully_paid -> completed
// =============================================================================

// Accept Quote endpoint - Changes status from quote_sent to quote_accepted
router.put('/:bookingId/accept-quote', async (req, res) => {
  console.log('✅ [AcceptQuote] Processing quote acceptance for booking:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    const { acceptance_notes } = req.body;
    
    // Check if booking exists and is in quote_sent status
    const existingBooking = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (existingBooking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const booking = existingBooking[0];
    
    // Check if booking has a quote (notes contain QUOTE_SENT:)
    if (!booking.notes || !booking.notes.startsWith('QUOTE_SENT:')) {
      return res.status(400).json({
        success: false,
        error: 'No quote found for this booking',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update booking status to quote_accepted
    const updatedBooking = await sql`
      UPDATE bookings 
      SET status = 'confirmed',
          notes = ${`QUOTE_ACCEPTED: ${acceptance_notes || 'Quote accepted by couple'}`},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    console.log(`✅ [AcceptQuote] Quote accepted for booking ${bookingId}`);
    
    res.json({
      success: true,
      booking: {
        ...updatedBooking[0],
        status: 'quote_accepted' // Return this status to frontend
      },
      message: 'Quote accepted successfully. You can now proceed with payment.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AcceptQuote] Error accepting quote:', error);
    res.status(500).json({
      success: false,  
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Process Payment endpoint - Handles downpayment and full payment
router.put('/:bookingId/process-payment', async (req, res) => {
  console.log('💳 [ProcessPayment] Processing payment for booking:', req.params.bookingId, req.body);
  
  try {
    const { bookingId } = req.params;
    const { payment_type, amount, payment_method, transaction_id, payment_notes } = req.body;
    
    if (!payment_type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'payment_type and amount are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const validPaymentTypes = ['downpayment', 'full_payment', 'remaining_balance'];
    if (!validPaymentTypes.includes(payment_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment_type. Must be one of: ${validPaymentTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if booking exists
    const existingBooking = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (existingBooking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const booking = existingBooking[0];
    
    // Determine new status based on payment type
    let newStatus = 'confirmed';
    let statusNote = '';
    let frontendStatus = '';
    
    if (payment_type === 'downpayment') {
      newStatus = 'confirmed';
      frontendStatus = 'deposit_paid';
      statusNote = `DEPOSIT_PAID: ₱${amount} downpayment received via ${payment_method || 'online payment'}`;
      if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
      if (payment_notes) statusNote += ` - ${payment_notes}`;
      
    } else if (payment_type === 'full_payment') {
      newStatus = 'confirmed';
      frontendStatus = 'fully_paid';
      statusNote = `FULLY_PAID: ₱${amount} full payment received via ${payment_method || 'online payment'}`;
      if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
      if (payment_notes) statusNote += ` - ${payment_notes}`;
      
    } else if (payment_type === 'remaining_balance') {
      newStatus = 'confirmed';
      frontendStatus = 'fully_paid';
      statusNote = `BALANCE_PAID: ₱${amount} remaining balance received via ${payment_method || 'online payment'}`;
      if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
      if (payment_notes) statusNote += ` - ${payment_notes}`;
    }
    
    // Update booking with payment information
    const updatedBooking = await sql`
      UPDATE bookings 
      SET status = ${newStatus},
          notes = ${statusNote},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    console.log(`💳 [ProcessPayment] Payment processed: ${bookingId} -> ${frontendStatus} (₱${amount})`);
    
    res.json({
      success: true,
      booking: {
        ...updatedBooking[0],
        status: frontendStatus, // Return payment status to frontend
        payment_type,
        amount_paid: amount,
        transaction_id,
        payment_method
      },
      message: `Payment of ₱${amount} processed successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [ProcessPayment] Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get Payment Status endpoint - Check payment status for a booking
router.get('/:bookingId/payment-status', async (req, res) => {
  console.log('💰 [PaymentStatus] Getting payment status for booking:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    
    const booking = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }
    
    const bookingData = booking[0];
    let paymentStatus = 'unpaid';
    let amountPaid = 0;
    let paymentMethod = null;
    let transactionId = null;
    
    // Parse payment status from notes
    if (bookingData.notes) {
      if (bookingData.notes.includes('DEPOSIT_PAID:')) {
        paymentStatus = 'deposit_paid';
        const amountMatch = bookingData.notes.match(/₱([\d,]+)/);
        if (amountMatch) amountPaid = parseInt(amountMatch[1].replace(',', ''));
      } else if (bookingData.notes.includes('FULLY_PAID:') || bookingData.notes.includes('BALANCE_PAID:')) {
        paymentStatus = 'fully_paid';
        const amountMatch = bookingData.notes.match(/₱([\d,]+)/);
        if (amountMatch) amountPaid = parseInt(amountMatch[1].replace(',', ''));
      } else if (bookingData.notes.includes('QUOTE_ACCEPTED:')) {
        paymentStatus = 'quote_accepted';
      } else if (bookingData.notes.includes('QUOTE_SENT:')) {
        paymentStatus = 'quote_sent';
      }
      
      // Extract payment method and transaction ID if available
      const methodMatch = bookingData.notes.match(/via ([^)]+)/);
      if (methodMatch) paymentMethod = methodMatch[1];
      
      const transactionMatch = bookingData.notes.match(/Transaction ID: ([^)]+)/);
      if (transactionMatch) transactionId = transactionMatch[1];
    }
    
    res.json({
      success: true,
      booking_id: bookingId,
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      total_amount: bookingData.amount || 0,
      remaining_balance: Math.max(0, (bookingData.amount || 0) - amountPaid),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PaymentStatus] Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
