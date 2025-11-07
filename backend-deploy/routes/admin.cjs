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

/**
 * Admin endpoint to get comprehensive dashboard statistics
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Getting comprehensive dashboard statistics');
    
    // Get all counts and statistics in parallel
    const [
      usersCount,
      vendorsCount,
      bookingsCount,
      completedBookingsRevenue,
      activeUsersCount,
      pendingVerifications,
      recentBookings,
      bookingsByStatus
    ] = await Promise.all([
      // Total users (all users in system)
      sql`SELECT COUNT(*) as count FROM users`,
      
      // Total vendors (count of vendor profiles)
      sql`SELECT COUNT(*) as count FROM vendor_profiles WHERE user_id IS NOT NULL`,
      
      // Total bookings
      sql`SELECT COUNT(*) as count FROM bookings`,
      
      // Total revenue from completed bookings
      sql`
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) as completed_count
        FROM bookings 
        WHERE status IN ('completed', 'fully_paid', 'paid_in_full')
      `,
      
      // Active users (logged in within last 24 hours)
      sql`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE last_login >= NOW() - INTERVAL '24 hours'
      `,
      
      // Pending vendor verifications
      sql`
        SELECT COUNT(*) as count 
        FROM vendor_profiles 
        WHERE verification_status = 'pending'
      `,
      
      // Recent bookings (last 5)
      sql`
        SELECT 
          b.id,
          b.status,
          b.amount,
          b.created_at,
          u.first_name || ' ' || u.last_name as customer_name,
          u.email as customer_email,
          vp.business_name as vendor_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN vendor_profiles vp ON b.vendor_id::text = vp.user_id::text
        ORDER BY b.created_at DESC
        LIMIT 5
      `,
      
      // Bookings by status
      sql`
        SELECT 
          status,
          COUNT(*) as count
        FROM bookings
        GROUP BY status
      `
    ]);
    
    // Debug logging
    console.log('🔍 [Admin] Raw query results:');
    console.log('  Users count result:', usersCount);
    console.log('  Vendors count result:', vendorsCount);
    console.log('  Bookings count result:', bookingsCount);
    console.log('  Active users result:', activeUsersCount);
    
    const stats = {
      totalUsers: parseInt(usersCount[0]?.count || 0),
      totalVendors: parseInt(vendorsCount[0]?.count || 0),
      totalBookings: parseInt(bookingsCount[0]?.count || 0),
      totalRevenue: parseFloat(completedBookingsRevenue[0]?.total_revenue || 0),
      completedBookings: parseInt(completedBookingsRevenue[0]?.completed_count || 0),
      activeUsers: parseInt(activeUsersCount[0]?.count || 0),
      pendingVerifications: parseInt(pendingVerifications[0]?.count || 0),
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        status: booking.status,
        amount: parseFloat(booking.amount || 0),
        createdAt: booking.created_at,
        customerName: booking.customer_name || 'Unknown',
        customerEmail: booking.customer_email || 'Unknown',
        vendorName: booking.vendor_name || 'Unknown'
      })),
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    };
    
    console.log('📈 [Admin] Dashboard stats:', stats);
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('❌ [Admin] Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Admin endpoint to get recent activities
 */
router.get('/dashboard/activities', async (req, res) => {
  try {
    console.log('📊 [Admin] Getting recent activities');
    
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent user registrations
    const recentUsers = await sql`
      SELECT 
        id,
        email,
        role,
        created_at,
        'user_signup' as activity_type
      FROM users
      ORDER BY created_at DESC
      LIMIT ${Math.floor(limit / 2)}
    `;
    
    // Get recent bookings
    const recentBookings = await sql`
      SELECT 
        b.id,
        b.booking_reference,
        b.status,
        b.amount,
        b.created_at,
        'booking_created' as activity_type,
        u.email as user_email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT ${Math.floor(limit / 2)}
    `;
    
    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        id: user.id,
        type: 'user_signup',
        description: `New user registration: ${user.email}`,
        timestamp: user.created_at,
        status: 'success'
      })),
      ...recentBookings.map(booking => ({
        id: booking.id,
        type: 'booking_created',
        description: `New booking: ${booking.booking_reference || booking.id}`,
        timestamp: booking.created_at,
        status: 'success',
        metadata: {
          amount: booking.amount,
          status: booking.status,
          userEmail: booking.user_email
        }
      }))
    ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit)
    .map(activity => ({
      ...activity,
      timestamp: formatTimestamp(activity.timestamp)
    }));
    
    console.log(`📈 [Admin] Retrieved ${activities.length} recent activities`);
    
    res.json({
      success: true,
      activities: activities,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Activities error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Admin endpoint to get all bookings
 * GET /api/admin/bookings
 */
router.get('/bookings', async (req, res) => {
  try {
    console.log('📋 [Admin] Getting all bookings');
    
    const { status, limit, offset } = req.query;
    
    // Build query with optional filters
    let query = sql`
      SELECT 
        b.id,
        b.booking_reference,
        b.couple_id,
        b.vendor_id,
        b.service_id,
        b.status,
        b.total_amount,
        b.deposit_amount,
        b.remaining_balance,
        b.event_date,
        b.event_time,
        b.event_location,
        b.guest_count,
        b.budget_range,
        b.process_stage,
        b.progress_percentage,
        b.next_action,
        b.next_action_by,
        b.special_requests,
        b.notes,
        b.preferred_contact_method,
        b.created_at,
        b.updated_at,
        u.full_name as couple_name,
        u.email as couple_email,
        u.phone as couple_phone,
        v.business_name as vendor_name,
        v.email as vendor_email,
        v.phone as vendor_phone,
        s.name as service_name,
        s.category as service_type
      FROM bookings b
      LEFT JOIN users u ON b.couple_id = u.id
      LEFT JOIN vendors v ON b.vendor_id = v.id::text
      LEFT JOIN services s ON b.service_id = s.id::text
      ORDER BY b.created_at DESC
    `;
    
    // Apply filters if provided
    if (status) {
      query = sql`
        SELECT 
          b.id,
          b.booking_reference,
          b.couple_id,
          b.vendor_id,
          b.service_id,
          b.status,
          b.total_amount,
          b.deposit_amount,
          b.remaining_balance,
          b.event_date,
          b.event_time,
          b.event_location,
          b.guest_count,
          b.budget_range,
          b.process_stage,
          b.progress_percentage,
          b.next_action,
          b.next_action_by,
          b.special_requests,
          b.notes,
          b.preferred_contact_method,
          b.created_at,
          b.updated_at,
          u.full_name as couple_name,
          u.email as couple_email,
          u.phone as couple_phone,
          v.business_name as vendor_name,
          v.email as vendor_email,
          v.phone as vendor_phone,
          s.name as service_name,
          s.category as service_type
        FROM bookings b
        LEFT JOIN users u ON b.couple_id = u.id
        LEFT JOIN vendors v ON b.vendor_id = v.id::text
        LEFT JOIN services s ON b.service_id = s.id::text
        WHERE b.status = ${status}
        ORDER BY b.created_at DESC
      `;
    }
    
    // Apply limit and offset if provided
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset || 0);
      query = sql`${query} LIMIT ${limitNum} OFFSET ${offsetNum}`;
    }
    
    const bookings = await query;
    
    console.log(`✅ [Admin] Retrieved ${bookings.length} bookings`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Bookings retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Admin endpoint to get all vendor documents
 * GET /api/admin/documents
 */
router.get('/documents', async (req, res) => {
  try {
    console.log('📄 [Admin] Getting vendor documents');
    
    const { status } = req.query;
    
    // NOTE: vendor_documents.vendor_id are UUIDs that don't match vendors.id (which are strings like "VEN-00009")
    // So we'll query documents only and show placeholder vendor names until the vendor_id references are fixed
    let query;
    if (status && status !== 'all') {
      query = sql`
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
      query = sql`
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
    
    const documents = await query;
    
    console.log(`✅ [Admin] Retrieved ${documents.length} documents`);
    console.log('⚠️ [Admin] Note: vendor_id references are invalid UUIDs, not matching vendors.id');
    
    // Return documents with placeholder vendor names (vendor_id mismatch issue)
    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        vendorId: doc.vendor_id,
        vendorName: `Vendor (${doc.vendor_id.substring(0, 8)}...)`,
        businessName: 'Business (ID mismatch)',
        businessType: 'Unknown',
        documentType: doc.document_type,
        documentUrl: doc.document_url,
        fileName: doc.file_name,
        fileSize: parseInt(doc.file_size) || 0,
        mimeType: doc.mime_type,
        verificationStatus: doc.verification_status,
        verifiedAt: doc.verified_at,
        verifiedBy: doc.verified_by,
        rejectionReason: doc.rejection_reason,
        uploadedAt: doc.uploaded_at
      })),
      count: documents.length,
      timestamp: new Date().toISOString(),
      note: 'vendor_id references are UUIDs that do not match current vendors table IDs'
    });
    
  } catch (error) {
    console.error('❌ [Admin] Documents retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Admin endpoint to get document statistics
 * GET /api/admin/documents/stats
 */
router.get('/documents/stats', async (req, res) => {
  try {
    console.log('📊 [Admin] Getting document statistics');
    
    const [
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM vendor_documents`,
      sql`SELECT COUNT(*) as count FROM vendor_documents WHERE verification_status = 'pending'`,
      sql`SELECT COUNT(*) as count FROM vendor_documents WHERE verification_status = 'approved'`,
      sql`SELECT COUNT(*) as count FROM vendor_documents WHERE verification_status = 'rejected'`
    ]);
    
    const stats = {
      total: parseInt(totalCount[0]?.count || 0),
      pending: parseInt(pendingCount[0]?.count || 0),
      approved: parseInt(approvedCount[0]?.count || 0),
      rejected: parseInt(rejectedCount[0]?.count || 0),
      avgReviewTime: 0 // TODO: Calculate from actual data
    };
    
    console.log('📈 [Admin] Document stats:', stats);
    
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [Admin] Document stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to format timestamps
function formatTimestamp(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
}

module.exports = router;
