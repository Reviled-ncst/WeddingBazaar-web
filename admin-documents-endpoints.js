// Add this to backend-deploy/routes/admin.cjs

/**
 * Get all vendor documents pending approval
 */
router.get('/documents/pending', async (req, res) => {
  try {
    console.log('📄 [Admin] Getting pending documents');
    
    // Get all documents with vendor information
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
        vd.file_size,
        vd.mime_type,
        -- Get vendor info
        vp.business_name,
        u.first_name,
        u.last_name,
        u.email
      FROM vendor_documents vd
      LEFT JOIN vendor_profiles vp ON vd.vendor_id = vp.user_id
      LEFT JOIN users u ON vp.user_id = u.id
      ORDER BY 
        CASE WHEN vd.verification_status = 'pending' THEN 1 ELSE 2 END,
        vd.uploaded_at DESC
    `;
    
    // Format the response
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
      fileSize: doc.file_size || 0,
      mimeType: doc.mime_type || 'application/pdf'
    }));
    
    console.log(`📊 [Admin] Found ${formattedDocuments.length} documents`);
    console.log(`⏳ Pending: ${formattedDocuments.filter(d => d.verificationStatus === 'pending').length}`);
    console.log(`✅ Approved: ${formattedDocuments.filter(d => d.verificationStatus === 'approved').length}`);
    console.log(`❌ Rejected: ${formattedDocuments.filter(d => d.verificationStatus === 'rejected').length}`);
    
    res.json({
      success: true,
      documents: formattedDocuments,
      stats: {
        total: formattedDocuments.length,
        pending: formattedDocuments.filter(d => d.verificationStatus === 'pending').length,
        approved: formattedDocuments.filter(d => d.verificationStatus === 'approved').length,
        rejected: formattedDocuments.filter(d => d.verificationStatus === 'rejected').length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get document statistics for dashboard
 */
router.get('/documents/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Getting document statistics');
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_documents,
        COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_documents,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_documents
      FROM vendor_documents
    `;
    
    res.json({
      success: true,
      stats: {
        total: parseInt(stats[0].total_documents),
        pending: parseInt(stats[0].pending_documents),
        approved: parseInt(stats[0].approved_documents),
        rejected: parseInt(stats[0].rejected_documents)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Error fetching document stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
