/**
 * 🏠 VendorServicesMain - Micro Frontend Container
 * 
 * Main container component that integrates all vendor services micro frontends
 * This is the new entry point for the vendor services feature
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, Eye, Crown } from 'lucide-react';
import { VendorHeader } from '../../../../../shared/components/layout/VendorHeader';
import { ServiceFilters } from './ServiceFilters';
import { ServiceListView } from './ServiceListView';
import { AddServiceForm } from './AddServiceForm';
import { useAuth } from '../../../../../shared/contexts/HybridAuthContext';
import { useSubscription } from '../../../../../shared/contexts/SubscriptionContext';

// Import micro services
import {
  fetchVendorServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  type Service
} from '../services';

import {
  resolveVendorId,
  getServicesVendorId
} from '../services/vendorIdResolver';

import {
  checkServiceLimit,
  ensureVendorProfile
} from '../services/subscriptionValidator';

export const VendorServicesMain: React.FC = () => {
  // Auth & Context
  const { user } = useAuth();
  const { subscription, showUpgradePrompt } = useSubscription();
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Filters
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [highlightedServiceId] = useState<string | null>(null);
  
  // Vendor ID Resolution
  const [vendorIdResolution, setVendorIdResolution] = useState<Awaited<ReturnType<typeof resolveVendorId>> | null>(null);
  const servicesVendorId = vendorIdResolution ? getServicesVendorId(vendorIdResolution) : null;

  // Resolve vendor ID on mount
  useEffect(() => {
    const resolveId = async () => {
      if (user) {
        const resolution = await resolveVendorId(user.id, user.vendorId);
        setVendorIdResolution(resolution);
      }
    };
    resolveId();
  }, [user]);

  // Load services
  const loadServices = useCallback(async () => {
    if (!servicesVendorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedServices = await fetchVendorServices(servicesVendorId);
      // Services are already normalized from API, use them directly
      setServices(fetchedServices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      console.error('Error loading services:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [servicesVendorId]);

  useEffect(() => {
    if (servicesVendorId) {
      loadServices();
    }
  }, [servicesVendorId, loadServices]);

  // Handle Add Service (with subscription check)
  const handleAddService = async () => {
    // Check service limit - cast subscription to match expected type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limitCheck = checkServiceLimit(subscription as any, services.length, false);
    
    if (!limitCheck.allowed) {
      showUpgradePrompt(
        limitCheck.message || 'Service limit reached',
        limitCheck.suggestedPlan || 'premium'
      );
      return;
    }

    // Check vendor profile exists
    const profileCheck = await ensureVendorProfile(servicesVendorId, user?.id || null);
    if (!profileCheck.exists) {
      setError(profileCheck.error || 'Please complete your vendor profile first');
      return;
    }

    setIsCreating(true);
  };

  // Handle Submit (Create/Update)
  const handleSubmit = async (serviceData: Partial<Service>) => {
    if (!servicesVendorId) {
      setError('Vendor ID not found');
      return;
    }

    try {
      if (editingService) {
        // Update
        const result = await updateService(editingService.id, serviceData);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update service');
        }
      } else {
        // Create
        const result = await createService(serviceData, servicesVendorId);
        if (!result.success) {
          // Check if it's a subscription limit error
          if (result.error?.includes('limit') || result.error?.includes('maximum')) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const limitCheck = checkServiceLimit(subscription as any, services.length, false);
            showUpgradePrompt(
              result.error,
              limitCheck.suggestedPlan || 'premium'
            );
            return;
          }
          throw new Error(result.error || 'Failed to create service');
        }
      }

      // Success - close form and reload
      setIsCreating(false);
      setEditingService(null);
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save service';
      console.error('Error saving service:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw for form to handle
    }
  };

  // Handle Delete
  const handleDelete = async (serviceId: string) => {
    const confirmed = confirm(
      '⚠️ Delete Service Confirmation\n\n' +
      'Are you sure you want to delete this service?\n\n' +
      '• If this service has existing bookings, it will be hidden from customers but preserved in our records\n' +
      '• If no bookings exist, it will be completely removed\n\n' +
      'Continue with deletion?'
    );
    
    if (!confirmed) return;

    try {
      const result = await deleteService(serviceId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete service');
      }
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service';
      console.error('Error deleting service:', errorMessage);
      alert(`Failed to delete service: ${errorMessage}`);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const result = await toggleServiceStatus(serviceId, isActive);
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle service status');
      }
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle status';
      console.error('Error toggling status:', errorMessage);
      alert(`Failed to toggle status: ${errorMessage}`);
    }
  };

  // Handle Edit
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsCreating(true);
  };

  // Handle Share
  const handleShare = (service: Service) => {
    const shareUrl = `${window.location.origin}/services/${service.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Service link copied to clipboard!');
  };

  // Filter services
  const filteredServices = services.filter(service => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        service.name?.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower) ||
        service.category?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filterCategory && service.category !== filterCategory) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      const isActive = service.is_active ?? service.isActive ?? true;
      if (filterStatus === 'active' && !isActive) return false;
      if (filterStatus === 'inactive' && isActive) return false;
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active ?? s.isActive ?? true).length,
    inactive: services.filter(s => !(s.is_active ?? s.isActive ?? true)).length,
    featured: services.filter(s => s.featured).length,
    avgRating: services.length > 0 
      ? services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length 
      : 0
  };

  const maxServices = subscription?.plan?.limits?.max_services || 5;
  const servicesRemaining = maxServices === -1 ? '∞' : Math.max(0, maxServices - services.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <VendorHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Services
          </h1>
          <p className="text-gray-600">
            Manage your wedding services and showcase your offerings to couples
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-pink-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Services</h3>
            <p className="text-xs text-gray-500 mt-1">{servicesRemaining} slots remaining</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-green-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Active Services</h3>
            <p className="text-xs text-gray-500 mt-1">Visible to couples</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-yellow-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.featured}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Featured</h3>
            <p className="text-xs text-gray-500 mt-1">Premium visibility</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-blue-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Avg Rating</h3>
            <p className="text-xs text-gray-500 mt-1">From customer reviews</p>
          </motion.div>
        </div>

        {/* Add Service Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            {filteredServices.length !== services.length && (
              <p className="text-sm text-gray-600">
                Showing {filteredServices.length} of {services.length} services
              </p>
            )}
          </div>
          
          <button
            onClick={handleAddService}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        {/* Filters */}
        <ServiceFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadServices}
          isRefreshing={loading}
          resultCount={filteredServices.length}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            <p className="font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Services List */}
        <ServiceListView
          services={filteredServices}
          viewMode={viewMode}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onShare={handleShare}
          highlightedServiceId={highlightedServiceId}
          emptyMessage="No services found. Add your first service to get started!"
          emptyAction={{
            label: 'Add Your First Service',
            onClick: handleAddService
          }}
        />

        {/* Add/Edit Service Modal */}
        {isCreating && (
          <AddServiceForm
            isOpen={isCreating}
            onClose={() => {
              setIsCreating(false);
              setEditingService(null);
            }}
            onSubmit={handleSubmit}
            editingService={editingService as unknown as NonNullable<React.ComponentProps<typeof AddServiceForm>['editingService']>}
            vendorId={servicesVendorId || ''}
          />
        )}
      </div>
    </div>
  );
};
