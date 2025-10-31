#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkIdColumn() {
  try {
    const result = await pool.query(`
      SELECT column_name, column_default, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    
    console.log('ID column details:', JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkIdColumn();
