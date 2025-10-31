const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function migrateVendorProfiles() {
  console.log('🔧 Starting vendor_profiles migration for coordinator fields...\n');

  try {
    // 1. Add years_experience column
    console.log('1️⃣  Adding years_experience column...');
    await sql`
      ALTER TABLE vendor_profiles 
      ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0
    `;
    console.log('   ✅ years_experience column added\n');

    // 2. Add team_size column
    console.log('2️⃣  Adding team_size column...');
    await sql`
      ALTER TABLE vendor_profiles 
      ADD COLUMN IF NOT EXISTS team_size VARCHAR(50)
    `;
    console.log('   ✅ team_size column added\n');

    // 3. Add specialties column
    console.log('3️⃣  Adding specialties column...');
    await sql`
      ALTER TABLE vendor_profiles 
      ADD COLUMN IF NOT EXISTS specialties TEXT[]
    `;
    console.log('   ✅ specialties column added\n');

    // 4. Check service_areas type
    console.log('4️⃣  Checking service_areas type...');
    const typeCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      AND column_name = 'service_areas'
    `;
    console.log(`   Current type: ${typeCheck[0]?.data_type || 'NOT FOUND'}`);

    // 5. Convert service_areas to TEXT[] if needed
    if (typeCheck[0]?.data_type !== 'ARRAY') {
      console.log('5️⃣  Converting service_areas to TEXT[]...');
      try {
        await sql`
          ALTER TABLE vendor_profiles 
          ALTER COLUMN service_areas TYPE TEXT[] 
          USING CASE 
            WHEN service_areas IS NULL OR service_areas = '' OR service_areas = '[]' THEN NULL
            ELSE ARRAY[service_areas]::TEXT[]
          END
        `;
        console.log('   ✅ service_areas converted to TEXT[]\n');
      } catch (error) {
        console.log('   ℹ️  service_areas may already be TEXT[] or conversion not needed\n');
      }
    } else {
      console.log('   ✅ service_areas is already TEXT[]\n');
    }

    // 6. Create indexes
    console.log('6️⃣  Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_vendor_profiles_years_exp 
      ON vendor_profiles(years_experience)
    `;
    console.log('   ✅ Index on years_experience created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_vendor_profiles_team_size 
      ON vendor_profiles(team_size)
    `;
    console.log('   ✅ Index on team_size created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_vendor_profiles_specialties 
      ON vendor_profiles USING GIN(specialties)
    `;
    console.log('   ✅ GIN index on specialties created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_vendor_profiles_service_areas 
      ON vendor_profiles USING GIN(service_areas)
    `;
    console.log('   ✅ GIN index on service_areas created\n');

    // 7. Verify the migration
    console.log('7️⃣  Verifying migration...');
    const verification = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'vendor_profiles'
      AND column_name IN ('years_experience', 'team_size', 'specialties', 'service_areas')
      ORDER BY column_name
    `;

    console.log('\n📊 Schema Verification:');
    console.table(verification);

    // 8. Test query
    console.log('\n8️⃣  Testing sample query...');
    const sampleData = await sql`
      SELECT 
        user_id,
        business_name,
        business_type,
        years_experience,
        team_size,
        specialties,
        service_areas
      FROM vendor_profiles
      LIMIT 3
    `;
    console.log(`   ✅ Found ${sampleData.length} profiles\n`);

    if (sampleData.length > 0) {
      console.log('📋 Sample Data:');
      sampleData.forEach((profile, index) => {
        console.log(`\nProfile ${index + 1}:`);
        console.log(`   User ID: ${profile.user_id}`);
        console.log(`   Business: ${profile.business_name}`);
        console.log(`   Type: ${profile.business_type}`);
        console.log(`   Years Exp: ${profile.years_experience || 'NULL'}`);
        console.log(`   Team Size: ${profile.team_size || 'NULL'}`);
        console.log(`   Specialties: ${JSON.stringify(profile.specialties) || 'NULL'}`);
        console.log(`   Service Areas: ${JSON.stringify(profile.service_areas) || 'NULL'}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\nCoordinator registration fields are now ready:');
    console.log('  ✅ years_experience (INTEGER)');
    console.log('  ✅ team_size (VARCHAR)');
    console.log('  ✅ specialties (TEXT[])');
    console.log('  ✅ service_areas (TEXT[])');
    console.log('\nYou can now test coordinator registration!\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateVendorProfiles().catch(console.error);
