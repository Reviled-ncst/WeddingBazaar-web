const { sql } = require('./backend-deploy/config/database.cjs');

async function checkCoordinatorSupport() {
  console.log('🔍 Checking Coordinator User Type Support in Database...\n');
  
  try {
    // 1. Check users table schema
    console.log('1️⃣ Checking users table schema:');
    const usersSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('id', 'email', 'user_type', 'role', 'first_name', 'last_name')
      ORDER BY ordinal_position
    `;
    console.log(JSON.stringify(usersSchema, null, 2));
    
    // 2. Check vendor_profiles table schema (used for coordinators too)
    console.log('\n2️⃣ Checking vendor_profiles table schema:');
    const vendorProfilesSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'vendor_profiles' 
      AND column_name IN ('id', 'user_id', 'business_name', 'business_type', 'years_experience', 'team_size', 'specialties', 'service_areas')
      ORDER BY ordinal_position
    `;
    console.log(JSON.stringify(vendorProfilesSchema, null, 2));
    
    // 3. Check for existing coordinator users
    console.log('\n3️⃣ Checking for existing coordinator users:');
    const coordinatorUsers = await sql`
      SELECT id, email, user_type, first_name, last_name, created_at
      FROM users 
      WHERE user_type = 'coordinator'
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log(`Found ${coordinatorUsers.length} coordinator user(s)`);
    if (coordinatorUsers.length > 0) {
      console.log(JSON.stringify(coordinatorUsers, null, 2));
    }
    
    // 4. Check for coordinator profiles
    console.log('\n4️⃣ Checking for coordinator vendor profiles:');
    const coordinatorProfiles = await sql`
      SELECT vp.id, vp.user_id, vp.business_name, vp.business_type, 
             vp.years_experience, vp.team_size, vp.specialties, vp.service_areas,
             u.email, u.user_type
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      WHERE u.user_type = 'coordinator'
      ORDER BY vp.created_at DESC
      LIMIT 5
    `;
    console.log(`Found ${coordinatorProfiles.length} coordinator profile(s)`);
    if (coordinatorProfiles.length > 0) {
      console.log(JSON.stringify(coordinatorProfiles, null, 2));
    }
    
    // 5. Check if coordinator columns exist in vendor_profiles
    console.log('\n5️⃣ Verifying coordinator-specific columns:');
    const coordinatorColumns = await sql`
      SELECT 
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'years_experience') as has_years_experience,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'team_size') as has_team_size,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'specialties') as has_specialties,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'service_areas') as has_service_areas
    `;
    console.log(JSON.stringify(coordinatorColumns[0], null, 2));
    
    console.log('\n✅ Schema check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
  
  process.exit(0);
}

checkCoordinatorSupport();
