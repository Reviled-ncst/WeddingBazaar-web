import { useState, useEffect } from 'react';
import type { Service, ServiceFilters, ServiceResponse, ViewMode } from '../types';
import { servicesApiService } from '../services/servicesApiService';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<ServiceFilters>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedLocation: 'all',
    selectedPriceRange: 'all',
    selectedRating: 0,
    sortBy: 'relevance'
  });

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        query: filters.searchQuery || undefined,
        category: filters.selectedCategory !== 'all' ? filters.selectedCategory : undefined,
        location: filters.selectedLocation !== 'all' ? filters.selectedLocation : undefined,
        priceRange: filters.selectedPriceRange !== 'all' ? filters.selectedPriceRange : undefined,
        minRating: filters.selectedRating > 0 ? filters.selectedRating : undefined,
        sortBy: filters.sortBy !== 'relevance' ? filters.sortBy : undefined,
      };

      const response: ServiceResponse = await servicesApiService.getServices(params);
      setServices(response.services);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const updateFilters = (newFilters: Partial<ServiceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategory: 'all',
      selectedLocation: 'all',
      selectedPriceRange: 'all',
      selectedRating: 0,
      sortBy: 'relevance'
    });
  };

  return {
    services,
    loading,
    error,
    total,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchServices
  };
};

export const useServiceDetails = (serviceId: string | null) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setService(null);
      return;
    }

    const fetchService = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const serviceData = await servicesApiService.getServiceById(serviceId);
        setService(serviceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  return {
    service,
    loading,
    error
  };
};

export const useServiceActions = () => {
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());

  const toggleLike = (serviceId: string) => {
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

  const contactVendor = async (service: Service): Promise<boolean> => {
    try {
      return await servicesApiService.createConversationWithVendor(
        service.vendorName,
        service.name
      );
    } catch (error) {
      console.error('Error contacting vendor:', error);
      return false;
    }
  };

  return {
    likedServices,
    toggleLike,
    contactVendor
  };
};

export const useViewMode = (initialMode: ViewMode = 'grid') => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  return {
    viewMode,
    setViewMode,
    isGrid: viewMode === 'grid',
    isList: viewMode === 'list'
  };
};
