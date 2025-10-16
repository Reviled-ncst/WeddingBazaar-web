const { sql } = require('./backend-deploy/config/database.cjs');

async function debugAdminDocumentsEndpoint() {
  console.log('🔍 Debugging admin documents endpoint...');
  
  try {
    // Test the exact query from the endpoint
    console.log('📡 Testing document query...');
    
    const documents = await sql`
      SELECT 
        vd.id,
        vd.vendor_id,
        vd.document_type,
        vd.document_url,
        vd.file_name,
        vd.uploaded_at,
        vd.verification_status,
        vd.verified_at,
        vd.rejection_reason,
        -- Get vendor info
        vp.business_name,
        u.first_name,
        u.last_name,
        u.email
      FROM vendor_documents vd
      LEFT JOIN vendor_profiles vp ON vd.vendor_id::text = vp.id::text
      LEFT JOIN users u ON vp.user_id::text = u.id::text
      ORDER BY 
        CASE WHEN vd.verification_status = 'pending' THEN 1 ELSE 2 END,
        vd.uploaded_at DESC
    `;
    
    console.log(`✅ Query executed successfully. Found ${documents.length} documents`);
    
    documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.business_name || 'Unknown'} - ${doc.document_type} (${doc.verification_status})`);
      console.log(`   vendor_id: ${doc.vendor_id}, file: ${doc.file_name}`);
    });
    
    // Test the response formatting
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      vendorId: doc.vendor_id,
      vendorName: `${doc.first_name || ''} ${doc.last_name || ''}`.trim() || 'Unknown Vendor',
      businessName: doc.business_name || 'Unknown Business',
      documentType: doc.document_type,
      documentUrl: doc.document_url,
      fileName: doc.file_name,
      uploadedAt: doc.uploaded_at,
      verificationStatus: doc.verification_status || 'pending',
      verifiedAt: doc.verified_at,
      rejectionReason: doc.rejection_reason,
      fileSize: 0, // Default since we don't have this field
      mimeType: 'application/pdf' // Default
    }));
    
    console.log('\n📊 Formatted response:');
    console.log(JSON.stringify({
      success: true,
      documents: formattedDocuments,
      stats: {
        total: formattedDocuments.length,
        pending: formattedDocuments.filter(d => d.verificationStatus === 'pending').length,
        approved: formattedDocuments.filter(d => d.verificationStatus === 'approved').length,
        rejected: formattedDocuments.filter(d => d.verificationStatus === 'rejected').length
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

debugAdminDocumentsEndpoint();
