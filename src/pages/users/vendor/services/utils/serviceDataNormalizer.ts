/**
 * 🔄 Service Data Normalizer
 * 
 * Handles data transformation and normalization for services
 */

import type { Service } from '../services/vendorServicesAPI';

/**
 * Normalize service data from API response
 * Handles both old and new field naming conventions
 */
export function normalizeServiceData(service: Record<string, unknown>): Service {
  // Use type assertion for simplicity - we trust the API response structure
  const svc = service as Service & Record<string, unknown>;
  
  return {
    // Core identifiers
    id: svc.id,
    vendorId: svc.vendorId || svc.vendor_id,
    vendor_id: (svc.vendor_id || svc.vendorId) as string,
    
    // Basic info - handle both naming conventions
    title: svc.title || svc.name,
    name: (svc.name || svc.title) as string,
    description: svc.description || '',
    category: svc.category || '',
    
    // Pricing
    price: svc.price,
    price_range: svc.price_range || (svc as Record<string, unknown>).priceRange as string | undefined,
    
    // Location
    location: svc.location,
    location_coordinates: svc.location_coordinates,
    location_details: svc.location_details,
    
    // Media
    images: svc.images || svc.gallery || [],
    imageUrl: svc.imageUrl || (svc as Record<string, unknown>).image_url as string | null | undefined || svc.images?.[0] || null,
    gallery: svc.gallery || svc.images || [],
    
    // Status flags - handle both naming conventions
    isActive: svc.isActive ?? svc.is_active ?? true,
    is_active: svc.is_active ?? svc.isActive ?? true,
    featured: svc.featured || false,
    
    // Vendor info
    vendor_name: svc.vendor_name || (svc as Record<string, unknown>).vendorName as string | undefined,
    vendor_business_name: svc.vendor_business_name || (svc as Record<string, unknown>).vendorBusinessName as string | undefined,
    
    // Rating/Reviews
    rating: svc.rating || 0,
    reviewCount: svc.reviewCount || svc.review_count || 0,
    review_count: svc.review_count || svc.reviewCount || 0,
    
    // Features
    features: svc.features || [],
    tags: svc.tags || [],
    keywords: svc.keywords || '',
    
    // Contact
    contact_info: svc.contact_info,
    
    // DSS Fields
    years_in_business: svc.years_in_business,
    service_tier: svc.service_tier,
    wedding_styles: svc.wedding_styles || [],
    cultural_specialties: svc.cultural_specialties || [],
    availability: svc.availability,
    
    // Timestamps
    created_at: svc.created_at,
    updated_at: svc.updated_at
  };
}

/**
 * Normalize an array of services
 */
export function normalizeServices(services: Record<string, unknown>[]): Service[] {
  return services.map(normalizeServiceData);
}

/**
 * Get display price for a service
 */
export function getDisplayPrice(service: Service): string {
  if (service.price_range) {
    return service.price_range;
  }
  
  if (service.price) {
    const numPrice = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
    return `₱${numPrice.toLocaleString()}`;
  }
  
  return 'Price on request';
}

/**
 * Get display image URL for a service
 */
export function getDisplayImage(service: Service): string {
  // Priority order: imageUrl, first image in array, default
  if (service.imageUrl) {
    return service.imageUrl;
  }
  
  if (service.images && service.images.length > 0) {
    return service.images[0];
  }
  
  if (service.gallery && service.gallery.length > 0) {
    return service.gallery[0];
  }
  
  // Default placeholder based on category
  return getDefaultPlaceholder(service.category);
}

/**
 * Get default placeholder image for a service category
 */
function getDefaultPlaceholder(category: string): string {
  const placeholders: Record<string, string> = {
    'Photography': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    'Venue': 'https://images.unsplash.com/photo-1519167758481-83f29da8c763?w=400',
    'Music': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    'Florist': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    'Planning': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
    'Beauty': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400',
    'Cake': 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400',
    'default': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400'
  };
  
  return placeholders[category] || placeholders.default;
}

/**
 * Prepare service data for API submission
 */
export function prepareServiceForSubmission(serviceData: Partial<Service>, vendorId: string): Record<string, unknown> {
  return {
    ...serviceData,
    vendor_id: vendorId,
    // Ensure consistent field names for API
    is_active: serviceData.isActive ?? serviceData.is_active ?? true,
    images: serviceData.images || serviceData.gallery || [],
  };
}

/**
 * Validate service data before submission
 */
export function validateServiceData(serviceData: Partial<Service>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!serviceData.name || serviceData.name.trim().length === 0) {
    errors.push('Service name is required');
  }
  
  if (!serviceData.category) {
    errors.push('Service category is required');
  }
  
  if (!serviceData.description || serviceData.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
