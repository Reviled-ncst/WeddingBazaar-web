import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  MapPin,
  Star,
  MessageCircle,
  Phone,
  Calendar,
  Globe,
  Heart,
  Clock,
  Users,
  Award,
  CheckCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// Review interface
interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string; // API uses createdAt, not created_at
  userName?: string; // API uses userName, not user_name
  userImage?: string; // API uses userImage, not user_image
  title?: string; // API also includes title
  helpful?: number; // API includes helpful count
  verified?: boolean; // API includes verified status
}
import type { Service } from '../types';
import { BookingRequestModal } from './BookingRequestModal';
// Use the comprehensive booking types for consistency
import type { Booking } from '../../../pages/users/individual/bookings/types/booking.types';
import { mapToUIBooking } from '../../../pages/users/individual/bookings/types/booking.types';
import { bookingApiService } from '../../../services/api/bookingApiService';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { LoginModal } from '../../../shared/components/modals/LoginModal';
import { RegisterModal } from '../../../shared/components/modals/RegisterModal';

interface ServiceDetailsModalProps {
  service: Service;
  isOpen: boolean;
  isLiked: boolean;
  onClose: () => void;
  onContact: (service: Service) => void;
  onToggleLike: (serviceId: string) => void;
}

// Optimized Image Component with CORS handling and loading states
interface OptimizedImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  onError,
  onLoad,
  priority = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setIsLoading(true);
    }
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 text-gray-400",
        className
      )}>
        <div className="text-center">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading={priority ? "eager" : "lazy"}
        crossOrigin="anonymous"
        decoding="async"
        style={{ 
          willChange: 'auto',
          contentVisibility: 'auto'
        }}
      />
    </div>
  );
};

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  isOpen,
  isLiked,
  onClose,
  onContact,
  onToggleLike
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [checkingBooking, setCheckingBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreenView, setIsFullScreenView] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Authentication modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentImageIndex < allImages.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (isFullScreenView) {
            setIsFullScreenView(false);
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          if (allImages.length > 0) {
            event.preventDefault();
            setIsFullScreenView(!isFullScreenView);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentImageIndex, isFullScreenView, service.image, service.gallery, onClose]);

  // Reset image index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  // Check for existing booking when modal opens
  useEffect(() => {
    if (isOpen && user?.id && service?.vendorId) {
      checkExistingBooking();
    }
    if (isOpen && service?.id) {
      loadReviews();
    }
  }, [isOpen, user?.id, service?.vendorId, service?.id]);

  const loadReviews = async () => {
    if (!service?.id) return;
    
    setLoadingReviews(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/reviews/service/${service.id}`);
      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkExistingBooking = async () => {
    if (!user?.id || !service?.vendorId || !service?.id) return;
    
    setCheckingBooking(true);
    try {
      const response = await bookingApiService.getAllBookings({
        coupleId: user.id,
        vendorId: service.vendorId,
        serviceId: service.id,
        limit: 1,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (response.bookings && response.bookings.length > 0) {
        const latest = response.bookings[0];
        // Map to UI type to keep camelCase in component state
        setExistingBooking(mapToUIBooking(latest as any));
        console.log('✅ [ServiceDetailsModal] Found existing booking for this specific service:', latest);
      } else {
        console.log('ℹ️ [ServiceDetailsModal] No existing booking found');
      }
    } catch (error) {
      console.error('❌ [ServiceDetailsModal] Error checking existing booking:', error);
    } finally {
      setCheckingBooking(false);
    }
  };

  const handleBookingCreated = (booking: Booking) => {
    setExistingBooking(booking);
    setShowBookingModal(false);
  };

  // Authentication check functions
  const handleBookingRequest = () => {
    if (!isAuthenticated) {
      setShowRegisterModal(true);
      return;
    }
    setShowBookingModal(true);
  };

  const handleContactRequest = () => {
    if (!isAuthenticated) {
      setShowRegisterModal(true);
      return;
    }
    onContact(service);
    onClose();
  };

  const handleAuthModalClose = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-700 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'declined': return 'text-red-700 bg-red-100 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date format error';
    }
  };
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const nextImage = () => {
    const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (!isOpen) return null;

  // Debug logging
  console.log('🖼️ Service gallery debug:', {
    serviceName: service.name,
    mainImage: service.image,
    gallery: service.gallery,
    galleryLength: service.gallery?.length || 0,
    allImages: [service.image, ...(service.gallery || [])].filter(Boolean)
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative">
          {/* Enhanced Modal Header with Advanced Image Gallery */}
          <div className="relative h-96 overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Main Image Display */}
            <div className="relative h-full group">
              {(() => {
                const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
                return allImages.length > 0 ? (
                  <div className="relative h-full">
                    <OptimizedImage
                      src={allImages[currentImageIndex]}
                      alt={`${service.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full cursor-pointer"
                      priority={currentImageIndex === 0}
                      onLoad={() => {
                        // Preload next image
                        if (currentImageIndex < allImages.length - 1) {
                          const nextImg = new Image();
                          nextImg.src = allImages[currentImageIndex + 1];
                        }
                      }}
                    />
                    
                    {/* Image Loading Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                    
                    {/* Gradient Overlays for Better Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No images available</p>
                    </div>
                  </div>
                );
              })()}
              
              {/* Enhanced Navigation Controls */}
              {(() => {
                const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
                return allImages.length > 1 && (
                  <>
                    {/* Previous Image Button */}
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-6 transform -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed group"
                      disabled={currentImageIndex === 0}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    </button>
                    
                    {/* Next Image Button */}
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-6 transform -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                      disabled={currentImageIndex === allImages.length - 1}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    </button>
                    
                    {/* Enhanced Image Counter with Progress Bar */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md shadow-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{currentImageIndex + 1} / {allImages.length}</span>
                          <div className="flex space-x-1">
                            {allImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-300",
                                  index === currentImageIndex 
                                    ? "bg-white w-6" 
                                    : "bg-white/50 hover:bg-white/75"
                                )}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Enhanced Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl backdrop-blur-md group"
              title="Close modal"
              aria-label="Close service details modal"
            >
              <X className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
            </button>
            
            {/* Full Screen Image Button */}
            {(() => {
              const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
              return allImages.length > 0 && (
                <button
                  onClick={() => setIsFullScreenView(true)}
                  className="absolute top-6 right-20 p-3 bg-white/90 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-xl backdrop-blur-md group"
                  title="View full screen"
                  aria-label="View image in full screen"
                >
                  <ImageIcon className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
                </button>
              );
            })()}
            
            {/* Service Title Overlay */}
            <div className="absolute bottom-6 left-6 text-white max-w-2xl">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <h2 className="text-3xl font-bold mb-2 text-shadow-lg">{service.name}</h2>
                <div className="flex items-center space-x-4 text-lg">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {service.category}
                  </span>
                  <div className="flex items-center space-x-1 text-white/90">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{service.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Vendor Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {service.vendorImage && (
                      <OptimizedImage
                        src={service.vendorImage}
                        alt={service.vendorName}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.vendorName}</h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(service.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          {service.rating} ({service.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{service.priceRange}</div>
                    <div className="text-sm text-gray-500">Price Range</div>
                  </div>
                </div>

                {/* Compact Image Gallery Section */}
                {(() => {
                  const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
                  return (
                    <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-xl border border-rose-100 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-rose-500" />
                          <span>Portfolio</span>
                          <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-medium">
                            {allImages.length}
                          </span>
                        </h4>
                        {allImages.length > 1 && (
                          <div className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                            {currentImageIndex + 1} of {allImages.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Compact Thumbnail Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {allImages.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                              "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
                              currentImageIndex === index 
                                ? "border-rose-500 ring-2 ring-rose-200 shadow-md scale-105" 
                                : "border-gray-200 hover:border-rose-300"
                            )}
                          >
                            <OptimizedImage
                              src={imageUrl}
                              alt={`${service.name} - Image ${index + 1}`}
                              className="w-full h-full transition-all duration-200 group-hover:brightness-110"
                            />
                            
                            {/* Active Image Indicator */}
                            {currentImageIndex === index && (
                              <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent flex items-end justify-center pb-1">
                                <div className="bg-white rounded-full p-1 shadow-sm">
                                  <CheckCircle className="h-3 w-3 text-rose-500" />
                                </div>
                              </div>
                            )}
                            
                            {/* Image Number Badge */}
                            <div className="absolute top-0.5 right-0.5 bg-black/60 text-white text-xs px-1 py-0.5 rounded text-center leading-none">
                              {index + 1}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                    {/* Quick Navigation Hint */}
                    {allImages.length > 1 && (
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                          <span>💡</span>
                          <span>Click thumbnails, use ← → keys, or press F for full screen</span>
                        </p>
                      </div>
                    )}
                    </div>
                  );
                })()}

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About This Service</h4>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's Included</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Customer Reviews</h4>
                    <div className="flex items-center space-x-2">
                      {renderStars(service.rating)}
                      <span className="text-sm text-gray-600">
                        {service.rating} ({service.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  
                  {loadingReviews ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600">Loading reviews...</span>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{review.userName || 'Anonymous User'}</h5>
                                <div className="flex items-center space-x-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              {review.title && (
                                <h6 className="font-medium text-gray-800 text-sm mb-1">{review.title}</h6>
                              )}
                              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                                {review.verified && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {reviews.length > 5 && (
                        <div className="text-center">
                          <p className="text-sm text-gray-500">
                            Showing 5 of {reviews.length} reviews
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No reviews yet</p>
                      <p className="text-sm text-gray-400">Be the first to review this service</p>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Response Time</div>
                      <div className="text-sm text-gray-600">Within 2 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Experience</div>
                      <div className="text-sm text-gray-600">5+ years</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Availability</div>
                      <div className="text-sm text-gray-600">
                        {service.availability ? 'Available' : 'Booked'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {(service.contactInfo?.email || service.contactInfo?.phone || service.contactInfo?.website) && (
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      {service.contactInfo.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600">Email:</span>
                          <a href={`mailto:${service.contactInfo.email}`} className="text-blue-600 hover:underline">
                            {service.contactInfo.email}
                          </a>
                        </div>
                      )}
                      {service.contactInfo.phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">Phone:</span>
                          <a href={`tel:${service.contactInfo.phone}`} className="text-green-600 hover:underline">
                            {service.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      {service.contactInfo.website && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe className="h-4 w-4 text-purple-500" />
                          <span className="text-gray-600">Website:</span>
                          <a 
                            href={service.contactInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-purple-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Contact Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Get In Touch</h4>
                  
                  {/* Existing Booking Status */}
                  {checkingBooking && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-700">Checking booking status...</span>
                      </div>
                    </div>
                  )}
                  
                  {existingBooking && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Existing Booking</span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium border",
                          getBookingStatusColor(existingBooking.status)
                        )}>
                          {existingBooking.status.charAt(0).toUpperCase() + existingBooking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Event Date: {formatDate(existingBooking.eventDate)}
                      </p>
                      {existingBooking.responseMessage && (
                        <p className="text-xs text-blue-600 mt-1">
                          "{existingBooking.responseMessage}"
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* Request Booking Button */}
                    {!existingBooking && (
                      <button
                        onClick={handleBookingRequest}
                        className="w-full flex items-center justify-center space-x-2 bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Request Booking</span>
                      </button>
                    )}
                    
                    {/* Start Conversation Button */}
                    <button
                      onClick={handleContactRequest}
                      className={cn(
                        "w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors",
                        existingBooking 
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : "border border-rose-600 text-rose-600 hover:bg-rose-50"
                      )}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Start Conversation</span>
                    </button>
                    
                    {service.contactInfo?.phone && (
                      <button 
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowRegisterModal(true);
                            return;
                          }
                          window.open(`tel:${service.contactInfo?.phone}`, '_self');
                        }}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span>{isAuthenticated ? `Call ${service.contactInfo.phone}` : 'Login to View Phone'}</span>
                      </button>
                    )}
                    
                    {service.contactInfo?.website && (
                      <button 
                        onClick={() => window.open(service.contactInfo?.website, '_blank')}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Visit Website</span>
                      </button>
                    )}
                    
                    {!existingBooking && (
                      <button 
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowRegisterModal(true);
                            return;
                          }
                          // Handle calendar/availability view
                        }}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Check Availability</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => onToggleLike(service.id)}
                      className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Heart className={cn(
                        "h-4 w-4",
                        isLiked ? "text-red-500 fill-current" : ""
                      )} />
                      <span>
                        {isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                      </span>
                    </button>
                    {service.contactInfo?.website && (
                      <button 
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowRegisterModal(true);
                            return;
                          }
                          window.open(service.contactInfo?.website, '_blank');
                        }}
                        className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>{isAuthenticated ? 'Visit Website' : 'View Website'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Request Modal */}
      <BookingRequestModal
        service={service}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingCreated={handleBookingCreated}
      />
      
      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleAuthModalClose}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={handleAuthModalClose}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      {/* Full Screen Image Viewer */}
      {isFullScreenView && (() => {
        const allImages = [service.image, ...(service.gallery || [])].filter(Boolean);
        return (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center animate-in fade-in duration-300">
            {/* Full Screen Image Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Main Full Screen Image */}
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${service.name} - Full view ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Full Screen Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-6 transform -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 rounded-full shadow-xl transition-all duration-300 backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={currentImageIndex === 0}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                  
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-6 transform -translate-y-1/2 p-4 bg-white/20 hover:bg-white/30 rounded-full shadow-xl transition-all duration-300 backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={currentImageIndex === allImages.length - 1}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </button>
                </>
              )}
              
              {/* Full Screen Close Button */}
              <button
                onClick={() => setIsFullScreenView(false)}
                className="absolute top-6 right-6 p-4 bg-white/20 hover:bg-white/30 rounded-full shadow-xl transition-all duration-300 backdrop-blur-md"
                title="Exit full screen"
                aria-label="Exit full screen view"
              >
                <X className="h-8 w-8 text-white" />
              </button>
              
              {/* Full Screen Image Info */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-xl">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-lg">{currentImageIndex + 1} / {allImages.length}</span>
                    {allImages.length > 1 && (
                      <div className="flex space-x-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                              "w-3 h-3 rounded-full transition-all duration-300",
                              index === currentImageIndex 
                                ? "bg-white w-8" 
                                : "bg-white/50 hover:bg-white/75"
                            )}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Full Screen Thumbnail Strip (for large galleries) */}
              {allImages.length > 4 && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-2xl">
                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-3">
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                      {allImages.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                            currentImageIndex === index 
                              ? "border-white ring-2 ring-white/50" 
                              : "border-white/30 hover:border-white/60"
                          )}
                        >
                          <OptimizedImage
                            src={imageUrl}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
