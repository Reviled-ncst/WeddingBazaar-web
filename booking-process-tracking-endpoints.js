/**
 * BOOKING PROCESS TRACKING ENDPOINTS
 * 
 * Add these endpoints to the production backend to enable comprehensive
 * booking process tracking and logging.
 */

// ================================
// BOOKING PROCESS TRACKING ENDPOINTS
// ================================

// Initialize booking process tracking database
app.post('/api/bookings/init-tracking', async (req, res) => {
  try {
    console.log('🔧 [PROCESS] Initializing booking process tracking tables...');
    
    // Create booking process log table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_process_log (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        process_step VARCHAR(50) NOT NULL,
        process_status VARCHAR(30) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_by VARCHAR(100),
        created_by_type VARCHAR(20) CHECK (created_by_type IN ('couple', 'vendor', 'admin', 'system')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_booking_process_booking ON booking_process_log(booking_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_booking_process_step ON booking_process_log(process_step)
    `;
    
    // Create payment tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('downpayment', 'partial', 'full', 'refund')),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'PHP',
        payment_method VARCHAR(50),
        payment_provider VARCHAR(50),
        payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
        transaction_id VARCHAR(200),
        provider_reference VARCHAR(200),
        metadata JSONB,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_booking_payments_booking ON booking_payments(booking_id)
    `;
    
    // Create communication tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS booking_communications (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('quote', 'message', 'call', 'meeting', 'email', 'contract')),
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('couple', 'vendor', 'admin', 'system')),
        sender_id VARCHAR(100),
        sender_name VARCHAR(200),
        recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('couple', 'vendor', 'admin', 'system')),
        recipient_id VARCHAR(100),
        subject VARCHAR(500),
        content TEXT,
        metadata JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add process tracking columns to bookings table
    try {
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS process_stage VARCHAR(50) DEFAULT 'inquiry'`;
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0`;
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_action VARCHAR(200)`;
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_action_by VARCHAR(20)`;
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    } catch (alterError) {
      console.log('⚠️ [PROCESS] Some columns may already exist:', alterError.message);
    }
    
    console.log('✅ [PROCESS] Booking process tracking initialized successfully');
    
    res.json({
      success: true,
      message: 'Booking process tracking initialized',
      tables_created: ['booking_process_log', 'booking_payments', 'booking_communications'],
      columns_added: ['process_stage', 'progress_percentage', 'next_action', 'next_action_by', 'last_activity_at'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PROCESS] Error initializing tracking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize booking process tracking',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Log a process step
app.post('/api/bookings/:bookingId/log-process', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { 
      process_step, 
      process_status, 
      description, 
      metadata, 
      created_by, 
      created_by_type 
    } = req.body;
    
    console.log('📋 [PROCESS] Logging process step for booking:', bookingId);
    console.log('📝 [PROCESS] Step:', process_step, 'Status:', process_status);
    
    // Insert process log entry
    const logEntry = await sql`
      INSERT INTO booking_process_log (
        booking_id, process_step, process_status, description, 
        metadata, created_by, created_by_type
      ) VALUES (
        ${bookingId}, ${process_step}, ${process_status}, ${description},
        ${JSON.stringify(metadata || {})}, ${created_by}, ${created_by_type}
      ) RETURNING *
    `;
    
    // Update booking progress based on process step
    const progressMap = {
      'inquiry': { progress: 10, next_action: 'Vendor to review and respond', next_action_by: 'vendor' },
      'vendor_reviewed': { progress: 20, next_action: 'Vendor to send quote', next_action_by: 'vendor' },
      'quote_sent': { progress: 30, next_action: 'Couple to review quote', next_action_by: 'couple' },
      'quote_reviewed': { progress: 40, next_action: 'Couple to accept/decline quote', next_action_by: 'couple' },
      'quote_accepted': { progress: 50, next_action: 'Process downpayment', next_action_by: 'couple' },
      'contract_sent': { progress: 60, next_action: 'Couple to sign contract', next_action_by: 'couple' },
      'downpayment_pending': { progress: 70, next_action: 'Complete payment processing', next_action_by: 'system' },
      'downpayment_confirmed': { progress: 80, next_action: 'Await event and final payment', next_action_by: 'couple' },
      'final_payment_due': { progress: 90, next_action: 'Process final payment', next_action_by: 'couple' },
      'completed': { progress: 100, next_action: 'Service delivery completed', next_action_by: 'vendor' },
      'cancelled': { progress: 0, next_action: 'Process refund if applicable', next_action_by: 'admin' }
    };
    
    const progressInfo = progressMap[process_step] || { progress: 0, next_action: 'Pending', next_action_by: 'system' };
    
    // Update booking with new progress information
    await sql`
      UPDATE bookings 
      SET 
        process_stage = ${process_step},
        progress_percentage = ${progressInfo.progress},
        next_action = ${progressInfo.next_action},
        next_action_by = ${progressInfo.next_action_by},
        last_activity_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [PROCESS] Process step logged and booking updated');
    
    res.json({
      success: true,
      log_entry: logEntry[0],
      progress_updated: progressInfo,
      message: 'Process step logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PROCESS] Error logging process step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log process step',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Log payment
app.post('/api/bookings/:bookingId/log-payment', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      payment_type,
      amount,
      currency = 'PHP',
      payment_method,
      payment_provider,
      payment_status,
      transaction_id,
      provider_reference,
      metadata
    } = req.body;
    
    console.log('💳 [PAYMENT] Logging payment for booking:', bookingId);
    console.log('💰 [PAYMENT] Amount:', amount, currency, 'Type:', payment_type, 'Status:', payment_status);
    
    // Insert payment log entry
    const paymentEntry = await sql`
      INSERT INTO booking_payments (
        booking_id, payment_type, amount, currency, payment_method,
        payment_provider, payment_status, transaction_id, provider_reference, metadata,
        processed_at
      ) VALUES (
        ${bookingId}, ${payment_type}, ${amount}, ${currency}, ${payment_method},
        ${payment_provider}, ${payment_status}, ${transaction_id}, ${provider_reference},
        ${JSON.stringify(metadata || {})}, 
        ${payment_status === 'completed' ? new Date() : null}
      ) RETURNING *
    `;
    
    // Auto-log process step based on payment
    let processStep = '';
    let processDescription = '';
    
    if (payment_type === 'downpayment' && payment_status === 'completed') {
      processStep = 'downpayment_confirmed';
      processDescription = `Downpayment of ${amount} ${currency} confirmed via ${payment_method}`;
    } else if (payment_type === 'full' && payment_status === 'completed') {
      processStep = 'completed';
      processDescription = `Full payment of ${amount} ${currency} completed via ${payment_method}`;
    } else if (payment_status === 'pending') {
      processStep = payment_type === 'downpayment' ? 'downpayment_pending' : 'final_payment_due';
      processDescription = `${payment_type} payment of ${amount} ${currency} is pending`;
    }
    
    if (processStep) {
      await sql`
        INSERT INTO booking_process_log (
          booking_id, process_step, process_status, description, 
          metadata, created_by, created_by_type
        ) VALUES (
          ${bookingId}, ${processStep}, ${payment_status}, ${processDescription},
          ${JSON.stringify({ payment_id: paymentEntry[0].id, ...metadata })}, 
          'system', 'system'
        )
      `;
      
      // Update booking progress
      const progressInfo = {
        'downpayment_pending': { progress: 70, next_action: 'Complete payment processing', next_action_by: 'system' },
        'downpayment_confirmed': { progress: 80, next_action: 'Await event and final payment', next_action_by: 'couple' },
        'final_payment_due': { progress: 90, next_action: 'Process final payment', next_action_by: 'couple' },
        'completed': { progress: 100, next_action: 'Service delivery completed', next_action_by: 'vendor' }
      }[processStep];
      
      if (progressInfo) {
        await sql`
          UPDATE bookings 
          SET 
            process_stage = ${processStep},
            progress_percentage = ${progressInfo.progress},
            next_action = ${progressInfo.next_action},
            next_action_by = ${progressInfo.next_action_by},
            last_activity_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${bookingId}
        `;
      }
    }
    
    console.log('✅ [PAYMENT] Payment logged and process updated');
    
    res.json({
      success: true,
      payment_entry: paymentEntry[0],
      process_step_logged: processStep || null,
      message: 'Payment logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PAYMENT] Error logging payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log payment',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Log communication
app.post('/api/bookings/:bookingId/log-communication', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      communication_type,
      sender_type,
      sender_id,
      sender_name,
      recipient_type,
      recipient_id,
      subject,
      content,
      metadata
    } = req.body;
    
    console.log('💬 [COMM] Logging communication for booking:', bookingId);
    console.log('📧 [COMM] Type:', communication_type, 'From:', sender_type, 'To:', recipient_type);
    
    // Insert communication log entry
    const commEntry = await sql`
      INSERT INTO booking_communications (
        booking_id, communication_type, sender_type, sender_id, sender_name,
        recipient_type, recipient_id, subject, content, metadata
      ) VALUES (
        ${bookingId}, ${communication_type}, ${sender_type}, ${sender_id}, ${sender_name},
        ${recipient_type}, ${recipient_id}, ${subject}, ${content}, 
        ${JSON.stringify(metadata || {})}
      ) RETURNING *
    `;
    
    // Auto-log process step for certain communications
    let processStep = '';
    let processDescription = '';
    
    if (communication_type === 'quote') {
      processStep = 'quote_sent';
      processDescription = `Quote sent from ${sender_name} to couple`;
    } else if (communication_type === 'contract') {
      processStep = 'contract_sent';
      processDescription = `Contract sent from ${sender_name} to couple`;
    }
    
    if (processStep) {
      await sql`
        INSERT INTO booking_process_log (
          booking_id, process_step, process_status, description, 
          metadata, created_by, created_by_type
        ) VALUES (
          ${bookingId}, ${processStep}, 'completed', ${processDescription},
          ${JSON.stringify({ communication_id: commEntry[0].id, ...metadata })}, 
          ${sender_id}, ${sender_type}
        )
      `;
    }
    
    // Update last activity
    await sql`
      UPDATE bookings 
      SET last_activity_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [COMM] Communication logged');
    
    res.json({
      success: true,
      communication_entry: commEntry[0],
      process_step_logged: processStep || null,
      message: 'Communication logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [COMM] Error logging communication:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log communication',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get booking process history
app.get('/api/bookings/:bookingId/process-history', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log('📜 [PROCESS] Getting process history for booking:', bookingId);
    
    // Get process log entries
    const processHistory = await sql`
      SELECT * FROM booking_process_log 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    // Get payment history
    const paymentHistory = await sql`
      SELECT * FROM booking_payments 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    // Get communication history
    const communicationHistory = await sql`
      SELECT * FROM booking_communications 
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
    `;
    
    // Get current booking status
    const booking = await sql`
      SELECT process_stage, progress_percentage, next_action, next_action_by, last_activity_at
      FROM bookings 
      WHERE id = ${bookingId}
    `;
    
    console.log('✅ [PROCESS] Retrieved complete process history');
    
    res.json({
      success: true,
      booking_status: booking[0] || null,
      process_history: processHistory,
      payment_history: paymentHistory,
      communication_history: communicationHistory,
      summary: {
        total_process_steps: processHistory.length,
        total_payments: paymentHistory.length,
        total_communications: communicationHistory.length,
        current_stage: booking[0]?.process_stage || 'unknown',
        progress_percentage: booking[0]?.progress_percentage || 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PROCESS] Error getting process history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get process history',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = {
  // Export these functions if needed for testing
};
