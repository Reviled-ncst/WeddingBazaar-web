const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'services' 
    ORDER BY ordinal_position
  `;
  
  console.log('📋 Services table columns:\n');
  columns.forEach(c => {
    console.log(`  ${c.column_name.padEnd(20)} ${c.data_type}`);
  });
  
  console.log('\n📋 Reviews table columns:\n');
  const reviewCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'reviews' 
    ORDER BY ordinal_position
  `;
  reviewCols.forEach(c => {
    console.log(`  ${c.column_name.padEnd(20)} ${c.data_type}`);
  });
}

checkColumns().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
