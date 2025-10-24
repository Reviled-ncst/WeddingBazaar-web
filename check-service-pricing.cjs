/**
 * Check which services are missing pricing information
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkPricing() {
  console.log('🔍 Checking service pricing status...\n');

  try {
    const services = await sql`
      SELECT id, title, price, price_range 
      FROM services 
      ORDER BY created_at DESC
    `;

    console.log(`📊 Total Services: ${services.length}\n`);
    console.log('Service Pricing Status:\n');
    
    let noPricing = 0;
    let hasPrice = 0;
    let hasPriceRange = 0;
    let hasBoth = 0;

    services.forEach(service => {
      const price = service.price !== null;
      const range = service.price_range !== null;
      
      if (!price && !range) {
        noPricing++;
        console.log(`❌ ${service.id} - ${service.title}`);
        console.log(`   Price: NULL`);
        console.log(`   Range: NULL\n`);
      } else if (price && range) {
        hasBoth++;
        console.log(`✅ ${service.id} - ${service.title}`);
        console.log(`   Price: ₱${service.price}`);
        console.log(`   Range: ${service.price_range}\n`);
      } else if (price) {
        hasPrice++;
        console.log(`⚠️  ${service.id} - ${service.title}`);
        console.log(`   Price: ₱${service.price}`);
        console.log(`   Range: NULL\n`);
      } else if (range) {
        hasPriceRange++;
        console.log(`✅ ${service.id} - ${service.title}`);
        console.log(`   Price: NULL`);
        console.log(`   Range: ${service.price_range}\n`);
      }
    });

    console.log('═══════════════════════════════════════');
    console.log('SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Has price_range only: ${hasPriceRange}`);
    console.log(`⚠️  Has price only: ${hasPrice}`);
    console.log(`✅ Has both: ${hasBoth}`);
    console.log(`❌ Missing pricing: ${noPricing}`);
    console.log(`📊 Total: ${services.length}`);
    console.log('═══════════════════════════════════════\n');

    if (noPricing > 0) {
      console.log('⚠️  ACTION REQUIRED:');
      console.log(`   ${noPricing} services need pricing information`);
      console.log('   Options:');
      console.log('   1. Set default price_range for all services');
      console.log('   2. Manually update services via vendor portal\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPricing();
