import { useState, useEffect } from 'react';
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
  SlidersHorizontal,
  Brain,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useMessagingModal } from '../../../../shared/components/messaging';
import { SERVICE_CATEGORIES } from '../../../../shared/services/CentralizedServiceManager';
import { BookingRequestModal } from '../../../../modules/services/components/BookingRequestModal';
import { DecisionSupportSystem } from './dss/DecisionSupportSystem';
import type { ServiceCategory } from '../../../../shared/types/comprehensive-booking.types';
import type { Service as BookingService } from '../../../../modules/services/types';

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

  return {
    id: service.id,
    vendorId: service.vendorId || service.vendor_id,
    name: service.name,
    category: mappedCategory,
    description: service.description,
    basePrice: service.price,
    priceRange: service.priceRange,
    image: service.image,
    gallery: service.images || service.gallery || [service.image].filter(Boolean),
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

// ServiceFilters interface removed - not currently used

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
  
  
  const { openModal: openMessagingModal } = useMessagingModal();

  // Load services with enhanced data from multiple APIs
  useEffect(() => {
    console.log('🚀 [Services] *** LOADING ENHANCED SERVICES ***');
    
    const loadEnhancedServices = async () => {
      setLoading(true);
      console.log('📋 [Services] Loading services with vendor data...');
      
      try {
        // Load services and vendors in parallel
        console.log('🌐 [Services] Fetching from APIs:', {
          servicesUrl: 'https://weddingbazaar-web.onrender.com/api/services',
          vendorsUrl: 'https://weddingbazaar-web.onrender.com/api/vendors/featured'
        });
        
        const [servicesResponse, vendorsResponse] = await Promise.all([
          fetch('https://weddingbazaar-web.onrender.com/api/services'),
          fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured')
        ]);

        console.log('📡 [Services] API Response Status:', {
          services: {
            status: servicesResponse.status,
            ok: servicesResponse.ok,
            statusText: servicesResponse.statusText
          },
          vendors: {
            status: vendorsResponse.status,
            ok: vendorsResponse.ok,
            statusText: vendorsResponse.statusText
          }
        });

        if (!servicesResponse.ok) {
          console.error('❌ [Services] Services API returned error:', servicesResponse.status);
        }
        if (!vendorsResponse.ok) {
          console.error('❌ [Services] Vendors API returned error:', vendorsResponse.status);
        }

        const servicesData = await servicesResponse.json();
        const vendorsData = await vendorsResponse.json();

        console.log('� [Services] Raw API Response - Services:', {
          success: servicesData.success,
          serviceCount: servicesData.services?.length || 0,
          firstService: servicesData.services?.[0] ? {
            id: servicesData.services[0].id,
            name: servicesData.services[0].name,
            category: servicesData.services[0].category,
            vendor_id: servicesData.services[0].vendor_id,
            hasImages: !!servicesData.services[0].images
          } : null
        });
        
        console.log('👥 [Services] Raw API Response - Vendors:', {
          success: vendorsData.success,
          vendorCount: vendorsData.vendors?.length || 0,
          vendors: vendorsData.vendors?.map((v: any) => ({
            id: v.id,
            name: v.name,
            rating: v.rating,
            ratingType: typeof v.rating,
            reviewCount: v.reviewCount,
            reviewCountType: typeof v.reviewCount,
            note: 'API uses camelCase reviewCount, not snake_case review_count'
          })) || []
        });

        if (servicesData.success && servicesData.services) {
          // Create vendor lookup map
          const vendorMap = new Map();
          if (vendorsData.success && vendorsData.vendors) {
            console.log('🗺️ [Services] Building vendor lookup map...');
            vendorsData.vendors.forEach((vendor: any) => {
              vendorMap.set(vendor.id, vendor);
              console.log('  ➕ Added vendor to map:', {
                id: vendor.id,
                name: vendor.name,
                rating: vendor.rating,
                reviewCount: vendor.reviewCount
              });
            });
            console.log('✅ [Services] Vendor map created with', vendorMap.size, 'vendors');
          } else {
            console.log('⚠️ [Services] No vendors data available for mapping');
          }

          // Enhance services with vendor data and real/fallback images
          console.log('🔄 [Services] Starting enhancement for', servicesData.services.length, 'services');
          const enhancedServices = servicesData.services.map((service: any, index: number) => {
            const vendor = vendorMap.get(service.vendor_id);
            console.log(`📋 [Services] [${index + 1}/${servicesData.services.length}] Service:`, {
              id: service.id,
              name: service.name,
              category: service.category,
              vendor_id: service.vendor_id,
              vendorFound: !!vendor,
              vendorName: vendor?.name || 'N/A',
              rawRating: vendor?.rating,
              ratingType: typeof vendor?.rating,
              rawReviewCount: vendor?.reviewCount,
              reviewCountType: typeof vendor?.reviewCount
            });
            
            // Use real service images from database
            const getServiceImages = (service: any, category: string) => {
              console.log('🔍 [Services] Checking images for service:', service.name || service.id, 'Raw service data:', service);
              
              // First priority: Check if service has an images array (from database)
              if (service.images) {
                if (Array.isArray(service.images) && service.images.length > 0) {
                  // Filter out test/placeholder images from real database images
                  const realImages = service.images.filter((img: string) => 
                    img && !img.includes('example.com') && !img.includes('placeholder') && !img.includes('test.jpg')
                  );
                  if (realImages.length > 0) {
                    console.log('✅ [Services] Using real images array for service:', service.name || service.id, 'Count:', realImages.length);
                    return realImages;
                  }
                }
                
                // Sometimes images might be stored as a string (JSON array or single URL)
                if (typeof service.images === 'string' && !service.images.includes('example.com')) {
                  try {
                    // Try to parse as JSON array
                    const parsedImages = JSON.parse(service.images);
                    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                      const realParsedImages = parsedImages.filter((img: string) => 
                        img && !img.includes('example.com') && !img.includes('placeholder') && !img.includes('test.jpg')
                      );
                      if (realParsedImages.length > 0) {
                        console.log('✅ [Services] Using parsed real images for service:', service.name || service.id, 'Count:', realParsedImages.length);
                        return realParsedImages;
                      }
                    }
                  } catch (e) {
                    // If not JSON, treat as single URL (but not test URLs)
                    if (!service.images.includes('test') && !service.images.includes('placeholder')) {
                      console.log('✅ [Services] Using single real image string for service:', service.name || service.id);
                      return [service.images];
                    }
                  }
                }
              }
              
              // Second priority: Check if service has a single image field
              if (service.image && typeof service.image === 'string') {
                console.log('✅ [Services] Using single real image for service:', service.name || service.id);
                return [service.image];
              }
              
              // Third priority: Check if vendor has images
              if (vendor && vendor.images && Array.isArray(vendor.images) && vendor.images.length > 0) {
                console.log('✅ [Services] Using vendor images for service:', service.name || service.id);
                return vendor.images;
              }
              
              if (vendor && vendor.image && typeof vendor.image === 'string') {
                console.log('✅ [Services] Using vendor image for service:', service.name || service.id);
                return [vendor.image];
              }
              
              console.log('⚠️ [Services] No real images found, using category fallback for:', service.name || service.id, 'Category:', category);
              
              // Fallback to category-based placeholder images only when no real images exist
              const imageCategories: Record<string, string[]> = {
                'Photography': [
                  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
                  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800'
                ],
                'Photographer & Videographer': [
                  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
                  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800'
                ],
                'Caterer': [
                  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
                  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
                  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
                ],
                'Florist': [
                  'https://images.unsplash.com/photo-1594736797933-d0f15b985449?w=800',
                  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
                  'https://images.unsplash.com/photo-1565620468-d82c1b6d6b48?w=800',
                  'https://images.unsplash.com/photo-1495703571435-15ad1c4a4ec8?w=800'
                ],
                'DJ/Band': [
                  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
                  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
                  'https://images.unsplash.com/photo-1582654596830-b9453fa7b9c0?w=800'
                ],
                'Wedding Planner': [
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
                  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
                ],
                'Hair & Makeup Artists': [
                  'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800',
                  'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=800',
                  'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800',
                  'https://images.unsplash.com/photo-1458670572128-986fd2b12e25?w=800'
                ],
                'Cake Designer': [
                  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
                  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800',
                  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
                  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
                ],
                'Event Rentals': [
                  'https://images.unsplash.com/photo-1519167758481-83f29c1c30be?w=800',
                  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
                  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'
                ],
                'Dress Designer/Tailor': [
                  'https://images.unsplash.com/photo-1594736797933-d0f15b985449?w=800',
                  'https://images.unsplash.com/photo-1566174924442-dbe0077ea5b8?w=800',
                  'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800',
                  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
                ],
                'Officiant': [
                  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
                  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
                ],
                'Transportation Services': [
                  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
                  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800',
                  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
                  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'
                ],
                'Venue Coordinator': [
                  'https://images.unsplash.com/photo-1519167758481-83f29c1c30be?w=800',
                  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
                  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'
                ],
                'Sounds & Lights': [
                  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
                  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
                  'https://images.unsplash.com/photo-1582654596830-b9453fa7b9c0?w=800'
                ],
                'Stationery Designer': [
                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
                  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'
                ],
                'Security & Guest Management': [
                  'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                  'https://images.unsplash.com/photo-1519167758481-83f29c1c30be?w=800',
                  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
                  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'
                ]
              };

              const defaultImages = [
                'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800'
              ];

              return imageCategories[category] || defaultImages;
            };

            let serviceImages = getServiceImages(service, service.category);
            
            // Allow all services with any images (including fallback images for better UX)
            if (!serviceImages || serviceImages.length === 0) {
              console.log('⚠️ [Services] Using fallback image for service without images:', service.name || service.id);
              serviceImages = getServiceImages(service, service.category); // Get fallback images
            }
            
            // Skip only services with obvious test/placeholder URLs
            const hasTestImages = serviceImages.some((img: string) => 
              img && (img.includes('example.com') || img.includes('placeholder') || img.includes('test.jpg'))
            );
            
            if (hasTestImages) {
              console.log('❌ [Services] Skipping service with only test/placeholder images:', service.name || service.id);
              return null; // This will be filtered out
            }
            


            // Generate realistic data using helper functions when vendor data is not available
            const generatedVendorName = generateVendorName(service.category);
            const generatedLocation = generateLocation();
            const generatedContactInfo = generateContactInfo(service.vendor_id);
            
            // Calculate final rating and review count with explicit logging
            // 🔥 FIX: Use per-service ratings from API (field is misleadingly named vendor_rating but contains per-service data)
            // Primary: service.vendor_rating (per-service rating from reviews table grouped by service_id)
            // Fallback: vendor.rating (vendor overall rating, only used if service has no reviews yet)
            const finalRating = service.vendor_rating ? parseFloat(service.vendor_rating) : 
                               (vendor?.rating ? parseFloat(vendor.rating) : 0);
            const finalReviewCount = service.vendor_review_count ? parseInt(service.vendor_review_count) : 
                                    (vendor?.reviewCount ? parseInt(vendor.reviewCount) : 0);
            
            console.log(`📊 [Services] Rating for "${service.title || service.name}":`, {
              serviceId: service.id,
              vendorId: service.vendor_id,
              vendorName: vendor?.name || service.vendor_business_name || 'Generated',
              
              // Per-service ratings (from API - field name is misleading!)
              serviceRating: service.vendor_rating,
              serviceReviewCount: service.vendor_review_count,
              
              // Vendor overall ratings (from vendor lookup map)
              vendorRating: vendor?.rating,
              vendorReviewCount: vendor?.reviewCount,
              
              // Final calculated values
              finalRating,
              finalReviewCount,
              
              // Data source tracking
              usingServiceRating: !!service.vendor_rating,
              usingVendorRatingAsFallback: !service.vendor_rating && !!vendor?.rating,
              imageCount: serviceImages.length,
              
              note: '⚠️ API field "vendor_rating" actually contains PER-SERVICE rating (not vendor overall rating)'
            });

            return {
              id: service.id,
              title: service.name,
              name: service.title || service.name || `${service.category} Service`,
              category: service.category,
              vendor_id: service.vendor_id,
              vendorId: service.vendor_id,
              // Use real vendor data if available, otherwise use generated realistic data
              vendorName: vendor?.name || generatedVendorName,
              vendorImage: generateVendorImage(),
              description: service.description || `Professional ${service.category.toLowerCase()} services for your special day.`,
              price: parseFloat(service.price) || 0,
              priceRange: `₱${parseFloat(service.price || 0).toLocaleString()}`,
              // Use real vendor location if available, otherwise use generated
              location: vendor?.location || generatedLocation,
              // Use real vendor rating data if available, otherwise default to 0
              rating: finalRating,
              reviewCount: finalReviewCount,
              image: serviceImages[0],
              images: serviceImages,
              gallery: serviceImages,
              features: generateServiceFeatures(service.category, service.description),
              is_active: service.is_active !== false,
              availability: service.is_active !== false,
              featured: service.featured === true,
              created_at: service.created_at || new Date().toISOString(),
              updated_at: service.updated_at || new Date().toISOString(),
              // Use real vendor contact info if available, otherwise use generated
              contactInfo: {
                phone: vendor?.phone || generatedContactInfo.phone,
                email: vendor?.email || generatedContactInfo.email,
                website: vendor?.website || generatedContactInfo.website
              }
            };
          }).filter(Boolean); // Remove null values from services without real images

          console.log('✅ [Services] Enhanced services created:', {
            totalCount: enhancedServices.length,
            servicesWithRealRatings: enhancedServices.filter(s => s.rating > 0).length,
            servicesWithReviews: enhancedServices.filter(s => s.reviewCount > 0).length,
            averageRating: (enhancedServices.reduce((sum, s) => sum + s.rating, 0) / enhancedServices.length).toFixed(2),
            totalReviews: enhancedServices.reduce((sum, s) => sum + s.reviewCount, 0)
          });
          
          // Log a sample of the final enhanced services
          if (enhancedServices.length > 0) {
            console.log('📋 [Services] Sample enhanced services:', enhancedServices.slice(0, 3).map(s => ({
              id: s.id,
              name: s.name,
              category: s.category,
              vendorName: s.vendorName,
              rating: s.rating,
              reviewCount: s.reviewCount,
              price: s.price,
              imageCount: s.images?.length || 0
            })));
          }
          
          setServices(enhancedServices);
        } else {
          console.log('⚠️ [Services] No services found');
          setServices([]);
        }
      } catch (error) {
        console.error('❌ [Services] Error loading enhanced services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadEnhancedServices();
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

  // Removed unused helper functions: handleQuickContact, handleCompareService, handleViewGallery

  const handleMessageVendor = async (service: Service) => {
    console.log('� [Services] =================== MESSAGE VENDOR BUTTON CLICKED ===================');
    console.log('�🗨️ [Services] Starting conversation with vendor:', service.vendorName);
    console.log('🔍 [Services] Service details:', {
      serviceId: service.id,
      serviceName: service.name,
      vendorId: service.vendorId,
      vendorName: service.vendorName,
      category: service.category,
      contactInfo: service.contactInfo
    });
    
    try {
      console.log('📱 [Services] Preparing messaging modal data...');
      const modalData = {
        vendorId: service.vendorId,
        vendorName: service.vendorName,
        serviceName: service.name,
        serviceCategory: service.category,
        vendorInfo: {
          id: service.vendorId,
          name: service.vendorName,
          businessName: service.vendorName,
          category: service.category,
          email: service.contactInfo.email,
          phone: service.contactInfo.phone,
          website: service.contactInfo.website,
          image: service.vendorImage
        },
        serviceInfo: {
          id: service.id,
          name: service.name,
          category: service.category,
          description: service.description,
          image: service.image
        }
      };
      
      console.log('📤 [Services] Modal data prepared:', modalData);
      console.log('🔄 [Services] Calling openMessagingModal...');
      
      // Use the new messaging modal system
      await openMessagingModal(modalData);
      
      console.log('✅ [Services] =================== MESSAGE VENDOR SUCCESS ===================');
      console.log('✅ [Services] Messaging modal opened successfully');
    } catch (error) {
      console.error('❌ [Services] =================== MESSAGE VENDOR FAILED ===================');
      console.error('❌ [Services] Error opening messaging modal:', error);
      console.error('❌ [Services] Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ [Services] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert('Unable to start conversation at this time. Please try again later.');
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-56 h-56 bg-gradient-to-r from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-100/10 to-rose-100/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <CoupleHeader />
      
      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 relative">
            {/* Floating decorative elements */}
            <motion.div 
              className="absolute -top-8 left-1/4 text-pink-300"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-6 w-6" />
            </motion.div>
            <motion.div 
              className="absolute -top-4 right-1/4 text-rose-300"
              animate={{ 
                y: [0, -8, 0],
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-pink-800 to-rose-800 bg-clip-text text-transparent mb-6"
            >
              Wedding Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6"
            >
              Discover premium wedding services from verified vendors to make your special day absolutely perfect ✨
            </motion.p>
            <motion.div 
              className="flex items-center justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                <span className="font-semibold">{filteredServices.length}</span> services available
              </span>
              <span className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 px-4 py-2 rounded-full border border-pink-200 shadow-sm">
                <Heart className="h-4 w-4 inline mr-1" />
                Premium quality
              </span>
            </motion.div>
          </div>

          {/* Search and Filter Bar */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-pink-100/50 relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50/30 via-white to-rose-50/30 rounded-3xl"></div>
              
              <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Search className="h-5 w-5" />
                  </motion.div>
                  <input
                    type="text"
                    placeholder="Search services, vendors, or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 border-2 border-pink-200 rounded-2xl focus:ring-4 focus:ring-pink-200/50 focus:border-pink-400 transition-all duration-300 text-gray-700 placeholder-pink-400 bg-white/80 backdrop-blur-sm shadow-inner"
                  />
                </div>

                {/* Smart Planning Button */}
                <motion.button
                  onClick={handleOpenDSS}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-xl border border-purple-300/50"
                  title="Smart Wedding Recommendations"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Brain className="h-5 w-5" />
                  </motion.div>
                  <span>Smart Planner</span>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </motion.button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-1 border border-pink-100/50 shadow-inner">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-3 rounded-xl transition-all duration-300 font-medium',
                      viewMode === 'grid' 
                        ? 'bg-white text-pink-600 shadow-lg border border-pink-200/50' 
                        : 'text-gray-500 hover:text-pink-600 hover:bg-white/50'
                    )}
                    title="Grid view"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Grid className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-3 rounded-xl transition-all duration-300 font-medium',
                      viewMode === 'list' 
                        ? 'bg-white text-pink-600 shadow-lg border border-pink-200/50' 
                        : 'text-gray-500 hover:text-pink-600 hover:bg-white/50'
                    )}
                    title="List view"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <List className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Advanced Filters Toggle */}
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg border',
                    showFilters 
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400/50' 
                      : 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-600 hover:from-pink-100 hover:to-rose-100 border-pink-200/50'
                  )}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: showFilters 
                      ? "0 20px 25px -5px rgba(236, 72, 153, 0.3)"
                      : "0 10px 15px -3px rgba(236, 72, 153, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </motion.div>
                  <span>Filters</span>
                  {showFilters && <Sparkles className="h-4 w-4 animate-pulse" />}
                </motion.button>
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
                          title="Select price range"
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
                          title="Select location"
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
                          title="Select minimum rating"
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
                          title="Select sort option"
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
          </motion.div>

          {/* Category Filter */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-8 py-4 rounded-full transition-all duration-300 font-semibold border-2 relative overflow-hidden',
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-pink-600 via-pink-700 to-rose-600 text-white shadow-xl border-pink-400/50 ring-4 ring-pink-200/30'
                      : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-600 shadow-lg hover:shadow-xl border-pink-200/50 hover:border-pink-300'
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    boxShadow: selectedCategory === category 
                      ? "0 20px 25px -5px rgba(236, 72, 153, 0.4)"
                      : "0 15px 20px -3px rgba(236, 72, 153, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedCategory === category && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <span className="relative z-10">
                    {category === 'All' ? 'All Services ✨' : category}
                  </span>
                  {selectedCategory === category && (
                    <motion.div 
                      className="absolute top-1 right-2 text-pink-200"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-3 w-3" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

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
  onFavorite: (service: Service) => void;
  onBookingRequest: (service: Service) => void;
  onShare?: (service: Service) => void;
}

function ServiceCard({ service, viewMode, index, onSelect, onMessage, onFavorite, onBookingRequest, onShare }: ServiceCardProps) {
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
            {/* Main Image for List View */}
            <div className="relative">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600';
                }}
              />
              {service.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              )}
            </div>
            {/* Small Gallery Row Below - Only for List View */}
            {(service.gallery && service.gallery.length > 1) || (service.images && service.images.length > 1) ? (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex gap-1 overflow-x-auto">
                  {(service.gallery?.slice(1, 5) || service.images?.slice(1, 5) || []).map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-white shadow-sm">
                      <img
                        src={img}
                        alt={`${service.name} ${idx + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100';
                        }}
                      />
                    </div>
                  ))}
                  {((service.gallery?.length || service.images?.length || 1) > 5) && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-black/60 border border-white shadow-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        +{((service.gallery?.length || service.images?.length || 1) - 4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
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
                title="View service details"
              >
                View Details
              </button>
              <button
                onClick={() => onMessage(service)}
                className="px-4 py-2 border-2 border-pink-600 text-pink-600 rounded-xl hover:bg-pink-50 transition-colors"
                title="Message vendor"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              {service.contactInfo.phone && (
                <button
                  onClick={() => window.open(`tel:${service.contactInfo.phone}`, '_self')}
                  className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 transition-colors"
                  title="Call vendor"
                >
                  <Phone className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => onFavorite(service)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                title="Add to favorites"
              >
                <Heart className="h-5 w-5" />
              </button>
              <button
                onClick={() => onBookingRequest(service)}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium"
                title="Request booking"
              >
                Book
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
          {/* Main Image */}
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-64 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600';
            }}
          />
          {/* Gallery Preview - Show additional images if available */}
          {(service.gallery && service.gallery.length > 1) || (service.images && service.images.length > 1) && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {(service.gallery?.slice(1, 4) || service.images?.slice(1, 4) || []).map((img, idx) => (
                <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={img}
                    alt={`${service.name} ${idx + 2}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100';
                    }}
                  />
                </div>
              ))}
              {((service.gallery?.length || service.images?.length || 1) > 4) && (
                <div className="w-12 h-12 rounded-lg bg-black/60 backdrop-blur-sm border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    +{((service.gallery?.length || service.images?.length || 1) - 3)}
                  </span>
                </div>
              )}
            </div>
          )}
          {service.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          <div className="absolute top-4 right-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(service);
              }}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors"
              title="Add to favorites"
            >
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
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage(service);
                }}
                className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                title="Message vendor"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              {service.contactInfo.phone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${service.contactInfo.phone}`, '_self');
                  }}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="Call vendor"
                >
                  <Phone className="h-5 w-5" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(service);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Share service"
                >
                  <Globe className="h-5 w-5" />
                </button>
              )}
            </div>
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
  onBookingRequest: (service: Service) => void;
  onOpenGallery: (images: string[], startIndex: number) => void;
}

function ServiceDetailModal({ service, onClose, onContact, onEmail, onWebsite, onMessage, onBookingRequest, onOpenGallery }: ServiceDetailModalProps) {
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
                target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800';
              }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              title="Close details"
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
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{service.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-gray-900">{service.rating}</span>
                  <span className="text-gray-500">({service.reviewCount} reviews)</span>
                </div>
                <span className="inline-block bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-medium mb-2">
                  {service.category}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-pink-600">{service.priceRange}</span>
                <div className="mt-2 flex gap-2 justify-end">
                  <button
                    onClick={() => onMessage(service)}
                    className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                    title="Message vendor"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onContact(service)}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    title="Call vendor"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEmail(service)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Email vendor"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onWebsite(service)}
                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Visit vendor website"
                  >
                    <Globe className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <img
                src={service.vendorImage}
                alt={service.vendorName}
                className="w-14 h-14 rounded-full object-cover border-2 border-pink-200 shadow"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
                }}
              />
              <div>
                <div className="font-semibold text-gray-900">{service.vendorName}</div>
                <div className="text-xs text-gray-500">Verified Vendor</div>
              </div>
            </div>
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">Service Description</h4>
              <p className="text-gray-700 mb-2 whitespace-pre-line">{service.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {service.features.map((feature, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">Gallery</h4>
              <div className="flex gap-2 overflow-x-auto">
                {service.gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${service.name} gallery ${idx + 1}`}
                    className="w-32 h-24 object-cover rounded-lg border border-pink-100 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => onOpenGallery(service.gallery, idx)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100';
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => onBookingRequest(service)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold shadow-lg"
                title="Request booking"
              >
                Request Booking
              </button>
              <button
                onClick={() => onMessage(service)}
                className="px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-xl hover:bg-pink-50 transition-colors font-semibold"
                title="Message vendor"
              >
                Message Vendor
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper functions for real database mapping
const generateServiceFeatures = (category: string, description: string): string[] => {
  const baseFeatures: Record<string, string[]> = {
    'Wedding Planner': ['Full coordination', 'Vendor management', 'Timeline creation', 'Day-of coordination'],
    'Photographer & Videographer': ['Professional equipment', 'Edited gallery', 'Print release', 'Online delivery'],
    'Caterer': ['Fresh ingredients', 'Professional service', 'Custom menus', 'Setup included'],
    'Florist': ['Fresh flowers', 'Custom arrangements', 'Delivery included', 'Setup service'],
    'DJ/Band': ['Professional sound system', 'Music library', 'MC services', 'Special requests'],
    'DJ': ['Professional sound system', 'Music library', 'MC services', 'Special requests'],
    'Hair & Makeup Artists': ['Professional products', 'Trial session', 'Touch-up kit', 'On-site service'],
    'Cake Designer': ['Custom design', 'Fresh ingredients', 'Delivery included', 'Tasting session'],
    'Event Rentals': ['Quality equipment', 'Setup included', 'Breakdown service', 'Insurance covered'],
    'Transportation Services': ['Professional driver', 'Clean vehicles', 'On-time service', 'Special occasions'],
    'Venue Coordinator': ['Space management', 'Vendor coordination', 'Setup supervision', 'Guest assistance'],
    'Officiant': ['Licensed officiant', 'Custom ceremony', 'Rehearsal included', 'Marriage license guidance'],
    'Stationery Designer': ['Custom design', 'Premium materials', 'RSVP tracking', 'Coordinated suite'],
    'Sounds & Lights': ['Professional equipment', 'Technical support', 'Setup included', 'Backup equipment'],
    'Security & Guest Management': ['Trained personnel', 'Crowd control', 'Emergency response', 'Discreet service']
  };

  const features = baseFeatures[category] || ['Professional service', 'Quality guaranteed', 'Experienced team', 'Customer focused'];
  
  // Add description-based features
  if (description?.toLowerCase().includes('luxury') || description?.toLowerCase().includes('premium')) {
    features.push('Premium quality');
  }
  if (description?.toLowerCase().includes('destination')) {
    features.push('Destination expertise');
  }
  if (description?.toLowerCase().includes('consultation')) {
    features.push('Free consultation');
  }
  
  return features.slice(0, 4); // Limit to 4 features
};

const generateVendorName = (category: string): string => {
  const vendorNames: Record<string, string[]> = {
    'Wedding Planner': ['Elite Wedding Planners', 'Dream Day Coordinators', 'Perfect Moments Planning'],
    'Photographer & Videographer': ['Captured Moments Studio', 'Wedding Stories Photography', 'Eternal Memories'],
    'Caterer': ['Gourmet Wedding Catering', 'Elegant Dining Services', 'Wedding Feast Co.'],
    'Florist': ['Bloom Wedding Florals', 'Elegant Petals', 'Wedding Garden Designs'],
    'DJ/Band': ['Wedding Sound Solutions', 'Celebration Entertainment', 'Party Perfect Music'],
    'DJ': ['Wedding Sound Solutions', 'Celebration Entertainment', 'Party Perfect Music'],
    'Hair & Makeup Artists': ['Bridal Beauty Studio', 'Wedding Glamour Artists', 'Perfect Day Beauty'],
    'Cake Designer': ['Sweet Wedding Cakes', 'Elegant Cake Designs', 'Dream Wedding Desserts'],
    'Officiant': ['Sacred Ceremonies', 'Wedding Officiants Plus', 'Memorable Moments Ministry'],
    'other': ['Professional Wedding Services', 'Elite Event Solutions', 'Premium Wedding Vendors']
  };
  
  const names = vendorNames[category] || vendorNames['other'];
  return names[Math.floor(Math.random() * names.length)];
};

const generateVendorImage = (): string => {
  const vendorImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
  ];
  return vendorImages[Math.floor(Math.random() * vendorImages.length)];
};

const generateLocation = (): string => {
  const locations = [
    'Makati City, Metro Manila',
    'Quezon City, Metro Manila', 
    'Bonifacio Global City, Taguig',
    'Ortigas Center, Pasig',
    'Alabang, Muntinlupa',
    'Tagaytay, Cavite',
    'Pasay City, Metro Manila',
    'Manila City, Metro Manila',
    'Metro Manila, Philippines'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

const generateContactInfo = (vendorId: string) => {
  // Generate realistic contact info based on vendor ID for consistency
  const vendorHash = vendorId.split('-').pop() || '000';
  const phoneIndex = parseInt(vendorHash) % 4;
  const domainIndex = parseInt(vendorHash) % 4;
  
  const phoneNumbers = ['+63 917 123 4567', '+63 918 234 5678', '+63 919 345 6789', '+63 920 456 7890'];
  const domains = ['weddingservices.ph', 'manila-weddings.com', 'dreamweddings.ph', 'weddingexperts.ph'];
  
  const phone = phoneNumbers[phoneIndex];
  const domain = domains[domainIndex];
  const email = `hello@${domain}`;
  const website = `https://${domain}`;
  
  return { phone, email, website };
};




export default Services;
