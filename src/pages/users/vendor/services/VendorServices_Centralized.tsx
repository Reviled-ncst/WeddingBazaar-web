import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  TrendingUp,
  Users,
  MessageSquare,
  DollarSign,
  Calendar,
  Award,
  X,
  CalendarDays,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { VendorAvailabilityCalendar } from '../../../../shared/components/calendar/VendorAvailabilityCalendar';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { serviceManager, SERVICE_BUSINESS_RULES } from '../../../../shared/services/CentralizedServiceManager';

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

type VendorTier = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM' | 'ENTERPRISE';

interface ServiceLimits {
  max_services: number;
  max_images_per_service: number;
  max_categories: number;
  featured_services: number;
  premium_features: boolean;
  analytics_access: boolean;
  can_add_service?: boolean;
  current_services?: number;
  current_categories?: number;
  can_add_category?: boolean;
  featured_services_used?: number;
  max_featured_services?: number;
  can_feature_service?: boolean;
  has_premium_features?: boolean;
  has_analytics_access?: boolean;
}

interface ServiceAnalytics {
  total_views: number;
  total_inquiries: number;
  total_bookings: number;
  conversion_rate: number;
  average_rating: number;
  total_revenue: number;
  monthly_growth: number;
  popular_categories: string[];
  peak_months: string[];
  client_satisfaction: number;
  // Additional properties used in the component
  total_services?: number;
  active_services?: number;
  featured_services?: number;
  categories_used?: string[];
  avg_rating: number;
  total_reviews: number;
  monthly_views: number;
  monthly_inquiries: number;
}

export function VendorServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [vendorLimits, setVendorLimits] = useState<ServiceLimits | null>(null);
  const [analytics, setAnalytics] = useState<ServiceAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'analytics' | 'settings'>('services');
  const [showAvailability, setShowAvailability] = useState(false);
  
  // Get vendor data from auth context
  const { user } = useAuth();
  const vendorId = user?.id || 'vendor-123'; // Use actual vendor ID from auth
  const vendorTier: VendorTier = 'PROFESSIONAL'; // This would come from vendor's subscription

  useEffect(() => {
    console.log('🚀 [VendorServices] Component mounted! Vendor ID:', vendorId);
    console.log('📊 [VendorServices] Show availability state:', showAvailability);
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      // Load vendor services
      const servicesResult = await serviceManager.getVendorServices(vendorId);
      if (servicesResult.success) {
        setServices(servicesResult.services);
      }

      // Load vendor limits
      const limits = await serviceManager.checkVendorLimits(vendorId, vendorTier);
      setVendorLimits(limits);

      // Load analytics
      const analyticsData = await serviceManager.getServiceAnalytics(vendorId);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('❌ [VendorServices] Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: any) => {
    const result = await serviceManager.createService(vendorId, serviceData, vendorTier);
    
    if (result.success && result.service) {
      setServices(prev => [...prev, result.service!]);
      setShowCreateModal(false);
      await loadVendorData(); // Refresh limits and analytics
    } else {
      alert(result.error || 'Failed to create service');
    }
  };

  const handleUpdateService = async (serviceId: string, serviceData: any) => {
    const result = await serviceManager.updateService(serviceId, serviceData, vendorTier);
    
    if (result.success && result.service) {
      setServices(prev => prev.map(s => s.id === serviceId ? result.service! : s));
      setEditingService(null);
      await loadVendorData(); // Refresh analytics
    } else {
      alert(result.error || 'Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    const result = await serviceManager.deleteService(serviceId, vendorId);
    
    if (result.success) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      await loadVendorData(); // Refresh limits and analytics
    } else {
      alert(result.error || 'Failed to delete service');
    }
  };

  const handleToggleService = async (service: Service) => {
    await handleUpdateService(service.id, { 
      ...service,
      is_active: !service.is_active 
    });
  };

  const handleFeatureService = async (service: Service) => {
    if (!vendorLimits?.can_feature_service && !service.featured) {
      alert(`Your ${vendorTier} plan allows maximum ${vendorLimits?.max_featured_services} featured services. Upgrade to feature more services.`);
      return;
    }

    await handleUpdateService(service.id, { 
      ...service,
      featured: !service.featured 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <VendorHeader />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-blue-200 rounded-lg mb-4 w-64"></div>
              <div className="h-4 bg-blue-100 rounded mb-8 w-96"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6">
                    <div className="h-32 bg-blue-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-blue-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-blue-100 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <VendorHeader />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              My Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Manage your wedding services and track performance
            </motion.p>
          </div>

          {/* Vendor Limits Summary */}
          {vendorLimits && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Account Limits ({vendorTier})</h2>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Upgrade Plan
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {vendorLimits.current_services}/{vendorLimits.max_services === -1 ? '∞' : vendorLimits.max_services}
                  </div>
                  <div className="text-sm text-gray-500">Services</div>
                  <div className={cn(
                    'h-2 bg-gray-200 rounded-full mt-2',
                    !vendorLimits.can_add_service && 'bg-red-200'
                  )}>
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        vendorLimits.can_add_service ? 'bg-blue-500' : 'bg-red-500'
                      )}
                      style={{ 
                        width: vendorLimits.max_services === -1 
                          ? '100%' 
                          : `${Math.min((vendorLimits.current_services / vendorLimits.max_services) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {vendorLimits.current_categories}/{vendorLimits.max_categories === -1 ? '∞' : vendorLimits.max_categories}
                  </div>
                  <div className="text-sm text-gray-500">Categories</div>
                  <div className={cn(
                    'h-2 bg-gray-200 rounded-full mt-2',
                    !vendorLimits.can_add_category && 'bg-red-200'
                  )}>
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        vendorLimits.can_add_category ? 'bg-green-500' : 'bg-red-500'
                      )}
                      style={{ 
                        width: vendorLimits.max_categories === -1 
                          ? '100%' 
                          : `${Math.min((vendorLimits.current_categories / vendorLimits.max_categories) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {vendorLimits.featured_services_used}/{vendorLimits.max_featured_services}
                  </div>
                  <div className="text-sm text-gray-500">Featured</div>
                  <div className={cn(
                    'h-2 bg-gray-200 rounded-full mt-2',
                    !vendorLimits.can_feature_service && 'bg-red-200'
                  )}>
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        vendorLimits.can_feature_service ? 'bg-purple-500' : 'bg-red-500'
                      )}
                      style={{ 
                        width: `${Math.min((vendorLimits.featured_services_used / vendorLimits.max_featured_services) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {vendorLimits.has_premium_features ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-gray-500">Premium Features</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {vendorLimits.has_analytics_access ? 'Analytics Enabled' : 'Analytics Disabled'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Summary */}
          {analytics && vendorLimits?.has_analytics_access && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.avg_rating.toFixed(1)}</div>
                <div className="text-sm text-gray-500 mb-1">Average Rating</div>
                <div className="flex items-center justify-center text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{analytics.total_reviews}</div>
                <div className="text-sm text-gray-500 mb-1">Total Reviews</div>
                <div className="flex items-center justify-center text-green-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.monthly_views}</div>
                <div className="text-sm text-gray-500 mb-1">Monthly Views</div>
                <div className="flex items-center justify-center text-purple-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{analytics.monthly_inquiries}</div>
                <div className="text-sm text-gray-500 mb-1">Monthly Inquiries</div>
                <div className="flex items-center justify-center text-indigo-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium text-gray-700">
                {services.length} services
              </span>
              <span className="text-sm text-gray-500">
                ({services.filter(s => s.is_active).length} active)
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Availability Toggle Button */}
              <button
                onClick={() => {
                  console.log('🎯 [VendorServices] Availability toggle clicked! Current state:', showAvailability);
                  console.log('🔧 [VendorServices] Vendor ID:', vendorId);
                  setShowAvailability(!showAvailability);
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors border shadow-sm',
                  showAvailability
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                )}
                title="Toggle vendor availability calendar"
              >
                <Calendar className="h-5 w-5" />
                {showAvailability ? (
                  <>
                    <span>Hide Calendar</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Show Calendar</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!vendorLimits?.can_add_service}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors',
                  vendorLimits?.can_add_service
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                <Plus className="h-5 w-5" />
                Add Service
              </button>
            </div>
          </div>

          {/* Vendor Availability Calendar (Collapsible) */}
          <AnimatePresence>
            {showAvailability && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Vendor Availability Calendar</h2>
                    <span className="text-sm text-gray-500">- Manage your off days and availability</span>
                  </div>
                  
                  <VendorAvailabilityCalendar 
                    vendorId={vendorId}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Services Grid */}
          {services.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
              <p className="text-gray-600 mb-6">Create your first service to start attracting clients</p>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!vendorLimits?.can_add_service}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors mx-auto',
                  vendorLimits?.can_add_service
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                <Plus className="h-5 w-5" />
                Create First Service
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, index) => (
                <VendorServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  onEdit={setEditingService}
                  onDelete={handleDeleteService}
                  onToggle={handleToggleService}
                  onFeature={handleFeatureService}
                  onView={setSelectedService}
                  canFeature={vendorLimits?.can_feature_service || service.featured}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ServiceCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateService}
        vendorTier={vendorTier}
      />
      
      <ServiceEditModal
        service={editingService}
        onClose={() => setEditingService(null)}
        onSubmit={handleUpdateService}
        vendorTier={vendorTier}
      />
      
      <ServiceViewModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
}

// Vendor Service Card Component
interface VendorServiceCardProps {
  service: Service;
  index: number;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggle: (service: Service) => void;
  onFeature: (service: Service) => void;
  onView: (service: Service) => void;
  canFeature: boolean;
}

function VendorServiceCard({ 
  service, 
  index, 
  onEdit, 
  onDelete, 
  onToggle, 
  onFeature, 
  onView,
  canFeature 
}: VendorServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600';
          }}
        />
        
        <div className="absolute top-4 left-4 flex gap-2">
          {service.featured && (
            <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            service.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          )}>
            {service.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="absolute top-4 right-4">
          <button
            onClick={() => onView(service)}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {service.category}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium text-gray-900">{service.rating}</span>
            <span className="text-sm text-gray-500">({service.reviewCount})</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{service.location}</span>
          <span className="font-medium text-blue-600">{service.priceRange}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(service)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          
          <button
            onClick={() => onToggle(service)}
            className={cn(
              'flex items-center justify-center p-2 rounded-lg transition-colors',
              service.is_active
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            )}
            title={service.is_active ? 'Deactivate' : 'Activate'}
          >
            {service.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onFeature(service)}
            disabled={!canFeature && !service.featured}
            className={cn(
              'flex items-center justify-center p-2 rounded-lg transition-colors',
              service.featured
                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                : canFeature
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            )}
            title={service.featured ? 'Remove Featured' : 'Make Featured'}
          >
            <Award className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(service.id)}
            className="flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Delete Service"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Placeholder Modal Components (these would be implemented separately)
function ServiceCreateModal({ isOpen, onClose, onSubmit, vendorTier }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Service</h2>
        <p className="text-gray-600 mb-6">
          Create a new service for your {vendorTier} account. 
          Check business rules and validation requirements.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Mock service creation
              onSubmit({
                title: 'Sample Service',
                description: 'This is a sample service created for demonstration',
                category: 'Photography',
                price: 75000,
                location: 'Metro Manila',
                features: ['Professional Service', 'Quality Guaranteed'],
                is_active: true
              });
            }}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Create Service
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceEditModal({ service, onClose, onSubmit, vendorTier }: any) {
  if (!service) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Edit Service</h2>
        <p className="text-gray-600 mb-6">
          Edit "{service.name}" with {vendorTier} account restrictions.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Mock service update
              onSubmit(service.id, {
                ...service,
                description: service.description + ' (Updated)'
              });
            }}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceViewModal({ service, onClose }: any) {
  if (!service) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{service.name}</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Category</h4>
              <p className="text-gray-600">{service.category}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Price Range</h4>
              <p className="text-gray-600">{service.priceRange}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Location</h4>
              <p className="text-gray-600">{service.location}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Status</h4>
              <p className={cn(
                'font-medium',
                service.is_active ? 'text-green-600' : 'text-gray-500'
              )}>
                {service.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {service.features.map((feature: string, idx: number) => (
                <span key={idx} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorServices;
