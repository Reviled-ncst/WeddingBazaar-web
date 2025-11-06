// Add images to ALL services based on their category
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Category-specific image sets from Unsplash
const IMAGE_SETS = {
  'Photography': [
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800'
  ],
  'Videography': [
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800',
    'https://images.unsplash.com/photo-1516035664883-b2c5b9aa6f08?w=800'
  ],
  'Catering': [
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'
  ],
  'Venue': [
    'https://images.unsplash.com/photo-1519167758481-83f29da8c2b7?w=800',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'
  ],
  'Music': [
    'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800'
  ],
  'DJ': [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800',
    'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800'
  ],
  'Florist': [
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
    'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
  ],
  'Decor': [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
  ],
  'Cake': [
    'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800',
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800',
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800'
  ],
  'Beauty': [
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'
  ],
  'Planning': [
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    'https://images.unsplash.com/photo-1519167758481-83f29da8c2b7?w=800'
  ],
  'Invitations': [
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800',
    'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=800',
    'https://images.unsplash.com/photo-1606932342036-85e8e06fd188?w=800'
  ],
  'Transportation': [
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'
  ],
  'Attire': [
    'https://images.unsplash.com/photo-1591361570169-ebe7ec5eb45f?w=800',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    'https://images.unsplash.com/photo-1594838438604-e4954e1ace47?w=800'
  ],
  'Rentals': [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800'
  ],
  'AV': [
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'https://images.unsplash.com/photo-1516035664883-b2c5b9aa6f08?w=800',
    'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=800'
  ],
  'Security': [
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800',
    'https://images.unsplash.com/photo-1551836022-aadb801c60ae?w=800',
    'https://images.unsplash.com/photo-1551836022-d6c39c49d5f3?w=800'
  ],
  'Officiant': [
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
  ]
};

// Default images for categories not in the map
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
];

async function addImagesToServices() {
  try {
    console.log('🖼️  Adding images to all services...\n');
    
    // Get all services
    const services = await sql`
      SELECT id, title, category, images
      FROM services
    `;
    
    console.log(`Found ${services.length} services\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const service of services) {
      try {
        // Skip if already has images
        if (service.images && Array.isArray(service.images) && service.images.length > 0) {
          console.log(`⏭️  Skipped: ${service.title} (already has ${service.images.length} images)`);
          skipped++;
          continue;
        }
        
        // Get images for this category
        const images = IMAGE_SETS[service.category] || DEFAULT_IMAGES;
        
        // Update service with images
        await sql`
          UPDATE services
          SET images = ${images}
          WHERE id = ${service.id}
        `;
        
        console.log(`✅ Updated: ${service.title} (${service.category}) - Added ${images.length} images`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating ${service.title}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTS:');
    console.log('='.repeat(80));
    console.log(`Total services: ${services.length}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    
    // Verify the update
    console.log('\n🔍 Verifying updates...');
    const verifyServices = await sql`
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(CASE WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN 1 END) as with_images
      FROM services
      GROUP BY category
      ORDER BY category
    `;
    
    console.log('\nServices by category:');
    verifyServices.forEach(row => {
      const percentage = Math.round((row.with_images / row.total) * 100);
      console.log(`  ${row.category}: ${row.with_images}/${row.total} (${percentage}%)`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

addImagesToServices()
  .then(() => {
    console.log('\n✅ Image addition complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
