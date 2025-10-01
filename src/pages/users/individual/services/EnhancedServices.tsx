import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Grid,
  List,
  X,
  MessageCircle,
  Calendar,
  CreditCard,
  ImageIcon,
  SlidersHorizontal,
  Brain,
  User,
  Navigation
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

import { CoupleHeader } from '../landing/CoupleHeader';
import { useUniversalMessaging } from '../../../../shared/contexts/UniversalMessagingContext';
import { ServiceDetailsModal } from '../../../../modules/services/components/ServiceDetailsModal';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
import { LocationSearch } from '../../../../shared/components/location/LocationSearch';
import { ServiceLocationMap } from './components/ServiceLocationMap';
import { calculateDistance } from '../../../../shared/utils/geocoding';
import type { ServiceCategory } from '../../../../shared/types/comprehensive-booking.types';
import type { PhilippineLocation } from '../../../../utils/geolocation';

// Service interface with coordinates for location-based filtering
interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  description: string;
  priceRange: string;
  location: string;
  coordinates?: { lat: number; lng: number }; // Added for distance calculations
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  features: string[];
  availability: boolean;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

// ModuleService type for internal processing
interface ModuleService extends Service {
  // Additional properties if needed for internal use
}

// Enhanced mock data with coordinates for demonstration
const mockServicesData: Service[] = [
  {
    id: 'mock-1',
    name: 'Sample Wedding Photography',
    category: 'photography',
    vendorId: 'mock-vendor-1',
    vendorName: 'Sample Photography Studio',
    vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    description: 'Professional wedding photography services',
    priceRange: '₱25,000 - ₱80,000',
    location: 'Metro Manila, Philippines',
    coordinates: { lat: 14.5995, lng: 120.9842 }, // Manila coordinates
    rating: 4.8,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'
    ],
    features: ['Wedding Photography', 'Pre-wedding Shoots'],
    availability: true,
    contactInfo: {
      phone: '+63917-123-4567',
      email: 'info@sample.ph',
      website: 'https://sample.ph'
    }
  },
  {
    id: 'mock-2',
    name: 'Elegant Catering Services',
    category: 'catering',
    vendorId: 'mock-vendor-2',
    vendorName: 'Elegant Catering Co.',
    vendorImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    description: 'Premium wedding catering with personalized menus',
    priceRange: '₱1,500 - ₱3,500 per person',
    location: 'Quezon City, Philippines',
    coordinates: { lat: 14.6760, lng: 121.0437 }, // Quezon City coordinates
    rating: 4.6,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800'
    ],
    features: ['Custom Menus', 'Professional Service', 'Dietary Options'],
    availability: true,
    contactInfo: {
      phone: '+63917-234-5678',
      email: 'info@elegantcatering.ph',
      website: 'https://elegantcatering.ph'
    }
  }
];

interface FilterOptions {
  categories: string[];
  priceRanges: string[];
  ratings: number[];
}

interface ServiceCardProps {
  service: Service;
  userLocation?: { lat: number; lng: number } | null;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onViewDetails: (service: Service) => void;
  onContact: (service: Service) => void;
}

// Enhanced Service Card with distance display
const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  userLocation,
  isLiked,
  onToggleLike,
  onViewDetails,
  onContact
}) => {
  // Calculate distance if user location and service coordinates are available
  const distance = userLocation && service.coordinates 
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        service.coordinates.lat,
        service.coordinates.lng
      )
    : null;

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

  return (
    <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/60 p-6 hover:shadow-2xl hover:bg-white/80 transition-all duration-500 hover:scale-[1.02]">
      {/* Service Image */}
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {/* Like Button */}
        <button
          onClick={() => onToggleLike(service.id)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isLiked ? "text-rose-500 fill-rose-500" : "text-gray-400"
            )}
          />
        </button>
        
        {/* Distance Badge */}
        {distance && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {distance.toFixed(1)} km away
          </div>
        )}
      </div>

      {/* Service Details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
          <p className="text-sm text-gray-600">{service.vendorName}</p>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2">{service.description}</p>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 flex-shrink-0 text-rose-500 mr-2" />
          <span className="truncate">{service.location}</span>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(service.rating)}
            </div>
            <span className="text-sm font-medium text-gray-900">{service.rating}</span>
            <span className="text-sm text-gray-500">({service.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Price Range */}
        <div className="text-lg font-semibold text-rose-600">{service.priceRange}</div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onViewDetails(service)}
            className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
          >
            View Details
          </button>
          <button
            onClick={() => onContact(service)}
            className="px-4 py-2 border border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const EnhancedServices: React.FC = () => {
  // Basic state
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDSS, setShowDSS] = useState(false);
  
  // Location-based state (Phase 2)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState(25); // km
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLocationData, setSelectedLocationData] = useState<PhilippineLocation | null>(null);
  const [showNearMeOnly, setShowNearMeOnly] = useState(false);
  
  const { startConversationWith } = useUniversalMessaging();

  const filterOptions: FilterOptions = {
    categories: [
      'Photography', 'Videography', 'Catering', 'Venues', 'Flowers', 
      'Music & DJ', 'Decoration', 'Wedding Planning', 'Transportation', 
      'Makeup & Hair', 'Wedding Cakes', 'Invitations', 'Jewelry', 'Attire'
    ],
    priceRanges: ['₱', '₱₱', '₱₱₱', '₱₱₱₱'],
    ratings: [5, 4, 3, 2, 1]
  };

  // Phase 2: Geolocation functions
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          console.log('✅ User location detected:', location);
        },
        (error) => {
          console.log('❌ Location access denied:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      console.log('❌ Geolocation not supported');
    }
  }, []);

  // Distance-based filtering function
  const filterServicesByDistance = useCallback((services: Service[]) => {
    if (!userLocation || !showNearMeOnly) return services;
    
    return services.filter(service => {
      if (!service.coordinates) return true; // Include services without coordinates
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        service.coordinates.lat,
        service.coordinates.lng
      );
      return distance <= searchRadius;
    });
  }, [userLocation, searchRadius, showNearMeOnly]);

  // Load services (simplified for demo)
  useEffect(() => {
    const loadServices = () => {
      setLoading(true);
      
      // Use mock data for demonstration
      setTimeout(() => {
        setServices(mockServicesData);
        setFilteredServices(mockServicesData);
        setLoading(false);
      }, 1000);
    };

    loadServices();
  }, []);

  // Enhanced filtering with distance support
  useEffect(() => {
    let filtered = services;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(service =>
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

    // Location-based filtering (Phase 1 & 2)
    if (selectedLocation.trim()) {
      filtered = filtered.filter(service => 
        service.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Distance-based filtering (Phase 2)
    filtered = filterServicesByDistance(filtered);

    // Price range filter
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(service => service.priceRange.includes(selectedPriceRange));
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
      case 'distance':
        if (userLocation) {
          filtered.sort((a, b) => {
            const distanceA = a.coordinates ? calculateDistance(
              userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng
            ) : Infinity;
            const distanceB = b.coordinates ? calculateDistance(
              userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng
            ) : Infinity;
            return distanceA - distanceB;
          });
        }
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    setFilteredServices(filtered);
  }, [services, searchQuery, selectedCategory, selectedLocation, selectedPriceRange, selectedRating, sortBy, filterServicesByDistance]);

  // Event handlers
  const handleLocationSelect = useCallback((locationData: PhilippineLocation) => {
    setSelectedLocationData(locationData);
    setSelectedLocation(locationData.fullName);
    
    // If location has coordinates, convert them to our format for more precise filtering
    if (locationData.coordinates) {
      setUserLocation({
        lat: locationData.coordinates.latitude,
        lng: locationData.coordinates.longitude
      });
    }
  }, []);

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
    setSelectedLocation('');
    setSelectedLocationData(null);
    setSelectedPriceRange('all');
    setSelectedRating(0);
    setSearchQuery('');
    setShowNearMeOnly(false);
  };

  const handleContactVendor = async (service: Service) => {
    try {
      const vendor = {
        id: service.vendorId,
        name: service.vendorName,
        role: 'vendor' as const,
        businessName: service.vendorName,
        serviceCategory: service.category
      };

      const serviceInfo = {
        id: service.id,
        name: service.name,
        category: service.category,
        description: service.description,
        priceRange: service.priceRange,
        location: service.location
      };

      await startConversationWith(vendor, serviceInfo);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const convertToModuleService = (service: Service): ModuleService => {
    return { ...service };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-pink-50/20">
        <CoupleHeader />
        <div className="flex-1 pt-20 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50/30 via-white to-pink-50/20">
      <CoupleHeader />
      <div className="flex-1 pt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Wedding Services{userLocation && showNearMeOnly ? ' Near You' : ''}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect vendors for your special day with location-aware search and filtering
            </p>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 mb-8">
            
            {/* Search Bar with Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search services, vendors, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                />
              </div>
              
              {/* Phase 1: Enhanced Location Search */}
              <div className="relative">
                <LocationSearch
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search locations or find services near you..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Phase 2: Location Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Get Current Location Button */}
              <button
                onClick={getCurrentLocation}
                className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                <span>Find Near Me</span>
              </button>

              {/* Show User Location Status */}
              {userLocation && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Location detected</span>
                </div>
              )}

              {/* Near Me Toggle */}
              {userLocation && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showNearMeOnly}
                    onChange={(e) => setShowNearMeOnly(e.target.checked)}
                    className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-sm text-gray-700">Show only nearby services</span>
                </label>
              )}

              {/* Radius Control */}
              {userLocation && showNearMeOnly && (
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Within:</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 min-w-[50px]">{searchRadius} km</span>
                </div>
              )}
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="all">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>

              {/* Price Range Filter */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="all">All Prices</option>
                {filterOptions.priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value={0}>Any Rating</option>
                {filterOptions.ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}+ Stars</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                {userLocation && <option value="distance">Nearest First</option>}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-50 rounded-lg"
            >
              <X className="h-4 w-4" />
              <span>Clear all filters</span>
            </button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col space-y-1">
              <p className="text-gray-600 font-medium">
                Showing <span className="text-gray-900">{filteredServices.length}</span> of{' '}
                <span className="text-gray-900">{services.length}</span> services
                {userLocation && showNearMeOnly && (
                  <span className="text-rose-600"> within {searchRadius}km</span>
                )}
              </p>
            </div>

            {/* View Mode Toggle - Phase 3: Added Map View */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid' ? "bg-rose-500 text-white" : "text-gray-600 hover:bg-gray-100"
                )}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list' ? "bg-rose-500 text-white" : "text-gray-600 hover:bg-gray-100"
                )}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'map' ? "bg-rose-500 text-white" : "text-gray-600 hover:bg-gray-100"
                )}
                title="Map View"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Services Content - Grid, List, or Map View */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms
                {userLocation && showNearMeOnly && (
                  <span> or increase the search radius</span>
                )}
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'map' ? (
            // Phase 3: Map View
            <div className="space-y-6">
              <ServiceLocationMap
                services={filteredServices}
                userLocation={userLocation}
                onServiceSelect={(serviceId) => {
                  const service = filteredServices.find(s => s.id === serviceId);
                  if (service) handleViewDetails(service);
                }}
                className="h-[600px] w-full rounded-xl shadow-lg"
              />
              
              {/* Services List Below Map */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/60">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Services on Map ({filteredServices.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.slice(0, 6).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg hover:bg-white transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(service)}
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{service.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{service.vendorName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.floor(service.rating) 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">{service.rating}</span>
                          {userLocation && service.coordinates && (
                            <span className="text-xs text-rose-600">
                              {calculateDistance(
                                userLocation.lat,
                                userLocation.lng,
                                service.coordinates.lat,
                                service.coordinates.lng
                              ).toFixed(1)}km
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredServices.length > 6 && (
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    And {filteredServices.length - 6} more services shown on the map
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Grid and List Views
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            )}>
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  userLocation={userLocation}
                  isLiked={likedServices.has(service.id)}
                  onToggleLike={toggleLike}
                  onViewDetails={handleViewDetails}
                  onContact={handleContactVendor}
                />
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
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedService(null);
            }}
            onContact={(service) => {
              const apiService: Service = { ...selectedService };
              handleContactVendor(apiService);
            }}
            onToggleLike={toggleLike}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedServices;
