/**
 * Reset booking amounts to NULL
 * Removes the randomly generated amounts and restores bookings to original state
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './backend-deploy/.env' });

const sql = neon(process.env.DATABASE_URL);

async function resetBookingAmounts() {
  try {
    console.log('🔄 Resetting booking amounts to NULL...\n');

    // Get current bookings first
    const beforeReset = await sql`
      SELECT id, service_name, total_amount, deposit_amount 
      FROM bookings
    `;

    console.log('📊 Current bookings BEFORE reset:');
    beforeReset.forEach(b => {
      console.log(`   Booking #${b.id}: ₱${parseFloat(b.total_amount || 0).toLocaleString()} total, ₱${parseFloat(b.deposit_amount || 0).toLocaleString()} deposit`);
    });

    console.log('\n🔄 Resetting all financial fields to NULL...\n');

    // Reset all amount fields to NULL
    const result = await sql`
      UPDATE bookings 
      SET 
        total_amount = NULL,
        deposit_amount = NULL,
        estimated_cost_min = NULL,
        estimated_cost_max = NULL,
        estimated_cost_currency = NULL,
        updated_at = NOW()
      WHERE id IN (SELECT id FROM bookings)
    `;

    console.log(`✅ Reset ${result.length || result.count || beforeReset.length} booking(s)\n`);

    // Verify reset
    const afterReset = await sql`
      SELECT id, service_name, total_amount, deposit_amount 
      FROM bookings
    `;

    console.log('📊 Bookings AFTER reset:');
    afterReset.forEach(b => {
      const totalMsg = b.total_amount ? `₱${parseFloat(b.total_amount).toLocaleString()}` : 'NULL ✅';
      const depositMsg = b.deposit_amount ? `₱${parseFloat(b.deposit_amount).toLocaleString()}` : 'NULL ✅';
      console.log(`   Booking #${b.id}: ${totalMsg} total, ${depositMsg} deposit`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Database reset complete!');
    console.log('   All bookings now have NULL amounts (as they were originally created)');
    console.log('   The admin UI will now show "Pending Quote" instead of fake amounts');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

resetBookingAmounts();
