#!/usr/bin/env pwsh
# Check what columns actually exist in the services table

Write-Host "`nChecking services table schema..." -ForegroundColor Cyan

# Use Node.js to query the database directly
$script = @'
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'services'
      ORDER BY ordinal_position
    `;
    
    console.log('Services Table Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check if there are pricing-related columns
    const pricingColumns = columns.filter(c => c.column_name.toLowerCase().includes('price'));
    console.log(`\nPricing-related columns found: ${pricingColumns.length}`);
    pricingColumns.forEach(col => {
      console.log(`  * ${col.column_name}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
'@

Set-Content -Path "c:\Games\WeddingBazaar-web\check-services-schema.cjs" -Value $script

# Run the script
Write-Host "Running schema check..." -ForegroundColor Yellow
cd "c:\Games\WeddingBazaar-web"
node check-services-schema.cjs
