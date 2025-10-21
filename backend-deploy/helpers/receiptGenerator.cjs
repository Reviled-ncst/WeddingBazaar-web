const { sql } = require('../config/database.cjs');

/**
 * Generate a unique receipt number
 * Format: WB-YYYYMMDD-XXXXX (e.g., WB-20250110-00001)
 */
async function generateReceiptNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get count of receipts created today
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM receipts 
    WHERE receipt_number LIKE ${'WB-' + today + '-%'}
  `;
  
  const count = parseInt(result[0]?.count || '0') + 1;
  const sequence = count.toString().padStart(5, '0');
  
  return `WB-${today}-${sequence}`;
}

/**
 * Create a receipt record in the database
 * @param {Object} receiptData - Receipt information
 * @returns {Promise<Object>} Created receipt record
 */
async function createReceipt(receiptData) {
  const {
    bookingId,
    coupleId,
    vendorId,
    paymentType, // 'deposit', 'balance', 'full', 'partial'
    paymentMethod, // 'gcash', 'maya', 'card', 'bank_transfer', etc.
    amountPaid, // in centavos
    totalAmount, // in centavos
    taxAmount = 0, // in centavos
    paymentReference, // PayMongo transaction ID or reference
    notes = null
  } = receiptData;

  // Validate required fields
  if (!bookingId || !coupleId || !vendorId || !paymentType || !amountPaid) {
    throw new Error('Missing required fields for receipt creation');
  }

  // Generate unique receipt number
  const receiptNumber = await generateReceiptNumber();

  console.log(`📝 Creating receipt: ${receiptNumber} for booking ${bookingId}`);
  console.log(`💰 Amount: ₱${amountPaid / 100} | Type: ${paymentType} | Method: ${paymentMethod}`);

  try {
    // Insert receipt into database (FIXED: using correct schema column names)
    const receipt = await sql`
      INSERT INTO receipts (
        receipt_number,
        booking_id,
        payment_type,
        amount,
        currency,
        payment_method,
        payment_intent_id,
        paid_by,
        paid_by_name,
        paid_by_email,
        total_paid,
        remaining_balance,
        notes,
        metadata,
        created_at
      ) VALUES (
        ${receiptNumber},
        ${String(bookingId)},
        ${paymentType},
        ${amountPaid},
        'PHP',
        ${paymentMethod || 'unknown'},
        ${paymentReference || null},
        ${String(coupleId)},
        ${notes || `Payment from ${coupleId}`},
        ${receiptData.paidByEmail || null},
        ${totalAmount || amountPaid},
        ${receiptData.remainingBalance || 0},
        ${notes || `${paymentType} payment received`},
        ${{
          payment_type: paymentType,
          vendor_id: String(vendorId),
          created_by: 'wedding_bazaar_system'
        }},
        NOW()
      )
      RETURNING *
    `;

    if (receipt.length === 0) {
      throw new Error('Failed to create receipt');
    }

    console.log(`✅ Receipt created successfully: ${receiptNumber}`);
    return receipt[0];

  } catch (error) {
    console.error('❌ Receipt creation error:', error);
    console.error('❌ Error details:', error.message);
    throw new Error(`Failed to create receipt: ${error.message}`);
  }
}

/**
 * Create receipt for deposit payment
 */
async function createDepositReceipt(bookingId, coupleId, vendorId, depositAmount, paymentMethod, paymentReference) {
  return createReceipt({
    bookingId,
    coupleId,
    vendorId,
    paymentType: 'deposit',
    paymentMethod,
    amountPaid: depositAmount,
    totalAmount: depositAmount,
    paymentReference,
    notes: 'Deposit payment received'
  });
}

/**
 * Create receipt for balance payment
 */
async function createBalanceReceipt(bookingId, coupleId, vendorId, balanceAmount, totalAmount, paymentMethod, paymentReference) {
  return createReceipt({
    bookingId,
    coupleId,
    vendorId,
    paymentType: 'balance',
    paymentMethod,
    amountPaid: balanceAmount,
    totalAmount,
    paymentReference,
    notes: 'Balance payment received - booking fully paid'
  });
}

/**
 * Create receipt for full payment
 */
async function createFullPaymentReceipt(bookingId, coupleId, vendorId, totalAmount, paymentMethod, paymentReference) {
  return createReceipt({
    bookingId,
    coupleId,
    vendorId,
    paymentType: 'full',
    paymentMethod,
    amountPaid: totalAmount,
    totalAmount,
    paymentReference,
    notes: 'Full payment received'
  });
}

/**
 * Get all receipts for a booking
 */
async function getBookingReceipts(bookingId) {
  try {
    const receipts = await sql`
      SELECT 
        r.*,
        v.business_name as vendor_name,
        v.business_type as vendor_category
      FROM receipts r
      LEFT JOIN vendors v ON (r.metadata->>'vendor_id')::uuid = v.id
      WHERE r.booking_id = ${String(bookingId)}
      ORDER BY r.created_at DESC
    `;
    
    return receipts;
  } catch (error) {
    console.error('❌ Error fetching booking receipts:', error);
    return [];
  }
}

/**
 * Calculate total paid amount for a booking (from receipts)
 */
async function calculateTotalPaid(bookingId) {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM receipts
      WHERE booking_id = ${String(bookingId)}
    `;
    
    return parseInt(result[0]?.total_paid || '0');
  } catch (error) {
    console.error('❌ Error calculating total paid:', error);
    return 0;
  }
}

module.exports = {
  generateReceiptNumber,
  createReceipt,
  createDepositReceipt,
  createBalanceReceipt,
  createFullPaymentReceipt,
  getBookingReceipts,
  calculateTotalPaid
};
