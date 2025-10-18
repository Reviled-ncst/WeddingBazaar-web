/**
 * Inspect actual booking data in database
 * Shows what amounts exist and when they were created/updated
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './backend-deploy/.env' });

const sql = neon(process.env.DATABASE_URL);

async function inspectBookingData() {
  try {
    console.log('🔍 Inspecting booking data in database...\n');

    // Get all bookings with full details
    const bookings = await sql`
      SELECT 
        id,
        service_name,
        service_type,
        vendor_id,
        couple_id,
        status,
        total_amount,
        deposit_amount,
        estimated_cost_min,
        estimated_cost_max,
        budget_range,
        special_requests,
        created_at,
        updated_at
      FROM bookings 
      ORDER BY id DESC
    `;

    console.log(`📊 Found ${bookings.length} booking(s) in database\n`);
    console.log('='.repeat(100));

    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. BOOKING #${booking.id}`);
      console.log('-'.repeat(100));
      console.log(`   Service Name:     ${booking.service_name || 'N/A'}`);
      console.log(`   Service Type:     ${booking.service_type || 'N/A'}`);
      console.log(`   Status:           ${booking.status}`);
      console.log(`   Budget Range:     ${booking.budget_range || 'Not specified'}`);
      console.log(`   Special Requests: ${booking.special_requests || 'None'}`);
      console.log('');
      console.log('   💰 FINANCIAL DATA:');
      console.log(`   Total Amount:     ${booking.total_amount ? '₱' + parseFloat(booking.total_amount).toLocaleString('en-PH', {minimumFractionDigits: 2}) : 'NULL/Not Set'}`);
      console.log(`   Deposit Amount:   ${booking.deposit_amount ? '₱' + parseFloat(booking.deposit_amount).toLocaleString('en-PH', {minimumFractionDigits: 2}) : 'NULL/Not Set'}`);
      console.log(`   Estimated Min:    ${booking.estimated_cost_min ? '₱' + parseFloat(booking.estimated_cost_min).toLocaleString('en-PH') : 'NULL/Not Set'}`);
      console.log(`   Estimated Max:    ${booking.estimated_cost_max ? '₱' + parseFloat(booking.estimated_cost_max).toLocaleString('en-PH') : 'NULL/Not Set'}`);
      console.log('');
      console.log('   📅 TIMESTAMPS:');
      console.log(`   Created:          ${new Date(booking.created_at).toLocaleString('en-PH')}`);
      console.log(`   Last Updated:     ${new Date(booking.updated_at).toLocaleString('en-PH')}`);
      
      // Check if amounts were recently added
      const createdDate = new Date(booking.created_at);
      const updatedDate = new Date(booking.updated_at);
      const timeDiff = (updatedDate - createdDate) / 1000 / 60; // minutes
      
      if (timeDiff > 1) {
        console.log(`   ⚠️  NOTE: Updated ${Math.round(timeDiff)} minutes after creation (amounts may have been added later)`);
      }
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n💡 ANALYSIS:');
    
    const withAmounts = bookings.filter(b => b.total_amount && parseFloat(b.total_amount) > 0);
    const withoutAmounts = bookings.filter(b => !b.total_amount || parseFloat(b.total_amount) === 0);
    
    console.log(`   Bookings WITH amounts: ${withAmounts.length}`);
    console.log(`   Bookings WITHOUT amounts: ${withoutAmounts.length}`);
    
    if (withAmounts.length > 0) {
      const totalRevenue = withAmounts.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
      const totalDeposits = withAmounts.reduce((sum, b) => sum + parseFloat(b.deposit_amount || 0), 0);
      const totalCommission = totalRevenue * 0.10;
      
      console.log(`\n   💰 FINANCIAL SUMMARY:`);
      console.log(`   Total Revenue:    ₱${totalRevenue.toLocaleString('en-PH', {minimumFractionDigits: 2})}`);
      console.log(`   Total Deposits:   ₱${totalDeposits.toLocaleString('en-PH', {minimumFractionDigits: 2})}`);
      console.log(`   Total Commission: ₱${totalCommission.toLocaleString('en-PH', {minimumFractionDigits: 2})} (10%)`);
    }

    console.log('\n❓ QUESTION FOR YOU:');
    console.log('   Did you manually enter these amounts when creating the bookings?');
    console.log('   Or were they just added by the update script?');
    console.log('\n   If you want to RESET them to NULL (remove the amounts), I can do that.');
    console.log('   Or if you want to SET DIFFERENT amounts, let me know what they should be!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

inspectBookingData();
