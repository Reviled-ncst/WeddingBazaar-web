require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('=== VERIFYING FIX FOR USER 2-2025-019 ===\n');
  
  try {
    const userId = '2-2025-019';
    const vendorUUID = '8666acb0-9ded-4487-bb5e-c33860d499d1';
    
    // Check vendor_profiles
    console.log('1. Checking vendor_profiles:');
    const profile = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        business_verified,
        documents_verified,
        verification_status,
        updated_at
      FROM vendor_profiles
      WHERE user_id = ${userId}
    `;
    console.log(JSON.stringify(profile, null, 2));
    
    // Check vendor_documents
    console.log('\n2. Checking vendor_documents:');
    const docs = await sql`
      SELECT 
        id,
        document_type,
        verification_status,
        verified_at,
        uploaded_at
      FROM vendor_documents
      WHERE vendor_id = ${vendorUUID}
      ORDER BY uploaded_at DESC
    `;
    console.log(JSON.stringify(docs, null, 2));
    
    // Check vendors table (for VEN-00021)
    console.log('\n3. Checking vendors table:');
    const vendor = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        is_verified
      FROM vendors
      WHERE user_id = ${userId}
    `;
    console.log(JSON.stringify(vendor, null, 2));
    
    // Summary
    console.log('\n=== SUMMARY ===');
    if (profile.length > 0) {
      const p = profile[0];
      console.log(`✅ Vendor Profile Found`);
      console.log(`   - Business Verified: ${p.business_verified}`);
      console.log(`   - Documents Verified: ${p.documents_verified}`);
      console.log(`   - Verification Status: ${p.verification_status}`);
    } else {
      console.log('❌ Vendor Profile NOT FOUND');
    }
    
    if (docs.length > 0) {
      const allApproved = docs.every(d => d.verification_status === 'approved');
      console.log(`\n✅ Documents: ${docs.length} found`);
      console.log(`   - All Approved: ${allApproved}`);
      docs.forEach(d => {
        console.log(`   - ${d.document_type}: ${d.verification_status}`);
      });
    } else {
      console.log('\n❌ NO DOCUMENTS FOUND');
    }
    
    if (vendor.length > 0) {
      console.log(`\n✅ Vendors Table: ${vendor[0].is_verified ? 'VERIFIED' : 'NOT VERIFIED'}`);
    }
    
    console.log('\n=== DONE ===');
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
})();
