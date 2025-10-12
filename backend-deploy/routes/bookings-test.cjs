const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Simple test endpoint to get booking with vendor name
router.get('/test-simple/:coupleId', async (req, res) => {
  console.log('🧪 Testing simple booking query for:', req.params.coupleId);
  
  try {
    const { coupleId } = req.params;
    
    // Simple query to get bookings with vendor names
    const bookings = await sql`
      SELECT 
        b.id,
        b.service_name,
        b.vendor_id,
        b.status,
        v.business_name as vendor_name
      FROM bookings b
      LEFT JOIN vendors v ON b.vendor_id = v.id
      WHERE b.couple_id = ${coupleId}
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    
    console.log(`✅ Found ${bookings.length} bookings with vendor names`);
    
    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Simple booking test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
