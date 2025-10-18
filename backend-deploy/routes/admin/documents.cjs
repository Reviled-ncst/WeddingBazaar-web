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
 */
async function getDocuments(req, res) {
  try {
    const { status } = req.query;
    
    console.log('📄 [Admin Documents] Fetching documents, status filter:', status);
    
    let query = `
      SELECT 
        vd.id,
        vd.vendor_id,
        vd.document_type,
        vd.document_url,
        vd.file_name,
        vd.verification_status,
        vd.uploaded_at,
        vd.verified_at,
        vd.verified_by,
        vd.rejection_reason,
        vd.file_size,
        vd.mime_type,
        vd.created_at,
        vd.updated_at,
        vp.business_name,
        u.email,
        u.phone,
        vp.service_area as location,
        u.first_name || ' ' || u.last_name as vendor_name
      FROM vendor_documents vd
      LEFT JOIN vendor_profiles vp ON vd.vendor_id = vp.id
      LEFT JOIN users u ON vp.user_id = u.id
    `;
    
    const params = [];
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query += ` WHERE vd.verification_status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY vd.uploaded_at DESC`;
    
    const result = params.length > 0 
      ? await sql(query, params)
      : await sql(query);
    
    console.log(`✅ [Admin Documents] Found ${result.length} documents`);
    
    // Transform to match frontend interface
    const documents = result.map(doc => ({
      id: doc.id,
      vendorId: doc.vendor_id,
      vendorName: doc.vendor_name || 'Unknown Vendor',
      businessName: doc.business_name || 'Unknown Business',
      documentType: doc.document_type,
      documentUrl: doc.document_url,
      fileName: doc.file_name,
      uploadedAt: doc.uploaded_at,
      verificationStatus: doc.verification_status,
      verifiedAt: doc.verified_at,
      verifiedBy: doc.verified_by,
      rejectionReason: doc.rejection_reason,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      email: doc.email,
      phone: doc.phone,
      location: doc.location
    }));
    
    res.json({
      success: true,
      documents,
      count: documents.length
    });
    
  } catch (error) {
    console.error('❌ [Admin Documents] Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      details: error.message
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
  getDocumentStats
};
