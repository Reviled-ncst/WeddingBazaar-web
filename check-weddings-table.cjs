#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkWeddings() {
  try {
    // Check if coordinator_weddings table exists
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name = 'weddings' OR table_name = 'coordinator_weddings')
      ORDER BY table_name
    `);
    
    console.log('📋 Wedding-related tables:');
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Check columns if table exists
    if (tablesResult.rows.length > 0) {
      for (const table of tablesResult.rows) {
        const columnsResult = await pool.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table.table_name]);
        
        console.log(`\n📊 ${table.table_name} columns:`);
        columnsResult.rows.forEach(col => console.log(`  - ${col.column_name}: ${col.data_type}`));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkWeddings();
