/**
 * Admin Bookings API Module
 * Handles booking management endpoints for admin panel
 * Uses Neon serverless sql tag for database operations
 */

const express = require('express');

// Import database with error handling
let sql;
try {
  console.log('🔍 Loading database module for admin bookings...');
  const dbModule = require('../../config/database.cjs');
  sql = dbModule.sql;
  console.log('✅ Database module loaded successfully');
  
  if (!sql || typeof sql !== 'function') {
    throw new Error('Database module did not export a valid sql function');
  }
} catch (error) {
  console.error('❌ Failed to load database module:', error);
  throw error;
}

const router = express.Router();

/**
 * GET /api/admin/bookings
 * Get all bookings with statistics
 */
router.get('/', async (req, res) => {
  try {
    console.log('📊 [AdminAPI] Fetching all bookings for admin...');

    // Get all bookings
    const bookings = await sql`
      SELECT 
        id,
        service_id,
        service_name,
        vendor_id,
        vendor_name,
        couple_id,
        couple_name,
        event_date,
        event_time,
        event_location,
        guest_count,
        service_type,
        budget_range,
        special_requests,
        contact_phone,
        preferred_contact_method,
        status,
        total_amount,
        deposit_amount,
        notes,
        contract_details,
        response_message,
        estimated_cost_min,
        estimated_cost_max,
        estimated_cost_currency,
        process_stage,
        progress_percentage,
        next_action,
        next_action_by,
        last_activity_at,
        created_at,
        updated_at
      FROM bookings
      ORDER BY created_at DESC
    `;

    // Calculate statistics
    const stats = {
      total: bookings.length,
      request: bookings.filter(b => b.status === 'request').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      downpayment: bookings.filter(b => b.status === 'downpayment').length,
      fully_paid: bookings.filter(b => b.status === 'fully_paid').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      declined: bookings.filter(b => b.status === 'declined').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.total_amount)
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
      totalDeposits: bookings
        .filter(b => b.deposit_amount)
        .reduce((sum, b) => sum + parseFloat(b.deposit_amount || 0), 0),
      byServiceType: {}
    };

    // Group by service type
    bookings.forEach(booking => {
      if (booking.service_type) {
        stats.byServiceType[booking.service_type] = 
          (stats.byServiceType[booking.service_type] || 0) + 1;
      }
    });

    console.log(`✅ [AdminAPI] Found ${bookings.length} bookings`);
    console.log('📈 [AdminAPI] Stats:', stats);

    res.json({
      success: true,
      bookings,
      stats
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/bookings/stats
 * Get booking statistics only
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 [AdminAPI] Fetching booking stats...');

    const bookings = await sql`
      SELECT status, total_amount, deposit_amount, service_type
      FROM bookings
    `;

    const stats = {
      total: bookings.length,
      request: bookings.filter(b => b.status === 'request').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      downpayment: bookings.filter(b => b.status === 'downpayment').length,
      fully_paid: bookings.filter(b => b.status === 'fully_paid').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      declined: bookings.filter(b => b.status === 'declined').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.total_amount)
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
      totalDeposits: bookings
        .filter(b => b.deposit_amount)
        .reduce((sum, b) => sum + parseFloat(b.deposit_amount || 0), 0),
      byServiceType: {}
    };

    bookings.forEach(booking => {
      if (booking.service_type) {
        stats.byServiceType[booking.service_type] = 
          (stats.byServiceType[booking.service_type] || 0) + 1;
      }
    });

    console.log('✅ [AdminAPI] Booking stats calculated');

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking stats',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/bookings/:bookingId
 * Get a specific booking by ID
 */
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log(`📋 [AdminAPI] Fetching booking ${bookingId}...`);

    const booking = await sql`
      SELECT *
      FROM bookings
      WHERE id = ${bookingId}
    `;

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    console.log(`✅ [AdminAPI] Found booking ${bookingId}`);

    res.json({
      success: true,
      booking: booking[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      details: error.message
    });
  }
});

/**
 * PATCH /api/admin/bookings/:bookingId/status
 * Update booking status
 */
router.patch('/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    console.log(`🔄 [AdminAPI] Updating booking ${bookingId} status to ${status}...`);

    // Validate status
    const validStatuses = ['request', 'approved', 'downpayment', 'fully_paid', 'completed', 'declined', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const result = await sql`
      UPDATE bookings
      SET 
        status = ${status},
        updated_at = NOW(),
        last_activity_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    console.log(`✅ [AdminAPI] Updated booking ${bookingId} status`);

    res.json({
      success: true,
      booking: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      details: error.message
    });
  }
});

/**
 * PATCH /api/admin/bookings/:bookingId
 * Update booking details
 */
router.patch('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    console.log(`🔄 [AdminAPI] Updating booking ${bookingId}...`);

    // Build dynamic update query
    const allowedFields = [
      'status', 'total_amount', 'deposit_amount', 'notes', 
      'contract_details', 'response_message', 'process_stage',
      'progress_percentage', 'next_action', 'next_action_by'
    ];

    const updateFields = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = $${key}`)
      .join(', ');

    if (!updateFields) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const result = await sql`
      UPDATE bookings
      SET ${sql(updates, ...allowedFields)},
          updated_at = NOW(),
          last_activity_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    console.log(`✅ [AdminAPI] Updated booking ${bookingId}`);

    res.json({
      success: true,
      booking: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking',
      details: error.message
    });
  }
});

/**
 * DELETE /api/admin/bookings/:bookingId
 * Delete a booking (soft delete by setting status to cancelled)
 */
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log(`🗑️ [AdminAPI] Deleting booking ${bookingId}...`);

    // Soft delete by setting status to cancelled
    const result = await sql`
      UPDATE bookings
      SET 
        status = 'cancelled',
        updated_at = NOW(),
        last_activity_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    console.log(`✅ [AdminAPI] Deleted (cancelled) booking ${bookingId}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete booking',
      details: error.message
    });
  }
});

module.exports = router;
