/**
 * Migration: Set default price_range for services without pricing
 * 
 * This fixes the "Contact vendor for price" issue by assigning
 * a default Budget-Friendly range to services that don't have
 * any pricing information.
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function setDefaultPricing() {
  console.log('🔧 Setting default pricing for services without pricing...\n');

  try {
    // Find services without any pricing
    console.log('1️⃣ Finding services without pricing...');
    const servicesWithoutPricing = await sql`
      SELECT id, title, category, price, price_range
      FROM services
      WHERE (price IS NULL OR price = 0) 
        AND (price_range IS NULL OR price_range = '')
      ORDER BY created_at DESC
    `;

    console.log(`📊 Found ${servicesWithoutPricing.length} services without pricing\n`);

    if (servicesWithoutPricing.length === 0) {
      console.log('✅ All services already have pricing information!');
      return;
    }

    // Show services that will be updated
    console.log('2️⃣ Services to be updated:\n');
    servicesWithoutPricing.forEach(service => {
      console.log(`   📦 ${service.id} - ${service.title}`);
      console.log(`      Category: ${service.category || 'N/A'}`);
      console.log(`      Current price: ${service.price || 'NULL'}`);
      console.log(`      Current range: ${service.price_range || 'NULL'}`);
      console.log(`      → Will set: ₱10,000 - ₱50,000 (Budget-Friendly)\n`);
    });

    // Update services with default price range
    console.log('3️⃣ Updating services with default price range...\n');
    
    let updated = 0;
    let failed = 0;

    for (const service of servicesWithoutPricing) {
      try {
        await sql`
          UPDATE services
          SET 
            price_range = '₱10,000 - ₱50,000',
            updated_at = NOW()
          WHERE id = ${service.id}
        `;
        updated++;
        console.log(`   ✅ Updated ${service.id}`);
      } catch (error) {
        failed++;
        console.error(`   ❌ Failed to update ${service.id}:`, error.message);
      }
    }

    // Verify the updates
    console.log('\n4️⃣ Verifying updates...');
    const verifyServices = await sql`
      SELECT id, title, price, price_range
      FROM services
      WHERE id = ANY(${servicesWithoutPricing.map(s => s.id)})
    `;

    console.log('\n📊 Updated services:');
    verifyServices.forEach(service => {
      const status = service.price_range ? '✅' : '❌';
      console.log(`   ${status} ${service.id}: ${service.price_range || 'NULL'}`);
    });

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('MIGRATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`✅ Successfully updated: ${updated} services`);
    if (failed > 0) {
      console.log(`❌ Failed updates: ${failed} services`);
    }
    console.log(`📊 Total processed: ${servicesWithoutPricing.length}`);
    console.log('═'.repeat(60));

    console.log('\n🎉 Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh frontend to see updated pricing');
    console.log('   2. All services should now show price ranges');
    console.log('   3. No more "Contact vendor for price" for these services');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

setDefaultPricing()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
