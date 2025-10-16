const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyVerificationSchema() {
  console.log('🔧 Applying verification schema to database...');
  
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('💡 Make sure to set DATABASE_URL in your .env file or environment');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'backend-deploy', 'database', 'verification-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Schema file loaded, applying changes...');
    
    // Split the schema into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}. Executing: ${statement.substring(0, 50)}...`);
          const result = await sql.unsafe(statement + ';');
          console.log(`   ✅ Success`);
        } catch (error) {
          // Some errors are expected (like "column already exists")
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            console.log(`   ⚠️  Expected: ${error.message}`);
          } else {
            console.log(`   ❌ Error: ${error.message}`);
          }
        }
      }
    }

    console.log('\n🔍 Verifying schema changes...');
    
    // Check if verification columns were added to users table
    const usersColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('phone_verified', 'email_verification_token')
      ORDER BY column_name;
    `;
    
    console.log('📋 Users table verification columns:');
    console.log(usersColumns);
    
    // Check if verification columns were added to vendor_profiles table
    const vendorColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      AND column_name IN ('phone_verified', 'business_verified', 'verification_status')
      ORDER BY column_name;
    `;
    
    console.log('📋 Vendor_profiles table verification columns:');
    console.log(vendorColumns);
    
    // Check if new tables were created
    const newTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('vendor_documents', 'weddings', 'verification_logs')
      ORDER BY table_name;
    `;
    
    console.log('📋 New verification tables:');
    console.log(newTables);

    // Check current vendors and their profiles
    const vendorProfiles = await sql`
      SELECT id, user_id, business_name, business_type, verification_status 
      FROM vendor_profiles 
      LIMIT 5;
    `;
    
    console.log('📋 Current vendor profiles:');
    console.log(vendorProfiles);

    console.log('\\n✅ Verification schema application completed!');

  } catch (error) {
    console.error('❌ Failed to apply verification schema:', error);
    console.error('Error details:', error.message);
  }
}

applyVerificationSchema();
