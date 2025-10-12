/**
 * BACKEND API ENDPOINTS FIX
 * This file contains the corrected backend endpoints to fix the schema issues
 * and add proper quote management functionality.
 */

// === BOOKING STATUS UPDATE ENDPOINT (FIXED) ===

// Fix for PUT /api/bookings/:id/status endpoint
app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, reason } = req.body;

    console.log('🔄 [API] PUT /api/bookings/:id/status called:', { id, status, message, reason });

    // Validate status value
    const allowedStatuses = [
      'pending', 'quote_requested', 'quote_sent', 'quote_accepted', 
      'quote_rejected', 'confirmed', 'cancelled', 'completed', 'refunded', 'disputed'
    ];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Update using the database function we created
    const result = await db.query(
      'SELECT update_booking_status($1, $2, $3, $4) as success',
      [id, status, reason || message, 'api']
    );

    if (result.rows[0].success) {
      // Get the updated booking
      const bookingResult = await db.query(
        'SELECT * FROM bookings WHERE id = $1',
        [id]
      );

      if (bookingResult.rows.length > 0) {
        const booking = bookingResult.rows[0];
        console.log('✅ [API] Booking status updated successfully:', booking);
        
        res.json({
          success: true,
          booking: booking,
          message: `Booking status updated to ${status}`,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Booking not found after update',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to update booking status',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('💥 [API] Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === PATCH ENDPOINT (ALTERNATIVE METHOD) ===
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, reason } = req.body;

    console.log('🔄 [API] PATCH /api/bookings/:id/status called:', { id, status, message, reason });

    // Use the same logic as PUT endpoint
    const allowedStatuses = [
      'pending', 'quote_requested', 'quote_sent', 'quote_accepted', 
      'quote_rejected', 'confirmed', 'cancelled', 'completed', 'refunded', 'disputed'
    ];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Update the booking with the new schema
    const updateQuery = `
      UPDATE bookings 
      SET status = $1, 
          status_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await db.query(updateQuery, [status, reason || message, id]);

    if (result.rows.length > 0) {
      const booking = result.rows[0];
      console.log('✅ [API] Booking status updated via PATCH:', booking);
      
      res.json({
        success: true,
        booking: booking,
        message: `Booking status updated to ${status}`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('💥 [API] Error in PATCH booking status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === GET SINGLE BOOKING ENDPOINT (MISSING) ===
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 [API] GET /api/bookings/:id called for ID:', id);

    const result = await db.query(
      'SELECT * FROM bookings_with_quotes WHERE id = $1',
      [id]
    );

    if (result.rows.length > 0) {
      const booking = result.rows[0];
      console.log('✅ [API] Found booking:', booking.id);
      
      res.json({
        success: true,
        booking: booking,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ [API] Booking not found:', id);
      res.status(404).json({
        success: false,
        error: 'Booking not found',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('💥 [API] Error getting booking:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === QUOTE MANAGEMENT ENDPOINTS ===

// Create a new quote for a booking
app.post('/api/bookings/:id/quote', async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const quoteData = req.body;

    console.log('📋 [API] Creating quote for booking:', bookingId);

    // Generate quote number
    const quoteNumber = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Insert quote
    const insertQuery = `
      INSERT INTO quotes (
        booking_id, quote_number, service_items, subtotal, tax, total,
        downpayment_percentage, downpayment_amount, valid_until, message, terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      bookingId,
      quoteNumber,
      JSON.stringify(quoteData.service_items),
      quoteData.subtotal,
      quoteData.tax,
      quoteData.total,
      quoteData.downpayment_percentage,
      quoteData.downpayment_amount,
      quoteData.valid_until,
      quoteData.message,
      quoteData.terms
    ]);

    // Update booking status to quote_sent
    await db.query(
      'SELECT update_booking_status($1, $2, $3, $4)',
      [bookingId, 'quote_sent', 'Quote sent to client', 'vendor']
    );

    res.json({
      success: true,
      quote: result.rows[0],
      message: 'Quote created and sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 [API] Error creating quote:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get quotes for a booking
app.get('/api/bookings/:id/quotes', async (req, res) => {
  try {
    const { id: bookingId } = req.params;

    const result = await db.query(
      'SELECT * FROM quotes WHERE booking_id = $1 ORDER BY created_at DESC',
      [bookingId]
    );

    res.json({
      success: true,
      quotes: result.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 [API] Error getting quotes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === BOOKING CREATION ENDPOINT (ENHANCED) ===
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    console.log('📝 [API] Creating new booking:', bookingData);

    // Generate booking ID
    const bookingId = `${bookingData.vendor_id}-${Date.now()}`;

    // Enhanced booking creation with all required fields
    const insertQuery = `
      INSERT INTO bookings (
        id, vendor_id, couple_id, service_type, event_date, event_time,
        event_location, guest_count, contact_email, contact_phone,
        special_requests, budget_range, preferred_contact_method,
        status, status_reason, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const result = await db.query(insertQuery, [
      bookingId,
      bookingData.vendor_id,
      bookingData.couple_id,
      bookingData.service_type,
      bookingData.event_date,
      bookingData.event_time,
      bookingData.event_location,
      bookingData.guest_count,
      bookingData.contact_email,
      bookingData.contact_phone,
      bookingData.special_requests,
      bookingData.budget_range,
      bookingData.preferred_contact_method,
      'pending',
      'New booking request submitted',
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    res.json({
      success: true,
      booking: result.rows[0],
      message: 'Booking created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 [API] Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// === HEALTH CHECK WITH SCHEMA INFO ===
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await db.query('SELECT NOW() as timestamp');
    
    // Check bookings table schema
    const schemaCheck = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `);

    // Get booking statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'quote_sent' THEN 1 END) as quote_sent_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings
      FROM bookings
    `);

    res.json({
      status: 'OK',
      timestamp: dbTest.rows[0].timestamp,
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development',
      version: '3.0.0-BACKEND-SCHEMA-FIXED',
      schema: {
        bookings_columns: schemaCheck.rows.length,
        has_status_reason: schemaCheck.rows.some(col => col.column_name === 'status_reason'),
        has_quote_data: schemaCheck.rows.some(col => col.column_name === 'quote_data')
      },
      statistics: statsResult.rows[0],
      endpoints: {
        health: 'Active',
        bookings: 'Enhanced',
        quotes: 'New',
        'booking-status': 'Fixed',
        'individual-booking': 'Added'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = {
  // Export functions for testing
  updateBookingStatus: async (id, status, reason) => {
    const result = await db.query(
      'SELECT update_booking_status($1, $2, $3, $4) as success',
      [id, status, reason, 'api']
    );
    return result.rows[0].success;
  }
};
