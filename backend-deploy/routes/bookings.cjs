const express = require('express');
const { sql } = require('../config/database.cjs');

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
    
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log(`🔍 SECURE: Searching for bookings with exact vendor_id: "${requestedVendorId}"`);
    
    // SECURITY FIX: Only search for exact vendor ID match, no legacy fallback
    let query = `
      SELECT * FROM bookings 
      WHERE vendor_id = $1
    `;
    let params = [requestedVendorId];
    
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
          v.location as vendor_location
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
            v.location as vendor_location
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
    
    if (payment_type === 'downpayment') {
      newStatus = 'deposit_paid';
      statusNote = `DEPOSIT_PAID: ₱${amount} downpayment received via ${payment_method || 'online payment'}`;
      if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
      if (payment_notes) statusNote += ` - ${payment_notes}`;
      
    } else if (payment_type === 'full_payment') {
      newStatus = 'fully_paid';
      statusNote = `FULLY_PAID: ₱${amount} full payment received via ${payment_method || 'online payment'}`;
      if (transaction_id) statusNote += ` (Transaction ID: ${transaction_id})`;
      if (payment_notes) statusNote += ` - ${payment_notes}`;
      
    } else if (payment_type === 'remaining_balance') {
      newStatus = 'fully_paid';
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

// Force deploy - workaround fix
