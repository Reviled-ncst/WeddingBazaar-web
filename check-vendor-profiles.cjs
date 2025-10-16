const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorProfiles() {
  console.log('🔍 Checking vendor_profiles table...');
  
  try {
    const profiles = await sql`
      SELECT id, user_id, business_name
      FROM vendor_profiles
      LIMIT 5
    `;
    
    console.log(`Found ${profiles.length} vendor profiles:`);
    profiles.forEach(profile => {
      console.log(`   ID: ${profile.id}, User ID: ${profile.user_id}, Business: ${profile.business_name}`);
    });
    
    // Now try to insert using the vendor_profiles.id instead
    if (profiles.length > 0) {
      const vendorProfileId = profiles[0].id;
      
      console.log(`\n🧪 Testing insert with vendor_profiles.id: ${vendorProfileId}`);
      
      try {
        const result = await sql`
          INSERT INTO vendor_documents (
            vendor_id, 
            document_type, 
            document_url,
            file_name
          ) VALUES (
            ${vendorProfileId},
            'Test Business License',
            'https://example.com/test-license.pdf',
            'test-license.pdf'
          ) RETURNING *
        `;
        
        console.log('✅ Test insert successful:', result[0].id);
        console.log('📄 Document created for:', profiles[0].business_name);
        
        // Don't clean up - keep it as sample data
        console.log('✨ Keeping test document as sample data');
        
      } catch (insertError) {
        console.error('❌ Test insert failed:', insertError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkVendorProfiles();
