require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkProductionColumns() {
  console.log('🔍 Checking PRODUCTION database columns...\n');
  console.log('Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
  console.log('');
  
  try {
    const columns = await sql`
      SELECT 
        column_name, 
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `;
    
    console.log(`📊 Found ${columns.length} columns in services table:\n`);
    
    const requiredColumns = [
      'contact_info',
      'tags',
      'keywords',
      'location_coordinates',
      'location_details'
    ];
    
    const existingColumns = columns.map(c => c.column_name);
    const missingColumns = requiredColumns.filter(rc => !existingColumns.includes(rc));
    
    if (missingColumns.length > 0) {
      console.log('❌ MISSING COLUMNS:');
      missingColumns.forEach(col => {
        console.log(`   - ${col}`);
      });
      console.log('');
      console.log('⚠️  SOLUTION: The migration script was run locally,');
      console.log('   but it connected to the SAME database that production uses!');
      console.log('   The columns should already be there.');
      console.log('');
      console.log('   If they\'re missing, run again:');
      console.log('   node add-missing-service-columns.cjs');
    } else {
      console.log('✅ All required columns exist!\n');
      
      // Show the new columns
      console.log('🆕 New columns added:');
      requiredColumns.forEach(col => {
        const colInfo = columns.find(c => c.column_name === col);
        if (colInfo) {
          console.log(`   - ${col} (${colInfo.data_type})`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProductionColumns();
