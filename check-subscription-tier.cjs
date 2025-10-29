// Check if subscription_tier exists
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      AND column_name LIKE '%subscription%'
    `;
    
    console.log('Subscription-related columns in vendor_profiles:', columns);
    
    if (columns.length === 0) {
      console.log('\n❌ NO subscription_tier column exists!');
      console.log('🔧 This is why the upgrade is failing with 500 error');
      console.log('\n💡 SOLUTION: Remove the vendor_profiles update from backend');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
