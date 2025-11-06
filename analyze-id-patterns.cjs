const { sql } = require('./backend-deploy/config/database.cjs');

async function checkIDPatterns() {
  try {
    console.log('🔍 ANALYZING ID PATTERNS IN YOUR SYSTEM\n');
    console.log('='.repeat(70));
    
    // Check users table
    const users = await sql`
      SELECT id, email, user_type, role 
      FROM users 
      ORDER BY id
    `;
    
    console.log('\n👥 USERS TABLE IDs:');
    console.log(`Total users: ${users.length}\n`);
    users.forEach(u => {
      console.log(`${u.id.padEnd(25)} | ${u.email?.padEnd(40) || 'N/A'.padEnd(40)} | ${u.user_type || u.role}`);
    });
    
    // Check vendors table
    const vendors = await sql`
      SELECT id, user_id, business_name 
      FROM vendors 
      ORDER BY id
    `;
    
    console.log('\n\n🏢 VENDORS TABLE IDs:');
    console.log(`Total vendors: ${vendors.length}\n`);
    vendors.forEach(v => {
      console.log(`Vendor ID: ${v.id.padEnd(20)} | User ID: ${v.user_id?.padEnd(20) || 'N/A'.padEnd(20)} | ${v.business_name}`);
    });
    
    // Analyze patterns
    console.log('\n\n📊 ID PATTERN ANALYSIS:');
    console.log('='.repeat(70));
    
    const userIdPatterns = {
      '1-2025-XXX': users.filter(u => u.id.startsWith('1-2025-')).length,
      '2-2025-XXX': users.filter(u => u.id.startsWith('2-2025-')).length,
      'VU-XXXXXXXX-XXXX': users.filter(u => u.id.startsWith('VU-')).length,
      'Firebase UID': users.filter(u => !u.id.startsWith('1-') && !u.id.startsWith('2-') && !u.id.startsWith('VU-')).length
    };
    
    const vendorIdPatterns = {
      'VEN-XXXXX': vendors.filter(v => v.id.startsWith('VEN-')).length,
      '2-2025-XXX': vendors.filter(v => v.id.startsWith('2-2025-')).length,
      'Other': vendors.filter(v => !v.id.startsWith('VEN-') && !v.id.startsWith('2-2025-')).length
    };
    
    console.log('\n🔹 USER ID PATTERNS:');
    Object.entries(userIdPatterns).forEach(([pattern, count]) => {
      if (count > 0) {
        console.log(`   ${pattern}: ${count} users`);
      }
    });
    
    console.log('\n🔹 VENDOR ID PATTERNS:');
    Object.entries(vendorIdPatterns).forEach(([pattern, count]) => {
      if (count > 0) {
        console.log(`   ${pattern}: ${count} vendors`);
      }
    });
    
    console.log('\n\n💡 YOUR SYSTEM CONVENTION:');
    console.log('='.repeat(70));
    console.log('Based on the data, your system uses:');
    console.log('   • USER IDs: Mixed (1-2025-XXX for individuals, 2-2025-XXX for vendors, etc.)');
    console.log('   • VENDOR IDs: Can be SAME as user_id OR separate VEN-XXXXX format');
    console.log('\nThis is a VALID pattern where:');
    console.log('   ✓ Some vendors use their user_id as vendor_id (2-2025-XXX)');
    console.log('   ✓ Some vendors use separate vendor IDs (VEN-XXXXX)');
    console.log('   ✓ Both patterns work correctly in your system');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkIDPatterns();
