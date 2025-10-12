// BACKEND API ENDPOINTS FIX
// Add these to your main backend server file

// Fix the PATCH /api/bookings/:id/status endpoint
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, reason } = req.body;

    console.log('📋 Status update request:', { id, status, message });

    // Updated allowed statuses (including quote_sent)
    const allowedStatuses = [
      'pending', 'quote_requested', 'quote_sent', 'quote_accepted', 
      'quote_rejected', 'confirmed', 'cancelled', 'completed'
    ];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Update with the new schema (including status_reason column)
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
      console.log('✅ Booking status updated:', result.rows[0]);
      
      res.json({
        success: true,
        booking: result.rows[0],
        message: `Status updated to ${status}`,
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
    console.error('💥 Status update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add missing PUT endpoint as alternative
app.put('/api/bookings/:id/status', async (req, res) => {
  // Use same logic as PATCH
  return app._router.handle(Object.assign(req, { method: 'PATCH' }), res);
});

// Add missing GET individual booking endpoint
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        booking: result.rows[0],
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
    console.error('💥 Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced health check with schema validation
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await db.query('SELECT NOW() as timestamp');
    
    // Check if schema fixes are applied
    const schemaCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'status_reason'
    `);
    
    const hasStatusReason = schemaCheck.rows.length > 0;
    
    res.json({
      status: 'OK',
      timestamp: dbTest.rows[0].timestamp,
      database: 'Connected',
      version: '3.0.0-SCHEMA-FIXED',
      schema: {
        status_reason_column: hasStatusReason ? 'Present' : 'Missing',
        schema_fixed: hasStatusReason
      },
      endpoints: {
        'bookings-status-patch': 'Fixed',
        'bookings-status-put': 'Added',
        'individual-booking': 'Added'
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
