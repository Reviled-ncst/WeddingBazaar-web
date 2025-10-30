#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUserTypeConstraint() {
  try {
    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conname LIKE '%user_type%'
    `);

    console.log('\n📋 User type constraint:');
    result.rows.forEach(row => {
      console.log(`\nConstraint: ${row.conname}`);
      console.log(`Definition: ${row.definition}`);
    });
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserTypeConstraint();
