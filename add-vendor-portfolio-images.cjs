// Add portfolio images to ALL vendors
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Category-specific portfolio images
const PORTFOLIO_IMAGES = {
  'Photography': [
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200'
  ],
  'Catering': [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200'
  ],
  'Venue': [
    'https://images.unsplash.com/photo-1519167758481-83f29da8c2b7?w=1200',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200'
  ],
  'Music': [
    'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=1200',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200',
    'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=1200'
  ],
  'Florist': [
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200',
    'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=1200',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200'
  ],
  'Decor': [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200'
  ],
  'Cake': [
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1200',
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200',
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200'
  ],
  'Beauty': [
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200'
  ],
  'Planning': [
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
    'https://images.unsplash.com/photo-1519167758481-83f29da8c2b7?w=1200'
  ]
};

// Default portfolio images
const DEFAULT_PORTFOLIO = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200'
];

async function addPortfolioImages() {
  try {
    console.log('🖼️  Adding portfolio images to all vendors...\n');
    
    // Get all vendors
    const vendors = await sql`
      SELECT id, business_name, business_type as category, portfolio_images
      FROM vendors
    `;
    
    console.log(`Found ${vendors.length} vendors\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const vendor of vendors) {
      try {
        // Skip if already has portfolio images
        if (vendor.portfolio_images && Array.isArray(vendor.portfolio_images) && vendor.portfolio_images.length > 0) {
          console.log(`⏭️  Skipped: ${vendor.business_name} (already has ${vendor.portfolio_images.length} images)`);
          skipped++;
          continue;
        }
        
        // Get portfolio images for this category
        const images = PORTFOLIO_IMAGES[vendor.category] || DEFAULT_PORTFOLIO;
        
        // Update vendor with portfolio images
        await sql`
          UPDATE vendors
          SET portfolio_images = ${images}
          WHERE id = ${vendor.id}
        `;
        
        console.log(`✅ Updated: ${vendor.business_name} (${vendor.category}) - Added ${images.length} portfolio images`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating ${vendor.business_name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTS:');
    console.log('='.repeat(80));
    console.log(`Total vendors: ${vendors.length}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    
    // Verify the update
    console.log('\n🔍 Verifying updates...');
    const verifyVendors = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN portfolio_images IS NOT NULL AND array_length(portfolio_images, 1) > 0 THEN 1 END) as with_images
      FROM vendors
    `;
    
    const row = verifyVendors[0];
    const percentage = Math.round((row.with_images / row.total) * 100);
    console.log(`\nVendors with portfolio images: ${row.with_images}/${row.total} (${percentage}%)`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

addPortfolioImages()
  .then(() => {
    console.log('\n✅ Portfolio image addition complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
