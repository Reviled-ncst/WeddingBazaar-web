const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createMissingCoordinatorProfile() {
  try {
    console.log('\n🔧 CREATING MISSING COORDINATOR PROFILE...\n');
    
    const userId = '1-2025-016';
    const email = 'elealesantos06@gmail.com';
    
    // 1. Check if user exists
    console.log('1️⃣ Checking if user exists...');
    const user = await sql`
      SELECT id, email, first_name, last_name, user_type
      FROM users
      WHERE id = ${userId}
    `;
    
    if (user.length === 0) {
      console.error('   ❌ User not found!');
      return;
    }
    
    console.log('   ✅ User found:');
    console.log(`      ID: ${user[0].id}`);
    console.log(`      Email: ${user[0].email}`);
    console.log(`      Name: ${user[0].first_name} ${user[0].last_name}`);
    console.log(`      Type: ${user[0].user_type}`);
    console.log('');
    
    // 2. Check if profile already exists
    console.log('2️⃣ Checking if profile already exists...');
    const existingProfile = await sql`
      SELECT id FROM vendor_profiles WHERE user_id = ${userId}
    `;
    
    if (existingProfile.length > 0) {
      console.log('   ⚠️  Profile already exists!');
      console.log(`      Profile ID: ${existingProfile[0].id}`);
      console.log('      No action needed.');
      return;
    }
    
    console.log('   ℹ️  No profile found. Creating...\n');
    
    // 3. Create vendor_profile for coordinator
    console.log('3️⃣ Creating vendor_profile...');
    const profile = await sql`
      INSERT INTO vendor_profiles (
        user_id, 
        business_name, 
        business_type, 
        business_description,
        years_experience, 
        team_size, 
        specialties, 
        service_areas,
        verification_status, 
        verification_documents,
        pricing_range, 
        business_hours,
        average_rating, 
        total_reviews, 
        total_bookings,
        response_time_hours, 
        is_featured, 
        is_premium,
        created_at, 
        updated_at
      )
      VALUES (
        ${userId},
        ${user[0].first_name + ' ' + user[0].last_name + ' Wedding Coordination'},
        'Wedding Coordinator',
        'Professional wedding coordination and planning services',
        0,
        'Solo',
        ${['Full Wedding Coordination', 'Day-of Coordination']},
        ${['Metro Manila', 'Nearby Provinces']},
        'unverified',
        ${{
          business_registration: null,
          tax_documents: null,
          identity_verification: null,
          status: 'pending_submission',
          submitted_at: null,
          reviewed_at: null,
          admin_notes: 'Profile created manually due to registration issue'
        }},
        ${{ min: null, max: null, currency: 'PHP', type: 'per_event' }},
        ${{
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { closed: true }
        }},
        0.00, 
        0, 
        0, 
        12, 
        false, 
        false,
        NOW(), 
        NOW()
      )
      RETURNING *
    `;
    
    if (profile && profile.length > 0) {
      console.log('   ✅ Profile created successfully!');
      console.log(`      Profile ID: ${profile[0].id}`);
      console.log(`      User ID: ${profile[0].user_id}`);
      console.log(`      Business Name: ${profile[0].business_name}`);
      console.log(`      Business Type: ${profile[0].business_type}`);
      console.log(`      Years Experience: ${profile[0].years_experience}`);
      console.log(`      Team Size: ${profile[0].team_size}`);
      console.log(`      Specialties: ${JSON.stringify(profile[0].specialties)}`);
      console.log(`      Service Areas: ${JSON.stringify(profile[0].service_areas)}`);
      console.log('');
    } else {
      console.error('   ❌ Profile creation failed - no result returned');
    }
    
    // 4. Verify profile was created
    console.log('4️⃣ Verifying profile creation...');
    const verifyProfile = await sql`
      SELECT id, user_id, business_name, business_type
      FROM vendor_profiles
      WHERE user_id = ${userId}
    `;
    
    if (verifyProfile.length > 0) {
      console.log('   ✅ Profile verified in database!');
      console.log(`      Profile ID: ${verifyProfile[0].id}`);
    } else {
      console.error('   ❌ Profile not found after creation!');
    }
    
    console.log('\n✅ Process complete!\n');
    
  } catch (error) {
    console.error('❌ Error creating coordinator profile:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

createMissingCoordinatorProfile();
