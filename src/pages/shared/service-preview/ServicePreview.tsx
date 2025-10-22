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
  X
} from 'lucide-react';
import { VendorMap, type VendorLocation } from '../../../shared/components/maps/VendorMap';
import { VendorAvailabilityCalendar } from '../../../shared/components/calendar/VendorAvailabilityCalendar';

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
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  copySuccess
                    ? 'bg-green-100 text-green-800'
                    : 'bg-white/60 text-gray-700 hover:bg-white/80'
                }`}
              >
                {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
              
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/60 text-gray-700 hover:bg-white/80 rounded-lg font-medium transition-all duration-300">
                  <Share2 size={16} />
                  Share
                </button>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Facebook size={16} className="text-blue-600" />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Twitter size={16} className="text-sky-500" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare('native')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Share2 size={16} className="text-gray-600" />
                      More Options
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section - Full Width */}
        <div className="mb-12">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
            
            {/* Image Gallery - Takes 3/5 width on extra large screens */}
            <div className="xl:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {hasImages ? (
                  <>
                    <div className="aspect-video rounded-2xl overflow-hidden bg-white shadow-xl">
                      <img
                        src={images[currentImageIndex]}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              index === currentImageIndex
                                ? 'border-rose-500 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${service.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl">
                    <div className="text-center">
                      <ImageIcon size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">No images available</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Service Header Info - Takes 2/5 width */}
            <div className="xl:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Service Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">
                      {service.category}
                    </span>
                    {service.featured && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {service.title || service.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="text-2xl font-bold text-rose-600">
                      {(service as any).price_range && (service as any).price_range !== '₱' 
                        ? (service as any).price_range 
                        : formatPrice(service.price)}
                    </div>
                    
                    {service.vendor?.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{service.vendor.rating}</span>
                        {service.vendor.review_count && (
                          <span className="text-sm">({service.vendor.review_count} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Service</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {service.description || 'No description provided for this service.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/individual/services')}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <MessageCircle size={20} className="inline mr-2" />
                    Book This Service
                  </button>
                  
                  <button className="px-6 py-4 bg-white/60 backdrop-blur-sm text-gray-700 rounded-xl font-semibold hover:bg-white/80 transition-all duration-300 border border-white/20">
                    <Heart size={20} className="inline mr-2" />
                    Save
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Full Width Content Sections */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-12"
        >

          {/* Service Details */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Service Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Package Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Package Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Base service package</p>
                  {(service as any).price_range && (service as any).price_range !== '₱' && (
                    <p className="text-sm text-gray-500">
                      Additional packages may be available within the price range
                    </p>
                  )}
                </div>
              </div>

              {/* Availability Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                  (service as any).is_active !== false
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(service as any).is_active !== false ? '✓ Accepting Bookings' : '✗ Not Available'}
                </span>
              </div>

              {/* Location Info */}
              {(service as any).location && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Service Location</h3>
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span className="text-sm">{(service as any).location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Experience & Specialization Section */}
          {(service.years_in_business || service.service_tier || service.wedding_styles || service.cultural_specialties) && (
            <div className="bg-gradient-to-br from-white/70 to-rose-50/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Experience & Specialization</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Years in Business */}
                {service.years_in_business && (
                  <div className="bg-white/80 rounded-xl p-4 border border-rose-100">
                    <div className="text-3xl font-bold text-rose-600 mb-1">
                      {service.years_in_business}+
                    </div>
                    <div className="text-sm text-gray-600">Years of Experience</div>
                  </div>
                )}

                {/* Service Tier */}
                {service.service_tier && (
                  <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                    <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold uppercase mb-1 ${
                      service.service_tier === 'premium' 
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                        : service.service_tier === 'standard'
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {service.service_tier}
                    </div>
                    <div className="text-sm text-gray-600">Service Tier</div>
                  </div>
                )}

                {/* Active Status */}
                <div className="bg-white/80 rounded-xl p-4 border border-green-100">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-1 ${
                    service.is_active !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.is_active !== false ? (
                      <>
                        <CheckCircle2 size={16} />
                        Accepting Bookings
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        Not Available
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Current Status</div>
                </div>

                {/* Featured Badge */}
                {service.featured && (
                  <div className="bg-white/80 rounded-xl p-4 border border-amber-100">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-amber-400 to-yellow-500 text-white mb-1">
                      <Star size={16} className="fill-current" />
                      Featured
                    </div>
                    <div className="text-sm text-gray-600">Premium Listing</div>
                  </div>
                )}
              </div>

              {/* Wedding Styles */}
              {service.wedding_styles && service.wedding_styles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Wedding Styles</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.wedding_styles.map((style, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 rounded-full text-sm font-medium border border-rose-200"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Specialties */}
              {service.cultural_specialties && service.cultural_specialties.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cultural Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.cultural_specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-800 rounded-full text-sm font-medium border border-indigo-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location & Availability - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Map */}
            {(service as any).location && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
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

            {/* Availability Calendar */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Check Availability</h2>
              <div className="bg-white rounded-xl p-4">
                <VendorAvailabilityCalendar
                  vendorId={service.vendor_id}
                  className="w-full"
                  onDateSelect={(date, availability) => {
                    console.log('Selected date:', date, 'Availability:', availability);
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Select a date to check availability and book this service
              </p>
            </div>
          </div>



          {/* Features and Tags - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Features */}
            {(service as any).features && (service as any).features.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Features</h2>
                <div className="space-y-2">
                  {(service as any).features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {(service as any).tags && (service as any).tags.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-3">
                  {(service as any).tags.map((tag: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Service and Vendor Information - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Information */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service ID:</span>
                  <span className="font-mono text-gray-900">{service.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium text-gray-900">
                    {service.vendor?.business_name || service.vendor?.name || `ID: ${service.vendor_id}`}
                  </span>
                </div>
                
                {service.vendor?.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="font-medium">{service.vendor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                
                {(service as any).created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">
                      {new Date((service as any).created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {(service as any).updated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">
                      {new Date((service as any).updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {(service as any).keywords && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Keywords:</span>
                    <span className="text-gray-900 text-right max-w-32 truncate" title={(service as any).keywords}>
                      {(service as any).keywords}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Information */}
            {service.vendor && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {service.vendor.business_name || service.vendor.name}
                    </h3>
                    {service.vendor.category && (
                      <p className="text-sm text-gray-600 mt-1">{service.vendor.category}</p>
                    )}
                  </div>
                  
                  {service.vendor.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      <span>{service.vendor.location}</span>
                    </div>
                  )}
                  
                  {(service.vendor.rating || service.vendor.review_count) && (
                    <div className="flex items-center gap-4 text-sm">
                      {service.vendor.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="font-medium">{service.vendor.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {service.vendor.review_count && (
                        <span className="text-gray-600">
                          {service.vendor.review_count} reviews
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    {service.vendor.phone && (
                      <a
                        href={`tel:${service.vendor.phone}`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                      >
                        <Phone size={16} />
                        Call
                      </a>
                    )}
                    
                    {service.vendor.email && (
                      <a
                        href={`mailto:${service.vendor.email}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                      >
                        <Mail size={16} />
                        Email
                      </a>
                    )}
                    
                    {service.vendor.website && (
                      <a
                        href={service.vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
                      >
                        <Globe size={16} />
                        Website
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Final Action Buttons */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <button
                onClick={() => navigate('/individual/services')}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <MessageCircle size={20} className="inline mr-2" />
                Book This Service
              </button>
              
              <button
                className="px-8 py-4 bg-white/60 backdrop-blur-sm text-gray-700 rounded-xl font-semibold hover:bg-white/80 transition-all duration-300 border border-white/20"
              >
                <Heart size={20} className="inline mr-2" />
                Save
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
