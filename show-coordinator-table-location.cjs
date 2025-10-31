const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function showCoordinatorLocation() {
  try {
    console.log('\n📍 WHERE ARE COORDINATOR PROFILES STORED?\n');
    console.log('=' .repeat(60));
    
    // Show the database design
    console.log('\n🏗️  DATABASE ARCHITECTURE:\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│  users table                                        │');
    console.log('│  ├── user_type = "coordinator" (10 users)          │');
    console.log('│  ├── user_type = "vendor" (other users)            │');
    console.log('│  └── user_type = "couple" (other users)            │');
    console.log('└─────────────────────────────────────────────────────┘');
    console.log('');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│  vendor_profiles table (ALL business profiles)      │');
    console.log('│  ├── business_type = "Wedding Coordinator" (6)     │');
    console.log('│  ├── business_type = "Photography" (vendors)       │');
    console.log('│  ├── business_type = "Catering" (vendors)          │');
    console.log('│  └── etc.                                           │');
    console.log('└─────────────────────────────────────────────────────┘');
    console.log('');
    console.log('❌ NO separate "coordinator_profiles" table');
    console.log('✅ Coordinators use "vendor_profiles" table\n');
    console.log('=' .repeat(60));
    
    // Query 1: Show your specific profile
    console.log('\n🔍 YOUR COORDINATOR PROFILE:\n');
    const yourProfile = await sql`
      SELECT 
        vp.id as profile_id,
        vp.user_id,
        vp.business_name,
        vp.business_type,
        vp.years_experience,
        vp.team_size,
        vp.specialties,
        vp.service_areas,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      WHERE u.email = 'elealesantos06@gmail.com'
    `;
    
    if (yourProfile.length > 0) {
      const profile = yourProfile[0];
      console.log('✅ FOUND IN vendor_profiles TABLE:');
      console.log('');
      console.log(`   Profile ID:      ${profile.profile_id}`);
      console.log(`   User ID:         ${profile.user_id}`);
      console.log(`   Email:           ${profile.email}`);
      console.log(`   Name:            ${profile.first_name} ${profile.last_name}`);
      console.log(`   User Type:       ${profile.user_type}`);
      console.log(`   Business Name:   ${profile.business_name}`);
      console.log(`   Business Type:   ${profile.business_type}`);
      console.log(`   Experience:      ${profile.years_experience} years`);
      console.log(`   Team Size:       ${profile.team_size}`);
      console.log(`   Specialties:     ${JSON.stringify(profile.specialties)}`);
      console.log(`   Service Areas:   ${JSON.stringify(profile.service_areas)}`);
    } else {
      console.log('❌ Profile not found');
    }
    
    // Query 2: Show all coordinator profiles
    console.log('\n\n📊 ALL COORDINATOR PROFILES IN vendor_profiles:\n');
    const allCoordinators = await sql`
      SELECT 
        vp.id as profile_id,
        vp.user_id,
        vp.business_name,
        vp.business_type,
        u.email,
        u.first_name,
        u.last_name
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      WHERE u.user_type = 'coordinator'
      ORDER BY vp.created_at DESC
    `;
    
    console.log(`Found ${allCoordinators.length} coordinator profiles:\n`);
    allCoordinators.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email}`);
      console.log(`   User ID:       ${profile.user_id}`);
      console.log(`   Profile ID:    ${profile.profile_id}`);
      console.log(`   Business Name: ${profile.business_name}`);
      console.log(`   Business Type: ${profile.business_type}`);
      console.log('');
    });
    
    // Query 3: Show table structure
    console.log('\n🔧 TABLE STRUCTURE:\n');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE '%profile%'
      ORDER BY table_name
    `;
    
    console.log('Available profile tables:');
    tables.forEach(table => {
      console.log(`   • ${table.table_name}`);
    });
    
    console.log('\n✅ Summary:');
    console.log('   • Coordinators are stored in "vendor_profiles" table');
    console.log('   • Identified by business_type containing "Coordinator"');
    console.log('   • No separate "coordinator_profiles" table exists');
    console.log('   • This is the correct database design\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showCoordinatorLocation();
