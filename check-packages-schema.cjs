#!/usr/bin/env node
/**
 * 🔍 Check Service Packages Table Schema
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  console.log('🔍 Checking service_packages table schema...\n');

  try {
    // Get column information
    const columns = await sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'service_packages'
      ORDER BY ordinal_position
    `;

    console.log('📋 Columns in service_packages table:');
    console.log('─'.repeat(80));
    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type}${length} ${nullable}`);
    });
    console.log('─'.repeat(80));

    // Check for tier column specifically
    const hasTier = columns.some(col => col.column_name === 'tier');
    const hasName = columns.some(col => col.column_name === 'name');
    const hasPackageName = columns.some(col => col.column_name === 'package_name');

    console.log('\n✅ Key columns:');
    console.log(`   ${hasTier ? '✅' : '❌'} tier column`);
    console.log(`   ${hasName ? '✅' : '❌'} name column`);
    console.log(`   ${hasPackageName ? '✅' : '❌'} package_name column`);

    // Get sample data
    const sampleData = await sql`
      SELECT * FROM service_packages LIMIT 3
    `;

    if (sampleData.length > 0) {
      console.log('\n📊 Sample data:');
      console.log(JSON.stringify(sampleData, null, 2));
    } else {
      console.log('\n📊 No data in table yet.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkSchema()
  .then(() => {
    console.log('\n✅ Schema check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Check failed:', error);
    process.exit(1);
  });
