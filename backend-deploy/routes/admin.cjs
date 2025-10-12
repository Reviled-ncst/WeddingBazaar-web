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

module.exports = router;
