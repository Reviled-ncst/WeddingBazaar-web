const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkDatabaseColumns() {
  console.log('🔍 Checking actual database columns...');
  
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check all columns in users table
    console.log('📋 All columns in USERS table:');
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    console.log(usersColumns);

    // Check all columns in vendor_profiles table
    console.log('\\n📋 All columns in VENDOR_PROFILES table:');
    const vendorColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      ORDER BY ordinal_position;
    `;
    console.log(vendorColumns);

    // Check if the specific vendor exists and what data it has
    console.log('\\n📋 Checking specific vendor data:');
    const vendorData = await sql`
      SELECT 
        vp.id,
        vp.user_id,
        vp.business_name,
        vp.business_type,
        vp.phone_verified,
        vp.business_verified,
        vp.verification_status,
        u.email,
        u.email_verified,
        u.phone_verified
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      WHERE vp.id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';
    `;
    console.log('Vendor data:', vendorData);

    // Check if new tables exist
    console.log('\\n📋 Checking new verification tables:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('vendor_documents', 'weddings', 'verification_logs')
      ORDER BY table_name;
    `;
    console.log('New tables:', tables);

  } catch (error) {
    console.error('❌ Database check error:', error);
    console.error('Error details:', error.message);
  }
}

checkDatabaseColumns();
