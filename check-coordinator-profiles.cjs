const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkCoordinatorProfiles() {
  try {
    console.log('\n🔍 CHECKING COORDINATOR PROFILES IN DATABASE...\n');
    
    // 1. Check all users with coordinator user_type
    console.log('1️⃣ CHECKING USERS TABLE FOR COORDINATORS:');
    const coordinatorUsers = await sql`
      SELECT id, email, first_name, last_name, user_type, created_at
      FROM users
      WHERE user_type = 'coordinator'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    if (coordinatorUsers.length === 0) {
      console.log('   ❌ No users with user_type = "coordinator" found\n');
    } else {
      console.log(`   ✅ Found ${coordinatorUsers.length} coordinator user(s):\n`);
      coordinatorUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. User ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Name: ${user.first_name} ${user.last_name}`);
        console.log(`      Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    // 2. Check vendor_profiles for coordinator entries
    console.log('2️⃣ CHECKING VENDOR_PROFILES TABLE FOR COORDINATOR PROFILES:');
    
    // Check by business_type
    const coordinatorProfilesByType = await sql`
      SELECT 
        vp.id, 
        vp.user_id, 
        vp.business_name, 
        vp.business_type,
        vp.years_experience,
        vp.team_size,
        vp.specialties,
        vp.service_areas,
        vp.created_at,
        u.email,
        u.first_name,
        u.last_name
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      WHERE vp.business_type ILIKE '%coordinator%' 
         OR vp.business_type ILIKE '%coordination%'
      ORDER BY vp.created_at DESC
      LIMIT 10
    `;
    
    if (coordinatorProfilesByType.length === 0) {
      console.log('   ❌ No profiles with business_type containing "coordinator" found\n');
    } else {
      console.log(`   ✅ Found ${coordinatorProfilesByType.length} coordinator profile(s) by business_type:\n`);
      coordinatorProfilesByType.forEach((profile, index) => {
        console.log(`   ${index + 1}. Profile ID: ${profile.id}`);
        console.log(`      User ID: ${profile.user_id}`);
        console.log(`      Email: ${profile.email}`);
        console.log(`      Name: ${profile.first_name} ${profile.last_name}`);
        console.log(`      Business Name: ${profile.business_name}`);
        console.log(`      Business Type: ${profile.business_type}`);
        console.log(`      Years Experience: ${profile.years_experience}`);
        console.log(`      Team Size: ${profile.team_size}`);
        console.log(`      Specialties: ${JSON.stringify(profile.specialties)}`);
        console.log(`      Service Areas: ${JSON.stringify(profile.service_areas)}`);
        console.log(`      Created: ${profile.created_at}`);
        console.log('');
      });
    }
    
    // 3. Check for profiles linked to coordinator users
    if (coordinatorUsers.length > 0) {
      console.log('3️⃣ CHECKING VENDOR_PROFILES FOR COORDINATOR USER IDS:');
      
      const userIds = coordinatorUsers.map(u => u.id);
      const profilesForCoordinators = await sql`
        SELECT 
          vp.id, 
          vp.user_id, 
          vp.business_name, 
          vp.business_type,
          vp.years_experience,
          vp.team_size,
          vp.specialties,
          vp.service_areas,
          vp.created_at
        FROM vendor_profiles vp
        WHERE vp.user_id = ANY(${userIds})
        ORDER BY vp.created_at DESC
      `;
      
      if (profilesForCoordinators.length === 0) {
        console.log('   ❌ No vendor_profiles found for coordinator user IDs\n');
        console.log('   🚨 ISSUE: Users exist but no profiles created!\n');
      } else {
        console.log(`   ✅ Found ${profilesForCoordinators.length} profile(s) for coordinator users:\n`);
        profilesForCoordinators.forEach((profile, index) => {
          console.log(`   ${index + 1}. Profile ID: ${profile.id}`);
          console.log(`      User ID: ${profile.user_id}`);
          console.log(`      Business Name: ${profile.business_name}`);
          console.log(`      Business Type: ${profile.business_type}`);
          console.log(`      Years Experience: ${profile.years_experience}`);
          console.log(`      Team Size: ${profile.team_size}`);
          console.log(`      Specialties: ${JSON.stringify(profile.specialties)}`);
          console.log(`      Service Areas: ${JSON.stringify(profile.service_areas)}`);
          console.log(`      Created: ${profile.created_at}`);
          console.log('');
        });
      }
    }
    
    // 4. Summary
    console.log('📊 SUMMARY:');
    console.log(`   • Coordinator users in users table: ${coordinatorUsers.length}`);
    console.log(`   • Coordinator profiles by business_type: ${coordinatorProfilesByType.length}`);
    if (coordinatorUsers.length > 0) {
      const profileCount = await sql`
        SELECT COUNT(*) as count
        FROM vendor_profiles vp
        WHERE vp.user_id = ANY(${coordinatorUsers.map(u => u.id)})
      `;
      console.log(`   • Profiles linked to coordinator users: ${profileCount[0].count}`);
    }
    console.log('');
    
    // 5. Check for recent registrations (last 24 hours)
    console.log('4️⃣ RECENT COORDINATOR REGISTRATIONS (LAST 24 HOURS):');
    const recentCoordinators = await sql`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type,
        u.created_at,
        vp.id as profile_id,
        vp.business_name,
        vp.business_type
      FROM users u
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      WHERE u.user_type = 'coordinator'
        AND u.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY u.created_at DESC
    `;
    
    if (recentCoordinators.length === 0) {
      console.log('   ℹ️  No coordinator registrations in the last 24 hours\n');
    } else {
      console.log(`   ✅ Found ${recentCoordinators.length} recent coordinator registration(s):\n`);
      recentCoordinators.forEach((user, index) => {
        console.log(`   ${index + 1}. User: ${user.email} (${user.first_name} ${user.last_name})`);
        console.log(`      User ID: ${user.id}`);
        console.log(`      Profile ID: ${user.profile_id || '❌ NO PROFILE'}`);
        console.log(`      Business Name: ${user.business_name || 'N/A'}`);
        console.log(`      Business Type: ${user.business_type || 'N/A'}`);
        console.log(`      Registered: ${user.created_at}`);
        console.log('');
      });
    }
    
    console.log('✅ Database check complete!\n');
    
  } catch (error) {
    console.error('❌ Error checking coordinator profiles:', error);
    console.error('Error details:', error.message);
  }
}

checkCoordinatorProfiles();
