const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function resetBooking() {
  try {
    const bookingId = 1760962499;
    
    console.log(`Resetting booking ${bookingId} back to 'request' status...\n`);
    
    // Get the original quote note
    const quoteNote = `QUOTE_SENT: {"quoteNumber":"Q-1760985982296","serviceItems":[{"id":"complete-1760985977039-0","name":"Premium professional service","description":"Included in 🥈 Complete Package","quantity":1,"unitPrice":3333,"total":3333,"category":"Test Wedding Photography"},{"id":"complete-1760985977039-1","name":"Full setup and coordination","description":"Included in 🥈 Complete Package","quantity":1,"unitPrice":3333,"total":3333,"category":"Test Wedding Photography"},{"id":"complete-1760985977039-2","name":"Premium equipment/materials","description":"Included in 🥈 Complete Package","quantity":1,"unitPrice":3333,"total":3333,"category":"Test Wedding Photography"},{"id":"complete-1760985977039-3","name":"Extended service hours","description":"Included in 🥈 Complete Package","quantity":1,"unitPrice":3333,"total":3333,"category":"Test Wedding Photography"},{"id":"complete-1760985977039-4","name":"Priority support","description":"Included in 🥈 Complete Package","quantity":1,"unitPrice":3333,"total":3333,"category":"Test Wedding Photography"},{"id":"complete-1760985977039-5","name":"Complimentary consultation","description":"Included in 🥈 Complete Package","quantity":1,"unitPrice":3333,"total":3333,"category":"Test Wedding Photography"}],"pricing":{"subtotal":19998,"tax":2399.7599999999998,"total":22397.76,"downpayment":6719.3279999999995,"balance":15678.431999999999},"paymentTerms":{"downpayment":30,"balance":70},"validUntil":"2025-10-27","terms":"","message":"Thank you for your interest! I've prepared 🥈 Complete Package for your Test Wedding Photography needs. This package includes 6 carefully selected services. Please review the breakdown below and let me know if you'd like any adjustments.","timestamp":"2025-10-20T18:46:22.296Z"}`;
    
    const result = await sql`
      UPDATE bookings 
      SET status = 'request',
          notes = ${quoteNote},
          updated_at = NOW()
      WHERE id = ${bookingId}
      RETURNING *
    `;
    
    console.log('✅ Booking reset successfully!');
    console.log('Status:', result[0].status);
    console.log('Notes:', result[0].notes.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetBooking();
