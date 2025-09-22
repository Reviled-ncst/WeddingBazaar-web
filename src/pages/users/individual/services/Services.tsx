import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Grid,
  List,
  SlidersHorizontal,
  X,
  MessageCircle,
  ImageIcon,
  User,
  Brain
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useGlobalMessenger } from '../../../../shared/contexts/GlobalMessengerContext';
// Remove mock data imports - using real API instead
// import { servicesApiService } from '../../../../modules/services/services/servicesApiService';
import type { Service } from '../../../../modules/services/types';
import { ServiceDetailsModal, type Service as ModuleService } from '../../../../modules/services';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
// import { dataOptimizationService } from './dss/DataOptimizationService';

interface FilterOptions {
  categories: string[];
  locations: string[];
  priceRanges: string[];
  ratings: number[];
}

// Safe Image Component with error handling and fallbacks
interface SafeImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  fallbackIcon,
  onError
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
    setImageError(false);
  }, []);

  // Reset error state when src changes
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
        {fallbackIcon || <ImageIcon className="h-8 w-8" />}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin"></div>
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
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDSS, setShowDSS] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [optimizationActive, setOptimizationActive] = useState(false);
  
  const { openFloatingChat } = useGlobalMessenger();

  // Monitor connection speed and optimization status
  useEffect(() => {
    const checkConnectionSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            setConnectionSpeed('slow');
            setOptimizationActive(true);
            break;
          case '3g':
            setConnectionSpeed('medium');
            setOptimizationActive(true);
            break;
          case '4g':
          default:
            setConnectionSpeed('fast');
            setOptimizationActive(false);
            break;
        }
      }
    };

    checkConnectionSpeed();
    
    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', checkConnectionSpeed);
      return () => connection.removeEventListener('change', checkConnectionSpeed);
    }
  }, []);

  const filterOptions: FilterOptions = {
    categories: [
      'Photography', 'Videography', 'Catering', 'Venues', 'Flowers', 
      'Music & DJ', 'Decoration', 'Wedding Planning', 'Transportation', 
      'Makeup & Hair', 'Wedding Cakes', 'Invitations', 'Jewelry', 'Attire'
    ],
    locations: [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
    ],
    priceRanges: ['$', '$$', '$$$', '$$$$'],
    ratings: [5, 4, 3, 2, 1]
  };

  // Load services from real API - FIXED to use all available vendors
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading all vendors from production API...');
        
        // Use the production API URL directly
        const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        
        let servicesData: Service[] = [];
        
        try {
          // First try to get ALL vendors from the vendors endpoint
          console.log('🔍 Trying /api/vendors endpoint...');
          const vendorsResponse = await fetch(`${apiUrl}/api/vendors`);
          if (vendorsResponse.ok) {
            const data = await vendorsResponse.json();
            console.log('📊 Vendors endpoint response:', data);
            
            if (data.success && data.vendors && Array.isArray(data.vendors) && data.vendors.length > 0) {
              // Convert vendors to services format
              servicesData = data.vendors.map((vendor: any, index: number) => ({
                id: vendor.id || `vendor-${index}`,
                name: vendor.name || vendor.business_name || 'Unnamed Service',
                category: vendor.category || vendor.business_type || 'General',
                vendorId: vendor.id,
                vendorName: vendor.name || vendor.business_name,
                vendorImage: vendor.image || vendor.profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                description: vendor.description || vendor.bio || `Professional ${vendor.category || vendor.business_type || 'wedding'} services`,
                priceRange: vendor.price_range || vendor.priceRange || '$$',
                location: vendor.location || vendor.address || 'Location Available',
                rating: typeof vendor.rating === 'number' ? vendor.rating : parseFloat(vendor.rating) || 4.5,
                reviewCount: vendor.review_count || vendor.reviewCount || vendor.reviews_count || 0,
                image: vendor.image || vendor.profile_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
                gallery: vendor.gallery || [],
                features: vendor.features || vendor.specialties || [],
                availability: vendor.availability !== false,
                contactInfo: {
                  phone: vendor.phone || vendor.contact_phone,
                  email: vendor.email || vendor.contact_email,
                  website: vendor.website || vendor.business_website
                }
              }));
              console.log(`✅ Successfully loaded ${servicesData.length} vendors from /api/vendors`);
            } else {
              console.log('⚠️ No vendors found in /api/vendors response');
            }
          } else {
            console.warn(`❌ /api/vendors endpoint failed with status: ${vendorsResponse.status}`);
          }
        } catch (error) {
          console.warn('❌ Failed to load from /api/vendors:', error);
        }
        
        // If no vendors found, try services endpoint
        if (servicesData.length === 0) {
          try {
            console.log('🔍 Trying /api/services endpoint as fallback...');
            const servicesResponse = await fetch(`${apiUrl}/api/services`);
            if (servicesResponse.ok) {
              const data = await servicesResponse.json();
              if (data.services && Array.isArray(data.services) && data.services.length > 0) {
                servicesData = data.services;
                console.log(`✅ Loaded ${servicesData.length} services from /api/services`);
              }
            }
          } catch (error) {
            console.warn('❌ Failed to load from /api/services:', error);
          }
        }
        
        // If still no data, fallback to featured vendors
        if (servicesData.length === 0) {
          try {
            console.log('🔍 Trying /api/vendors/featured as final fallback...');
            const featuredResponse = await fetch(`${apiUrl}/api/vendors/featured`);
            if (featuredResponse.ok) {
              const vendorData = await featuredResponse.json();
              console.log('� Featured vendors response:', vendorData);
              
              if (vendorData.vendors && Array.isArray(vendorData.vendors)) {
                // Convert vendors to services format
                servicesData = vendorData.vendors.map((vendor: any, index: number) => ({
                  id: vendor.id || `vendor-${index}`,
                  name: vendor.name || vendor.business_name || 'Unnamed Service',
                  category: vendor.category || vendor.business_type || 'General',
                  vendorId: vendor.id,
                  vendorName: vendor.name || vendor.business_name,
                  vendorImage: vendor.image || vendor.profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                  description: vendor.description || vendor.bio || `Professional ${vendor.category || vendor.business_type || 'wedding'} services`,
                  priceRange: vendor.price_range || vendor.priceRange || '$$',
                  location: vendor.location || vendor.address || 'Location Available',
                  rating: typeof vendor.rating === 'number' ? vendor.rating : parseFloat(vendor.rating) || 4.5,
                  reviewCount: vendor.review_count || vendor.reviewCount || vendor.reviews_count || 0,
                  image: vendor.image || vendor.profile_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
                  gallery: vendor.gallery || [],
                  features: vendor.features || vendor.specialties || [],
                  availability: vendor.availability !== false,
                  contactInfo: {
                    phone: vendor.phone || vendor.contact_phone,
                    email: vendor.email || vendor.contact_email,
                    website: vendor.website || vendor.business_website
                  }
                }));
                console.log(`✅ Loaded ${servicesData.length} featured vendors as fallback`);
              }
            }
          } catch (error) {
            console.error('❌ Failed to load featured vendors:', error);
          }
        }
        
        // Final check
        if (servicesData.length === 0) {
          console.warn('⚠️ No real data available from any API endpoint');
          setServices([]);
          setFilteredServices([]);
        } else {
          console.log(`🎉 Successfully loaded ${servicesData.length} services from production API`);
          setServices(servicesData);
          setFilteredServices(servicesData);
        }
        
      } catch (error) {
        console.error('❌ Failed to load services:', error);
        setServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter and search logic - FIXED to remove mock dependencies
  useEffect(() => {
    const performFiltering = () => {
      let filtered = services;

      // Text search
      if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        filtered = services.filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.vendorName.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.location.toLowerCase().includes(query)
        );
      }

      // Category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(service => 
          service.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      // Location filter
      if (selectedLocation !== 'all') {
        filtered = filtered.filter(service => 
          service.location.toLowerCase().includes(selectedLocation.toLowerCase())
        );
      }

      // Price range filter
      if (selectedPriceRange !== 'all') {
        filtered = filtered.filter(service => service.priceRange === selectedPriceRange);
      }

      // Rating filter
      if (selectedRating > 0) {
        filtered = filtered.filter(service => service.rating >= selectedRating);
      }

      // Sort logic
      switch (sortBy) {
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'price-low':
          filtered.sort((a, b) => (a.priceRange?.length || 0) - (b.priceRange?.length || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.priceRange?.length || 0) - (a.priceRange?.length || 0));
          break;
        case 'reviews':
          filtered.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        default:
          // relevance - no sorting change
          break;
      }

      setFilteredServices(filtered);
    };

    // Debounce the filtering for search queries
    const timeoutId = setTimeout(performFiltering, searchQuery ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [services, searchQuery, selectedCategory, selectedLocation, selectedPriceRange, selectedRating, sortBy]);

  const toggleLike = (serviceId: string) => {
    setLikedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedPriceRange('all');
    setSelectedRating(0);
    setSearchQuery('');
  };

  // Convert API service to module service format
  const convertToModuleService = (service: Service): ModuleService => {
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      vendorId: service.vendorId,
      vendorName: service.vendorName,
      vendorImage: service.vendorImage,
      description: service.description,
      priceRange: service.priceRange,
      location: service.location,
      rating: service.rating,
      reviewCount: service.reviewCount,
      image: service.image,
      gallery: service.gallery, // Make sure to include the gallery property
      features: service.features || [],
      availability: service.availability ?? true,
      contactInfo: {
        phone: service.contactInfo?.phone,
        email: service.contactInfo?.email,
        website: service.contactInfo?.website
      }
    };
  };

  const handleContactVendor = async (service: Service) => {
    console.log('handleContactVendor called', { 
      service: service.name, 
      vendor: service.vendorName,
      vendorId: service.vendorId,
      realVendorId: service.vendorId // This is now the real vendor ID from the database
    });
    
    try {
      // Open the floating chat with real vendor info
      await openFloatingChat({ 
        name: service.vendorName, 
        service: service.name,
        vendorId: service.vendorId // Real vendor ID from database
      });
      
      console.log('Floating chat opened successfully with real vendor ID:', service.vendorId);
    } catch (error) {
      console.error('Error contacting vendor:', error);
      // Still show floating chat as fallback
      await openFloatingChat({ 
        name: service.vendorName, 
        service: service.name,
        vendorId: service.vendorId
      });
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedService(null);
  };

  const handleOpenDSS = () => {
    setShowDSS(true);
  };

  const handleCloseDSS = () => {
    setShowDSS(false);
  };

  const handleServiceRecommend = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      handleViewDetails(service);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoupleHeader />
        <div className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">
                  Loading services from production API...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CoupleHeader />
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 font-serif">Wedding Services</h1>
            <p className="text-gray-600 text-lg">Find the perfect services for your special day</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services, vendors, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200",
                  showFilters 
                    ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm" 
                    : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium">Filters</span>
              </button>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white text-gray-900"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white text-gray-900"
                aria-label="Sort services by"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex items-center space-x-2 ml-auto">
                <button
                  onClick={handleOpenDSS}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm"
                  title="AI Decision Support"
                  aria-label="Open AI Decision Support System"
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">AI Assist</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === 'grid' 
                      ? "bg-rose-100 text-rose-700 shadow-sm" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                  title="Grid view"
                  aria-label="Switch to grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === 'list' 
                      ? "bg-rose-100 text-rose-700 shadow-sm" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  )}
                  title="List view"
                  aria-label="Switch to list view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" id="location-label">
                      Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white text-gray-900"
                      aria-labelledby="location-label"
                    >
                      <option value="all">All Locations</option>
                      {filterOptions.locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" id="price-label">
                      Price Range
                    </label>
                    <select
                      value={selectedPriceRange}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white text-gray-900"
                      aria-labelledby="price-label"
                    >
                      <option value="all">All Prices</option>
                      {filterOptions.priceRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" id="rating-label">
                      Minimum Rating
                    </label>
                    <select
                      value={selectedRating}
                      onChange={(e) => setSelectedRating(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white text-gray-900"
                      aria-labelledby="rating-label"
                    >
                      <option value={0}>Any Rating</option>
                      {filterOptions.ratings.map(rating => (
                        <option key={rating} value={rating}>{rating}+ Stars</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                  <span>Clear all filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600 font-medium">
              Showing <span className="text-gray-900">{filteredServices.length}</span> of{' '}
              <span className="text-gray-900">{services.length}</span> services
            </p>
            
            {/* Connection Speed & Optimization Indicator */}
            {optimizationActive && (
              <div className="flex items-center space-x-2 text-sm">
                <div className={cn(
                  "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium",
                  connectionSpeed === 'slow' ? "bg-red-100 text-red-700" :
                  connectionSpeed === 'medium' ? "bg-yellow-100 text-yellow-700" :
                  "bg-green-100 text-green-700"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    connectionSpeed === 'slow' ? "bg-red-400" :
                    connectionSpeed === 'medium' ? "bg-yellow-400" :
                    "bg-green-400"
                  )}></div>
                  <span>
                    {connectionSpeed === 'slow' ? 'Slow Connection - Optimized Loading' :
                     connectionSpeed === 'medium' ? 'Medium Speed - Optimized' :
                     'Fast Connection'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Services Grid/List */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-serif">No services found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find the perfect services for your wedding
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 hover:scale-105 shadow-md"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={cn(
              "w-full max-w-full overflow-hidden",
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-6"
            )}>
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col w-full",
                    viewMode === 'list' ? "flex-row max-w-full" : "min-h-[480px] max-h-[480px]"
                  )}
                >
                  <div className={cn(
                    "relative",
                    viewMode === 'list' ? "w-72 flex-shrink-0" : "h-52"
                  )}>
                    <SafeImage
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full"
                      fallbackIcon={<ImageIcon className="h-12 w-12" />}
                    />
                    <button
                      onClick={() => toggleLike(service.id)}
                      className={cn(
                        "absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-sm",
                        likedServices.has(service.id)
                          ? "bg-red-500 text-white shadow-red-200"
                          : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:scale-110"
                      )}
                      title={likedServices.has(service.id) ? "Remove from favorites" : "Add to favorites"}
                      aria-label={likedServices.has(service.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        likedServices.has(service.id) ? "fill-current scale-110" : ""
                      )} />
                    </button>
                    {!service.availability && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-medium px-3 py-1 bg-black/40 rounded-lg">
                          Not Available
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm font-serif line-clamp-1">
                          {service.name}
                        </h3>
                        <p className="text-xs text-rose-600 font-medium truncate">{service.category}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">{service.priceRange}</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2 text-xs">
                      <div className="flex items-center space-x-1">
                        {renderStars(service.rating)}
                        <span className="text-gray-600 ml-1 font-medium truncate">
                          {service.rating} ({service.reviewCount})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>

                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed flex-1">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-full border border-gray-200 truncate"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-100">
                        <SafeImage
                          src={service.vendorImage}
                          alt={service.vendorName}
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          fallbackIcon={<User className="h-3 w-3" />}
                        />
                        <span className="text-xs text-gray-600 truncate flex-1">{service.vendorName}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleContactVendor(service)}
                          className="flex-1 px-2 py-1 border border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-200 text-xs flex items-center justify-center space-x-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Contact</span>
                        </button>
                        <button 
                          onClick={() => handleViewDetails(service)}
                          className="flex-1 px-2 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 text-xs"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Details Modal */}
        {selectedService && (
          <ServiceDetailsModal
            service={convertToModuleService(selectedService)}
            isOpen={showDetailsModal}
            isLiked={likedServices.has(selectedService.id)}
            onClose={closeDetailsModal}
            onContact={(service) => {
              // Convert back to API service format for handleContactVendor
              const apiService: Service = {
                ...selectedService,
                vendorId: service.vendorId || selectedService.vendorId
              };
              handleContactVendor(apiService);
            }}
            onToggleLike={toggleLike}
          />
        )}

        {/* Decision Support System (DSS) Modal */}
        {showDSS && (
          <DecisionSupportSystem
            isOpen={showDSS}
            onClose={handleCloseDSS}
            services={filteredServices}
            onServiceRecommend={handleServiceRecommend}
            budget={50000}
            location={selectedLocation !== 'all' ? selectedLocation : ''}
            guestCount={100}
            priorities={selectedCategory !== 'all' ? [selectedCategory] : []}
          />
        )}
      </div>
    </div>
  );
};
