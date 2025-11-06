const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorIDs() {
  try {
    console.log('\n📊 VENDOR ID PATTERNS ANALYSIS\n');
    console.log('='.repeat(70));
    
    const vendors = await sql`
      SELECT id, user_id, business_name, created_at 
      FROM vendors 
      ORDER BY created_at
    `;
    
    console.log(`\nTotal Vendors: ${vendors.length}\n`);
    
    const venPattern = [];
    const userPattern = [];
    
    vendors.forEach((v, i) => {
      console.log(`${i+1}. Vendor ID: ${v.id} | User ID: ${v.user_id || 'N/A'}`);
      console.log(`   Business: ${v.business_name}`);
      console.log(`   Created: ${v.created_at}`);
      console.log('');
      
      if (v.id.startsWith('VEN-')) {
        venPattern.push(v.id);
      } else if (v.id.startsWith('2-')) {
        userPattern.push(v.id);
      }
    });
    
    console.log('='.repeat(70));
    console.log('\n📈 ID PATTERN SUMMARY\n');
    console.log(`VEN-XXXXX pattern: ${venPattern.length} vendors`);
    console.log(`2-YYYY-XXX pattern: ${userPattern.length} vendors`);
    console.log('\nVEN- IDs:', venPattern.join(', '));
    console.log('\n2- IDs:', userPattern.join(', '));
    
    console.log('\n💡 EXPLANATION:');
    console.log('- VEN-XXXXX: Proper vendor IDs (newer format)');
    console.log('- 2-YYYY-XXX: User IDs that were mistakenly used as vendor IDs (old data)');
    console.log('\n⚠️ RECOMMENDATION: Standardize all vendor IDs to VEN-XXXXX format');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkVendorIDs();
