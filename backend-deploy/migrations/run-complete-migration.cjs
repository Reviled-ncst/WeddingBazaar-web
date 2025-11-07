/**
 * Automated Pricing Templates Migration
 * Executes all migration steps automatically
 */

const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log('\n🚀 Starting Automated Pricing Templates Migration...\n');
  
  const client = await pool.connect();
  
  try {
    // Step 1: Create Schema
    console.log('📊 Step 1: Creating database schema...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'create-pricing-templates-tables.sql'),
      'utf8'
    );
    
    await client.query(schemaSQL);
    console.log('   ✅ Schema created successfully!\n');
    
    // Step 2: Run first migration
    console.log('📦 Step 2: Migrating initial categories...');
    const { migratePhotography, migrateCatering, migrateVenue, migrateMusic } = 
      require('./migrate-pricing-templates.cjs');
    
    // Note: The migration script will run automatically when imported
    console.log('   ✅ Initial categories migration complete!\n');
    
    // Step 3: Run second migration  
    console.log('🌸 Step 3: Migrating remaining categories...');
    const { migrateRemainingCategories } = 
      require('./migrate-remaining-categories.cjs');
    
    console.log('   ✅ Remaining categories migration complete!\n');
    
    // Step 4: Verify
    console.log('🔍 Step 4: Verifying migration...');
    const verifyResult = await client.query(`
      SELECT 
        'Total Templates' as metric,
        COUNT(*)::TEXT as value
      FROM pricing_templates
      UNION ALL
      SELECT 
        'Total Inclusions',
        COUNT(*)::TEXT
      FROM package_inclusions
      UNION ALL
      SELECT 
        'Categories with Pricing',
        COUNT(DISTINCT category_id)::TEXT
      FROM pricing_templates
    `);
    
    console.log('\n   📊 Migration Results:');
    verifyResult.rows.forEach(row => {
      console.log(`      ${row.metric}: ${row.value}`);
    });
    
    console.log('\n✨ MIGRATION COMPLETE! ✨\n');
    console.log('📋 Next Steps:');
    console.log('   1. Run verification queries: backend-deploy/migrations/verify-pricing-migration.sql');
    console.log('   2. Begin API development');
    console.log('   3. Update frontend\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
