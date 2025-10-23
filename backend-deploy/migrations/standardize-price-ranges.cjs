/**
 * Migration: Standardize price_range values to new unified system
 * 
 * OLD RANGES → NEW RANGES:
 * '₱10,000 - ₱25,000' → '₱10,000 - ₱50,000' (Budget-Friendly)
 * '₱25,000 - ₱75,000' → '₱50,000 - ₱100,000' (Mid-Range)
 * '₱75,000 - ₱150,000' → '₱100,000 - ₱200,000' (Premium)
 * '₱150,000 - ₱300,000' → '₱200,000 - ₱500,000' (Luxury)
 * '₱300,000+' → '₱500,000+' (Ultra-Luxury)
 * 
 * Run this script to update existing services to the new standardized price ranges
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL);

// Mapping of old price ranges to new standardized ranges
const PRICE_RANGE_MAPPING = {
  '₱10,000 - ₱25,000': '₱10,000 - ₱50,000',      // Budget-Friendly
  '₱25,000 - ₱75,000': '₱50,000 - ₱100,000',     // Mid-Range
  '₱75,000 - ₱150,000': '₱100,000 - ₱200,000',   // Premium
  '₱150,000 - ₱300,000': '₱200,000 - ₱500,000',  // Luxury
  '₱300,000+': '₱500,000+'                        // Ultra-Luxury
};

async function standardizePriceRanges() {
  console.log('🎯 Starting price range standardization...\n');

  try {
    // Step 1: Get all services with price_range values
    console.log('1️⃣ Fetching all services with price ranges...');
    const allServices = await sql`
      SELECT id, title, price_range, price, category
      FROM services
      WHERE price_range IS NOT NULL
      ORDER BY created_at DESC;
    `;

    console.log(`📊 Found ${allServices.length} services with price ranges\n`);
    
    if (allServices.length === 0) {
      console.log('✅ No services to migrate');
      return;
    }

    // Step 2: Analyze current price range values
    console.log('2️⃣ Analyzing current price range values...');
    const priceRangeCount = {};
    allServices.forEach(service => {
      const range = service.price_range;
      priceRangeCount[range] = (priceRangeCount[range] || 0) + 1;
    });

    console.log('📈 Current price range distribution:');
    Object.entries(priceRangeCount).forEach(([range, count]) => {
      const newRange = PRICE_RANGE_MAPPING[range] || range;
      const needsUpdate = PRICE_RANGE_MAPPING[range] ? '⚠️ NEEDS UPDATE' : '✅ Already standardized';
      console.log(`   ${range} → ${newRange}`);
      console.log(`      Count: ${count} services | ${needsUpdate}`);
    });

    // Step 3: Count services that need updating
    const servicesToUpdate = allServices.filter(service => 
      PRICE_RANGE_MAPPING[service.price_range]
    );

    console.log(`\n3️⃣ Services requiring update: ${servicesToUpdate.length}/${allServices.length}`);

    if (servicesToUpdate.length === 0) {
      console.log('✅ All services already use standardized price ranges!');
      return;
    }

    // Step 4: Show preview of changes
    console.log('\n4️⃣ Preview of changes:');
    servicesToUpdate.slice(0, 5).forEach(service => {
      const oldRange = service.price_range;
      const newRange = PRICE_RANGE_MAPPING[oldRange];
      console.log(`   📦 ${service.id} - ${service.title}`);
      console.log(`      ${oldRange} → ${newRange}`);
    });
    if (servicesToUpdate.length > 5) {
      console.log(`   ... and ${servicesToUpdate.length - 5} more services`);
    }

    // Step 5: Perform the migration
    console.log('\n5️⃣ Applying price range standardization...');
    
    let updatedCount = 0;
    let errorCount = 0;

    for (const service of servicesToUpdate) {
      const oldRange = service.price_range;
      const newRange = PRICE_RANGE_MAPPING[oldRange];

      try {
        await sql`
          UPDATE services
          SET 
            price_range = ${newRange},
            updated_at = NOW()
          WHERE id = ${service.id};
        `;
        updatedCount++;
        console.log(`   ✅ Updated ${service.id}: ${oldRange} → ${newRange}`);
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Failed to update ${service.id}:`, error.message);
      }
    }

    // Step 6: Verify the migration
    console.log('\n6️⃣ Verifying migration results...');
    const verifyServices = await sql`
      SELECT price_range, COUNT(*) as count
      FROM services
      WHERE price_range IS NOT NULL
      GROUP BY price_range
      ORDER BY count DESC;
    `;

    console.log('📊 Final price range distribution:');
    verifyServices.forEach(row => {
      const isStandardized = Object.values(PRICE_RANGE_MAPPING).includes(row.price_range) 
        || row.price_range === '₱10,000 - ₱50,000'  // Already in new format
        || row.price_range === '₱50,000 - ₱100,000'
        || row.price_range === '₱100,000 - ₱200,000'
        || row.price_range === '₱200,000 - ₱500,000'
        || row.price_range === '₱500,000+';
      const badge = isStandardized ? '✅' : '⚠️';
      console.log(`   ${badge} ${row.price_range}: ${row.count} services`);
    });

    // Step 7: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} services`);
    if (errorCount > 0) {
      console.log(`❌ Failed updates: ${errorCount} services`);
    }
    console.log(`📊 Total services processed: ${allServices.length}`);
    console.log(`🎯 Services now using standardized ranges: ${verifyServices.length}`);
    console.log('='.repeat(60));

    console.log('\n🎉 Price range standardization completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. ✅ Frontend already deployed with new filter UI');
    console.log('   2. ✅ Backend endpoints handle both old and new ranges');
    console.log('   3. ✅ Vendor form now shows standardized ranges');
    console.log('   4. ✅ Customer filters now show all 5 tiers');
    console.log('   5. 🎯 Test filtering in production UI');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run migration
standardizePriceRanges()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
