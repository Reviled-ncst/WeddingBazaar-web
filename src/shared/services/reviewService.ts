/**
 * Review Service - Modular API for handling reviews and ratings
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ReviewData {
  bookingId: string;
  vendorId: string;
  rating: number;
  comment: string;
  images?: string[]; // Cloudinary URLs
}

export interface ReviewResponse {
  success: boolean;
  review?: {
    id: string;
    bookingId: string;
    vendorId: string;
    userId: string;
    rating: number;
    comment: string;
    images: string[];
    createdAt: string;
  };
  message?: string;
  error?: string;
}

/**
 * Check if a booking has already been reviewed by the current user
 */
export const hasBookingBeenReviewed = async (bookingId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('jwt_token') ||
                  localStorage.getItem('weddingBazaar_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    
    if (!token) {
      console.error('❌ [ReviewService] No authentication token found');
      return false;
    }

    const response = await fetch(`${API_URL}/api/reviews/booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // If 404, booking hasn't been reviewed yet
      if (response.status === 404) {
        return false;
      }
      throw new Error('Failed to check review status');
    }

    const data = await response.json();
    const hasReview = data.success && data.review;
    return hasReview;

  } catch (error: any) {
    console.error('❌ [ReviewService] Error checking review status:', error);
    return false; // Assume not reviewed if there's an error
  }
};

/**
 * Submit a review for a completed booking
 */
export const submitReview = async (reviewData: ReviewData): Promise<ReviewResponse> => {
  try {
    // Check multiple possible token storage keys
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('jwt_token') ||
                  localStorage.getItem('weddingBazaar_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    
    if (!token) {
      console.error('❌ [ReviewService] No authentication token found');
      console.error('Available localStorage keys:', Object.keys(localStorage));
      throw new Error('Authentication required');
    }
    const response = await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('❌ [ReviewService] Backend error:', {
        status: response.status,
        error: data.error,
        message: data.message,
        fullResponse: data
      });
      throw new Error(data.error || data.message || 'Failed to submit review');
    }
    return data;

  } catch (error: any) {
    console.error('❌ [ReviewService] Error submitting review:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit review'
    };
  }
};

/**
 * Get reviews for a specific vendor
 */
export const getVendorReviews = async (vendorId: string): Promise<ReviewResponse[]> => {
  try {
    const response = await fetch(`${API_URL}/api/reviews/vendor/${vendorId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch reviews');
    }
    return data.reviews || [];

  } catch (error: any) {
    console.error('❌ [ReviewService] Error fetching reviews:', error);
    return [];
  }
};

/**
 * Get reviews for a specific booking
 */
export const getBookingReview = async (bookingId: string): Promise<ReviewResponse | null> => {
  try {
    const token = localStorage.getItem('weddingBazaar_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/api/reviews/booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No review found
      }
      throw new Error(data.error || 'Failed to fetch review');
    }
    return data.review;

  } catch (error: any) {
    console.error('❌ [ReviewService] Error fetching booking review:', error);
    return null;
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (
  reviewId: string,
  updates: Partial<ReviewData>
): Promise<ReviewResponse> => {
  try {
    const token = localStorage.getItem('weddingBazaar_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update review');
    }
    return data;

  } catch (error: any) {
    console.error('❌ [ReviewService] Error updating review:', error);
    return {
      success: false,
      error: error.message || 'Failed to update review'
    };
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('weddingBazaar_token') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete review');
    }
    return true;

  } catch (error: any) {
    console.error('❌ [ReviewService] Error deleting review:', error);
    return false;
  }
};

/**
 * Upload review images to Cloudinary
 */
export const uploadReviewImages = async (images: File[]): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'weddingbazaarus');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dht64xt1g'}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      uploadedUrls.push(data.secure_url);
    }
    return uploadedUrls;

  } catch (error: any) {
    console.error('❌ [ReviewService] Error uploading images:', error);
    throw error;
  }
};

export const reviewService = {
  submitReview,
  getVendorReviews,
  getBookingReview,
  updateReview,
  deleteReview,
  uploadReviewImages,
  hasBookingBeenReviewed
};
