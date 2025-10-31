const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkProfile() {
  console.log('🔍 Checking coordinator profile in database...\n');

  try {
    // Get the most recent coordinator profile
    const profiles = await sql`
      SELECT 
        user_id,
        business_name,
        business_type,
        years_experience,
        team_size,
        specialties,
        service_areas,
        created_at
      FROM vendor_profiles
      WHERE user_id LIKE 'COORD%' OR user_id LIKE '1-2025%'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log(`Found ${profiles.length} coordinator profiles:\n`);

    profiles.forEach((profile, index) => {
      console.log(`\n👤 Profile ${index + 1}:`);
      console.log(`   User ID: ${profile.user_id}`);
      console.log(`   Business Name: ${profile.business_name || 'NULL'}`);
      console.log(`   Business Type: ${profile.business_type || 'NULL'}`);
      console.log(`   Years Experience: ${profile.years_experience !== null ? profile.years_experience : 'NULL'}`);
      console.log(`   Team Size: ${profile.team_size || 'NULL'}`);
      console.log(`   Specialties: ${profile.specialties ? JSON.stringify(profile.specialties) : 'NULL'}`);
      console.log(`   Service Areas: ${profile.service_areas ? JSON.stringify(profile.service_areas) : 'NULL'}`);
      console.log(`   Created: ${profile.created_at}`);
    });

    // Check if the latest one has coordinator fields
    if (profiles.length > 0) {
      const latest = profiles[0];
      console.log('\n' + '='.repeat(60));
      console.log('📊 Latest Profile Verification:');
      console.log('='.repeat(60));
      
      const hasYearsExp = latest.years_experience !== null;
      const hasTeamSize = latest.team_size !== null;
      const hasSpecialties = latest.specialties && latest.specialties.length > 0;
      const hasServiceAreas = latest.service_areas && latest.service_areas.length > 0;
      
      console.log(`\n${hasYearsExp ? '✅' : '❌'} Years Experience: ${latest.years_experience}`);
      console.log(`${hasTeamSize ? '✅' : '❌'} Team Size: ${latest.team_size}`);
      console.log(`${hasSpecialties ? '✅' : '❌'} Specialties: ${JSON.stringify(latest.specialties)}`);
      console.log(`${hasServiceAreas ? '✅' : '❌'} Service Areas: ${JSON.stringify(latest.service_areas)}`);
      
      const allFieldsPresent = hasYearsExp && hasTeamSize && hasSpecialties && hasServiceAreas;
      
      console.log(`\n${allFieldsPresent ? '✅ SUCCESS!' : '⚠️ INCOMPLETE'} - All coordinator fields ${allFieldsPresent ? 'are' : 'are NOT'} present\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nDetails:', error.message);
  }
}

checkProfile().catch(console.error);
