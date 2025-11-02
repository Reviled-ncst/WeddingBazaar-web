require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addVendorTypeToProfiles() {
  try {
    console.log('🔧 Adding vendor_type to vendor_profiles table...\n');
    
    // Add vendor_type column to vendor_profiles
    await sql`
      ALTER TABLE vendor_profiles 
      ADD COLUMN IF NOT EXISTS vendor_type VARCHAR(50) DEFAULT 'business'
    `;
    
    console.log('✅ Added vendor_type column to vendor_profiles');
    
    // Drop existing constraint if exists
    try {
      await sql`
        ALTER TABLE vendor_profiles
        DROP CONSTRAINT IF EXISTS check_vendor_profiles_type
      `;
    } catch (e) {
      // Ignore error if constraint doesn't exist
    }
    
    // Add new constraint
    await sql`
      ALTER TABLE vendor_profiles
      ADD CONSTRAINT check_vendor_profiles_type 
      CHECK (vendor_type IN ('business', 'freelancer'))
    `;
    
    console.log('✅ Added check constraint');
    
    // Update existing records
    const result = await sql`
      UPDATE vendor_profiles 
      SET vendor_type = 'business' 
      WHERE vendor_type IS NULL
    `;
    
    console.log(`✅ Updated ${result.count || 0} existing profiles`);
    
    // Verify
    const profiles = await sql`
      SELECT id, business_name, vendor_type 
      FROM vendor_profiles 
      LIMIT 5
    `;
    
    console.log('\n📋 Sample vendor_profiles with vendor_type:');
    console.table(profiles);
    
    console.log('\n🎉 Migration complete for vendor_profiles!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addVendorTypeToProfiles();
