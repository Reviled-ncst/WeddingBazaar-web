const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorIdMatch() {
  try {
    const docs = await sql`SELECT DISTINCT vendor_id FROM vendor_documents`;
    const vendors = await sql`SELECT id, business_name FROM vendors LIMIT 10`;
    
    console.log('📄 vendor_documents vendor_ids:');
    docs.forEach(d => console.log(`  - ${d.vendor_id}`));
    
    console.log('\n👥 vendors table ids:');
    vendors.forEach(v => console.log(`  - ${v.id} (${v.business_name})`));
    
    console.log('\n🔍 Checking for matches...');
    for (const doc of docs) {
      const match = vendors.find(v => v.id === doc.vendor_id.toString());
      if (match) {
        console.log(`✅ Match found: ${doc.vendor_id} -> ${match.business_name}`);
      } else {
        console.log(`❌ No match for: ${doc.vendor_id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkVendorIdMatch();
