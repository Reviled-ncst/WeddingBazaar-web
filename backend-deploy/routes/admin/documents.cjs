const { sql } = require('../../config/database.cjs');

/**
 * Admin Documents Management API
 * GET /api/admin/documents - List all vendor documents with filtering
 * GET /api/admin/documents/:id - Get specific document details
 * PATCH /api/admin/documents/:id/status - Update document verification status
 */

/**
 * GET /api/admin/documents
 * Fetch all vendor documents with optional status filter
 * NOTE: vendor_documents.vendor_id are UUIDs that don't match vendors.id (string IDs like "VEN-00009")
 */
async function getDocuments(req, res) {
  try {
    const { status } = req.query;
    
    console.log('📄 [Admin/Documents] Fetching documents, status filter:', status);
    
    // FIX: Use SQL tagged template (required for @neondatabase/serverless)
    let result;
    
    if (status && status !== 'all') {
      console.log('📄 [Admin/Documents] Querying with status filter:', status);
      result = await sql`
        SELECT 
          id,
          vendor_id,
          document_type,
          document_url,
          file_name,
          file_size,
          mime_type,
          verification_status,
          verified_at,
          verified_by,
          rejection_reason,
          uploaded_at,
          created_at,
          updated_at
        FROM vendor_documents
        WHERE verification_status = ${status}
        ORDER BY uploaded_at DESC
      `;
    } else {
      console.log('📄 [Admin/Documents] Querying all documents (no filter)');
      result = await sql`
        SELECT 
          id,
          vendor_id,
          document_type,
          document_url,
          file_name,
          file_size,
          mime_type,
          verification_status,
          verified_at,
          verified_by,
          rejection_reason,
          uploaded_at,
          created_at,
          updated_at
        FROM vendor_documents
        ORDER BY uploaded_at DESC
      `;
    }
    
    console.log(`✅ [Admin/Documents] Found ${result.length} documents`);
    
    // Transform to match frontend interface
    const documents = result.map(doc => ({
      id: doc.id,
      vendorId: doc.vendor_id,
      vendorName: `Vendor (${doc.vendor_id.substring(0, 8)}...)`,
      businessName: 'Business (ID mismatch)',
      businessType: 'Unknown',
      documentType: doc.document_type,
      documentUrl: doc.document_url,
      fileName: doc.file_name,
      fileSize: doc.file_size || 0,
      mimeType: doc.mime_type,
      verificationStatus: doc.verification_status,
      verifiedAt: doc.verified_at,
      verifiedBy: doc.verified_by,
      rejectionReason: doc.rejection_reason,
      uploadedAt: doc.uploaded_at
    }));
    
    res.json({
      success: true,
      documents,
      count: documents.length,
      timestamp: new Date().toISOString(),
      note: 'vendor_id references are UUIDs that do not match current vendors table IDs'
    });
    
  } catch (error) {
    console.error('❌ [Admin/Documents] Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * GET /api/admin/documents/:id
 * Get specific document details
 */
async function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    
    console.log('📄 [Admin Documents] Fetching document:', id);
    
    const result = await sql`
      SELECT 
        vd.*,
        vp.business_name,
        u.email as business_email,
        u.phone as business_phone,
        vp.service_area as business_address,
        u.first_name || ' ' || u.last_name as vendor_name,
        u.email as vendor_email
      FROM vendor_documents vd
      LEFT JOIN vendor_profiles vp ON vd.vendor_id = vp.id
      LEFT JOIN users u ON vp.user_id = u.id
      WHERE vd.id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      document: result[0]
    });
    
  } catch (error) {
    console.error('❌ [Admin Documents] Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document',
      details: error.message
    });
  }
}

/**
 * PATCH /api/admin/documents/:id/status
 * Update document verification status
 */
async function updateDocumentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;
    
    console.log('📄 [Admin Documents] Updating document status:', id, status);
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: pending, approved, or rejected'
      });
    }
    
    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    updateFields.push(`verification_status = $${paramIndex++}`);
    values.push(status);
    
    if (status === 'approved' || status === 'rejected') {
      updateFields.push(`verified_at = $${paramIndex++}`);
      values.push(new Date().toISOString());
      
      // TODO: Get admin user from auth token
      updateFields.push(`verified_by = $${paramIndex++}`);
      values.push(req.user?.email || 'admin');
    }
    
    if (status === 'rejected' && rejectionReason) {
      updateFields.push(`rejection_reason = $${paramIndex++}`);
      values.push(rejectionReason);
    }
    
    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    
    values.push(id);
    
    const query = `
      UPDATE vendor_documents
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await sql(query, values);
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    console.log('✅ [Admin Documents] Document status updated successfully');
    
    res.json({
      success: true,
      document: result[0],
      message: `Document ${status} successfully`
    });
    
  } catch (error) {
    console.error('❌ [Admin Documents] Error updating document status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document status',
      details: error.message
    });
  }
}

/**
 * POST /api/admin/documents/:id/approve
 * Convenience endpoint to approve a document
 */
async function approveDocument(req, res) {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    console.log('✅ [Admin Documents] Approving document:', id);
    
    const result = await sql`
      UPDATE vendor_documents
      SET 
        verification_status = 'approved',
        verified_at = ${new Date().toISOString()},
        verified_by = ${req.user?.email || 'admin'},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    const document = result[0];
    console.log('✅ [Admin Documents] Document approved successfully');
    
    // Update vendor profile with comprehensive verification check
    try {
      const vendorId = document.vendor_id;
      console.log('📝 [Admin Documents] Updating vendor verification status for:', vendorId);
      
      // Check if vendor has any approved documents
      const approvedDocsCheck = await sql`
        SELECT COUNT(*) as approved_count
        FROM vendor_documents
        WHERE vendor_id = ${vendorId} AND verification_status = 'approved'
      `;
      
      const hasApprovedDocs = parseInt(approvedDocsCheck[0].approved_count) > 0;
      
      // Get vendor profile to check business info
      const vendorProfile = await sql`
        SELECT business_name, business_type, verification_status
        FROM vendor_profiles
        WHERE id = ${vendorId}
      `;
      
      const hasBusinessInfo = vendorProfile[0]?.business_name && vendorProfile[0]?.business_type;
      
      // Determine overall verification status
      let verificationStatus = 'unverified';
      if (hasApprovedDocs && hasBusinessInfo) {
        verificationStatus = 'verified';
      } else if (hasApprovedDocs || hasBusinessInfo) {
        verificationStatus = 'partially_verified';
      }
      
      await sql`
        UPDATE vendor_profiles
        SET 
          documents_verified = ${hasApprovedDocs},
          business_verified = ${hasBusinessInfo},
          verification_status = ${verificationStatus},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${vendorId}
      `;
      
      console.log('✅ [Admin Documents] Vendor profile updated:', {
        documents_verified: hasApprovedDocs,
        business_verified: hasBusinessInfo,
        verification_status: verificationStatus
      });
    } catch (profileError) {
      console.error('⚠️ [Admin Documents] Error updating vendor profile:', profileError.message);
      // Don't fail the request if profile update fails
    }
    
    res.json({
      success: true,
      document,
      message: 'Document approved successfully'
    });
    
  } catch (error) {
    console.error('❌ [Admin Documents] Error approving document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve document',
      details: error.message
    });
  }
}

/**
 * POST /api/admin/documents/:id/reject
 * Convenience endpoint to reject a document
 */
async function rejectDocument(req, res) {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    
    console.log('❌ [Admin Documents] Rejecting document:', id);
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }
    
    const result = await sql`
      UPDATE vendor_documents
      SET 
        verification_status = 'rejected',
        verified_at = ${new Date().toISOString()},
        verified_by = ${req.user?.email || 'admin'},
        rejection_reason = ${rejectionReason},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    const document = result[0];
    console.log('✅ [Admin Documents] Document rejected successfully');
    
    // Update vendor profile with comprehensive verification check
    try {
      const vendorId = document.vendor_id;
      console.log('📝 [Admin Documents] Recalculating vendor verification status after rejection for:', vendorId);
      
      // Check if vendor still has any approved documents (after this rejection)
      const approvedDocsCheck = await sql`
        SELECT COUNT(*) as approved_count
        FROM vendor_documents
        WHERE vendor_id = ${vendorId} AND verification_status = 'approved'
      `;
      
      const hasApprovedDocs = parseInt(approvedDocsCheck[0].approved_count) > 0;
      
      // Get vendor profile to check business info
      const vendorProfile = await sql`
        SELECT business_name, business_type
        FROM vendor_profiles
        WHERE id = ${vendorId}
      `;
      
      const hasBusinessInfo = vendorProfile[0]?.business_name && vendorProfile[0]?.business_type;
      
      // Determine overall verification status
      let verificationStatus = 'unverified';
      if (hasApprovedDocs && hasBusinessInfo) {
        verificationStatus = 'verified';
      } else if (hasApprovedDocs || hasBusinessInfo) {
        verificationStatus = 'partially_verified';
      }
      
      await sql`
        UPDATE vendor_profiles
        SET 
          documents_verified = ${hasApprovedDocs},
          business_verified = ${hasBusinessInfo},
          verification_status = ${verificationStatus},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${vendorId}
      `;
      
      console.log('✅ [Admin Documents] Vendor profile updated after rejection:', {
        documents_verified: hasApprovedDocs,
        business_verified: hasBusinessInfo,
        verification_status: verificationStatus
      });
    } catch (profileError) {
      console.error('⚠️ [Admin Documents] Error updating vendor profile:', profileError.message);
      // Don't fail the request if profile update fails
    }
    
    res.json({
      success: true,
      document,
      message: 'Document rejected successfully'
    });
    
  } catch (error) {
    console.error('❌ [Admin Documents] Error rejecting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject document',
      details: error.message
    });
  }
}

/**
 * GET /api/admin/documents/stats
 * Get document verification statistics
 */
async function getDocumentStats(req, res) {
  try {
    console.log('📊 [Admin Documents] Fetching statistics');
    
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE verification_status = 'approved') as approved,
        COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected
      FROM vendor_documents
    `;
    
    const stats = {
      total: parseInt(result[0].total) || 0,
      pending: parseInt(result[0].pending) || 0,
      approved: parseInt(result[0].approved) || 0,
      rejected: parseInt(result[0].rejected) || 0,
      avgReviewTime: 2.5 // TODO: Calculate actual average review time
    };
    
    console.log('✅ [Admin Documents] Statistics:', stats);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ [Admin Documents] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
}

module.exports = {
  getDocuments,
  getDocumentById,
  updateDocumentStatus,
  getDocumentStats,
  approveDocument,
  rejectDocument
};
