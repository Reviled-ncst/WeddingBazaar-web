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
import { AddServiceForm } from './components';

// Service interface based on the actual database schema
interface Service {
  id: string;
  vendor_id: string;
  title: string; // 'title' field from actual schema
  description: string;
  category: string;
  price?: number; // 'price' field (numeric)
  images?: string[]; // ARRAY of image URLs
  featured?: boolean;
  is_active?: boolean; // 'is_active' field from schema
  created_at: string;
  updated_at: string;
  // Extended fields for UI (may not be in DB)
  vendor_name?: string;
  location?: string;
  rating?: number;
  review_count?: number;
  price_range?: string; // '$', '$$', '$$$', '$$$$'
  availability?: boolean;
  gallery?: string[]; // Alias for images
  features?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
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
  const apiUrl = import.meta.env.VITE_API_URL || 'https://wedding-bazaar-backend.onrender.com/api';

  // Get current vendor ID (in a real app, this would come from auth context)
  const vendorId = '2-2025-003';

  // Service statistics
  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    inactive: services.filter(s => !s.is_active).length,
    categories: new Set(services.map(s => s.category)).size,
    avgRating: services.length > 0 ? services.reduce((acc, s) => acc + (s.rating || 4.5), 0) / services.length : 4.5 // Default to 4.5 if no rating
  };

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.is_active) ||
                         (filterStatus === 'inactive' && !service.is_active);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/services?vendorId=${vendorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(data.services || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle form submission
  const handleSubmit = async (serviceData: any) => {
    try {
      const url = editingService 
        ? `${apiUrl}/services/${editingService.id}`
        : `${apiUrl}/services`;
      
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
      const response = await fetch(`${apiUrl}/services/${serviceId}`, {
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
      const response = await fetch(`${apiUrl}/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          is_active: !service.is_active
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <VendorHeader />
      
      <main className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
                <p className="text-gray-600 mt-2">Manage your wedding services and packages.</p>
              </div>
              
              <div className="flex-shrink-0">
                <button
                  onClick={handleQuickCreateService}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700"
                  title="Add New Service"
                >
                  <Plus size={20} />
                  Add Service
                </button>
              </div>
            </div>

            {/* Service Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Grid className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.active}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Tag className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.categories}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <EyeOff className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inactive</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.inactive}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            {subscription && (
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-rose-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subscription.plan.name} Plan</h3>
                    <p className="text-sm text-gray-600">{getFeatureLimitMessage('services')}</p>
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
              </div>
            )}

            {/* Search and Filter Controls */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[180px]"
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
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent min-w-[140px]"
                  title="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Available</option>
                  <option value="inactive">Unavailable</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-rose-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Grid view"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-rose-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
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
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Services Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
              : 'space-y-4 mb-8'
          }>
            {filteredServices.map(service => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
                  viewMode === 'list' ? 'p-6' : 'p-0'
                }`}
              >
                {/* Service Content */}
                <div className={viewMode === 'list' ? 'flex gap-6' : ''}>
                  {/* Service Image */}
                  <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'}`}>
                    {service.images && service.images[0] ? (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-32 rounded-lg' : 'w-full h-48 rounded-t-xl'
                        }`}
                      />
                    ) : (
                      <div className={`bg-gray-100 flex items-center justify-center ${
                        viewMode === 'list' ? 'w-full h-32 rounded-lg' : 'w-full h-48 rounded-t-xl'
                      }`}>
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{service.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{service.category}</span>
                        </div>
                        {service.location && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{service.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className={`p-1 rounded ${
                          service.is_active ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {service.is_active ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Service Rating & Price */}
                    <div className="flex items-center justify-between mb-4">
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                          {service.review_count && (
                            <span className="text-xs text-gray-500">({service.review_count})</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {service.price_range && (
                          <span className="text-green-600 font-semibold">
                            {service.price_range}
                          </span>
                        )}
                        {service.price && (
                          <span className="text-sm text-gray-600">
                            ₱{service.price.toLocaleString()}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editService(service)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        title="Edit service"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => toggleServiceAvailability(service)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                          service.is_active
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={service.is_active ? 'Mark unavailable' : 'Mark available'}
                      >
                        {service.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        {service.is_active ? 'Hide' : 'Show'}
                      </button>
                      
                      <button
                        onClick={() => deleteService(service.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        title="Delete service"
                      >
                        <Trash2 size={14} />
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
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterCategory || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first service'}
                </p>
                {!searchTerm && !filterCategory && filterStatus === 'all' && (
                  <button
                    onClick={() => {
                      setIsCreating(true);
                      setEditingService(null);
                    }}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-rose-600 hover:to-pink-700 transition-all duration-200 mx-auto"
                  >
                    <Plus size={20} />
                    Add Your First Service
                  </button>
                )}
              </div>
            </div>
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
        editingService={editingService}
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
      <button
        onClick={handleQuickCreateService}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
        title="Add New Service"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
};
