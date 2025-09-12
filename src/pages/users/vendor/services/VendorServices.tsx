import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Image as ImageIcon,
  Save,
  X,
  Upload,
  Tag,
  Grid,
  List,
  Search,
  MapPin,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { SubscriptionGate, UsageLimit } from '../../../../shared/components/subscription/SubscriptionGate';
import { UpgradePrompt } from '../../../../shared/components/subscription/UpgradePrompt';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';

// Service interface based on the database schema
interface Service {
  id: string;
  vendor_id: string;
  name: string; // 'name' field from schema
  description: string;
  category: string;
  location?: string;
  vendor_name: string;
  vendor_image?: string;
  price_range?: string; // '$', '$$', '$$$', '$$$$'
  base_price?: number;
  availability?: boolean;
  rating?: number;
  review_count?: number;
  image?: string; // Main image
  gallery?: string[]; // JSONB array of image URLs
  features?: string[]; // JSONB array of feature strings
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  tags?: string[]; // JSONB array of search tags
  keywords?: string;
  created_at: string;
  updated_at: string;
}

// Service categories based on the database samples
const SERVICE_CATEGORIES = [
  'Photography',
  'Venues', 
  'Catering',
  'Makeup & Hair',
  'Flowers',
  'Music & DJ',
  'Wedding Planner',
  'Transportation',
  'Decoration',
  'Cakes',
  'Other'
];

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

export const VendorServices: React.FC = () => {
  // Subscription context
  const {
    subscription,
    canCreateService,
    canUploadImages,
    getFeatureLimitMessage,
    isNearLimit,
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
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    price_range: '$',
    base_price: '',
    image: '',
    gallery: [] as string[],
    features: [] as string[],
    contact_info: {
      phone: '',
      email: '',
      website: ''
    },
    tags: [] as string[],
    keywords: '',
    availability: true
  });

  // Get current vendor ID (in a real app, this would come from auth context)
  const vendorId = '2-2025-003';

  // Service statistics
  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.availability).length,
    categories: new Set(services.map(s => s.category)).size,
    avgRating: services.length > 0 ? services.reduce((acc, s) => acc + (s.rating || 0), 0) / services.length : 0
  };

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.availability) ||
                         (filterStatus === 'inactive' && !service.availability);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle image upload
  const handleImageUpload = async (files: FileList | null, isMainImage = false) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // For now, just use placeholder URLs until cloudinary is set up
      const placeholderUrls = Array.from(files).map((_, index) => 
        `https://images.unsplash.com/photo-1519741497674-611481863552?w=400&t=${Date.now()}-${index}`
      );
      
      if (isMainImage && placeholderUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          image: placeholderUrls[0]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, ...placeholderUrls]
        }));
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove image from gallery
  const removeImage = (index: number, isMainImage = false) => {
    if (isMainImage) {
      setFormData(prev => ({ ...prev, image: '' }));
    } else {
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      }));
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/services?vendorId=${vendorId}`);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check subscription limits for new services
    if (!editingService && !canCreateService()) {
      setError('You have reached your service limit. Please upgrade your subscription to add more services.');
      return;
    }
    
    // Check image upload limits
    const totalImages = (formData.image ? 1 : 0) + formData.gallery.length;
    if (!canUploadImages(totalImages)) {
      setError(`You can only upload up to ${subscription?.plan.limits.max_service_images} images per service on your current plan.`);
      return;
    }
    
    try {
      const serviceData = {
        ...formData,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null,
        vendor_id: vendorId,
        vendor_name: 'Current Vendor' // In real app, this would come from auth context
      };

      const url = editingService 
        ? `http://localhost:3001/api/services/${editingService.id}`
        : 'http://localhost:3001/api/services';
      
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

      // Reset form and fetch updated services
      setFormData({
        name: '',
        description: '',
        category: '',
        location: '',
        price_range: '$',
        base_price: '',
        image: '',
        gallery: [],
        features: [],
        contact_info: {
          phone: '',
          email: '',
          website: ''
        },
        tags: [],
        keywords: '',
        availability: true
      });
      setIsCreating(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    }
  };

  // Edit service
  const editService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      location: service.location || '',
      price_range: service.price_range || '$',
      base_price: service.base_price?.toString() || '',
      image: service.image || '',
      gallery: service.gallery || [],
      features: service.features || [],
      contact_info: {
        phone: service.contact_info?.phone || '',
        email: service.contact_info?.email || '',
        website: service.contact_info?.website || ''
      },
      tags: service.tags || [],
      keywords: service.keywords || '',
      availability: service.availability ?? true
    });
    setIsCreating(true);
  };

  // Delete service
  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/services/${serviceId}`, {
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
      const response = await fetch(`http://localhost:3001/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          availability: !service.availability
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

  // Add feature
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  // Update feature
  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  // Remove feature
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Quick service creation function for SubscriptionGate
  const handleQuickCreateService = () => {
    if (!canCreateService()) {
      setError('You have reached your service limit. Please upgrade your subscription to add more services.');
      return;
    }
    
    setIsCreating(true);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      location: '',
      price_range: '$',
      base_price: '',
      image: '',
      gallery: [],
      features: [],
      contact_info: {
        phone: '',
        email: '',
        website: ''
      },
      tags: [],
      keywords: '',
      availability: true
    });
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
                <p className="text-gray-600 mt-2">Manage your wedding services and packages.</p>
              </div>
              
              <SubscriptionGate requiredTier="basic" feature="service_listings">
                <button
                  onClick={handleQuickCreateService}
                  disabled={!canCreateService()}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
                    canCreateService()
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title="Add New Service"
                >
                  <Plus size={20} />
                  Add Service
                </button>
              </SubscriptionGate>
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
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{serviceStats.avgRating.toFixed(1)}</p>
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
                    current={subscription.usage.services_count}
                    limit={subscription.plan.limits.max_services}
                    label="Services"
                    description="Active service listings"
                    unlimited={subscription.plan.limits.max_services === -1}
                  />
                  
                  <UsageLimit
                    current={subscription.usage.monthly_bookings_count}
                    limit={subscription.plan.limits.max_monthly_bookings}
                    label="Monthly Bookings"
                    description="Bookings this month"
                    unlimited={subscription.plan.limits.max_monthly_bookings === -1}
                  />
                  
                  <UsageLimit
                    current={subscription.usage.portfolio_items_count}
                    limit={subscription.plan.limits.max_portfolio_items}
                    label="Portfolio Items"
                    description="Images in gallery"
                    unlimited={subscription.plan.limits.max_portfolio_items === -1}
                  />
                </div>

                {(isNearLimit('services') || isNearLimit('bookings')) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      You're approaching your subscription limits. Consider upgrading to continue growing your business.
                    </p>
                  </div>
                )}
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
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-32 rounded-lg' : 'w-full h-48 rounded-t-xl'
                        }`}
                      />
                    ) : (
                      <div className={`bg-gray-100 flex items-center justify-center ${
                        viewMode === 'list' ? 'w-full h-32 rounded-lg' : 'w-full h-48 rounded-t-xl'
                      }`}>
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
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
                          service.availability ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {service.availability ? (
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
                        {service.base_price && (
                          <span className="text-sm text-gray-600">
                            ${service.base_price.toLocaleString()}
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
                          service.availability
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={service.availability ? 'Mark unavailable' : 'Mark available'}
                      >
                        {service.availability ? <EyeOff size={14} /> : <Eye size={14} />}
                        {service.availability ? 'Hide' : 'Show'}
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

      {/* Create/Edit Service Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingService(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="e.g., Elegant Wedding Photography"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      title="Select service category"
                      required
                    >
                      <option value="">Select a category</option>
                      {SERVICE_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="e.g., New York, NY"
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      value={formData.price_range}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      title="Select price range"
                    >
                      {PRICE_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Availability */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.availability}
                        onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.checked }))}
                        className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Available for booking</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe your service in detail..."
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Features
                  </label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          placeholder="Enter a feature"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove feature"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                      Add Feature
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="tel"
                      value={formData.contact_info.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, phone: e.target.value }
                      }))}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                    <input
                      type="email"
                      value={formData.contact_info.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, email: e.target.value }
                      }))}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Email address"
                    />
                    <input
                      type="url"
                      value={formData.contact_info.website}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact_info: { ...prev.contact_info, website: e.target.value }
                      }))}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Website URL"
                    />
                  </div>
                </div>

                {/* Main Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Service Image
                  </label>
                  
                  {formData.image ? (
                    <div className="relative w-48 h-32 group">
                      <img
                        src={formData.image}
                        alt="Service main image"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(0, true)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files, true)}
                        className="hidden"
                        id="main-image"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="main-image"
                        className={`cursor-pointer flex flex-col items-center ${
                          isUploading ? 'opacity-50' : ''
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm text-gray-600">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload main image</p>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingService(null);
                    }}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 flex-1 justify-center disabled:opacity-50"
                  >
                    <Save size={18} />
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={upgradePrompt.show}
        onClose={hideUpgradePrompt}
        message={upgradePrompt.message}
        requiredTier={upgradePrompt.requiredTier}
      />
    </div>
  );
};
