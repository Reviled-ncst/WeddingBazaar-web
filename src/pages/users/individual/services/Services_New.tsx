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
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useUniversalMessaging } from '../../../../shared/contexts/UniversalMessagingContext';

// Service interface
interface Service {
  id: string;
  name: string;
  category: string;
  vendorId: string;
  vendorName: string;
  vendorImage: string;
  description: string;
  priceRange: string;
  location: string;
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

// Guaranteed working mock services for fallback
const FALLBACK_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Elite Wedding Photography',
    category: 'Photography',
    vendorId: 'vendor-1',
    vendorName: 'Elite Photography Studios',
    vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    description: 'Professional wedding photography with cinematic style and artistic flair',
    priceRange: '₱45,000 - ₱120,000',
    location: 'Makati City, Metro Manila',
    rating: 4.9,
    reviewCount: 187,
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800'
    ],
    features: ['Full Day Coverage', 'Same Day Edit', 'Pre-wedding Shoot', 'Digital Gallery'],
    availability: true,
    contactInfo: {
      phone: '+63917-123-4567',
      email: 'hello@elitephoto.ph',
      website: 'https://elitephoto.ph'
    }
  },
  {
    id: 'service-2',
    name: 'Premium Wedding Catering',
    category: 'Catering',
    vendorId: 'vendor-2',
    vendorName: 'Culinary Excellence Co.',
    vendorImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    description: 'Gourmet wedding catering with customizable menus and impeccable service',
    priceRange: '₱1,800 - ₱4,500 per person',
    location: 'Quezon City, Metro Manila',
    rating: 4.7,
    reviewCount: 143,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
    ],
    features: ['Custom Menu Design', 'Professional Service Staff', 'Dietary Accommodations', 'Setup & Cleanup'],
    availability: true,
    contactInfo: {
      phone: '+63917-234-5678',
      email: 'events@culinaryexcellence.ph',
      website: 'https://culinaryexcellence.ph'
    }
  },
  {
    id: 'service-3',
    name: 'Garden Paradise Venue',
    category: 'Venues',
    vendorId: 'vendor-3',
    vendorName: 'Paradise Garden Events',
    vendorImage: 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
    description: 'Breathtaking garden venue perfect for romantic outdoor ceremonies and receptions',
    priceRange: '₱180,000 - ₱350,000',
    location: 'Tagaytay City, Cavite',
    rating: 4.8,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
    ],
    features: ['Garden Ceremony Area', 'Climate-Controlled Reception', 'Bridal Suite', 'Parking for 200 Cars'],
    availability: true,
    contactInfo: {
      phone: '+63917-345-6789',
      email: 'bookings@paradisegarden.ph',
      website: 'https://paradisegarden.ph'
    }
  },
  {
    id: 'service-4',
    name: 'Musical Harmony DJ Services',
    category: 'Music & DJ',
    vendorId: 'vendor-4',
    vendorName: 'Harmony Entertainment',
    vendorImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    description: 'Professional DJ services with state-of-the-art sound equipment and lighting',
    priceRange: '₱25,000 - ₱65,000',
    location: 'Pasig City, Metro Manila',
    rating: 4.6,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
    ],
    features: ['Professional DJ', 'Sound System', 'LED Lighting', 'MC Services'],
    availability: true,
    contactInfo: {
      phone: '+63917-456-7890',
      email: 'bookings@harmonyent.ph',
      website: 'https://harmonyent.ph'
    }
  },
  {
    id: 'service-5',
    name: 'Elegant Floral Designs',
    category: 'Flowers',
    vendorId: 'vendor-5',
    vendorName: 'Bloom & Blossom Co.',
    vendorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    description: 'Stunning floral arrangements and decorations for your dream wedding',
    priceRange: '₱35,000 - ₱95,000',
    location: 'San Juan City, Metro Manila',
    rating: 4.9,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=800',
      'https://images.unsplash.com/photo-1569443693539-175ea9f007e8?w=800'
    ],
    features: ['Bridal Bouquet', 'Ceremony Decorations', 'Reception Centerpieces', 'Floral Arch'],
    availability: true,
    contactInfo: {
      phone: '+63917-567-8901',
      email: 'hello@bloomblossom.ph',
      website: 'https://bloomblossom.ph'
    }
  },
  {
    id: 'service-6',
    name: 'Professional Wedding Planning',
    category: 'Wedding Planning',
    vendorId: 'vendor-6',
    vendorName: 'Dream Day Planners',
    vendorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    description: 'Full-service wedding planning to make your dream day a reality',
    priceRange: '₱75,000 - ₱200,000',
    location: 'Taguig City, Metro Manila',
    rating: 4.8,
    reviewCount: 134,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
    gallery: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
    ],
    features: ['Full Planning Service', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination'],
    availability: true,
    contactInfo: {
      phone: '+63917-678-9012',
      email: 'plan@dreamday.ph',
      website: 'https://dreamday.ph'
    }
  }
];

const CATEGORIES = [
  'All',
  'Photography',
  'Videography', 
  'Catering',
  'Venues',
  'Flowers',
  'Music & DJ',
  'Wedding Planning',
  'Makeup & Hair',
  'Transportation'
];

const LOCATIONS = [
  'All Locations',
  'Metro Manila',
  'Makati City',
  'Quezon City', 
  'Taguig City',
  'Pasig City',
  'Tagaytay City'
];

const PRICE_RANGES = [
  'All Prices',
  'Under ₱25,000',
  '₱25,000 - ₱50,000',
  '₱50,000 - ₱100,000',
  'Over ₱100,000'
];

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [selectedRating, setSelectedRating] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const { startConversationWith } = useUniversalMessaging();

  // Load services with robust API handling
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      console.log('🔍 [Services] Loading services...');

      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        let allServices: Service[] = [];

        // Try loading from multiple endpoints
        const endpoints = [
          `${API_BASE}/api/services/direct`,
          `${API_BASE}/api/services`,
          `${API_BASE}/api/vendors`
        ];

        for (const endpoint of endpoints) {
          try {
            console.log(`🌐 [Services] Trying ${endpoint}...`);
            const response = await fetch(endpoint);
            
            if (response.ok) {
              const data = await response.json();
              console.log(`✅ [Services] ${endpoint} response:`, data);

              if (data.success && data.services && data.services.length > 0) {
                // Convert services
                allServices = data.services.map((service: any): Service => ({
                  id: service.id || `service-${Date.now()}-${Math.random()}`,
                  name: service.name || service.title || 'Wedding Service',
                  category: service.category || 'General',
                  vendorId: service.vendor_id || service.vendorId || 'unknown',
                  vendorName: service.vendor_name || service.vendorName || 'Professional Vendor',
                  vendorImage: service.vendor_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                  description: service.description || 'Professional wedding service',
                  priceRange: service.price_range || service.priceRange || '₱₱',
                  location: service.location || 'Metro Manila',
                  rating: Number(service.rating) || 4.5,
                  reviewCount: Number(service.review_count || service.reviewCount) || 0,
                  image: service.image || service.main_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600',
                  gallery: service.gallery || service.images || [],
                  features: service.features || service.tags || [],
                  availability: service.availability !== false,
                  contactInfo: {
                    phone: service.phone || service.contact_phone,
                    email: service.email || service.contact_email,
                    website: service.website
                  }
                }));
                console.log(`✅ [Services] Found ${allServices.length} services from ${endpoint}`);
                break;
              } else if (data.success && data.vendors && data.vendors.length > 0) {
                // Convert vendors to services
                allServices = data.vendors.map((vendor: any): Service => ({
                  id: vendor.id || `vendor-${Date.now()}-${Math.random()}`,
                  name: vendor.name || vendor.business_name || 'Wedding Service',
                  category: vendor.category || vendor.business_type || 'General',
                  vendorId: vendor.id,
                  vendorName: vendor.name || vendor.business_name,
                  vendorImage: vendor.image || vendor.profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                  description: vendor.description || vendor.bio || 'Professional wedding service',
                  priceRange: vendor.price_range || vendor.priceRange || '₱₱',
                  location: vendor.location || vendor.address || 'Metro Manila',
                  rating: Number(vendor.rating) || 4.5,
                  reviewCount: Number(vendor.review_count || vendor.reviewCount) || 0,
                  image: vendor.image || vendor.profile_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600',
                  gallery: vendor.gallery || vendor.images || [],
                  features: vendor.features || vendor.specialties || [],
                  availability: vendor.availability !== false,
                  contactInfo: {
                    phone: vendor.phone || vendor.contact_phone,
                    email: vendor.email || vendor.contact_email,
                    website: vendor.website || vendor.business_website
                  }
                }));
                console.log(`✅ [Services] Converted ${allServices.length} vendors to services from ${endpoint}`);
                break;
              }
            }
          } catch (error) {
            console.warn(`❌ [Services] Failed to load from ${endpoint}:`, error);
          }
        }

        // Use fallback services if no API data
        if (allServices.length === 0) {
          console.log('🎭 [Services] Using fallback services');
          allServices = FALLBACK_SERVICES;
        }

        setServices(allServices);
        setFilteredServices(allServices);
        console.log(`🎯 [Services] Final loaded services: ${allServices.length}`);

      } catch (error) {
        console.error('❌ [Services] Error loading services:', error);
        setServices(FALLBACK_SERVICES);
        setFilteredServices(FALLBACK_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter services
  useEffect(() => {
    let filtered = services;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.vendorName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => 
        service.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Location filter
    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(service =>
        service.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Price range filter
    if (selectedPriceRange !== 'All Prices') {
      // Simple price range filtering logic
      filtered = filtered.filter(service => {
        const priceText = service.priceRange.toLowerCase();
        switch (selectedPriceRange) {
          case 'Under ₱25,000':
            return priceText.includes('25,000') && !priceText.includes('₱25,000 -');
          case '₱25,000 - ₱50,000':
            return priceText.includes('25,000') || priceText.includes('50,000');
          case '₱50,000 - ₱100,000':
            return priceText.includes('50,000') || priceText.includes('100,000');
          case 'Over ₱100,000':
            return priceText.includes('100,000') && priceText.includes('-');
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(service => service.rating >= selectedRating);
    }

    setFilteredServices(filtered);
    console.log(`🔍 [Services] Filtered: ${filtered.length} services`);
  }, [services, searchQuery, selectedCategory, selectedLocation, selectedPriceRange, selectedRating]);

  const handleContactVendor = async (service: Service) => {
    try {
      const vendor = {
        id: service.vendorId,
        name: service.vendorName,
        role: 'vendor' as const,
        businessName: service.vendorName,
        serviceCategory: service.category
      };

      await startConversationWith(vendor, {
        id: service.id,
        name: service.name,
        category: service.category,
        description: service.description,
        priceRange: service.priceRange,
        location: service.location
      });

      console.log(`✅ [Services] Started conversation with ${service.vendorName}`);
    } catch (error) {
      console.error('❌ [Services] Error starting conversation:', error);
    }
  };

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
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setSelectedPriceRange('All Prices');
    setSelectedRating(0);
    setSearchQuery('');
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CoupleHeader />
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wedding Services</h1>
            <p className="text-gray-600">Discover amazing vendors for your special day</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search services, vendors, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {PRICE_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>

              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Min Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                      className={cn(
                        "p-1",
                        selectedRating >= rating ? "text-yellow-400" : "text-gray-300"
                      )}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Clear Filters
              </button>

              {/* View Mode Toggle */}
              <div className="flex ml-auto gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === 'grid' ? "bg-rose-100 text-rose-600" : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    viewMode === 'list' ? "bg-rose-100 text-rose-600" : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              <AnimatePresence>
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => toggleLike(service.id)}
                          className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            likedServices.has(service.id)
                              ? "bg-rose-500 text-white"
                              : "bg-white/80 text-gray-600 hover:bg-white"
                          )}
                        >
                          <Heart className={cn(
                            "h-4 w-4",
                            likedServices.has(service.id) ? "fill-current" : ""
                          )} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-white/90 text-xs font-medium text-gray-800 rounded-full">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {service.name}
                        </h3>
                        <p className="text-sm text-rose-600 font-medium">
                          {service.vendorName}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(service.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {service.rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({service.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{service.location}</span>
                      </div>

                      <div className="mb-4">
                        <span className="text-lg font-bold text-gray-900">
                          {service.priceRange}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedService(service)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleContactVendor(service)}
                          className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Contact
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Service Details Modal */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedService(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="relative">
                  <img
                    src={selectedService.image}
                    alt={selectedService.name}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() => setSelectedService(null)}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedService.name}
                    </h2>
                    <p className="text-rose-600 font-medium mb-2">
                      {selectedService.vendorName}
                    </p>
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm">
                      {selectedService.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedService.rating)}
                    </div>
                    <span className="font-medium">{selectedService.rating}</span>
                    <span className="text-gray-500">
                      ({selectedService.reviewCount} reviews)
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{selectedService.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedService.location}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Price Range</h4>
                      <p className="text-gray-900 font-medium">{selectedService.priceRange}</p>
                    </div>
                  </div>

                  {selectedService.features.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      {selectedService.contactInfo.phone && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedService.contactInfo.phone}
                        </p>
                      )}
                      {selectedService.contactInfo.email && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedService.contactInfo.email}
                        </p>
                      )}
                      {selectedService.contactInfo.website && (
                        <p className="text-gray-600 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a
                            href={selectedService.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleLike(selectedService.id)}
                      className={cn(
                        "px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2",
                        likedServices.has(selectedService.id)
                          ? "bg-rose-100 text-rose-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      <Heart className={cn(
                        "h-5 w-5",
                        likedServices.has(selectedService.id) ? "fill-current" : ""
                      )} />
                      {likedServices.has(selectedService.id) ? 'Liked' : 'Like'}
                    </button>
                    <button
                      onClick={() => handleContactVendor(selectedService)}
                      className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Start Conversation
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Services;
