import fetch from 'node-fetch';

async function createSampleReviewData() {
  try {
    console.log('🔍 Creating sample review data for more realistic ratings...');
    
    // Check if reviews API exists
    try {
      const reviewsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/reviews');
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        console.log('✅ Reviews API exists, found:', reviewsData.reviews?.length || 0, 'reviews');
        return;
      }
    } catch (error) {
      console.log('❌ Reviews API not available, creating mock review data for UI testing');
    }
    
    // Create sample reviews data for testing
    const sampleReviews = [
      {
        id: 'REV-001',
        service_id: 'SRV-0002',
        user_id: '1-2025-001',
        rating: 5,
        title: 'Amazing cake service!',
        comment: 'Test Wedding Services provided an absolutely stunning wedding cake. The design was exactly what we wanted and it tasted incredible. Highly recommend!',
        helpful: 3,
        verified: true,
        created_at: '2024-09-15T10:00:00Z'
      },
      {
        id: 'REV-002',
        service_id: 'SRV-0002',
        user_id: '1-2025-002',
        rating: 4,
        title: 'Great quality',
        comment: 'Beautiful cake design and good taste. Professional service from Test Wedding Services team.',
        helpful: 2,
        verified: true,
        created_at: '2024-08-20T14:30:00Z'
      },
      {
        id: 'REV-003',
        service_id: 'SRV-0001',
        user_id: '1-2025-003',
        rating: 5,
        title: 'Perfect photography!',
        comment: 'Test Wedding Services captured our special day beautifully. Professional photographers with great attention to detail.',
        helpful: 5,
        verified: true,
        created_at: '2024-07-10T16:45:00Z'
      },
      {
        id: 'REV-004',
        service_id: 'SRV-0001',
        user_id: '1-2025-004',
        rating: 4,
        title: 'Professional service',
        comment: 'Good photography service from Test Wedding Services. They were punctual and captured all the important moments.',
        helpful: 1,
        verified: true,
        created_at: '2024-06-25T11:20:00Z'
      }
    ];
    
    console.log('📊 Sample Review Data Created:');
    sampleReviews.forEach((review, index) => {
      console.log(`   Review ${index + 1}:`);
      console.log(`      Service: ${review.service_id}`);
      console.log(`      Rating: ${review.rating} stars`);
      console.log(`      Title: ${review.title}`);
      console.log(`      Verified: ${review.verified}`);
    });
    
    // Calculate averages
    const srv002Reviews = sampleReviews.filter(r => r.service_id === 'SRV-0002');
    const srv001Reviews = sampleReviews.filter(r => r.service_id === 'SRV-0001');
    
    const srv002Avg = srv002Reviews.reduce((sum, r) => sum + r.rating, 0) / srv002Reviews.length;
    const srv001Avg = srv001Reviews.reduce((sum, r) => sum + r.rating, 0) / srv001Reviews.length;
    
    console.log('📈 Calculated Averages:');
    console.log(`   SRV-0002 (Cake): ${srv002Avg} stars (${srv002Reviews.length} reviews)`);
    console.log(`   SRV-0001 (Photography): ${srv001Avg} stars (${srv001Reviews.length} reviews)`);
    
    console.log('💡 Note: These reviews would make the ratings more specific per service');
    console.log('💡 Currently using vendor-level ratings (4.5 stars, 12 reviews) which is also accurate');
    
    // Save to a JSON file for potential future use
    const reviewsData = {
      reviews: sampleReviews,
      summary: {
        total_reviews: sampleReviews.length,
        average_rating: sampleReviews.reduce((sum, r) => sum + r.rating, 0) / sampleReviews.length,
        by_service: {
          'SRV-0002': {
            count: srv002Reviews.length,
            average: srv002Avg,
            service_name: 'Cake Service'
          },
          'SRV-0001': {
            count: srv001Reviews.length,
            average: srv001Avg,
            service_name: 'Photography Service'
          }
        }
      }
    };
    
    console.log('✅ Sample review data structure created');
    console.log('🎯 This demonstrates how real review data could enhance the system further');
    
  } catch (error) {
    console.error('❌ Error creating sample reviews:', error.message);
  }
}

createSampleReviewData();
