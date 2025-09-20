import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, MapPin, Award, Calendar, Filter, SortAsc, RefreshCcw } from 'lucide-react';
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
}

interface VendorCardProps {
  vendor: FeaturedVendor;
  onViewDetails: (vendor: FeaturedVendor) => void;
}

// Enhanced helper function for vendor images
const getVendorImage = (category: string, id: string): string => {
  const imageCollections: { [key: string]: string[] } = {
    'Photography': [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=400&fit=crop&auto=format'
    ],
    'Wedding Planning': [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=500&h=400&fit=crop&auto=format'
    ],
    'DJ': [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=400&fit=crop&auto=format'
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

// Enhanced vendor card component
const VendorCard: React.FC<VendorCardProps> = ({ vendor, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="group bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      {/* Image Container */}
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
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {vendor.verified && (
            <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Verified
            </span>
          )}
          {vendor.badges?.map((badge, index) => (
            <span key={index} className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              {badge}
            </span>
          ))}
        </div>
        
        {/* Favorite Button */}
        <button
          title="Add to favorites"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
        >
          <Heart className={`h-4 w-4 transition-colors duration-200 ${
            isFavorited ? 'text-red-500 fill-current' : 'text-gray-600 group-hover:text-red-500'
          }`} />
        </button>
        
        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
              <span className="text-sm opacity-90">({vendor.reviewCount})</span>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
              {vendor.priceRange}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-rose-600 transition-colors duration-200">
              {vendor.name}
            </h3>
            <p className="text-gray-600 text-sm font-medium">{vendor.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Starting at</p>
            <p className="font-bold text-gray-900">{vendor.startingPrice}</p>
          </div>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          {vendor.location}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {vendor.description}
        </p>
        
        {/* Experience & Response Time */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {vendor.experience} years exp.
          </div>
          {vendor.responseTime && (
            <div>Responds in {vendor.responseTime}</div>
          )}
        </div>
        
        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-4">
          {vendor.specialties.slice(0, 2).map((specialty, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
              {specialty}
            </span>
          ))}
          {vendor.specialties.length > 2 && (
            <span className="text-gray-400 text-xs">+{vendor.specialties.length - 2} more</span>
          )}
        </div>
        
        {/* Action Button */}
        <button
          onClick={() => onViewDetails(vendor)}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export const FeaturedVendors: React.FC = () => {
  const [vendors, setVendors] = useState<FeaturedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Enhanced data fetching with retry logic and caching
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

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const endpoints = [
        `${apiBaseUrl}/api/vendors/featured`,
        'https://weddingbazaar-web.onrender.com/api/vendors/featured'
      ];
      
      let vendorData: FeaturedVendor[] = [];
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const result = await response.json();
            const rawVendors = result.success ? result.data : result.vendors || result;
            
            if (Array.isArray(rawVendors) && rawVendors.length > 0) {
              vendorData = rawVendors.map((vendor: any, index: number) => ({
                id: vendor.id || `vendor-${Date.now()}-${index}`,
                name: vendor.name || `Premium Vendor ${index + 1}`,
                category: vendor.category || 'Wedding Services',
                location: vendor.location || ['Los Angeles, CA', 'New York, NY', 'Miami, FL'][index % 3],
                rating: Math.max(1, Math.min(5, vendor.rating || 4.5)),
                reviewCount: vendor.reviewCount || Math.floor(Math.random() * 150) + 25,
                description: vendor.description || 'Professional wedding services with exceptional quality.',
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
                bookingCount: Math.floor(Math.random() * 200) + 50
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
      
      // Fallback to sample data if API fails
      if (vendorData.length === 0) {
        vendorData = generateFallbackVendors();
      }
      
      setVendors(vendorData);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Unable to load vendors. Showing sample data.');
      setVendors(generateFallbackVendors());
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // Fallback vendor data
  const generateFallbackVendors = (): FeaturedVendor[] => [
    {
      id: 'fallback-1',
      name: 'Elite Photography Studio',
      category: 'Photography',
      location: 'Los Angeles, CA',
      rating: 4.9,
      reviewCount: 127,
      description: 'Award-winning wedding photography with a cinematic approach to capturing your special moments.',
      image: getVendorImage('Photography', '1'),
      startingPrice: '$2,500',
      priceRange: '$$$',
      experience: 8,
      specialties: ['Cinematic Photography', 'Destination Weddings', 'Engagement Sessions'],
      verified: true,
      badges: ['Top Rated', 'Award Winner'],
      responseTime: '2 hours'
    },
    {
      id: 'fallback-2',
      name: 'Divine Catering & Events',
      category: 'Catering',
      location: 'New York, NY',
      rating: 4.8,
      reviewCount: 203,
      description: 'Luxury wedding catering with farm-to-table ingredients and customizable menus.',
      image: getVendorImage('other', '2'),
      startingPrice: '$85/person',
      priceRange: '$$$$',
      experience: 12,
      specialties: ['Farm-to-Table', 'Custom Menus', 'Dietary Accommodations'],
      verified: true,
      badges: ['Eco-Friendly'],
      responseTime: '4 hours'
    }
  ];

  // Enhanced filtering and sorting
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors;
    
    if (selectedCategory !== 'all') {
      filtered = vendors.filter(vendor => 
        vendor.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'price':
          const priceA = parseInt(a.startingPrice.replace(/[^0-9]/g, ''));
          const priceB = parseInt(b.startingPrice.replace(/[^0-9]/g, ''));
          return priceA - priceB;
        default:
          return 0;
      }
    });
  }, [vendors, selectedCategory, sortBy]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(vendors.map(v => v.category)));
    return ['all', ...uniqueCategories];
  }, [vendors]);

  const handleViewDetails = (vendor: FeaturedVendor) => {
    console.log('Viewing details for:', vendor.name);
    // Store vendor details in sessionStorage for the services page
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
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-rose-200/50 shadow-lg mb-6">
            <Star className="h-5 w-5 text-rose-500 mr-2" />
            <span className="text-rose-600 font-semibold">
              {vendors.length} Premium Vendors Available
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
        
        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              title="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <select
              title="Sort vendors"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'experience')}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="rating">Sort by Rating</option>
              <option value="experience">Sort by Experience</option>
              <option value="price">Sort by Price</option>
            </select>
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
            <p className="text-gray-500 text-lg">No vendors found for the selected category.</p>
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
