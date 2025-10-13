// Backend endpoint to fix vendor mappings
// This will be added to the existing backend to execute the database fixes

const express = require('express');
const { Pool } = require('pg');

// Database connection (same as existing backend)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Admin endpoint to fix vendor mappings
async function fixVendorMappingsEndpoint(req, res) {
  console.log('🔧 [ADMIN] Vendor mapping fix requested');
  
  const client = await pool.connect();
  
  try {
    // Check current state
    const nullVendorQuery = 'SELECT id, name, category, vendor_id FROM services WHERE vendor_id IS NULL';
    const nullVendorResult = await client.query(nullVendorQuery);
    
    console.log(`Found ${nullVendorResult.rows.length} services with null vendor_id`);
    
    if (nullVendorResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'All services already have vendor mappings',
        servicesFixed: 0,
        alreadyFixed: true
      });
    }

    // Execute the fixes
    const fixes = [
      {
        serviceId: 'SRV-70524',
        vendorId: '2-2025-004', // Perfect Weddings Co.
        description: 'Security & Guest Management → Perfect Weddings Co.'
      },
      {
        serviceId: 'SRV-39368', 
        vendorId: '2-2025-003', // Beltran Sound Systems
        description: 'Photography Service → Beltran Sound Systems'
      },
      {
        serviceId: 'SRV-71896',
        vendorId: '2-2025-003', // Beltran Sound Systems
        description: 'Photography Service → Beltran Sound Systems'
      },
      {
        serviceId: 'SRV-70580',
        vendorId: '2-2025-003', // Beltran Sound Systems
        description: 'Photography Service → Beltran Sound Systems'
      }
    ];

    // Begin transaction
    await client.query('BEGIN');
    
    let successCount = 0;
    const results = [];
    
    for (const fix of fixes) {
      try {
        const updateQuery = 'UPDATE services SET vendor_id = $1 WHERE id = $2';
        const result = await client.query(updateQuery, [fix.vendorId, fix.serviceId]);
        
        if (result.rowCount > 0) {
          console.log(`✅ Fixed: ${fix.description}`);
          results.push({
            serviceId: fix.serviceId,
            vendorId: fix.vendorId,
            description: fix.description,
            success: true
          });
          successCount++;
        } else {
          console.log(`⚠️ No rows updated for ${fix.serviceId}`);
          results.push({
            serviceId: fix.serviceId,
            vendorId: fix.vendorId,
            description: fix.description,
            success: false,
            error: 'Service not found'
          });
        }
      } catch (error) {
        console.error(`❌ Failed to update ${fix.serviceId}:`, error.message);
        results.push({
          serviceId: fix.serviceId,
          vendorId: fix.vendorId,
          description: fix.description,
          success: false,
          error: error.message
        });
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`Transaction committed - ${successCount}/${fixes.length} updates successful`);

    // Verify the fixes
    const verifyResult = await client.query(nullVendorQuery);
    
    res.json({
      success: true,
      message: `Successfully fixed ${successCount} service vendor mappings`,
      servicesFixed: successCount,
      totalServices: fixes.length,
      remainingNullVendors: verifyResult.rows.length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Rollback on error
    try {
      await client.query('ROLLBACK');
      console.log('Transaction rolled back due to error');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError.message);
    }
    
    console.error('Database fix failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database fix failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    client.release();
  }
}

module.exports = { fixVendorMappingsEndpoint };

// If running this file directly, export the route definition
if (require.main === module) {
  console.log('Backend endpoint code for vendor mapping fix:');
  console.log('Add this route to your backend:');
  console.log('app.post("/api/admin/fix-vendor-mappings", fixVendorMappingsEndpoint);');
}
