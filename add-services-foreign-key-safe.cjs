/**
 * SAFE MIGRATION - Add Foreign Key Constraint
 * This script safely adds a foreign key constraint to services.vendor_id
 * referencing vendors.user_id (NOT vendors.id)
 * 
 * SAFETY: All existing services already use user_id format, so this is safe!
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addForeignKeyConstraint() {
  console.log('\n🔧 ADDING FOREIGN KEY CONSTRAINT TO SERVICES TABLE\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Verify all existing services use valid user_ids
    console.log('📊 STEP 1: Verifying existing services have valid vendor user_ids');
    console.log('-'.repeat(80));
    
    const servicesCheck = await sql`
      SELECT 
        s.id,
        s.vendor_id,
        s.title,
        v.user_id as matching_user_id
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.user_id
    `;
    
    const invalidServices = servicesCheck.filter(s => s.matching_user_id === null);
    
    console.log(`Total services: ${servicesCheck.length}`);
    console.log(`Valid services (matching vendors.user_id): ${servicesCheck.length - invalidServices.length}`);
    console.log(`Invalid services (no matching vendor): ${invalidServices.length}`);
    
    if (invalidServices.length > 0) {
      console.log('\n❌ ERROR: Found services with invalid vendor_id:');
      invalidServices.forEach(s => {
        console.log(`  - Service: "${s.title}" | vendor_id: "${s.vendor_id}"`);
      });
      console.log('\n⚠️  Cannot add foreign key constraint until these are fixed!');
      process.exit(1);
    }
    
    console.log('✅ All services have valid vendor_id values\n');

    // Step 2: Drop any existing constraint (if it exists)
    console.log('📊 STEP 2: Checking for existing constraints');
    console.log('-'.repeat(80));
    
    const existingConstraints = await sql`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'services'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%vendor_id%'
    `;
    
    if (existingConstraints.length > 0) {
      console.log(`Found existing constraint: ${existingConstraints[0].constraint_name}`);
      console.log('Dropping old constraint...');
      
      await sql.unsafe(`
        ALTER TABLE services
        DROP CONSTRAINT IF EXISTS ${existingConstraints[0].constraint_name}
      `);
      
      console.log('✅ Old constraint dropped\n');
    } else {
      console.log('✅ No existing constraint found\n');
    }

    // Step 3: Add new foreign key constraint
    console.log('📊 STEP 3: Adding new foreign key constraint');
    console.log('-'.repeat(80));
    console.log('Creating constraint: services.vendor_id → vendors.user_id');
    
    await sql`
      ALTER TABLE services
      ADD CONSTRAINT services_vendor_id_fkey
      FOREIGN KEY (vendor_id)
      REFERENCES vendors(user_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `;
    
    console.log('✅ Foreign key constraint added successfully!\n');

    // Step 4: Verify the constraint was created
    console.log('📊 STEP 4: Verifying new constraint');
    console.log('-'.repeat(80));
    
    const newConstraint = await sql`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'services'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'vendor_id'
    `;
    
    if (newConstraint.length > 0) {
      console.log('✅ Constraint verified:');
      console.log(`   ${newConstraint[0].column_name} → ${newConstraint[0].foreign_table_name}.${newConstraint[0].foreign_column_name}`);
    } else {
      console.log('❌ Constraint not found after creation!');
      process.exit(1);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 SUCCESS! Foreign key constraint added and verified!');
    console.log('\nservices.vendor_id now references vendors.user_id');
    console.log('This ensures all new services must have a valid vendor user_id');
    console.log('=' .repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error adding foreign key constraint:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

addForeignKeyConstraint();
