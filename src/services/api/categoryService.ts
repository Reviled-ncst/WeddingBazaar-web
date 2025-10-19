/**
 * Category Service
 * Handles dynamic category and field data from the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============ INTERFACES ============

export interface Category {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  sort_order: number;
}

export interface CategoryField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'checkbox';
  is_required: boolean;
  help_text?: string;
  sort_order: number;
  options: FieldOption[];
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  sort_order: number;
}

interface CategoriesResponse {
  success: boolean;
  total?: number;  // Backend returns 'total', not 'count'
  categories?: Category[];  // Make optional for safety
}

interface FieldsResponse {
  success: boolean;
  total?: number;
  fields?: CategoryField[];
  categoryName?: string;
}

// ============ API FUNCTIONS ============

/**
 * Fetch all categories with their subcategories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    console.log('📂 Fetching categories from:', `${API_URL}/api/categories`);
    
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data: CategoriesResponse = await response.json();
    
    console.log('🔍 Raw API response:', data);
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    if (!data.categories || !Array.isArray(data.categories)) {
      console.error('❌ Invalid categories data:', data);
      throw new Error('Invalid categories response format');
    }

    console.log(`✅ Fetched ${data.categories.length} categories`);
    return data.categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch dynamic fields for a specific category by ID
 */
export async function fetchCategoryFieldsById(categoryId: string): Promise<CategoryField[]> {
  try {
    console.log('📋 Fetching fields for category ID:', categoryId);
    
    const response = await fetch(`${API_URL}/api/categories/${categoryId}/fields`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category fields: ${response.statusText}`);
    }

    const data: FieldsResponse = await response.json();
    
    console.log('🔍 Raw fields API response:', data);
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    if (!data.fields || !Array.isArray(data.fields)) {
      console.warn('⚠️ No fields found for category:', categoryId);
      return [];
    }

    console.log(`✅ Fetched ${data.fields.length} fields for category ${categoryId}`);
    return data.fields;
  } catch (error) {
    console.error('❌ Error fetching category fields:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Fetch dynamic fields for a specific category by name
 * This is useful when you have the category name but not the ID
 */
export async function fetchCategoryFieldsByName(categoryName: string): Promise<CategoryField[]> {
  try {
    console.log('📋 Fetching fields for category name:', categoryName);
    
    const response = await fetch(`${API_URL}/api/categories/by-name/${encodeURIComponent(categoryName)}/fields`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category fields: ${response.statusText}`);
    }

    const data: FieldsResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    console.log(`✅ Fetched ${data.count} fields for category ${categoryName}`);
    return data.fields;
  } catch (error) {
    console.error('❌ Error fetching category fields by name:', error);
    throw error;
  }
}

/**
 * Get a specific category by ID from the categories list
 */
export function getCategoryById(categories: Category[], categoryId: string): Category | undefined {
  return categories.find(cat => cat.id === categoryId);
}

/**
 * Get a specific category by name from the categories list
 */
export function getCategoryByName(categories: Category[], categoryName: string): Category | undefined {
  return categories.find(cat => cat.name === categoryName);
}

/**
 * Get subcategories for a specific category
 */
export function getSubcategoriesForCategory(categories: Category[], categoryId: string): Subcategory[] {
  const category = getCategoryById(categories, categoryId);
  return category?.subcategories || [];
}

/**
 * Format category name for display (converts snake_case to Title Case)
 */
export function formatCategoryName(name: string): string {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get all category names as options for a dropdown
 */
export function getCategoryOptions(categories: Category[]): Array<{ value: string; label: string }> {
  return categories.map(cat => ({
    value: cat.name,
    label: cat.display_name || formatCategoryName(cat.name)
  }));
}

/**
 * Get subcategory options for a specific category
 */
export function getSubcategoryOptions(categories: Category[], categoryName: string): Array<{ value: string; label: string }> {
  const category = getCategoryByName(categories, categoryName);
  if (!category) return [];
  
  return category.subcategories.map(sub => ({
    value: sub.name,
    label: sub.display_name || formatCategoryName(sub.name)
  }));
}

// ============ EXPORTS ============
export const categoryService = {
  fetchCategories,
  fetchCategoryFieldsById,
  fetchCategoryFieldsByName,
  getCategoryById,
  getCategoryByName,
  getSubcategoriesForCategory,
  formatCategoryName,
  getCategoryOptions,
  getSubcategoryOptions,
};

export default categoryService;
