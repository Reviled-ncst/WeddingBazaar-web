#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  console.log('\n=== VENDOR_SUBSCRIPTIONS TABLE ===');
  const subCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'vendor_subscriptions' 
    ORDER BY ordinal_position
  `;
  subCols.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type}`);
  });
}

checkSchema().catch(console.error);
