// Centralized Service Management System with Vendor Rules
import { ServiceRules, VendorTier, ServicePermissions } from './ServiceRules';
import { ServiceAPI } from './ServiceAPI';

export interface CentralizedService {
  // Core database fields
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  images?: string[];
  featured?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  
  // Extended fields for UI
  vendor_name?: string;
  vendor_business_type?: string;
  vendor_location?: string;
  vendor_verified?: boolean;
  vendor_subscription_tier?: VendorTier;
  location?: string;
  rating?: number;
  review_count?: number;
  price_range?: string;
  availability?: boolean;
  gallery?: string[];
  features?: string[];
  tags?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Computed permission fields
  can_edit?: boolean;
  can_delete?: boolean;
  can_feature?: boolean;
  can_publish?: boolean;
  status_message?: string;
  rules_violations?: string[];
}

export interface ServiceFilters {
  category?: string;
  location?: string;
  priceRange?: string;
  rating?: number;
  search?: string;
  vendorId?: string;
  featured?: boolean;
  status?: 'all' | 'active' | 'inactive' | 'pending';
  subscription_tier?: VendorTier;
}

export interface ServiceOperationResult {
  success: boolean;
  service?: CentralizedService;
  error?: string;
  warnings?: string[];
  rules_applied?: string[];
}

export class ServiceManager {
  private serviceAPI: ServiceAPI;
  private serviceRules: ServiceRules;

  constructor() {
    this.serviceAPI = new ServiceAPI();
    this.serviceRules = new ServiceRules();
  }

  /**
   * Get all services with filters (for individual users browsing)
   */
  async getPublicServices(filters: ServiceFilters = {}): Promise<{
    services: CentralizedService[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log('🔍 [ServiceManager] Getting public services with filters:', filters);
      
      // Only show active, approved services to public
      const publicFilters = {
        ...filters,
        status: 'active' as const
      };

      const result = await this.serviceAPI.getServices(publicFilters);
      
      // Enrich services with computed fields for public viewing
      const enrichedServices = result.services.map(service => 
        this.enrichServiceForPublic(service)
      );

      return {
        ...result,
        services: enrichedServices
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error getting public services:', error);
      
      // Return fallback services for reliability
      return this.getFallbackServices(filters);
    }
  }

  /**
   * Get services for vendor management (with full permissions)
   */
  async getVendorServices(
    vendorId: string, 
    subscriptionTier: VendorTier = 'basic'
  ): Promise<CentralizedService[]> {
    try {
      console.log(`🏪 [ServiceManager] Getting services for vendor: ${vendorId} (${subscriptionTier})`);
      
      const result = await this.serviceAPI.getVendorServices(vendorId);
      
      // Enrich services with vendor permissions and rules
      return result.map(service => 
        this.enrichServiceForVendor(service, vendorId, subscriptionTier)
      );
    } catch (error) {
      console.error('❌ [ServiceManager] Error getting vendor services:', error);
      return [];
    }
  }

  /**
   * Create new service with rule validation
   */
  async createService(
    serviceData: Partial<CentralizedService>,
    vendorId: string,
    subscriptionTier: VendorTier = 'basic'
  ): Promise<ServiceOperationResult> {
    try {
      console.log('➕ [ServiceManager] Creating service for vendor:', vendorId);
      
      // Validate business rules before creation
      const validationResult = await this.validateServiceCreation(vendorId, subscriptionTier);
      if (!validationResult.success) {
        return validationResult;
      }

      // Apply tier-specific rules to service data
      const processedData = this.applyTierRules(serviceData, subscriptionTier);
      
      // Create service via API
      const service = await this.serviceAPI.createService({
        ...processedData,
        vendor_id: vendorId
      });

      // Enrich created service
      const enrichedService = this.enrichServiceForVendor(service, vendorId, subscriptionTier);

      return {
        success: true,
        service: enrichedService,
        rules_applied: this.getAppliedRules(subscriptionTier)
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error creating service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create service'
      };
    }
  }

  /**
   * Update service with permission and rule checks
   */
  async updateService(
    serviceId: string,
    serviceData: Partial<CentralizedService>,
    vendorId: string,
    subscriptionTier: VendorTier = 'basic'
  ): Promise<ServiceOperationResult> {
    try {
      console.log('✏️ [ServiceManager] Updating service:', serviceId);
      
      // Validate permissions
      const permissionCheck = await this.validateServiceUpdate(serviceId, vendorId, subscriptionTier);
      if (!permissionCheck.success) {
        return permissionCheck;
      }

      // Apply tier-specific rules
      const processedData = this.applyTierRules(serviceData, subscriptionTier);
      
      // Update via API
      const service = await this.serviceAPI.updateService(serviceId, processedData);
      
      // Enrich updated service
      const enrichedService = this.enrichServiceForVendor(service, vendorId, subscriptionTier);

      return {
        success: true,
        service: enrichedService,
        rules_applied: this.getAppliedRules(subscriptionTier)
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error updating service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update service'
      };
    }
  }

  /**
   * Delete service with permission checks
   */
  async deleteService(
    serviceId: string,
    vendorId: string,
    subscriptionTier: VendorTier = 'basic'
  ): Promise<ServiceOperationResult> {
    try {
      console.log('🗑️ [ServiceManager] Deleting service:', serviceId);
      
      // Validate permissions
      const permissionCheck = await this.validateServiceDelete(serviceId, vendorId);
      if (!permissionCheck.success) {
        return permissionCheck;
      }

      // Delete via API
      const success = await this.serviceAPI.deleteService(serviceId, vendorId);
      
      return {
        success,
        error: success ? undefined : 'Failed to delete service'
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error deleting service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete service'
      };
    }
  }

  /**
   * Toggle service featured status (premium feature)
   */
  async toggleServiceFeature(
    serviceId: string,
    vendorId: string,
    subscriptionTier: VendorTier
  ): Promise<ServiceOperationResult> {
    try {
      console.log('⭐ [ServiceManager] Toggling feature status for service:', serviceId);
      
      // Check if vendor can feature services
      const canFeature = this.serviceRules.canFeatureServices(subscriptionTier);
      if (!canFeature) {
        return {
          success: false,
          error: 'Your subscription tier does not support featured services. Please upgrade to Premium or higher.'
        };
      }

      // Check featured service limits
      const currentServices = await this.getVendorServices(vendorId, subscriptionTier);
      const currentFeatured = currentServices.filter(s => s.featured).length;
      const limit = this.serviceRules.getFeaturedServiceLimit(subscriptionTier);
      
      if (limit !== -1 && currentFeatured >= limit) {
        return {
          success: false,
          error: `You have reached your featured service limit (${limit}). Upgrade your plan to feature more services.`
        };
      }

      // Toggle feature status via API
      const service = await this.serviceAPI.toggleServiceFeature(serviceId, vendorId);
      
      // Enrich service
      const enrichedService = this.enrichServiceForVendor(service, vendorId, subscriptionTier);

      return {
        success: true,
        service: enrichedService
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error toggling service feature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle feature status'
      };
    }
  }

  /**
   * Get service categories
   */
  getServiceCategories(): string[] {
    return [
      'Photography',
      'Videography',
      'Wedding Planning',
      'Catering',
      'Venues',
      'Flowers',
      'Music & DJ',
      'Makeup & Hair',
      'Transportation',
      'Officiant',
      'Cake & Desserts',
      'Decorations',
      'Stationery',
      'Entertainment',
      'Security'
    ];
  }

  /**
   * Get business rules for a subscription tier
   */
  getRulesForTier(subscriptionTier: VendorTier) {
    return this.serviceRules.getTierLimits(subscriptionTier);
  }

  /**
   * Get vendor service statistics
   */
  async getVendorStats(vendorId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    featured: number;
    categories: number;
    avgRating: number;
  }> {
    try {
      const services = await this.getVendorServices(vendorId);
      
      return {
        total: services.length,
        active: services.filter(s => s.is_active).length,
        inactive: services.filter(s => !s.is_active).length,
        featured: services.filter(s => s.featured).length,
        categories: new Set(services.map(s => s.category)).size,
        avgRating: services.length > 0 
          ? services.reduce((acc, s) => acc + (s.rating || 4.5), 0) / services.length 
          : 4.5
      };
    } catch (error) {
      console.error('❌ [ServiceManager] Error getting vendor stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        featured: 0,
        categories: 0,
        avgRating: 4.5
      };
    }
  }

  // Private helper methods
  private enrichServiceForPublic(service: any): CentralizedService {
    return {
      ...service,
      // Add computed fields for public viewing
      availability: service.is_active && service.vendor_verified,
      gallery: service.images || [],
      features: this.generateFeatures(service.category),
      contact_info: {
        phone: '+63917-123-4567', // Generic contact for public
        email: 'info@weddingservice.ph',
        website: 'https://weddingservice.ph'
      },
      // No management permissions for public
      can_edit: false,
      can_delete: false,
      can_feature: false,
      can_publish: false,
      status_message: service.is_active ? 'Available' : 'Unavailable'
    };
  }

  private enrichServiceForVendor(
    service: any, 
    vendorId: string, 
    subscriptionTier: VendorTier
  ): CentralizedService {
    const isOwner = service.vendor_id === vendorId;
    const permissions = this.serviceRules.getServicePermissions(subscriptionTier, isOwner);

    return {
      ...service,
      // Add vendor management permissions
      can_edit: permissions.canEdit,
      can_delete: permissions.canDelete,
      can_feature: permissions.canFeature,
      can_publish: permissions.canPublish,
      status_message: this.getStatusMessage(service, subscriptionTier),
      rules_violations: this.checkRulesViolations(service, subscriptionTier),
      // Ensure required fields
      gallery: service.images || [],
      features: service.features || this.generateFeatures(service.category),
      vendor_subscription_tier: subscriptionTier
    };
  }

  private async validateServiceCreation(
    vendorId: string, 
    subscriptionTier: VendorTier
  ): Promise<ServiceOperationResult> {
    const currentServices = await this.getVendorServices(vendorId, subscriptionTier);
    const maxServices = this.serviceRules.getMaxServices(subscriptionTier);
    
    if (maxServices !== -1 && currentServices.length >= maxServices) {
      return {
        success: false,
        error: `You have reached your service limit (${maxServices}). Upgrade your plan to add more services.`
      };
    }

    return { success: true };
  }

  private async validateServiceUpdate(
    serviceId: string, 
    vendorId: string, 
    subscriptionTier: VendorTier
  ): Promise<ServiceOperationResult> {
    const services = await this.getVendorServices(vendorId, subscriptionTier);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      return {
        success: false,
        error: 'Service not found or you do not have permission to edit it.'
      };
    }

    return { success: true };
  }

  private async validateServiceDelete(
    serviceId: string, 
    vendorId: string
  ): Promise<ServiceOperationResult> {
    const services = await this.getVendorServices(vendorId);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      return {
        success: false,
        error: 'Service not found or you do not have permission to delete it.'
      };
    }

    return { success: true };
  }

  private applyTierRules(
    serviceData: Partial<CentralizedService>, 
    subscriptionTier: VendorTier
  ): Partial<CentralizedService> {
    const rules = this.serviceRules.getTierLimits(subscriptionTier);
    
    // Apply image limits
    if (serviceData.images && rules.maxImagesPerService !== -1) {
      serviceData.images = serviceData.images.slice(0, rules.maxImagesPerService);
    }

    // Apply approval rules
    if (rules.requiresApproval) {
      serviceData.is_active = false; // Start as inactive, pending approval
    }

    return serviceData;
  }

  private getStatusMessage(service: any, subscriptionTier: VendorTier): string {
    if (!service.is_active) {
      if (this.serviceRules.requiresApproval(subscriptionTier)) {
        return 'Pending approval';
      }
      return 'Currently unavailable';
    }
    
    if (service.featured) {
      return 'Featured service';
    }
    
    return 'Available';
  }

  private checkRulesViolations(service: any, subscriptionTier: VendorTier): string[] {
    const violations: string[] = [];
    const rules = this.serviceRules.getTierLimits(subscriptionTier);
    
    // Check image limit violations
    if (service.images && rules.maxImagesPerService !== -1 && 
        service.images.length > rules.maxImagesPerService) {
      violations.push(`Too many images (${service.images.length}/${rules.maxImagesPerService})`);
    }

    return violations;
  }

  private generateFeatures(category: string): string[] {
    const categoryFeatures: Record<string, string[]> = {
      'Photography': ['Professional Photography', 'Digital Gallery', 'High Resolution', 'Editing Included'],
      'Videography': ['Cinematic Style', 'Professional Editing', 'Multiple Cameras', 'Highlight Reel'],
      'Wedding Planning': ['Full Planning', 'Vendor Coordination', 'Timeline Management', 'Day-of Coordination'],
      'Catering': ['Custom Menu', 'Professional Staff', 'Setup & Cleanup', 'Dietary Options'],
      'Venues': ['Event Space', 'Setup Service', 'Parking Available', 'Catering Kitchen'],
      'Flowers': ['Fresh Flowers', 'Custom Arrangements', 'Delivery & Setup', 'Seasonal Options'],
      'Music & DJ': ['Professional DJ', 'Sound System', 'Lighting', 'MC Services'],
      'Makeup & Hair': ['Professional Makeup', 'Hair Styling', 'Trial Session', 'Touch-up Kit'],
      'Transportation': ['Professional Driver', 'Luxury Vehicle', 'Wedding Decoration', 'On-time Service']
    };

    return categoryFeatures[category] || ['Professional Service', 'Quality Guaranteed', 'Experienced Team', 'Customer Satisfaction'];
  }

  private getAppliedRules(subscriptionTier: VendorTier): string[] {
    const rules = this.serviceRules.getTierLimits(subscriptionTier);
    const appliedRules: string[] = [];

    if (rules.maxImagesPerService !== -1) {
      appliedRules.push(`Image limit: ${rules.maxImagesPerService} per service`);
    }

    if (rules.requiresApproval) {
      appliedRules.push('Service requires approval before going live');
    }

    if (!rules.canFeature) {
      appliedRules.push('Featured services not available on this tier');
    }

    return appliedRules;
  }

  private async getFallbackServices(filters: ServiceFilters): Promise<{
    services: CentralizedService[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    console.log('🔄 [ServiceManager] Using fallback services');
    
    // Return comprehensive fallback services that match the real database structure
    const fallbackServices: CentralizedService[] = [
      {
        id: 'fallback-1',
        vendor_id: 'vendor-001',
        title: 'Professional Wedding Photography',
        description: 'Capture your special moments with professional wedding photography services.',
        category: 'Photography',
        price: 75000,
        images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600'],
        featured: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        vendor_name: 'Elite Photography Studios',
        vendor_business_type: 'Photography',
        vendor_location: 'Makati City',
        vendor_verified: true,
        vendor_subscription_tier: 'premium',
        location: 'Metro Manila',
        rating: 4.8,
        review_count: 127,
        price_range: '₱₱₱',
        availability: true,
        gallery: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600'],
        features: ['Professional Photography', 'Digital Gallery', 'High Resolution', 'Editing Included'],
        tags: ['professional', 'photography', 'wedding', 'portraits'],
        contact_info: {
          phone: '+63917-123-4567',
          email: 'info@elitephoto.ph',
          website: 'https://elitephoto.ph'
        },
        can_edit: false,
        can_delete: false,
        can_feature: false,
        can_publish: false,
        status_message: 'Featured service'
      },
      // Add more fallback services as needed...
    ];

    // Apply filters to fallback services
    let filtered = fallbackServices;
    
    if (filters.category) {
      filtered = filtered.filter(s => s.category === filters.category);
    }
    
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.vendor_name && s.vendor_name.toLowerCase().includes(query))
      );
    }

    return {
      services: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1
    };
  }
}

// Export singleton instance
export const serviceManager = new ServiceManager();
export default serviceManager;
