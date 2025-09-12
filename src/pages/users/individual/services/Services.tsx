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
  User
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useGlobalMessenger } from '../../../../shared/contexts/GlobalMessengerContext';
import { servicesApiService } from '../../../../modules/services/services/servicesApiService';
import type { Service } from '../../../../modules/services/types';
import { ServiceDetailsModal, type Service as ModuleService } from '../../../../modules/services';

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
  
  const { openFloatingChat } = useGlobalMessenger();

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

  // Load services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        console.log('Loading services from API...');
        
        const response = await servicesApiService.getServices({
          limit: 50 // Get a reasonable number of services
        });
        
        console.log('Services API response:', response);
        console.log('Number of services loaded:', response.services?.length || 0);
        
        if (response.services && response.services.length > 0) {
          console.log('🔍 Debug: Raw services from API:', response.services.length);
          console.log('🔍 Debug: First service has gallery:', response.services[0]?.gallery);
          console.log('🔍 Debug: First service full object:', response.services[0]);
          setServices(response.services);
          setFilteredServices(response.services);
          console.log('Services set successfully:', response.services.slice(0, 3)); // Show first 3
        } else {
          console.warn('No services returned from API - empty or failed response');
          // Keep existing services if we already have some (avoid overwriting with empty data)
          if (services.length === 0) {
            setServices([]);
            setFilteredServices([]);
          }
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        // Show error state instead of empty array
        setServices([]);
        setFilteredServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = services;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(service => service.location === selectedLocation);
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading services...</p>
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
      </div>
    </div>
  );
};
