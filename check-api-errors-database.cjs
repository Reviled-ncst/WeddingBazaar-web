/**
 * Database Schema Checker for API Errors
 * Checks if required tables and columns exist for:
 * - service_category_fields (for categories by-name endpoint)
 * - vendor_subscriptions (for services POST endpoint)
 * - services table columns
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  console.log('\n🔍 CHECKING DATABASE SCHEMA FOR API ERRORS\n');
  console.log('=' .repeat(60));

  try {
    // ============================================================================
    // CHECK 1: service_category_fields table
    // ============================================================================
    console.log('\n📋 CHECK 1: service_category_fields table');
    console.log('-'.repeat(60));
    
    const categoryFieldsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'service_category_fields'
      ) as exists
    `;
    
    if (categoryFieldsExists[0].exists) {
      console.log('✅ service_category_fields table EXISTS');
      
      // Check structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'service_category_fields'
        ORDER BY ordinal_position
      `;
      
      console.log('\n   Columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
      // Check if there's any data
      const count = await sql`SELECT COUNT(*) as count FROM service_category_fields`;
      console.log(`\n   Records: ${count[0].count} rows`);
      
    } else {
      console.log('❌ service_category_fields table DOES NOT EXIST');
      console.log('   This will cause 500 error on /api/categories/by-name/:name/fields');
      console.log('\n   💡 SOLUTION OPTIONS:');
      console.log('   1. Create the table (see create-service-category-fields-table.sql)');
      console.log('   2. Add fallback logic to return empty fields array');
      console.log('   3. Use mock data for development');
    }

    // ============================================================================
    // CHECK 2: vendor_subscriptions table
    // ============================================================================
    console.log('\n\n📋 CHECK 2: vendor_subscriptions table');
    console.log('-'.repeat(60));
    
    const subscriptionsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vendor_subscriptions'
      ) as exists
    `;
    
    if (subscriptionsExists[0].exists) {
      console.log('✅ vendor_subscriptions table EXISTS');
      
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'vendor_subscriptions'
        ORDER BY ordinal_position
      `;
      
      console.log('\n   Columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
      const count = await sql`SELECT COUNT(*) as count FROM vendor_subscriptions`;
      console.log(`\n   Records: ${count[0].count} rows`);
      
    } else {
      console.log('❌ vendor_subscriptions table DOES NOT EXIST');
      console.log('   Services POST has try-catch fallback, but may cause issues');
      console.log('\n   💡 SOLUTION: Create table or ensure graceful degradation works');
    }

    // ============================================================================
    // CHECK 3: services table structure
    // ============================================================================
    console.log('\n\n📋 CHECK 3: services table structure');
    console.log('-'.repeat(60));
    
    const servicesExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'services'
      ) as exists
    `;
    
    if (servicesExists[0].exists) {
      console.log('✅ services table EXISTS');
      
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'services'
        ORDER BY ordinal_position
      `;
      
      console.log('\n   All Columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
      // Check for DSS fields
      const dssFields = ['years_in_business', 'service_tier', 'wedding_styles', 'cultural_specialties', 'availability'];
      const missingDssFields = dssFields.filter(field => 
        !columns.some(col => col.column_name === field)
      );
      
      if (missingDssFields.length > 0) {
        console.log('\n   ⚠️  Missing DSS fields:', missingDssFields.join(', '));
        console.log('   These fields are used in POST /api/services');
      } else {
        console.log('\n   ✅ All DSS fields present');
      }
      
      const count = await sql`SELECT COUNT(*) as count FROM services`;
      console.log(`\n   Records: ${count[0].count} rows`);
      
    } else {
      console.log('❌ services table DOES NOT EXIST - CRITICAL ERROR');
    }

    // ============================================================================
    // CHECK 4: Test actual queries
    // ============================================================================
    console.log('\n\n📋 CHECK 4: Test actual queries');
    console.log('-'.repeat(60));
    
    // Test categories query
    try {
      console.log('\n   Testing: SELECT from service_categories...');
      const cats = await sql`
        SELECT id, name, display_name
        FROM service_categories 
        WHERE name = 'Cake' OR display_name = 'Cake'
        LIMIT 1
      `;
      if (cats.length > 0) {
        console.log(`   ✅ Found category: ${cats[0].display_name} (ID: ${cats[0].id})`);
        
        // Try to get fields if table exists
        if (categoryFieldsExists[0].exists) {
          const fields = await sql`
            SELECT COUNT(*) as count
            FROM service_category_fields 
            WHERE category_id = ${cats[0].id}
          `;
          console.log(`   ✅ Fields for Cake: ${fields[0].count} fields`);
        }
      } else {
        console.log('   ⚠️  No "Cake" category found');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    // ============================================================================
    // SUMMARY
    // ============================================================================
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    const issues = [];
    
    if (!categoryFieldsExists[0].exists) {
      issues.push('❌ service_category_fields table missing → /api/categories/by-name/:name/fields will fail');
    }
    
    if (!subscriptionsExists[0].exists) {
      issues.push('⚠️  vendor_subscriptions table missing → service creation limits may not work');
    }
    
    if (!servicesExists[0].exists) {
      issues.push('❌ services table missing → CRITICAL: POST /api/services will fail');
    }
    
    if (issues.length === 0) {
      console.log('\n✅ ALL TABLES EXIST!');
      console.log('\n   If endpoints still fail, check:');
      console.log('   1. Render deployment logs for actual SQL errors');
      console.log('   2. Data type mismatches');
      console.log('   3. Constraint violations');
      console.log('   4. Authentication/authorization issues');
    } else {
      console.log('\n⚠️  ISSUES FOUND:\n');
      issues.forEach(issue => console.log(`   ${issue}`));
      console.log('\n   Next steps:');
      console.log('   1. Create missing tables');
      console.log('   2. Add fallback logic in code');
      console.log('   3. Test locally before deploying');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database check complete!\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR during database check:');
    console.error(error);
    process.exit(1);
  }
}

// Run the check
checkDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
