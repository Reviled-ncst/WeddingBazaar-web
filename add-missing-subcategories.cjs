/**
 * Add Missing Subcategories for Wedding Services
 * Adds subcategories for the 5 categories that were missing them
 */
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addMissingSubcategories() {
  console.log('🌱 Adding missing subcategories...\n');

  try {
    // Get all categories
    const categories = await sql`
      SELECT id, name, display_name 
      FROM service_categories 
      WHERE is_active = true
      ORDER BY sort_order;
    `;

    console.log(`Found ${categories.length} categories\n`);

    // Define subcategories for missing categories (using correct category names from DB)
    const newSubcategoriesData = {
      'Beauty': [  // Hair & Makeup Artists
        { name: 'Bridal Makeup', display_name: 'Bridal Makeup', description: 'Professional bridal makeup services' },
        { name: 'Bridal Hair', display_name: 'Bridal Hair Styling', description: 'Wedding day hairstyling' },
        { name: 'Airbrush Makeup', display_name: 'Airbrush Makeup', description: 'Long-lasting airbrush makeup' },
        { name: 'Party Makeup', display_name: 'Bridal Party Makeup & Hair', description: 'Makeup and hair for bridesmaids and family' }
      ],
      'Music': [  // DJ/Band
        { name: 'DJ Services', display_name: 'DJ Services', description: 'Professional wedding DJ' },
        { name: 'Live Band', display_name: 'Live Band', description: 'Live music band performance' },
        { name: 'Acoustic', display_name: 'Acoustic Performance', description: 'Acoustic musicians for ceremony or cocktail' },
        { name: 'String Quartet', display_name: 'String Quartet', description: 'Classical string quartet' },
        { name: 'Solo Singer', display_name: 'Solo Singer/Vocalist', description: 'Solo vocalist for ceremony or reception' }
      ],
      'Fashion': [  // Dress Designer/Tailor
        { name: 'Wedding Gown', display_name: 'Wedding Gowns', description: 'Bridal gown design and fitting' },
        { name: 'Barong', display_name: 'Barong Tagalog', description: 'Traditional Filipino groom attire' },
        { name: 'Suit Rental', display_name: 'Suit Rental & Purchase', description: 'Groom and groomsmen suits' },
        { name: 'Alterations', display_name: 'Dress Alterations & Tailoring', description: 'Professional dress alterations' },
        { name: 'Accessories', display_name: 'Bridal Accessories', description: 'Veils, jewelry, and other bridal accessories' }
      ],
      'AV_Equipment': [  // Sounds & Lights
        { name: 'Sound System', display_name: 'Sound System', description: 'Professional audio equipment and setup' },
        { name: 'Stage Lighting', display_name: 'Stage & Uplighting', description: 'Event lighting setup and design' },
        { name: 'LED Wall', display_name: 'LED Wall & Projector', description: 'Visual display systems for presentations' },
        { name: 'Special Effects', display_name: 'Special Effects (Fog, Sparklers, Cold Spark)', description: 'Event special effects and atmosphere' },
        { name: 'Intelligent Lighting', display_name: 'Intelligent/Moving Lights', description: 'Automated lighting systems' }
      ],
      'Transport': [  // Transportation Services
        { name: 'Bridal Car', display_name: 'Bridal Car Service', description: 'Luxury car for bride and groom' },
        { name: 'Guest Transportation', display_name: 'Guest Transportation & Shuttle', description: 'Shuttle services for guests' },
        { name: 'Vintage Cars', display_name: 'Vintage & Classic Cars', description: 'Classic and vintage car rentals' },
        { name: 'Limousine', display_name: 'Limousine Service', description: 'Luxury limousine rental' },
        { name: 'Bus Charter', display_name: 'Bus Charter Service', description: 'Group transportation for large parties' }
      ]
    };

    let totalInserted = 0;
    let sortOrder = 100; // Start from 100 to not conflict with existing

    // Insert subcategories for each category
    for (const category of categories) {
      const subcats = newSubcategoriesData[category.name] || [];
      
      if (subcats.length === 0) {
        continue; // Skip categories that already have subcategories
      }

      console.log(`📁 ${category.display_name}: Adding ${subcats.length} subcategories`);

      let subcatIndex = 1;
      for (const subcat of subcats) {
        const subcategoryId = `SUB-${category.id.replace('CAT-', '')}-${String(subcatIndex).padStart(3, '0')}`;
        
        await sql`
          INSERT INTO service_subcategories (
            id, category_id, name, display_name, description, sort_order, is_active
          ) VALUES (
            ${subcategoryId},
            ${category.id},
            ${subcat.name},
            ${subcat.display_name},
            ${subcat.description},
            ${sortOrder},
            true
          )
          ON CONFLICT (category_id, name) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            description = EXCLUDED.description
        `;
        sortOrder++;
        subcatIndex++;
        totalInserted++;
      }
    }

    console.log(`\n✅ Successfully added ${totalInserted} new subcategories!`);

    // Verify final count
    const count = await sql`SELECT COUNT(*) as count FROM service_subcategories WHERE is_active = true`;
    console.log(`\n📊 Total active subcategories in database: ${count[0].count}`);

    // Show distribution
    const distribution = await sql`
      SELECT 
        sc.display_name as category,
        COUNT(ss.id) as subcategory_count
      FROM service_categories sc
      LEFT JOIN service_subcategories ss ON ss.category_id = sc.id AND ss.is_active = true
      WHERE sc.is_active = true
      GROUP BY sc.id, sc.display_name
      ORDER BY sc.sort_order;
    `;

    console.log('\n📊 Subcategories per category:');
    distribution.forEach(row => {
      const status = row.subcategory_count > 0 ? '✅' : '❌';
      console.log(`  ${status} ${row.category}: ${row.subcategory_count} subcategories`);
    });

  } catch (error) {
    console.error('❌ Error adding subcategories:', error);
    throw error;
  }
}

addMissingSubcategories()
  .then(() => {
    console.log('\n✅ Complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
