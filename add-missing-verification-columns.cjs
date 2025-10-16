const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function addMissingVerificationColumns() {
  console.log('🔧 Adding missing verification columns...');
  
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Add phone_verified to users table
    console.log('1. Adding phone_verified to users table...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;`;
    console.log('   ✅ Added phone_verified to users');

    // Add phone_verified to vendor_profiles table  
    console.log('2. Adding phone_verified to vendor_profiles table...');
    await sql`ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;`;
    console.log('   ✅ Added phone_verified to vendor_profiles');

    // Create the vendor_documents table (seems to be missing)
    console.log('3. Creating vendor_documents table...');
    await sql`
      CREATE TABLE IF NOT EXISTS vendor_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        document_url VARCHAR(500) NOT NULL,
        file_name VARCHAR(255),
        verification_status VARCHAR(20) DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT NOW(),
        verified_at TIMESTAMP,
        verified_by VARCHAR(255),
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('   ✅ Created vendor_documents table');

    // Create the weddings table
    console.log('4. Creating weddings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS weddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        couple_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        wedding_date DATE,
        venue VARCHAR(255),
        location VARCHAR(255),
        guest_count INTEGER,
        budget DECIMAL(12,2),
        status VARCHAR(20) DEFAULT 'planning',
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('   ✅ Created weddings table');

    // Create the verification_logs table
    console.log('5. Creating verification_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS verification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        verification_type VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        details JSONB,
        admin_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log('   ✅ Created verification_logs table');

    // Update existing records to set defaults
    console.log('6. Setting default values for existing records...');
    await sql`UPDATE users SET phone_verified = FALSE WHERE phone_verified IS NULL;`;
    await sql`UPDATE vendor_profiles SET phone_verified = FALSE WHERE phone_verified IS NULL;`;
    console.log('   ✅ Updated default values');

    // Verify the changes
    console.log('\\n🔍 Verifying changes...');
    
    // Check users table
    const usersCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'phone_verified';
    `;
    console.log(`   Users.phone_verified exists: ${usersCheck.length > 0 ? '✅' : '❌'}`);

    // Check vendor_profiles table
    const vendorCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      AND column_name = 'phone_verified';
    `;
    console.log(`   Vendor_profiles.phone_verified exists: ${vendorCheck.length > 0 ? '✅' : '❌'}`);

    // Check new tables
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('vendor_documents', 'weddings', 'verification_logs')
      ORDER BY table_name;
    `;
    console.log(`   New tables created: ${tablesCheck.map(t => t.table_name).join(', ')}`);

    // Test the problematic query
    console.log('\\n🧪 Testing the vendor verification query...');
    const testQuery = await sql`
      SELECT 
        vp.id,
        vp.business_name,
        vp.phone_verified as vp_phone_verified,
        vp.business_verified,
        vp.verification_status,
        u.email_verified,
        u.phone_verified as u_phone_verified
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      WHERE vp.id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';
    `;
    
    if (testQuery.length > 0) {
      console.log('   ✅ Query working! Vendor data:');
      console.log(testQuery[0]);
    } else {
      console.log('   ❌ Vendor not found');
    }

    console.log('\\n✅ All verification columns and tables have been added successfully!');

  } catch (error) {
    console.error('❌ Error adding verification columns:', error);
    console.error('Error details:', error.message);
  }
}

addMissingVerificationColumns();
