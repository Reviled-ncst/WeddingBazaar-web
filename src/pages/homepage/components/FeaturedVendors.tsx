import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, MapPin, Calendar, Filter, SortAsc, RefreshCcw, Search, Zap, TrendingUp, Shield, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeaturedVendor {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  startingPrice: string;
  priceRange: string;
  experience: number;
  specialties: string[];
  portfolioUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  verified: boolean;
  badges?: string[];
  responseTime?: string;
  bookingCount?: number;
  featured?: boolean;
  trending?: boolean;
  priceCategory?: 'budget' | 'mid' | 'luxury';
  phone?: string;
  email?: string;
  availableSlots?: number;
}

interface VendorCardProps {
  vendor: FeaturedVendor;
  onViewDetails: (vendor: FeaturedVendor) => void;
  isLoading?: boolean;
}

interface FilterState {
  category: string;
  priceRange: string;
  rating: number;
  verified: boolean;
  location: string;
}

// Enhanced helper function for vendor images with fallback
const getVendorImage = (category: string, id: string): string => {
  const imageCollections: { [key: string]: string[] } = {
    'Photography': [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop&auto=format'
    ],
    'Wedding Planning': [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop&auto=format'
    ],
    'DJ': [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&h=400&fit=crop&auto=format'
    ],
    'Catering': [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1555244162-803834f70033?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=500&h=400&fit=crop&auto=format'
    ],
    'other': [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=500&h=400&fit=crop&auto=format'
    ]
  };
  
  const categoryImages = imageCollections[category] || imageCollections['other'];
  const index = parseInt(id.slice(-1)) || 0;
  return categoryImages[index % categoryImages.length];
};

// Enhanced vendor card component with modern UI
const VendorCard: React.FC<VendorCardProps> = ({ vendor, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div 
      className="group bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={() => onViewDetails(vendor)}
    >
      {/* Enhanced Image Container */}
      <div className="relative h-64 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        )}
        <img
          src={vendor.image}
          alt={vendor.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = getVendorImage(vendor.category, vendor.id);
          }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Status Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {vendor.verified && (
            <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
              <Shield className="h-3 w-3 mr-1" />
              Verified Pro
            </span>
          )}
          {vendor.featured && (
            <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </span>
          )}
          {vendor.trending && (
            <span className="bg-rose-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </span>
          )}
          {vendor.badges?.map((badge, index) => (
            <span key={index} className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {badge}
            </span>
          ))}
        </div>
        
        {/* Enhanced Favorite Button */}
        <button
          title="Add to favorites"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group/fav"
        >
          <Heart className={`h-4 w-4 transition-all duration-200 ${
            isFavorited ? 'text-red-500 fill-current scale-110' : 'text-gray-600 group-hover/fav:text-red-500 group-hover/fav:scale-110'
          }`} />
        </button>
        
        {/* Bottom Rating & Category */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
              <span className="text-sm opacity-90">({vendor.reviewCount})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {vendor.priceRange}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                {vendor.category}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Content */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-rose-600 transition-colors duration-200 line-clamp-1">
              {vendor.name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {vendor.location}
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-sm text-gray-500">Starting at</p>
            <p className="font-bold text-gray-900">{vendor.startingPrice}</p>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {vendor.description}
        </p>
        
        {/* Enhanced Experience & Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {vendor.experience} years exp.
            </div>
            {vendor.responseTime && (
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Responds in {vendor.responseTime}
              </div>
            )}
          </div>
          {vendor.bookingCount && (
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {vendor.bookingCount} bookings
            </div>
          )}
        </div>
        
        {/* Enhanced Specialties */}
        <div className="flex flex-wrap gap-1">
          {vendor.specialties.slice(0, 2).map((specialty, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
              {specialty}
            </span>
          ))}
          {vendor.specialties.length > 2 && (
            <span className="text-gray-400 text-xs font-medium">+{vendor.specialties.length - 2} more</span>
          )}
        </div>
        
        {/* Enhanced Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(vendor);
          }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform group-hover:scale-105"
        >
          View Details & Contact
        </button>
      </div>
    </div>
  );
};

export const FeaturedVendors: React.FC = () => {
  const [vendors, setVendors] = useState<FeaturedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    rating: 0,
    verified: false,
    location: 'all'
  });
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience' | 'trending'>('rating');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Enhanced data fetching with retry logic, caching, and fallback
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache (5 minutes validity)
      const cachedData = localStorage.getItem('featured_vendors_cache');
      const cacheTime = localStorage.getItem('featured_vendors_timestamp');
      const now = Date.now();
      
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
        console.log('✅ Using cached vendor data');
        setVendors(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const endpoints = [
        `${apiBaseUrl}/api/vendors/featured`,
        'https://weddingbazaar-web.onrender.com/api/vendors/featured'
      ];
      
      let vendorData: FeaturedVendor[] = [];
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const result = await response.json();
            const rawVendors = result.success ? result.vendors : result.vendors || result;
            
            if (Array.isArray(rawVendors) && rawVendors.length > 0) {
              vendorData = rawVendors.map((vendor: any, index: number) => ({
                id: vendor.id || `vendor-${Date.now()}-${index}`,
                name: vendor.name || `Premium Vendor ${index + 1}`,
                category: vendor.category || 'Wedding Services',
                location: vendor.location || ['Los Angeles, CA', 'New York, NY', 'Miami, FL', 'Chicago, IL'][index % 4],
                rating: Math.max(1, Math.min(5, vendor.rating || 4.5)),
                reviewCount: vendor.reviewCount || Math.floor(Math.random() * 150) + 25,
                description: vendor.description || 'Professional wedding services with exceptional quality and attention to detail.',
                image: vendor.image?.includes('placeholder') ? getVendorImage(vendor.category, vendor.id) : vendor.image || getVendorImage(vendor.category, vendor.id),
                startingPrice: vendor.startingPrice || `$${(1000 + index * 500)}`,
                priceRange: vendor.priceRange || ['$$', '$$$', '$$$$'][Math.floor(Math.random() * 3)],
                experience: vendor.experience || Math.floor(Math.random() * 12) + 3,
                specialties: vendor.specialties || [
                  `Premium ${vendor.category || 'Wedding'} Services`,
                  'Destination Weddings',
                  'Custom Packages'
                ],
                portfolioUrl: vendor.portfolioUrl,
                instagramUrl: vendor.instagramUrl,
                websiteUrl: vendor.websiteUrl,
                verified: vendor.verified !== false,
                badges: vendor.rating > 4.7 ? ['Top Rated'] : undefined,
                responseTime: ['2 hours', '4 hours', '1 day'][Math.floor(Math.random() * 3)],
                bookingCount: Math.floor(Math.random() * 200) + 50,
                featured: index < 3,
                trending: vendor.rating > 4.6 && index % 3 === 0
              }));
              
              // Cache successful result
              localStorage.setItem('featured_vendors_cache', JSON.stringify(vendorData));
              localStorage.setItem('featured_vendors_timestamp', now.toString());
              break;
            }
          }
        } catch (err) {
          console.warn(`Endpoint ${endpoint} failed:`, err);
          continue;
        }
      }
      
      // Fallback to enhanced sample data if API fails
      if (vendorData.length === 0) {
        vendorData = generateEnhancedFallbackVendors();
      }
      
      setVendors(vendorData);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Unable to load vendors. Showing sample data.');
      setVendors(generateEnhancedFallbackVendors());
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fallback vendor data
  const generateEnhancedFallbackVendors = (): FeaturedVendor[] => [
    {
      id: 'fallback-1',
      name: 'Elite Photography Studio',
      category: 'Photography',
      location: 'Los Angeles, CA',
      rating: 4.9,
      reviewCount: 127,
      description: 'Award-winning wedding photography with a cinematic approach to capturing your special moments.',
      image: getVendorImage('Photography', '1'),
      startingPrice: '₱135,000',
      priceRange: '$$$',
      experience: 8,
      specialties: ['Cinematic Photography', 'Destination Weddings', 'Engagement Sessions'],
      verified: true,
      badges: ['Top Rated', 'Award Winner'],
      responseTime: '2 hours',
      bookingCount: 156,
      featured: true,
      trending: true
    },
    {
      id: 'fallback-2',
      name: 'Divine Catering & Events',
      category: 'Catering',
      location: 'New York, NY',
      rating: 4.8,
      reviewCount: 203,
      description: 'Luxury wedding catering with farm-to-table ingredients and customizable menus.',
      image: getVendorImage('Catering', '2'),
      startingPrice: '₱4,600/person',
      priceRange: '$$$$',
      experience: 12,
      specialties: ['Farm-to-Table', 'Custom Menus', 'Dietary Accommodations'],
      verified: true,
      badges: ['Eco-Friendly'],
      responseTime: '4 hours',
      bookingCount: 89,
      featured: true
    },
    {
      id: 'fallback-3',
      name: 'Harmony Wedding Planners',
      category: 'Wedding Planning',
      location: 'Chicago, IL',
      rating: 4.7,
      reviewCount: 94,
      description: 'Full-service wedding planning with personalized attention to every detail.',
      image: getVendorImage('Wedding Planning', '3'),
      startingPrice: '₱189,000',
      priceRange: '$$$',
      experience: 6,
      specialties: ['Full Planning', 'Day-of Coordination', 'Destination Weddings'],
      verified: true,
      responseTime: '1 hour',
      bookingCount: 67,
      featured: true,
      trending: true
    },
    {
      id: 'fallback-4',
      name: 'Rhythm & Beats DJ Services',
      category: 'DJ',
      location: 'Miami, FL',
      rating: 4.6,
      reviewCount: 78,
      description: 'Professional DJ services with top-quality sound equipment and lighting.',
      image: getVendorImage('DJ', '4'),
      startingPrice: '₱65,000',
      priceRange: '$$',
      experience: 5,
      specialties: ['Wedding Receptions', 'Ceremony Music', 'Lighting'],
      verified: true,
      responseTime: '6 hours',
      bookingCount: 134,
      trending: true
    }
  ];

  // Enhanced filtering and sorting logic
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors;
    
    // Text search
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        vendor.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(vendor => 
        vendor.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(vendor => vendor.priceRange === filters.priceRange);
    }
    
    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(vendor => vendor.rating >= filters.rating);
    }
    
    // Verified filter
    if (filters.verified) {
      filtered = filtered.filter(vendor => vendor.verified);
    }
    
    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(vendor => 
        vendor.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'price':
          const priceA = parseInt(a.startingPrice.replace(/[^0-9]/g, '')) || 0;
          const priceB = parseInt(b.startingPrice.replace(/[^0-9]/g, '')) || 0;
          return priceA - priceB;
        case 'trending':
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [vendors, searchTerm, filters, sortBy]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(vendors.map(v => v.category)));
    return ['all', ...uniqueCategories];
  }, [vendors]);

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(vendors.map(v => v.location.split(',')[1]?.trim() || v.location)));
    return ['all', ...uniqueLocations];
  }, [vendors]);

  const priceRanges = ['all', '$', '$$', '$$$', '$$$$'];

  const handleViewDetails = (vendor: FeaturedVendor) => {
    console.log('Viewing details for:', vendor.name);
    sessionStorage.setItem('selectedVendor', JSON.stringify(vendor));
    navigate('/individual/services');
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchVendors();
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-rose-200/50 shadow-lg mb-6">
              <div className="animate-spin mr-3">
                <RefreshCcw className="h-5 w-5 text-rose-500" />
              </div>
              <span className="text-rose-600 font-semibold">Loading Premium Vendors</span>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-4">
              Featured Vendors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discovering our top-rated professionals for your special day...
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl animate-pulse">
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="vendors" className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-300 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-rose-200/50 shadow-lg mb-6">
            <Star className="h-5 w-5 text-rose-500 mr-2" />
            <span className="text-rose-600 font-semibold">
              {filteredAndSortedVendors.length} Premium Vendors Available
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Featured Vendors
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our <span className="text-rose-600 font-semibold">top-rated professionals</span> ready to make your wedding dreams come true
          </p>
          
          {error && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">{error}</p>
              {retryCount < 3 && (
                <button
                  onClick={handleRetry}
                  className="mt-2 text-yellow-600 hover:text-yellow-800 font-medium text-sm underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced Search and Filters */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative max-w-2xl w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors, categories, or specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-lg"
              />
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                title="Filter by category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              title="Filter by price range"
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {priceRanges.map(range => (
                <option key={range} value={range}>
                  {range === 'all' ? 'All Price Ranges' : range}
                </option>
              ))}
            </select>
            
            <select
              title="Filter by location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <select
                title="Sort vendors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'experience' | 'trending')}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="price">Sort by Price</option>
                <option value="trending">Sort by Trending</option>
              </select>
            </div>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-gray-700">Verified Only</span>
            </label>
          </div>
        </div>
        
        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredAndSortedVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
        
        {filteredAndSortedVendors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  category: 'all',
                  priceRange: 'all',
                  rating: 0,
                  verified: false,
                  location: 'all'
                });
              }}
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Call-to-Action */}
        <div className="text-center">
          <button
            onClick={() => navigate('/individual/services')}
            className="group px-12 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white font-bold rounded-full text-lg hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full" />
            <div className="relative z-10 flex items-center">
              <span>Discover All Vendors</span>
              <Star className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 skew-x-12" />
          </button>
        </div>
      </div>
    </section>
  );
};
