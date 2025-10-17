const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get reviews for a specific service
router.get('/service/:serviceId', async (req, res) => {
  console.log('📝 [REVIEWS] GET /api/reviews/service/:serviceId called');
  
  try {
    const { serviceId } = req.params;
    
    console.log('🔍 [REVIEWS] Looking for reviews for service:', serviceId);
    
    // Check if reviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('⚠️ [REVIEWS] Reviews table does not exist, returning empty array');
      return res.json([]);
    }
    
    // Get reviews for the service
    const reviews = await sql`
      SELECT 
        id,
        service_id,
        user_id,
        rating,
        comment,
        created_at,
        updated_at
      FROM reviews 
      WHERE service_id = ${serviceId}
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ [REVIEWS] Found ${reviews.length} reviews for service ${serviceId}`);
    
    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      userName: 'Anonymous User', // We don't have user data joined
      verified: true,
      helpful: Math.floor(Math.random() * 10) // Placeholder
    }));
    
    res.json(formattedReviews);
    
  } catch (error) {
    console.error('❌ [REVIEWS] Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get reviews for a specific vendor
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('📝 [REVIEWS] GET /api/reviews/vendor/:vendorId called');
  
  try {
    const { vendorId } = req.params;
    
    console.log('🔍 [REVIEWS] Looking for reviews for vendor:', vendorId);
    
    // Check if reviews table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('⚠️ [REVIEWS] Reviews table does not exist, returning empty array');
      return res.json([]);
    }
    
    // Get reviews for all services of this vendor
    const reviews = await sql`
      SELECT 
        r.id,
        r.service_id,
        r.user_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        s.title as service_title
      FROM reviews r
      JOIN services s ON r.service_id = s.id
      WHERE s.vendor_id = ${vendorId}
      ORDER BY r.created_at DESC
    `;
    
    console.log(`✅ [REVIEWS] Found ${reviews.length} reviews for vendor ${vendorId}`);
    
    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      serviceTitle: review.service_title,
      userName: 'Anonymous User',
      verified: true,
      helpful: Math.floor(Math.random() * 10)
    }));
    
    res.json(formattedReviews);
    
  } catch (error) {
    console.error('❌ [REVIEWS] Error fetching vendor reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
