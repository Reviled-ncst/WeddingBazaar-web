const express = require('express');
const { sql } = require('../config/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// POST - Create a new review (protected route)
router.post('/', authenticateToken, async (req, res) => {
  console.log('📝 [REVIEWS] POST /api/reviews called');
  console.log('📦 [REVIEWS] Request body:', req.body);
  console.log('👤 [REVIEWS] Authenticated user:', req.user);
  console.log('🔑 [REVIEWS] User ID fields:', { 
    'req.userId': req.userId, 
    'req.user?.id': req.user?.id,
    'req.user': req.user ? Object.keys(req.user) : 'undefined'
  });
  
  try {
    const { bookingId, vendorId, rating, comment, images = [] } = req.body;
    // Use req.userId (set by auth middleware) instead of req.user.id
    const userId = req.userId || req.user?.id;
    
    // Validate required fields
    if (!bookingId || !vendorId || !rating) {
      console.error('❌ [REVIEWS] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: bookingId, vendorId, and rating are required'
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      console.error('❌ [REVIEWS] Invalid rating:', rating);
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    console.log('🔍 [REVIEWS] Creating review for booking:', bookingId);
    
    // Check if booking exists and belongs to user
    const booking = await sql`
      SELECT id, couple_id, vendor_id, status 
      FROM bookings 
      WHERE id = ${bookingId}
    `;
    
    if (booking.length === 0) {
      console.error('❌ [REVIEWS] Booking not found:', bookingId);
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    if (booking[0].couple_id !== userId) {
      console.error('❌ [REVIEWS] User does not own this booking');
      return res.status(403).json({
        success: false,
        error: 'You can only review your own bookings'
      });
    }
    
    if (booking[0].status !== 'completed') {
      console.error('❌ [REVIEWS] Booking is not completed:', booking[0].status);
      return res.status(400).json({
        success: false,
        error: 'You can only review completed bookings'
      });
    }
    
    // Check if user already reviewed this booking
    const existingReview = await sql`
      SELECT id FROM reviews 
      WHERE booking_id = ${bookingId} AND user_id = ${userId}
    `;
    
    if (existingReview.length > 0) {
      console.error('❌ [REVIEWS] User already reviewed this booking');
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this booking'
      });
    }
    
    // Create the review
    // Generate review ID (REV-{timestamp}-{random})
    const reviewId = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert images array to PostgreSQL array format
    const imagesArray = images && images.length > 0 
      ? `{${images.map(img => `"${img.replace(/"/g, '\\"')}"`).join(',')}}` 
      : '{}';
    
    const newReview = await sql`
      INSERT INTO reviews (
        id,
        booking_id,
        vendor_id,
        user_id,
        rating,
        comment,
        images,
        verified,
        created_at,
        updated_at
      ) VALUES (
        ${reviewId},
        ${bookingId},
        ${vendorId},
        ${userId},
        ${rating},
        ${comment || ''},
        ${imagesArray}::text[],
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ [REVIEWS] Review created successfully:', newReview[0].id);
    
    // Update vendor's average rating and review count
    const vendorReviews = await sql`
      SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*) as review_count
      FROM reviews
      WHERE vendor_id = ${vendorId}
    `;
    
    await sql`
      UPDATE vendors
      SET 
        rating = ${vendorReviews[0].avg_rating},
        review_count = ${vendorReviews[0].review_count},
        updated_at = NOW()
      WHERE id = ${vendorId}
    `;
    
    console.log('✅ [REVIEWS] Vendor rating updated:', {
      avgRating: vendorReviews[0].avg_rating,
      reviewCount: vendorReviews[0].review_count
    });
    
    res.json({
      success: true,
      review: {
        id: newReview[0].id,
        bookingId: newReview[0].booking_id,
        vendorId: newReview[0].vendor_id,
        userId: newReview[0].user_id,
        rating: newReview[0].rating,
        comment: newReview[0].comment,
        images: newReview[0].images,
        createdAt: newReview[0].created_at
      },
      message: 'Review submitted successfully'
    });
    
  } catch (error) {
    console.error('❌ [REVIEWS] Error creating review:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create review'
    });
  }
});

// GET - Check if booking has been reviewed by user (protected route)
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  console.log('🔍 [REVIEWS] GET /api/reviews/booking/:bookingId called');
  
  try {
    const { bookingId } = req.params;
    // Use req.userId (set by auth middleware) instead of req.user.id
    const userId = req.userId || req.user?.id;
    
    console.log('🔍 [REVIEWS] Checking review for booking:', bookingId, 'user:', userId);
    
    const review = await sql`
      SELECT 
        id,
        booking_id,
        vendor_id,
        user_id,
        rating,
        comment,
        images,
        created_at
      FROM reviews 
      WHERE booking_id = ${bookingId} AND user_id = ${userId}
      LIMIT 1
    `;
    
    if (review.length === 0) {
      console.log('❌ [REVIEWS] No review found for this booking');
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    console.log('✅ [REVIEWS] Review found:', review[0].id);
    
    res.json({
      success: true,
      review: {
        id: review[0].id,
        bookingId: review[0].booking_id,
        vendorId: review[0].vendor_id,
        userId: review[0].user_id,
        rating: review[0].rating,
        comment: review[0].comment,
        images: review[0].images,
        createdAt: review[0].created_at
      }
    });
    
  } catch (error) {
    console.error('❌ [REVIEWS] Error checking booking review:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check review status'
    });
  }
});

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
