import React, { useState, useEffect } from 'react';
import { Camera, Music, Utensils, Car, Flower, Palette, Building, Heart, Users, Calendar, ArrowRight, Star, X, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils/cn';
import { ServiceDetailsModal as EnhancedServiceModal } from '../../../modules/services/components/ServiceDetailsModal';
import type { Service } from '../../../modules/services/types';
import type { ServiceCategory } from '../../../shared/types/comprehensive-booking.types';

interface ServiceCategoryData {
  business_type: string;
  count: number;
  sample_image?: string;
}

interface ServiceDetails {
  id: string;
  name: string;
  business_type: string;
  location: string;
  rating: number;
  review_count: number;
  price_range: string;
  image?: string;
  gallery?: string[]; // Multiple images for gallery
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  services: string[];
  specialties?: string[];
  portfolio_highlights?: string[];
  years_experience?: number;
  awards?: string[];
}

// Icon mapping for different business types
const getServiceIcon = (businessType: string) => {
  const iconMap: { [key: string]: any } = {
    'Photographer & Videographer': Camera,
    'Photography': Camera,
    'DJ/Band': Music,
    'Music': Music,
    'Entertainment': Music,
    'Caterer': Utensils,
    'Catering': Utensils,
    'Transportation Services': Car,
    'Transportation': Car,
    'Florist': Flower,
    'Florals': Flower,
    'Wedding Planner': Palette,
    'Wedding Planning': Palette,
    'Venue Coordinator': Building,
    'Venue': Building,
    'Hair & Makeup Artists': Heart,
    'Beauty': Heart,
    'Coordination': Users,
    'Planning': Calendar,
    'Stationery Designer': Calendar,
    'Cake Designer': Utensils,
    'Sounds & Lights': Music,
    'Officiant': Users,
    'Event Rentals': Building,
    'Security & Guest Management': Users,
    'Dress Designer/Tailor': Heart,
    'other': Palette
  };
  return iconMap[businessType] || Palette;
};

// Color mapping for different business types
const getServiceColors = (businessType: string) => {
  const colorMap: { [key: string]: { gradient: string; bg: string } } = {
    'Photographer & Videographer': { gradient: 'from-blue-500 to-purple-500', bg: 'bg-blue-50' },
    'Photography': { gradient: 'from-blue-500 to-purple-500', bg: 'bg-blue-50' },
    'DJ/Band': { gradient: 'from-green-500 to-teal-500', bg: 'bg-green-50' },
    'Music': { gradient: 'from-green-500 to-teal-500', bg: 'bg-green-50' },
    'Entertainment': { gradient: 'from-green-500 to-teal-500', bg: 'bg-green-50' },
    'Caterer': { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
    'Catering': { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
    'Transportation Services': { gradient: 'from-gray-500 to-gray-700', bg: 'bg-gray-50' },
    'Transportation': { gradient: 'from-gray-500 to-gray-700', bg: 'bg-gray-50' },
    'Florist': { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
    'Florals': { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
    'Wedding Planner': { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
    'Wedding Planning': { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
    'Venue Coordinator': { gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50' },
    'Venue': { gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50' },
    'Hair & Makeup Artists': { gradient: 'from-pink-400 to-rose-400', bg: 'bg-pink-50' },
    'Beauty': { gradient: 'from-pink-400 to-rose-400', bg: 'bg-pink-50' },
    'Coordination': { gradient: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50' },
    'Planning': { gradient: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
    'Stationery Designer': { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
    'Cake Designer': { gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50' },
    'Sounds & Lights': { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
    'Officiant': { gradient: 'from-slate-500 to-gray-500', bg: 'bg-slate-50' },
    'Event Rentals': { gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50' },
    'Security & Guest Management': { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50' },
    'Dress Designer/Tailor': { gradient: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50' },
    'other': { gradient: 'from-gray-400 to-gray-600', bg: 'bg-gray-50' }
  };
  return colorMap[businessType] || colorMap['other'];
};

// Enhanced ServiceDetailsModal Component with Gallery
const ServiceDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  category: string;
  services: ServiceDetails[];
  loading: boolean;
  onServiceDetails: (service: ServiceDetails) => void;
}> = ({ isOpen, onClose, category, services, loading, onServiceDetails }) => {
  const [localLikedServices, setLocalLikedServices] = useState<Set<string>>(new Set());

  const handleLocalToggleLike = (serviceId: string) => {
    setLocalLikedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-white/50">
          {/* Enhanced Modal Header */}
          <div className="relative flex items-center justify-between p-8 border-b border-gray-200/50 bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-purple-50/80">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/20 to-pink-100/20"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl mr-4">
                  {React.createElement(getServiceIcon(category), { className: "h-6 w-6 text-white" })}
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent">
                  {category} Services
                </h2>
              </div>
              <p className="text-gray-600 ml-14">Browse and connect with {services.length} professional vendors</p>
            </div>
            <button 
              onClick={onClose}
              title="Close modal"
              className="relative z-10 p-3 hover:bg-white/80 rounded-2xl transition-all duration-300 group border border-white/50 backdrop-blur-sm"
            >
              <X className="h-6 w-6 text-gray-500 group-hover:text-gray-700 group-hover:rotate-90 transition-all duration-300" />
            </button>
          </div>

          {/* Enhanced Modal Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)] bg-gradient-to-br from-white/50 via-rose-50/30 to-pink-50/20">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white/80 rounded-3xl border border-white/50 overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 relative">
                      <div className="absolute bottom-4 left-4 w-24 h-6 bg-gray-300 rounded-full"></div>
                      <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="p-6">
                      <div className="bg-gray-200 rounded-lg h-6 mb-3"></div>
                      <div className="bg-gray-200 rounded-lg h-4 w-3/4 mb-4"></div>
                      <div className="bg-gray-200 rounded-xl h-12 w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-6">
                  {React.createElement(getServiceIcon(category), { className: "h-24 w-24 mx-auto" })}
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No services found</h3>
                <p className="text-gray-500 text-lg">No vendors available in this category at the moment.</p>
                <button 
                  onClick={onClose}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
                >
                  Browse Other Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {services.map((service) => {
                  const colors = getServiceColors(service.business_type);
                  const serviceGallery = service.gallery && service.gallery.length > 0 
                    ? service.gallery 
                    : service.image 
                      ? [service.image] 
                      : [];

                  return (
                    <div 
                      key={service.id} 
                      className="group bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden hover:shadow-2xl hover:border-rose-300/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                      onClick={() => onServiceDetails(service)}
                    >
                      {/* Enhanced Service Image Gallery */}
                      <div className="relative h-64 overflow-hidden">
                        {serviceGallery.length > 0 ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={serviceGallery[0]} 
                              alt={service.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            {/* Gallery indicator */}
                            {serviceGallery.length > 1 && (
                              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full border border-white/30">
                                <span className="text-white text-sm font-medium">+{serviceGallery.length - 1} more</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center relative", colors.gradient)}>
                            <div className="absolute inset-0 bg-black/20"></div>
                            {React.createElement(getServiceIcon(service.business_type), { 
                              className: "h-16 w-16 text-white relative z-10 drop-shadow-lg" 
                            })}
                          </div>
                        )}
                        
                        {/* Enhanced overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        {/* Enhanced rating badge */}
                        <div className="absolute top-4 right-4 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                          <span className="text-sm font-bold text-gray-800">{service.rating}</span>
                        </div>

                        {/* Category badge */}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full border border-white/30">
                          <span className="text-white text-xs font-medium">{service.business_type}</span>
                        </div>
                      </div>

                      {/* Enhanced Service Content */}
                      <div className="p-8 relative">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors duration-300 line-clamp-1">
                          {service.name}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-2 text-rose-500 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{service.location}</span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Service features */}
                        {service.specialties && service.specialties.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {service.specialties.slice(0, 2).map((specialty, idx) => (
                                <span key={idx} className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">
                                  {specialty}
                                </span>
                              ))}
                              {service.specialties.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{service.specialties.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                          <span className="text-lg font-bold text-rose-600">{service.price_range}</span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            {service.review_count} reviews
                          </div>
                        </div>

                        {/* Enhanced Contact Actions */}
                        <div className="flex gap-3">
                          <button 
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 text-sm shadow-lg hover:shadow-xl border border-white/20 relative overflow-hidden group"
                            onClick={(e) => {
                              e.stopPropagation();
                              onServiceDetails(service);
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                            <span className="relative z-10">View Details</span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
                          </button>
                          <button 
                            title="Add to favorites"
                            className="px-4 py-3 border border-gray-200 rounded-2xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 group"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLocalToggleLike(service.id);
                            }}
                          >
                            <Heart className={cn(
                              "h-4 w-4 group-hover:scale-110 transition-all duration-300",
                              localLikedServices.has(service.id) 
                                ? "text-rose-500 fill-current" 
                                : "text-gray-500 group-hover:text-rose-500"
                            )} />
                          </button>
                        </div>

                        {/* Enhanced Experience indicator */}
                        {service.years_experience && (
                          <div className="mt-4 pt-4 border-t border-gray-200/50">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{service.years_experience} years experience</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Enhanced View More Button */}
            {!loading && services.length > 0 && (
              <div className="text-center mt-12">
                <button 
                  onClick={() => {
                    onClose();
                    window.location.href = `/individual/services?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`;
                  }}
                  className="px-12 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white font-bold rounded-full text-lg hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transition-all duration-300 shadow-2xl hover:shadow-gray-500/25 border border-white/20 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full"></div>
                  <div className="relative z-10 flex items-center">
                    <span>View All {category} Services</span>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 skew-x-12"></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryServices, setCategoryServices] = useState<ServiceDetails[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Enhanced Service Modal State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [enhancedModalOpen, setEnhancedModalOpen] = useState(false);
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();

  // Convert ServiceDetails to Service for enhanced modal
  const convertToService = (serviceDetails: ServiceDetails): Service => {
    return {
      id: serviceDetails.id,
      name: serviceDetails.name,
      category: serviceDetails.business_type as ServiceCategory,
      location: serviceDetails.location,
      rating: serviceDetails.rating,
      reviewCount: serviceDetails.review_count,
      priceRange: serviceDetails.price_range,
      image: serviceDetails.image || '',
      gallery: serviceDetails.gallery || [],
      description: serviceDetails.description,
      features: serviceDetails.services || [],
      availability: true,
      vendorName: serviceDetails.name,
      vendorImage: serviceDetails.image,
      vendorId: serviceDetails.id,
      contactInfo: {
        phone: serviceDetails.phone,
        email: serviceDetails.email,
        website: serviceDetails.website
      }
    };
  };

  // Handle enhanced modal
  const handleServiceDetails = (serviceDetails: ServiceDetails) => {
    const convertedService = convertToService(serviceDetails);
    setSelectedService(convertedService);
    setEnhancedModalOpen(true);
  };

  const handleCloseEnhancedModal = () => {
    setEnhancedModalOpen(false);
    setSelectedService(null);
  };

  const handleContactService = (service: Service) => {
    // Implement contact functionality
    console.log('Contacting service:', service);
  };

  const handleToggleLike = (serviceId: string) => {
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

  const handleBrowseCategory = async (categoryName: string) => {
    // Open modal with detailed services for this category
    setSelectedCategory(categoryName);
    setModalOpen(true);
    setCategoryServices([]); // Clear previous data
    
    // Fetch detailed services for this category
    try {
      setModalLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const fullUrl = `${apiUrl}/services?category=${encodeURIComponent(categoryName)}&limit=12`;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Handle both array response and paginated response
      const servicesArray = Array.isArray(data) ? data : data.services || [];
      
      // Transform data to match our interface
      const transformedServices: ServiceDetails[] = servicesArray.map((service: any) => ({
        id: service.id,
        name: service.name || service.title,
        business_type: service.category || categoryName,
        location: service.location || 'Location not specified',
        rating: service.rating || 4.5,
        review_count: service.reviewCount || service.review_count || Math.floor(Math.random() * 100) + 10,
        price_range: service.priceRange || service.price_range || '$$$',
        image: service.image,
        gallery: service.gallery || (service.image ? [service.image] : []),
        description: service.description || `Professional ${categoryName} services for your special day.`,
        phone: service.contactInfo?.phone || service.phone,
        email: service.contactInfo?.email || service.email,
        website: service.website,
        hours: service.hours,
        services: service.features || service.services || [],
        specialties: service.specialties || [],
        portfolio_highlights: service.portfolio_highlights || [],
        years_experience: service.years_experience || Math.floor(Math.random() * 15) + 2,
        awards: service.awards || []
      }));
      
      setCategoryServices(transformedServices);
    } catch (err) {
      console.error('Error fetching category services:', err);
      setCategoryServices([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCategoryServices([]);
    setSelectedCategory('');
    setModalLoading(false);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const fullUrl = `${apiUrl}/vendors/categories`;
        
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        
        // Extract the data array from the API response
        const data = result.data || result || [];
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-4">
              Wedding Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading our amazing wedding services...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl border border-gray-100 overflow-hidden animate-pulse bg-white shadow-lg">
                <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-8">
                  <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-4">
              Wedding Services
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-xl text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="services" className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200/50 shadow-lg mb-6">
            <Star className="h-5 w-5 text-rose-500 mr-2" />
            <span className="text-rose-600 font-semibold text-sm">Premium Wedding Services</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Wedding Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover trusted vendors for every aspect of your wedding. From photography to catering, 
            we connect you with the <span className="text-rose-600 font-semibold">best professionals</span> in the industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(services) && services.map((service, index) => {
            const IconComponent = getServiceIcon(service.business_type);
            const colors = getServiceColors(service.business_type);
            
            return (
              <div
                key={index}
                className={cn(
                  "group relative rounded-3xl border border-white/50 overflow-hidden",
                  "transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:scale-105",
                  "bg-white/80 backdrop-blur-xl cursor-pointer",
                  "hover:border-rose-300/50"
                )}
                onClick={() => handleBrowseCategory(service.business_type)}
              >
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Image Section with enhanced design */}
                <div className="relative h-56 overflow-hidden">
                  {service.sample_image ? (
                    <img
                      src={service.sample_image}
                      alt={service.business_type}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  
                  {/* Enhanced fallback gradient background with icon */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br flex items-center justify-center relative",
                    colors.gradient,
                    service.sample_image ? 'hidden' : ''
                  )}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <IconComponent className="h-16 w-16 text-white relative z-10 drop-shadow-lg" />
                  </div>
                  
                  {/* Enhanced overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Service count badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-white/50 shadow-lg">
                    <span className="text-sm font-semibold text-gray-700">{service.count}</span>
                  </div>
                  
                  {/* Category icon in bottom left */}
                  <div className="absolute bottom-4 left-4 p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Enhanced Content Section */}
                <div className="p-8 relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors duration-300">
                    {service.business_type === 'other' ? 'Other Services' : service.business_type}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.count} {service.count === 1 ? 'service' : 'services'} available
                    <br />
                    <span className="text-rose-500 font-medium">Professional & Verified</span>
                  </p>
                  
                  {/* Enhanced CTA Button */}
                  <button 
                    className={cn(
                      "w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl",
                      "hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl",
                      "transform group-hover:scale-105 relative overflow-hidden border border-white/20"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrowseCategory(service.business_type);
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <span>Browse {service.business_type === 'other' ? 'Services' : service.business_type}</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
                  </button>
                </div>
              </div>
            );
          }) || (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No services available at the moment.</p>
            </div>
          )}
        </div>

        {/* Enhanced View All Services Button */}
        <div className="text-center mt-16">
          <button 
            onClick={() => navigate('/individual/services')}
            className={cn(
              "px-12 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white font-bold rounded-full text-lg",
              "hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300",
              "shadow-2xl hover:shadow-gray-500/25 border border-white/20 group relative overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full"></div>
            <div className="relative z-10 flex items-center">
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 skew-x-12"></div>
          </button>
        </div>
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        category={selectedCategory} 
        services={categoryServices} 
        loading={modalLoading}
        onServiceDetails={handleServiceDetails}
      />

      {/* Enhanced Service Details Modal */}
      {selectedService && (
        <EnhancedServiceModal
          service={selectedService}
          isOpen={enhancedModalOpen}
          isLiked={likedServices.has(selectedService.id)}
          onClose={handleCloseEnhancedModal}
          onContact={handleContactService}
          onToggleLike={handleToggleLike}
        />
      )}
    </section>
  );
};
