import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVendorIdForUser } from '../../../utils/vendorIdMapping';
import {
  Plus,
  Edit,
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
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings,
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import { VendorHeader } from '../../../shared/components/layout/VendorHeader';
import { useAuth } from '../../../shared/contexts/AuthContext';

// Service interface based on the actual API response
interface Service {
  id: string;
  vendorId: string;
  vendor_id?: string;
  name: string;
  title?: string;
  description: string;
  category: string;
  price: string;
  imageUrl?: string | null;
  images?: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  is_active?: boolean;
  featured: boolean;
  vendor_name?: string;
  location?: string;
  review_count?: number;
  price_range?: string;
  availability?: boolean;
  gallery?: string[];
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
  const vendorId = user?.vendorId || user?.id || getVendorIdForUser(user);

  // Service statistics
  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.isActive ?? s.is_active).length,
    inactive: services.filter(s => !(s.isActive ?? s.is_active)).length,
    categories: new Set(services.map(s => s.category)).size,
    avgRating: services.length > 0 ? services.reduce((acc, s) => acc + (s.rating || 4.5), 0) / services.length : 4.5
  };

  // Filtered services
  const filteredServices = services.filter(service => {
    const serviceName = service.name || service.title || 'Untitled Service';
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && (service.isActive ?? service.is_active)) ||
                         (filterStatus === 'inactive' && !(service.isActive ?? service.is_active));
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Load services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!vendorId) {
        setError('No vendor ID available');
        setServices([]);
        return;
      }

      console.log(`🔄 Loading services for vendor ${vendorId}...`);
      
      const response = await fetch(`${apiUrl}/api/services/vendor/${vendorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Services loaded successfully:', result);
        
        if (result.success && Array.isArray(result.services)) {
          setServices(result.services);
        } else {
          setServices([]);
        }
      } else {
        console.warn('⚠️ API response not OK, trying fallback...');
        setServices([]);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error loading services:', errorMessage);
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

  // Handle form submission (placeholder)
  const handleSubmit = async (serviceData: any) => {
    try {
      console.log('💾 Saving service:', serviceData);
      
      const url = editingService 
        ? `${apiUrl}/api/services/${editingService.id}`
        : `${apiUrl}/api/services`;
      
      const method = editingService ? 'PUT' : 'POST';
      
      const payload = {
        ...serviceData,
        vendor_id: serviceData.vendor_id || vendorId,
        vendorId: serviceData.vendorId || vendorId
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingService ? 'update' : 'create'} service`);
      }

      const result = await response.json();
      console.log('✅ Service saved successfully:', result);

      setIsCreating(false);
      setEditingService(null);
      await fetchServices();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingService ? 'update' : 'create'} service`;
      console.error('❌ Error saving service:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  // Edit service
  const editService = (service: Service) => {
    setEditingService(service);
    setIsCreating(true);
  };

  // Delete service with confirmation
  const deleteService = async (serviceId: string) => {
    const confirmed = confirm(
      '⚠️ Delete Service Confirmation\\n\\n' +
      'Are you sure you want to delete this service?\\n\\n' +
      '• If this service has existing bookings, it will be hidden from customers but preserved in our records\\n' +
      '• If no bookings exist, it will be completely removed\\n\\n' +
      'Continue with deletion?'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      console.log(`🗑️ Deleting service ${serviceId}...`);
      
      const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete service');
      }

      const result = await response.json();
      console.log('✅ Service deleted successfully:', result);

      if (result.softDelete) {
        alert('✅ Service deleted successfully!\n\nNote: The service was preserved in our records due to existing bookings, but it\'s no longer visible to customers.');
      } else {
        alert('✅ Service deleted successfully and completely removed!');
      }

      await fetchServices();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service';
      console.error('❌ Error deleting service:', errorMessage);
      setError(errorMessage);
    }
  };

  // Toggle service availability
  const toggleServiceAvailability = async (service: Service) => {
    try {
      const currentStatus = service.isActive ?? service.is_active;
      const newStatus = !currentStatus;
      
      console.log(`🔄 Toggling service ${service.id} availability: ${currentStatus} → ${newStatus}`);
      
      const response = await fetch(`${apiUrl}/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: service.name,
          category: service.category,
          description: service.description,
          price: service.price,
          isActive: newStatus,
          is_active: newStatus,
          featured: service.featured
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update service availability');
      }

      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id 
            ? { ...s, isActive: newStatus, is_active: newStatus }
            : s
        )
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle availability';
      console.error('❌ Error toggling availability:', errorMessage);
      setError(errorMessage);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative">
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
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Services</h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={fetchServices}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services Display */}
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Services Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {services.length === 0 
                  ? "You haven't created any services yet. Start by adding your first service to showcase your expertise."
                  : "No services match your current filters. Try adjusting your search criteria."
                }
              </p>
              <button
                onClick={handleQuickCreateService}
                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl hover:from-rose-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="inline-block w-5 h-5 mr-2" />
                Create Your First Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
                >
                  {/* Service Image */}
                  <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-16 w-16 text-rose-300" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.isActive ?? service.is_active
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {service.isActive ?? service.is_active ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {service.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white flex items-center gap-1">
                          <Star size={12} className="fill-current" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Service Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {service.name || service.title || 'Untitled Service'}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={16} className="fill-current" />
                        <span className="text-sm font-medium">{service.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{service.category}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description || 'Professional wedding service with exceptional quality.'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-rose-600">
                        ₱{typeof service.price === 'string' ? parseFloat(service.price).toLocaleString() : service.price?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {service.reviewCount || service.review_count || 0} reviews
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => editService(service)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => toggleServiceAvailability(service)}
                        className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 ${
                          service.isActive ?? service.is_active
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                        }`}
                      >
                        {service.isActive ?? service.is_active ? (
                          <>
                            <EyeOff size={16} />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye size={16} />
                            Show
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => deleteService(service.id)}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Add Service Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <button
          onClick={handleQuickCreateService}
          className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:from-rose-600 hover:to-pink-700 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Add New Service"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </motion.div>
    </div>
  );
};
