// Check package data in database
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkPackageData() {
  try {
    console.log('🔍 Checking package columns in bookings table...\n');
    
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND (
        column_name LIKE 'package%' 
        OR column_name LIKE '%addon%' 
        OR column_name = 'subtotal'
      )
      ORDER BY column_name
    `;
    
    console.log('📊 Package-related columns:');
    cols.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '✓ nullable' : '✗ not null'}`);
    });
    
    console.log('\n🔍 Checking recent bookings for package data...\n');
    
    const bookings = await sql`
      SELECT 
        id,
        booking_reference,
        service_name,
        package_name,
        package_price,
        package_items::text as package_items_json,
        selected_addons::text as selected_addons_json,
        addon_total,
        subtotal,
        created_at
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    console.log(`📊 Found ${bookings.length} recent bookings:\n`);
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.booking_reference || 'No ref'} - ${booking.service_name}`);
      console.log(`   Created: ${booking.created_at}`);
      console.log(`   Package Name: ${booking.package_name || '❌ NULL'}`);
      console.log(`   Package Price: ${booking.package_price || '❌ NULL'}`);
      console.log(`   Package Items: ${booking.package_items_json || '❌ NULL'}`);
      console.log(`   Selected Addons: ${booking.selected_addons_json || '❌ NULL'}`);
      console.log(`   Addon Total: ${booking.addon_total || '❌ NULL'}`);
      console.log(`   Subtotal: ${booking.subtotal || '❌ NULL'}`);
      console.log('');
    });
    
    // Check if any bookings have package data
    const withPackageData = bookings.filter(b => b.package_name !== null);
    const withoutPackageData = bookings.filter(b => b.package_name === null);
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Bookings with package data: ${withPackageData.length}`);
    console.log(`   ❌ Bookings without package data: ${withoutPackageData.length}`);
    
    if (withoutPackageData.length > 0) {
      console.log('\n⚠️  WARNING: Recent bookings are missing package data!');
      console.log('   This could mean:');
      console.log('   1. Frontend is not sending package fields in the request');
      console.log('   2. Backend is not receiving the fields from req.body');
      console.log('   3. Backend deployment has not completed yet');
    }
    
    if (withPackageData.length > 0) {
      console.log('\n✅ SUCCESS: Some bookings have package data!');
      console.log('   System is working correctly.');
    }
    
  } catch (error) {
    console.error('❌ Error checking package data:', error);
    throw error;
  }
}

checkPackageData()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
