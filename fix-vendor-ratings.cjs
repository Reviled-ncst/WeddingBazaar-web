const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixVendorRatings() {
  try {
    console.log('🔧 Fixing vendor ratings to be within 3.0-5.0 range...');

    // Update ratings to be within realistic range
    const updates = [
      { id: '2-2025-001', rating: 4.8 }, // Test Business
      { id: '2-2025-002', rating: 4.3 }, // asdlkjsalkdj  
      { id: '2-2025-003', rating: 4.5 }, // Beltran Sound Systems
      { id: '2-2025-004', rating: 4.2 }, // Perfect Weddings Co. (already good)
      { id: '2-2025-005', rating: 4.1 }  // sadasdas
    ];

    for (const update of updates) {
      await sql`
        UPDATE vendors 
        SET rating = ${update.rating}
        WHERE id = ${update.id}
      `;
      console.log(`✅ Updated vendor ${update.id} rating to ${update.rating}`);
    }

    // Verify the changes
    const updatedVendors = await sql`
      SELECT id, business_name, business_type, rating, review_count
      FROM vendors
      ORDER BY rating DESC
    `;

    console.log('\n📊 Updated vendor ratings:');
    updatedVendors.forEach(vendor => {
      console.log(`  - ${vendor.business_name} (${vendor.business_type}): ${vendor.rating}/5.0 (${vendor.review_count} reviews)`);
    });

    // Test the API query again
    const featuredVendors = await sql`
      SELECT 
        v.id, v.business_name, v.business_type, v.location, 
        v.rating, v.review_count, v.description, v.verified
      FROM vendors v
      WHERE v.verified = true 
        AND v.rating >= 4.0 
        AND v.review_count >= 10
      ORDER BY v.rating DESC, v.review_count DESC
      LIMIT 6
    `;

    console.log(`\n🌟 Featured vendors (rating >= 4.0): ${featuredVendors.length}`);

  } catch (error) {
    console.error('❌ Error fixing ratings:', error);
  }
}

fixVendorRatings().then(() => {
  console.log('\n🎉 Rating fix completed!');
  process.exit(0);
});
