/**
 * Service API Integration Module
 * Handles all API calls related to service management with error handling and retry logic
 */

import type { 
  Service, 
  ServiceFilters, 
  ServiceFormData, 
  ServiceResponse, 
  ServiceSearchResult,
  ServiceSearchParams,
  DatabaseService
} from '../types/services';

export class ServiceAPI {
  private baseUrl: string;
  private retryCount: number = 3;
  private retryDelay: number = 1000;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  // Generic API call with retry logic
  private async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {},
    retries: number = this.retryCount
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 [ServiceAPI] Attempt ${attempt}/${retries}: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...options.headers
          },
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ [ServiceAPI] Success: ${url}`, data);
        return data;

      } catch (error) {
        console.warn(`⚠️ [ServiceAPI] Attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          console.error(`❌ [ServiceAPI] All attempts failed for ${url}`);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // Get all services with filters
  async getAllServices(filters?: ServiceFilters): Promise<ServiceResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.location) queryParams.append('location', filters.location);
    if (filters?.priceRange) queryParams.append('priceRange', filters.priceRange);
    if (filters?.rating) queryParams.append('rating', filters.rating.toString());
    if (filters?.featured) queryParams.append('featured', 'true');
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const queryString = queryParams.toString();
    const endpoints = [
      `/api/services/simple${queryString ? `?${queryString}` : ''}`,
      `/api/services${queryString ? `?${queryString}` : ''}`,
      `/api/services/direct${queryString ? `?${queryString}` : ''}`
    ];

    // Try multiple endpoints for redundancy
    for (const endpoint of endpoints) {
      try {
        const data = await this.apiCall<ServiceResponse>(endpoint);
        if (data.success && data.services && Array.isArray(data.services)) {
          return {
            ...data,
            services: data.services.map(this.mapDatabaseService)
          };
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint}:`, error);
      }
    }

    return {
      success: false,
      services: [],
      total: 0,
      error: 'Failed to fetch services from all endpoints'
    };
  }

  // Get services by vendor
  async getVendorServices(vendorId: string): Promise<ServiceResponse> {
    try {
      const data = await this.apiCall<ServiceResponse>(`/api/services?vendorId=${vendorId}`);
      return {
        ...data,
        services: data.services?.map(this.mapDatabaseService) || []
      };
    } catch (error) {
      return {
        success: false,
        services: [],
        error: `Failed to fetch vendor services: ${error}`
      };
    }
  }

  // Get single service by ID
  async getService(serviceId: string): Promise<ServiceResponse> {
    try {
      const data = await this.apiCall<ServiceResponse>(`/api/services/${serviceId}`);
      return {
        ...data,
        service: data.service ? this.mapDatabaseService(data.service) : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch service: ${error}`
      };
    }
  }

  // Search services with advanced parameters
  async searchServices(params: ServiceSearchParams): Promise<ServiceSearchResult> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('q', params.query);
    if (params.category) queryParams.append('category', params.category);
    if (params.location) queryParams.append('location', params.location);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params.features) queryParams.append('features', params.features.join(','));
    if (params.available !== undefined) queryParams.append('available', params.available.toString());
    if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    try {
      const data = await this.apiCall<ServiceSearchResult>(`/api/services/search?${queryParams}`);
      return {
        ...data,
        services: data.services.map(this.mapDatabaseService)
      };
    } catch (error) {
      return {
        services: [],
        total: 0,
        page: params.page || 1,
        totalPages: 0,
        filters: {},
        success: false
      };
    }
  }

  // Create new service
  async createService(serviceData: ServiceFormData): Promise<ServiceResponse> {
    try {
      const data = await this.apiCall<ServiceResponse>('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });
      
      return {
        ...data,
        service: data.service ? this.mapDatabaseService(data.service) : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create service: ${error}`
      };
    }
  }

  // Update existing service
  async updateService(serviceId: string, serviceData: Partial<ServiceFormData>): Promise<ServiceResponse> {
    try {
      const data = await this.apiCall<ServiceResponse>(`/api/services/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...serviceData,
          updated_at: new Date().toISOString()
        })
      });
      
      return {
        ...data,
        service: data.service ? this.mapDatabaseService(data.service) : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update service: ${error}`
      };
    }
  }

  // Delete service
  async deleteService(serviceId: string): Promise<ServiceResponse> {
    try {
      const data = await this.apiCall<ServiceResponse>(`/api/services/${serviceId}`, {
        method: 'DELETE'
      });
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete service: ${error}`
      };
    }
  }

  // Feature/unfeature service
  async toggleServiceFeature(serviceId: string, featured: boolean): Promise<ServiceResponse> {
    return this.updateService(serviceId, { featured });
  }

  // Activate/deactivate service
  async toggleServiceStatus(serviceId: string, active: boolean): Promise<ServiceResponse> {
    return this.updateService(serviceId, { is_active: active });
  }

  // Get service categories
  async getServiceCategories(): Promise<{ categories: string[]; success: boolean; error?: string }> {
    try {
      const data = await this.apiCall<{ categories: string[]; success: boolean }>('/api/services/categories');
      return data;
    } catch (error) {
      // Return fallback categories
      return {
        success: true,
        categories: [
          'Photography',
          'Videography', 
          'Catering',
          'Venues',
          'Flowers & Decor',
          'Music & DJ',
          'Wedding Planning',
          'Makeup & Hair',
          'Transportation',
          'Officiant'
        ]
      };
    }
  }

  // Get featured services
  async getFeaturedServices(limit: number = 6): Promise<ServiceResponse> {
    return this.getAllServices({ featured: true, limit });
  }

  // Get services by category
  async getServicesByCategory(category: string, limit?: number): Promise<ServiceResponse> {
    return this.getAllServices({ category, limit });
  }

  // Get services by location
  async getServicesByLocation(location: string, limit?: number): Promise<ServiceResponse> {
    return this.getAllServices({ location, limit });
  }

  // Get popular services (high rating)
  async getPopularServices(limit: number = 10): Promise<ServiceResponse> {
    return this.getAllServices({ rating: 4.5, limit });
  }

  // Upload service images
  async uploadServiceImages(serviceId: string, images: File[]): Promise<{ 
    success: boolean; 
    urls?: string[]; 
    error?: string 
  }> {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      const response = await fetch(`${this.baseUrl}/api/services/${serviceId}/images`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to upload images: ${error}`
      };
    }
  }

  // Get service analytics
  async getServiceAnalytics(serviceId: string): Promise<{
    success: boolean;
    analytics?: {
      views: number;
      inquiries: number;
      bookings: number;
      rating: number;
      reviews: number;
    };
    error?: string;
  }> {
    try {
      const data = await this.apiCall<any>(`/api/services/${serviceId}/analytics`);
      return data;
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch analytics: ${error}`
      };
    }
  }

  // Map database service to frontend format
  private mapDatabaseService = (dbService: any): Service => {
    const categoryMap: { [key: string]: string } = {
      'other': 'Wedding Services',
      'DJ': 'Music & DJ',
      'photographer': 'Photography',
      'videographer': 'Videography',
      'caterer': 'Catering',
      'venue': 'Venues',
      'florist': 'Flowers & Decor',
      'planner': 'Wedding Planning',
      'makeup': 'Makeup & Hair',
      'transport': 'Transportation',
      'officiant': 'Officiant'
    };

    const category = categoryMap[dbService.category] || dbService.category || 'Wedding Services';
    
    return {
      id: dbService.id || `service-${Date.now()}`,
      title: dbService.title || dbService.name || 'Professional Wedding Service',
      name: dbService.title || dbService.name || 'Professional Wedding Service',
      category: category,
      vendor_id: dbService.vendor_id || 'unknown-vendor',
      vendorId: dbService.vendor_id || 'unknown-vendor',
      vendorName: dbService.vendor_name || 'Wedding Professional',
      vendorImage: dbService.vendor_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      description: dbService.description || `Professional ${category.toLowerCase()} service for your special day`,
      price: typeof dbService.price === 'string' ? parseFloat(dbService.price) : dbService.price,
      priceRange: this.formatPriceRange(dbService.price, category),
      location: dbService.location || 'Metro Manila, Philippines',
      rating: dbService.rating || (4.0 + Math.random() * 1.0),
      reviewCount: dbService.review_count || Math.floor(Math.random() * 100) + 10,
      image: dbService.image || (dbService.images && dbService.images[0]) || this.getCategoryImage(category),
      images: dbService.images || [this.getCategoryImage(category)],
      gallery: dbService.images || [this.getCategoryImage(category)],
      features: dbService.features || this.getDefaultFeatures(category),
      is_active: dbService.is_active !== false,
      availability: dbService.is_active !== false,
      featured: dbService.featured || false,
      created_at: dbService.created_at || new Date().toISOString(),
      updated_at: dbService.updated_at || new Date().toISOString(),
      contactInfo: {
        phone: dbService.contact_phone || '+63917-XXX-XXXX',
        email: dbService.contact_email || 'contact@vendor.ph',
        website: dbService.contact_website || 'https://vendor.ph'
      }
    };
  };

  private formatPriceRange(price: any, category: string): string {
    if (price && typeof price === 'number') {
      return `₱${price.toLocaleString()}`;
    }
    if (price && typeof price === 'string') {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `₱${numPrice.toLocaleString()}`;
      }
    }
    
    // Default price ranges by category
    const defaultPrices: { [key: string]: string } = {
      'Photography': '₱45,000 - ₱120,000',
      'Videography': '₱55,000 - ₱150,000',
      'Catering': '₱1,800 - ₱4,500 per person',
      'Venues': '₱50,000 - ₱300,000',
      'Flowers & Decor': '₱25,000 - ₱80,000',
      'Music & DJ': '₱25,000 - ₱65,000',
      'Wedding Planning': '₱75,000 - ₱200,000',
      'Makeup & Hair': '₱20,000 - ₱50,000',
      'Transportation': '₱15,000 - ₱35,000',
      'Officiant': '₱15,000 - ₱30,000'
    };
    
    return defaultPrices[category] || 'Contact for pricing';
  }

  private getCategoryImage(category: string): string {
    const categoryImages: { [key: string]: string } = {
      'Photography': 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600',
      'Videography': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
      'Catering': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
      'Venues': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
      'Flowers & Decor': 'https://images.unsplash.com/photo-1522673607200-164d1b6ce2d2?w=600',
      'Music & DJ': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
      'Wedding Planning': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
      'Makeup & Hair': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
      'Transportation': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
      'Officiant': 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600'
    };

    return categoryImages[category] || 'https://images.unsplash.com/photo-1519167758481-83f29c8498c5?w=600';
  }

  private getDefaultFeatures(category: string): string[] {
    const defaultFeatures: { [key: string]: string[] } = {
      'Photography': ['Full Day Coverage', 'Same Day Edit', 'Pre-wedding Shoot', 'Digital Gallery'],
      'Videography': ['Cinematic Style', 'Drone Footage', 'Same Day Edit', 'Highlight Reel'],
      'Catering': ['Custom Menu', 'Professional Staff', 'Setup & Cleanup', 'Dietary Options'],
      'Venues': ['Indoor/Outdoor Options', 'Catering Kitchen', 'Parking', 'Bridal Suite'],
      'Flowers & Decor': ['Bridal Bouquet', 'Ceremony Decor', 'Reception Centerpieces', 'Seasonal Flowers'],
      'Music & DJ': ['Professional DJ', 'Sound System', 'LED Lighting', 'MC Services'],
      'Wedding Planning': ['Full Planning', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination'],
      'Makeup & Hair': ['Bridal Makeup', 'Hair Styling', 'Trial Session', 'Touch-up Kit'],
      'Transportation': ['Luxury Vehicles', 'Professional Chauffeur', 'Wedding Decoration', 'Multiple Cars'],
      'Officiant': ['Traditional Ceremonies', 'Custom Vows', 'Interfaith Services', 'Legal Documentation']
    };

    return defaultFeatures[category] || ['Professional Service', 'Quality Guaranteed', 'Licensed & Insured'];
  }

  // Health check for API
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        details: data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message }
      };
    }
  }
}

// Export singleton instance
export const serviceAPI = new ServiceAPI();
