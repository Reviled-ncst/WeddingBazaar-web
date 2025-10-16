const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixDocumentVerification() {
  try {
    console.log('🔧 Fixing document verification status...');
    
    // Update the vendor_profiles table to set documents_verified = true 
    // for vendors with approved documents
    const updateResult = await sql`
      UPDATE vendor_profiles 
      SET documents_verified = true,
          business_verified = true
      WHERE id IN (
        SELECT DISTINCT vd.vendor_id 
        FROM vendor_documents vd 
        WHERE vd.verification_status = 'approved'
      )
    `;
    console.log('✅ Updated vendor profiles with approved documents:', updateResult);
    
    // Verify the fix for our specific user
    const verifyUser = await sql`
      SELECT id, user_id, business_name, documents_verified, business_verified
      FROM vendor_profiles 
      WHERE user_id = '2-2025-001'
    `;
    console.log('✅ Verification - User 2-2025-001 status:', verifyUser);
    
    // Count approved documents for this vendor
    const docCount = await sql`
      SELECT document_type, verification_status
      FROM vendor_documents 
      WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
    `;
    console.log('📋 Documents for vendor profile:', docCount);
    
    console.log('🎉 Document verification status fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing document verification:', error);
  }
}

fixDocumentVerification();
