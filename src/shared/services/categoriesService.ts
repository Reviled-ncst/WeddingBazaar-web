// Service for fetching categories, features, and price ranges from the backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ServiceCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  sort_order?: number;
}

export interface ServiceFeature {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_common: boolean;
  sort_order?: number;
}

export interface PriceRange {
  id: string;
  value: string;
  label: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
}

class CategoriesService {
  /**
   * Fetch all active service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      console.log('📂 [CategoriesService] Fetching categories...');
      const response = await fetch(`${API_URL}/api/categories`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.categories) {
        console.log(`✅ [CategoriesService] Loaded ${data.categories.length} categories`);
        return data.categories;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ [CategoriesService] Error fetching categories:', error);
      // Return empty array instead of throwing to allow form to work with fallback data
      return [];
    }
  }

  /**
   * Fetch features for a specific category
   */
  async getFeaturesForCategory(categoryId: string): Promise<ServiceFeature[]> {
    try {
      console.log(`✨ [CategoriesService] Fetching features for category: ${categoryId}`);
      const response = await fetch(`${API_URL}/api/categories/${categoryId}/features`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.features) {
        console.log(`✅ [CategoriesService] Loaded ${data.features.length} features for ${categoryId}`);
        return data.features;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ [CategoriesService] Error fetching features:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Fetch all price ranges
   */
  async getPriceRanges(): Promise<PriceRange[]> {
    try {
      console.log('💰 [CategoriesService] Fetching price ranges...');
      const response = await fetch(`${API_URL}/api/price-ranges`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price ranges: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.priceRanges) {
        console.log(`✅ [CategoriesService] Loaded ${data.priceRanges.length} price ranges`);
        return data.priceRanges;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('❌ [CategoriesService] Error fetching price ranges:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}

export const categoriesService = new CategoriesService();
