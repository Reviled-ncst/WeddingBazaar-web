const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function generateMissingReceipt() {
  console.log('📝 Generating missing receipt...\n');
  
  const bookingId = '1761031420';
  
  // Get booking details
  const booking = await sql`
    SELECT * FROM bookings WHERE id = ${bookingId}
  `;
  
  if (booking.length === 0) {
    console.log('❌ Booking not found');
    return;
  }
  
  const b = booking[0];
  console.log('Found booking:', {
    id: b.id,
    service_name: b.service_name,
    status: b.status,
    total_paid: b.total_paid,
    downpayment_amount: b.downpayment_amount,
    remaining_balance: b.remaining_balance
  });
  
  // Generate receipt
  const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // Convert DECIMAL to INTEGER (centavos)
  const amountCentavos = Math.round(parseFloat(b.total_paid) * 100);
  const totalPaidCentavos = Math.round(parseFloat(b.total_paid) * 100);
  const remainingCentavos = Math.round(parseFloat(b.remaining_balance) * 100);
  
  const receipt = await sql`
    INSERT INTO receipts (
      booking_id,
      receipt_number,
      payment_type,
      amount,
      currency,
      payment_method,
      paid_by,
      paid_by_name,
      paid_by_email,
      total_paid,
      remaining_balance,
      notes,
      created_at
    ) VALUES (
      ${bookingId},
      ${receiptNumber},
      'deposit',
      ${amountCentavos},
      'PHP',
      'card',
      ${b.couple_id},
      'Test User',
      'test@example.com',
      ${totalPaidCentavos},
      ${remainingCentavos},
      'Generated receipt for existing payment',
      NOW()
    )
    RETURNING *
  `;
  
  console.log('\n✅ Receipt created:', receipt[0].receipt_number);
  console.log('Receipt details:', {
    id: receipt[0].id,
    booking_id: receipt[0].booking_id,
    amount: `₱${receipt[0].amount / 100}`,
    total_paid: `₱${receipt[0].total_paid / 100}`,
    remaining: `₱${receipt[0].remaining_balance / 100}`
  });
}

generateMissingReceipt().catch(console.error);
