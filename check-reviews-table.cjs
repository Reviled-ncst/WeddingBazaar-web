const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkReviewsSchema() {
  try {
    console.log('🔍 Checking existing reviews table schema...\n');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reviews'
      ORDER BY ordinal_position
    `;

    if (columns.length === 0) {
      console.log('❌ Reviews table does not exist');
      return;
    }

    console.log('✅ Reviews table exists with columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // Check existing data
    const count = await sql`SELECT COUNT(*) as total FROM reviews`;
    console.log(`📊 Current reviews in table: ${count[0].total}\n`);

    if (count[0].total > 0) {
      const sample = await sql`SELECT * FROM reviews LIMIT 1`;
      console.log('📝 Sample review structure:');
      console.log(JSON.stringify(sample[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkReviewsSchema();
