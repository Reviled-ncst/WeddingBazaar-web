/**
 * ADD UNIQUE CONSTRAINT TO vendors.user_id
 * This is required before we can add a foreign key from services.vendor_id
 * 
 * SAFETY CHECK: Verify no duplicate user_ids exist before adding constraint
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addUniqueConstraintToVendors() {
  console.log('\n🔧 ADDING UNIQUE CONSTRAINT TO vendors.user_id\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Check for duplicate user_ids
    console.log('📊 STEP 1: Checking for duplicate user_ids in vendors table');
    console.log('-'.repeat(80));
    
    const duplicates = await sql`
      SELECT user_id, COUNT(*) as count
      FROM vendors
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `;
    
    if (duplicates.length > 0) {
      console.log('❌ ERROR: Found duplicate user_ids:');
      duplicates.forEach(d => {
        console.log(`  - user_id: "${d.user_id}" appears ${d.count} times`);
      });
      console.log('\n⚠️  Cannot add UNIQUE constraint until duplicates are removed!');
      process.exit(1);
    }
    
    console.log('✅ No duplicate user_ids found\n');

    // Step 2: Check for NULL user_ids
    console.log('📊 STEP 2: Checking for NULL user_ids');
    console.log('-'.repeat(80));
    
    const nullUserIds = await sql`
      SELECT id, business_name
      FROM vendors
      WHERE user_id IS NULL
    `;
    
    if (nullUserIds.length > 0) {
      console.log(`❌ ERROR: Found ${nullUserIds.length} vendors with NULL user_id:`);
      nullUserIds.forEach(v => {
        console.log(`  - vendors.id: "${v.id}" | business_name: "${v.business_name}"`);
      });
      console.log('\n⚠️  Cannot add UNIQUE constraint with NULL values!');
      process.exit(1);
    }
    
    console.log('✅ No NULL user_ids found\n');

    // Step 3: Check if UNIQUE constraint already exists
    console.log('📊 STEP 3: Checking for existing UNIQUE constraint');
    console.log('-'.repeat(80));
    
    const existingConstraints = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'vendors'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%user_id%'
    `;
    
    if (existingConstraints.length > 0) {
      console.log(`✅ UNIQUE constraint already exists: ${existingConstraints[0].constraint_name}`);
      console.log('\n⚠️  No action needed!\n');
      return;
    }
    
    console.log('No existing UNIQUE constraint on user_id\n');

    // Step 4: Add UNIQUE constraint
    console.log('📊 STEP 4: Adding UNIQUE constraint to vendors.user_id');
    console.log('-'.repeat(80));
    
    await sql`
      ALTER TABLE vendors
      ADD CONSTRAINT vendors_user_id_unique
      UNIQUE (user_id)
    `;
    
    console.log('✅ UNIQUE constraint added successfully!\n');

    // Step 5: Verify the constraint
    console.log('📊 STEP 5: Verifying new constraint');
    console.log('-'.repeat(80));
    
    const newConstraint = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'vendors'
        AND constraint_name = 'vendors_user_id_unique'
    `;
    
    if (newConstraint.length > 0) {
      console.log('✅ Constraint verified:');
      console.log(`   ${newConstraint[0].constraint_name} (${newConstraint[0].constraint_type})`);
    } else {
      console.log('❌ Constraint not found after creation!');
      process.exit(1);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 SUCCESS! UNIQUE constraint added to vendors.user_id');
    console.log('\nNext step: Run add-services-foreign-key-safe.cjs');
    console.log('=' .repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error adding UNIQUE constraint:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

addUniqueConstraintToVendors();
