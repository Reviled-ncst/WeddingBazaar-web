// ============================================================================
// Wedding Bazaar - Shared Type Definitions
// ============================================================================
// This file exports comprehensive types for the entire platform
// Main types are imported from comprehensive-booking.types.ts
// ============================================================================

// Import comprehensive booking system types
export * from './comprehensive-booking.types';

// ============================================================================
// LEGACY TYPES (for backward compatibility during migration)
// ============================================================================

// Legacy User interface (kept for backward compatibility)
export interface LegacyUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'couple' | 'vendor' | 'admin';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy service category type (use ServiceCategory from comprehensive types instead)
export type LegacyVendorCategory = 
  | 'venue'
  | 'photography'
  | 'catering'
  | 'florals'
  | 'entertainment'
  | 'transportation'
  | 'planning'
  | 'makeup'
  | 'dress'
  | 'videography'
  | 'decorations'
  | 'jewelry';

// ============================================================================
// UTILITY TYPES
// ============================================================================

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Pagination interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Search parameters
export interface SearchParams {
  query?: string;
  category?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: string[];
  sortBy?: 'rating' | 'price' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: import('./comprehensive-booking.types').Message;
  updatedAt: Date;
}
