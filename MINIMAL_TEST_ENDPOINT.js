// Minimal vendor details endpoint for testing
// Add this temporarily to vendors.cjs to test

router.get('/:vendorId/details-test', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`🧪 [TEST] GET /api/vendors/${vendorId}/details-test called`);
    
    // Step 1: Get vendor with user
    const vendors = await sql`
      SELECT 
        v.*,
        u.email as user_email,
        u.phone as user_phone
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.id = ${vendorId}
    `;
    
    if (vendors.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    const vendor = vendors[0];
    console.log(`✅ [TEST] Found vendor: ${vendor.business_name}`);
    
    // Step 2: Get services (simple query)
    const services = await sql`
      SELECT id, title, price
      FROM services 
      WHERE vendor_id = ${vendorId}
      LIMIT 5
    `;
    
    console.log(`✅ [TEST] Found ${services.length} services`);
    
    // Step 3: Return minimal response
    res.json({
      success: true,
      vendor: {
        id: vendor.id,
        name: vendor.business_name,
        category: vendor.business_type,
        email: vendor.user_email || 'N/A',
        phone: vendor.user_phone || 'N/A',
        services_count: services.length
      },
      services: services.map(s => ({
        id: s.id,
        title: s.title,
        price: s.price
      }))
    });
    
  } catch (error) {
    console.error('❌ [TEST] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
