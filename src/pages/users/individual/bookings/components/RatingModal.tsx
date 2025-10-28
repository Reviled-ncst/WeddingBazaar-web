import React, { useState } from 'react';
import { X, Star, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    vendorName?: string;
    vendorBusinessName?: string;
    serviceType: string;
    eventDate: string;
  } | null;
  onSubmitReview: (reviewData: {
    bookingId: string;
    rating: number;
    comment: string;
    images?: string[];
  }) => Promise<void>;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitReview
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  const vendorName = booking.vendorName || booking.vendorBusinessName || 'the vendor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitReview({
        bookingId: booking.id,
        rating,
        comment: comment.trim()
      });
      
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    const labels = [
      '',
      'Poor - Not satisfied',
      'Fair - Below expectations',
      'Good - Met expectations',
      'Very Good - Exceeded expectations',
      'Excellent - Outstanding service!'
    ];
    return labels[stars] || '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Rate & Review</h2>
                  <p className="text-pink-100 text-sm">Share your experience with {vendorName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close rating modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Booking Info */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600 font-medium">Service</div>
                    <div className="text-gray-900 font-semibold">{booking.serviceType}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Event Date</div>
                    <div className="text-gray-900 font-semibold">{booking.eventDate}</div>
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-semibold text-lg">
                  How would you rate your experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all hover:scale-110 focus:outline-none"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-12 h-12 transition-all ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hoveredRating || rating) > 0 && (
                  <p className="text-sm font-medium text-pink-600 animate-fade-in">
                    {getRatingLabel(hoveredRating || rating)}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <label className="block text-gray-700 font-semibold text-lg">
                  Tell us about your experience
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about your experience with this vendor. What did you like? What could be improved?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all resize-none"
                  rows={6}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {comment.length}/1000 characters
                  </span>
                  <span className="text-pink-600 font-medium">
                    Be honest and constructive 💕
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Review Tips */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Review Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific about what you liked or didn't like</li>
                  <li>• Mention quality, professionalism, and communication</li>
                  <li>• Your review helps other couples make informed decisions</li>
                  <li>• Reviews are public and will be displayed on the vendor's profile</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0 || !comment.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
