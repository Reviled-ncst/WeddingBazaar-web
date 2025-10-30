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

      // 💰 CREATE WALLET TRANSACTION FOR VENDOR EARNINGS
      // ⭐ ENHANCED: Pull ACTUAL payment data from receipts table
      try {
        console.log(`💰 Creating wallet transaction for vendor: ${updated.vendor_id}`);
        
        // ⭐ STEP 1: Fetch ALL receipts for this booking from receipts table
        const receipts = await sql`
          SELECT * FROM receipts 
          WHERE booking_id = ${bookingId}
          ORDER BY created_at ASC
        `;

        console.log(`📄 Found ${receipts.length} receipt(s) for booking ${bookingId}`);

        // ⭐ STEP 2: Calculate ACTUAL total paid from receipts
        let totalPaidCentavos = 0;
        let paymentMethods = [];
        let receiptNumbers = [];
        let paymentIntentIds = [];

        receipts.forEach(receipt => {
          totalPaidCentavos += receipt.amount || 0;
          if (receipt.payment_method && !paymentMethods.includes(receipt.payment_method)) {
            paymentMethods.push(receipt.payment_method);
          }
          if (receipt.receipt_number) {
            receiptNumbers.push(receipt.receipt_number);
          }
          if (receipt.payment_intent_id) {
            paymentIntentIds.push(receipt.payment_intent_id);
          }
        });

        // Convert from centavos to PHP (divide by 100)
        const totalPaidAmount = totalPaidCentavos / 100;

        console.log(`💵 Total paid from receipts: ₱${totalPaidAmount.toFixed(2)} (${totalPaidCentavos} centavos)`);
        console.log(`💳 Payment methods used: ${paymentMethods.join(', ')}`);
        console.log(`📝 Receipt numbers: ${receiptNumbers.join(', ')}`);

        // ⭐ STEP 3: If no receipts found, fallback to booking amount
        let amountToTransfer = totalPaidAmount;
        let transferNote = '';

        if (receipts.length === 0) {
          console.log(`⚠️ No receipts found, using booking amount as fallback`);
          amountToTransfer = parseFloat(updated.amount || updated.total_amount || 0);
          transferNote = ' (No receipts found - using booking amount)';
        } else {
          transferNote = ` (${receipts.length} payment${receipts.length > 1 ? 's' : ''} received)`;
        }

        // ⭐ STEP 4: Get vendor and customer details
        const serviceType = updated.service_type || 'Wedding Service';
        let coupleName = updated.couple_name || updated.client_name || updated.user_name || 'Customer';
        let coupleEmail = updated.contact_email || '';

        // Fetch user details if available
        if (updated.user_id) {
          try {
            const userResult = await sql`
              SELECT full_name, name, email FROM users WHERE id = ${updated.user_id} LIMIT 1
            `;
            if (userResult.length > 0) {
              coupleName = userResult[0].full_name || userResult[0].name || coupleName;
              coupleEmail = userResult[0].email || coupleEmail;
            }
          } catch (err) {
            console.log('⚠️ Could not fetch user name, using default');
          }
        }

        // ⭐ STEP 5: Generate transaction ID
        const transactionId = `TXN-${bookingId}-${Date.now()}`;

        // ⭐ STEP 6: Prepare metadata with receipt details
        const transactionMetadata = {
          receipts: receipts.map(r => ({
            receipt_number: r.receipt_number,
            amount: r.amount / 100, // Convert to PHP
            payment_type: r.payment_type,
            payment_method: r.payment_method,
            payment_intent_id: r.payment_intent_id,
            created_at: r.created_at
          })),
          total_payments: receipts.length,
          booking_reference: updated.booking_reference,
          event_date: updated.event_date,
          event_location: updated.event_location
        };

        console.log(`💰 Transaction details:`, {
          transactionId,
          vendorId: updated.vendor_id,
          bookingId: updated.id,
          amount: amountToTransfer,
          serviceType,
          coupleName,
          paymentMethods: paymentMethods.join(', ') || 'card',
          receiptCount: receipts.length
        });

        // ⭐ STEP 7: Create wallet transaction with ACTUAL payment data
        await sql`
          INSERT INTO wallet_transactions (
            transaction_id,
            vendor_id,
            booking_id,
            transaction_type,
            amount,
            currency,
            status,
            description,
            payment_method,
            payment_reference,
            service_name,
            service_category,
            customer_name,
            customer_email,
            event_date,
            metadata,
            created_at,
            updated_at
          ) VALUES (
            ${transactionId},
            ${updated.vendor_id},
            ${updated.id},
            'earning',
            ${amountToTransfer},
            'PHP',
            'completed',
            ${'Payment received for ' + serviceType + transferNote},
            ${paymentMethods.length > 0 ? paymentMethods.join(', ') : 'card'},
            ${receiptNumbers.join(', ')},
            ${serviceType},
            ${serviceType},
            ${coupleName},
            ${coupleEmail},
            ${updated.event_date || null},
            ${JSON.stringify(transactionMetadata)},
            NOW(),
            NOW()
          )
          ON CONFLICT (transaction_id) DO NOTHING
        `;

        console.log(`✅ Wallet transaction created: ${transactionId}`);

        // ⭐ STEP 8: Update or create vendor wallet
        const existingWallet = await sql`
          SELECT * FROM vendor_wallets WHERE vendor_id = ${updated.vendor_id} LIMIT 1
        `;

        if (existingWallet.length === 0) {
          // Create new wallet
          console.log(`💰 Creating new wallet for vendor: ${updated.vendor_id}`);
          await sql`
            INSERT INTO vendor_wallets (
              vendor_id,
              total_earnings,
              available_balance,
              pending_balance,
              withdrawn_amount,
              currency,
              created_at,
              updated_at
            ) VALUES (
              ${updated.vendor_id},
              ${amountToTransfer},
              ${amountToTransfer},
              0.00,
              0.00,
              'PHP',
              NOW(),
              NOW()
            )
          `;
          console.log(`✅ New wallet created with balance: ₱${amountToTransfer.toFixed(2)}`);
        } else {
          // Update existing wallet
          console.log(`💰 Updating existing wallet for vendor: ${updated.vendor_id}`);
          const previousBalance = parseFloat(existingWallet[0].available_balance || 0);
          await sql`
            UPDATE vendor_wallets
            SET 
              total_earnings = total_earnings + ${amountToTransfer},
              available_balance = available_balance + ${amountToTransfer},
              updated_at = NOW()
            WHERE vendor_id = ${updated.vendor_id}
          `;
          console.log(`✅ Wallet updated. Previous: ₱${previousBalance.toFixed(2)}, Added: ₱${amountToTransfer.toFixed(2)}, New: ₱${(previousBalance + amountToTransfer).toFixed(2)}`);
        }

        console.log(`🎉 Wallet integration complete for booking ${bookingId}`);
        console.log(`📊 Summary: ${receipts.length} payment(s) totaling ₱${amountToTransfer.toFixed(2)} transferred to vendor wallet`);

      } catch (walletError) {
        // Log error but don't fail the completion
        console.error('❌ Error creating wallet transaction:', walletError);
        console.error('⚠️ Booking is still marked as completed, but wallet was not updated');
        // Continue execution - booking is still completed
      }
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
