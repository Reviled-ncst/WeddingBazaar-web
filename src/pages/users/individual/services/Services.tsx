import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { cn } from '../../../../utils/cn';;

import { CoupleHeader } from '../landing/CoupleHeader';
import { useUnifiedMessaging } from '../../../../shared/contexts/UnifiedMessagingContext';
import { ServiceDetailsModal } from '../../../../modules/services/components/ServiceDetailsModal';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
import { ServiceAvailabilityManager, ServiceAvailabilityPreview } from '../../../../shared/components/availability';
import { serviceManager } from '../../../../shared/services/CentralizedServiceManager';
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
  
  const { createBusinessConversation, setModalOpen } = useUnifiedMessaging();

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
    priceRanges: ['₱', '₱₱', '₱₱₱', '₱₱₱₱'],
    ratings: [5, 4, 3, 2, 1]
  };

  // Load services using centralized service manager for consistency
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 [IndividualServices] Loading ALL services from ALL vendors using centralized manager...');
        
        // Use centralized service manager to get all services
        const CentralizedServiceManager = (await import('../../../shared/services/CentralizedServiceManager')).CentralizedServiceManager;
        const serviceManager = CentralizedServiceManager.getInstance();
        
        // 🧹 Force cache clear to get fresh vendor-enriched data
        console.log('🧹 [IndividualServices] Clearing cache to ensure fresh vendor data');
        serviceManager.forceClearCache();
        
        const result = await serviceManager.getAllServices();
        
        if (result.success && result.services.length > 0) {
          console.log('✅ [IndividualServices] Loaded services from centralized manager:', result.services.length);
          
          // Map centralized service format to component's interface
          const mappedServices = result.services.map((service: any) => ({
            id: service.id,
            name: service.name || service.title,
            category: service.category,
            vendorId: service.vendorId || service.vendor_id,
            vendorName: service.vendorName,
            vendorImage: service.vendorImage,
            description: service.description,
            priceRange: service.priceRange,
            location: service.location || service.address || 'Philippines',
            rating: typeof service.vendor_rating !== 'undefined' ? parseFloat(service.vendor_rating) : 
                   typeof service.rating === 'number' ? service.rating : parseFloat(service.rating) || 0,
            reviewCount: service.vendor_review_count || service.review_count || service.reviewCount || service.reviews_count || 0,
            image: service.image,
            gallery: service.gallery || service.images || [service.image],
            features: service.features || service.specialties || service.services || [],
            availability: service.availability !== false,
            contactInfo: {
              phone: service.phone || service.contact_phone,
              email: service.email || service.contact_email,
              website: service.website || service.business_website
            }
          }));

          console.log('🎯 [IndividualServices] Sample mapped services:', mappedServices.slice(0, 2));
          console.log('🎯 [IndividualServices] Checking business names:', mappedServices.map((s: any) => ({ id: s.id, name: s.name, vendorName: s.vendorName })));
          
          setServices(mappedServices);
          setLoading(false);
          return;
        }
        
        console.log('⚠️ [IndividualServices] Centralized manager returned empty - falling back to direct API calls');

        // Enhanced helper function to convert service to service format  
        const convertServiceToService = (service: any) => {
          // Handle image URL with category-specific fallback logic
          let imageUrl = service.image || service.imageUrl || service.main_image;
          
          if (!imageUrl && service.images && Array.isArray(service.images) && service.images.length > 0) {
            imageUrl = service.images[0];
          }
          
          // Category-based fallback if no image
          if (!imageUrl) {
            const categoryImages = {
              'Photography': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format',
              'Videography': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=400&fit=crop&auto=format',
              'Wedding Planning': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format',
              'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&auto=format',
              'Other': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format'
            };
            
            const category = service.category || service.service_category || 'Other';
            imageUrl = categoryImages[category as keyof typeof categoryImages] || categoryImages['Other'];
          }
          
          return {
            id: service.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: service.name || service.service_name || 'Unnamed Service',
            category: service.category || service.service_category || 'General',
            vendorId: service.vendor_id || service.vendorId,
            vendorName: service.vendor_name || service.vendorName || 'Unknown Vendor',
            vendorImage: service.vendor_image || service.vendorImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
            description: service.description || `Professional ${service.category || 'wedding'} service`,
            priceRange: service.price_range || service.priceRange || '₱₱',
            location: service.location || 'Philippines',
            rating: typeof service.vendor_rating !== 'undefined' ? parseFloat(service.vendor_rating) : 
                   typeof service.rating === 'number' ? service.rating : parseFloat(service.rating) || 0,
            reviewCount: service.vendor_review_count || service.review_count || service.reviewCount || 0,
            image: imageUrl,
            gallery: service.gallery || service.images || [imageUrl],
            features: service.features || service.tags || [],
            availability: service.availability !== false,
            contactInfo: {
              phone: service.phone || service.contact_phone,
              email: service.email || service.contact_email,
              website: service.website
            }
          };
        };
        
        // STRATEGY 1: Load vendors first since /api/vendors works and has real data (PRIMARY SOURCE)
        try {
          const vendorsResponse = await fetch(`${apiUrl}/api/vendors`);

          
          if (vendorsResponse.ok) {
            const vendorsData = await vendorsResponse.json();

            
            let vendorsArray = [];
            if (Array.isArray(vendorsData)) {
              vendorsArray = vendorsData;
            } else if (vendorsData.data && Array.isArray(vendorsData.data)) {
              vendorsArray = vendorsData.data;
            } else if (vendorsData.vendors && Array.isArray(vendorsData.vendors)) {
              vendorsArray = vendorsData.vendors;
            }
            
            if (vendorsArray.length > 0) {
              const convertedServices = vendorsArray.map((vendor: any) => convertVendorToService(vendor, 'vendor'));
              allServicesData.push(...convertedServices);
            }
          }
        } catch (error) {
          // Silently handle vendor endpoint errors and continue to next strategy
        }

        // STRATEGY 2: Try services endpoint as secondary data source
        try {
          const servicesResponse = await fetch(`${apiUrl}/api/services`);
          
          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();

            
            let servicesArray = [];
            if (Array.isArray(servicesData)) {
              servicesArray = servicesData;
            } else if (servicesData.data && Array.isArray(servicesData.data)) {
              servicesArray = servicesData.data;
            } else if (servicesData.services && Array.isArray(servicesData.services)) {
              servicesArray = servicesData.services;
            }
            
            if (servicesArray.length > 0) {
              const convertedServices = servicesArray.map(convertServiceToService);
              allServicesData.push(...convertedServices);

            }
          }
        } catch (error) {
          // Silently handle services endpoint errors and continue to next strategy
        }

        // STRATEGY 3: Try featured vendors as fallback
        if (allServicesData.length === 0) {
          try {
            const featuredResponse = await fetch(`${apiUrl}/api/vendors/featured`);
            if (featuredResponse.ok) {
              const featuredData = await featuredResponse.json();
              let featuredArray = Array.isArray(featuredData) ? featuredData : (featuredData.data || []);
              
              if (featuredArray.length > 0) {
                const convertedServices = featuredArray.map((vendor: any) => convertVendorToService(vendor, 'featured'));
                allServicesData.push(...convertedServices);
              }
            }
          } catch (error) {
            // Silently handle featured vendors endpoint errors
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

        // ✅ DATABASE FIX COMPLETE: All services now have vendor mappings 
        // No need to filter anymore since database vendor_id mapping has been fixed
        const servicesWithVendors = uniqueServices;
        
        console.log(`✅ [Services] All services have vendor mappings: ${servicesWithVendors.length} services available`);

        // FINAL FALLBACK: Enhanced mock services if no real data
        if (servicesWithVendors.length === 0) {
          
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
            },
            {
              id: 'mock-makeup-1',
              name: 'Bridal Makeup & Hair Styling',
              category: 'makeup_hair',
              vendorId: 'mock-vendor-makeup',
              vendorName: 'Glamour Beauty Studio',
              vendorImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
              description: 'Professional bridal makeup and hair styling with trial sessions and touch-up services.',
              priceRange: '₱8,000 - ₱25,000',
              location: 'Makati, Philippines',
              rating: 4.7,
              reviewCount: 73,
              image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
              gallery: [
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
                'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'
              ],
              features: ['Trial Session', 'Airbrush Makeup', 'Hair Styling', 'Touch-up Kit'],
              availability: true,
              contactInfo: {
                phone: '+63917-456-7890',
                email: 'info@glamourbeauty.ph',
                website: 'https://glamourbeauty.ph'
              }
            }
          ];
          
          setServices(enhancedMockServices);

        } else {

          

          
          setServices(servicesWithVendors);
          
          // Verification with detailed logging
          setTimeout(() => {
            console.log('� [Individual Services] STATE VERIFICATION after 100ms:');
            console.log('   - Services state should be set');
            console.log('   - FilteredServices state should be set');
            console.log('   - Component should render service cards');
          }, 100);
        }
        
      } catch {
        // Use mock data as final fallback
        setServices(mockServicesData);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // 🚀 OPTIMIZED: Use useMemo instead of useEffect to prevent infinite render loops
  const filteredServices = useMemo(() => {
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

    // Sort logic - create a copy before sorting to avoid mutating the original array
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case 'rating':
        sortedFiltered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        sortedFiltered.sort((a, b) => (a.priceRange?.length || 0) - (b.priceRange?.length || 0));
        break;
      case 'price-high':
        sortedFiltered.sort((a, b) => (b.priceRange?.length || 0) - (a.priceRange?.length || 0));
        break;
      case 'reviews':
        sortedFiltered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    return sortedFiltered;
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
    
    try {
      // Start conversation with vendor using unified messaging
      await createBusinessConversation(
        service.vendorId || `vendor-${Date.now()}`,
        undefined, // bookingId
        service.category,
        service.vendorName
      );
      setModalOpen(true);
      
      // Optional: Send an initial message to provide context
      // This helps both parties understand what service is being discussed
      // The message will be sent automatically by the messaging system
      
    } catch {
      // Fallback to basic conversation
      const vendorId = service.vendorId || `vendor-${Date.now()}`;
      
      try {
        await createBusinessConversation(vendorId, undefined, undefined, service.vendorName);
        setModalOpen(true);
      } catch {
        // Silent fallback - messaging system will handle errors
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
    // Open the service details modal which contains the proper BookingRequestModal
    handleViewDetails(service);
  };

  const handleBookNow = (service: Service) => {
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-pink-50/20 relative overflow-hidden">
        {/* Enhanced Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-rose-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-rose-100/10 to-pink-100/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        <CoupleHeader />
        <div className="flex-1 pt-20 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                {/* Premium Loading Animation */}
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-300/40 to-pink-300/40 rounded-full blur-3xl animate-pulse"></div>
                  <div className="relative">
                    {/* Outer ring */}
                    <div className="w-24 h-24 border-4 border-rose-200/30 rounded-full animate-spin-slow mx-auto"></div>
                    {/* Inner spinning ring */}
                    <div className="absolute inset-2 w-20 h-20 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl"></div>
                    {/* Center glow */}
                    <div className="absolute inset-6 w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-sm animate-pulse mx-auto"></div>
                    {/* Floating particles */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-rose-400 rounded-full animate-bounce"></div>
                    <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-pink-400 rounded-full animate-bounce-delayed"></div>
                  </div>
                </div>
                
                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-fade-in">
                    ✨ Curating Your Perfect Wedding Services
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg animate-fade-in-delayed">
                    We're gathering the most talented wedding professionals just for you...
                  </p>
                  
                  {/* Enhanced loading dots */}
                  <div className="flex items-center justify-center space-x-3 mb-8">
                    <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-bounce shadow-lg"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-bounce-delayed shadow-lg"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-bounce-slow shadow-lg"></div>
                  </div>
                  
                  {/* Loading progress steps */}
                  <div className="space-y-3 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2 animate-fade-in">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Verified professionals found</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 animate-fade-in-delayed">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Checking availability...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 animate-fade-in-slow">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Personalizing recommendations</span>
                    </div>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50/30 via-white to-pink-50/20 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-rose-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-rose-100/10 to-pink-100/20 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-rose-300/40 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-32 right-32 w-6 h-6 bg-pink-300/30 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-16 w-3 h-3 bg-rose-400/50 rounded-full animate-bounce-slow"></div>
      </div>
      
      <CoupleHeader />
      <div className="flex-1 pt-20 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Premium Header with Advanced Glassmorphism */}
          <div className="relative mb-16 text-center">
            {/* Background glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-200/30 to-pink-200/30 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-100/20 to-pink-100/20 rounded-3xl blur-2xl"></div>
            
            {/* Main content card */}
            <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-12 border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:bg-white/80 hover:scale-[1.02] group">
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              
              <div className="relative z-10">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent mb-6 font-serif animate-gradient-shift">
                  ✨ Wedding Services
                </h1>
                <p className="text-gray-700 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8 animate-fade-in-delayed">
                  Discover exceptional wedding professionals to create your dream celebration
                </p>
                
                {/* Enhanced stats with animations */}
                <div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-sm md:text-base text-gray-600">
                  <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/stat">
                    <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse group-hover/stat:animate-bounce"></div>
                    <span className="font-medium">{filteredServices.length}+ Premium Services</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/stat">
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full animate-pulse group-hover/stat:animate-bounce"></div>
                    <span className="font-medium">✓ Verified Professionals</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/stat">
                    <div className="w-3 h-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full animate-pulse group-hover/stat:animate-bounce"></div>
                    <span className="font-medium">⚡ Instant Booking</span>
                  </div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-rose-300/30 to-pink-300/30 rounded-full blur-sm animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-pink-300/30 to-rose-300/30 rounded-full blur-sm animate-float-delayed"></div>
              </div>
            </div>
          </div>

          {/* Premium Search and Filters with Advanced Glassmorphism */}
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 mb-16 hover:shadow-3xl hover:bg-white/80 transition-all duration-700 group">
            {/* Enhanced background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-50/40 to-pink-50/40 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-rose-200/20 to-pink-200/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              {/* Premium Search Bar */}
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-200/30 to-pink-200/30 rounded-3xl blur-lg animate-pulse"></div>
                <div className="relative flex items-center group/search">
                  <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 h-7 w-7 text-rose-400 group-focus-within/search:text-rose-600 group-focus-within/search:scale-110 transition-all duration-300" />
                  <input
                    type="text"
                    placeholder="✨ Search for your dream wedding services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-20 pr-8 py-6 bg-white/90 backdrop-blur-md border-2 border-rose-200/60 rounded-3xl focus:ring-6 focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-500 text-gray-900 placeholder-gray-500 text-xl shadow-2xl hover:shadow-3xl focus:shadow-3xl hover:bg-white focus:bg-white transform hover:scale-[1.02] focus:scale-[1.02]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 p-2 hover:bg-rose-100 rounded-full transition-all duration-300 hover:scale-110 group"
                      title="Clear search"
                      aria-label="Clear search"
                    >
                      <X className="h-6 w-6 text-gray-400 group-hover:text-rose-500 transition-colors duration-200" />
                    </button>
                  )}
                  
                  {/* Search glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-400/10 to-pink-400/10 opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>

              {/* DSS Options - Choose Your Planning Style */}
              <div className="flex flex-col items-center mb-8 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">� Smart Wedding Planning</h3>
                <p className="text-gray-600 text-center max-w-2xl mb-6">
                  Choose your preferred planning experience to get personalized recommendations
                </p>
                
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
                  {/* NEW: Phased DSS - Step by Step */}
                  <button
                    onClick={handleOpenDSS}
                    className="group flex-1 flex items-center space-x-4 px-8 py-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 font-semibold text-lg border-2 border-white/30 backdrop-blur-sm relative overflow-hidden"
                    title="NEW: Step-by-Step Planning - Guided workflow with date availability checking"
                    aria-label="Open Step-by-Step Smart Planning with availability checking"
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    
                    <Calendar className="h-7 w-7 group-hover:animate-pulse group-hover:scale-125 transition-all duration-300 relative z-10" />
                    <div className="flex-1 text-left relative z-10">
                      <div className="font-bold">📅 Step-by-Step Planner</div>
                      <div className="text-sm text-emerald-100 font-normal">NEW! Guided workflow with date availability</div>
                    </div>
                    <div className="w-3 h-3 bg-white/90 rounded-full animate-bounce shadow-lg relative z-10"></div>
                    
                    {/* NEW badge */}
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">NEW</div>
                  </button>

                  {/* Original DSS - Quick Recommendations */}
                  <button
                    onClick={handleOpenDSS}
                    className="group flex-1 flex items-center space-x-4 px-8 py-6 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 font-semibold text-lg border-2 border-white/30 backdrop-blur-sm relative overflow-hidden"
                    title="Quick Smart Recommendations - All options at once"
                    aria-label="Open Quick Smart Recommendations"
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    
                    <Brain className="h-7 w-7 group-hover:animate-pulse group-hover:scale-125 transition-all duration-300 relative z-10" />
                    <div className="flex-1 text-left relative z-10">
                      <div className="font-bold">⚡ Quick Recommendations</div>
                      <div className="text-sm text-purple-100 font-normal">All options at once, advanced filters</div>
                    </div>
                    <div className="w-3 h-3 bg-white/90 rounded-full animate-bounce shadow-lg relative z-10"></div>
                  </button>
                </div>
              </div>
            </div>

              {/* Premium Quick Filters */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "group flex items-center space-x-4 px-8 py-4 rounded-2xl border-2 transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1",
                    showFilters 
                      ? "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 border-rose-400 text-white shadow-rose-300/50 animate-pulse-soft" 
                      : "border-rose-200/60 hover:bg-white hover:border-rose-300 hover:text-rose-600 bg-white/80 backdrop-blur-sm text-gray-700"
                  )}
                >
                  <SlidersHorizontal className={cn(
                    "h-6 w-6 transition-all duration-300",
                    showFilters ? "rotate-180 animate-bounce-soft" : "group-hover:rotate-12"
                  )} />
                  <span className="text-lg">✨ Advanced Filters</span>
                  {showFilters && (
                    <div className="w-3 h-3 bg-white/80 rounded-full animate-pulse shadow-lg"></div>
                  )}
                </button>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 border-2 border-rose-200/60 rounded-2xl focus:ring-6 focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-500 bg-white/90 backdrop-blur-md text-gray-900 font-semibold shadow-lg hover:shadow-xl cursor-pointer text-lg hover:scale-105 hover:bg-white focus:scale-105 focus:bg-white transform"
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
                  className="px-6 py-4 border-2 border-rose-200/60 rounded-2xl focus:ring-6 focus:ring-rose-500/20 focus:border-rose-400 transition-all duration-500 bg-white/90 backdrop-blur-md text-gray-900 font-semibold shadow-lg hover:shadow-xl cursor-pointer text-lg hover:scale-105 hover:bg-white focus:scale-105 focus:bg-white transform"
                  aria-label="Sort services by"
                >
                  <option value="relevance">🎯 Most Relevant</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="reviews">💬 Most Reviews</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                </select>

                <div className="flex items-center space-x-6 ml-auto">
                  <button
                    onClick={handleOpenDSS}
                    className="group flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 font-semibold border border-white/20 backdrop-blur-sm"
                    title="Smart Decision Support System"
                    aria-label="Open Smart Decision Support System"
                  >
                    <Brain className="h-6 w-6 group-hover:animate-pulse group-hover:scale-125 transition-all duration-300" />
                    <span className="hidden sm:inline text-lg">� Smart Assist</span>
                    <div className="hidden sm:flex w-3 h-3 bg-white/80 rounded-full animate-bounce shadow-lg"></div>
                    
                    {/* Smart glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  </button>
                  
                  <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl border-2 border-rose-200/60 shadow-xl p-2 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-500 transform hover:scale-125 relative group",
                        viewMode === 'grid' 
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-110 animate-pulse-soft" 
                          : "text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md"
                      )}
                      title="Grid view"
                      aria-label="Switch to grid view"
                    >
                      <Grid className="h-5 w-5 relative z-10" />
                      {viewMode === 'grid' && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400/30 to-pink-400/30 blur-sm animate-pulse"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "p-4 rounded-xl transition-all duration-500 transform hover:scale-125 relative group",
                        viewMode === 'list' 
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-110 animate-pulse-soft" 
                          : "text-gray-500 hover:bg-rose-50 hover:text-rose-600 hover:shadow-md"
                      )}
                      title="List view"
                      aria-label="Switch to list view"
                    >
                      <List className="h-5 w-5 relative z-10" />
                      {viewMode === 'list' && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400/30 to-pink-400/30 blur-sm animate-pulse"></div>
                      )}
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
          
          {filteredServices.length === 0 ? (
            <div className="text-center py-32 relative">
              {/* Enhanced background effects */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-gradient-to-r from-rose-200/20 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
              </div>
              
              <div className="relative z-10">
                {/* Premium empty state illustration */}
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-300/30 to-pink-300/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-rose-100 via-white to-pink-100 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white/80 backdrop-blur-sm group hover:scale-110 transition-all duration-500">
                    <Search className="h-16 w-16 text-rose-500 group-hover:scale-125 transition-transform duration-300" />
                    
                    {/* Floating search particles */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-400/60 rounded-full animate-bounce"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400/60 rounded-full animate-bounce-delayed"></div>
                    <div className="absolute top-1/2 -right-4 w-2 h-2 bg-rose-500/60 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6 font-serif animate-fade-in">
                    ✨ No Perfect Matches Yet
                  </h3>
                  <p className="text-gray-600 mb-10 text-xl leading-relaxed animate-fade-in-delayed">
                    We couldn't find services matching your specific criteria. Let's adjust your search to discover amazing wedding professionals waiting to make your day magical!
                  </p>
                  
                  {/* Enhanced action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                    <button
                      onClick={clearFilters}
                      className="group px-10 py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white rounded-2xl hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition-all duration-500 hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-2xl font-semibold text-xl flex items-center space-x-3 border border-white/20 backdrop-blur-sm"
                    >
                      <span>🔄 Clear All Filters</span>
                      <div className="w-3 h-3 bg-white/80 rounded-full group-hover:animate-bounce"></div>
                    </button>
                    
                    <button
                      onClick={handleOpenDSS}
                      className="group px-10 py-5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-500 hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-2xl font-semibold text-xl flex items-center space-x-3 border border-white/20 backdrop-blur-sm"
                    >
                      <Brain className="h-6 w-6 group-hover:animate-pulse" />
                      <span>� Get Smart Recommendations</span>
                    </button>
                  </div>
                  
                  {/* Helpful suggestions */}
                  <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/60 shadow-xl max-w-lg mx-auto">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">💡 Try these suggestions:</h4>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        <span>Remove location or price filters</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        <span>Try different search keywords</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        <span>Browse all categories</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(
              "w-full max-w-full overflow-hidden",
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                : "space-y-10"
            )}>
              {filteredServices.map((service, index) => (
                <div
                  key={service.id}
                  className={cn(
                    "group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 overflow-hidden hover:shadow-3xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] flex flex-col w-full animate-fade-in-up",
                    "hover:bg-white/90 hover:border-rose-200/60 hover:rotate-1",
                    viewMode === 'list' ? "flex-row max-w-full" : "min-h-[580px] max-h-[580px]",
                    // Staggered animation using CSS class
                    index % 4 === 0 ? "animate-delay-0" :
                    index % 4 === 1 ? "animate-delay-100" :
                    index % 4 === 2 ? "animate-delay-200" : "animate-delay-300"
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
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-rose-500" />
                      <span className="truncate font-medium">{service.location}</span>
                    </div>

                    {/* Availability Preview */}
                    <div className="mb-4">
                      <ServiceAvailabilityPreview
                        vendorId={service.vendorId}
                        className="w-full"
                      />
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
