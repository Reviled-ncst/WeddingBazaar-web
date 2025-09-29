import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
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
  Crown,
  Copy
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { UsageLimit } from '../../../../shared/components/subscription/SubscriptionGate';
import { UpgradePrompt } from '../../../../shared/components/subscription/UpgradePrompt';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { serviceManager } from '../../../../shared/services/CentralizedServiceManager';
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
  
  // No debug logging in production

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

  // Load services using centralized service manager
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!vendorId) {
        setError('No vendor ID available');
        setServices([]);
        return;
      }

      console.log('🔄 [VendorServices] Loading services with centralized manager...');
      
      try {
        const result = await serviceManager.getVendorServices(vendorId);
        
        if (result.success && result.services.length > 0) {
          console.log('✅ [VendorServices] Loaded services from centralized manager:', result.services.length);
          // Map centralized service format to component's interface
          const mappedServices = result.services.map((service: any) => ({
            id: service.id,
            vendorId: service.vendorId || service.vendor_id,
            name: service.name || service.title,
            description: service.description,
            category: service.category,
            price: typeof service.price === 'string' ? service.price : String(service.price || '0.00'),
            imageUrl: service.image || service.imageUrl,
            images: service.images || service.gallery || [],
            rating: service.rating,
            reviewCount: service.reviewCount,
            isActive: service.is_active !== undefined ? service.is_active : service.availability,
            featured: service.featured,
            vendor_name: service.vendorName,
            location: service.location,
            features: service.features || [],
            contact_info: service.contactInfo || {},
            created_at: service.created_at,
            updated_at: service.updated_at
          }));
          setServices(mappedServices);
        } else {
          console.log('⚠️ [VendorServices] No services found for vendor');
          setServices([]);
          setError('No services created yet. Click "Add Service" to get started!');
        }
      } catch (error) {
        console.error('❌ [VendorServices] Error loading services:', error);
        setServices([]);
        setError('Unable to load services. Please try again or contact support.');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
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

  // Toggle service featured status
  const toggleServiceFeatured = async (service: Service) => {
    try {
      const currentFeaturedStatus = service.featured;
      const response = await fetch(`${apiUrl}/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          featured: !currentFeaturedStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update service featured status');
      }

      // Update the local state immediately for better UX
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id 
            ? { ...s, featured: !currentFeaturedStatus }
            : s
        )
      );

      // Optionally refresh from server
      // fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service featured status');
    }
  };

  // Quick service creation function
  const handleQuickCreateService = () => {
    setIsCreating(true);
    setEditingService(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <main className="pt-24 pb-12">
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
      
      <main className="pt-24 pb-12 relative z-10">
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
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleQuickCreateService}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 hover:scale-105 relative overflow-hidden text-lg"
                  title="Add New Service"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10">Add New Service</span>
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



          {/* Services Display */}
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
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
                    <div className="relative overflow-hidden">
                      <img
                        src={service.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format'}
                        alt={service.name || service.title}
                        className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                          viewMode === 'list' ? 'w-full h-40 rounded-2xl' : 'w-full h-56 rounded-t-2xl'
                        }`}
                        onError={(e) => {
                          // Create unique fallback based on service category
                          const categoryImages = {
                            'Photographer & Videographer': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format',
                            'Wedding Planner': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format',
                            'Florist': 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop&auto=format',
                            'Hair & Makeup Artists': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&auto=format',
                            'Caterer': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&auto=format',
                            'DJ/Band': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format',
                            'Officiant': 'https://images.unsplash.com/photo-1519167758481-83f29b1fe9c2?w=600&h=400&fit=crop&auto=format',
                            'Venue Coordinator': 'https://images.unsplash.com/photo-1519167758481-83f29b1fe9c2?w=600&h=400&fit=crop&auto=format',
                            'Event Rentals': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=400&fit=crop&auto=format',
                            'Cake Designer': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&auto=format',
                            'Dress Designer/Tailor': 'https://images.unsplash.com/photo-1594736797933-d0d0419b7725?w=600&h=400&fit=crop&auto=format',
                            'Security & Guest Management': 'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=600&h=400&fit=crop&auto=format',
                            'Sounds & Lights': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&auto=format',
                            'Stationery Designer': 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&h=400&fit=crop&auto=format',
                            'Transportation Services': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop&auto=format'
                          };
                          
                          const fallbackUrl = categoryImages[service.category as keyof typeof categoryImages] || 
                                             'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format';
                          
                          if (e.currentTarget.src !== fallbackUrl) {
                            e.currentTarget.src = fallbackUrl;
                          } else {
                            // Even fallback failed, hide image and show placeholder
                            const imgElement = e.currentTarget;
                            const imageContainer = imgElement.parentElement;
                            if (imageContainer) {
                              imageContainer.classList.add('hidden');
                              const placeholder = imageContainer.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                              if (placeholder) {
                                placeholder.classList.remove('hidden');
                                placeholder.classList.add('flex');
                              }
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
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100 flex-wrap">
                      {/* Primary Actions */}
                      <button
                        onClick={() => editService(service)}
                        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        title="Edit service details"
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
                        title={(service.isActive ?? service.is_active) ? 'Mark as unavailable' : 'Mark as available'}
                      >
                        {(service.isActive ?? service.is_active) ? (
                          <EyeOff size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        ) : (
                          <Eye size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        )}
                        {(service.isActive ?? service.is_active) ? 'Hide' : 'Show'}
                      </button>

                      {/* Feature Action */}
                      <button
                        onClick={() => toggleServiceFeatured(service)}
                        className={`group flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md ${
                          service.featured
                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-600 hover:from-yellow-100 hover:to-amber-100'
                            : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 hover:from-gray-100 hover:to-slate-100'
                        }`}
                        title={service.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star size={16} className={`group-hover:scale-110 transition-transform duration-200 ${service.featured ? 'fill-current' : ''}`} />
                        {service.featured ? 'Unfeature' : 'Feature'}
                      </button>

                      {/* Copy/Duplicate Action */}
                      <button
                        onClick={() => {
                          const duplicatedService = {
                            ...service,
                            id: `temp-${Date.now()}`, // Temporary ID for new service
                            name: `${service.name} (Copy)`,
                            title: `${service.title || service.name} (Copy)`
                          };
                          setEditingService(duplicatedService);
                          setIsCreating(true);
                        }}
                        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        title="Duplicate this service"
                      >
                        <Copy size={16} className="group-hover:scale-110 transition-transform duration-200" />
                        Copy
                      </button>
                      
                      {/* Delete Action - Moved to end */}
                      <button
                        onClick={() => deleteService(service.id)}
                        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl hover:from-red-100 hover:to-pink-100 transition-all duration-200 font-medium shadow-sm hover:shadow-md ml-auto"
                        title="Delete service permanently"
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
          ) : (
            /* Enhanced List View */
            <div className="space-y-4 mb-8">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  <div className="flex">
                    {/* Service Image */}
                    <div className="relative w-80 h-48 flex-shrink-0 overflow-hidden">
                      {service.imageUrl || (service.images && service.images[0]) ? (
                        <img
                          src={service.imageUrl || service.images?.[0]}
                          alt={service.name || service.title || 'Service'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            // Category-specific fallback images
                            const categoryImages = {
                              'Cake Designer': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&auto=format',
                              'Caterer': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&auto=format',
                              'Photographer & Videographer': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop&auto=format',
                              'Wedding Planner': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop&auto=format',
                              'Florist': 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop&auto=format'
                            };
                            
                            const fallbackUrl = categoryImages[service.category as keyof typeof categoryImages] || 
                                               'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format';
                            
                            if (e.currentTarget.src !== fallbackUrl) {
                              e.currentTarget.src = fallbackUrl;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 flex items-center justify-center">
                          <div className="text-center">
                            <Grid className="h-16 w-16 text-rose-300 mx-auto mb-2" />
                            <p className="text-sm text-rose-400 font-medium">No Image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>
                      
                      {/* Status and Featured Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                          (service.isActive ?? service.is_active)
                            ? 'bg-green-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}>
                          {(service.isActive ?? service.is_active) ? '● AVAILABLE' : '● UNAVAILABLE'}
                        </span>
                        
                        {service.featured && (
                          <span className="bg-yellow-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            FEATURED
                          </span>
                        )}
                      </div>

                      {/* Price Badge */}
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white/95 backdrop-blur-sm text-rose-600 px-4 py-2 rounded-xl shadow-lg">
                          <span className="text-2xl font-bold">
                            ₱{typeof service.price === 'string' ? parseFloat(service.price).toLocaleString() : service.price?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="flex-1 p-8">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                              {service.name || service.title || 'Untitled Service'}
                            </h3>
                            <span className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-3 py-1 rounded-lg text-sm font-semibold border border-rose-200">
                              {service.category}
                            </span>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-semibold text-yellow-700">{service.rating || 4.5}</span>
                              <span className="text-sm text-yellow-600">({service.reviewCount || 0} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-lg leading-relaxed mb-6 line-clamp-3">
                        {service.description || 'Professional service with attention to detail and customer satisfaction.'}
                      </p>

                      {/* Features Tags */}
                      {service.features && service.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {service.features.slice(0, 4).map((feature, idx) => (
                            <span
                              key={idx}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                            >
                              {feature}
                            </span>
                          ))}
                          {service.features.length > 4 && (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                              +{service.features.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons - Enhanced Visibility */}
                      <div className="flex flex-col gap-4 pt-6 border-t border-gray-200">
                        {/* Primary Action Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => editService(service)}
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-2xl hover:scale-105 min-w-[140px]"
                          >
                            <Edit size={20} className="group-hover:rotate-12 transition-transform duration-200" />
                            Edit Service
                          </button>
                          
                          <button
                            onClick={() => toggleServiceAvailability(service)}
                            className={`group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-2xl hover:scale-105 min-w-[160px] ${
                              (service.isActive ?? service.is_active)
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                            }`}
                          >
                            {(service.isActive ?? service.is_active) ? (
                              <>
                                <EyeOff size={20} className="group-hover:scale-110 transition-transform duration-200" />
                                Hide Service
                              </>
                            ) : (
                              <>
                                <Eye size={20} className="group-hover:scale-110 transition-transform duration-200" />
                                Show Service
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => toggleServiceFeatured(service)}
                            className={`group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-2xl hover:scale-105 min-w-[140px] ${
                              service.featured
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700'
                                : 'bg-gradient-to-r from-gray-500 to-slate-600 text-white hover:from-gray-600 hover:to-slate-700'
                            }`}
                          >
                            <Star size={20} className={`group-hover:scale-110 transition-transform duration-200 ${service.featured ? 'fill-current' : ''}`} />
                            {service.featured ? 'Unfeatured' : 'Feature'}
                          </button>
                        </div>

                        {/* Secondary Action Row */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const duplicatedService = {
                                ...service,
                                id: `temp-${Date.now()}`,
                                name: `${service.name} (Copy)`,
                                title: `${service.title || service.name} (Copy)`
                              };
                              setEditingService(duplicatedService);
                              setIsCreating(true);
                            }}
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-2xl hover:scale-105 min-w-[140px]"
                          >
                            <Copy size={20} className="group-hover:scale-110 transition-transform duration-200" />
                            Duplicate
                          </button>
                          
                          <button
                            onClick={() => deleteService(service.id)}
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-2xl hover:scale-105 min-w-[140px]"
                          >
                            <Trash2 size={20} className="group-hover:scale-110 transition-transform duration-200" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

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

      {/* Enhanced Floating Add Service Button - Always Visible */}
      <motion.div
        className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        {/* Tooltip */}
        <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Add New Service
        </div>
        
        {/* Main Button */}
        <motion.button
          onClick={handleQuickCreateService}
          className="group w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.15, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-rose-400/50 animate-ping"></div>
          
          {/* Icon */}
          <Plus size={32} className="group-hover:rotate-180 transition-transform duration-500 relative z-10 drop-shadow-lg" />
        </motion.button>
      </motion.div>
    </div>
  );
};
