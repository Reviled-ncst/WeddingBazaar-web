import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Loader2,
  AlertTriangle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { VendorMap, type VendorLocation } from '../../../shared/components/maps/VendorMap';
import { PublicBookingCalendar } from '../../../shared/components/calendar/PublicBookingCalendar';
import { useAuth } from '../../../shared/contexts/HybridAuthContext';
import { LoginModal } from '../../../shared/components/modals/LoginModal';
import { RegisterModal } from '../../../shared/components/modals/RegisterModal';
import { ConfirmationModal } from '../../../shared/components/modals/ConfirmationModal';

interface Service {
  id: string;
  vendor_id: string;
  title: string;
  name?: string;
  description: string;
  category: string;
  price: string | number;
  images?: string[];
  featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  location?: string;
  price_range?: string;
  features?: string[];
  tags?: string[];
  keywords?: string;
  
  // DSS Fields (Dynamic Service Scoring)
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: any; // Can be string or object
  
  vendor?: {
    id: string;
    name: string;
    business_name?: string;
    category?: string;
    rating?: number;
    review_count?: number;
    location?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export const ServicePreview: React.FC = () => {
  const { serviceId: slugParam } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    icon: 'heart' | 'check' | 'alert' | 'info';
  }>({
    title: '',
    message: '',
    type: 'success',
    icon: 'check'
  });

  // Get the actual service ID from query params (secure, not exposed in slug)
  const serviceId = searchParams.get('id') || slugParam;

  // Function to geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      // Use a free geocoding service (Nominatim)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        return [lat, lng];
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
    }
    
    // Default to Manila coordinates if geocoding fails
    return [14.5995, 120.9842];
  };

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setError('Service ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com'}/api/services/${serviceId}`);
        
        if (!response.ok) {
          throw new Error(`Service not found (${response.status})`);
        }

        const data = await response.json();
        
        if (data.success && data.service) {
          console.log('🖼️ Service data received:', data.service);
          console.log('📸 Images array:', data.service.images);
          console.log('🔢 Images type:', typeof data.service.images);
          console.log('✅ Is array?', Array.isArray(data.service.images));
          
          setService(data.service);
          
          // Geocode the service location if available
          const serviceLocation = (data.service as any).location;
          if (serviceLocation) {
            const coords = await geocodeAddress(serviceLocation);
            setLocationCoords(coords);
          }
        } else {
          throw new Error('Service data not available');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load service';
        console.error('❌ Error fetching service:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'native') => {
    const url = window.location.href;
    const title = service ? `Check out this wedding service: ${service.title}` : 'Wedding Service';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({ title, url });
        } else {
          handleCopyLink();
        }
        break;
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading service details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The service you\'re looking for doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Back to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  const images = service.images?.filter(img => img && img.trim() !== '') || [];
  const hasImages = images.length > 0;

  // Log once when service data changes (for debugging)
  console.log('🎨 ServicePreview Images:', {
    rawImages: service.images,
    filteredImages: images,
    hasImages,
    count: images.length
  });
  
  console.log('🖼️ Gallery will render:', hasImages ? 'YES' : 'NO');
  if (hasImages) {
    console.log('📸 Main image URL:', images[currentImageIndex]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Clean Professional Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-pink-100 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Clean Back Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </motion.button>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 ${
                  copySuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </motion.button>
              
              {/* Share Dropdown */}
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Share</span>
                </motion.button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 rounded-xl transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook size={18} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-700">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50 rounded-xl transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                        <Twitter size={18} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-700">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('native')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-xl transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Share2 size={18} className="text-white" />
                      </div>
                      <span className="font-medium text-gray-700">More Options</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Clean & Professional */}
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Hero Section - Clean Two-Column Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            
            {/* Left: Image Gallery - Shopee-style */}
            <div className="space-y-4">
              {hasImages ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  {/* Main Image Display */}
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-square rounded-xl overflow-hidden bg-white mb-4"
                  >
                    <img
                      src={images[currentImageIndex]}
                      alt={service.title}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Image Counter Badge (Shopee style) */}
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-md text-white text-sm font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                    
                    {/* Featured Badge */}
                    {service.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-md shadow-lg flex items-center gap-1.5">
                        <Star size={14} className="text-white fill-white" />
                        <span className="text-white font-bold text-xs uppercase tracking-wide">Featured</span>
                      </div>
                    )}
                  </motion.div>
                  
                  {/* Thumbnail Strip (Always show, like Shopee) */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {images.map((image, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                          index === currentImageIndex
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Active indicator overlay */}
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-rose-500/10" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                // No Image Placeholder
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                      <ImageIcon size={40} className="text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Service Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Service Info Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold text-sm shadow-md">
                    {service.category}
                  </span>
                  {service.service_tier && (
                    <span className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-md ${
                      service.service_tier === 'premium' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                        : service.service_tier === 'standard'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {service.service_tier.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {service.title || service.name}
                </h1>

                {/* Price */}
                <div className="mb-6">
                  <div className="inline-flex items-baseline gap-2 px-6 py-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200">
                    <span className="text-4xl font-bold text-gray-900">
                      {(service as any).price_range && (service as any).price_range !== '₱' 
                        ? (service as any).price_range 
                        : formatPrice(service.price)}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                {service.vendor?.rating && (
                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < Math.floor(service.vendor?.rating || 0) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{service.vendor.rating}</span>
                      {service.vendor.review_count && (
                        <span className="text-sm text-gray-600">({service.vendor.review_count} reviews)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Years in Business */}
                  {service.years_in_business && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                      <div className="text-3xl font-bold text-purple-700 mb-1">
                        {service.years_in_business}+
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase">Years Experience</div>
                    </div>
                  )}

                  {/* Availability */}
                  <div className={`p-4 rounded-xl border text-center ${
                    service.is_active !== false
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`text-xl font-bold mb-1 ${
                      service.is_active !== false ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {service.is_active !== false ? '✓ Available' : '✗ Unavailable'}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 uppercase">Status</div>
                  </div>
                </div>

                {/* Location */}
                {(service as any).location && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                    <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</div>
                      <div className="text-sm text-gray-900 font-medium">{(service as any).location}</div>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        // Show login modal for unauthenticated users
                        setShowLoginModal(true);
                      } else {
                        // Navigate to booking page for authenticated users
                        navigate(`/individual/services?bookService=${service.id}`);
                      }
                    }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={22} />
                    {isAuthenticated ? 'Book This Service' : 'Login to Book'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        // Show login modal for unauthenticated users
                        setShowLoginModal(true);
                      } else {
                        // TODO: Add to favorites functionality
                        setConfirmationConfig({
                          title: 'Added to Favorites! 💕',
                          message: `"${service.title || service.name}" has been saved to your favorites. You can view all your saved services in your profile.`,
                          type: 'success',
                          icon: 'heart'
                        });
                        setShowConfirmation(true);
                      }
                    }}
                    className="w-full px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-bold text-lg border-2 border-gray-300 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Heart size={22} />
                    {isAuthenticated ? 'Save to Favorites' : 'Login to Save'}
                  </motion.button>
                </div>
              </div>

              {/* Vendor Info Card */}
              {service.vendor && (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold mb-3 text-gray-300 uppercase tracking-wide">Provided By</h3>
                  <div className="text-2xl font-bold mb-1">
                    {service.vendor.name || service.vendor.business_name}
                  </div>
                  {service.vendor.category && (
                    <div className="text-sm text-gray-400">{service.vendor.category}</div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-12 bg-gradient-to-b from-rose-500 to-pink-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">About This Service</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {service.description || 'No description provided for this service.'}
            </p>
          </motion.div>

          {/* Wedding Styles & Cultural Specialties */}
          {((service.wedding_styles && service.wedding_styles.length > 0) || 
            (service.cultural_specialties && service.cultural_specialties.length > 0)) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wedding Styles */}
              {service.wedding_styles && service.wedding_styles.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                      <Star size={20} className="text-white fill-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Wedding Styles</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {service.wedding_styles.map((style, index) => (
                      <span
                        key={index}
                        className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold shadow-md"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Specialties */}
              {service.cultural_specialties && service.cultural_specialties.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Globe size={20} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Cultural Specialties</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {service.cultural_specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold shadow-md"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location & Availability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            {(service as any).location && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Location</h2>
                <div className="h-80 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <VendorMap
                    vendors={[{
                      id: service.id,
                      name: service.title || service.name || 'Service Location',
                      category: service.category,
                      latitude: locationCoords ? locationCoords[0] : 14.5995,
                      longitude: locationCoords ? locationCoords[1] : 120.9842,
                      address: (service as any).location,
                      priceRange: (service as any).price_range,
                      description: service.description,
                      rating: service.vendor?.rating,
                      reviewCount: service.vendor?.review_count
                    } as VendorLocation]}
                    center={locationCoords || [14.5995, 120.9842]}
                    zoom={15}
                    height="320px"
                    showAddressSearch={false}
                    showVendorCount={false}
                    showUserLocation={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Calendar - Read-Only Display */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon size={24} className="text-rose-500" />
                Vendor Availability
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <PublicBookingCalendar
                  vendorId={service.vendor_id}
                  serviceId={service.id}
                  className="w-full"
                />
              </div>
              <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
                <p className="text-sm text-gray-700 font-medium mb-2">📅 Availability Legend:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Booked</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 text-center italic">
                  Click <strong>"Book This Service"</strong> button below to request a booking
                </p>
              </div>
            </div>
          </div>

          {/* Features & Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Features */}
            {(service as any).features && (service as any).features.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
                <div className="space-y-3">
                  {(service as any).features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(service as any).tags && (service as any).tags.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {(service as any).tags.map((tag: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vendor Contact */}
          {service.vendor && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Vendor</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">
                    {service.vendor.business_name || service.vendor.name}
                  </h3>
                  {service.vendor.category && (
                    <p className="text-gray-600">{service.vendor.category}</p>
                  )}
                </div>
                
                {service.vendor.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={20} className="text-rose-600" />
                    <span>{service.vendor.location}</span>
                  </div>
                )}
                
                {(service.vendor.rating || service.vendor.review_count) && (
                  <div className="flex items-center gap-4">
                    {service.vendor.rating && (
                      <div className="flex items-center gap-2">
                        <Star size={20} className="text-yellow-400 fill-current" />
                        <span className="font-bold text-gray-900">{service.vendor.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {service.vendor.review_count && (
                      <span className="text-gray-600">
                        ({service.vendor.review_count} reviews)
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 pt-4">
                  {service.vendor.phone && (
                    <a
                      href={`tel:${service.vendor.phone}`}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold shadow-md"
                    >
                      <Phone size={18} />
                      Call Now
                    </a>
                  )}
                  
                  {service.vendor.email && (
                    <a
                      href={`mailto:${service.vendor.email}`}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold shadow-md"
                    >
                      <Mail size={18} />
                      Email
                    </a>
                  )}
                  
                  {service.vendor.website && (
                    <a
                      href={service.vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors font-semibold shadow-md"
                    >
                      <Globe size={18} />
                      Website
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Final CTA */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginModal(true);
                  } else {
                    navigate(`/individual/services?bookService=${service.id}`);
                  }
                }}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <MessageCircle size={22} />
                {isAuthenticated ? 'Book This Service' : 'Login to Book'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginModal(true);
                  } else {
                    setConfirmationConfig({
                      title: 'Added to Favorites! 💕',
                      message: `"${service.title || service.name}" has been saved to your favorites. You can view all your saved services in your profile.`,
                      type: 'success',
                      icon: 'heart'
                    });
                    setShowConfirmation(true);
                  }
                }}
                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold text-lg border-2 border-gray-300 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Heart size={22} />
                {isAuthenticated ? 'Save' : 'Login'}
              </motion.button>
            </div>
          </div>

        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        type={confirmationConfig.type}
        icon={confirmationConfig.icon}
      />
    </div>
  );
};
