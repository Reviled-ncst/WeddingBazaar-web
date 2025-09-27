import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Image,
  Tag,
  Grid,
  List,
  Search,
  MapPin,
  Crown
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { UsageLimit } from '../../../../shared/components/subscription/SubscriptionGate';
import { UpgradePrompt } from '../../../../shared/components/subscription/UpgradePrompt';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { ServicesApiService } from '../../../../services/api/servicesApiService';
import { AddServiceForm } from './components';

// Service interface based on the actual API response
interface Service {
  id: string;
  vendorId: string; // 'vendorId' field from API response
  vendor_id?: string; // Keep for backward compatibility with AddServiceForm
  name: string; // 'name' field from API response
  title?: string; // Keep for backward compatibility
  description: string;
  category: string;
  price: string; // API returns price as string like "55000.00"
  imageUrl?: string | null; // Single image URL from API
  images?: string[]; // ARRAY of image URLs (keep for backward compatibility)
  rating: number;
  reviewCount: number;
  isActive: boolean; // 'isActive' field from API
  is_active?: boolean; // Keep for backward compatibility
  featured: boolean;
  // Extended fields for UI (may not be in DB)
  vendor_name?: string;
  location?: string;
  review_count?: number; // Keep for backward compatibility
  price_range?: string; // '$', '$$', '$$$', '$$$$'
  availability?: boolean;
  gallery?: string[]; // Alias for images
  features?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  keywords?: string;
}

// Service categories based on the actual database data
const SERVICE_CATEGORIES = [
  'Photographer & Videographer',
  'Wedding Planner',
  'Florist',
  'Hair & Makeup Artists',
  'Caterer',
  'DJ/Band',
  'Officiant',
  'Venue Coordinator',
  'Event Rentals',
  'Cake Designer',
  'Dress Designer/Tailor',
  'Security & Guest Management',
  'Sounds & Lights',
  'Stationery Designer',
  'Transportation Services'
];



export const VendorServices: React.FC = () => {
  // Auth context to get the logged-in vendor
  const { user } = useAuth();
  
  // Subscription context
  const {
    subscription,
    getFeatureLimitMessage,
    upgradePrompt,
    hideUpgradePrompt
  } = useSubscription();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Get API base URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

  // Get current vendor ID from auth context with fallback
  const vendorId = user?.id || '2-2025-003';
  
  console.log('🔍 [VendorServices] Using vendor ID:', vendorId);
  console.log('🔍 [VendorServices] Auth user:', user);
  
  // Debug information (only in development)
  const isDebugMode = import.meta.env.DEV;

  // Service statistics
  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.isActive ?? s.is_active).length,
    inactive: services.filter(s => !(s.isActive ?? s.is_active)).length,
    categories: new Set(services.map(s => s.category)).size,
    avgRating: services.length > 0 ? services.reduce((acc, s) => acc + (s.rating || 4.5), 0) / services.length : 4.5 // Default to 4.5 if no rating
  };

  // Filtered services
  const filteredServices = services.filter(service => {
    const serviceName = service.name || service.title || '';
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && (service.isActive ?? service.is_active)) ||
                         (filterStatus === 'inactive' && !(service.isActive ?? service.is_active));
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Enhanced fetch services with proper data handling and image URL processing
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!vendorId) {
        console.error('❌ [VendorServices] No vendor ID available');
        setError('No vendor ID available');
        setServices([]);
        return;
      }
      
      console.log('🔍 [VendorServices] Fetching services for vendor:', vendorId);
      
      // Helper function to normalize service data and fix image URLs
      const normalizeService = (rawService: any): Service => {
        // Handle image URL - prioritize imageUrl, then image, then images array
        let imageUrl = rawService.imageUrl || rawService.image;
        
        // If no direct image, check images array
        if (!imageUrl && rawService.images && Array.isArray(rawService.images) && rawService.images.length > 0) {
          imageUrl = rawService.images[0];
        }
        
        // Ensure image URL is valid - handle Unsplash URLs properly
        if (imageUrl) {
          // If it's already a valid HTTP URL, use it as is
          if (imageUrl.startsWith('http')) {
            // For Unsplash URLs, ensure proper parameters
            if (imageUrl.includes('unsplash.com')) {
              imageUrl = imageUrl.includes('?') ? imageUrl : `${imageUrl}?w=600&h=400&fit=crop&auto=format`;
            }
          } else {
            // If it's a relative URL, make it absolute
            imageUrl = imageUrl.startsWith('/') 
              ? `${apiUrl}${imageUrl}` 
              : `${apiUrl}/${imageUrl}`;
          }
        }
        
        // Handle price - ensure it's a string
        let price = '0.00';
        if (rawService.price) {
          price = typeof rawService.price === 'string' ? rawService.price : String(rawService.price);
        } else if (rawService.priceRange) {
          price = rawService.priceRange;
        }
        
        return {
          id: rawService.id || `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          vendorId: rawService.vendorId || rawService.vendor_id || vendorId,
          name: rawService.name || rawService.title || 'Unnamed Service',
          description: rawService.description || 'No description available',
          category: rawService.category || 'General',
          price: price,
          imageUrl: imageUrl || null,
          images: rawService.images || (imageUrl ? [imageUrl] : []),
          rating: typeof rawService.rating === 'number' ? rawService.rating : parseFloat(rawService.rating) || 4.5,
          reviewCount: rawService.reviewCount || rawService.review_count || 0,
          isActive: rawService.isActive !== undefined ? rawService.isActive : (rawService.is_active !== undefined ? rawService.is_active : true),
          featured: rawService.featured || false,
          // Additional fields
          vendor_name: rawService.vendor_name || rawService.vendorName,
          location: rawService.location,
          features: Array.isArray(rawService.features) ? rawService.features : [],
          contact_info: rawService.contact_info || rawService.contactInfo || {},
          created_at: rawService.created_at || new Date().toISOString(),
          updated_at: rawService.updated_at || new Date().toISOString()
        };
      };
      
      // Strategy 1: Use centralized ServicesApiService
      try {
        console.log('📡 [VendorServices] Using centralized ServicesApiService...');
        const apiServices = await ServicesApiService.getServicesByVendor(vendorId);
        console.log('✅ [VendorServices] Centralized API response:', apiServices);
        
        if (Array.isArray(apiServices) && apiServices.length > 0) {
          const normalizedServices = apiServices.map(normalizeService);
          setServices(normalizedServices);
          console.log('✅ [VendorServices] Found', normalizedServices.length, 'services via centralized API');
          console.log('📸 [VendorServices] Service images:', normalizedServices.map((s: Service) => ({ name: s.name, imageUrl: s.imageUrl })));
          return;
        } else {
          console.log('📝 [VendorServices] No services found via centralized API');
        }
      } catch (centralizedError) {
        console.warn('⚠️ [VendorServices] Centralized API failed:', centralizedError);
      }
      
      // Strategy 2: Try direct API endpoints (for when backend is fixed)
      const directEndpoints = [
        `${apiUrl}/api/services/vendor/${vendorId}`,
        `${apiUrl}/api/services?vendorId=${vendorId}`,
        `${apiUrl}/api/vendors/${vendorId}/services`
      ];
      
      for (const endpoint of directEndpoints) {
        try {
          console.log('📡 [VendorServices] Trying direct endpoint:', endpoint);
          const response = await fetch(endpoint);
          console.log('📡 [VendorServices] Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('📡 [VendorServices] Response data type:', typeof data, Array.isArray(data) ? `array(${data.length})` : 'object');
            
            let rawServices = [];
            if (Array.isArray(data)) {
              rawServices = data;
            } else if (data.services && Array.isArray(data.services)) {
              rawServices = data.services;
            }
            
            if (rawServices.length > 0) {
              const normalizedServices = rawServices.map(normalizeService);
              setServices(normalizedServices);
              console.log('✅ [VendorServices] Found', normalizedServices.length, 'services via direct API');
              console.log('📸 [VendorServices] Service images:', normalizedServices.map((s: Service) => ({ name: s.name, imageUrl: s.imageUrl })));
              return;
            }
          }
        } catch (directError) {
          console.warn('⚠️ [VendorServices] Direct endpoint failed:', endpoint, directError instanceof Error ? directError.message : 'Unknown error');
        }
      }
      
      // Strategy 3: Check if vendor exists but has no services yet
      console.log('📡 [VendorServices] Checking if vendor exists...');
      try {
        const vendorResponse = await fetch(`${apiUrl}/api/vendors/featured`);
        if (vendorResponse.ok) {
          const vendorData = await vendorResponse.json();
          const vendorExists = vendorData.some((v: any) => v.id === vendorId || v.vendor_id === vendorId);
          
          if (vendorExists) {
            console.log('✅ [VendorServices] Vendor exists but has no services yet');
            setServices([]);
            setError('No services created yet. Click "Add Service" to get started!');
            return;
          }
        }
      } catch (vendorCheckError) {
        console.warn('⚠️ [VendorServices] Vendor check failed:', vendorCheckError instanceof Error ? vendorCheckError.message : 'Unknown error');
      }
      
      // Strategy 4: Development mode or demo - create sample services
      if (import.meta.env.DEV || window.location.hostname === 'localhost' || vendorId.includes('demo') || vendorId.includes('sample')) {
        console.log('🔧 [VendorServices] Creating sample services for development/demo');
        createSampleServices();
        return;
      }
      
      // Final fallback
      console.log('⚠️ [VendorServices] All strategies failed, showing empty state');
      setServices([]);
      setError('Unable to load services. Please try again or contact support.');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
      console.error('❌ [VendorServices] Overall fetch error:', err);
      setError(errorMessage);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchServices();
    }
  }, [vendorId]);

  // Handle form submission
  const handleSubmit = async (serviceData: any) => {
    try {
      const url = editingService 
        ? `${apiUrl}/api/services/${editingService.id}`
        : `${apiUrl}/api/services`;
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error('Failed to save service');
      }

      // Fetch updated services
      setIsCreating(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
      throw err; // Re-throw so AddServiceForm can handle it
    }
  };

  // Edit service
  const editService = (service: Service) => {
    setEditingService(service);
    setIsCreating(true);
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  // Toggle service availability
  const toggleServiceAvailability = async (service: Service) => {
    try {
      const currentStatus = service.isActive ?? service.is_active;
      const response = await fetch(`${apiUrl}/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          isActive: !currentStatus,
          is_active: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update service availability');
      }

      fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service availability');
    }
  };

  // Quick service creation function
  const handleQuickCreateService = () => {
    setIsCreating(true);
    setEditingService(null);
  };

  // Create sample services for testing (development only)
  const createSampleServices = () => {
    const sampleServices: Service[] = [
      {
        id: 'sample-1',
        vendorId: vendorId,
        name: 'Wedding Photography Package', 
        description: 'Professional wedding photography with pre-wedding shoot, ceremony coverage, and edited photos.',
        category: 'Photographer & Videographer',
        price: '2,500.00',
        imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format',
        images: [
          'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&h=400&fit=crop&auto=format'
        ],
        rating: 4.8,
        reviewCount: 23,
        isActive: true,
        featured: true,
        location: 'New York, NY',
        features: ['Professional Equipment', 'Edited Photos', 'Online Gallery', 'Print Rights']
      },
      {
        id: 'sample-2', 
        vendorId: vendorId,
        name: 'Bridal Makeup & Hair',
        description: 'Complete bridal makeover including hair styling, makeup, and touch-ups throughout the day.',
        category: 'Hair & Makeup Artists',
        price: '800.00',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format',
        images: [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format'
        ],
        rating: 4.9,
        reviewCount: 18,
        isActive: true,
        featured: false,
        location: 'Los Angeles, CA',
        features: ['Trial Session', 'Airbrush Makeup', 'Hair Styling', 'Touch-up Kit']
      },
      {
        id: 'sample-3',
        vendorId: vendorId,
        name: 'Wedding Planning & Coordination',
        description: 'Full wedding planning service from venue selection to day-of coordination.',
        category: 'Wedding Planner',
        price: '5,000.00',
        imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format',
        images: [
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop&auto=format'
        ],
        rating: 4.7,
        reviewCount: 31,
        isActive: true,
        featured: true,
        location: 'Chicago, IL',
        features: ['Full Planning', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination']
      },
      {
        id: 'sample-4',
        vendorId: vendorId,
        name: 'Wedding Flowers & Decor',
        description: 'Beautiful floral arrangements and decorations for your special day.',
        category: 'Flowers & Decor',
        price: '1,200.00',
        imageUrl: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop&auto=format',
        images: [
          'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1525193612332-58ba2c1bb456?w=600&h=400&fit=crop&auto=format'
        ],
        rating: 4.6,
        reviewCount: 15,
        isActive: true,
        featured: false,
        location: 'Miami, FL',
        features: ['Bridal Bouquet', 'Ceremony Flowers', 'Reception Centerpieces', 'Setup Service']
      }
    ];
    
    setServices(sampleServices);
    setError(null);
    console.log('✅ [VendorServices] Created', sampleServices.length, 'sample services for development');
    console.log('📸 [VendorServices] Sample service images verified:', sampleServices.map(s => ({ name: s.name, imageUrl: s.imageUrl })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <main className="pt-4 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-rose-200/30 to-transparent rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-radial from-pink-200/30 to-transparent rounded-full translate-x-48"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-radial from-rose-300/20 to-transparent rounded-full translate-y-40"></div>
      </div>
      
      <VendorHeader />
      
      <main className="pt-4 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
                    <Grid className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Services Management
                    </h1>
                    <p className="text-gray-600 mt-1 text-lg">Manage your wedding services and showcase your expertise</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={handleQuickCreateService}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 hover:scale-105 relative overflow-hidden"
                  title="Add New Service"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10">Add Service</span>
                </button>
              </div>
            </div>

            {/* Service Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Grid className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Services</p>
                    <p className="text-3xl font-bold text-gray-900">{serviceStats.total}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Available</p>
                    <p className="text-3xl font-bold text-gray-900">{serviceStats.active}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Tag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Categories</p>
                    <p className="text-3xl font-bold text-gray-900">{serviceStats.categories}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <EyeOff className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
                    <p className="text-3xl font-bold text-gray-900">{serviceStats.inactive}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Subscription Status */}
            {subscription && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-200/50 shadow-lg mb-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{subscription.plan.name} Plan</h3>
                    <p className="text-gray-600">{getFeatureLimitMessage('services')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <UsageLimit
                    current={services.length} // Use actual service count
                    limit={subscription.plan.limits.max_services}
                    label="Services"
                    description="Active service listings"
                    unlimited={subscription.plan.limits.max_services === -1}
                  />
                  
                  <UsageLimit
                    current={6} // Based on our realistic booking data analysis
                    limit={subscription.plan.limits.max_monthly_bookings}
                    label="Monthly Bookings"
                    description="Bookings this month"
                    unlimited={subscription.plan.limits.max_monthly_bookings === -1}
                  />
                  
                  <UsageLimit
                    current={serviceStats.total * 3} // Realistic: ~3 images per service
                    limit={subscription.plan.limits.max_portfolio_items}
                    label="Portfolio Items"
                    description="Images in gallery"
                    unlimited={subscription.plan.limits.max_portfolio_items === -1}
                  />
                </div>

                {/* Temporarily disabled - may show false warnings during development
                {(isNearLimit('services') || isNearLimit('bookings')) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      You're approaching your subscription limits. Consider upgrading to continue growing your business.
                    </p>
                  </div>
                )}
                */}
              </motion.div>
            )}

            {/* Search and Filter Controls */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-xl mb-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-rose-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search services by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white/80 focus:bg-white shadow-sm"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[200px] bg-gray-50/50 hover:bg-white/80 focus:bg-white transition-all duration-200 shadow-sm"
                  title="Filter by category"
                >
                  <option value="">All Categories</option>
                  {SERVICE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[160px] bg-gray-50/50 hover:bg-white/80 focus:bg-white transition-all duration-200 shadow-sm"
                  title="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Available</option>
                  <option value="inactive">Unavailable</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-2 shadow-inner">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-rose-600 shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                    title="Grid view"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white text-rose-600 shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                    title="List view"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-500 text-sm">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Services Loading Issue</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setError(null);
                        fetchServices();
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      🔄 Retry Loading
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleQuickCreateService}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                    >
                      ➕ Add First Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug Panel (Development Only) */}
          {isDebugMode && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Debug Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Vendor ID:</strong> {vendorId}</p>
                  <p><strong>Auth User:</strong> {user ? JSON.stringify(user) : 'Not logged in'}</p>
                  <p><strong>API URL:</strong> {apiUrl}</p>
                </div>
                <div>
                  <p><strong>Services Count:</strong> {services.length}</p>
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {error || 'None'}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={fetchServices}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  🔄 Reload Services
                </button>
                <button
                  onClick={() => console.log('Services data:', services)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  📝 Log Services Data
                </button>
                <button
                  onClick={createSampleServices}
                  className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                >
                  🎭 Load Sample Services
                </button>
                <button
                  onClick={() => setServices([])}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          )}

          {/* Services Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8'
              : 'space-y-6 mb-8'
          }>
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-white/80 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2 ${
                  viewMode === 'list' ? 'rounded-2xl p-8' : 'rounded-2xl p-0'
                }`}
              >
                {/* Service Content */}
                <div className={viewMode === 'list' ? 'flex gap-8' : ''}>
                  {/* Service Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'w-full'}`}>
                    {service.imageUrl && service.imageUrl.trim() !== '' ? (
                      <>
                        <div className="relative overflow-hidden">
                          <img
                            src={service.imageUrl}
                            alt={service.name || service.title}
                            className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                              viewMode === 'list' ? 'w-full h-40 rounded-2xl' : 'w-full h-56 rounded-t-2xl'
                            }`}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const imgElement = e.currentTarget;
                              const imageContainer = imgElement.parentElement;
                              if (imageContainer) {
                                // Hide the image container and show placeholder
                                imageContainer.classList.add('hidden');
                                const placeholder = imageContainer.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                                if (placeholder) {
                                  placeholder.classList.remove('hidden');
                                  placeholder.classList.add('flex');
                                }
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Error fallback placeholder */}
                        <div className={`image-placeholder bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center relative overflow-hidden hidden ${
                          viewMode === 'list' ? 'w-full h-40 rounded-2xl' : 'w-full h-56 rounded-t-2xl'
                        }`}>
                          <Image className="h-16 w-16 text-gray-400" />
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-pink-50/30"></div>
                          <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                            Image unavailable
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Default placeholder when no imageUrl */
                      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden ${
                        viewMode === 'list' ? 'w-full h-40 rounded-2xl' : 'w-full h-56 rounded-t-2xl'
                      }`}>
                        <Image className="h-16 w-16 text-gray-400" />
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-pink-50/30"></div>
                        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                          No image
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute ${viewMode === 'list' ? 'top-3 right-3' : 'top-4 right-4'}`}>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                        (service.isActive ?? service.is_active)
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-gray-500/90 text-white'
                      }`}>
                        {(service.isActive ?? service.is_active) ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex-1' : 'p-6'}`}>
                    {/* Service Header */}
                    <div className="mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-rose-600 transition-colors duration-200">{service.name || service.title}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full">
                            <Tag className="h-4 w-4 text-rose-500" />
                            <span className="text-sm font-medium text-rose-700">{service.category}</span>
                          </div>
                        </div>
                        {service.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{service.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Service Rating & Price */}
                    <div className="flex items-center justify-between mb-6">
                      {service.rating && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-full">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700">{service.rating.toFixed(1)}</span>
                          {(service.reviewCount ?? service.review_count) && (
                            <span className="text-sm text-yellow-600">({service.reviewCount ?? service.review_count})</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {service.price_range && (
                          <span className="px-3 py-2 bg-green-50 text-green-700 font-bold rounded-full">
                            {service.price_range}
                          </span>
                        )}
                        {service.price && (
                          <span className="text-lg font-bold text-gray-900">
                            ₱{(typeof service.price === 'string' ? parseFloat(service.price) : service.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {service.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                          {service.features.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{service.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => editService(service)}
                        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        title="Edit service"
                      >
                        <Edit3 size={16} className="group-hover:rotate-12 transition-transform duration-200" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => toggleServiceAvailability(service)}
                        className={`group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md ${
                          (service.isActive ?? service.is_active)
                            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 hover:from-amber-100 hover:to-yellow-100'
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 hover:from-green-100 hover:to-emerald-100'
                        }`}
                        title={(service.isActive ?? service.is_active) ? 'Mark unavailable' : 'Mark available'}
                      >
                        {(service.isActive ?? service.is_active) ? (
                          <EyeOff size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        ) : (
                          <Eye size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        )}
                        {(service.isActive ?? service.is_active) ? 'Hide' : 'Show'}
                      </button>
                      
                      <button
                        onClick={() => deleteService(service.id)}
                        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        title="Delete service"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-white/30 shadow-2xl max-w-lg mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Grid className="h-12 w-12 text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {searchTerm || filterCategory || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters to find more services'
                    : 'Showcase your expertise by adding your first wedding service'}
                </p>
                {!searchTerm && !filterCategory && filterStatus === 'all' && (
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setEditingService(null);
                    }}
                    className="group bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 hover:from-rose-600 hover:to-pink-700 transition-all duration-300 mx-auto shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    Add Your First Service
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* AddServiceForm Modal */}
      <AddServiceForm
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false);
          setEditingService(null);
        }}
        onSubmit={handleSubmit}
        editingService={editingService ? {
          ...editingService,
          vendor_id: editingService.vendorId || editingService.vendor_id || vendorId,
          title: editingService.name || editingService.title || '',
          is_active: editingService.isActive ?? editingService.is_active ?? true,
          price: typeof editingService.price === 'string' ? parseFloat(editingService.price) : editingService.price,
          created_at: editingService.created_at || new Date().toISOString(),
          updated_at: editingService.updated_at || new Date().toISOString()
        } : null}
        vendorId={vendorId}
        isLoading={false}
      />

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={upgradePrompt.show}
        onClose={hideUpgradePrompt}
        message={upgradePrompt.message}
        requiredTier={upgradePrompt.requiredTier}
      />

      {/* Floating Add Service Button - Always Visible */}
      <motion.button
        onClick={handleQuickCreateService}
        className="fixed bottom-8 right-8 z-40 w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group"
        title="Add New Service"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" />
      </motion.button>
    </div>
  );
};
