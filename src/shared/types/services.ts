/**
 * Service-related TypeScript type definitions
 * Centralized types for the Wedding Bazaar service management system
 */

// Core Service Types
export interface Service {
  id: string;
  title: string;
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

// Service Categories
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  average_price_range: string;
  popular_features: string[];
  requires_portfolio: boolean;
  verification_required: boolean;
}

// Vendor Tiers
export type VendorTier = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM';

// Service Limits for Vendors
export interface ServiceLimits {
  current_services: number;
  max_services: number;
  can_add_service: boolean;
  current_categories: number;
  max_categories: number;
  can_add_category: boolean;
  featured_services_used: number;
  max_featured_services: number;
  can_feature_service: boolean;
  has_premium_features: boolean;
  has_analytics_access: boolean;
}

// Service Filters
export interface ServiceFilters {
  category?: string;
  location?: string;
  priceRange?: string;
  rating?: number;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

// Service Creation/Update Data
export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  price?: number;
  location: string;
  images: string[];
  features: string[];
  is_active: boolean;
  featured?: boolean;
}

// API Response Types
export interface ServiceResponse {
  success: boolean;
  service?: Service;
  services?: Service[];
  total?: number;
  error?: string;
  message?: string;
}

// Vendor Analytics
export interface ServiceAnalytics {
  total_services: number;
  active_services: number;
  featured_services: number;
  categories_used: string[];
  avg_rating: number;
  total_reviews: number;
  monthly_views: number;
  monthly_inquiries: number;
}

// Platform Analytics
export interface PlatformServiceStats {
  total_services: number;
  active_services: number;
  services_by_category: { [category: string]: number };
  avg_service_rating: number;
  total_vendors_with_services: number;
}

// Service Validation
export interface ServiceValidation {
  isValid: boolean;
  errors: string[];
}

// Business Rules Types
export interface VendorLimitConfig {
  max_services: number;
  max_images_per_service: number;
  max_categories: number;
  featured_services: number;
  premium_features: boolean;
  analytics_access: boolean;
}

export interface ValidationRule {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  required?: boolean;
  pattern?: RegExp;
  min_count?: number;
  max_count_per_tier?: { [key in VendorTier]: number };
  allowed_formats?: string[];
  max_file_size?: number;
}

// Database Service (raw from backend)
export interface DatabaseService {
  id: string;
  title?: string;
  name?: string;
  category: string;
  vendor_id: string;
  vendor_name?: string;
  description?: string;
  price?: string | number;
  location?: string;
  rating?: number;
  review_count?: number;
  images?: string[];
  features?: string[];
  is_active?: boolean;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
}

// Service Management Operations
export interface ServiceOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'FEATURE' | 'ACTIVATE' | 'DEACTIVATE';
  serviceId?: string;
  vendorId: string;
  data?: Partial<ServiceFormData>;
  timestamp: string;
}

// Service Search and Discovery
export interface ServiceSearchParams {
  query?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  features?: string[];
  available?: boolean;
  featured?: boolean;
  sortBy?: 'rating' | 'price' | 'reviews' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ServiceSearchResult {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
  filters: ServiceFilters;
  success: boolean;
}

// Booking and Service Interaction
export interface ServiceBookingInfo {
  serviceId: string;
  vendorId: string;
  serviceName: string;
  vendorName: string;
  basePrice?: number;
  availability: boolean;
  bookingRules: {
    advance_booking_days: number;
    cancellation_policy: string;
    deposit_required: boolean;
    deposit_percentage?: number;
  };
}

// Service Portfolio and Media
export interface ServicePortfolio {
  serviceId: string;
  images: {
    url: string;
    caption?: string;
    is_cover: boolean;
    order: number;
  }[];
  videos?: {
    url: string;
    thumbnail: string;
    caption?: string;
  }[];
  testimonials: {
    client_name: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }[];
}

// Service Pricing and Packages
export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  duration?: string;
  includes: string[];
  excludes?: string[];
  is_popular: boolean;
  is_active: boolean;
}

// Service Reviews and Ratings
export interface ServiceReview {
  id: string;
  serviceId: string;
  vendorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful_count: number;
  verified_booking: boolean;
  created_at: string;
  response?: {
    from_vendor: boolean;
    message: string;
    created_at: string;
  };
}

// Service Availability and Scheduling
export interface ServiceAvailability {
  serviceId: string;
  vendorId: string;
  available_dates: string[];
  blocked_dates: string[];
  working_hours: {
    [day: string]: {
      open: string;
      close: string;
      available: boolean;
    };
  };
  advance_booking_required: number; // days
  max_bookings_per_day: number;
  seasonal_pricing?: {
    season: string;
    start_date: string;
    end_date: string;
    price_multiplier: number;
  }[];
}

export default Service;
