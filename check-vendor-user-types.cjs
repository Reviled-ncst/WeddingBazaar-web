const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  const vendors = await sql`
    SELECT v.id as vendor_id, v.user_id, v.business_name, u.email, u.user_type, u.role 
    FROM vendors v 
    JOIN users u ON v.user_id = u.id
  `;
  
  console.log('\n📊 Vendor Users Status:\n');
  vendors.forEach(v => {
    const userTypeCorrect = v.user_type === 'vendor' ? '✅' : '❌';
    console.log(`${v.email}:`);
    console.log(`  Vendor ID: ${v.vendor_id}`);
    console.log(`  Business: ${v.business_name}`);
    console.log(`  user_type: ${v.user_type} ${userTypeCorrect}`);
    console.log(`  role: ${v.role}\n`);
  });
  
  const wrongType = vendors.filter(v => v.user_type !== 'vendor');
  if (wrongType.length > 0) {
    console.log(`⚠️  ${wrongType.length} vendors have WRONG user_type!`);
  } else {
    console.log(`✅ ALL ${vendors.length} vendors have correct user_type='vendor'`);
  }
})();
