const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    console.log('\n=== SERVICE_PACKAGES TABLE ===');
    const packagesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'service_packages'
      ORDER BY ordinal_position
    `;
    packagesColumns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n=== SERVICE_ADDONS TABLE ===');
    const addonsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'service_addons'
      ORDER BY ordinal_position
    `;
    addonsColumns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n=== SERVICE_PRICING_RULES TABLE ===');
    const rulesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'service_pricing_rules'
      ORDER BY ordinal_position
    `;
    rulesColumns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n=== PACKAGE_ITEMS TABLE ===');
    const itemsColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'package_items'
      ORDER BY ordinal_position
    `;
    itemsColumns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
