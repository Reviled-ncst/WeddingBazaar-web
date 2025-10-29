/**
 * useReview Hook - Modular hook for managing reviews
 */

import { useState, useCallback } from 'react';
import { reviewService } from '../../../../../shared/services/reviewService';
import type { ReviewData } from '../../../../../shared/services/reviewService';

export const useReview = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit a review with images
   */
  const submitReview = useCallback(async (
    bookingId: string,
    vendorId: string,
    rating: number,
    comment: string,
    images: File[]
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await reviewService.uploadReviewImages(images);
      }

      // Submit review with image URLs
      const reviewData: ReviewData = {
        bookingId,
        vendorId,
        rating,
        comment,
        images: imageUrls
      };

      const result = await reviewService.submitReview(reviewData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review');
      }
      return result;

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit review';
      setError(errorMessage);
      console.error('❌ [useReview] Error:', errorMessage);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, []);

  /**
   * Check if a booking has been reviewed
   */
  const checkIfReviewed = useCallback(async (bookingId: string) => {
    try {
      const review = await reviewService.getBookingReview(bookingId);
      return !!review;
    } catch (error) {
      console.error('❌ [useReview] Error checking review:', error);
      return false;
    }
  }, []);

  return {
    submitReview,
    checkIfReviewed,
    submitting,
    error
  };
};
