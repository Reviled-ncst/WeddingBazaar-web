import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Grid,
  List,
  X,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Filter,
  SlidersHorizontal,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useUniversalMessaging } from '../../../../shared/contexts/UniversalMessagingContext';
import { serviceManager, SERVICE_CATEGORIES } from '../../../../shared/services/CentralizedServiceManager';
import { BookingRequestModal } from '../../../../modules/services/components/BookingRequestModal';
import { DecisionSupportSystem } from './dss/DecisionSupportSystemClean';
import type { ServiceCategory } from '../../../../shared/types/comprehensive-booking.types';
import type { Service as BookingService } from '../../../../modules/services/types';

// Helper function to convert Service to BookingService format
const convertToBookingService = (service: Service): BookingService => {
  // Map string category to ServiceCategory
  const categoryMap: Record<string, ServiceCategory> = {
    'Photography': 'photography',
    'Videography': 'videography',
    'Catering': 'catering',
    'Venue': 'venue',
    'Music & DJ': 'music_dj',
    'Flowers & Decor': 'flowers_decor',
    'Wedding Planning': 'wedding_planning',
    'Transportation': 'transportation',
    'Makeup & Hair': 'makeup_hair',
    'Wedding Cake': 'wedding_cake',
    'Officiant': 'officiant',
    'Entertainment': 'entertainment',
    'Lighting': 'lighting',
    'Security': 'security',
    'Other': 'other'
  };

  const mappedCategory = categoryMap[service.category] || 'other';

  return {
    id: service.id,
    vendorId: service.vendorId || service.vendor_id,
    name: service.name,
    category: mappedCategory,
    description: service.description,
    basePrice: service.price,
    priceRange: service.priceRange,
    image: service.image,
    gallery: service.images || service.gallery || [service.image].filter(Boolean),
    features: service.features || [],
    availability: service.availability,
    location: service.location,
    rating: service.rating,
    reviewCount: service.reviewCount,
    vendorName: service.vendorName,
    vendorImage: service.vendorImage,
    contactInfo: service.contactInfo
  };
};

// Local interface definitions to avoid module resolution issues
interface Service {
  id: string;
  title?: string;
  name: string;
  category: string;
  vendor_id: string;
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  description: string;
  price?: number;
  priceRange: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  gallery: string[];
  features: string[];
  is_active: boolean;
  availability: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
}

interface ServiceFilters {
  category: string;
  location: string;
  priceRange: string;
  rating: number;
  availability: boolean;
  featured: boolean;
}

export function Services() {
  console.log('🎯 [Services] *** SERVICES COMPONENT RENDERED ***');
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [showDSS, setShowDSS] = useState(false);
  
  const { startConversationWith } = useUniversalMessaging();

  // Load services using centralized service manager
  useEffect(() => {
    console.log('🚀 [Services] *** USEEFFECT TRIGGERED ***');
    console.log('🔧 [Services] Component filters:', { selectedCategory, featuredOnly, ratingFilter });
    
    const loadServices = async () => {
      console.log('📋 [Services] *** CALLING LOADSERVICES FUNCTION ***');
      setLoading(true);
      console.log('🔄 [Services] Loading services with centralized manager...');
      
      const filters = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        featured: featuredOnly || undefined,
        rating: ratingFilter || undefined,
        limit: 50
      };

      console.log('🔧 [Services] *** ABOUT TO CALL SERVICEMANAGER ***');
      console.log('🔧 [Services] Filters being passed:', filters);
      
      try {
        console.log('� [Services] Using CentralizedServiceManager to load ALL services...');
        
        const result = await serviceManager.getAllServices(filters);
        
        if (result.success && result.services.length > 0) {
          console.log('✅ [Services] Loaded services from centralized manager:', result.services.length);
          setServices(result.services);
        } else {
          console.log('⚠️ [Services] No services found');
          setServices([]);
        }
      } catch (error) {
        console.error('❌ [Services] Error loading services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [selectedCategory, featuredOnly, ratingFilter]);

  // Filter and search services
  useEffect(() => {
    let filtered = [...services];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(service =>
        service.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange !== 'all') {
      const priceRanges: { [key: string]: (service: Service) => boolean } = {
        'budget': (service) => service.price ? service.price < 50000 : service.priceRange.includes('₱') && parseInt(service.priceRange.replace(/[^\d]/g, '')) < 50000,
        'mid': (service) => service.price ? (service.price >= 50000 && service.price <= 150000) : true,
        'premium': (service) => service.price ? service.price > 150000 : service.priceRange.toLowerCase().includes('premium') || service.priceRange.toLowerCase().includes('luxury')
      };
      
      if (priceRanges[priceRange]) {
        filtered = filtered.filter(priceRanges[priceRange]);
      }
    }

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const priceA = a.price || 0;
          const priceB = b.price || 0;
          return priceA - priceB;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    setFilteredServices(filtered);
  }, [services, searchTerm, locationFilter, priceRange, sortBy]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const handleContactVendor = (service: Service) => {
    if (service.contactInfo.phone) {
      window.open(`tel:${service.contactInfo.phone}`, '_self');
    }
  };

  const handleEmailVendor = (service: Service) => {
    if (service.contactInfo.email) {
      const subject = `Wedding Inquiry - ${service.name}`;
      const body = `Hi ${service.vendorName},

I'm interested in your ${service.name} service for my wedding. Could you please provide more details about:

- Availability for my wedding date
- Package options and pricing
- What's included in your services

Thank you!

Best regards`;
      
      window.open(`mailto:${service.contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }
  };

  const handleVisitWebsite = (service: Service) => {
    if (service.contactInfo.website) {
      window.open(service.contactInfo.website, '_blank');
    }
  };

  const handleBookingRequest = (service: Service) => {
    console.log('📋 [Services] Opening booking request for service:', service.name);
    setSelectedServiceForBooking(service);
    setShowBookingModal(true);
  };

  const openGalleryViewer = (images: string[], startIndex: number = 0) => {
    setGalleryImages(images);
    setCurrentImageIndex(startIndex);
    setSelectedGalleryImage(images[startIndex]);
  };

  const closeGalleryViewer = () => {
    setSelectedGalleryImage(null);
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % galleryImages.length
      : (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedGalleryImage(galleryImages[newIndex]);
  };

  const handleFavoriteService = (service: Service) => {
    console.log('❤️ [Services] Adding service to favorites:', service.name);
    // TODO: Implement favorites/wishlist functionality
    // For now, show a success message
    alert(`Added "${service.name}" to your favorites! 💕`);
  };

  const handleShareService = (service: Service) => {
    console.log('📤 [Services] Sharing service:', service.name);
    if (navigator.share) {
      navigator.share({
        title: `${service.name} - Wedding Service`,
        text: `Check out this wedding service: ${service.name} by ${service.vendorName}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Service link copied to clipboard!');
    }
  };

  const handleQuickContact = (service: Service, method: 'call' | 'email' | 'message') => {
    console.log(`📞 [Services] Quick contact via ${method}:`, service.name);
    switch (method) {
      case 'call':
        handleContactVendor(service);
        break;
      case 'email':
        handleEmailVendor(service);
        break;
      case 'message':
        handleMessageVendor(service);
        break;
    }
  };

  const handleCompareService = (service: Service) => {
    console.log('🔍 [Services] Adding service to comparison:', service.name);
    // TODO: Implement service comparison functionality
    alert(`Added "${service.name}" to comparison! Use this feature to compare multiple vendors side-by-side.`);
  };

  const handleViewGallery = (service: Service) => {
    console.log('🖼️ [Services] Opening gallery for:', service.name);
    // Open service details modal which shows the gallery
    handleServiceSelect(service);
  };

  const handleMessageVendor = async (service: Service) => {
    console.log('🗨️ [Services] Starting conversation with vendor:', service.vendorName);
    try {
      const vendor = {
        id: service.vendorId,
        name: service.vendorName,
        role: 'vendor' as const,
        businessName: service.vendorName,
        serviceCategory: service.category
      };

      // Detailed service information for conversation context
      const serviceInfo = {
        id: service.id,
        name: service.name,
        category: service.category,
        description: service.description,
        priceRange: service.priceRange,
        location: service.location
      };

      await startConversationWith(vendor, serviceInfo);
      console.log('✅ [Services] Conversation started successfully');
    } catch (error) {
      console.error('❌ [Services] Error starting conversation:', error);
      // Fallback to basic conversation
      const vendor = {
        id: service.vendorId || `vendor-${Date.now()}`,
        name: service.vendorName,
        role: 'vendor' as const
      };
      
      try {
        await startConversationWith(vendor);
      } catch (fallbackError) {
        console.error('❌ [Services] Fallback conversation failed:', fallbackError);
      }
    }
  };



  const getAvailableLocations = () => {
    const locations = Array.from(new Set(services.map(s => s.location)));
    return locations.slice(0, 8); // Limit to top locations
  };

  const categories = ['All', ...SERVICE_CATEGORIES.map(cat => cat.name)];

  // DSS handlers
  const handleOpenDSS = () => {
    setShowDSS(true);
  };

  const handleCloseDSS = () => {
    setShowDSS(false);
  };

  const handleServiceRecommend = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      // Close DSS modal and show service details
      setShowDSS(false);
      setShowBookingModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <CoupleHeader />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="animate-pulse">
                <div className="h-8 bg-pink-200 rounded-lg mx-auto mb-4 w-64"></div>
                <div className="h-4 bg-pink-100 rounded mx-auto mb-8 w-96"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-64 bg-pink-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-pink-200 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-pink-100 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-pink-100 rounded mb-4 w-2/3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-pink-200 rounded w-20"></div>
                        <div className="h-8 bg-pink-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoupleHeader />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Wedding Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover professional wedding services from verified vendors to make your special day perfect
            </motion.p>
            <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {filteredServices.length} services available
              </span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search services, vendors, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Always Visible DSS Button - Prominently placed */}
                <button
                  onClick={handleOpenDSS}
                  className="group flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 font-semibold border border-white/20 backdrop-blur-sm relative overflow-hidden"
                  title="AI Decision Support System - Get Personalized Wedding Service Recommendations"
                  aria-label="Open AI Decision Support System for personalized recommendations"
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  <Brain className="h-6 w-6 group-hover:animate-pulse group-hover:scale-110 transition-all duration-300 relative z-10" />
                  <span className="relative z-10 text-lg">🤖 AI Wedding Planner</span>
                  <div className="w-3 h-3 bg-white/90 rounded-full animate-bounce shadow-lg relative z-10"></div>
                  
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/60 rounded-full animate-bounce opacity-80"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce opacity-80 animate-delay-500"></div>
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-pink-50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-lg transition-all duration-200',
                      viewMode === 'grid' 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-gray-500 hover:text-pink-600'
                    )}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2 rounded-lg transition-all duration-200',
                      viewMode === 'list' 
                        ? 'bg-white text-pink-600 shadow-sm' 
                        : 'text-gray-500 hover:text-pink-600'
                    )}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200',
                    showFilters 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                  )}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-pink-100"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <select
                          value={priceRange}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="all">All Prices</option>
                          <option value="budget">Budget (Under ₱50K)</option>
                          <option value="mid">Mid-range (₱50K - ₱150K)</option>
                          <option value="premium">Premium (Above ₱150K)</option>
                        </select>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <select
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="all">All Locations</option>
                          {getAvailableLocations().map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                      </div>

                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                        <select
                          value={ratingFilter}
                          onChange={(e) => setRatingFilter(Number(e.target.value))}
                          className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                        >
                          <option value={0}>Any Rating</option>
                          <option value={4}>4+ Stars</option>
                          <option value={4.5}>4.5+ Stars</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'reviews')}
                          className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="rating">Highest Rated</option>
                          <option value="reviews">Most Reviews</option>
                          <option value="price">Price (Low to High)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={featuredOnly}
                          onChange={(e) => setFeaturedOnly(e.target.checked)}
                          className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">Featured vendors only</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-6 py-3 rounded-full transition-all duration-200 font-medium',
                    selectedCategory === category
                      ? 'bg-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 shadow-md hover:shadow-lg'
                  )}
                >
                  {category === 'All' ? 'All Services' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid/List */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              {services.length === 0 ? (
                // No services in database
                <>
                  <div className="text-6xl mb-4">�</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Loading Wedding Services</h3>
                  <p className="text-gray-600 mb-6">
                    We have 90+ professional wedding services available. <br/>
                    If this message persists, please refresh the page or try again later.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">Available Services Include:</h4>
                    <p className="text-blue-700 text-sm">
                      Photography • Videography • Catering • Wedding Planning • Music & DJ • 
                      Florist • Venues • Beauty Services • Transportation • and more!
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </>
              ) : (
                // Services exist but filtered out
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Services Match Your Filters</h3>
                  <p className="text-gray-600 mb-6">
                    We found {services.length} services, but none match your current search criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setLocationFilter('all');
                      setPriceRange('all');
                      setRatingFilter(0);
                      setFeaturedOnly(false);
                    }}
                    className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <motion.div 
              layout
              className={cn(
                'grid gap-8',
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              )}
            >              {filteredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  viewMode={viewMode}
                  index={index}
                  onSelect={handleServiceSelect}
                  onMessage={handleMessageVendor}
                  onFavorite={handleFavoriteService}
                  onBookingRequest={handleBookingRequest}
                  onShare={handleShareService}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={handleCloseModal}
        onContact={handleContactVendor}
        onEmail={handleEmailVendor}
        onWebsite={handleVisitWebsite}
        onMessage={handleMessageVendor}
        onBookingRequest={handleBookingRequest}
        onOpenGallery={openGalleryViewer}
      />

      {/* Gallery Viewer Modal */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={selectedGalleryImage}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Close button */}
            <button
              onClick={closeGalleryViewer}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateGallery('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateGallery('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} of {galleryImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {showBookingModal && selectedServiceForBooking && (
        <BookingRequestModal
          service={convertToBookingService(selectedServiceForBooking)}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedServiceForBooking(null);
          }}
          onBookingCreated={(booking) => {
            console.log('📅 [Services] Booking created:', booking);
            setShowBookingModal(false);
            setSelectedServiceForBooking(null);
          }}
        />
      )}

      {/* Decision Support System (DSS) Modal */}
      {showDSS && (
        <DecisionSupportSystem
          services={filteredServices as any}
          budget={50000}
          location={locationFilter}
          priorities={[selectedCategory]}
          isOpen={showDSS}
          onClose={handleCloseDSS}
          onServiceRecommend={handleServiceRecommend}
        />
      )}
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: Service;
  viewMode: 'grid' | 'list';
  index: number;
  onSelect: (service: Service) => void;
  onMessage: (service: Service) => void;
  onFavorite: (service: Service) => void;
  onBookingRequest: (service: Service) => void;
  onShare?: (service: Service) => void;
}

function ServiceCard({ service, viewMode, index, onSelect, onMessage, onFavorite, onBookingRequest, onShare }: ServiceCardProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-pink-100"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 relative">
            {/* Main Image for List View */}
            <div className="relative">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600';
                }}
              />
              {service.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
            
            {/* Small Gallery Row Below - Only for List View */}
            {(service.gallery && service.gallery.length > 1) || (service.images && service.images.length > 1) ? (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex gap-1 overflow-x-auto">
                  {((service.gallery && service.gallery.length > 1) ? service.gallery.slice(1, 5) : service.images?.slice(1, 5) || []).map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-white shadow-sm">
                      <img
                        src={img}
                        alt={`${service.name} ${idx + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100';
                        }}
                      />
                    </div>
                  ))}
                  {((service.gallery?.length || service.images?.length || 1) > 5) && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-black/60 border border-white shadow-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        +{((service.gallery?.length || service.images?.length || 1) - 4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          
          <div className="md:w-2/3 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                  {service.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                  <span className="text-sm text-gray-500">({service.reviewCount})</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-pink-600">{service.priceRange}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {service.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => onSelect(service)}
                className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-xl hover:bg-pink-700 transition-colors font-medium"
              >
                View Details
              </button>
              <button
                onClick={() => onMessage(service)}
                className="px-4 py-2 border-2 border-pink-600 text-pink-600 rounded-xl hover:bg-pink-50 transition-colors"
                title="Message vendor"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              {service.contactInfo.phone && (
                <button
                  onClick={() => window.open(`tel:${service.contactInfo.phone}`, '_self')}
                  className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors"
                  title="Call vendor"
                >
                  <Phone className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => onFavorite(service)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                title="Add to favorites"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  console.log('📅 Request booking for:', service.name);
                  onBookingRequest(service); // Open booking request modal
                }}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium"
                title="Request booking"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={() => onSelect(service)}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-pink-100 group-hover:scale-105">
        <div className="relative">
          {/* Main Image */}
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600';
            }}
          />
          
          {/* Gallery Preview - Show additional images if available */}
          {(service.gallery && service.gallery.length > 1) || (service.images && service.images.length > 1) && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {((service.gallery && service.gallery.length > 1) ? service.gallery.slice(1, 4) : service.images?.slice(1, 4) || []).map((img, idx) => (
                <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={img}
                    alt={`${service.name} ${idx + 2}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100';
                    }}
                  />
                </div>
              ))}
              {/* Show count if more images available */}
              {((service.gallery?.length || service.images?.length || 1) > 4) && (
                <div className="w-12 h-12 rounded-lg bg-black/60 backdrop-blur-sm border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    +{((service.gallery?.length || service.images?.length || 1) - 3)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {service.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          <div className="absolute top-4 right-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(service);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors"
              title="Add to favorites"
            >
              <Heart className="h-5 w-5 text-gray-600 hover:text-pink-600" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
              {service.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium text-gray-900">{service.rating}</span>
              <span className="text-sm text-gray-500">({service.reviewCount})</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
            {service.name}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{service.location}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {service.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {feature}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-semibold text-pink-600">{service.priceRange}</span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage(service);
                }}
                className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                title="Message vendor"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              {service.contactInfo.phone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${service.contactInfo.phone}`, '_self');
                  }}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Call vendor"
                >
                  <Phone className="h-5 w-5" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(service);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Share service"
                >
                  <Globe className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Service Detail Modal Component
interface ServiceDetailModalProps {
  service: Service | null;
  onClose: () => void;
  onContact: (service: Service) => void;
  onEmail: (service: Service) => void;
  onWebsite: (service: Service) => void;
  onMessage: (service: Service) => void;
  onBookingRequest: (service: Service) => void;
  onOpenGallery: (images: string[], startIndex: number) => void;
}

function ServiceDetailModal({ service, onClose, onContact, onEmail, onWebsite, onMessage, onBookingRequest, onOpenGallery }: ServiceDetailModalProps) {
  if (!service) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-80 object-cover rounded-t-3xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';
              }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            {service.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Featured Vendor
              </div>
            )}
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                  {service.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{service.name}</h2>
                <p className="text-xl text-gray-600 mt-1">by {service.vendorName}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Star className="h-6 w-6 fill-current" />
                  <span className="text-2xl font-bold text-gray-900">{service.rating}</span>
                  <span className="text-gray-500">({service.reviewCount} reviews)</span>
                </div>
                <div className="text-2xl font-bold text-pink-600">{service.priceRange}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{service.location}</span>
              </div>
              <div className={cn(
                'flex items-center gap-2',
                service.availability ? 'text-green-600' : 'text-red-600'
              )}>
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  service.availability ? 'bg-green-500' : 'bg-red-500'
                )} />
                <span>{service.availability ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {((service.gallery && service.gallery.length > 1) || (service.images && service.images.length > 1)) && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Portfolio Gallery 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({(service.gallery?.length || service.images?.length || 1)} photos)
                  </span>
                </h3>
                
                {/* Enhanced Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* All available images */}
                  {((service.gallery && service.gallery.length > 1) ? service.gallery : service.images || []).slice(0, 12).map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group cursor-pointer overflow-hidden rounded-xl"
                      onClick={() => {
                        const images = (service.gallery && service.gallery.length > 1) ? service.gallery : service.images || [service.image];
                        onOpenGallery(images, index);
                      }}
                    >
                      <img
                        src={image}
                        alt={`${service.name} portfolio ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400';
                        }}
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                          View Full Size
                        </div>
                      </div>
                      
                      {/* Image number indicator */}
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Show more button if there are additional images */}
                  {((service.gallery?.length || service.images?.length || 0) > 12) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center"
                      onClick={() => {
                        console.log('📸 View all images for:', service.name);
                      }}
                    >
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-gray-600 mb-1">
                          +{((service.gallery?.length || service.images?.length || 0) - 12)}
                        </div>
                        <div className="text-sm text-gray-500">More Photos</div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Gallery Navigation Hint */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>💡 Click any image to view in full size</span>
                  <span>{service.vendorName}'s Portfolio</span>
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Started with {service.vendorName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => onBookingRequest(service)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg col-span-1 md:col-span-2 lg:col-span-1"
                >
                  <Star className="h-5 w-5" />
                  Request Booking
                </button>
                
                <button
                  onClick={() => onMessage(service)}
                  className="flex items-center justify-center gap-2 bg-pink-600 text-white py-3 px-4 rounded-xl hover:bg-pink-700 transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  Message
                </button>
                
                {service.contactInfo.phone && (
                  <button
                    onClick={() => onContact(service)}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    <Phone className="h-5 w-5" />
                    Call
                  </button>
                )}
                
                {service.contactInfo.email && (
                  <button
                    onClick={() => onEmail(service)}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Mail className="h-5 w-5" />
                    Email
                  </button>
                )}
                
                {service.contactInfo.website && (
                  <button
                    onClick={() => onWebsite(service)}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Globe className="h-5 w-5" />
                    Website
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Services;
