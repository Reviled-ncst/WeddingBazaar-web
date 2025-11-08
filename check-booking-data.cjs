const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    console.log('🔍 Checking recent bookings in database...\n');
    
    const bookings = await sql`
      SELECT 
        id,
        couple_name,
        vendor_name,
        service_name,
        package_name,
        package_price,
        addon_total,
        subtotal,
        total_amount,
        status,
        created_at,
        CASE 
          WHEN couple_name LIKE '%Test%' OR couple_name LIKE '%Mock%' OR couple_name LIKE '%test%' THEN 'TEST_DATA'
          WHEN package_name IS NULL AND total_amount = 0 THEN 'OLD_FORMAT'
          WHEN package_name IS NOT NULL AND total_amount > 0 THEN 'REAL_WITH_PACKAGE'
          WHEN total_amount > 0 THEN 'REAL_NO_PACKAGE'
          ELSE 'UNKNOWN'
        END as data_type
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    console.log('📊 Recent Bookings Analysis:\n');
    console.log('='.repeat(120));
    
    let realBookings = 0;
    let testBookings = 0;
    let oldFormat = 0;
    let realNoPackage = 0;
    
    bookings.forEach((b, i) => {
      const typeIcon = {
        'TEST_DATA': '⚠️ TEST',
        'OLD_FORMAT': '📦 OLD',
        'REAL_WITH_PACKAGE': '✅ REAL',
        'REAL_NO_PACKAGE': '✅ REAL (no pkg)',
        'UNKNOWN': '❓ UNKNOWN'
      }[b.data_type];
      
      console.log(`${i + 1}. ${typeIcon}`);
      console.log(`   ID: ${b.id}`);
      console.log(`   Couple: ${b.couple_name || 'N/A'}`);
      console.log(`   Vendor: ${b.vendor_name || 'N/A'}`);
      console.log(`   Service: ${b.service_name}`);
      console.log(`   Package: ${b.package_name || 'NONE'}`);
      console.log(`   Package Price: ₱${parseFloat(b.package_price || 0).toLocaleString('en-PH')}`);
      console.log(`   Add-ons: ₱${parseFloat(b.addon_total || 0).toLocaleString('en-PH')}`);
      console.log(`   Subtotal: ₱${parseFloat(b.subtotal || 0).toLocaleString('en-PH')}`);
      console.log(`   Total Amount: ₱${parseFloat(b.total_amount || 0).toLocaleString('en-PH')}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Created: ${new Date(b.created_at).toLocaleString()}`);
      console.log('-'.repeat(120));
      
      if (b.data_type === 'TEST_DATA') testBookings++;
      else if (b.data_type === 'REAL_WITH_PACKAGE') realBookings++;
      else if (b.data_type === 'OLD_FORMAT') oldFormat++;
      else if (b.data_type === 'REAL_NO_PACKAGE') realNoPackage++;
    });
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`=`.repeat(120));
    console.log(`   ✅ Real bookings WITH packages: ${realBookings}`);
    console.log(`   ✅ Real bookings WITHOUT packages: ${realNoPackage}`);
    console.log(`   ⚠️  Test/Mock bookings: ${testBookings}`);
    console.log(`   📦 Old format bookings: ${oldFormat}`);
    console.log(`   ❓ Other: ${bookings.length - realBookings - testBookings - oldFormat - realNoPackage}`);
    console.log(`=`.repeat(120));
    
    // Check if we have ANY real data
    if (realBookings === 0 && realNoPackage === 0) {
      console.log('\n⚠️  WARNING: ALL BOOKINGS APPEAR TO BE TEST DATA!');
      console.log('   This means users are seeing test/mock bookings, not real ones.');
      console.log('   Solution: Create a real booking through the UI to test.');
    } else {
      console.log(`\n✅ Found ${realBookings + realNoPackage} real bookings!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
})();
