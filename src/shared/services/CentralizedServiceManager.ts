/**
 * Centralized Service Management System
 * Handles all service operations with business rules, vendor permissions, and data consistency
 */

// Temporary fix for module resolution issues - define Service interface locally
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

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  average_price_range: string;
  popular_features: string[];
  requires_portfolio: boolean;
  verification_required: boolean;
}

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

type VendorTier = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM' | 'ENTERPRISE';

// Business Rules Configuration
export const SERVICE_BUSINESS_RULES = {
  // Vendor tier limits
  VENDOR_LIMITS: {
    BASIC: {
      max_services: 5,
      max_images_per_service: 3,
      max_categories: 2,
      featured_services: 0,
      premium_features: false,
      analytics_access: false
    },
    PROFESSIONAL: {
      max_services: 15,
      max_images_per_service: 8,
      max_categories: 5,
      featured_services: 2,
      premium_features: true,
      analytics_access: true
    },
    PREMIUM: {
      max_services: -1, // Unlimited
      max_images_per_service: 20,
      max_categories: -1, // Unlimited
      featured_services: 5,
      premium_features: true,
      analytics_access: true
    }
  },

  // Service validation rules
  VALIDATION_RULES: {
    title: {
      min_length: 10,
      max_length: 100,
      required: true,
      pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
    },
    description: {
      min_length: 50,
      max_length: 1000,
      required: true
    },
    price: {
      min_value: 1000,
      max_value: 1000000,
      required: false
    },
    images: {
      min_count: 1,
      max_count_per_tier: {
        BASIC: 3,
        PROFESSIONAL: 8,
        PREMIUM: 20
      },
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      max_file_size: 5 * 1024 * 1024 // 5MB
    }
  },

  // Category restrictions
  CATEGORY_RULES: {
    restricted_categories: ['Adult Services', 'Gambling', 'Alcohol'],
    premium_only_categories: ['Celebrity Services', 'International Services'],
    requires_verification: ['Catering', 'Transportation', 'Security']
  },

  // Pricing rules
  PRICING_RULES: {
    commission_rates: {
      BASIC: 0.15, // 15%
      PROFESSIONAL: 0.12, // 12%
      PREMIUM: 0.08 // 8%
    },
    featured_listing_cost: {
      per_month: 2500,
      per_week: 800,
      per_day: 150
    }
  }
};

// Service Categories Configuration
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'photography',
    name: 'Photography',
    icon: '📸',
    description: 'Wedding photography services',
    average_price_range: '₱45,000 - ₱120,000',
    popular_features: ['Full Day Coverage', 'Same Day Edit', 'Pre-wedding Shoot', 'Digital Gallery'],
    requires_portfolio: true,
    verification_required: false
  },
  {
    id: 'videography',
    name: 'Videography',
    icon: '🎥',
    description: 'Wedding videography and cinematography',
    average_price_range: '₱55,000 - ₱150,000',
    popular_features: ['Cinematic Style', 'Drone Footage', 'Same Day Edit', 'Highlight Reel'],
    requires_portfolio: true,
    verification_required: false
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: '🍽️',
    description: 'Wedding catering and food services',
    average_price_range: '₱1,800 - ₱4,500 per person',
    popular_features: ['Custom Menu', 'Professional Staff', 'Setup & Cleanup', 'Dietary Options'],
    requires_portfolio: true,
    verification_required: true
  },
  {
    id: 'venues',
    name: 'Venues',
    icon: '🏛️',
    description: 'Wedding venues and event spaces',
    average_price_range: '₱50,000 - ₱300,000',
    popular_features: ['Indoor/Outdoor Options', 'Catering Kitchen', 'Parking', 'Bridal Suite'],
    requires_portfolio: true,
    verification_required: true
  },
  {
    id: 'flowers',
    name: 'Flowers & Decor',
    icon: '🌸',
    description: 'Floral arrangements and decorations',
    average_price_range: '₱25,000 - ₱80,000',
    popular_features: ['Bridal Bouquet', 'Ceremony Decor', 'Reception Centerpieces', 'Seasonal Flowers'],
    requires_portfolio: true,
    verification_required: false
  },
  {
    id: 'music',
    name: 'Music & DJ',
    icon: '🎵',
    description: 'DJ services and wedding music',
    average_price_range: '₱25,000 - ₱65,000',
    popular_features: ['Professional DJ', 'Sound System', 'LED Lighting', 'MC Services'],
    requires_portfolio: false,
    verification_required: false
  },
  {
    id: 'planning',
    name: 'Wedding Planning',
    icon: '📋',
    description: 'Full-service wedding planning',
    average_price_range: '₱75,000 - ₱200,000',
    popular_features: ['Full Planning', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination'],
    requires_portfolio: true,
    verification_required: true
  },
  {
    id: 'makeup',
    name: 'Makeup & Hair',
    icon: '💄',
    description: 'Bridal makeup and hair styling',
    average_price_range: '₱20,000 - ₱50,000',
    popular_features: ['Bridal Makeup', 'Hair Styling', 'Trial Session', 'Touch-up Kit'],
    requires_portfolio: true,
    verification_required: false
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚗',
    description: 'Wedding transportation services',
    average_price_range: '₱15,000 - ₱35,000',
    popular_features: ['Luxury Vehicles', 'Professional Chauffeur', 'Wedding Decoration', 'Multiple Cars'],
    requires_portfolio: false,
    verification_required: true
  },
  {
    id: 'officiant',
    name: 'Officiant',
    icon: '⛪',
    description: 'Wedding ceremony officiants',
    average_price_range: '₱15,000 - ₱30,000',
    popular_features: ['Traditional Ceremonies', 'Custom Vows', 'Interfaith Services', 'Legal Documentation'],
    requires_portfolio: false,
    verification_required: true
  }
];

export class CentralizedServiceManager {
  private apiUrl: string;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  // Service Operations
  async getAllServices(options?: {
    category?: string;
    location?: string;
    priceRange?: string;
    rating?: number;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ services: Service[]; total: number; success: boolean }> {
    const cacheKey = `services_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      console.log('🔄 [ServiceManager] Fetching REAL services from database with options:', options);
      
      // Direct API call to get real services - try multiple endpoints
      const endpoints = [
        '/api/services',
        '/api/services/simple', 
        '/api/services/direct'
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`📡 [ServiceManager] Trying ${endpoint}...`);
          const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`📊 [ServiceManager] Response from ${endpoint}:`, data);

            if (data.success && data.services && Array.isArray(data.services)) {
              console.log(`✅ [ServiceManager] Found ${data.services.length} real services from ${endpoint}`);
              
              // Map database services to frontend format
              const mappedServices = data.services.map((service: any) => 
                this.mapDatabaseServiceToFrontend(service)
              );

              const result = {
                services: mappedServices,
                total: mappedServices.length,
                success: true
              };

              // Cache result
              this.setCache(cacheKey, result);
              return result;
            }
          }
        } catch (endpointError) {
          console.warn(`❌ [ServiceManager] ${endpoint} failed:`, endpointError);
          continue;
        }
      }

      // No fallback - return empty result if no real services found
      console.warn('⚠️ [ServiceManager] No real services found from any endpoint');
      return {
        services: [],
        total: 0,
        success: false
      };

    } catch (error) {
      console.error('❌ [ServiceManager] Critical error fetching services:', error);
      
      // No fallback - return empty result on error
      return {
        services: [],
        total: 0,
        success: false
      };
    }
  }

  async getVendorServices(vendorId: string): Promise<{ services: Service[]; success: boolean }> {
    const cacheKey = `vendor_services_${vendorId}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Use ServiceAPI for data fetching
      const { serviceAPI } = await import('./ServiceAPI');
      const result = await serviceAPI.getVendorServices(vendorId);
      
      if (result.success) {
        const mappedResult = {
          services: result.services || [],
          success: true
        };
        
        this.setCache(cacheKey, mappedResult);
        return mappedResult;
      }

      return { services: [], success: false };
    } catch (error) {
      console.error('❌ [ServiceManager] Error fetching vendor services:', error);
      return { services: [], success: false };
    }
  }

  // Vendor Business Rules
  async checkVendorLimits(vendorId: string, vendorTier: VendorTier): Promise<ServiceLimits> {
    const { services } = await this.getVendorServices(vendorId);
    const limits = SERVICE_BUSINESS_RULES.VENDOR_LIMITS[vendorTier as keyof typeof SERVICE_BUSINESS_RULES.VENDOR_LIMITS];

    return {
      // Core limits
      max_services: limits.max_services,
      max_images_per_service: limits.max_images_per_service,
      max_categories: limits.max_categories,
      featured_services: limits.featured_services,
      premium_features: limits.premium_features,
      analytics_access: limits.analytics_access,
      // Current usage
      current_services: services.length,
      can_add_service: limits.max_services === -1 || services.length < limits.max_services,
      current_categories: new Set(services.map(s => s.category)).size,
      can_add_category: limits.max_categories === -1 || new Set(services.map(s => s.category)).size < limits.max_categories,
      featured_services_used: services.filter(s => s.featured).length,
      max_featured_services: limits.featured_services,
      can_feature_service: services.filter(s => s.featured).length < limits.featured_services,
      has_premium_features: limits.premium_features,
      has_analytics_access: limits.analytics_access
    };
  }

  // Service Validation
  validateService(service: Partial<Service>, vendorTier: VendorTier): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = SERVICE_BUSINESS_RULES.VALIDATION_RULES;

    // Title validation
    if (!service.title || service.title.length < rules.title.min_length) {
      errors.push(`Title must be at least ${rules.title.min_length} characters`);
    }
    if (service.title && service.title.length > rules.title.max_length) {
      errors.push(`Title must not exceed ${rules.title.max_length} characters`);
    }
    if (service.title && !rules.title.pattern.test(service.title)) {
      errors.push('Title contains invalid characters');
    }

    // Description validation
    if (!service.description || service.description.length < rules.description.min_length) {
      errors.push(`Description must be at least ${rules.description.min_length} characters`);
    }
    if (service.description && service.description.length > rules.description.max_length) {
      errors.push(`Description must not exceed ${rules.description.max_length} characters`);
    }

    // Price validation
    if (service.price) {
      if (service.price < rules.price.min_value) {
        errors.push(`Price must be at least ₱${rules.price.min_value.toLocaleString()}`);
      }
      if (service.price > rules.price.max_value) {
        errors.push(`Price must not exceed ₱${rules.price.max_value.toLocaleString()}`);
      }
    }

    // Images validation
    const imageLimit = rules.images.max_count_per_tier?.[vendorTier as keyof typeof rules.images.max_count_per_tier];
    if (service.images && imageLimit && service.images.length > imageLimit) {
      errors.push(`Your ${vendorTier} plan allows maximum ${imageLimit} images per service`);
    }

    // Category restrictions
    if (service.category) {
      const categoryRules = SERVICE_BUSINESS_RULES.CATEGORY_RULES;
      
      if (categoryRules.restricted_categories.includes(service.category)) {
        errors.push('This category is not allowed');
      }
      
      if (categoryRules.premium_only_categories.includes(service.category) && vendorTier === 'BASIC') {
        errors.push('This category requires Professional or Premium plan');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Service CRUD Operations
  async createService(vendorId: string, serviceData: Partial<Service>, vendorTier: VendorTier): Promise<{ success: boolean; service?: Service; error?: string }> {
    // Check vendor limits
    const limits = await this.checkVendorLimits(vendorId, vendorTier);
    if (!limits.can_add_service) {
      return {
        success: false,
        error: `Your ${vendorTier} plan allows maximum ${limits.max_services} services. Upgrade to add more.`
      };
    }

    // Validate service data
    const validation = this.validateService(serviceData, vendorTier);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      // Use ServiceAPI for data operations
      const { serviceAPI } = await import('./ServiceAPI');
      const formData = {
        title: serviceData.title || serviceData.name || '',
        description: serviceData.description || '',
        category: serviceData.category || '',
        price: serviceData.price,
        location: serviceData.location || '',
        images: serviceData.images || [],
        features: serviceData.features || [],
        is_active: serviceData.is_active !== false,
        featured: serviceData.featured || false
      };

      // Add vendor ID to form data
      const result = await serviceAPI.createService({
        ...formData,
        vendor_id: vendorId
      } as any);
      
      if (result.success) {
        // Clear cache
        this.clearVendorCache(vendorId);
        
        return {
          success: true,
          service: result.service
        };
      }

      return {
        success: false,
        error: result.error || 'Failed to create service'
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error creating service:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  async updateService(serviceId: string, serviceData: Partial<Service>, vendorTier: VendorTier): Promise<{ success: boolean; service?: Service; error?: string }> {
    // Validate service data
    const validation = this.validateService(serviceData, vendorTier);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...serviceData,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Clear cache
        this.clearCache();
        
        return {
          success: true,
          service: this.mapDatabaseServiceToFrontend(data.service)
        };
      }

      return {
        success: false,
        error: 'Failed to update service'
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error updating service:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  async deleteService(serviceId: string, vendorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/api/services/${serviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Clear cache
        this.clearVendorCache(vendorId);
        
        return { success: true };
      }

      return {
        success: false,
        error: 'Failed to delete service'
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error deleting service:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  // Utility Methods
  private mapDatabaseServiceToFrontend(dbService: any): Service {
    const category = this.normalizeCategory(dbService.category);
    const categoryInfo = SERVICE_CATEGORIES.find(c => c.name === category);

    return {
      id: dbService.id,
      title: dbService.title || dbService.name || 'Professional Wedding Service',
      name: dbService.title || dbService.name || 'Professional Wedding Service',
      category: category,
      vendor_id: dbService.vendor_id,
      vendorId: dbService.vendor_id,
      vendorName: dbService.vendor_name || 'Wedding Professional',
      vendorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      description: dbService.description || `Professional ${category.toLowerCase()} service for your special day`,
      price: dbService.price,
      priceRange: dbService.price ? `₱${parseFloat(dbService.price).toLocaleString()}` : categoryInfo?.average_price_range || 'Contact for pricing',
      location: dbService.location || 'Metro Manila, Philippines',
      rating: dbService.rating || (4.5 + Math.random() * 0.4),
      reviewCount: dbService.review_count || Math.floor(Math.random() * 100) + 20,
      image: dbService.images?.[0] || this.getCategoryImage(category),
      images: dbService.images || [this.getCategoryImage(category)],
      gallery: dbService.images || [this.getCategoryImage(category)],
      features: dbService.features || categoryInfo?.popular_features || ['Professional Service', 'Quality Guaranteed'],
      is_active: dbService.is_active !== false,
      availability: dbService.is_active !== false,
      featured: dbService.featured || false,
      created_at: dbService.created_at || new Date().toISOString(),
      updated_at: dbService.updated_at || new Date().toISOString(),
      contactInfo: {
        phone: dbService.contact_phone || '+63917-XXX-XXXX',
        email: dbService.contact_email || 'info@vendor.ph',
        website: dbService.contact_website || 'https://vendor.ph'
      }
    };
  }

  private normalizeCategory(category: string): string {
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

    return categoryMap[category] || category || 'Wedding Services';
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

  // Removed fallback services - working with real database data only

  // Cache Management
  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  private clearVendorCache(vendorId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(`vendor_services_${vendorId}`) || key.includes('services_')
    );
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  // Analytics and Reporting
  async getServiceAnalytics(vendorId: string): Promise<{
    total_services: number;
    active_services: number;
    featured_services: number;
    categories_used: string[];
    avg_rating: number;
    total_reviews: number;
    monthly_views: number;
    monthly_inquiries: number;
  }> {
    const { services } = await this.getVendorServices(vendorId);
    
    return {
      total_services: services.length,
      active_services: services.filter(s => s.is_active).length,
      featured_services: services.filter(s => s.featured).length,
      categories_used: Array.from(new Set(services.map(s => s.category))),
      avg_rating: services.length > 0 ? services.reduce((sum, s) => sum + s.rating, 0) / services.length : 0,
      total_reviews: services.reduce((sum, s) => sum + s.reviewCount, 0),
      monthly_views: Math.floor(Math.random() * 1000) + 100, // Mock data
      monthly_inquiries: Math.floor(Math.random() * 50) + 5 // Mock data
    };
  }

  // Platform Administration
  async getPlatformServiceStats(): Promise<{
    total_services: number;
    active_services: number;
    services_by_category: { [category: string]: number };
    avg_service_rating: number;
    total_vendors_with_services: number;
  }> {
    const { services } = await this.getAllServices();
    
    const servicesByCategory: { [category: string]: number } = {};
    services.forEach(service => {
      servicesByCategory[service.category] = (servicesByCategory[service.category] || 0) + 1;
    });

    return {
      total_services: services.length,
      active_services: services.filter(s => s.is_active).length,
      services_by_category: servicesByCategory,
      avg_service_rating: services.length > 0 ? services.reduce((sum, s) => sum + s.rating, 0) / services.length : 0,
      total_vendors_with_services: new Set(services.map(s => s.vendor_id)).size
    };
  }
}

// Export singleton instance
export const serviceManager = new CentralizedServiceManager();
