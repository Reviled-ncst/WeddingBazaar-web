const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vendor_profiles' 
    ORDER BY ordinal_position
  `))
  .then(result => {
    console.log('📋 vendor_profiles columns:');
    result.rows.forEach(c => {
      console.log(`  - ${c.column_name} (${c.data_type})`);
    });
    client.end();
  })
  .catch(err => {
    console.error('Error:', err);
    client.end();
  });
