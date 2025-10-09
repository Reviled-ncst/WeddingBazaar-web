import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  SlidersHorizontal,
  Brain,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { useUnifiedMessaging } from '../../../../shared/contexts/UnifiedMessagingContext';
import { serviceManager, SERVICE_CATEGORIES } from '../../../../shared/services/CentralizedServiceManager';
import { BookingRequestModal } from '../../../../modules/services/components/BookingRequestModal';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
import { PhasedDecisionSupportSystem } from './dss/PhasedDecisionSupportSystem';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { ServiceCard } from './components/ServiceCard';
import type { ServiceCategory } from '../../../../shared/types/comprehensive-booking.types';
import type { Service as BookingService } from '../../../../modules/services/types';

// Helper function to combine all image sources into a comprehensive gallery
const getAllServiceImages = (service: any): string[] => {
  const images: string[] = [];
  
  // Add primary image first
  if (service.image) {
    images.push(service.image);
  }
  
  // Add images array (if it's an array)
  if (service.images && Array.isArray(service.images)) {
    images.push(...service.images);
  } else if (service.images && typeof service.images === 'string') {
    // Handle case where images might be a JSON string
    try {
      const parsed = JSON.parse(service.images);
      if (Array.isArray(parsed)) {
        images.push(...parsed);
      }
    } catch {
      // If not JSON, treat as single image
      images.push(service.images);
    }
  }
  
  // Add gallery array
  if (service.gallery && Array.isArray(service.gallery)) {
    images.push(...service.gallery);
  }
  
  // Remove duplicates and filter out invalid URLs
  const uniqueImages = [...new Set(images)].filter(img => 
    img && typeof img === 'string' && img.trim() !== ''
  );
  
  console.log('🖼️ Combined images for', service.name, ':', {
    primary: service.image,
    images: service.images,
    gallery: service.gallery,
    combined: uniqueImages
  });
  
  return uniqueImages;
};

// Helper function to convert Service to BookingService format
const convertToBookingService = (service: Service): BookingService => {
  // Map string category to ServiceCategory
  const categoryMap: Record<string, ServiceCategory> = {
    'Photography': 'photography',
    'Videography': 'videography',
    'Catering': 'catering',
    'Venue': 'venue',
    'Music & DJ': 'music_dj',
    'Flowers & Decor': 'flowers_decor',
    'Wedding Planning': 'wedding_planning',
    'Transportation': 'transportation',
    'Makeup & Hair': 'makeup_hair',
    'Wedding Cake': 'wedding_cake',
    'Officiant': 'officiant',
    'Entertainment': 'entertainment',
    'Lighting': 'lighting',
    'Security': 'security',
    'Other': 'other'
  };

  const mappedCategory = categoryMap[service.category] || 'other';

  const allImages = getAllServiceImages(service);
  
  return {
    id: service.id,
    vendorId: service.vendorId || service.vendor_id,
    name: service.name,
    category: mappedCategory,
    description: service.description,
    basePrice: service.price,
    priceRange: service.priceRange,
    image: allImages[0] || service.image,
    gallery: allImages,
    features: service.features || [],
    availability: service.availability,
    location: service.location,
    rating: service.rating,
    reviewCount: service.reviewCount,
    vendorName: service.vendorName,
    vendorImage: service.vendorImage,
    contactInfo: service.contactInfo
  };
};

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
  console.log('🎯 [Services] *** SERVICES COMPONENT RENDERED ***');
  
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
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);
  const [showDSS, setShowDSS] = useState(false);
  const [showPhasedDSS, setShowPhasedDSS] = useState(false);
  
  const { user } = useAuth();
  const { createOrFindBusinessConversation, setActiveConversation } = useUnifiedMessaging();
  const navigate = useNavigate();

  // Load services using centralized service manager
  useEffect(() => {
    console.log('🚀 [Services] *** USEEFFECT TRIGGERED ***');
    console.log('🔧 [Services] Component filters:', { selectedCategory, featuredOnly, ratingFilter });
    
    const loadServices = async () => {
      console.log('📋 [Services] *** CALLING LOADSERVICES FUNCTION ***');
      setLoading(true);
      console.log('🔄 [Services] Loading services with centralized manager...');
      
      const filters = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        featured: featuredOnly || undefined,
        rating: ratingFilter || undefined,
        limit: 50
      };

      console.log('🔧 [Services] *** ABOUT TO CALL SERVICEMANAGER ***');
      console.log('🔧 [Services] Filters being passed:', filters);
      
      try {
        console.log('� [Services] Using CentralizedServiceManager to load ALL services...');
        
        const result = await serviceManager.getAllServices(filters);
        
        if (result.success && result.services.length > 0) {
          console.log('✅ [Services] Loaded services from centralized manager:', result.services.length);
          setServices(result.services);
        } else {
          console.log('⚠️ [Services] No services found');
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
      const subject = `Wedding Inquiry - ${service.name}`;
      const body = `Hi ${service.vendorName},

I'm interested in your ${service.name} service for my wedding. Could you please provide more details about:

- Availability for my wedding date
- Package options and pricing
- What's included in your services

Thank you!

Best regards`;
      
      window.open(`mailto:${service.contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }
  };

  const handleVisitWebsite = (service: Service) => {
    if (service.contactInfo.website) {
      window.open(service.contactInfo.website, '_blank');
    }
  };

  const handleBookingRequest = (service: Service) => {
    console.log('📋 [Services] Opening booking request for service:', service.name);
    setSelectedServiceForBooking(service);
    setShowBookingModal(true);
  };

  const openGalleryViewer = (images: string[], startIndex: number = 0) => {
    setGalleryImages(images);
    setCurrentImageIndex(startIndex);
    setSelectedGalleryImage(images[startIndex]);
  };

  const closeGalleryViewer = () => {
    setSelectedGalleryImage(null);
    setGalleryImages([]);
    setCurrentImageIndex(0);
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % galleryImages.length
      : (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedGalleryImage(galleryImages[newIndex]);
  };

  const handleFavoriteService = (service: Service) => {
    console.log('❤️ [Services] Adding service to favorites:', service.name);
    // TODO: Implement favorites/wishlist functionality
    // For now, show a success message
    alert(`Added "${service.name}" to your favorites! 💕`);
  };

  const handleShareService = (service: Service) => {
    console.log('📤 [Services] Sharing service:', service.name);
    if (navigator.share) {
      navigator.share({
        title: `${service.name} - Wedding Service`,
        text: `Check out this wedding service: ${service.name} by ${service.vendorName}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Service link copied to clipboard!');
    }
  };

  const handleQuickContact = (service: Service, method: 'call' | 'email' | 'message') => {
    console.log(`📞 [Services] Quick contact via ${method}:`, service.name);
    switch (method) {
      case 'call':
        handleContactVendor(service);
        break;
      case 'email':
        handleEmailVendor(service);
        break;
      case 'message':
        handleMessageVendor(service);
        break;
    }
  };

  const handleCompareService = (service: Service) => {
    console.log('🔍 [Services] Adding service to comparison:', service.name);
    // TODO: Implement service comparison functionality
    alert(`Added "${service.name}" to comparison! Use this feature to compare multiple vendors side-by-side.`);
  };

  const handleViewGallery = (service: Service) => {
    console.log('🖼️ [Services] Opening gallery for:', service.name);
    // Open service details modal which shows the gallery
    handleServiceSelect(service);
  };

  const handleMessageVendor = async (service: Service) => {
    console.log('🗨️ [Services] ===== STARTING MESSAGE VENDOR PROCESS =====');
    console.log('🗨️ [Services] Vendor:', service.vendorName, '| Service:', service.name);
    console.log('🗨️ [Services] Vendor ID:', service.vendorId, '| Service ID:', service.id);
    
    // CRITICAL DEBUG: Check user authentication first
    console.log('👤 [Services] ===== USER AUTHENTICATION CHECK =====');
    console.log('👤 [Services] User object:', user);
    console.log('👤 [Services] User ID:', user?.id);
    console.log('👤 [Services] User authenticated:', !!user?.id);
    console.log('👤 [Services] User role:', user?.role);
    console.log('👤 [Services] User email:', user?.email);
    
    if (!user?.id) {
      console.error('❌ [Services] ===== CRITICAL: USER NOT AUTHENTICATED =====');
      console.error('❌ [Services] Cannot create conversation without authenticated user');
      alert('Please log in to message vendors');
      return;
    }
    
    // CRITICAL DEBUG: Check messaging context availability
    console.log('🔧 [Services] ===== MESSAGING CONTEXT AVAILABILITY CHECK =====');
    console.log('🔧 [Services] createOrFindBusinessConversation function:', typeof createOrFindBusinessConversation);
    console.log('🔧 [Services] setActiveConversation function:', typeof setActiveConversation);
    console.log('🔧 [Services] Context functions available:', {
      createOrFind: !!createOrFindBusinessConversation,
      setActive: !!setActiveConversation
    });
    
    if (!createOrFindBusinessConversation) {
      console.error('❌ [Services] ===== CRITICAL: MESSAGING CONTEXT NOT AVAILABLE =====');
      console.error('❌ [Services] createOrFindBusinessConversation function is missing');
      alert('Messaging system not available. Please refresh the page.');
      return;
    }
    
    try {
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

      console.log('🔍 [Services] ===== SEARCHING FOR EXISTING CONVERSATION =====');
      console.log('🔍 [Services] Search criteria:', {
        vendorId: vendor.id,
        serviceType: serviceInfo.category,
        serviceName: serviceInfo.name
      });

      console.log('🚀 [Services] ===== CALLING MESSAGING CONTEXT =====');
      console.log('🚀 [Services] About to call createOrFindBusinessConversation...');
      console.log('🚀 [Services] Parameters:', {
        vendorId: vendor.id,
        bookingId: undefined,
        serviceType: serviceInfo.category,
        serviceName: serviceInfo.name
      });

      // Use enhanced conversation lookup to prevent duplicates
      const conversationId = await createOrFindBusinessConversation(
        vendor.id, 
        undefined, // bookingId
        serviceInfo.category, // serviceType
        serviceInfo.name // serviceName
      );
      
      console.log('🔄 [Services] ===== MESSAGING CONTEXT RESPONSE =====');
      console.log('🔄 [Services] Received conversation ID:', conversationId);
      console.log('🔄 [Services] Type of response:', typeof conversationId);
      console.log('🔄 [Services] Is null?', conversationId === null);
      console.log('🔄 [Services] Is undefined?', conversationId === undefined);
      console.log('🔄 [Services] Is falsy?', !conversationId);
      console.log('🔄 [Services] String value:', String(conversationId));
      console.log('🔄 [Services] JSON stringify:', JSON.stringify(conversationId));
      
      if (conversationId) {
        console.error('✅ [Services] ===== CONVERSATION RESULT =====');
        console.log('✅ [Services] Conversation ID found/created:', conversationId);
        console.log('✅ [Services] This conversation will be used for messaging');
        
        console.log('🚀 [Services] ===== NAVIGATION TO MESSAGES PAGE =====');
        console.log('🚀 [Services] Navigating to: /individual/messages');
        console.log('🚀 [Services] Target conversation:', conversationId);
        
        // Navigate to the dedicated messages page for better UX
        navigate('/individual/messages');
        
        // Set active conversation after navigation
        // The messaging context now has better retry logic built-in
        console.log('🎯 [Services] ===== SETTING ACTIVE CONVERSATION =====');
        console.log('🎯 [Services] Setting active conversation ID:', conversationId);
        console.log('🎯 [Services] This will load the conversation in the messages page');
        
        // Set active conversation after navigation with proper Promise handling
        console.log('🎯 [Services] ===== SETTING ACTIVE CONVERSATION =====');
        console.log('🎯 [Services] Setting active conversation ID:', conversationId);
        console.log('🎯 [Services] This will load the conversation in the messages page');
        
        // CRITICAL FIX: Use standard activation method with enhanced retry logic
        // The conversation should now be guaranteed to be in state due to the cache fix
        setTimeout(async () => {
          try {
            console.log('🔄 [Services] ===== ATTEMPTING CONVERSATION ACTIVATION =====');
            console.log('🔄 [Services] Target conversation ID:', conversationId);
            console.log('🔄 [Services] Using enhanced messaging context with cache support');
            
            // Use standard activation method (now has better retry logic and cache support)
            const activationSuccess = await setActiveConversation(conversationId);
            
            if (activationSuccess !== false) {
              console.log('🎉 [Services] ===== CONVERSATION ACTIVATION SUCCESSFUL =====');
              console.log('🎉 [Services] Conversation is now active and loaded');
              console.log('🎉 [Services] User should see the conversation immediately');
            } else {
              console.error('❌ [Services] ===== ACTIVATION FAILED - CRITICAL ISSUE =====');
              console.error('❌ [Services] Conversation ID:', conversationId);
              console.error('❌ [Services] This indicates a deeper messaging system problem');
              
              // Show user-friendly error
              alert('Unable to open conversation. Please try refreshing the page or contact support.');
            }
          } catch (error) {
            console.error('❌ [Services] ===== CRITICAL ERROR IN CONVERSATION ACTIVATION =====');
            console.error('❌ [Services] Error details:', error);
            console.error('❌ [Services] Conversation ID:', conversationId);
            
            // Show user-friendly error
            alert('Error opening conversation. Please try again later.');
          }
        }, 100); // Minimal delay since conversation is now guaranteed to be in cache
        
        console.log('💬 [Services] ===== ROUTING COMPLETE =====');
        console.log('💬 [Services] Successfully routed to messages page');
        console.log('💬 [Services] User can now see conversation with:', service.vendorName);
      } else {
        console.error('⚠️ [Services] ===== CONVERSATION CREATION FAILED =====');
        console.error('⚠️ [Services] Conversation creation returned null/undefined/falsy');
        console.error('⚠️ [Services] This indicates messaging context issue');
        console.error('⚠️ [Services] Raw response value:', conversationId);
        console.error('⚠️ [Services] CRITICAL: Will route without conversation');
        
        // Still route to messages page to show the issue
        console.error('🚀 [Services] ===== ROUTING TO MESSAGES (NO CONVERSATION) =====');
        navigate('/individual/messages');
      }
    } catch (error) {
      console.error('❌ [Services] ===== ERROR IN MESSAGE VENDOR PROCESS =====');
      console.error('❌ [Services] Error starting conversation:', error);
      console.error('❌ [Services] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.log('🔄 [Services] ===== ATTEMPTING FALLBACK CONVERSATION =====');
      
      // Fallback to basic conversation
      const vendor = {
        id: service.vendorId || `vendor-${Date.now()}`,
        name: service.vendorName,
        role: 'vendor' as const
      };
      
      console.log('🔄 [Services] Fallback vendor info:', vendor);
      
      try {
        const fallbackConversationId = await createOrFindBusinessConversation(vendor.id);
        if (fallbackConversationId) {
          console.log('✅ [Services] ===== FALLBACK CONVERSATION SUCCESS =====');
          console.log('✅ [Services] Fallback conversation ID:', fallbackConversationId);
          console.log('🚀 [Services] Navigating to messages page with fallback conversation');
          
          navigate('/individual/messages');
          
          const setFallbackActiveWithRetry = async (retryCount = 0) => {
            const maxRetries = 3;
            console.log(`🎯 [Services] Setting fallback conversation as active (attempt ${retryCount + 1}):`, fallbackConversationId);
            
            try {
              await setActiveConversation(fallbackConversationId);
              console.log('✅ [Services] Fallback conversation activated successfully');
            } catch (error) {
              console.error(`❌ [Services] Error setting fallback conversation (attempt ${retryCount + 1}):`, error);
              
              if (retryCount < maxRetries) {
                const delay = (retryCount + 1) * 200;
                console.log(`🔄 [Services] Retrying fallback in ${delay}ms...`);
                setTimeout(() => setFallbackActiveWithRetry(retryCount + 1), delay);
              } else {
                console.error('❌ [Services] All fallback attempts failed');
              }
            }
          };
          
          setTimeout(() => setFallbackActiveWithRetry(), 500);
          
          console.log('💬 [Services] ===== FALLBACK ROUTING COMPLETE =====');
          console.log('💬 [Services] User routed to basic conversation with:', service.vendorName);
        } else {
          console.error('❌ [Services] ===== FALLBACK FAILED =====');
          console.error('❌ [Services] Even fallback conversation creation failed');
        }
      } catch (fallbackError) {
        console.error('❌ [Services] ===== CRITICAL MESSAGING FAILURE =====');
        console.error('❌ [Services] Both primary and fallback conversation failed:', fallbackError);
        console.error('❌ [Services] User will not be able to message this vendor');
      }
    }
  };



  const getAvailableLocations = () => {
    const locations = Array.from(new Set(services.map(s => s.location)));
    return locations.slice(0, 8); // Limit to top locations
  };

  const categories = ['All', ...SERVICE_CATEGORIES.map(cat => cat.name)];

  // DSS handlers
  const handleOpenDSS = () => {
    setShowDSS(true);
  };

  const handleCloseDSS = () => {
    setShowDSS(false);
  };

  const handleServiceRecommend = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      // Close DSS modal and show service details
      setShowDSS(false);
      setShowBookingModal(true);
    }
  };

  // Phased DSS handlers
  const handleOpenPhasedDSS = () => {
    setShowPhasedDSS(true);
  };

  const handleClosePhasedDSS = () => {
    setShowPhasedDSS(false);
  };

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

                {/* DSS Options - Choose Your Planning Style */}
                <div className="flex flex-col items-center space-y-4 w-full">
                  <h3 className="text-xl font-bold text-gray-900">🤖 AI Wedding Planning</h3>
                  <p className="text-gray-600 text-center max-w-2xl text-sm">
                    Choose your preferred planning experience to get personalized recommendations
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-3 w-full max-w-4xl">
                    {/* NEW: Phased DSS - Step by Step */}
                    <button
                      onClick={handleOpenPhasedDSS}
                      className="group flex-1 flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 font-semibold text-sm border border-white/20 backdrop-blur-sm relative overflow-hidden"
                      title="NEW: Step-by-Step Planning - Guided workflow with date availability checking"
                      aria-label="Open Step-by-Step AI Planning with availability checking"
                    >
                      {/* Background glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                      
                      <Calendar className="h-5 w-5 group-hover:animate-pulse group-hover:scale-125 transition-all duration-300 relative z-10" />
                      <div className="flex-1 text-left relative z-10">
                        <div className="font-bold text-sm">📅 Step-by-Step Planner</div>
                        <div className="text-xs text-emerald-100 font-normal">NEW! Guided workflow with date availability</div>
                      </div>
                      <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce shadow-lg relative z-10"></div>
                      
                      {/* NEW badge */}
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">NEW</div>
                    </button>

                    {/* Original DSS - Quick Recommendations */}
                    <button
                      onClick={handleOpenDSS}
                      className="group flex-1 flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 font-semibold text-sm border border-white/20 backdrop-blur-sm relative overflow-hidden"
                      title="Quick AI Recommendations - All options at once"
                      aria-label="Open Quick AI Recommendations"
                    >
                      {/* Background glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                      
                      <Brain className="h-5 w-5 group-hover:animate-pulse group-hover:scale-125 transition-all duration-300 relative z-10" />
                      <div className="flex-1 text-left relative z-10">
                        <div className="font-bold text-sm">⚡ Quick Recommendations</div>
                        <div className="text-xs text-purple-100 font-normal">All options at once, advanced filters</div>
                      </div>
                      <div className="w-2 h-2 bg-white/90 rounded-full animate-bounce shadow-lg relative z-10"></div>
                    </button>
                  </div>
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
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Loading Wedding Services</h3>
                  <p className="text-gray-600 mb-6">
                    We have 90+ professional wedding services available. <br/>
                    If this message persists, please refresh the page or try again later.
                  </p>
                  <div className="bg-blue-50 rounded-xl p-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">Available Services Include:</h4>
                    <p className="text-blue-700 text-sm">
                      Photography • Videography • Catering • Wedding Planning • Music & DJ • 
                      Florist • Venues • Beauty Services • Transportation • and more!
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
                  >
                    Refresh Page
                  </button>
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
            >              {filteredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  viewMode={viewMode}
                  index={index}
                  onSelect={handleServiceSelect}
                  onMessage={handleMessageVendor}
                  onFavorite={handleFavoriteService}
                  onBookingRequest={handleBookingRequest}
                  onShare={handleShareService}
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
        onBookingRequest={handleBookingRequest}
        onOpenGallery={openGalleryViewer}
      />

      {/* Gallery Viewer Modal */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img
              src={selectedGalleryImage}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Close button */}
            <button
              onClick={closeGalleryViewer}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateGallery('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateGallery('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} of {galleryImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {showBookingModal && selectedServiceForBooking && (
        <BookingRequestModal
          service={convertToBookingService(selectedServiceForBooking)}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedServiceForBooking(null);
          }}
          onBookingCreated={(booking) => {
            console.log('📅 [Services] Booking created:', booking);
            setShowBookingModal(false);
            setSelectedServiceForBooking(null);
          }}
        />
      )}

      {/* Decision Support System (DSS) Modal */}
      {showDSS && (
        <DecisionSupportSystem
          services={filteredServices as any}
          budget={50000}
          location={locationFilter}
          priorities={[selectedCategory]}
          isOpen={showDSS}
          onClose={handleCloseDSS}
          onServiceRecommend={handleServiceRecommend}
        />
      )}

      {/* NEW: Phased Decision Support System Modal */}
      {showPhasedDSS && (
        <PhasedDecisionSupportSystem
          isOpen={showPhasedDSS}
          onClose={handleClosePhasedDSS}
          onServiceRecommend={(service) => {
            // Handle service recommendation from phased DSS
            if (service) {
              setSelectedService(service);
              setShowBookingModal(true);
              setShowPhasedDSS(false);
            }
          }}
        />
      )}
    </div>
  );
}



export default Services;
