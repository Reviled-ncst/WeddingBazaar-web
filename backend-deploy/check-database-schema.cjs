const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseSchema() {
  console.log('=== CHECKING DATABASE SCHEMA ===');
  
  try {
    // Get all tables
    console.log('\n1. Checking all tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Available tables:', tables.map(t => t.table_name));
    
    // Check specific tables for messaging
    const tablesToCheck = ['conversations', 'messages', 'notifications', 'services'];
    
    for (const tableName of tablesToCheck) {
      console.log(`\n2. Checking ${tableName} table...`);
      
      // Check if table exists
      const tableExists = tables.find(t => t.table_name === tableName);
      if (!tableExists) {
        console.log(`❌ Table ${tableName} does not exist`);
        continue;
      }
      
      // Get table schema
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      console.log(`✅ Table ${tableName} exists with columns:`);
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Get row count
      const count = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
      console.log(`📊 Rows in ${tableName}: ${count[0].count}`);
      
      // Show sample data if exists
      if (count[0].count > 0) {
        const sample = await sql`SELECT * FROM ${sql(tableName)} LIMIT 3`;
        console.log(`🔍 Sample data from ${tableName}:`);
        sample.forEach((row, index) => {
          console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2));
        });
      }
    }
    
  } catch (error) {
    console.error('Database error:', error);
  }
}

checkDatabaseSchema().catch(console.error);
