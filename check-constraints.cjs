const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function checkConstraints() {
  try {
    const cols = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users' AND character_maximum_length IS NOT NULL
      ORDER BY character_maximum_length;
    `;
    
    console.log('📏 Column length constraints in users table:');
    cols.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}(${col.character_maximum_length})`);
    });
    
    // Check which field might be causing the issue
    const testData = {
      'email': 'admin@weddingbazaar.com', // 24 chars
      'first_name': 'Wedding Bazaar', // 14 chars  
      'last_name': 'Administrator', // 13 chars
      'phone': '+639625067209', // 13 chars
      'user_type': 'admin' // 5 chars
    };
    
    console.log('\n📋 Test data lengths:');
    Object.entries(testData).forEach(([field, value]) => {
      console.log(`  ${field}: "${value}" (${value.length} chars)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkConstraints();
