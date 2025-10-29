// Check vendor_subscriptions schema
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'vendor_subscriptions' 
      ORDER BY ordinal_position
    `;
    
    console.log('vendor_subscriptions columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'optional' : 'required'})`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
