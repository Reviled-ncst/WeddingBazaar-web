// Import shared types from booking module for consistency
import type { ServiceCategory } from '../../../shared/types/comprehensive-booking.types';

// Enhanced Service interface to match database schema
export interface Service {
  // Core identifiers
  id: string;
  vendorId: string;
  
  // Service details
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice?: number;
  pricePerGuest?: number;
  minimumPrice?: number;
  maximumPrice?: number;
  priceRange?: string; // Legacy compatibility field
  
  // Package details
  packageInclusions?: string[];
  packageExclusions?: string[];
  durationHours?: number;
  maxGuests?: number;
  
  // Booking requirements
  advanceBookingDays?: number;
  cancellationDeadlineDays?: number;
  requiresDeposit?: boolean;
  depositPercentage?: number;
  
  // Media and presentation
  image: string;
  gallery?: string[];
  
  // Vendor information
  vendorName: string;
  vendorImage?: string;
  vendorDescription?: string;
  vendorWebsite?: string;
  vendorSocialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Location and service areas
  location: string;
  serviceAreas?: string[];
  
  // Reviews and ratings
  rating: number;
  reviewCount: number;
  averageRating?: number;
  totalReviews?: number;
  
  // Business details
  yearsInBusiness?: number;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  businessHours?: Record<string, any>;
  cancellationPolicy?: string;
  termsOfService?: string;
  
  // Performance metrics
  responseTimeHours?: number;
  totalBookings?: number;
  
  // Status and features
  availability: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  features: string[];
  specialties?: string[];
  
  // Contact information
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Enhanced filter options to match database schema
export interface FilterOptions {
  categories: ServiceCategory[];
  locations: string[];
  priceRanges: string[];
  ratings: number[];
  verificationStatuses?: string[];
  businessTypes?: string[];
}

// Enhanced service filters
export interface ServiceFilters {
  searchQuery: string;
  selectedCategory: ServiceCategory | 'all';
  selectedLocation: string;
  selectedPriceRange: string;
  selectedRating: number;
  sortBy: string;
  verificationStatus?: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
  advanceBookingDays?: number;
}

export type ViewMode = 'grid' | 'list';

// Enhanced search parameters
export interface ServiceSearchParams {
  query?: string;
  category?: ServiceCategory | 'all';
  location?: string;
  priceRange?: string;
  minRating?: number;
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  isFeatured?: boolean;
  isPremium?: boolean;
  verificationStatus?: string;
  vendorId?: string;
  serviceAreas?: string[];
  advanceBookingDays?: number;
  requiresDeposit?: boolean;
}

// Enhanced service response
export interface ServiceResponse {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters?: {
    categories: Array<{ key: ServiceCategory; label: string; count: number; }>;
    locations: Array<{ key: string; label: string; count: number; }>;
    priceRanges: Array<{ key: string; label: string; count: number; }>;
    verificationStatuses: Array<{ key: string; label: string; count: number; }>;
  };
}

// Vendor profile interface for service providers
export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: ServiceCategory;
  businessDescription?: string;
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  yearsInBusiness?: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocuments?: Array<{
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  websiteUrl?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  serviceAreas: string[];
  pricingRange?: {
    min: number;
    max: number;
    currency: string;
  };
  portfolioImages: string[];
  featuredImageUrl?: string;
  businessHours?: Record<string, any>;
  cancellationPolicy?: string;
  termsOfService?: string;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  responseTimeHours: number;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking request interface for services
export interface ServiceBookingRequest {
  serviceId: string;
  vendorId: string;
  coupleId: string;
  serviceType: ServiceCategory;
  serviceName?: string;
  vendorName?: string;
  eventDate: string;
  eventTime?: string;
  eventEndTime?: string;
  eventLocation?: string;
  venueDetails?: string;
  guestCount?: number;
  budgetRange?: string;
  specialRequests?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  preferredContactMethod?: 'email' | 'phone' | 'message';
  paymentTerms?: string;
  metadata?: Record<string, any>;
}
