/**
 * CHECK FOREIGN KEY CONSTRAINTS - Detailed Analysis
 * This script checks ALL foreign key constraints in the database
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkAllConstraints() {
  console.log('\n🔍 CHECKING ALL FOREIGN KEY CONSTRAINTS\n');
  console.log('=' .repeat(80));

  try {
    // Get ALL foreign key constraints
    const allConstraints = await sql`
      SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('services', 'service_packages', 'package_items', 'service_addons')
      ORDER BY tc.table_name, tc.constraint_name
    `;
    
    console.log(`Total foreign key constraints found: ${allConstraints.length}\n`);
    
    if (allConstraints.length > 0) {
      allConstraints.forEach((constraint, idx) => {
        console.log(`${idx + 1}. TABLE: ${constraint.table_name}`);
        console.log(`   Constraint: ${constraint.constraint_name}`);
        console.log(`   Column: ${constraint.column_name}`);
        console.log(`   References: ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        console.log(`   On Delete: ${constraint.delete_rule}`);
        console.log(`   On Update: ${constraint.update_rule}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No foreign key constraints found!');
    }

    // Specifically check services table
    console.log('\n📊 SERVICES TABLE CONSTRAINTS');
    console.log('-'.repeat(80));
    
    const servicesConstraints = allConstraints.filter(c => c.table_name === 'services');
    
    if (servicesConstraints.length > 0) {
      console.log(`Found ${servicesConstraints.length} constraint(s) on services table:`);
      servicesConstraints.forEach(c => {
        console.log(`  - ${c.column_name} → ${c.foreign_table_name}.${c.foreign_column_name}`);
      });
    } else {
      console.log('❌ No foreign key constraints on services table!');
      console.log('\n⚠️  This is the problem! services.vendor_id has no constraint,');
      console.log('   so it can contain ANY value, causing validation errors.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Constraint check complete!\n');

  } catch (error) {
    console.error('❌ Error checking constraints:', error);
    process.exit(1);
  }
}

checkAllConstraints();
