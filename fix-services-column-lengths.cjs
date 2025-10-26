/**
 * 🔧 FIX SERVICES TABLE COLUMN LENGTHS
 * 
 * This script fixes the "value too long for type character varying(20)" error
 * by expanding column lengths in the services table to accommodate actual data.
 * 
 * IDENTIFIED ISSUES:
 * 1. vendor_id: 36 chars (UUID) but column is VARCHAR(20) - CRITICAL
 * 2. location: 147+ chars but column is too short
 * 3. availability: 63+ chars (JSON) but column is VARCHAR(20)
 * 4. price_range: 17+ chars but may be too short
 * 
 * RUN THIS BEFORE TESTING SERVICE CREATION!
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixServiceColumnLengths() {
  console.log('\n🔧 FIXING SERVICES TABLE COLUMN LENGTHS...\n');
  
  try {
    // First, check current column definitions
    console.log('📊 Step 1: Checking current column definitions...');
    const currentSchema = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'services'
      AND column_name IN ('vendor_id', 'location', 'availability', 'price_range', 'keywords')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 Current column definitions:');
    currentSchema.forEach(col => {
      const status = col.character_maximum_length < 50 ? '❌ TOO SHORT' : '✅ OK';
      console.log(`  ${col.column_name}: ${col.data_type}(${col.character_maximum_length || 'unlimited'}) ${status}`);
    });
    
    // Fix the columns
    console.log('\n🔨 Step 2: Expanding column lengths...\n');
    
    // 1. vendor_id: Must be 36 chars for UUID (currently VARCHAR(20))
    console.log('  Fixing vendor_id (UUID = 36 chars)...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN vendor_id TYPE VARCHAR(50);
    `;
    console.log('  ✅ vendor_id expanded to VARCHAR(50)');
    
    // 2. location: Can be very long (addresses are ~150+ chars)
    console.log('  Fixing location (addresses can be 150+ chars)...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN location TYPE VARCHAR(255);
    `;
    console.log('  ✅ location expanded to VARCHAR(255)');
    
    // 3. availability: JSON string (can be 60+ chars)
    console.log('  Fixing availability (JSON can be 60+ chars)...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN availability TYPE VARCHAR(255);
    `;
    console.log('  ✅ availability expanded to VARCHAR(255)');
    
    // 4. price_range: Can be formatted like "₱10,000 - ₱50,000" (17+ chars)
    console.log('  Fixing price_range (formatted prices can be 20+ chars)...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN price_range TYPE VARCHAR(100);
    `;
    console.log('  ✅ price_range expanded to VARCHAR(100)');
    
    // 5. keywords: Should be able to hold multiple keywords
    console.log('  Fixing keywords (multiple keywords)...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN keywords TYPE TEXT;
    `;
    console.log('  ✅ keywords changed to TEXT (unlimited)');
    
    // Verify changes
    console.log('\n📊 Step 3: Verifying changes...\n');
    const updatedSchema = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'services'
      AND column_name IN ('vendor_id', 'location', 'availability', 'price_range', 'keywords')
      ORDER BY column_name;
    `;
    
    console.log('📋 Updated column definitions:');
    updatedSchema.forEach(col => {
      const length = col.character_maximum_length || '∞';
      const status = col.data_type === 'text' || col.character_maximum_length >= 50 ? '✅ FIXED' : '⚠️  CHECK';
      console.log(`  ${col.column_name}: ${col.data_type}(${length}) ${status}`);
    });
    
    console.log('\n✅ COLUMN LENGTHS FIXED SUCCESSFULLY!\n');
    console.log('🎯 You can now create services without "value too long" errors.\n');
    
  } catch (error) {
    console.error('\n❌ ERROR FIXING COLUMN LENGTHS:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixServiceColumnLengths()
  .then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
