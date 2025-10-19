/**
 * Check if subcategories exist in the database
 */
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSubcategories() {
  console.log('🔍 Checking subcategories in database...\n');

  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'service_subcategories'
      );
    `;
    console.log('Table exists:', tableCheck[0].exists);

    if (!tableCheck[0].exists) {
      console.log('❌ Table service_subcategories does not exist!');
      console.log('\nYou need to run the migration:');
      console.log('node database/run-category-migration.mjs');
      return;
    }

    // Count subcategories
    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM service_subcategories;
    `;
    console.log(`\nTotal subcategories: ${countResult[0].count}`);

    // Count active subcategories
    const activeCount = await sql`
      SELECT COUNT(*) as count 
      FROM service_subcategories 
      WHERE is_active = true;
    `;
    console.log(`Active subcategories: ${activeCount[0].count}`);

    // Show subcategories per category
    const byCategory = await sql`
      SELECT 
        sc.id as category_id,
        sc.name as category_name,
        sc.display_name as category_display,
        COUNT(ss.id) as subcategory_count
      FROM service_categories sc
      LEFT JOIN service_subcategories ss ON ss.category_id = sc.id AND ss.is_active = true
      WHERE sc.is_active = true
      GROUP BY sc.id, sc.name, sc.display_name
      ORDER BY sc.sort_order;
    `;

    console.log('\nSubcategories per category:');
    byCategory.forEach(row => {
      console.log(`  ${row.category_display}: ${row.subcategory_count} subcategories`);
    });

    // Show sample subcategories
    const samples = await sql`
      SELECT 
        sc.display_name as category,
        ss.name as subcategory_name,
        ss.display_name as subcategory_display
      FROM service_subcategories ss
      JOIN service_categories sc ON sc.id = ss.category_id
      WHERE ss.is_active = true
      LIMIT 10;
    `;

    console.log('\nSample subcategories:');
    samples.forEach(row => {
      console.log(`  ${row.category} → ${row.subcategory_display}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 The table does not exist. Run migration:');
      console.log('node database/run-category-migration.mjs');
    }
  }
}

checkSubcategories();
