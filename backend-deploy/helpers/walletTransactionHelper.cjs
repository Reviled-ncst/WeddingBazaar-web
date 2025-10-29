// ============================================================================
// Wallet Transaction Helper - Auto-create deposits on booking completion
// ============================================================================
// Called when a booking is marked as completed by both vendor and couple
// Creates a wallet transaction and updates vendor wallet balance
// ============================================================================

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

/**
 * Create a wallet deposit transaction when a booking is completed
 * @param {Object} booking - The completed booking object
 * @returns {Promise<Object>} - The created transaction
 */
async function createWalletDepositOnCompletion(booking) {
  try {
    console.log(`💰 [Wallet] Creating deposit for booking #${booking.id}`);

    // 1. Ensure vendor has a wallet
    let wallets = await sql`
      SELECT * FROM vendor_wallets WHERE vendor_id = ${booking.vendor_id}
    `;

    let walletId;
    
    if (wallets.length === 0) {
      console.log(`📊 [Wallet] Creating new wallet for vendor ${booking.vendor_id}`);
      const newWallets = await sql`
        INSERT INTO vendor_wallets (vendor_id)
        VALUES (${booking.vendor_id})
        RETURNING id
      `;
      walletId = newWallets[0].id;
    } else {
      walletId = wallets[0].id;
    }

    // 2. Parse the payment amount from booking
    let amountInCentavos = 0;
    
    if (booking.total_paid) {
      // Remove currency symbols and commas, then convert to number
      const cleanAmount = booking.total_paid.toString().replace(/[₱,\s]/g, '');
      amountInCentavos = Math.round(parseFloat(cleanAmount) * 100);
    } else if (booking.payment_amount) {
      const cleanAmount = booking.payment_amount.toString().replace(/[₱,\s]/g, '');
      amountInCentavos = Math.round(parseFloat(cleanAmount) * 100);
    } else if (booking.amount) {
      const cleanAmount = booking.amount.toString().replace(/[₱,\s]/g, '');
      amountInCentavos = Math.round(parseFloat(cleanAmount) * 100);
    }

    if (amountInCentavos <= 0) {
      console.warn(`⚠️ [Wallet] Invalid amount for booking #${booking.id}, skipping transaction`);
      return null;
    }

    // 3. Check if transaction already exists for this booking
    const existingTransactions = await sql`
      SELECT id FROM wallet_transactions 
      WHERE booking_id = ${booking.id} 
        AND transaction_type = 'deposit'
    `;

    if (existingTransactions.length > 0) {
      console.log(`⚠️ [Wallet] Transaction already exists for booking #${booking.id}, skipping`);
      return existingTransactions[0];
    }

    // 4. Get current wallet balance
    const currentWallet = await sql`
      SELECT available_balance FROM vendor_wallets WHERE id = ${walletId}
    `;
    const balanceBefore = parseInt(currentWallet[0]?.available_balance || 0);
    const balanceAfter = balanceBefore + amountInCentavos;

    // 5. Generate transaction ID
    const transactionId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 6. Create wallet transaction
    const newTransaction = await sql`
      INSERT INTO wallet_transactions (
        transaction_id,
        wallet_id,
        vendor_id,
        transaction_type,
        amount,
        currency,
        status,
        booking_id,
        payment_intent_id,
        service_id,
        service_name,
        service_type,
        couple_id,
        couple_name,
        event_date,
        payment_method,
        balance_before,
        balance_after,
        description,
        transaction_date,
        processed_at,
        completed_at
      ) VALUES (
        ${transactionId},
        ${walletId},
        ${booking.vendor_id},
        'deposit',
        ${amountInCentavos},
        'PHP',
        'completed',
        ${booking.id},
        ${booking.transaction_id || booking.payment_intent_id || null},
        ${booking.service_id || null},
        ${booking.service_name || null},
        ${booking.service_type || null},
        ${booking.couple_id || null},
        ${booking.couple_name || null},
        ${booking.event_date || null},
        ${booking.payment_method || null},
        ${balanceBefore},
        ${balanceAfter},
        ${`Payment received for ${booking.service_name || 'service'} - Booking #${booking.id}`},
        ${booking.fully_completed_at || new Date().toISOString()},
        ${booking.fully_completed_at || new Date().toISOString()},
        ${booking.fully_completed_at || new Date().toISOString()}
      )
      RETURNING *
    `;

    // 7. Update vendor wallet
    await sql`
      UPDATE vendor_wallets
      SET 
        total_earnings = total_earnings + ${amountInCentavos},
        available_balance = available_balance + ${amountInCentavos},
        total_transactions = total_transactions + 1,
        total_deposits = total_deposits + 1,
        last_transaction_date = ${booking.fully_completed_at || new Date().toISOString()},
        updated_at = NOW()
      WHERE id = ${walletId}
    `;

    console.log(`✅ [Wallet] Created deposit transaction ${transactionId} for ₱${(amountInCentavos / 100).toFixed(2)}`);
    console.log(`   Balance: ₱${(balanceBefore / 100).toFixed(2)} → ₱${(balanceAfter / 100).toFixed(2)}`);

    return newTransaction[0];

  } catch (error) {
    console.error(`❌ [Wallet] Error creating deposit for booking #${booking.id}:`, error);
    throw error;
  }
}

/**
 * Create a refund transaction when a booking is cancelled
 * @param {Object} booking - The cancelled booking object
 * @param {number} refundAmount - The amount to refund (in centavos)
 * @returns {Promise<Object>} - The created transaction
 */
async function createWalletRefundOnCancellation(booking, refundAmount) {
  try {
    console.log(`💸 [Wallet] Creating refund for booking #${booking.id}`);

    // Get vendor wallet
    const wallets = await sql`
      SELECT * FROM vendor_wallets WHERE vendor_id = ${booking.vendor_id}
    `;

    if (wallets.length === 0) {
      console.warn(`⚠️ [Wallet] No wallet found for vendor ${booking.vendor_id}`);
      return null;
    }

    const wallet = wallets[0];
    const balanceBefore = parseInt(wallet.available_balance);
    const balanceAfter = balanceBefore - refundAmount;

    // Generate transaction ID
    const transactionId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create refund transaction
    const newTransaction = await sql`
      INSERT INTO wallet_transactions (
        transaction_id,
        wallet_id,
        vendor_id,
        transaction_type,
        amount,
        currency,
        status,
        booking_id,
        service_id,
        service_name,
        couple_id,
        couple_name,
        balance_before,
        balance_after,
        description,
        transaction_date,
        completed_at
      ) VALUES (
        ${transactionId},
        ${wallet.id},
        ${booking.vendor_id},
        'refund',
        ${-refundAmount},
        'PHP',
        'completed',
        ${booking.id},
        ${booking.service_id || null},
        ${booking.service_name || null},
        ${booking.couple_id || null},
        ${booking.couple_name || null},
        ${balanceBefore},
        ${balanceAfter},
        ${`Refund for cancelled booking #${booking.id}`},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Update vendor wallet
    await sql`
      UPDATE vendor_wallets
      SET 
        available_balance = available_balance - ${refundAmount},
        total_transactions = total_transactions + 1,
        last_transaction_date = NOW(),
        updated_at = NOW()
      WHERE id = ${wallet.id}
    `;

    console.log(`✅ [Wallet] Created refund transaction ${transactionId} for ₱${(refundAmount / 100).toFixed(2)}`);

    return newTransaction[0];

  } catch (error) {
    console.error(`❌ [Wallet] Error creating refund for booking #${booking.id}:`, error);
    throw error;
  }
}

module.exports = {
  createWalletDepositOnCompletion,
  createWalletRefundOnCancellation
};
