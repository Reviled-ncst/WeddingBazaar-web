require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('=== FIXING VERIFICATION STATUS FOR USER 2-2025-019 ===\n');
  
  try {
    const userId = '2-2025-019';
    const vendorUUID = '8666acb0-9ded-4487-bb5e-c33860d499d1';
    
    // Step 1: Check documents in vendor_documents table
    console.log('Step 1: Checking vendor_documents table...');
    const docs = await sql`
      SELECT id, document_type, verification_status
      FROM vendor_documents
      WHERE vendor_id = ${vendorUUID}
    `;
    console.log(`Found ${docs.length} documents:`);
    docs.forEach(doc => {
      console.log(`  - ${doc.document_type}: ${doc.verification_status}`);
    });
    
    const allDocsApproved = docs.length > 0 && docs.every(doc => doc.verification_status === 'approved');
    console.log(`\nAll documents approved? ${allDocsApproved}`);
    
    if (!allDocsApproved && docs.length > 0) {
      console.log('\n⚠️  Some documents are not approved. Approving them now...');
      
      for (const doc of docs) {
        if (doc.verification_status !== 'approved') {
          await sql`
            UPDATE vendor_documents
            SET verification_status = 'approved',
                verified_at = NOW()
            WHERE id = ${doc.id}
          `;
          console.log(`✅ Approved document: ${doc.document_type}`);
        }
      }
    }
    
    // Step 2: Update vendor_profiles with correct verification status
    console.log('\nStep 2: Updating vendor_profiles verification status...');
    const updateResult = await sql`
      UPDATE vendor_profiles
      SET 
        documents_verified = true,
        business_verified = true,
        verification_status = 'verified',
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING id, business_verified, documents_verified, verification_status
    `;
    
    console.log('\n✅ Updated vendor_profiles:');
    console.log(JSON.stringify(updateResult, null, 2));
    
    // Step 3: Verify the fix
    console.log('\nStep 3: Verifying the fix...');
    const verify = await sql`
      SELECT business_verified, documents_verified, verification_status
      FROM vendor_profiles
      WHERE user_id = ${userId}
    `;
    
    console.log('Current status:');
    console.log(JSON.stringify(verify, null, 2));
    
    console.log('\n✅ FIX COMPLETE! Vendor should now show as verified.');
    console.log('=== DONE ===');
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
})();
