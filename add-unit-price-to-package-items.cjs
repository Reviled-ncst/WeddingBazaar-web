/**
 * Migration: Add unit_price column to package_items table
 * 
 * This migration adds the unit_price field that was missing from
 * the package_items table, which caused itemized prices to always
 * show as ₱0 in the confirmation modal.
 * 
 * Run this script: node add-unit-price-to-package-items.cjs
 */

const { sql } = require('./backend-deploy/config/database.cjs');

async function addUnitPriceColumn() {
  try {
    console.log('🔧 [Migration] Starting migration to add unit_price to package_items...');
    
    // Check if column already exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'package_items' 
      AND column_name = 'unit_price'
    `;
    
    if (columnCheck.length > 0) {
      console.log('✅ [Migration] Column unit_price already exists in package_items table');
      return;
    }
    
    // Add unit_price column
    await sql`
      ALTER TABLE package_items
      ADD COLUMN unit_price DECIMAL(10, 2) DEFAULT 0.00
    `;
    
    console.log('✅ [Migration] Successfully added unit_price column to package_items');
    
    // Display sample of updated schema
    const sampleItems = await sql`
      SELECT 
        id, 
        package_id, 
        item_name, 
        quantity, 
        unit_type, 
        unit_price
      FROM package_items 
      LIMIT 5
    `;
    
    console.log('📊 [Migration] Sample package_items with new column:');
    console.table(sampleItems);
    
    console.log('\n🎉 [Migration] Migration complete!');
    console.log('📝 [Migration] Next steps:');
    console.log('   1. The backend INSERT code needs to be updated to save unit_price');
    console.log('   2. Existing package items will have unit_price = 0.00 (default)');
    console.log('   3. New package items will save the unit_price from the frontend');
    
  } catch (error) {
    console.error('❌ [Migration] Error adding unit_price column:', error);
    throw error;
  } finally {
    process.exit();
  }
}

// Run migration
addUnitPriceColumn();
