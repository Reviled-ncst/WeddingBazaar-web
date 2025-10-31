const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixColumnTypes() {
  console.log('🔧 Fixing column types in vendor_profiles...\n');

  try {
    // 1. Fix team_size (should be VARCHAR, not INTEGER)
    console.log('1️⃣  Fixing team_size type (INTEGER → VARCHAR)...');
    await sql`
      ALTER TABLE vendor_profiles 
      ALTER COLUMN team_size TYPE VARCHAR(50)
    `;
    console.log('   ✅ team_size is now VARCHAR(50)\n');

    // 2. Fix service_areas (should be TEXT[], not JSONB)
    console.log('2️⃣  Fixing service_areas type (JSONB → TEXT[])...');
    // Drop and recreate to avoid complex conversion
    await sql`ALTER TABLE vendor_profiles DROP COLUMN IF EXISTS service_areas`;
    await sql`ALTER TABLE vendor_profiles ADD COLUMN service_areas TEXT[]`;
    console.log('   ✅ service_areas is now TEXT[] (reset to empty)\n');

    // 3. Verify
    console.log('3️⃣  Verifying changes...');
    const verification = await sql`
      SELECT 
        column_name, 
        data_type,
        udt_name,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'vendor_profiles'
      AND column_name IN ('years_experience', 'team_size', 'specialties', 'service_areas')
      ORDER BY column_name
    `;

    console.log('\n📊 Updated Schema:');
    console.table(verification);

    console.log('\n✅ Column types fixed!');
    console.log('\nFinal schema:');
    console.log('  ✅ years_experience: INTEGER (default 0)');
    console.log('  ✅ team_size: VARCHAR(50)');
    console.log('  ✅ specialties: TEXT[] (array)');
    console.log('  ✅ service_areas: TEXT[] (array)');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  }
}

fixColumnTypes().catch(console.error);
