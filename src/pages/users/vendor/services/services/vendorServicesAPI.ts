/**
 * 📡 Vendor Services API Service
 * 
 * Centralized API calls for vendor services management
 */

const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface Service {
  // Core identifiers
  id: string;
  vendorId?: string;
  vendor_id: string;
  
  // Basic info
  title?: string;
  name: string;
  description: string;
  category: string;
  
  // Pricing
  price?: number | string;
  price_range?: string;
  
  // Location
  location?: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  location_details?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  
  // Media
  images?: string[];
  imageUrl?: string | null;
  gallery?: string[];
  
  // Status flags
  isActive?: boolean;
  is_active: boolean;
  featured: boolean;
  
  // Vendor info
  vendor_name?: string;
  vendor_business_name?: string;
  
  // Rating/Reviews
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  
  // Features
  features?: string[];
  tags?: string[];
  keywords?: string;
  
  // Contact
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // DSS Fields
  years_in_business?: number;
  service_tier?: 'premium' | 'standard' | 'basic';
  wedding_styles?: string[];
  cultural_specialties?: string[];
  availability?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Fetch all services for a vendor
 */
export async function fetchVendorServices(vendorId: string): Promise<Service[]> {
  try {
    console.log('🔍 [vendorServicesAPI] Fetching services for vendor:', vendorId);
    console.log('🔍 [vendorServicesAPI] API URL:', `${apiUrl}/api/services/vendor/${vendorId}`);
    
    const response = await fetch(`${apiUrl}/api/services/vendor/${vendorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ [vendorServicesAPI] API error:', response.status);
      return [];
    }

    const result = await response.json();
    console.log('✅ [vendorServicesAPI] API response:', result);
    
    if (result.success && Array.isArray(result.services)) {
      console.log('✅ [vendorServicesAPI] Services loaded:', result.services.length);
      return result.services;
    }
    
    console.warn('⚠️ [vendorServicesAPI] No services in response');
    return [];
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ [vendorServicesAPI] Error fetching services:', errorMessage);
    return [];
  }
}

/**
 * Create a new service
 */
export async function createService(serviceData: Partial<Service>, vendorId: string): Promise<ApiResponse<Service>> {
  try {
    const payload = {
      ...serviceData,
      vendor_id: vendorId,
    };

    const response = await fetch(`${apiUrl}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [vendorServicesAPI] Failed to parse response:', parseError);
      return {
        success: false,
        error: `Invalid JSON response: ${responseText}`
      };
    }

    if (!response.ok) {
      console.error('❌ [vendorServicesAPI] API Error:', result);
      return {
        success: false,
        error: result.error || result.message || 'Failed to create service'
      };
    }

    return {
      success: true,
      data: result.service,
      message: 'Service created successfully'
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create service';
    console.error('❌ [vendorServicesAPI] Error creating service:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Update an existing service
 */
export async function updateService(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
  try {
    const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });

    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ [vendorServicesAPI] Failed to parse response:', parseError);
      return {
        success: false,
        error: `Invalid JSON response: ${responseText}`
      };
    }

    if (!response.ok) {
      console.error('❌ [vendorServicesAPI] API Error:', result);
      return {
        success: false,
        error: result.error || result.message || 'Failed to update service'
      };
    }

    return {
      success: true,
      data: result.service,
      message: 'Service updated successfully'
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update service';
    console.error('❌ [vendorServicesAPI] Error updating service:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Delete a service
 */
export async function deleteService(serviceId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Failed to delete service'
      };
    }

    return {
      success: true,
      message: 'Service deleted successfully'
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete service';
    console.error('❌ [vendorServicesAPI] Error deleting service:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Toggle service active status
 */
export async function toggleServiceStatus(serviceId: string, isActive: boolean): Promise<ApiResponse<Service>> {
  try {
    const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Failed to toggle service status'
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.service,
      message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to toggle service status';
    console.error('❌ [vendorServicesAPI] Error toggling status:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}
