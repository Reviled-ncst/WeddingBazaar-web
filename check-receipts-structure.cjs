#!/usr/bin/env node

/**
 * Check the actual structure of the receipts table
 */

const { neon } = require('@neondatabase/serverless');

async function checkReceiptsTable() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://[your-database-url]');

  console.log('🔍 ====================================');
  console.log('🔍 CHECKING RECEIPTS TABLE STRUCTURE');
  console.log('🔍 ====================================\n');

  try {
    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'receipts'
      ORDER BY ordinal_position
    `;
    
    if (columns.length === 0) {
      console.log('❌ Receipts table does not exist!');
      return;
    }
    
    console.log('✅ Receipts table exists with the following columns:\n');
    console.log('Column Name                 | Type              | Nullable | Default');
    console.log('--------------------------- | ----------------- | -------- | -------');
    
    columns.forEach(col => {
      const name = col.column_name.padEnd(27);
      const type = col.data_type.padEnd(17);
      const nullable = col.is_nullable.padEnd(8);
      const defaultVal = (col.column_default || 'NULL').substring(0, 20);
      console.log(`${name} | ${type} | ${nullable} | ${defaultVal}`);
    });
    
    // Get sample data
    console.log('\n📊 Sample receipts data:\n');
    const receipts = await sql`
      SELECT * FROM receipts LIMIT 2
    `;
    
    if (receipts.length > 0) {
      console.log(`Found ${receipts.length} receipt(s):`);
      receipts.forEach((receipt, i) => {
        console.log(`\nReceipt ${i + 1}:`, JSON.stringify(receipt, null, 2));
      });
    } else {
      console.log('No receipts found in table.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkReceiptsTable();
