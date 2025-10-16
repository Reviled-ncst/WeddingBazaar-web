import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getVendorIdForUser } from '../../../../utils/vendorIdMapping';
import { firebaseAuthService } from '../../../../services/auth/firebaseAuthService';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Tag,
  Grid,
  List,
  Search,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings,
  TrendingUp,
  DollarSign,
  MapPin,
  Copy,
  Share2,
  MoreVertical,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { AddServiceForm } from './components/AddServiceForm';
import { useVendorProfile } from '../../../../hooks/useVendorData';

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
// Service categories with display names and database-compatible values (matching AddServiceForm)
const SERVICE_CATEGORIES = [
  { display: 'Photographer & Videographer', value: 'Photography' },
  { display: 'Wedding Planner', value: 'Planning' },
  { display: 'Florist', value: 'Florist' },
  { display: 'Hair & Makeup Artists', value: 'Beauty' },
  { display: 'Caterer', value: 'Catering' },
  { display: 'DJ/Band', value: 'Music' },
  { display: 'Officiant', value: 'Officiant' },
  { display: 'Venue Coordinator', value: 'Venue' },
  { display: 'Event Rentals', value: 'Rentals' },
  { display: 'Cake Designer', value: 'Cake' },
  { display: 'Dress Designer/Tailor', value: 'Fashion' },
  { display: 'Security & Guest Management', value: 'Security' },
  { display: 'Sounds & Lights', value: 'AV_Equipment' },
  { display: 'Stationery Designer', value: 'Stationery' },
  { display: 'Transportation Services', value: 'Transport' }
];

export const VendorServices: React.FC = () => {
  // Auth context to get the logged-in vendor
  const { user, isEmailVerified, firebaseUser } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | null>(null);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Get current vendor ID from auth context with fallback
  const vendorId = user?.id || getVendorIdForUser(user as any) || '2-2025-001';
  
  // Use the same vendor profile hook as VendorProfile component
  const { profile, refetch: refetchProfile } = useVendorProfile(vendorId);

  // Get API base URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

  // Helper function to check document verification status from profile
  const isDocumentVerified = (): boolean => {
    if (!profile?.documents || profile.documents.length === 0) {
      console.log('� No documents found in profile');
      return false;
    }
    const hasApproved = profile.documents.some((doc: any) => doc.status === 'approved');
    console.log('📄 Document verification check:', {
      documentsCount: profile.documents.length,
      documents: profile.documents.map((doc: any) => ({ id: doc.id, type: doc.type, status: doc.status })),
      hasApproved
    });
    return hasApproved;
  };

  // Enhanced verification status check - requires both email AND documents
  const getVerificationStatus = () => {
    return {
      emailVerified: firebaseUser?.emailVerified || isEmailVerified || false,
      phoneVerified: profile?.phoneVerified || false,
      documentsVerified: isDocumentVerified()
    };
  };

  // Check if user can add services (requires BOTH email verification AND approved documents)
  const canAddServices = () => {
    const verification = getVerificationStatus();
    const canAdd = verification.emailVerified && verification.documentsVerified;
    console.log('🔒 Service creation permission check:', {
      emailVerified: verification.emailVerified,
      documentsVerified: verification.documentsVerified,
      canAddServices: canAdd
    });
    return canAdd;
  };
  
  // Check for highlighted service from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');
    if (highlightId) {
      console.log('🎯 Highlighting service:', highlightId);
      setHighlightedServiceId(highlightId);
      
      // Scroll to highlighted service after a short delay
      setTimeout(() => {
        const element = document.querySelector(`[data-service-id="${highlightId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log('📜 Scrolled to highlighted service:', highlightId);
        }
      }, 1000);
      
      // Remove highlight after 10 seconds (extended for better visibility)
      setTimeout(() => {
        console.log('⏰ Removing highlight from service:', highlightId);
        setHighlightedServiceId(null);
      }, 10000);
    }
  }, []);
  
  // Debug logging
  console.log('🔍 VendorServices Debug Info:', {
    user: user,
    vendorId: vendorId,
    userRole: user?.role,
    isAuthenticated: !!user,
    highlightedServiceId: highlightedServiceId,
    userVendorId: user?.vendorId,
    userId: user?.id,
    documentsVerified: isDocumentVerified(),
    canAddServices: canAddServices(),
    emailVerified: getVerificationStatus().emailVerified,
    profile: profile ? 'loaded' : 'not loaded',
    documentsCount: profile?.documents?.length || 0
  });

  // Service statistics with proper field mapping - dynamic calculations
  const serviceStats = {
    total: services.length,
    active: services.filter(s => s.is_active === true).length,
    inactive: services.filter(s => s.is_active === false).length,
    categories: new Set(services.map(s => s.category).filter(Boolean)).size,
    featured: services.filter(s => s.featured === true).length,
    avgPrice: services.length > 0 ? services.reduce((acc, s) => acc + parseFloat(s.price || '0'), 0) / services.length : 0,
    totalRevenue: services.reduce((acc, s) => acc + parseFloat(s.price || '0'), 0),
    recentServices: services.filter(s => {
      const createdDate = new Date(s.created_at || '');
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length
  };

  // Filtered services with proper field mapping
  const filteredServices = services.filter(service => {
    const serviceName = service.title || service.name || 'Untitled Service';
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = !filterCategory || service.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.is_active === true) ||
                         (filterStatus === 'inactive' && service.is_active === false);
    
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
      // Profile data (including documents) will be loaded by useVendorProfile hook
    }
  }, [vendorId]);

  // Ensure vendor profile exists before creating services
  const ensureVendorProfile = async (): Promise<boolean> => {
    try {
      const targetVendorId = user?.id || vendorId;
      console.log('🔍 Checking if vendor profile exists for:', targetVendorId);
      
      // Check if vendor profile exists
      const checkResponse = await fetch(`${apiUrl}/api/vendors/${targetVendorId}`);
      
      if (checkResponse.ok) {
        console.log('✅ Vendor profile exists');
        return true;
      }
      
      if (checkResponse.status === 404) {
        console.log('❌ Vendor profile not found, need to create one');
        setError('Vendor profile required. Please complete your business profile first.');
        return false;
      }
      
      console.log('⚠️ Error checking vendor profile:', checkResponse.status);
      return false;
      
    } catch (error) {
      console.error('❌ Error checking vendor profile:', error);
      setError('Unable to verify vendor profile. Please check your connection.');
      return false;
    }
  };

  // Handle form submission with enhanced debugging
  const handleSubmit = async (serviceData: any) => {
    try {
      console.log('💾 Saving service:', serviceData);
      
      // First ensure vendor profile exists
      const hasVendorProfile = await ensureVendorProfile();
      if (!hasVendorProfile) {
        throw new Error('Vendor profile required. Please complete your business profile first.');
      }
      
      const url = editingService 
        ? `${apiUrl}/api/services/${editingService.id}`
        : `${apiUrl}/api/services`;
      
      const method = editingService ? 'PUT' : 'POST';
      
      const payload = {
        ...serviceData,
        // Use the user ID that should match the vendor profile
        vendor_id: user?.id || vendorId,
      };
      
      console.log('🔍 [VendorServices] Making API request:', {
        url,
        method,
        payload: JSON.stringify(payload, null, 2)
      });
      
      // Debug each field length to identify the problematic one
      console.log('🔍 [VendorServices] Field length analysis:');
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (typeof value === 'string') {
          console.log(`  ${key}: "${value}" (${value.length} chars) ${value.length > 20 ? '❌ TOO LONG!' : '✅'}`);
        } else {
          console.log(`  ${key}: ${typeof value} (${JSON.stringify(value).length} chars as JSON)`);
        }
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 [VendorServices] API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      const responseText = await response.text();
      console.log('📄 [VendorServices] Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [VendorServices] Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        console.error('❌ [VendorServices] API Error Response:', result);
        throw new Error(result.error || result.message || `Failed to ${editingService ? 'update' : 'create'} service`);
      }

      console.log('✅ [VendorServices] Service saved successfully:', result);

      setIsCreating(false);
      setEditingService(null);
      await fetchServices();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${editingService ? 'update' : 'create'} service`;
      console.error('❌ [VendorServices] Error saving service:', errorMessage);
      console.error('❌ [VendorServices] Full error:', err);
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
      const currentStatus = service.is_active;
      const newStatus = !currentStatus;
      
      console.log(`🔄 Toggling service ${service.id} availability: ${currentStatus} → ${newStatus}`);
      
      const response = await fetch(`${apiUrl}/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: service.title,
          category: service.category,
          description: service.description,
          price: service.price,
          is_active: newStatus,
          featured: service.featured,
          location: service.location,
          price_range: service.price_range,
          images: service.images
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update service availability');
      }

      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id 
            ? { ...s, is_active: newStatus, isActive: newStatus }
            : s
        )
      );

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle availability';
      console.error('❌ Error toggling availability:', errorMessage);
      setError(errorMessage);
    }
  };

  // Quick service creation function with verification check
  const handleQuickCreateService = () => {
    // Check if user is verified before allowing service creation
    if (!canAddServices()) {
      setShowVerificationPrompt(true);
      return;
    }
    
    setIsCreating(true);
    setEditingService(null);
  };

  // Utility functions for better UX

  const exportServiceData = () => {
    try {
      const exportData = services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        location: service.location,
        status: service.is_active ? 'Active' : 'Inactive',
        featured: service.featured ? 'Yes' : 'No',
        created: service.created_at,
        updated: service.updated_at
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `services-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Service data exported successfully');
    } catch (error) {
      console.error('❌ Error exporting service data:', error);
      setError('Failed to export service data');
    }
  };

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in as a vendor to manage your services.</p>
            <button
              onClick={() => window.location.href = '/vendor'}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Go to Vendor Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vendor role check
  if (user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Access Required</h2>
            <p className="text-gray-600 mb-4">This page is only accessible to registered vendors.</p>
            <p className="text-sm text-gray-500">Your current role: {user.role}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your services...</p>
            <p className="text-xs text-gray-500 mt-2">Vendor ID: {vendorId}</p>
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
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative">
                  <button
                    onClick={handleQuickCreateService}
                    className={`group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden text-lg ${
                      canAddServices()
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                    }`}
                    title={canAddServices() ? "Add New Service" : "Email verification and document approval required"}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Plus size={24} className={canAddServices() ? "group-hover:rotate-90 transition-transform duration-300" : ""} />
                    <span className="relative z-10">Add New Service</span>
                  </button>
                  
                  {/* Verification indicator badge */}
                  {!canAddServices() && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      !
                    </div>
                  )}
                </div>
                
                {/* Additional Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportServiceData}
                    className="px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:border-gray-300 transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Export service data"
                  >
                    <Share2 size={16} />
                    Export
                  </button>
                  
                  <button
                    onClick={fetchServices}
                    className="px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:border-gray-300 transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Refresh services"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                  
                  <div className="relative">
                    <button
                      className="px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:border-gray-300 transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                      title="View options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Service Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Grid className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${serviceStats.total > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{serviceStats.total}</p>
                  <p className="text-xs text-gray-600">Services</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${serviceStats.active > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      Live
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{serviceStats.active}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${serviceStats.featured > 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                      Premium
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{serviceStats.featured}</p>
                  <p className="text-xs text-gray-600">Featured</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                      Types
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{serviceStats.categories}</p>
                  <p className="text-xs text-gray-600">Categories</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${serviceStats.recentServices > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      New
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{serviceStats.recentServices}</p>
                  <p className="text-xs text-gray-600">This Week</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${serviceStats.avgPrice > 0 ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'}`}>
                      Avg
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">₱{serviceStats.avgPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-gray-600">Avg Price</p>
                </div>
              </motion.div>
            </div>

            {/* Verification Status Banner */}
            {!canAddServices() && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                      Complete Verification Required
                    </h3>
                    <p className="text-orange-800 mb-4">
                      To add services and showcase your business, you need to complete both email verification and business document approval. 
                      This helps us maintain quality and trust on our platform.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          getVerificationStatus().emailVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {getVerificationStatus().emailVerified ? '✓' : '✕'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-orange-900">Email Verification</p>
                          <p className="text-sm text-orange-800">
                            {getVerificationStatus().emailVerified ? 'Completed' : 'Required'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          getVerificationStatus().documentsVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {getVerificationStatus().documentsVerified ? '✓' : '✕'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-orange-900">Business Documents</p>
                          <p className="text-sm text-orange-800">
                            {getVerificationStatus().documentsVerified ? 'Approved' : 'Required'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {!getVerificationStatus().emailVerified && (
                        <button
                          onClick={async () => {
                            try {
                              await firebaseAuthService.reloadUser();
                              await refetchProfile(); // Refresh profile data instead
                              window.location.reload();
                            } catch (error) {
                              window.location.reload();
                            }
                          }}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          Check Email Status
                        </button>
                      )}
                      {!getVerificationStatus().documentsVerified && (
                        <button
                          onClick={() => {
                            window.location.href = '/vendor/profile?tab=verification';
                          }}
                          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium"
                        >
                          Upload Documents
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          await refetchProfile(); // Refresh profile data to check for new document approvals
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Refresh Status
                      </button>
                    </div>
                  </div>
                </div>
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
                    <option key={category.value} value={category.value}>{category.display}</option>
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
            <div className="text-center py-20">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
              >
                <Settings className="h-16 w-16 text-rose-400" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                {services.length === 0 ? "Start Your Journey" : "No Services Found"}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed"
              >
                {error && error.includes('Vendor profile required') 
                  ? "To create services, you need to complete your business profile first. This ensures clients can learn about your business and builds trust."
                  : services.length === 0 
                    ? "Transform your wedding expertise into beautiful service listings. Create professional showcases that attract your ideal couples and grow your business."
                    : "No services match your current filters. Try adjusting your search criteria or browse all services."
                }
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <div className="relative">
                  {error && error.includes('Vendor profile required') ? (
                    <button
                      onClick={() => window.location.href = '/vendor/profile'}
                      className="group px-8 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105"
                    >
                      <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      Complete Business Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleQuickCreateService}
                      className={`group px-8 py-4 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-3 ${
                        canAddServices()
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                      }`}
                    >
                      <Plus className={`w-5 h-5 ${canAddServices() ? "group-hover:rotate-90 transition-transform duration-300" : ""}`} />
                      {services.length === 0 ? "Create Your First Service" : "Add New Service"}
                    </button>
                  )}
                  
                  {/* Verification indicator badge */}
                  {!canAddServices() && !error?.includes('Vendor profile required') && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      !
                    </div>
                  )}
                </div>
                {services.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('');
                      setFilterStatus('all');
                    }}
                    className="px-6 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl hover:border-rose-300 hover:text-rose-600 transition-all duration-300 font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  data-service-id={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: highlightedServiceId === service.id ? [1, 1.02, 1, 1.02, 1] : 1
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    scale: highlightedServiceId === service.id ? { duration: 2, repeat: 2, repeatType: "loop" } : {}
                  }}
                  className={`group bg-white backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 ${
                    highlightedServiceId === service.id 
                      ? 'border-rose-400 shadow-rose-200 ring-2 ring-rose-300 bg-gradient-to-br from-rose-50 to-pink-50' 
                      : 'border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {/* Service Image with Enhanced Design */}
                  <div className="relative h-56 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 overflow-hidden">
                    {service.images && service.images.length > 0 && service.images[0] ? (
                      <>
                        <img
                          src={service.images[0]}
                          alt={service.title || service.name || 'Service'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-200 to-pink-200';
                            fallbackDiv.innerHTML = '<div class="text-center"><svg class="h-16 w-16 text-rose-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="text-sm text-rose-600 font-medium">Image failed to load</p></div>';
                            target.parentElement?.appendChild(fallbackDiv);
                          }}
                        />
                        {/* Image Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Image Type Indicator */}
                        {service.images[0].includes('cloudinary.com') && (
                          <div className="absolute top-3 right-3">
                            <div className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Uploaded
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-200 to-pink-200">
                        <div className="text-center">
                          <Camera className="h-16 w-16 text-rose-400 mx-auto mb-2" />
                          <p className="text-sm text-rose-600 font-medium">No photos uploaded</p>
                          <p className="text-xs text-rose-500 mt-1">Click Edit to add images</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.is_active === true
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {service.is_active === true ? 'Available' : 'Unavailable'}
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

                  {/* ABSOLUTELY FIXED Layout Service Content */}
                  <div className="p-6 h-[30rem] flex flex-col">
                    {/* SECTION 1: Header - EXACT 72px height */}
                    <div className="h-18 mb-6 flex">
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="h-6 flex items-center">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {service.title || service.name || 'Untitled Service'}
                          </h3>
                        </div>
                        <div className="h-5 flex items-center gap-2 text-sm text-gray-500">
                          <Tag size={12} />
                          <span className="truncate">{service.category || 'General Service'}</span>
                        </div>
                        <div className="h-4 flex items-center gap-2 text-xs text-gray-400">
                          <MapPin size={10} />
                          <span className="truncate">{service.location || 'Location not specified'}</span>
                        </div>
                      </div>
                      <div className="w-20 flex flex-col justify-between items-end">
                        <div className="h-5 flex items-center gap-1 text-amber-500">
                          <Star size={12} className="fill-current" />
                          <span className="text-xs font-bold">{service.rating || '0.0'}</span>
                        </div>
                        <div className="h-4 flex items-center">
                          <span className="text-xs text-gray-500">{service.review_count || 0} reviews</span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Description - EXACT 72px height */}
                    <div className="h-18 mb-6 flex items-start">
                      <p className="text-gray-600 text-sm leading-6 line-clamp-3 overflow-hidden">
                        {service.description || 'No description available'}
                      </p>
                    </div>

                    {/* SECTION 3: Price & Meta - EXACT 88px height */}
                    <div className="h-22 mb-6 p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex">
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="h-7 flex items-center">
                          <div className="text-xl font-bold text-rose-600">
                            {service.price_range || service.price || 'Price on request'}
                          </div>
                        </div>
                        <div className="h-5 flex items-center">
                          <span className="text-xs text-gray-400">{service.category || 'Service'}</span>
                        </div>
                      </div>
                      <div className="w-24 flex flex-col justify-between items-end text-right">
                        <div className="h-4 flex items-center text-xs text-gray-500">Created</div>
                        <div className="h-4 flex items-center text-xs font-medium text-gray-600">
                          {service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="h-4 flex items-center text-xs text-gray-400 font-mono">ID: {service.id}</div>
                      </div>
                    </div>

                    {/* FIXED: Action Buttons - Always 3 rows, same height */}
                    <div className="flex-1 flex flex-col justify-end space-y-3">
                      {/* Row 1: Primary Actions - Fixed Height */}
                      <div className="flex gap-2 h-12">
                        <button
                          onClick={() => editService(service)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <Edit size={14} />
                          Edit Details
                        </button>
                        
                        <button
                          onClick={() => toggleServiceAvailability(service)}
                          className={`flex-1 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                            service.is_active === true
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                          }`}
                        >
                          {service.is_active === true ? (
                            <>
                              <EyeOff size={14} />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              Show
                            </>
                          )}
                        </button>
                      </div>

                      {/* Row 2: Secondary Actions - Fixed Height */}
                      <div className="flex gap-2 h-10">
                        <button
                          onClick={async () => {
                            // Use the public preview URL instead of vendor-only URL
                            const url = `${window.location.origin}/service/${service.id}`;
                            try {
                              await navigator.clipboard.writeText(url);
                              // Create a temporary toast notification
                              const toast = document.createElement('div');
                              toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all';
                              toast.textContent = '✓ Public service link copied to clipboard!';
                              document.body.appendChild(toast);
                              setTimeout(() => {
                                toast.style.opacity = '0';
                                setTimeout(() => document.body.removeChild(toast), 300);
                              }, 2000);
                            } catch (err) {
                              alert('Public service link copied: ' + url);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md"
                          title="Copy public service link"
                        >
                          <Copy size={12} />
                          Copy Link
                        </button>
                        
                        <button
                          onClick={async () => {
                            // Use the public preview URL for sharing
                            const url = `${window.location.origin}/service/${service.id}`;
                            const shareData = {
                              title: `${service.title || service.name} - Wedding Service`,
                              text: service.description || 'Check out this amazing wedding service!',
                              url: url
                            };
                            
                            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                              try {
                                await navigator.share(shareData);
                              } catch (err) {
                                console.log('Share cancelled or failed');
                              }
                            } else {
                              // Fallback to clipboard
                              try {
                                await navigator.clipboard.writeText(url);
                                const toast = document.createElement('div');
                                toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all';
                                toast.textContent = '✓ Public service link copied to clipboard!';
                                document.body.appendChild(toast);
                                setTimeout(() => {
                                  toast.style.opacity = '0';
                                  setTimeout(() => document.body.removeChild(toast), 300);
                                }, 2000);
                              } catch (err) {
                                alert('Public service link: ' + url);
                              }
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md"
                          title="Share service"
                        >
                          <Share2 size={12} />
                          Share
                        </button>

                      </div>

                      {/* Row 3: View & Delete Actions - Fixed Height */}
                      <div className="flex gap-2 h-10">
                        <button
                          onClick={() => {
                            // Create a comprehensive detailed preview modal
                            const modalHtml = `
                              <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="this.remove()">
                                <div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" onclick="event.stopPropagation()">
                                  <div class="p-8">
                                    <!-- Header -->
                                    <div class="flex items-center justify-between mb-6">
                                      <div class="flex-1">
                                        <h2 class="text-3xl font-bold text-gray-900 mb-2">${service.title || service.name || 'Service Details'}</h2>
                                        <div class="flex items-center gap-2 text-gray-600">
                                          <span class="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium">${service.category || 'Wedding Service'}</span>
                                          <span class="px-3 py-1 rounded-full text-sm font-medium ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                            ${service.is_active ? '✓ Available' : '✗ Unavailable'}
                                          </span>
                                          ${service.featured ? '<span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">⭐ Featured</span>' : ''}
                                        </div>
                                      </div>
                                      <button onclick="this.closest('.fixed').remove()" class="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                      </button>
                                    </div>
                                    
                                    <!-- Image Gallery -->
                                    ${service.images && service.images.length > 0 ? `
                                      <div class="mb-8">
                                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Gallery</h3>
                                        <div class="grid grid-cols-1 ${service.images.length > 1 ? 'md:grid-cols-2' : ''} gap-4">
                                          ${service.images.map((img, idx) => `
                                            <div class="rounded-2xl overflow-hidden bg-gray-100">
                                              <img src="${img}" alt="Service Image ${idx + 1}" class="w-full h-64 object-cover">
                                            </div>
                                          `).join('')}
                                        </div>
                                      </div>
                                    ` : `
                                      <div class="mb-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl text-center">
                                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-gray-600 font-medium">No images uploaded yet</p>
                                        <p class="text-gray-500 text-sm mt-1">Add photos to showcase your service</p>
                                      </div>
                                    `}
                                    
                                    <!-- Service Details Grid -->
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                      <!-- Left Column -->
                                      <div class="space-y-6">
                                        <div>
                                          <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Description</h3>
                                          <div class="p-4 bg-gray-50 rounded-xl">
                                            <p class="text-gray-700 leading-relaxed">${service.description || 'No description provided for this service yet.'}</p>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <h3 class="text-lg font-semibold text-gray-900 mb-3">Pricing Information</h3>
                                          <div class="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl">
                                            <div class="text-3xl font-bold text-rose-600 mb-2">
                                              ${service.price_range && service.price_range !== '₱' 
                                                ? service.price_range 
                                                : `₱${typeof service.price === 'string' ? parseFloat(service.price).toLocaleString() : ((service.price as number) || 0).toLocaleString()}`}
                                            </div>
                                            <p class="text-gray-600 text-sm">Base service pricing</p>
                                          </div>
                                        </div>
                                        
                                        ${service.location ? `
                                          <div>
                                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Location</h3>
                                            <div class="p-4 bg-blue-50 rounded-xl flex items-center gap-3">
                                              <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                              </svg>
                                              <p class="text-gray-700">${service.location}</p>
                                            </div>
                                          </div>
                                        ` : ''}
                                      </div>
                                      
                                      <!-- Right Column -->
                                      <div class="space-y-6">
                                        <div>
                                          <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                                          <div class="space-y-3">
                                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                              <span class="text-gray-600">Service Rating</span>
                                              <div class="flex items-center gap-1">
                                                <svg class="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                </svg>
                                                <span class="font-semibold text-gray-900">${service.rating?.toFixed(1) || '4.5'}</span>
                                                <span class="text-gray-500 text-sm">(${service.review_count || service.reviewCount || 0} reviews)</span>
                                              </div>
                                            </div>
                                            
                                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                              <span class="text-gray-600">Vendor ID</span>
                                              <span class="font-mono text-sm text-gray-900">${service.vendor_id || service.vendorId || 'N/A'}</span>
                                            </div>
                                            
                                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                              <span class="text-gray-600">Service ID</span>
                                              <span class="font-mono text-sm text-gray-900">${service.id}</span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        ${service.features && service.features.length > 0 ? `
                                          <div>
                                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Features</h3>
                                            <div class="grid grid-cols-1 gap-2">
                                              ${service.features.map(feature => `
                                                <div class="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                  </svg>
                                                  <span class="text-gray-700 text-sm">${feature}</span>
                                                </div>
                                              `).join('')}
                                            </div>
                                          </div>
                                        ` : ''}
                                        
                                        ${service.tags && service.tags.length > 0 ? `
                                          <div>
                                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                                            <div class="flex flex-wrap gap-2">
                                              ${service.tags.map(tag => `
                                                <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">#${tag}</span>
                                              `).join('')}
                                            </div>
                                          </div>
                                        ` : ''}
                                      </div>
                                    </div>
                                    
                                    <!-- Contact & Actions Section -->
                                    <div class="border-t border-gray-200 pt-6">
                                      <div class="flex flex-col lg:flex-row gap-6 items-start justify-between">
                                        <!-- Service Metadata -->
                                        <div class="flex-1">
                                          <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
                                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                              <strong>Created:</strong> ${new Date(service.created_at || '').toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                              })}
                                            </div>
                                            <div>
                                              <strong>Last Updated:</strong> ${new Date(service.updated_at || '').toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                              })}
                                            </div>
                                            ${service.keywords ? `
                                              <div class="md:col-span-2">
                                                <strong>Keywords:</strong> ${service.keywords}
                                              </div>
                                            ` : ''}
                                          </div>
                                        </div>
                                        
                                        <!-- Action Buttons -->
                                        <div class="flex flex-col gap-3 min-w-[200px]">
                                          <button 
                                            onclick="window.open('${window.location.origin}/service/${service.id}', '_blank')"
                                            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                          >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                            </svg>
                                            View Public Page
                                          </button>
                                          
                                          <button 
                                            onclick="navigator.clipboard.writeText('${window.location.origin}/service/${service.id}').then(() => {
                                              this.innerHTML = '<svg class=\\"w-4 h-4\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\"><path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M5 13l4 4L19 7\\"></path></svg> Copied!';
                                              setTimeout(() => {
                                                this.innerHTML = '<svg class=\\"w-4 h-4\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\"><path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\\"></path></svg> Copy Public Link';
                                              }, 2000);
                                            })"
                                            class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2"
                                          >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                            </svg>
                                            Copy Public Link
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            `;
                            
                            const modalElement = document.createElement('div');
                            modalElement.innerHTML = modalHtml;
                            const modalEl = modalElement.firstElementChild;
                            if (modalEl) {
                              document.body.appendChild(modalEl);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md"
                          title="View comprehensive service details"
                        >
                          <Eye size={12} />
                          View Details
                        </button>
                        
                        <button
                          onClick={() => {
                            // Enhanced delete confirmation with better UX
                            const confirmDelete = () => {
                              const modalHtml = `
                                <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                  <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
                                    <div class="text-center">
                                      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                      </div>
                                      <h3 class="text-xl font-bold text-gray-900 mb-2">Delete Service?</h3>
                                      <p class="text-gray-600 mb-6">
                                        Are you sure you want to delete "<strong>${service.title || service.name}</strong>"? This action cannot be undone.
                                      </p>
                                      <div class="flex gap-3 justify-center">
                                        <button 
                                          onclick="this.closest('.fixed').remove()" 
                                          class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          onclick="
                                            this.innerHTML = 'Deleting...';
                                            this.disabled = true;
                                            // Call the actual delete function
                                            window.deleteServiceConfirmed('${service.id}');
                                            this.closest('.fixed').remove();
                                          " 
                                          class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                                        >
                                          Delete Service
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              `;
                              
                              const modalElement = document.createElement('div');
                              modalElement.innerHTML = modalHtml;
                              const modalEl = modalElement.firstElementChild;
                              if (modalEl) {
                                document.body.appendChild(modalEl);
                              }
                            };
                            
                            // Set up the global delete function
                            (window as any).deleteServiceConfirmed = (serviceId: string) => {
                              deleteService(serviceId);
                            };
                            
                            confirmDelete();
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-md"
                          title="Delete service (with confirmation)"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
        editingService={editingService ? {
          ...editingService,
          vendor_id: (editingService.vendorId || editingService.vendor_id || vendorId) as string,
          title: editingService.title || editingService.name || '',
          is_active: editingService.is_active ?? editingService.isActive ?? true,
          price: typeof editingService.price === 'string' ? parseFloat(editingService.price) : (editingService.price as number),
          created_at: editingService.created_at || new Date().toISOString(),
          updated_at: editingService.updated_at || new Date().toISOString()
        } : null}
        vendorId={vendorId || ''}
        isLoading={false}
      />

      {/* Verification Prompt Modal */}
      {showVerificationPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
          >
            <button
              onClick={() => setShowVerificationPrompt(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Verification Required</h3>
              <p className="text-gray-600">
                You need to complete both email verification and business document approval before you can add services.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  getVerificationStatus().emailVerified 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {getVerificationStatus().emailVerified ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Email Verification</p>
                  <p className="text-sm text-gray-600">
                    {getVerificationStatus().emailVerified ? 'Verified ✓' : 'Required - Please check your email and click the verification link'}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl ${!getVerificationStatus().documentsVerified ? 'border-l-4 border-orange-500' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  getVerificationStatus().documentsVerified
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {getVerificationStatus().documentsVerified ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Business Documents</p>
                  <p className="text-sm text-gray-600">
                    {getVerificationStatus().documentsVerified 
                      ? 'Approved ✓' 
                      : 'Required - Upload and get admin approval for business documents'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
                <div className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center">○</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Phone Verification</p>
                  <p className="text-sm text-gray-600">Optional - Enhances customer trust</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerificationPrompt(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    // Refresh verification status
                    try {
                      await firebaseAuthService.reloadUser();
                      await refetchProfile(); // Refresh profile data including documents
                      setShowVerificationPrompt(false);
                    } catch (error) {
                      console.error('Error refreshing verification status:', error);
                      window.location.reload(); // Fallback refresh
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Refresh Status
                </button>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex gap-3">
                {!getVerificationStatus().emailVerified && (
                  <button
                    onClick={() => {
                      // Navigate to email verification or resend email
                      window.open('mailto:', '_blank'); // Opens default email client
                    }}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium text-sm"
                  >
                    Check Email
                  </button>
                )}
                
                {!getVerificationStatus().documentsVerified && (
                  <button
                    onClick={() => {
                      // Navigate to profile verification tab
                      window.location.href = '/vendor/profile?tab=verification';
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-colors font-medium text-sm"
                  >
                    Upload Documents
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Add Service Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <div className="relative">
          <button
            onClick={handleQuickCreateService}
            className={`w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group ${
              canAddServices()
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={canAddServices() ? "Add New Service" : "Email verification and document approval required"}
          >
            <Plus size={24} className={canAddServices() ? "group-hover:rotate-90 transition-transform duration-300" : ""} />
          </button>
          
          {/* Verification indicator badge */}
          {!canAddServices() && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">
              !
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
