import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Grid,
  List,
  SlidersHorizontal,
  X,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { CoupleHeader } from '../users/individual/landing/CoupleHeader';
import { useUniversalMessaging } from '../../shared/contexts/UniversalMessagingContext';
import { ServicesApiService, type ApiService as Service } from '../../services/api/servicesApiService';
import { ServiceDetailsModal, type Service as ModuleService } from '../../modules/services';
import type { ServiceCategory } from '../../shared/types/comprehensive-booking.types';

interface FilterOptions {
  categories: string[];
  locations: string[];
  priceRanges: string[];
  ratings: number[];
}

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
  
  const { startConversationWith } = useUniversalMessaging();

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
    priceRanges: ['₱', '₱₱', '₱₱₱', '₱₱₱₱'],
    ratings: [5, 4, 3, 2, 1]
  };

  // Load services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        console.log('Loading services from API...');
        
        const response = await ServicesApiService.getServices({
          limit: 50 // Get a reasonable number of services
        });
        
        console.log('Services API response:', response);
        console.log('Number of services loaded:', response.services?.length || 0);
        
        if (response.services && response.services.length > 0) {
          setServices(response.services);
          setFilteredServices(response.services);
          console.log('Services set successfully:', response.services.slice(0, 3)); // Show first 3
        } else {
          console.warn('No services returned from API');
          setServices([]);
          setFilteredServices([]);
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
        filtered.sort((a, b) => a.priceRange.length - b.priceRange.length);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.priceRange.length - a.priceRange.length);
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
      category: service.category as ServiceCategory,
      vendorId: service.vendorId,
      vendorName: service.vendorName,
      vendorImage: service.vendorImage,
      description: service.description,
      priceRange: service.priceRange,
      location: service.location,
      rating: service.rating,
      reviewCount: service.reviewCount,
      image: service.image,
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
      // Start a conversation with the vendor using the universal messaging system
      await startConversationWith(service.vendorId, {
        vendorName: service.vendorName,
        serviceName: service.name,
        serviceCategory: service.category
      });
      
      console.log('Conversation started successfully with vendor ID:', service.vendorId);
    } catch (error) {
      console.error('Error contacting vendor:', error);
      // Fallback: try to start conversation anyway
      await startConversationWith(service.vendorId, {
        vendorName: service.vendorName,
        serviceName: service.name,
        serviceCategory: service.category
      });
    }
  };

  const handleContactVendorWrapper = (service: any) => {
    // Ensure vendorId is present for the contact function
    if (service.vendorId) {
      handleContactVendor(service);
    } else {
      console.warn('Cannot contact vendor: vendorId is missing');
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
      <div className="min-h-screen bg-gray-50 pt-20">
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
    <div className="min-h-screen flex flex-col">
      <CoupleHeader />
      <div className="flex-1 bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wedding Services</h1>
          <p className="text-gray-600">Find the perfect services for your special day</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services, vendors, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
                showFilters ? "bg-rose-50 border-rose-200 text-rose-700" : "border-gray-300 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid' ? "bg-rose-100 text-rose-700" : "text-gray-500 hover:bg-gray-100"
                )}
                title="Grid view"
                aria-label="Switch to grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list' ? "bg-rose-100 text-rose-700" : "text-gray-500 hover:bg-gray-100"
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
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" id="location-label">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    aria-labelledby="location-label"
                  >
                    <option value="all">All Locations</option>
                    {filterOptions.locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" id="price-label">Price Range</label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    aria-labelledby="price-label"
                  >
                    <option value="all">All Prices</option>
                    {filterOptions.priceRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" id="rating-label">Minimum Rating</label>
                  <select
                    value={selectedRating}
                    onChange={(e) => setSelectedRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear all filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>

        {/* Services Grid/List */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          )}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={cn(
                  "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
                  viewMode === 'list' ? "flex" : ""
                )}
              >
                <div className={cn(
                  "relative",
                  viewMode === 'list' ? "w-64 flex-shrink-0" : "h-48"
                )}>
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleLike(service.id)}
                    className={cn(
                      "absolute top-3 right-3 p-2 rounded-full transition-colors",
                      likedServices.has(service.id)
                        ? "bg-red-500 text-white"
                        : "bg-white/90 text-gray-600 hover:bg-white"
                    )}
                    title={likedServices.has(service.id) ? "Remove from favorites" : "Add to favorites"}
                    aria-label={likedServices.has(service.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={cn(
                      "h-4 w-4",
                      likedServices.has(service.id) ? "fill-current" : ""
                    )} />
                  </button>
                  {!service.availability && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium">Not Available</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-rose-600 font-medium">{service.category}</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{service.priceRange}</span>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(service.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {service.rating} ({service.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{service.features.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {service.vendorImage && (
                        <img
                          src={service.vendorImage}
                          alt={service.vendorName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm text-gray-600">{service.vendorName}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleContactVendor(service)}
                        className="px-3 py-1.5 border border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors text-sm flex items-center space-x-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Contact</span>
                      </button>
                      <button 
                        onClick={() => handleViewDetails(service)}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
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
            handleContactVendorWrapper(apiService);
          }}
          onToggleLike={toggleLike}
        />
      )}
    </div>
  );
};
