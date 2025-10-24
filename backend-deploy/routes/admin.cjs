const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

/**
 * Admin endpoint to fix vendor mappings for services
 * Fixes services that have null vendor_id by assigning them to a default vendor
 */
router.post('/fix-vendor-mappings', async (req, res) => {
  console.log('🔧 [Admin] Fix vendor mappings endpoint called');
  
  try {
    // First, check how many services have null vendor_id
    const nullVendorServices = await sql`
      SELECT id, name, category, vendor_id 
      FROM services 
      WHERE vendor_id IS NULL
    `;
    
    console.log(`📊 [Admin] Found ${nullVendorServices.length} services with null vendor_id`);
    
    if (nullVendorServices.length === 0) {
      return res.json({
        success: true,
        message: "All services already have vendor mappings",
        servicesFixed: 0,
        details: []
      });
    }
    
    // Get available vendors to assign services to
    const availableVendors = await sql`
      SELECT id, name, category 
      FROM vendors 
      ORDER BY id::int
    `;
    
    console.log(`👥 [Admin] Available vendors:`, availableVendors.map(v => `${v.id} (${v.name})`));
    
    if (availableVendors.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No vendors available to assign services to"
      });
    }
    
    const fixResults = [];
    
    // Fix each service by assigning it to a vendor based on category matching or default
    for (const service of nullVendorServices) {
      try {
        // Try to find a vendor with matching category
        let assignedVendor = availableVendors.find(vendor => 
          vendor.category && service.category && 
          vendor.category.toLowerCase() === service.category.toLowerCase()
        );
        
        // If no category match, assign to first available vendor
        if (!assignedVendor) {
          assignedVendor = availableVendors[0];
        }
        
        console.log(`🔄 [Admin] Assigning service "${service.name}" (${service.category}) to vendor ${assignedVendor.id} (${assignedVendor.name})`);
        
        // Update the service with the assigned vendor_id
        await sql`
          UPDATE services 
          SET vendor_id = ${assignedVendor.id}, 
              updated_at = NOW()
          WHERE id = ${service.id}
        `;
        
        fixResults.push({
          serviceId: service.id,
          serviceName: service.name,
          serviceCategory: service.category,
          assignedVendorId: assignedVendor.id,
          assignedVendorName: assignedVendor.name,
          matchType: availableVendors.find(v => 
            v.category && service.category && 
            v.category.toLowerCase() === service.category.toLowerCase()
          ) ? 'category_match' : 'default_assignment'
        });
        
      } catch (serviceError) {
        console.error(`❌ [Admin] Error fixing service ${service.id}:`, serviceError);
        fixResults.push({
          serviceId: service.id,
          serviceName: service.name,
          error: serviceError.message
        });
      }
    }
    
    // Verify the fix by checking remaining null vendor services
    const remainingNullServices = await sql`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE vendor_id IS NULL
    `;
    
    console.log(`✅ [Admin] Fix complete. Fixed ${fixResults.length} services. Remaining null services: ${remainingNullServices[0].count}`);
    
    res.json({
      success: true,
      message: `Successfully fixed vendor mappings for ${fixResults.length} services`,
      servicesFixed: fixResults.length,
      remainingNullServices: parseInt(remainingNullServices[0].count),
      details: fixResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Fix vendor mappings error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Admin endpoint to get system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Getting system statistics');
    
    // Get counts for all major entities
    const [
      vendorsCount,
      servicesCount,
      bookingsCount,
      usersCount,
      conversationsCount,
      messagesCount
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM vendors`,
      sql`SELECT COUNT(*) as count FROM services`,
      sql`SELECT COUNT(*) as count FROM bookings`,
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM conversations`,
      sql`SELECT COUNT(*) as count FROM messages`
    ]);
    
    // Get services with null vendor_id
    const nullVendorServices = await sql`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE vendor_id IS NULL
    `;
    
    const stats = {
      vendors: parseInt(vendorsCount[0].count),
      services: parseInt(servicesCount[0].count),
      bookings: parseInt(bookingsCount[0].count),
      users: parseInt(usersCount[0].count),
      conversations: parseInt(conversationsCount[0].count),
      messages: parseInt(messagesCount[0].count),
      servicesWithoutVendor: parseInt(nullVendorServices[0].count),
      timestamp: new Date().toISOString()
    };
    
    console.log('📈 [Admin] System stats:', stats);
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ [Admin] Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Admin endpoint to get detailed service-vendor mapping status
 */
router.get('/service-vendor-mapping', async (req, res) => {
  try {
    console.log('🔍 [Admin] Getting service-vendor mapping details');
    
    // Get all services with their vendor info
    const servicesWithVendors = await sql`
      SELECT 
        s.id, 
        s.name as service_name, 
        s.category as service_category,
        s.vendor_id,
        v.name as vendor_name,
        v.category as vendor_category
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id::text
      ORDER BY s.vendor_id NULLS LAST, s.id
    `;
    
    // Separate mapped and unmapped services
    const mappedServices = servicesWithVendors.filter(s => s.vendor_id);
    const unmappedServices = servicesWithVendors.filter(s => !s.vendor_id);
    
    console.log(`📊 [Admin] Mapped: ${mappedServices.length}, Unmapped: ${unmappedServices.length}`);
    
    res.json({
      success: true,
      summary: {
        totalServices: servicesWithVendors.length,
        mappedServices: mappedServices.length,
        unmappedServices: unmappedServices.length,
        mappingComplete: unmappedServices.length === 0
      },
      mappedServices: mappedServices,
      unmappedServices: unmappedServices,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Service-vendor mapping error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
      LEFT JOIN vendor_profiles vp ON vd.vendor_id::text = vp.user_id::text
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
 * Approve a vendor document
 */
router.post('/documents/:documentId/approve', async (req, res) => {
  const { documentId } = req.params;
  
  try {
    console.log(`✅ [Admin] Approving document: ${documentId}`);
    
    // Update the document status to approved
    const result = await sql`
      UPDATE vendor_documents
      SET 
        verification_status = 'approved',
        verified_at = NOW(),
        rejection_reason = NULL
      WHERE id = ${documentId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    console.log(`✅ [Admin] Document ${documentId} approved successfully`);
    
    res.json({
      success: true,
      message: 'Document approved successfully',
      document: result[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ [Admin] Error approving document ${documentId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Reject a vendor document
 */
router.post('/documents/:documentId/reject', async (req, res) => {
  const { documentId } = req.params;
  const { reason } = req.body;
  
  try {
    console.log(`❌ [Admin] Rejecting document: ${documentId}, Reason: ${reason}`);
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }
    
    // Update the document status to rejected
    const result = await sql`
      UPDATE vendor_documents
      SET 
        verification_status = 'rejected',
        verified_at = NOW(),
        rejection_reason = ${reason}
      WHERE id = ${documentId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    console.log(`❌ [Admin] Document ${documentId} rejected successfully`);
    
    res.json({
      success: true,
      message: 'Document rejected successfully',
      document: result[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ [Admin] Error rejecting document ${documentId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
