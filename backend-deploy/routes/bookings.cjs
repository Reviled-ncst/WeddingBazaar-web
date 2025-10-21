const express = require('express');
const { sql } = require('../config/database.cjs');
const { createDepositReceipt, createBalanceReceipt, createFullPaymentReceipt } = require('../helpers/receiptGenerator.cjs');

const router = express.Router();

// Get bookings for a vendor - SECURITY ENHANCED VERSION
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('� SECURITY-ENHANCED: Getting bookings for vendor:', req.params.vendorId);
  
  try {
    const requestedVendorId = req.params.vendorId;
    
    // CRITICAL SECURITY FIX: For now, we implement basic validation
    // In production, this should use authentication middleware
    
    // SECURITY CHECK 2: Detect malformed user IDs that could cause confusion
    if (isMalformedUserId(requestedVendorId)) {
      console.log(`🚨 SECURITY ALERT: Request blocked for malformed vendor ID: ${requestedVendorId}`);
      return res.status(403).json({
        success: false,
        error: 'Invalid vendor ID format detected. Access denied for security.',
        code: 'MALFORMED_VENDOR_ID',
        timestamp: new Date().toISOString()
      });
    }
    
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc', startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    console.log(`🔍 SECURE: Searching for bookings with exact vendor_id: "${requestedVendorId}"`);
    if (startDate || endDate) {
      console.log(`📅 Date range filter: ${startDate || 'any'} to ${endDate || 'any'}`);
    }
    
    // SECURITY FIX: Only search for exact vendor ID match, no legacy fallback
    let query = `
      SELECT * FROM bookings 
      WHERE vendor_id = $1
    `;
    let params = [requestedVendorId];
    
    // Add date range filtering if provided
    if (startDate) {
      query += ` AND event_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND event_date <= $${params.length + 1}`;
      params.push(endDate);
    }
    
    if (status && status !== 'all') {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const rawBookings = await sql(query, params);
    
    // SECURITY VALIDATION: Double-check that all returned bookings belong to requested vendor
    const securityCheck = rawBookings.every(booking => booking.vendor_id === requestedVendorId);
    if (!securityCheck) {
      console.log(`🚨 SECURITY ERROR: Query returned bookings not belonging to vendor ${requestedVendorId}`);
      return res.status(500).json({
        success: false,
        error: 'Data integrity error',
        code: 'DATA_INTEGRITY_VIOLATION',
        timestamp: new Date().toISOString()
      });
    }
    
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
    
    console.log(`✅ SECURE: Found ${bookings.length} bookings for vendor ${requestedVendorId}`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      totalPages: Math.ceil(bookings.length / limit),
      currentPage: parseInt(page),
      vendorId: requestedVendorId,
      securityEnhanced: true,
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
 * SECURITY UTILITY: Check for malformed vendor IDs that could cause data leakage
 */
function isMalformedUserId(userId) {
  if (!userId || typeof userId !== 'string') return true;
  
  // Check for truly malformed patterns - allow legitimate user IDs but block obvious attacks
  const malformedPatterns = [
    /[<>"/]/, // SQL injection attempts
    /['"]/, // Quote injection attempts
    /\s/, // Spaces (not allowed in IDs)
    /[;,]/, // Command separators
    /^\s*$/, // Empty or whitespace only
    /\.\./,  // Path traversal attempts
    /\$\{/,  // Template injection attempts
    /\bOR\b/i, // SQL OR injection
    /\bAND\b/i, // SQL AND injection
    /\bUNION\b/i, // SQL UNION injection
    /\bSELECT\b/i, // SQL SELECT injection
    /\bDROP\b/i, // SQL DROP injection
    /\bDELETE\b/i, // SQL DELETE injection
    /\bUPDATE\b/i, // SQL UPDATE injection
    /\bINSERT\b/i, // SQL INSERT injection
  ];
  
  const ismalformed = malformedPatterns.some(pattern => pattern.test(userId));
  
  if (ismalformed) {
    console.log(`🚨 DETECTED MALFORMED ID: ${userId} contains dangerous characters`);
  }
  
  // Allow legitimate user ID patterns:
  // - 1-YYYY-XXX (couples)
  // - 2-YYYY-XXX (vendors) 
  // - 3-YYYY-XXX (admins)
  // - UUID patterns
  // - Simple numeric IDs
  const legitimatePatterns = [
    /^[123]-\d{4}-\d{3}$/, // User ID pattern (1=couple, 2=vendor, 3=admin)
    /^[a-f0-9-]{36}$/, // UUID pattern
    /^\d+$/, // Simple numeric ID
  ];
  
  const isLegitimate = legitimatePatterns.some(pattern => pattern.test(userId));
  
  if (isLegitimate && !ismalformed) {
    console.log(`✅ LEGITIMATE ID: ${userId} passed security validation`);
    return false; // Not malformed
  }
  
  if (ismalformed) {
    console.log(`🚨 BLOCKED MALFORMED ID: ${userId}`);
    return true; // Is malformed
  }
  
  // For any other pattern, be conservative but log it
  console.log(`⚠️ UNKNOWN ID PATTERN: ${userId} - allowing but monitoring`);
  return false; // Allow unknown patterns for now
}

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
    
    // Handle both full user ID format (1-2025-001) and legacy format
    const searchUserId = userId;
    
    console.log(`🔍 Searching for bookings with couple_id: "${searchUserId}"`);
    
    let rawBookings;
    
    try {
      rawBookings = await sql`
        SELECT 
          b.id,
          b.service_id,
          b.service_name,
          b.vendor_id,
          b.vendor_name,
          b.couple_id,
          b.couple_name,
          b.event_date,
          b.event_time,
          b.event_location,
          b.guest_count,
          b.service_type,
          b.budget_range,
          b.special_requests,
          b.contact_phone,
          b.preferred_contact_method,
          b.status,
          b.total_amount,
          b.deposit_amount,
          b.amount,
          b.quoted_price,
          b.quoted_deposit,
          b.quote_itemization,
          b.quote_sent_date,
          b.quote_valid_until,
          b.notes,
          b.contract_details,
          b.response_message,
          b.estimated_cost_min,
          b.estimated_cost_max,
          b.estimated_cost_currency,
          b.created_at,
          b.updated_at,
          b.process_stage,
          b.progress_percentage,
          b.next_action,
          b.next_action_by,
          b.last_activity_at,
          b.total_paid,
          b.remaining_balance,
          b.downpayment_amount,
          b.payment_progress,
          b.last_payment_date,
          b.payment_method,
          b.transaction_id,
          v.business_name as vendor_business_name,
          v.business_type as vendor_category,
          v.rating as vendor_rating,
          v.location as vendor_location
        FROM bookings b
        LEFT JOIN vendors v ON b.vendor_id = v.id
        WHERE b.couple_id = ${searchUserId}
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}
      `;
    } catch (queryError) {
      console.error('❌ Couple bookings query error:', queryError);
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        details: queryError.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // Status filtering is handled in the SQL query above
    
    // Process bookings to interpret all payment workflow statuses from notes (same enhanced logic as vendor endpoint)
    const bookings = rawBookings.map(booking => {
      const processedBooking = { ...booking };
      
      // Ensure vendor name is properly mapped
      processedBooking.vendor_name = booking.vendor_business_name || booking.vendor_name || `vendor ${booking.vendor_id}`;
      
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
    
    if (!coupleId && !vendorId) {
      return res.status(400).json({
        success: false,
        error: 'coupleId or vendorId parameter is required',
        timestamp: new Date().toISOString()
      });
    }
    
    let rawBookings;
    
    try {
      if (coupleId) {
        console.log(`🔍 Searching enhanced bookings for couple: ${coupleId}`);      rawBookings = await sql`
        SELECT 
          b.id,
          b.service_id,
          b.service_name,
          b.vendor_id,
          b.vendor_name,
          b.couple_id,
          b.couple_name,
          b.event_date,
          b.event_time,
          b.event_location,
          b.guest_count,
          b.service_type,
          b.budget_range,
          b.special_requests,
          b.contact_phone,
          b.preferred_contact_method,
          b.status,
          b.total_amount,
          b.deposit_amount,
          b.amount,
          b.quoted_price,
          b.quoted_deposit,
          b.quote_itemization,
          b.notes,
          b.contract_details,
          b.response_message,
          b.estimated_cost_min,
          b.estimated_cost_max,
          b.estimated_cost_currency,
          b.created_at,
          b.updated_at,
          b.process_stage,
          b.progress_percentage,
          b.next_action,
          b.next_action_by,
          b.last_activity_at,
          v.business_name as vendor_business_name,
          v.business_type as vendor_category,
          v.rating as vendor_rating,
          v.location as vendor_location,
          b.total_paid,
          b.remaining_balance,
          b.downpayment_amount,
          b.payment_progress,
          b.last_payment_date,
          b.payment_method,
          b.transaction_id
        FROM bookings b
        LEFT JOIN vendors v ON b.vendor_id = v.id
        WHERE b.couple_id = ${coupleId}
        ORDER BY b.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}
      `;
      } else if (vendorId) {
        console.log(`🔍 Searching enhanced bookings for vendor: ${vendorId}`);
        // Handle both full vendor ID format (2-2025-003) and legacy format (2)
        const legacyVendorId = vendorId.includes('-') ? vendorId.split('-')[0] : vendorId;
        
        rawBookings = await sql`
          SELECT 
            b.id,
            b.service_id,
            b.service_name,
            b.vendor_id,
            b.vendor_name,
            b.couple_id,
            b.couple_name,
            b.event_date,
            b.event_time,
            b.event_location,
            b.guest_count,
            b.service_type,
            b.budget_range,
            b.special_requests,
            b.contact_phone,
            b.preferred_contact_method,
            b.status,
            b.total_amount,
            b.deposit_amount,
            b.amount,
            b.quoted_price,
            b.quoted_deposit,
            b.quote_itemization,
            b.notes,
            b.contract_details,
            b.response_message,
            b.estimated_cost_min,
            b.estimated_cost_max,
            b.estimated_cost_currency,
            b.created_at,
            b.updated_at,
            b.process_stage,
            b.progress_percentage,
            b.next_action,
            b.next_action_by,
            b.last_activity_at,
            v.business_name as vendor_business_name,
            v.business_type as vendor_category,
            v.rating as vendor_rating,
            v.location as vendor_location,
            b.total_paid,
            b.remaining_balance,
            b.downpayment_amount,
            b.payment_progress,
            b.last_payment_date,
            b.payment_method,
            b.transaction_id
          FROM bookings b
          LEFT JOIN vendors v ON (b.vendor_id = v.id OR b.vendor_id = ${legacyVendorId})
          WHERE (b.vendor_id = ${vendorId} OR b.vendor_id = ${legacyVendorId})
          ORDER BY b.created_at DESC
          LIMIT ${parseInt(limit)} OFFSET ${(parseInt(page) - 1) * parseInt(limit)}
        `;
      }
    } catch (queryError) {
      console.error('❌ Enhanced bookings query error:', queryError);
      return res.status(500).json({
        success: false,
        error: 'Database query failed',
        details: queryError.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // Process bookings to interpret all payment workflow statuses from notes (same enhanced logic)
    const bookings = rawBookings.map(booking => {
      const processedBooking = { ...booking };
      
      // Ensure vendor name is properly mapped
      processedBooking.vendor_name = booking.vendor_business_name || booking.vendor_name || `vendor ${booking.vendor_id}`;
      
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

// Create a new booking (POST /api/bookings)
router.post('/', async (req, res) => {
  console.log('➕ Creating new booking:', req.body);
  
  try {
    const {
      userId,
      coupleId,
      vendorId,
      serviceId,
      eventDate,
      eventTime,
      venue,
      totalAmount,
      specialRequests,
      contactInfo,
      serviceName,
      serviceType
    } = req.body;
    
    // Use coupleId if provided, otherwise fall back to userId
    const finalCoupleId = coupleId || userId;
    
    if (!finalCoupleId || !vendorId || !eventDate || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'coupleId/userId, vendorId, eventDate, and totalAmount are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate unique booking ID (use smaller integer)
    const bookingId = Math.floor(Date.now() / 1000); // Use seconds instead of milliseconds
    
    const booking = await sql`
      INSERT INTO bookings (
        id, couple_id, vendor_id, service_id, event_date, event_time,
        event_location, total_amount, special_requests, status,
        service_name, service_type, created_at, updated_at
      ) VALUES (
        ${bookingId}, ${finalCoupleId}, ${vendorId}, ${serviceId || null}, ${eventDate}, ${eventTime || null},
        ${venue || null}, ${totalAmount}, ${specialRequests || null}, 'request',
        ${serviceName || 'Wedding Service'}, ${serviceType || 'general'}, NOW(), NOW()
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

// Create a booking request (POST /api/bookings/request)
router.post('/request', async (req, res) => {
  console.log('📝 Creating booking request:', req.body);
  
  try {
    const {
      coupleId,
      vendorId,
      serviceId,
      serviceName,
      serviceType,
      eventDate,
      eventTime,
      eventEndTime,
      venue,
      eventLocation,
      venueDetails,
      guestCount,
      budgetRange,
      totalAmount,
      specialRequests,
      contactInfo,
      contactPerson,
      contactPhone,
      contactEmail,
      preferredContactMethod,
      vendorName,
      coupleName
    } = req.body;
    
    if (!coupleId || !vendorId || !eventDate) {
      return res.status(400).json({
        success: false,
        error: 'coupleId, vendorId, and eventDate are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Use eventLocation if provided, otherwise fall back to venue or 'TBD'
    const location = eventLocation || venue || 'TBD';
    
    // Generate unique booking ID (use smaller integer)
    const bookingId = Math.floor(Date.now() / 1000); // Use seconds instead of milliseconds
    
    console.log('💾 Inserting booking with data:', {
      bookingId,
      coupleId,
      vendorId,
      serviceId,
      eventDate,
      eventTime,
      eventEndTime,
      location,
      venueDetails,
      guestCount,
      budgetRange,
      contactPerson,
      contactPhone,
      contactEmail,
      preferredContactMethod,
      vendorName,
      coupleName
    });
    
    const booking = await sql`
      INSERT INTO bookings (
        id, couple_id, vendor_id, service_id, event_date, event_time, event_end_time,
        event_location, venue_details, guest_count, budget_range, total_amount, 
        special_requests, contact_person, contact_phone, contact_email, preferred_contact_method,
        status, service_name, service_type, vendor_name, couple_name,
        created_at, updated_at
      ) VALUES (
        ${bookingId}, 
        ${coupleId}, 
        ${vendorId}, 
        ${serviceId || null}, 
        ${eventDate}, 
        ${eventTime || '10:00'},
        ${eventEndTime || null},
        ${location}, 
        ${venueDetails || null},
        ${guestCount || null}, 
        ${budgetRange || null}, 
        ${totalAmount || 0}, 
        ${specialRequests || null}, 
        ${contactPerson || null},
        ${contactPhone || null},
        ${contactEmail || null},
        ${preferredContactMethod || 'email'},
        'request',
        ${serviceName || 'Wedding Service'}, 
        ${serviceType || 'other'},
        ${vendorName || null},
        ${coupleName || null},
        NOW(), 
        NOW()
      ) RETURNING *
    `;
    
    console.log(`✅ Booking request created: ${bookingId}`);
    console.log('📊 Created booking data:', booking[0]);
    
    res.json({
      success: true,
      booking: booking[0],
      message: 'Booking request created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Create booking request error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
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
  console.log('📥 [PAYMENT UPDATE] Received data:', req.body);
  
  try {
    const { bookingId } = req.params;
    const { 
      status, 
      reason, 
      vendor_notes,
      // Payment-related fields
      total_paid,          // FIXED: Extract total_paid from request
      payment_amount,      // FIXED: Extract individual payment amount
      payment_type,        // FIXED: Extract payment type (downpayment/full_payment/remaining_balance)
      downpayment_amount,
      remaining_balance,
      payment_progress,
      last_payment_date,
      payment_method,
      transaction_id
    } = req.body;
    
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
    
    // WORKAROUND: Database allows: request, approved, downpayment, fully_paid, completed, declined, cancelled
    // Map requested statuses to allowed database statuses, store real status in notes
    let actualStatus = status;
    let statusNote = vendor_notes || null;
    
    if (status === 'quote_sent') {
      actualStatus = 'request';
      statusNote = `QUOTE_SENT: ${vendor_notes || 'Quote has been sent to client'}`;
    } else if (status === 'quote_accepted') {
      actualStatus = 'approved';
      statusNote = `QUOTE_ACCEPTED: ${vendor_notes || 'Quote accepted by couple - ready for payment'}`;
    } else if (status === 'deposit_paid') {
      actualStatus = 'downpayment';
      statusNote = `DEPOSIT_PAID: ${vendor_notes || 'Deposit payment received'}`;
    } else if (status === 'confirmed') {
      actualStatus = 'approved';
      statusNote = vendor_notes;
    } else if (status === 'pending') {
      actualStatus = 'request';
      statusNote = vendor_notes;
    }
    
    // 🆕 Prepare payment fields (only update if provided)
    const updateFields = {
      status: actualStatus,
      notes: statusNote,
      updated_at: new Date()
    };
    
    // Add payment fields if provided
    if (total_paid !== undefined) {
      updateFields.total_paid = total_paid;
      console.log('💵 [PAYMENT UPDATE] Setting total_paid:', total_paid);
    }
    if (payment_amount !== undefined) {
      updateFields.payment_amount = payment_amount;
      console.log('💰 [PAYMENT UPDATE] Setting payment_amount:', payment_amount);
    }
    if (payment_type) {
      updateFields.payment_type = payment_type;
      console.log('📝 [PAYMENT UPDATE] Setting payment_type:', payment_type);
    }
    if (downpayment_amount !== undefined) {
      updateFields.downpayment_amount = downpayment_amount;
      console.log('💰 [PAYMENT UPDATE] Setting downpayment_amount:', downpayment_amount);
    }
    if (remaining_balance !== undefined) {
      updateFields.remaining_balance = remaining_balance;
      console.log('💸 [PAYMENT UPDATE] Setting remaining_balance:', remaining_balance);
    }
    if (payment_progress !== undefined) {
      updateFields.payment_progress = payment_progress;
      console.log('📊 [PAYMENT UPDATE] Setting payment_progress:', payment_progress);
    }
    if (last_payment_date) {
      updateFields.last_payment_date = new Date(last_payment_date);
      console.log('📅 [PAYMENT UPDATE] Setting last_payment_date:', last_payment_date);
    }
    if (payment_method) {
      updateFields.payment_method = payment_method;
      console.log('💳 [PAYMENT UPDATE] Setting payment_method:', payment_method);
    }
    if (transaction_id) {
      updateFields.transaction_id = transaction_id;
      console.log('🔖 [PAYMENT UPDATE] Setting transaction_id:', transaction_id);
    }
    
    console.log('💾 [PAYMENT UPDATE] Final update fields:', updateFields);
    
    // Build SET clause manually for Neon SQL
    const setClauses = [];
    const values = [];
    
    if (updateFields.status !== undefined) {
      setClauses.push('status = $' + (values.length + 1));
      values.push(updateFields.status);
    }
    if (updateFields.notes !== undefined) {
      setClauses.push('notes = $' + (values.length + 1));
      values.push(updateFields.notes);
    }
    if (updateFields.total_paid !== undefined) {
      setClauses.push('total_paid = $' + (values.length + 1));
      values.push(updateFields.total_paid);
    }
    if (updateFields.payment_amount !== undefined) {
      setClauses.push('payment_amount = $' + (values.length + 1));
      values.push(updateFields.payment_amount);
    }
    if (updateFields.payment_type !== undefined) {
      setClauses.push('payment_type = $' + (values.length + 1));
      values.push(updateFields.payment_type);
    }
    if (updateFields.downpayment_amount !== undefined) {
      setClauses.push('downpayment_amount = $' + (values.length + 1));
      values.push(updateFields.downpayment_amount);
    }
    if (updateFields.remaining_balance !== undefined) {
      setClauses.push('remaining_balance = $' + (values.length + 1));
      values.push(updateFields.remaining_balance);
    }
    if (updateFields.payment_progress !== undefined) {
      setClauses.push('payment_progress = $' + (values.length + 1));
      values.push(updateFields.payment_progress);
    }
    if (updateFields.last_payment_date !== undefined) {
      setClauses.push('last_payment_date = $' + (values.length + 1));
      values.push(updateFields.last_payment_date);
    }
    if (updateFields.payment_method !== undefined) {
      setClauses.push('payment_method = $' + (values.length + 1));
      values.push(updateFields.payment_method);
    }
    if (updateFields.transaction_id !== undefined) {
      setClauses.push('transaction_id = $' + (values.length + 1));
      values.push(updateFields.transaction_id);
    }
    if (updateFields.updated_at !== undefined) {
      setClauses.push('updated_at = $' + (values.length + 1));
      values.push(updateFields.updated_at);
    }
    
    const setClause = setClauses.join(', ');
    values.push(bookingId); // Add bookingId as last parameter for WHERE clause
    
    console.log('🔧 [SQL DEBUG] SET clause:', setClause);
    console.log('🔧 [SQL DEBUG] Values:', values);
    
    const booking = await sql(`
      UPDATE bookings 
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *
    `, values);
    
    console.log('✅ [PAYMENT UPDATE] Database updated successfully');
    console.log('📄 [PAYMENT UPDATE] Updated booking:', booking[0]);
    
    // SECURITY VALIDATION: Double-check that updated booking belongs to requested vendor
    if (req.params.vendorId) {
      const securityCheck = booking[0].vendor_id === req.params.vendorId;
      if (!securityCheck) {
        console.log(`🚨 SECURITY ERROR: Updated booking does not belong to vendor ${req.params.vendorId}`);
        return res.status(500).json({
          success: false,
          error: 'Data integrity error',
          code: 'DATA_INTEGRITY_VIOLATION',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // NOTE: Receipts are only created via the payment processing flow (/api/payment/process)
    // Do not auto-generate receipts on manual status updates to avoid missing data errors
    if (status === 'deposit_paid' || status === 'fully_paid') {
      console.log('ℹ️ [STATUS UPDATE] Payment status updated. Receipt should be created via payment flow.');
    }
    
    // Respond with updated booking data
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
    
    // WORKAROUND: Database allows: request, approved, downpayment, fully_paid, completed, declined, cancelled
    // Map requested statuses to allowed database statuses, store real status in notes
    let actualStatus = status;
    let statusNote = vendor_notes || null;
    
    if (status === 'quote_sent') {
      actualStatus = 'request';
      statusNote = `QUOTE_SENT: ${vendor_notes || 'Quote has been sent to client'}`;
    } else if (status === 'quote_accepted') {
      actualStatus = 'approved';
      statusNote = `QUOTE_ACCEPTED: ${vendor_notes || 'Quote accepted by couple - ready for payment'}`;
    } else if (status === 'deposit_paid') {
      actualStatus = 'downpayment';
      statusNote = `DEPOSIT_PAID: ${vendor_notes || 'Deposit payment received'}`;
    } else if (status === 'confirmed') {
      actualStatus = 'approved';
      statusNote = vendor_notes;
    } else if (status === 'pending') {
      actualStatus = 'request';
      statusNote = vendor_notes;
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
    
    console.log(`✅ [PUT] Booking status updated: ${bookingId} -> ${status}`);
    
    // Return response in format that frontend expects
    const response = {
      success: true,
      id: booking[0].id,
      status: status,
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
  console.log('✅ [AcceptQuote-PUT] Processing quote acceptance for booking:', req.params.bookingId);
  
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
    
    // WORKAROUND: Database allows: request, approved, downpayment, fully_paid, completed, declined, cancelled
    // Store quote_accepted in notes, use 'approved' status (allowed by constraint)
    const statusNote = `QUOTE_ACCEPTED: ${acceptance_notes || 'Quote accepted by couple'}`;
    
    // Update booking - use 'approved' (allowed by constraint)
    const updatedBooking = await sql`
      UPDATE bookings 
      SET status = 'approved',
          notes = ${statusNote},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    console.log(`✅ [AcceptQuote-PUT] Quote accepted for booking ${bookingId}`);
    
    res.json({
      success: true,
      booking: {
        ...updatedBooking[0],
        status: 'quote_accepted' // Frontend expects this
      },
      message: 'Quote accepted successfully. You can now proceed with payment.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AcceptQuote-PUT] Error accepting quote:', error);
    res.status(500).json({
      success: false,  
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH method support for accept-quote (RESTful standard)
router.patch('/:bookingId/accept-quote', async (req, res) => {
  console.log('✅ [AcceptQuote-PATCH] Processing quote acceptance for booking:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    const { acceptance_notes } = req.body;
    
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
    
    // WORKAROUND: Database allows: request, approved, downpayment, fully_paid, completed, declined, cancelled
    // Store quote_accepted in notes, use 'approved' status (allowed by constraint)
    const statusNote = `QUOTE_ACCEPTED: ${acceptance_notes || 'Quote accepted by couple'}`;
    
    // Update booking - use 'approved' (allowed by constraint)
    const updatedBooking = await sql`
      UPDATE bookings 
      SET status = 'approved',
          notes = ${statusNote},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    console.log(`✅ [AcceptQuote-PATCH] Quote accepted for booking ${bookingId}`);
    
    // Return response with quote_accepted status for frontend
    res.json({
      success: true,
      booking: {
        ...updatedBooking[0],
        status: 'quote_accepted',
        vendor_notes: acceptance_notes || 'Quote accepted by couple'
      },
      message: 'Quote accepted successfully. You can now proceed with deposit payment.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AcceptQuote-PATCH] Error accepting quote:', error);
    res.status(500).json({
      success: false,  
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST method support for accept-quote (backwards compatibility)
router.post('/:bookingId/accept-quote', async (req, res) => {
  console.log('✅ [AcceptQuote-POST] Processing quote acceptance for booking:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    const { acceptance_notes } = req.body;
    
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
    
    // WORKAROUND: Database allows: request, approved, downpayment, fully_paid, completed, declined, cancelled
    // Store quote_accepted in notes, use 'approved' status (allowed by constraint)
    const statusNote = `QUOTE_ACCEPTED: ${acceptance_notes || 'Quote accepted by couple'}`;
    
    // Update booking - use 'approved' (allowed by constraint)
    const updatedBooking = await sql`
      UPDATE bookings 
      SET status = 'approved',
          notes = ${statusNote},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    console.log(`✅ [AcceptQuote-POST] Quote accepted for booking ${bookingId}`);
    
    res.json({
      success: true,
      booking: {
        ...updatedBooking[0],
        status: 'quote_accepted' // Frontend expects this
      },
      message: 'Quote accepted successfully. You can now proceed with deposit payment.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AcceptQuote-POST] Error accepting quote:', error);
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
    
    // FIXED: Database allows deposit_paid and fully_paid statuses directly
    let newStatus = '';
    let statusNote = '';
    let receipt = null;
    
    // Convert amount string to centavos (₱13,500 -> 1350000)
    const amountInCentavos = Math.round(parseFloat(amount.toString().replace(/,/g, '')) * 100);
    
    if (payment_type === 'downpayment') {
      newStatus = 'deposit_paid';
      
      // Create deposit receipt
      try {
        receipt = await createDepositReceipt(
          bookingId,
          booking.couple_id,
          booking.vendor_id,
          amountInCentavos,
          payment_method || 'card',
          transaction_id
        );
        console.log(`✅ [ProcessPayment] Deposit receipt created: ${receipt.receipt_number}`);
        statusNote = `DEPOSIT_PAID: ₱${amount} downpayment received via ${payment_method || 'online payment'}`;
        if (receipt) statusNote += ` (Receipt: ${receipt.receipt_number})`;
        if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
        if (payment_notes) statusNote += ` - ${payment_notes}`;
      } catch (error) {
        console.error('❌ [ProcessPayment] Receipt creation failed:', error);
        statusNote = `DEPOSIT_PAID: ₱${amount} downpayment received via ${payment_method || 'online payment'}`;
        if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
        if (payment_notes) statusNote += ` - ${payment_notes}`;
      }
      
    } else if (payment_type === 'full_payment') {
      newStatus = 'fully_paid';
      
      // Create full payment receipt
      try {
        receipt = await createFullPaymentReceipt(
          bookingId,
          booking.couple_id,
          booking.vendor_id,
          amountInCentavos,
          payment_method || 'card',
          transaction_id
        );
        console.log(`✅ [ProcessPayment] Full payment receipt created: ${receipt.receipt_number}`);
        statusNote = `FULLY_PAID: ₱${amount} full payment received via ${payment_method || 'online payment'}`;
        if (receipt) statusNote += ` (Receipt: ${receipt.receipt_number})`;
        if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
        if (payment_notes) statusNote += ` - ${payment_notes}`;
      } catch (error) {
        console.error('❌ [ProcessPayment] Receipt creation failed:', error);
        statusNote = `FULLY_PAID: ₱${amount} full payment received via ${payment_method || 'online payment'}`;
        if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
        if (payment_notes) statusNote += ` - ${payment_notes}`;
      }
      
    } else if (payment_type === 'remaining_balance') {
      newStatus = 'fully_paid';
      
      // Create balance receipt  
      try {
        // Get total amount from booking (we need this for balance receipt)
        const totalAmount = Math.round(parseFloat(booking.total_amount || booking.amount || 0));
        receipt = await createBalanceReceipt(
          bookingId,
          booking.couple_id,
          booking.vendor_id,
          amountInCentavos,
          totalAmount,
          payment_method || 'card',
          transaction_id
        );
        console.log(`✅ [ProcessPayment] Balance receipt created: ${receipt.receipt_number}`);
        statusNote = `BALANCE_PAID: ₱${amount} remaining balance received via ${payment_method || 'online payment'}`;
        if (receipt) statusNote += ` (Receipt: ${receipt.receipt_number})`;
        if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
        if (payment_notes) statusNote += ` - ${payment_notes}`;
      } catch (error) {
        console.error('❌ [ProcessPayment] Receipt creation failed:', error);
        statusNote = `BALANCE_PAID: ₱${amount} remaining balance received via ${payment_method || 'online payment'}`;
        if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
        if (payment_notes) statusNote += ` - ${payment_notes}`;
      }
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
    
    console.log(`💳 [ProcessPayment] Payment processed: ${bookingId} -> ${newStatus} (₱${amount})`);
    
    res.json({
      success: true,
      booking: {
        ...updatedBooking[0],
        payment_type,
        amount_paid: amount,
        transaction_id,
        payment_method
      },
      receipt: receipt ? {
        receipt_number: receipt.receipt_number,
        amount: receipt.amount_paid,
        payment_method: receipt.payment_method
      } : null,
      message: `Payment of ₱${amount} processed successfully${receipt ? ` (Receipt: ${receipt.receipt_number})` : ''}`,
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

// Direct cancellation (for 'request' or 'quote_requested' status only)
router.post('/:bookingId/cancel', async (req, res) => {
  console.log('🚫 [CANCEL-BOOKING] Processing direct cancellation...');
  
  try {
    const { bookingId } = req.params;
    const { userId, reason } = req.body;
    
    console.log(`🚫 [CANCEL-BOOKING] Booking ID: ${bookingId}, User ID: ${userId}`);
    
    // Get booking details
    const bookings = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    
    // Security: Verify user owns this booking
    if (booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only cancel your own bookings'
      });
    }
    
    // Only allow direct cancellation for request/quote_requested status
    const allowedStatuses = ['request', 'quote_requested'];
    if (!allowedStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot directly cancel booking with status: ${booking.status}. Please use cancellation request instead.`,
        requiresApproval: true
      });
    }
    
    // Perform cancellation
    await sql`
      UPDATE bookings 
      SET 
        status = 'cancelled',
        notes = ${reason ? `CANCELLED: ${reason}` : 'CANCELLED: User cancelled during request phase'},
        updated_at = NOW()
      WHERE id = ${bookingId}
    `;
    
    console.log(`✅ [CANCEL-BOOKING] Booking ${bookingId} cancelled successfully`);
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      bookingId: bookingId,
      newStatus: 'cancelled'
    });
    
  } catch (error) {
    console.error('❌ [CANCEL-BOOKING] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

// Request cancellation (for bookings with payments or confirmed status)
router.post('/:bookingId/request-cancellation', async (req, res) => {
  console.log('📝 [REQUEST-CANCELLATION] Processing cancellation request...');
  
  try {
    const { bookingId } = req.params;
    const { userId, reason } = req.body;
    
    console.log(`📝 [REQUEST-CANCELLATION] Booking ID: ${bookingId}, User ID: ${userId}`);
    
    // Get booking details
    const bookings = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    
    // Security: Verify user owns this booking
    if (booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only request cancellation for your own bookings'
      });
    }
    
    // Cannot request cancellation if already cancelled or completed
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a completed booking'
      });
    }
    
    // Update booking to pending_cancellation status
    await sql`
      UPDATE bookings 
      SET 
        status = 'pending_cancellation',
        notes = ${reason ? `CANCELLATION_REQUESTED: ${reason}` : 'CANCELLATION_REQUESTED: Client requested cancellation'},
        updated_at = NOW()
      WHERE id = ${bookingId}
    `;
    
    console.log(`✅ [REQUEST-CANCELLATION] Cancellation request submitted for booking ${bookingId}`);
    
    // TODO: Send notification to vendor and admin
    
    res.json({
      success: true,
      message: 'Cancellation request submitted successfully. The vendor and admin will review your request.',
      bookingId: bookingId,
      newStatus: 'pending_cancellation',
      requiresApproval: true
    });
    
  } catch (error) {
    console.error('❌ [REQUEST-CANCELLATION] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit cancellation request'
    });
  }
});

// ============================================================================
// SEND QUOTE WITH ITEMIZATION - New Enhanced Endpoint
// ============================================================================
router.put('/:bookingId/send-quote', async (req, res) => {
  console.log('💰 [SEND-QUOTE] Sending quote with itemization:', req.params.bookingId);
  
  try {
    const { bookingId } = req.params;
    const { 
      quotedPrice, 
      quotedDeposit, 
      itemization, 
      vendorNotes, 
      validityDays = 30 
    } = req.body;
    
    // Validation
    if (!quotedPrice || quotedPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quoted price is required and must be greater than 0'
      });
    }
    
    // Check if booking exists
    const existingBooking = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId}
    `;
    
    if (existingBooking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    const booking = existingBooking[0];
    
    // Calculate deposit if not provided (default 30%)
    const calculatedDeposit = quotedDeposit || Math.round(quotedPrice * 0.3);
    
    // Calculate quote expiration date
    const quoteValidUntil = new Date();
    quoteValidUntil.setDate(quoteValidUntil.getDate() + validityDays);
    
    // Prepare itemization JSONB
    const itemizationData = itemization || {
      items: [{
        name: booking.service_type || 'Wedding Service',
        description: 'Full service package',
        quantity: 1,
        unitPrice: quotedPrice,
        total: quotedPrice
      }],
      subtotal: quotedPrice,
      discount: 0,
      total: quotedPrice,
      deposit: calculatedDeposit,
      depositPercentage: Math.round((calculatedDeposit / quotedPrice) * 100),
      notes: vendorNotes || '',
      validUntil: quoteValidUntil.toISOString().split('T')[0]
    };
    
    console.log('📊 [SEND-QUOTE] Quote data:', {
      bookingId,
      quotedPrice,
      quotedDeposit: calculatedDeposit,
      validUntil: quoteValidUntil.toISOString(),
      itemsCount: itemizationData.items?.length || 0
    });
    
    // Update booking with quote information
    const updatedBooking = await sql`
      UPDATE bookings 
      SET 
        status = 'request',
        notes = ${'QUOTE_SENT: ' + (vendorNotes || 'Quote has been sent to client')},
        amount = ${quotedPrice},
        quoted_price = ${quotedPrice},
        quoted_deposit = ${calculatedDeposit},
        quote_itemization = ${JSON.stringify(itemizationData)},
        quote_sent_date = NOW(),
        quote_valid_until = ${quoteValidUntil.toISOString()},
        updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    if (updatedBooking.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update booking with quote'
      });
    }
    
    console.log('✅ [SEND-QUOTE] Quote sent successfully for booking:', bookingId);
    
    // Process the booking to show quote_sent status
    const processedBooking = { ...updatedBooking[0] };
    if (processedBooking.notes && processedBooking.notes.startsWith('QUOTE_SENT:')) {
      processedBooking.status = 'quote_sent';
      processedBooking.vendor_notes = processedBooking.notes.substring('QUOTE_SENT:'.length).trim();
    }
    
    res.json({
      success: true,
      message: 'Quote sent successfully to couple',
      booking: processedBooking,
      quote: {
        totalPrice: quotedPrice,
        depositAmount: calculatedDeposit,
        depositPercentage: Math.round((calculatedDeposit / quotedPrice) * 100),
        validUntil: quoteValidUntil.toISOString(),
        itemsCount: itemizationData.items?.length || 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [SEND-QUOTE] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send quote',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

// Force deploy - workaround fix
