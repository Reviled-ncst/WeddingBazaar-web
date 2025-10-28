/**
 * 🎉 Booking Completion Endpoints
 * Two-sided completion system: Both vendor AND couple must confirm completion
 * 
 * Flow:
 * 1. Booking must be 'paid_in_full' or 'fully_paid'
 * 2. Vendor can mark as completed → vendor_completed = TRUE
 * 3. Couple can mark as completed → couple_completed = TRUE
 * 4. When BOTH are TRUE → status changes to 'completed'
 */

const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

/**
 * POST /api/bookings/:bookingId/mark-completed
 * Mark booking as completed from vendor or couple side
 * 
 * Body: {
 *   completed_by: 'vendor' | 'couple',
 *   notes: 'Optional completion notes'
 * }
 */
router.post('/:bookingId/mark-completed', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { completed_by, notes } = req.body;

    console.log(`🎉 Marking booking ${bookingId} as completed by ${completed_by}`);

    // Validate input
    if (!completed_by || !['vendor', 'couple'].includes(completed_by)) {
      return res.status(400).json({
        success: false,
        error: 'completed_by must be either "vendor" or "couple"'
      });
    }

    // Get current booking
    const booking = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId} LIMIT 1
    `;

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const currentBooking = booking[0];

    // Check if booking is fully paid
    const paidStatuses = ['paid_in_full', 'fully_paid', 'completed'];
    if (!paidStatuses.includes(currentBooking.status)) {
      return res.status(400).json({
        success: false,
        error: 'Booking must be fully paid before marking as completed',
        current_status: currentBooking.status
      });
    }

    // Check if already marked by this party
    if (completed_by === 'vendor' && currentBooking.vendor_completed) {
      return res.status(400).json({
        success: false,
        error: 'Vendor has already marked this booking as completed',
        message: 'Waiting for couple to confirm completion'
      });
    }

    if (completed_by === 'couple' && currentBooking.couple_completed) {
      return res.status(400).json({
        success: false,
        error: 'Couple has already marked this booking as completed',
        message: 'Waiting for vendor to confirm completion'
      });
    }

    // Update completion status
    let updatedBooking;
    if (completed_by === 'vendor') {
      updatedBooking = await sql`
        UPDATE bookings
        SET 
          vendor_completed = TRUE,
          vendor_completed_at = NOW(),
          completion_notes = COALESCE(${notes}, completion_notes),
          updated_at = NOW()
        WHERE id = ${bookingId}
        RETURNING *
      `;
    } else {
      updatedBooking = await sql`
        UPDATE bookings
        SET 
          couple_completed = TRUE,
          couple_completed_at = NOW(),
          completion_notes = COALESCE(${notes}, completion_notes),
          updated_at = NOW()
        WHERE id = ${bookingId}
        RETURNING *
      `;
    }

    let updated = updatedBooking[0];

    // Check if BOTH sides have now confirmed - if so, mark as completed
    if (updated.vendor_completed && updated.couple_completed && updated.status !== 'completed') {
      console.log(`🎉 Both sides confirmed! Updating booking ${bookingId} to COMPLETED status`);
      const completedBooking = await sql`
        UPDATE bookings
        SET 
          status = 'completed',
          fully_completed = TRUE,
          fully_completed_at = NOW(),
          updated_at = NOW()
        WHERE id = ${bookingId}
        RETURNING *
      `;
      updated = completedBooking[0]; // Use the updated record with 'completed' status
      console.log(`✅ Booking ${bookingId} is now COMPLETED. Status: ${updated.status}`);
    }

    res.json({
      success: true,
      message: completed_by === 'vendor' 
        ? 'Vendor marked booking as completed' 
        : 'Couple marked booking as completed',
      booking: {
        id: updated.id,
        status: updated.status, // Now returns correct 'completed' status
        vendor_completed: updated.vendor_completed,
        vendor_completed_at: updated.vendor_completed_at,
        couple_completed: updated.couple_completed,
        couple_completed_at: updated.couple_completed_at,
        fully_completed: updated.fully_completed || false,
        fully_completed_at: updated.fully_completed_at,
        completion_notes: updated.completion_notes,
        both_completed: updated.vendor_completed && updated.couple_completed
      },
      waiting_for: updated.vendor_completed && updated.couple_completed 
        ? null 
        : updated.vendor_completed 
          ? 'couple' 
          : 'vendor'
    });

  } catch (error) {
    console.error('❌ Error marking booking as completed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark booking as completed',
      message: error.message
    });
  }
});

/**
 * GET /api/bookings/:bookingId/completion-status
 * Get completion status of a booking
 */
router.get('/:bookingId/completion-status', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await sql`
      SELECT 
        id,
        status,
        vendor_completed,
        vendor_completed_at,
        couple_completed,
        couple_completed_at,
        fully_completed,
        fully_completed_at,
        completion_notes
      FROM bookings
      WHERE id = ${bookingId}
      LIMIT 1
    `;

    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    const b = booking[0];

    res.json({
      success: true,
      completion_status: {
        booking_id: b.id,
        status: b.status,
        vendor_completed: b.vendor_completed,
        vendor_completed_at: b.vendor_completed_at,
        couple_completed: b.couple_completed,
        couple_completed_at: b.couple_completed_at,
        fully_completed: b.fully_completed || (b.vendor_completed && b.couple_completed),
        fully_completed_at: b.fully_completed_at,
        both_completed: b.vendor_completed && b.couple_completed,
        completion_notes: b.completion_notes,
        waiting_for: b.vendor_completed && b.couple_completed
          ? null
          : b.vendor_completed
            ? 'couple'
            : b.couple_completed
              ? 'vendor'
              : 'both'
      }
    });

  } catch (error) {
    console.error('❌ Error getting completion status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get completion status',
      message: error.message
    });
  }
});

/**
 * POST /api/bookings/:bookingId/unmark-completed
 * Unmark completion (admin or if there's an issue)
 * 
 * Body: {
 *   unmark_by: 'vendor' | 'couple' | 'both',
 *   reason: 'Reason for unmarking'
 * }
 */
router.post('/:bookingId/unmark-completed', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { unmark_by, reason } = req.body;

    console.log(`🔄 Unmarking completion for booking ${bookingId} by ${unmark_by}`);

    if (!unmark_by || !['vendor', 'couple', 'both'].includes(unmark_by)) {
      return res.status(400).json({
        success: false,
        error: 'unmark_by must be "vendor", "couple", or "both"'
      });
    }

    let updatedBooking;
    if (unmark_by === 'both') {
      updatedBooking = await sql`
        UPDATE bookings
        SET 
          vendor_completed = FALSE,
          vendor_completed_at = NULL,
          couple_completed = FALSE,
          couple_completed_at = NULL,
          status = CASE WHEN status = 'completed' THEN 'fully_paid' ELSE status END,
          completion_notes = ${reason || null},
          updated_at = NOW()
        WHERE id = ${bookingId}
        RETURNING *
      `;
    } else if (unmark_by === 'vendor') {
      updatedBooking = await sql`
        UPDATE bookings
        SET 
          vendor_completed = FALSE,
          vendor_completed_at = NULL,
          status = CASE WHEN status = 'completed' THEN 'fully_paid' ELSE status END,
          completion_notes = ${reason || null},
          updated_at = NOW()
        WHERE id = ${bookingId}
        RETURNING *
      `;
    } else {
      updatedBooking = await sql`
        UPDATE bookings
        SET 
          couple_completed = FALSE,
          couple_completed_at = NULL,
          status = CASE WHEN status = 'completed' THEN 'fully_paid' ELSE status END,
          completion_notes = ${reason || null},
          updated_at = NOW()
        WHERE id = ${bookingId}
        RETURNING *
      `;
    }

    const updated = updatedBooking[0];

    res.json({
      success: true,
      message: `Completion unmarked for ${unmark_by}`,
      booking: {
        id: updated.id,
        status: updated.status,
        vendor_completed: updated.vendor_completed,
        couple_completed: updated.couple_completed,
        completion_notes: updated.completion_notes
      }
    });

  } catch (error) {
    console.error('❌ Error unmarking completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unmark completion',
      message: error.message
    });
  }
});

module.exports = router;
