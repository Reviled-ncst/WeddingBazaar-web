require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('=== CHECKING ALL VENDOR IDS FOR USER 2-2025-019 ===\n');
  
  try {
    // Check vendor_profiles table
    console.log('1. vendor_profiles table:');
    const profiles = await sql`SELECT id, user_id, business_name FROM vendor_profiles WHERE user_id = '2-2025-019'`;
    console.log(JSON.stringify(profiles, null, 2));
    
    // Check vendors table
    console.log('\n2. vendors table:');
    const vendors = await sql`SELECT id, user_id, business_name FROM vendors WHERE user_id = '2-2025-019'`;
    console.log(JSON.stringify(vendors, null, 2));
    
    // Check by VEN-00021
    console.log('\n3. vendors table (by VEN-00021):');
    const venVendors = await sql`SELECT id, user_id, business_name FROM vendors WHERE id = 'VEN-00021'`;
    console.log(JSON.stringify(venVendors, null, 2));
    
    console.log('\n=== DONE ===');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
  
  process.exit(0);
})();
