require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('=== CHECKING VERIFICATION STATUS FOR USER 2-2025-019 ===\n');
  
  try {
    // Check vendor_profiles verification columns
    const profiles = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        business_verified,
        documents_verified,
        verification_status,
        email_verified,
        phone_verified
      FROM vendor_profiles 
      WHERE user_id = '2-2025-019'
    `;
    
    console.log('Vendor Profile Verification Status:');
    console.log(JSON.stringify(profiles, null, 2));
    
    // Check documents table
    const profileId = profiles[0]?.id;
    if (profileId) {
      console.log('\n=== CHECKING DOCUMENTS ===');
      const docs = await sql`
        SELECT id, document_type, verification_status, uploaded_at
        FROM vendor_documents
        WHERE vendor_id = ${profileId}
      `;
      console.log('Documents:', JSON.stringify(docs, null, 2));
    }
    
    console.log('\n=== DONE ===');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
  
  process.exit(0);
})();
