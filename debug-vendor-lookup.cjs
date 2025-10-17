const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function debugVendorLookup() {
  try {
    console.log('🔍 Testing vendor ID lookup logic...');
    
    const vendorId = '2-2025-001';
    let queryVendorId = vendorId;
    
    // Test the UUID check
    const isUUID = vendorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    console.log('📋 Is UUID?', isUUID);
    
    if (!isUUID) {
      console.log('🔍 Non-UUID vendor ID detected, looking up by user_id:', vendorId);
      const userLookup = await sql`
        SELECT vp.id as vendor_profile_id
        FROM vendor_profiles vp
        INNER JOIN users u ON vp.user_id = u.id
        WHERE u.id = ${vendorId}
      `;
      
      console.log('📋 User lookup result:', userLookup);
      
      if (userLookup.length > 0) {
        queryVendorId = userLookup[0].vendor_profile_id;
        console.log('✅ Found vendor profile ID:', queryVendorId);
      } else {
        console.log('❌ No vendor profile found for user ID:', vendorId);
      }
    }
    
    // Now test the documents query with the correct vendor ID
    console.log('🔍 Looking for documents with vendor_id:', queryVendorId);
    
    const docsResult = await sql`
      SELECT DISTINCT vd.id, vd.document_type, vd.document_url, vd.verification_status, 
             vd.uploaded_at, vd.verified_at, vd.rejection_reason, vd.vendor_id
      FROM vendor_documents vd
      WHERE vd.vendor_id = ${queryVendorId}
      ORDER BY vd.uploaded_at DESC
    `;
    
    console.log('📄 Documents found:', docsResult.length);
    console.log('📄 Documents data:', docsResult);
    
    // Test the final mapping
    const mappedDocs = docsResult.map(doc => ({
      id: doc.id,
      type: doc.document_type,
      url: doc.document_url,
      status: doc.verification_status,
      uploadedAt: doc.uploaded_at,
      verifiedAt: doc.verified_at,
      rejectionReason: doc.rejection_reason
    }));
    
    console.log('📄 Mapped documents:', mappedDocs);
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugVendorLookup();
