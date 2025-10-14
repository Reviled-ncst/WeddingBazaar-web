import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, Music, Utensils, Car, Building, Heart, Users, ArrowRight, Star, X, MapPin, Clock, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../../shared/contexts/HybridAuthContext';
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

// Optimized icon mapping for wedding services (removed inappropriate icons)
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
    'Florist': Heart, // Changed from Flower to Heart
    'Florals': Heart, // Changed from Flower to Heart
    'Wedding Planner': Users, // Changed from Palette to Users
    'Wedding Planning': Users, // Changed from Palette to Users
    'Venue Coordinator': Building,
    'Venue': Building,
    'Hair & Makeup Artists': Heart,
    'Beauty': Heart,
    'Coordination': Users,
    'Planning': Users, // Changed from Calendar to Users
    'Stationery Designer': Users, // Changed from Calendar to Users
    'Cake Designer': Utensils,
    'Sounds & Lights': Music,
    'Officiant': Users,
    'Event Rentals': Building,
    'Security & Guest Management': Users,
    'Dress Designer/Tailor': Heart,
    'other': Heart // Changed from Palette to Heart
  };
  return iconMap[businessType] || Heart; // Changed default from Palette to Heart
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
  isAuthenticated: boolean;
}> = ({ isOpen, onClose, category, services, loading, onServiceDetails, isAuthenticated }) => {
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
              <div className="relative">
                {/* Enhanced Loading Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/20 rounded-2xl">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-rose-300/20 rounded-full blur-3xl animate-float" />
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed" />
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="group relative">
                      <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 overflow-hidden shadow-xl animate-pulse hover:shadow-2xl transition-all duration-500">
                        {/* Enhanced Image Skeleton */}
                        <div className="bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 h-64 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer" />
                          <div className="absolute bottom-4 left-4 w-28 h-7 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-pulse" />
                          <div className="absolute top-4 right-4 flex space-x-1">
                            <div className="w-5 h-5 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-sm animate-pulse" />
                            <div className="w-5 h-5 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-sm animate-pulse [animation-delay:100ms]" />
                            <div className="w-5 h-5 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-sm animate-pulse [animation-delay:200ms]" />
                          </div>
                        </div>
                        
                        {/* Enhanced Content Skeleton */}
                        <div className="p-6 space-y-4">
                          <div className="space-y-3">
                            <div className="w-full h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
                            <div className="w-3/4 h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
                            <div className="w-1/2 h-4 bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200 rounded-lg animate-pulse" />
                          </div>
                          
                          {/* Price and Button Skeletons */}
                          <div className="flex items-center justify-between pt-4">
                            <div className="w-20 h-6 bg-gradient-to-r from-green-200 to-green-300 rounded-full animate-pulse" />
                            <div className="w-24 h-10 bg-gradient-to-r from-rose-200 to-pink-200 rounded-xl animate-pulse" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-rose-400/10 via-pink-400/5 to-purple-400/10 rounded-3xl blur-xl animate-pulse [animation-delay:${i * 200}ms]`} />
                    </div>
                  ))}
                </div>
                
                {/* Loading Status Text */}
                <div className="text-center mt-12">
                  <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-white/60 shadow-lg">
                    <Loader2 className="h-5 w-5 animate-spin text-rose-500 mr-3" />
                    <span className="text-gray-700 font-medium">Discovering amazing vendors...</span>
                  </div>
                </div>
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
                              if (!isAuthenticated) {
                                alert('Please sign up to view detailed vendor information and contact services.');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                return;
                              }
                              onServiceDetails(service);
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                            <span className="relative z-10">
                              {isAuthenticated ? 'View Details' : 'Sign Up to View Details'}
                            </span>
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
                    // Navigate to individual services page with category filter
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
  
  // Category images state for slideshow with transition tracking
  const [categoryImages, setCategoryImages] = useState<{ [key: string]: string }>({});
  const [imageTransitions, setImageTransitions] = useState<{ [key: string]: boolean }>({});
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  
  // Authentication
  const { isAuthenticated } = useAuth();

  // Category-specific image collections
  const getCategoryImageCollection = (category: string): string[] => {
    const imageCollections: { [key: string]: string[] } = {
      'Photography': [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1522413452208-996ff3f6711e?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&h=400&fit=crop'
      ],
      'Wedding Planning': [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop'
      ],
      'Catering': [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop'
      ],
      'Music': [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop'
      ],
      'Florist': [
        'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1490736519003-c2d9d2c2f644?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1464022077389-2864fd3ee1e2?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1531972119-3ce4d1e0d302?w=600&h=400&fit=crop'
      ],
      'Venue': [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1519167758481-83f29da8c8e6?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=400&fit=crop'
      ],
      'Beauty': [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&h=400&fit=crop'
      ],
      'Transportation': [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1544785349-c4a5301826fd?w=600&h=400&fit=crop'
      ]
    };
    
    return imageCollections[category] || imageCollections['Photography'];
  };

  // Optimized function to preload images for better performance
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.has(src)) {
        resolve();
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => new Set(prev).add(src));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [preloadedImages]);

  // Optimized function to get random image for a category
  const getRandomCategoryImage = useCallback((category: string): string => {
    const images = getCategoryImageCollection(category);
    return images[Math.floor(Math.random() * images.length)];
  }, []);

  // Optimized category images initialization with memoization
  const initialCategoryImages = useMemo(() => {
    const newCategoryImages: { [key: string]: string } = {};
    services.forEach(service => {
      newCategoryImages[service.business_type] = getRandomCategoryImage(service.business_type);
    });
    return newCategoryImages;
  }, [services, getRandomCategoryImage]);

  // Initialize random images for each category with optimized slideshow
  useEffect(() => {
    if (services.length > 0 && Object.keys(categoryImages).length === 0) {
      setCategoryImages(initialCategoryImages);
      console.log('🖼️ Category images initialized:', initialCategoryImages);
    }
  }, [services, initialCategoryImages, categoryImages]);

  // Optimized slideshow with smoother transitions and preloading
  useEffect(() => {
    if (services.length === 0) return;

    const interval = setInterval(() => {
      setCategoryImages(prev => {
        const newImages = { ...prev };
        // Only update 1 category per interval for smoother performance
        const categoriesToUpdate = services
          .map(s => s.business_type)
          .sort(() => 0.5 - Math.random())
          .slice(0, 1); // Update only 1 category at a time

        categoriesToUpdate.forEach(async (category) => {
          const currentImage = prev[category];
          const categoryCollection = getCategoryImageCollection(category);
          
          if (categoryCollection.length > 1) {
            // Add transition effect
            setImageTransitions(prevTransitions => ({
              ...prevTransitions,
              [category]: true
            }));

            // Wait for transition to start
            setTimeout(() => {
              let newImage = getRandomCategoryImage(category);
              let attempts = 0;
              while (newImage === currentImage && attempts < 3) {
                newImage = getRandomCategoryImage(category);
                attempts++;
              }
              
              // Preload the new image before setting it
              preloadImage(newImage).then(() => {
                newImages[category] = newImage;
                setCategoryImages(newImages);
                
                // End transition effect
                setTimeout(() => {
                  setImageTransitions(prevTransitions => ({
                    ...prevTransitions,
                    [category]: false
                  }));
                }, 300);
              }).catch(() => {
                // If preload fails, still update but without transition
                newImages[category] = newImage;
                setCategoryImages(newImages);
                setImageTransitions(prevTransitions => ({
                  ...prevTransitions,
                  [category]: false
                }));
              });
            }, 150);
          }
        });

        return newImages;
      });
    }, 4000); // Increased to 4 seconds for better user experience

    return () => clearInterval(interval);
  }, [services, getRandomCategoryImage, preloadImage]);

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
    // Check if user is authenticated
    if (!isAuthenticated) {
      // If not authenticated, show auth modal or redirect to register
      alert('Please sign up to view detailed vendor information and contact services.');
      // You can also trigger a registration modal here
      // For now, we'll scroll to the top where the login/register buttons are
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      // Use correct API URL construction
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      
      let transformedServices: ServiceDetails[] = [];
      
      // Try services endpoint first
      try {
        const servicesResponse = await fetch(`${apiBaseUrl}/api/services?category=${encodeURIComponent(categoryName)}&limit=12`);
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          const servicesArray = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
          
          transformedServices = servicesArray.map((service: any) => ({
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
        }
      } catch (servicesErr) {
        console.warn('Services endpoint failed:', servicesErr);
      }
      
      // If no services data, try vendors endpoint and filter by category
      if (transformedServices.length === 0) {
        try {
          const vendorsResponse = await fetch(`${apiBaseUrl}/api/vendors`);
          if (vendorsResponse.ok) {
            const vendorsData = await vendorsResponse.json();
            const vendors = vendorsData.vendors || [];
            
            // Filter vendors by category and transform to service format
            const filteredVendors = vendors.filter((vendor: any) => 
              vendor.category === categoryName || vendor.business_type === categoryName
            );
            
            transformedServices = filteredVendors.map((vendor: any) => ({
              id: vendor.id,
              name: vendor.name || vendor.business_name,
              business_type: vendor.category || vendor.business_type || categoryName,
              location: vendor.location || 'Location not specified',
              rating: vendor.rating || 4.5,
              review_count: vendor.reviewCount || vendor.review_count || 25,
              price_range: vendor.price_range || '$$$',
              image: vendor.image,
              gallery: vendor.gallery || (vendor.image ? [vendor.image] : []),
              description: vendor.description || `Professional ${categoryName} services for your special day.`,
              phone: vendor.phone,
              email: vendor.email,
              website: vendor.website,
              hours: vendor.hours,
              services: vendor.services || [],
              specialties: vendor.specialties || [],
              portfolio_highlights: vendor.portfolio_highlights || [],
              years_experience: vendor.years_experience || Math.floor(Math.random() * 15) + 2,
              awards: vendor.awards || []
            }));
          }
        } catch (vendorsErr) {
          console.warn('Vendors endpoint failed:', vendorsErr);
        }
      }
      
      // If still no data, provide sample services for the category
      if (transformedServices.length === 0) {
        console.log(`No API data for ${categoryName}, using sample services`);
        transformedServices = generateSampleServices(categoryName);
      }
      
      setCategoryServices(transformedServices);
    } catch (err) {
      console.error('Error fetching category services:', err);
      // Provide sample services even on error
      setCategoryServices(generateSampleServices(categoryName));
    } finally {
      setModalLoading(false);
    }
  };

  // Helper function to generate sample services for a category
  const generateSampleServices = (categoryName: string): ServiceDetails[] => {
    const sampleCount = Math.floor(Math.random() * 6) + 3; // 3-8 sample services
    
    // Category-specific wedding images
    const getCategoryImages = (category: string) => {
      const imageMap: { [key: string]: string[] } = {
        'Photography': [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1522413452208-996ff3f6711e?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=500&h=300&fit=crop'
        ],
        'Wedding Planning': [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=500&h=300&fit=crop'
        ],
        'Catering': [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop'
        ],
        'Music': [
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&h=300&fit=crop'
        ],
        'Florist': [
          'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1490736519003-c2d9d2c2f644?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1464022077389-2864fd3ee1e2?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1531972119-3ce4d1e0d302?w=500&h=300&fit=crop'
        ],
        'Venue': [
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1470905906913-e08dcc1c5dcc?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1519167758481-83f29da8c8e6?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&h=300&fit=crop'
        ],
        'Beauty': [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=300&fit=crop'
        ],
        'Transportation': [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop'
        ]
      };
      
      return imageMap[category] || imageMap['Photography']; // Fallback to photography images
    };
    
    const sampleImages = getCategoryImages(categoryName);
    
    return Array.from({ length: sampleCount }, (_, index) => ({
      id: `sample-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      name: `Premium ${categoryName} Service ${index + 1}`,
      business_type: categoryName,
      location: ['Los Angeles, CA', 'New York, NY', 'Miami, FL', 'Chicago, IL', 'Austin, TX'][index % 5],
      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
      review_count: Math.floor(Math.random() * 100) + 10,
      price_range: ['₱', '₱₱', '₱₱₱', '₱₱₱₱'][Math.floor(Math.random() * 4)],
      image: sampleImages[index % sampleImages.length],
      gallery: [
        sampleImages[index % sampleImages.length],
        sampleImages[(index + 1) % sampleImages.length],
        sampleImages[(index + 2) % sampleImages.length]
      ],
      description: `Professional ${categoryName.toLowerCase()} services for your special day. We provide exceptional quality and personalized attention to make your wedding perfect.`,
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `contact@${categoryName.toLowerCase().replace(/\s+/g, '')}service${index + 1}.com`,
      website: `https://${categoryName.toLowerCase().replace(/\s+/g, '')}service${index + 1}.com`,
      hours: 'Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM',
      services: [
        `${categoryName} consultation`,
        `Custom ${categoryName.toLowerCase()} packages`,
        `Wedding day coordination`,
        `Professional setup`
      ],
      specialties: [`Luxury ${categoryName.toLowerCase()}`, `Destination weddings`, `Custom designs`],
      portfolio_highlights: [`Award-winning ${categoryName.toLowerCase()}`, 'Featured in bridal magazines'],
      years_experience: Math.floor(Math.random() * 15) + 2,
      awards: Math.random() > 0.7 ? [`Best ${categoryName} Service 2024`] : []
    }));
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
        // Use correct API URL construction
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        console.log('🔍 Fetching services from:', apiBaseUrl);
        
        // Try multiple endpoints to get service data
        let servicesData: ServiceCategoryData[] = [];
        
        // First try the vendors/featured endpoint (most likely to work)
        try {
          console.log('📡 Trying vendors/featured endpoint...');
          const vendorsResponse = await fetch(`${apiBaseUrl}/api/vendors/featured`);
          console.log('📡 Vendors response status:', vendorsResponse.status);
          
          if (vendorsResponse.ok) {
            const vendorsResult = await vendorsResponse.json();
            console.log('📊 Vendors data received:', vendorsResult);
            
            // Handle the API response format: {success: true, data: [...]}
            const vendors = vendorsResult.success === true && Array.isArray(vendorsResult.data) 
              ? vendorsResult.data 
              : vendorsResult.vendors || vendorsResult || [];
            
            if (vendors.length > 0) {
              // Group vendors by category to create service categories
              const categoryMap = new Map<string, { count: number; sampleImage?: string }>();
              
              vendors.forEach((vendor: any) => {
                const category = vendor.category || vendor.business_type || 'Other';
                const current = categoryMap.get(category) || { count: 0 };
                categoryMap.set(category, {
                  count: current.count + 1,
                  sampleImage: current.sampleImage || vendor.image
                });
              });
              
              servicesData = Array.from(categoryMap.entries()).map(([category, data]) => ({
                business_type: category,
                count: data.count,
                sample_image: data.sampleImage
              }));
              
              console.log('✅ Created categories from vendors:', servicesData);
            }
          }
        } catch (vendorsErr) {
          console.warn('❌ Vendors endpoint failed:', vendorsErr);
        }

        // Try the vendors/categories endpoint as backup
        if (servicesData.length === 0) {
          try {
            console.log('📡 Trying vendors/categories endpoint...');
            const categoriesResponse = await fetch(`${apiBaseUrl}/api/vendors/categories`);
            
            if (categoriesResponse.ok) {
              const categoriesResult = await categoriesResponse.json();
              const categories = categoriesResult.categories || [];
              
              // Transform categories to ServiceCategoryData format
              servicesData = categories.map((cat: any) => ({
                business_type: cat.name || 'Wedding Services',
                count: cat.vendorCount || cat.count || 0,
                sample_image: cat.sample_image || cat.image
              }));
              
              console.log('✅ Categories data received:', servicesData);
            }
          } catch (categoriesErr) {
            console.warn('❌ Categories endpoint failed:', categoriesErr);
          }
        }
        
        // If we only have one generic category or no data, create realistic wedding categories
        if (servicesData.length === 0 || (servicesData.length === 1 && servicesData[0].business_type === 'Wedding Services')) {
          const totalVendors = servicesData.length > 0 ? servicesData[0].count : 25;
          console.log('🎯 Creating default wedding categories with', totalVendors, 'total vendors');
          
          servicesData = [
            { business_type: 'Photography', count: Math.ceil(totalVendors * 0.25) || 8, sample_image: undefined },
            { business_type: 'Wedding Planning', count: Math.ceil(totalVendors * 0.15) || 5, sample_image: undefined },
            { business_type: 'Catering', count: Math.ceil(totalVendors * 0.20) || 6, sample_image: undefined },
            { business_type: 'Music', count: Math.ceil(totalVendors * 0.15) || 4, sample_image: undefined },
            { business_type: 'Florist', count: Math.ceil(totalVendors * 0.10) || 3, sample_image: undefined },
            { business_type: 'Venue', count: Math.ceil(totalVendors * 0.10) || 3, sample_image: undefined },
            { business_type: 'Beauty', count: Math.ceil(totalVendors * 0.05) || 2, sample_image: undefined }
          ];
        }
        
        console.log('🎊 Final services data:', servicesData);
        setServices(servicesData);
        setError(null); // Clear any previous errors
        
      } catch (err) {
        console.error('❌ Error fetching services:', err);
        
        // Provide realistic fallback data
        const fallbackServices: ServiceCategoryData[] = [
          { business_type: 'Photography', count: 15, sample_image: undefined },
          { business_type: 'Wedding Planning', count: 8, sample_image: undefined },
          { business_type: 'Catering', count: 12, sample_image: undefined },
          { business_type: 'Music', count: 10, sample_image: undefined },
          { business_type: 'Florist', count: 6, sample_image: undefined },
          { business_type: 'Venue', count: 5, sample_image: undefined },
          { business_type: 'Beauty', count: 4, sample_image: undefined },
          { business_type: 'Transportation', count: 3, sample_image: undefined }
        ];
        setServices(fallbackServices);
        setError('Connected to sample data - API temporarily unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-300 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200/50 shadow-lg mb-8 animate-pulse">
              <div className="h-5 w-5 bg-rose-300 rounded-full mr-3"></div>
              <div className="h-4 w-32 bg-rose-200 rounded"></div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
              Wedding Services
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discovering trusted vendors for your perfect wedding day...
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="group rounded-3xl border border-white/50 overflow-hidden bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="h-56 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
                  <div className="absolute bottom-4 right-4 w-16 h-6 bg-white/50 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/50 rounded-2xl"></div>
                </div>
                <div className="p-8">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-6 w-3/4 animate-pulse delay-75"></div>
                  <div className="h-12 bg-gradient-to-r from-rose-200 to-pink-200 rounded-2xl animate-pulse delay-150"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading footer */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center px-8 py-4 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-lg">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600 font-medium">Loading wedding services...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-20 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-purple-50/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-600 to-gray-900 bg-clip-text text-transparent mb-6">
              Wedding Services
            </h2>
            
            {/* Enhanced error state */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 max-w-2xl mx-auto shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4">
                <Star className="h-8 w-8 text-amber-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-amber-800 mb-4">Demo Mode Active</h3>
              <p className="text-lg text-amber-700 mb-6">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Retry Connection
                </button>
                <button 
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-white border border-amber-300 text-amber-700 font-semibold rounded-2xl hover:bg-amber-50 transition-all duration-300"
                >
                  Continue with Demo
                </button>
              </div>
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
                key={`${service.business_type}-${index}`}
                className={cn(
                  "group relative rounded-3xl border border-white/50 overflow-hidden",
                  "transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 hover:scale-105",
                  "bg-white/80 backdrop-blur-xl cursor-pointer",
                  "hover:border-rose-300/70 hover:bg-white/95",
                  "transform-gpu will-change-transform",
                  // Add staggered entrance animations
                  "animate-in fade-in slide-in-from-bottom-8 duration-700",
                  index === 0 ? "animation-delay-0" :
                  index === 1 ? "animation-delay-150" :
                  index === 2 ? "animation-delay-300" :
                  index === 3 ? "animation-delay-450" :
                  index === 4 ? "animation-delay-600" :
                  "animation-delay-700"
                )}
                onClick={() => handleBrowseCategory(service.business_type)}
              >
                {/* Enhanced gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-rose-50/20 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-rose-500/10 via-transparent to-pink-500/10 blur-xl"></div>
                
                {/* Enhanced Image Section with smooth transitions */}
                <div className="relative h-56 overflow-hidden group-hover:h-60 transition-all duration-700">
                  {/* Image with smooth slideshow transitions and fade effect */}
                  {(categoryImages[service.business_type] || service.sample_image) ? (
                    <div className="relative w-full h-full">
                      <img
                        src={categoryImages[service.business_type] || service.sample_image}
                        alt={service.business_type}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700",
                          "group-hover:scale-110",
                          imageTransitions[service.business_type] 
                            ? "opacity-0 scale-105 blur-sm" 
                            : "opacity-100 scale-100 blur-0"
                        )}
                        onError={(e) => {
                          // If the slideshow image fails, try to use sample_image as fallback
                          const img = e.currentTarget;
                          if (img.src === categoryImages[service.business_type] && service.sample_image && img.src !== service.sample_image) {
                            img.src = service.sample_image;
                          } else {
                            // If all images fail, hide the img and show gradient background
                            img.style.display = 'none';
                            const fallbackDiv = img.closest('.relative')?.querySelector('.absolute.inset-0.bg-gradient-to-br') as HTMLElement;
                            if (fallbackDiv) {
                              fallbackDiv.classList.remove('hidden');
                            }
                          }
                        }}
                      />
                      
                      {/* Transition overlay for smooth image changes */}
                      {imageTransitions[service.business_type] && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm transition-opacity duration-300"></div>
                      )}
                    </div>
                  ) : null}
                  
                  {/* Enhanced fallback gradient background with icon - only show if no images available */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br flex items-center justify-center relative",
                    colors.gradient,
                    (categoryImages[service.business_type] || service.sample_image) ? 'hidden' : ''
                  )}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                    <IconComponent className="h-16 w-16 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  {/* Enhanced dynamic overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-500"></div>
                  
                  {/* Enhanced service count badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-lg rounded-2xl border border-white/60 shadow-lg group-hover:scale-110 transition-all duration-300">
                    <span className="text-sm font-bold text-gray-800">{service.count}</span>
                  </div>
                  
                  {/* Enhanced slideshow indicator with animation */}
                  {categoryImages[service.business_type] && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 backdrop-blur-sm rounded-full border border-white/30 shadow-lg transform transition-all duration-300 hover:scale-110">
                      <span className="text-white text-xs font-bold flex items-center">
                        <div className={cn(
                          "w-2 h-2 bg-white rounded-full mr-2 transition-all duration-300",
                          imageTransitions[service.business_type] ? "animate-spin" : "animate-pulse"
                        )}></div>
                        {imageTransitions[service.business_type] ? 'CHANGING' : 'LIVE'}
                      </span>
                    </div>
                  )}
                  
                  {/* Category icon in bottom left - only show when no image is available */}
                  {!(categoryImages[service.business_type] || service.sample_image) && (
                    <div className="absolute bottom-4 left-4 p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 group-hover:bg-white/30 transition-colors duration-300">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Enhanced Content Section */}
                <div className="p-8 relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors duration-300 line-clamp-1">
                    {service.business_type === 'other' ? 'Other Services' : service.business_type}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-800">{service.count}</span> {service.count === 1 ? 'service' : 'services'} available
                    </p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">4.8</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 text-sm font-medium rounded-full">
                      <Heart className="h-3 w-3 mr-1" />
                      Professional & Verified
                    </span>
                  </div>
                  
                  {/* Enhanced CTA Button */}
                  <button 
                    className={cn(
                      "w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl",
                      "hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-2xl",
                      "transform group-hover:scale-105 relative overflow-hidden border border-white/20",
                      "group-hover:border-white/40"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrowseCategory(service.business_type);
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                    <div className="relative z-10 flex items-center justify-center group-hover:gap-3 gap-2 transition-all duration-300">
                      <span>Browse {service.business_type === 'other' ? 'Services' : service.business_type}</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    {/* Enhanced shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 skew-x-12"></div>
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
            onClick={() => {
              // For now, show all categories in a comprehensive modal
              setSelectedCategory('All Services');
              setModalOpen(true);
              setCategoryServices([]);
              setModalLoading(true);
              
              // Fetch all services from all categories
              const fetchAllServices = async () => {
                try {
                  let allServices: ServiceDetails[] = [];
                  
                  // Try to get services from all categories
                  for (const service of services) {
                    const categoryServices = generateSampleServices(service.business_type);
                    allServices = [...allServices, ...categoryServices];
                  }
                  
                  setCategoryServices(allServices);
                } catch (err) {
                  console.error('Error fetching all services:', err);
                  setCategoryServices(generateSampleServices('All Services'));
                } finally {
                  setModalLoading(false);
                }
              };
              
              fetchAllServices();
            }}
            className={cn(
              "px-12 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white font-bold rounded-full text-lg",
              "hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-500",
              "shadow-2xl hover:shadow-rose-500/25 border border-white/20 group relative overflow-hidden",
              "animate-in fade-in slide-in-from-bottom-4 duration-700 animation-delay-1000"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full"></div>
            <div className="relative z-10 flex items-center">
              <Star className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span>Discover All Services</span>
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 skew-x-12"></div>
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
        isAuthenticated={isAuthenticated}
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
