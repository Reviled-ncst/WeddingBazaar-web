/**
 * Update bookings with realistic financial amounts
 * This will add proper total_amount and deposit_amount to existing bookings
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: './backend-deploy/.env' });

const sql = neon(process.env.DATABASE_URL);

// Realistic pricing by service category
const servicePricing = {
  'Photography': { min: 30000, max: 150000 },
  'Catering': { min: 50000, max: 300000 },
  'Venues': { min: 100000, max: 500000 },
  'Music & DJ': { min: 20000, max: 80000 },
  'Planning': { min: 40000, max: 200000 },
  'Flowers': { min: 15000, max: 75000 },
  'Beauty': { min: 10000, max: 50000 },
  'Transportation': { min: 20000, max: 100000 },
  'default': { min: 25000, max: 100000 }
};

function getRandomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPricingForService(serviceName = '') {
  // Try to match service type
  for (const [category, pricing] of Object.entries(servicePricing)) {
    if (serviceName.toLowerCase().includes(category.toLowerCase())) {
      return pricing;
    }
  }
  return servicePricing.default;
}

async function updateBookingAmounts() {
  try {
    console.log('🔍 Fetching bookings to update...\n');

    // Get all bookings
    const bookings = await sql`
      SELECT 
        id,
        service_name,
        service_type,
        status,
        total_amount,
        deposit_amount,
        estimated_cost_min,
        estimated_cost_max
      FROM bookings 
      ORDER BY created_at DESC
    `;

    console.log(`📊 Found ${bookings.length} bookings to update\n`);

    if (bookings.length === 0) {
      console.log('❌ No bookings found');
      return;
    }

    let updated = 0;
    let skipped = 0;

    for (const booking of bookings) {
      // Skip if already has realistic amounts
      if (booking.total_amount && booking.total_amount > 1000) {
        console.log(`⏭️  Skipping booking ${booking.id} - already has amount: ₱${booking.total_amount}`);
        skipped++;
        continue;
      }

      // Get pricing range for this service
      const serviceName = booking.service_name || booking.service_type || '';
      const pricing = getPricingForService(serviceName);
      
      // Generate realistic amounts
      const totalAmount = getRandomAmount(pricing.min, pricing.max);
      const depositPercentage = 0.3 + (Math.random() * 0.3); // 30-60%
      const depositAmount = Math.floor(totalAmount * depositPercentage);
      
      // Calculate commission (10% of total)
      const commission = Math.floor(totalAmount * 0.10);

      // Update booking
      await sql`
        UPDATE bookings 
        SET 
          total_amount = ${totalAmount},
          deposit_amount = ${depositAmount},
          estimated_cost_min = ${pricing.min},
          estimated_cost_max = ${pricing.max},
          estimated_cost_currency = 'PHP',
          updated_at = NOW()
        WHERE id = ${booking.id}
      `;

      console.log(`✅ Updated booking ${booking.id} (${serviceName})`);
      console.log(`   Total: ₱${totalAmount.toLocaleString()}`);
      console.log(`   Deposit: ₱${depositAmount.toLocaleString()} (${Math.floor(depositPercentage * 100)}%)`);
      console.log(`   Commission: ₱${commission.toLocaleString()} (10%)`);
      console.log('');

      updated++;
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✅ Update complete!`);
    console.log(`   Updated: ${updated} bookings`);
    console.log(`   Skipped: ${skipped} bookings`);
    console.log(`   Total: ${bookings.length} bookings`);
    console.log('='.repeat(80));

    // Verify update
    console.log('\n🔍 Verifying update...');
    const verified = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN total_amount > 0 THEN 1 END) as with_amounts
      FROM bookings
    `;

    console.log(`\n📊 Verification:`);
    console.log(`   Total bookings: ${verified[0].total}`);
    console.log(`   With amounts: ${verified[0].with_amounts}`);
    
    if (verified[0].total === verified[0].with_amounts) {
      console.log('\n✅ All bookings now have realistic amounts!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

updateBookingAmounts();
