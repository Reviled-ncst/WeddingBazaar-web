#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkVendorsTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position
      LIMIT 5
    `);

    console.log('\n📋 Vendors table columns (first 5):');
    result.rows.forEach(row => {
      const maxLen = row.character_maximum_length ? ` (${row.character_maximum_length})` : '';
      console.log(`  - ${row.column_name}: ${row.data_type}${maxLen}`);
    });
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkVendorsTable();
