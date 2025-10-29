// Frontend API service for services
export interface ApiService {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  image: string;
  description: string;
  features: string[];
  availability: boolean;
  vendorName: string;
  vendorImage?: string;
  vendorId: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface ServiceSearchParams {
  query?: string;
  category?: string;
  location?: string;
  priceRange?: string;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ServicesResponse {
  services: ApiService[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export class ServicesApiService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

  static async getServices(params: ServiceSearchParams = {}): Promise<ServicesResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      // Add non-empty parameters to the search
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const url = `${this.baseUrl}/api/services?${searchParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ServicesApiService: Error response:', errorText);
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ServicesApiService.getServices error:', error);
      throw error;
    }
  }

  static async getServiceById(id: string): Promise<ApiService | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch service: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      return data.service;
    } catch (error) {
      console.error('ServicesApiService.getServiceById error:', error);
      throw error;
    }
  }

  static async searchServices(query: string): Promise<ServicesResponse> {
    return this.getServices({ query });
  }

  static async getServicesByCategory(category: string): Promise<ServicesResponse> {
    return this.getServices({ category });
  }

  static async getServicesByVendor(vendorId: string): Promise<ApiService[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/services/vendor/${vendorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📡 [ServicesApiService] Error response:', errorText);
        throw new Error(`Failed to fetch vendor services: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      // The backend returns services directly, not wrapped in a services property
      return Array.isArray(data) ? data : (data.services || []);
    } catch (error) {
      console.error('ServicesApiService.getServicesByVendor error:', error);
      throw error;
    }
  }
}
