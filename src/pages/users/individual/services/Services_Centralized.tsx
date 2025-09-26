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
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useUniversalMessaging } from '../../../../shared/contexts/UniversalMessagingContext';
import { serviceManager, SERVICE_CATEGORIES } from '../../../../shared/services/CentralizedServiceManager';

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
  
  const { startConversation } = useUniversalMessaging();

  // Load services using centralized service manager
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      console.log('🔄 [Services] Loading services with centralized manager...');
      
      const filters: ServiceFilters = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        featured: featuredOnly || undefined,
        rating: ratingFilter || undefined,
        limit: 50
      };

      try {
        const result = await serviceManager.getAllServices(filters);
        
        if (result.success && result.services.length > 0) {
          console.log('✅ [Services] Loaded services from centralized manager:', result.services.length);
          setServices(result.services);
        } else {
          console.log('⚠️ [Services] No real services found in database');
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
      window.open(`mailto:${service.contactInfo.email}?subject=Wedding Service Inquiry - ${service.name}`, '_blank');
    }
  };

  const handleVisitWebsite = (service: Service) => {
    if (service.contactInfo.website) {
      window.open(service.contactInfo.website, '_blank');
    }
  };

  const handleMessageVendor = (service: Service) => {
    startConversation(service.vendorId, service.vendorName, service.name);
  };

  const getAvailableLocations = () => {
    const locations = Array.from(new Set(services.map(s => s.location)));
    return locations.slice(0, 8); // Limit to top locations
  };

  const categories = ['All', ...SERVICE_CATEGORIES.map(cat => cat.name)];

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
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Services Coming Soon</h3>
                  <p className="text-gray-600 mb-6">
                    Our vendors are currently setting up their services. <br/>
                    Check back soon to discover amazing wedding professionals!
                  </p>
                  <div className="bg-pink-50 rounded-xl p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-pink-900 mb-2">For Vendors:</h4>
                    <p className="text-pink-700 text-sm">
                      Ready to showcase your services? Contact us to get started with your service listings.
                    </p>
                  </div>
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
            >
              {filteredServices.map((service, index) => (
                <ServiceCard 
                  key={service.id}
                  service={service}
                  viewMode={viewMode}
                  index={index}
                  onSelect={handleServiceSelect}
                  onMessage={handleMessageVendor}
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
      />
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
}

function ServiceCard({ service, viewMode, index, onSelect, onMessage }: ServiceCardProps) {
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
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-64 md:h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600';
              }}
            />
            {service.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Featured
              </div>
            )}
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
              >
                <MessageCircle className="h-5 w-5" />
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
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600';
            }}
          />
          {service.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          <div className="absolute top-4 right-4">
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors">
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMessage(service);
              }}
              className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
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
}

function ServiceDetailModal({ service, onClose, onContact, onEmail, onWebsite, onMessage }: ServiceDetailModalProps) {
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
                target.src = 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=800';
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
            
            {service.gallery && service.gallery.length > 1 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {service.gallery.slice(1, 7).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${service.name} gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-pink-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Vendor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
