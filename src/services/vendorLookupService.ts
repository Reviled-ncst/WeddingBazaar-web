/**
 * Vendor Lookup Service
 * Provides vendor information for bookings and other components
 */

interface VendorInfo {
  id: string;
  name: string;
  category: string;
  rating: string;
  location: string;
}

interface VendorLookupCache {
  [vendorId: string]: VendorInfo;
}

class VendorLookupService {
  private cache: VendorLookupCache = {};
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  /**
   * Get vendor information by ID
   */
  async getVendorInfo(vendorId: string): Promise<VendorInfo | null> {
    // Check cache first
    if (this.cache[vendorId]) {
      return this.cache[vendorId];
    }

    try {
      // Try to get from featured vendors first (faster)
      const featuredResponse = await fetch(`${this.apiUrl}/api/vendors/featured`);
      
      if (featuredResponse.ok) {
        const data = await featuredResponse.json();
        
        if (data.vendors && Array.isArray(data.vendors)) {
          // Cache all vendors from response
          data.vendors.forEach((vendor: any) => {
            this.cache[vendor.id] = {
              id: vendor.id,
              name: vendor.name,
              category: vendor.category,
              rating: vendor.rating,
              location: vendor.location
            };
          });

          // Return the requested vendor if found
          if (this.cache[vendorId]) {
            return this.cache[vendorId];
          }
        }
      }

      // If not found in featured vendors, try individual vendor lookup
      // (This endpoint might not exist yet, but we'll try)
      try {
        const individualResponse = await fetch(`${this.apiUrl}/api/vendors/${vendorId}`);
        if (individualResponse.ok) {
          const vendorData = await individualResponse.json();
          const vendorInfo: VendorInfo = {
            id: vendorData.id,
            name: vendorData.name || vendorData.business_name,
            category: vendorData.category || vendorData.business_type,
            rating: vendorData.rating || '0',
            location: vendorData.location || 'Unknown Location'
          };
          
          // Cache it
          this.cache[vendorId] = vendorInfo;
          return vendorInfo;
        }
      } catch (individualError) {
        console.log('Individual vendor lookup not available:', individualError);
      }

      return null;
    } catch (error) {
      console.error('Error looking up vendor:', error);
      return null;
    }
  }

  /**
   * Get vendor name by ID (convenience method)
   */
  async getVendorName(vendorId: string): Promise<string> {
    const vendorInfo = await this.getVendorInfo(vendorId);
    return vendorInfo?.name || `Vendor ${vendorId}`;
  }

  /**
   * Preload all vendors into cache
   */
  async preloadVendors(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/vendors/featured`);
      if (response.ok) {
        const data = await response.json();
        if (data.vendors && Array.isArray(data.vendors)) {
          data.vendors.forEach((vendor: any) => {
            this.cache[vendor.id] = {
              id: vendor.id,
              name: vendor.name,
              category: vendor.category,
              rating: vendor.rating,
              location: vendor.location
            };
          });
          // console.log('✅ Preloaded', data.vendors.length, 'vendors into cache');
        }
      }
    } catch (error) {
      console.error('Error preloading vendors:', error);
    }
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache = {};
  }
}

// Export singleton instance
export const vendorLookupService = new VendorLookupService();
export default vendorLookupService;
