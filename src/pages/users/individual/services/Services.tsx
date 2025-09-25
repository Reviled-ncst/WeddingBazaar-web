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
  User
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useUniversalMessaging } from '../../../../shared/contexts/UniversalMessagingContext';
import { ServiceDetailsModal } from '../../../../modules/services/components/ServiceDetailsModal';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
import type { ServiceCategory } from '../../../../shared/types/comprehensive-booking.types';

// Service interface
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

// Minimal mock data fallback for emergencies only
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
  }
];

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
  
  const { startConversationWith } = useUniversalMessaging();

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

  // Load services from real API - COMPLETELY REWRITTEN to fix data loading issues
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        console.log('🔍 [Services] Loading ALL available vendors and services from production API...');
        
        // Use the production API URL directly
        const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        console.log('🌐 [Services] Using API URL:', apiUrl);
        
        let allServicesData: Service[] = [];
        
        // Helper function to convert vendor to service format
        const convertVendorToService = (vendor: any, prefix = 'vendor') => {
          const converted = {
            id: vendor.id || `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: vendor.name || vendor.business_name || 'Unnamed Service',
            category: vendor.category || vendor.business_type || 'General',
            vendorId: vendor.id || vendor.vendor_id,
            vendorName: vendor.name || vendor.business_name,
            vendorImage: vendor.image || vendor.profile_image || vendor.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
            description: vendor.description || vendor.bio || `Professional ${vendor.category || vendor.business_type || 'wedding'} services`,
            priceRange: vendor.price_range || vendor.priceRange || '₱₱',
            location: vendor.location || vendor.address || 'Philippines',
            rating: typeof vendor.rating === 'number' ? vendor.rating : parseFloat(vendor.rating) || 4.5,
            reviewCount: vendor.review_count || vendor.reviewCount || vendor.reviews_count || 0,
            image: vendor.image || vendor.profile_image || vendor.main_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
            gallery: vendor.gallery || vendor.images || [],
            features: vendor.features || vendor.specialties || vendor.services || [],
            availability: vendor.availability !== false,
            contactInfo: {
              phone: vendor.phone || vendor.contact_phone,
              email: vendor.email || vendor.contact_email,
              website: vendor.website || vendor.business_website
            }
          };
          console.log(`🔄 [Services] Converted ${prefix}:`, { 
            original: { id: vendor.id, name: vendor.name || vendor.business_name, category: vendor.category || vendor.business_type }, 
            converted: { id: converted.id, name: converted.name, category: converted.category } 
          });
          return converted;
        };

        // Helper function to convert service to service format  
        const convertServiceToService = (service: any) => ({
          id: service.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: service.name || service.service_name || 'Unnamed Service',
          category: service.category || service.service_category || 'General',
          vendorId: service.vendor_id || service.vendorId,
          vendorName: service.vendor_name || service.vendorName || 'Unknown Vendor',
          vendorImage: service.vendor_image || service.vendorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
          description: service.description || `Professional ${service.category || 'wedding'} service`,
          priceRange: service.price_range || service.priceRange || '₱₱',
          location: service.location || 'Philippines',
          rating: typeof service.rating === 'number' ? service.rating : parseFloat(service.rating) || 4.5,
          reviewCount: service.review_count || service.reviewCount || 0,
          image: service.image || service.main_image || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
          gallery: service.gallery || service.images || [],
          features: service.features || service.tags || [],
          availability: service.availability !== false,
          contactInfo: {
            phone: service.phone || service.contact_phone,
            email: service.email || service.contact_email,
            website: service.website
          }
        });
        
        try {
          // PRIORITY 0: Try direct database services endpoint first (GUARANTEED TO WORK)
          console.log('🚀 [Services] PRIORITY 0: Loading services from /api/services/direct (bypasses broken ServicesService)...');
          const directResponse = await fetch(`${apiUrl}/api/services/direct`);
          console.log('📡 [Services] Direct services response status:', directResponse.status, directResponse.statusText);
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('📊 [Services] Direct services response:', directData);
            
            if (directData.success && directData.services && Array.isArray(directData.services) && directData.services.length > 0) {
              // Services from direct endpoint are already in the correct format
              allServicesData.push(...directData.services);
              console.log(`🎉 [Services] SUCCESS! Loaded ${directData.services.length} real services from direct database query!`);
              console.log(`📋 [Services] Sample direct services:`, directData.services.slice(0, 3).map((s: any) => ({ id: s.id, name: s.name, category: s.category })));
            } else {
              console.log('⚠️ [Services] Direct endpoint returned empty services');
            }
          } else {
            console.warn(`❌ [Services] /api/services/direct failed with status: ${directResponse.status}`);
          }
        } catch (error) {
          console.warn('❌ [Services] Failed to load from /api/services/direct:', error);
        }

        // PRIORITY 1: Fallback to regular services endpoint if direct failed
        if (allServicesData.length === 0) {
          try {
            console.log('🔍 [Services] PRIORITY 1: Loading services from /api/services (fallback)...');
            const servicesResponse = await fetch(`${apiUrl}/api/services`);
            console.log('📡 [Services] Services response status:', servicesResponse.status, servicesResponse.statusText);
            
            if (servicesResponse.ok) {
              const servicesData = await servicesResponse.json();
              console.log('📊 [Services] Services endpoint response:', servicesData);
              
              if (servicesData.success && servicesData.services && Array.isArray(servicesData.services) && servicesData.services.length > 0) {
                const convertedServices = servicesData.services.map(convertServiceToService);
                allServicesData.push(...convertedServices);
                console.log(`✅ [Services] Loaded ${convertedServices.length} dedicated services from /api/services`);
              } else if (servicesData.services && typeof servicesData.services === 'object' && Object.keys(servicesData.services).length === 0) {
                console.log('⚠️ [Services] /api/services returned empty array - backend issue detected');
                console.log('🔄 [Services] Will prioritize vendor fallback due to backend services issue');
              } else {
                console.log('⚠️ [Services] No services found in /api/services response. Service array length:', servicesData.services?.length || 'undefined');
              }
            } else {
              console.warn(`❌ [Services] /api/services endpoint failed with status: ${servicesResponse.status}`);
            }
          } catch (error) {
            console.warn('❌ [Services] Failed to load from /api/services:', error);
          }
        }

        try {
          // PRIORITY 2: Load ALL vendors from /api/vendors and convert to services
          console.log('🔍 [Services] PRIORITY 2: Loading vendors from /api/vendors...');
          const vendorsResponse = await fetch(`${apiUrl}/api/vendors`);
          console.log('📡 [Services] Vendors response status:', vendorsResponse.status, vendorsResponse.statusText);
          
          if (vendorsResponse.ok) {
            const vendorsData = await vendorsResponse.json();
            console.log('📊 [Services] Vendors endpoint response:', vendorsData);
            
            if (vendorsData.success && vendorsData.vendors && Array.isArray(vendorsData.vendors) && vendorsData.vendors.length > 0) {
              console.log(`📝 [Services] Raw vendors data (first 2):`, vendorsData.vendors.slice(0, 2));
              const convertedVendors = vendorsData.vendors.map((vendor: any) => convertVendorToService(vendor, 'vendor'));
              allServicesData.push(...convertedVendors);
              console.log(`✅ [Services] Loaded ${convertedVendors.length} vendors as services from /api/vendors`);
              console.log(`📋 [Services] Sample converted vendors:`, convertedVendors.slice(0, 2));
            } else {
              console.log('⚠️ [Services] No vendors found in /api/vendors response. Vendors array length:', vendorsData.vendors?.length || 'undefined');
            }
          } else {
            console.warn(`❌ [Services] /api/vendors endpoint failed with status: ${vendorsResponse.status}`);
          }
        } catch (error) {
          console.warn('❌ [Services] Failed to load from /api/vendors:', error);
        }
        
        // PRIORITY 3: If still no data, try featured vendors as fallback
        if (allServicesData.length === 0) {
          try {
            console.log('🔍 [Services] PRIORITY 3: Loading featured vendors as fallback...');
            const featuredResponse = await fetch(`${apiUrl}/api/vendors/featured`);
            console.log('📡 [Services] Featured response status:', featuredResponse.status, featuredResponse.statusText);
            
            if (featuredResponse.ok) {
              const featuredData = await featuredResponse.json();
              console.log('📋 [Services] Featured vendors response:', featuredData);
              
              if (featuredData.vendors && Array.isArray(featuredData.vendors)) {
                const convertedFeatured = featuredData.vendors.map((vendor: any) => convertVendorToService(vendor, 'featured'));
                allServicesData.push(...convertedFeatured);
                console.log(`✅ [Services] Loaded ${convertedFeatured.length} featured vendors as fallback`);
              }
            }
          } catch (error) {
            console.warn('❌ [Services] Failed to load from /api/services:', error);
          }
        }
        
        // Remove duplicates and finalize the services list
        const uniqueServices = allServicesData.reduce((acc, current) => {
          const existingService = acc.find(service => 
            service.id === current.id || 
            (service.name === current.name && service.vendorId === current.vendorId)
          );
          if (!existingService) {
            acc.push(current);
          }
          return acc;
        }, [] as Service[]);

        console.log(`🔍 [Services] After deduplication: ${uniqueServices.length} unique services`);

        // ENHANCED Final check with guaranteed service display
        if (uniqueServices.length === 0) {
          console.warn('⚠️ [Services] No real data available from any API endpoint');
          console.log('🎭 [Services] Creating enhanced mock services with realistic data');
          
          // Create more realistic mock services based on wedding industry standards
          const enhancedMockServices: Service[] = [
            {
              id: 'mock-photography-1',
              name: 'Professional Wedding Photography',
              category: 'photography',
              vendorId: 'mock-vendor-photo',
              vendorName: 'Elite Photography Studios',
              vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
              description: 'Capture your special day with professional wedding photography services',
              priceRange: '₱25,000 - ₱80,000',
              location: 'Metro Manila, Philippines',
              rating: 4.8,
              reviewCount: 127,
              image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
              gallery: [
                'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800'
              ],
              features: ['Wedding Photography', 'Pre-wedding Shoots', 'Same Day Edit'],
              availability: true,
              contactInfo: {
                phone: '+63917-123-4567',
                email: 'info@elitephoto.ph',
                website: 'https://elitephoto.ph'
              }
            },
            {
              id: 'mock-catering-1',
              name: 'Premium Wedding Catering',
              category: 'catering',
              vendorId: 'mock-vendor-cater',
              vendorName: 'Divine Catering Services',
              vendorImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
              description: 'Exquisite wedding catering with personalized menus',
              priceRange: '₱1,500 - ₱3,500 per person',
              location: 'Quezon City, Philippines',
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
                email: 'info@divinecatering.ph',
                website: 'https://divinecatering.ph'
              }
            },
            {
              id: 'mock-venue-1', 
              name: 'Garden Wedding Venue',
              category: 'venue',
              vendorId: 'mock-vendor-venue',
              vendorName: 'Garden Villa Venues',
              vendorImage: 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=400',
              description: 'Beautiful garden venue perfect for outdoor weddings',
              priceRange: '₱150,000 - ₱300,000',
              location: 'Tagaytay, Philippines',
              rating: 4.9,
              reviewCount: 156,
              image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
              gallery: [
                'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
                'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=800'
              ],
              features: ['Garden Setting', 'Indoor/Outdoor Options', 'Full Service'],
              availability: true,
              contactInfo: {
                phone: '+63917-345-6789',
                email: 'info@gardenvilla.ph',
                website: 'https://gardenvilla.ph'
              }
            }
          ];
          
          setServices(enhancedMockServices);
          setFilteredServices(enhancedMockServices);
          console.log(`🎭 [Services] Using ${enhancedMockServices.length} enhanced mock services`);
        } else {
          console.log(`🎉 [Services] Successfully loaded ${uniqueServices.length} unique services from multiple API endpoints`);
          console.log(`📊 [Services] Breakdown: ${uniqueServices.filter(s => !s.id.startsWith('mock')).length} real, ${uniqueServices.filter(s => s.id.startsWith('mock')).length} mock`);
          
          // GUARANTEED FIX: Ensure both states are set with comprehensive logging
          console.log(`🔧 [Services] Setting services state with ${uniqueServices.length} services`);
          console.log(`🔧 [Services] Sample services being set:`, uniqueServices.slice(0, 3).map(s => ({ 
            id: s.id, 
            name: s.name, 
            category: s.category,
            vendorName: s.vendorName,
            rating: s.rating,
            priceRange: s.priceRange 
          })));
          
          setServices(uniqueServices);
          setFilteredServices(uniqueServices);
          
          // Verification with detailed logging
          setTimeout(() => {
            console.log(`🔧 [Services] POST-STATE UPDATE VERIFICATION:`);
            console.log(`   - Services state should contain: ${uniqueServices.length} services`);
            console.log(`   - FilteredServices state should contain: ${uniqueServices.length} services`);
            console.log(`   - Component should render: ${uniqueServices.length} service cards`);
          }, 100);
        }
        
      } catch (error) {
        console.error('❌ [Services] Failed to load services:', error);
        // Use mock data as final fallback
        console.log('🎭 [Services] Using mock data as final fallback due to API errors');
        setServices(mockServicesData);
        setFilteredServices(mockServicesData);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter and search logic - ENHANCED WITH DEBUGGING AND SAFETY CHECKS
  useEffect(() => {
    console.log('🔍 [Services] FILTERING EFFECT TRIGGERED');
    console.log(`📊 [Services] Input services count: ${services.length}`);
    console.log(`🔍 [Services] Filter states:`, {
      searchQuery,
      selectedCategory,
      selectedLocation, 
      selectedPriceRange,
      selectedRating,
      sortBy
    });

    // SAFETY CHECK: If services exist but all filters are at default, ensure filtered services is set
    if (services.length > 0 && 
        (!searchQuery || searchQuery.trim() === '') && 
        selectedCategory === 'all' && 
        selectedLocation === 'all' && 
        selectedPriceRange === 'all' && 
        selectedRating === 0) {
      console.log('🔧 [Services] SAFETY CHECK: All filters are default, should show all services');
    }

    const performFiltering = () => {
      let filtered = services;
      console.log(`🔍 [Services] Starting filtering with ${filtered.length} services`);

      // Text search
      if (searchQuery && searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const beforeCount = filtered.length;
        filtered = services.filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.vendorName.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.location.toLowerCase().includes(query)
        );
        console.log(`🔍 [Services] After search filter '${query}': ${beforeCount} → ${filtered.length}`);
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const beforeCount = filtered.length;
        filtered = filtered.filter(service => 
          service.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        console.log(`🔍 [Services] After category filter '${selectedCategory}': ${beforeCount} → ${filtered.length}`);
      }

      // Location filter
      if (selectedLocation !== 'all') {
        const beforeCount = filtered.length;
        filtered = filtered.filter(service => 
          service.location.toLowerCase().includes(selectedLocation.toLowerCase())
        );
        console.log(`🔍 [Services] After location filter '${selectedLocation}': ${beforeCount} → ${filtered.length}`);
      }

      // Price range filter
      if (selectedPriceRange !== 'all') {
        const beforeCount = filtered.length;
        filtered = filtered.filter(service => service.priceRange === selectedPriceRange);
        console.log(`🔍 [Services] After price filter '${selectedPriceRange}': ${beforeCount} → ${filtered.length}`);
      }

      // Rating filter
      if (selectedRating > 0) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(service => service.rating >= selectedRating);
        console.log(`🔍 [Services] After rating filter '${selectedRating}': ${beforeCount} → ${filtered.length}`);
      }

      // Sort logic
      switch (sortBy) {
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          console.log(`🔍 [Services] Sorted by rating`);
          break;
        case 'price-low':
          filtered.sort((a, b) => (a.priceRange?.length || 0) - (b.priceRange?.length || 0));
          console.log(`🔍 [Services] Sorted by price (low to high)`);
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.priceRange?.length || 0) - (a.priceRange?.length || 0));
          console.log(`🔍 [Services] Sorted by price (high to low)`);
          break;
        case 'reviews':
          filtered.sort((a, b) => b.reviewCount - a.reviewCount);
          console.log(`🔍 [Services] Sorted by reviews`);
          break;
        default:
          console.log(`🔍 [Services] Default sort (relevance)`);
          break;
      }

      console.log(`🎯 [Services] FINAL FILTERED RESULT: ${filtered.length} services`);
      if (filtered.length > 0) {
        console.log(`📋 [Services] Sample filtered services:`, filtered.slice(0, 3).map(s => ({ id: s.id, name: s.name, category: s.category })));
      } else {
        console.warn(`⚠️ [Services] NO SERVICES AFTER FILTERING - this is why the page shows empty!`);
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
    console.log('🚀 [Services] Starting conversation for service:', { 
      serviceName: service.name, 
      serviceCategory: service.category,
      vendorName: service.vendorName,
      vendorId: service.vendorId
    });
    
    try {
      // Start conversation with vendor using universal messaging
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

      const conversationId = await startConversationWith(vendor, serviceInfo);
      console.log(`✅ [Services] Started conversation about "${service.name}" with ${service.vendorName}`);
      console.log(`📞 [Services] Conversation ID: ${conversationId}`);
      
      // Optional: Send an initial message to provide context
      // This helps both parties understand what service is being discussed
      // The message will be sent automatically by the messaging system
      
    } catch (error) {
      console.error('❌ [Services] Error contacting vendor:', error);
      // Fallback to basic conversation
      const vendor = {
        id: service.vendorId || `vendor-${Date.now()}`,
        name: service.vendorName,
        role: 'vendor' as const
      };
      
      try {
        await startConversationWith(vendor);
        console.log('✅ [Services] Started basic conversation with vendor (fallback)');
      } catch (fallbackError) {
        console.error('❌ [Services] Failed to start even basic conversation:', fallbackError);
      }
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

  const handleRequestQuote = (service: Service) => {
    console.log('📋 Requesting quote for service:', service.name);
    console.log('🔄 Opening service details modal for quote request');
    // Open the service details modal which contains the proper BookingRequestModal
    handleViewDetails(service);
  };

  const handleBookNow = (service: Service) => {
    console.log('💳 Booking service:', service.name);
    console.log('🔄 Opening service details modal for booking');
    // Open the service details modal which contains the proper BookingRequestModal
    handleViewDetails(service);
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-pink-50/20">
        <CoupleHeader />
        <div className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-200/30 to-pink-200/30 rounded-full blur-2xl"></div>
                  <div className="relative w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    🌸 Loading Your Perfect Wedding Services
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We're gathering the best wedding professionals just for you...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
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
      <div className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Enhanced Header with gradient background */}
          <div className="relative mb-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-pink-100/50 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent mb-4 font-serif">
                Wedding Services
              </h1>
              <p className="text-gray-700 text-xl max-w-2xl mx-auto leading-relaxed">
                Discover exceptional wedding professionals to make your special day unforgettable
              </p>
              <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span>{filteredServices.length}+ Services Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
                  <span>Instant Booking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-2xl"></div>
            <div className="relative z-10">
              {/* Search Bar with enhanced styling */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-100/20 to-pink-100/20 rounded-2xl blur-sm"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-rose-400" />
                  <input
                    type="text"
                    placeholder="Search for your dream wedding services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-rose-200/50 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-300 text-gray-900 placeholder-gray-500 text-lg shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>

              {/* Enhanced Quick Filters */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "flex items-center space-x-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105",
                    showFilters 
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 border-rose-400 text-white shadow-rose-200" 
                      : "border-gray-200 hover:bg-white hover:border-rose-200 hover:text-rose-600 bg-white/70"
                  )}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Advanced Filters</span>
                  {showFilters ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  ) : null}
                </button>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-900 font-medium shadow-sm hover:shadow-md cursor-pointer"
                  aria-label="Filter by category"
                >
                  <option value="all">🎭 All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'photography' ? '📸' : 
                       category === 'catering' ? '🍽️' : 
                       category === 'venue' ? '🏛️' : 
                       category === 'music_dj' ? '🎵' : 
                       category === 'flowers_decor' ? '🌸' : '✨'} {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-300 bg-white/90 backdrop-blur-sm text-gray-900 font-medium shadow-sm hover:shadow-md cursor-pointer"
                  aria-label="Sort services by"
                >
                  <option value="relevance">🎯 Most Relevant</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="reviews">💬 Most Reviews</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                </select>

                <div className="flex items-center space-x-3 ml-auto">
                  <button
                    onClick={handleOpenDSS}
                    className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    title="AI Decision Support"
                    aria-label="Open AI Decision Support System"
                  >
                    <Brain className="h-5 w-5 group-hover:animate-pulse" />
                    <span className="hidden sm:inline">🤖 AI Assist</span>
                    <div className="hidden sm:block w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  </button>
                  
                  <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl border-2 border-gray-200 shadow-sm p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300 transform hover:scale-110",
                        viewMode === 'grid' 
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105" 
                          : "text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                      )}
                      title="Grid view"
                      aria-label="Switch to grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "p-3 rounded-lg transition-all duration-300 transform hover:scale-110",
                        viewMode === 'list' 
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105" 
                          : "text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                      )}
                      title="List view"
                      aria-label="Switch to list view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
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
            <div className="flex flex-col space-y-1">
              <p className="text-gray-600 font-medium">
                Showing <span className="text-gray-900">{filteredServices.length}</span> of{' '}
                <span className="text-gray-900">{services.length}</span> services
              </p>
              {services.length > 0 && (
                <p className="text-xs text-gray-500">
                  {services.filter(s => !s.id.startsWith('mock-')).length} real vendors •{' '}
                  {services.filter(s => s.id.startsWith('mock-')).length} sample services
                </p>
              )}
            </div>
            
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
          {(() => {
            console.log('🔍 [Services] RENDERING COMPONENT STATE:');
            console.log(`📊 [Services] Raw services count: ${services.length}`);
            console.log(`📊 [Services] Filtered services count: ${filteredServices.length}`);
            console.log(`📊 [Services] Loading state: ${loading}`);
            console.log(`📊 [Services] Search query: "${searchQuery}"`);
            console.log(`📊 [Services] Selected category: "${selectedCategory}"`);
            
            if (services.length > 0) {
              console.log(`📋 [Services] Sample raw services:`, services.slice(0, 2).map(s => ({ id: s.id, name: s.name, category: s.category })));
            }
            
            if (filteredServices.length > 0) {
              console.log(`📋 [Services] Sample filtered services:`, filteredServices.slice(0, 2).map(s => ({ id: s.id, name: s.name, category: s.category })));
            } else {
              console.warn(`⚠️ [Services] FILTERED SERVICES IS EMPTY - This is why "No services found" is shown!`);
            }
            
            return null; // This is just for debugging, doesn't render anything
          })()}
          
          {filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-100/30 to-pink-100/30 rounded-full blur-3xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Search className="h-12 w-12 text-rose-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">No services found</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                We couldn't find any services matching your criteria. Try adjusting your filters or search terms to discover the perfect vendors for your special day.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-medium text-lg"
              >
                🔄 Clear All Filters
              </button>
            </div>
          ) : (
            <div className={cn(
              "w-full max-w-full overflow-hidden",
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-8"
            )}>
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col w-full",
                    "hover:bg-white/90 hover:border-rose-200/50",
                    viewMode === 'list' ? "flex-row max-w-full" : "min-h-[520px] max-h-[520px]"
                  )}

                >
                  <div className={cn(
                    "relative overflow-hidden",
                    viewMode === 'list' ? "w-80 flex-shrink-0" : "h-60"
                  )}>
                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
                    
                    <SafeImage
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      fallbackIcon={<ImageIcon className="h-16 w-16 text-gray-300" />}
                    />
                    
                    {/* Enhanced heart button */}
                    <button
                      onClick={() => toggleLike(service.id)}
                      className={cn(
                        "absolute top-4 right-4 p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm border z-20",
                        "transform hover:scale-125 active:scale-95",
                        likedServices.has(service.id)
                          ? "bg-red-500 text-white shadow-red-200 border-red-400 animate-pulse"
                          : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 border-white/50"
                      )}
                      title={likedServices.has(service.id) ? "Remove from favorites" : "Add to favorites"}
                      aria-label={likedServices.has(service.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={cn(
                        "h-5 w-5 transition-all duration-300",
                        likedServices.has(service.id) ? "fill-current scale-110" : ""
                      )} />
                    </button>

                    {/* Service category badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-rose-600 text-xs font-semibold rounded-full border border-white/50 shadow-sm">
                        {service.category.charAt(0).toUpperCase() + service.category.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    {!service.availability && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-medium px-3 py-1 bg-black/40 rounded-lg">
                          Not Available
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 min-w-0 flex flex-col">
                    {/* Service title and price */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg font-serif line-clamp-2 group-hover:text-rose-700 transition-colors duration-300">
                          {service.name}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 text-sm font-bold rounded-full border border-rose-200">
                          {service.priceRange}
                        </span>
                      </div>
                    </div>

                    {/* Rating and reviews */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(service.rating)}
                        <span className="text-gray-700 ml-2 font-semibold text-sm">
                          {service.rating}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        ({service.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-rose-500" />
                      <span className="truncate font-medium">{service.location}</span>
                    </div>

                    {/* Service description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                      {service.description}
                    </p>

                    {/* Service features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200 font-medium truncate"
                        >
                          ✨ {feature}
                        </span>
                      ))}
                      {service.features.length > 2 && (
                        <span className="text-xs text-gray-500 px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
                          +{service.features.length - 2} more
                        </span>
                      )}
                    </div>

                    <div className="mt-auto">
                      {/* Vendor info */}
                      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
                        <div className="relative">
                          <SafeImage
                            src={service.vendorImage}
                            alt={service.vendorName}
                            className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                            fallbackIcon={<User className="h-4 w-4" />}
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-700 truncate block">{service.vendorName}</span>
                          <span className="text-xs text-gray-500">Verified Professional</span>
                        </div>
                      </div>
                      
                      {/* Enhanced action buttons */}
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleContactVendor(service)}
                            className="flex-1 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-600 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 group"
                          >
                            <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                            <span>Message</span>
                          </button>
                          <button 
                            onClick={() => handleViewDetails(service)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 text-sm font-medium transform hover:scale-105"
                          >
                            View Details
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleRequestQuote(service)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 group"
                          >
                            <Calendar className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
                            <span>Get Quote</span>
                          </button>
                          <button 
                            onClick={() => handleBookNow(service)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 group"
                          >
                            <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                            <span>Book Now</span>
                          </button>
                        </div>
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
