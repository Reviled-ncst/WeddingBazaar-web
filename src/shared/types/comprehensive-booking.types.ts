// ============================================================================
// Wedding Bazaar - Comprehensive Booking System Types
// ============================================================================
// TypeScript types matching the comprehensive database schema
// This replaces all legacy booking types across the application
// ============================================================================

// ============================================================================
// ENUMS AND UNION TYPES (matching database enums)
// ============================================================================

export type UserType = 'individual' | 'couple' | 'vendor' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export type VendorVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ServiceCategory = 
  | 'photography' 
  | 'videography' 
  | 'catering' 
  | 'venue' 
  | 'music_dj'
  | 'flowers_decor' 
  | 'wedding_planning' 
  | 'transportation' 
  | 'makeup_hair'
  | 'wedding_cake' 
  | 'officiant' 
  | 'entertainment' 
  | 'lighting' 
  | 'security' 
  | 'other';

export type BookingStatus = 
  | 'draft'
  | 'request'
  | 'quote_requested' 
  | 'quote_sent' 
  | 'quote_accepted' 
  | 'quote_rejected'
  | 'confirmed' 
  | 'downpayment_paid' 
  | 'paid_in_full' 
  | 'in_progress'
  | 'completed' 
  | 'cancelled' 
  | 'refunded' 
  | 'disputed';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'gcash' | 'paymaya' | 'paypal' | 'cash';

export type PaymentType = 'downpayment' | 'partial_payment' | 'full_payment' | 'final_payment';

export type MessageType = 'text' | 'image' | 'document' | 'system';

export type NotificationType = 
  | 'booking_created' 
  | 'booking_updated' 
  | 'payment_received' 
  | 'message_received'
  | 'review_received' 
  | 'vendor_verified' 
  | 'system_announcement';

// ============================================================================
// CORE INTERFACES (matching database tables)
// ============================================================================

// User and Profile Interfaces
export interface User {
  id: string; // UUID
  email: string;
  password_hash?: string; // Only included in backend
  user_type: UserType;
  status: UserStatus;
  email_verified: boolean;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: string; // ISO date string
  last_login?: string; // ISO date string
  login_attempts: number;
  account_locked_until?: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface UserProfile {
  id: string; // UUID
  user_id: string; // UUID
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string; // ISO date string
  gender?: string;
  profile_image_url?: string;
  bio?: string;
  location?: {
    city?: string;
    province?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
  };
  timezone: string;
  language: string;
  preferences?: Record<string, any>;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface CoupleProfile {
  id: string; // UUID
  primary_user_id: string; // UUID
  partner_user_id?: string; // UUID
  couple_name?: string;
  wedding_date?: string; // ISO date string
  wedding_venue?: string;
  wedding_budget?: number;
  guest_count?: number;
  wedding_style?: string;
  special_requirements?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Vendor Interfaces
export interface VendorProfile {
  id: string; // UUID
  user_id: string; // UUID
  business_name: string;
  business_type: ServiceCategory;
  business_description?: string;
  business_registration_number?: string;
  tax_identification_number?: string;
  years_in_business?: number;
  verification_status: VendorVerificationStatus;
  verification_documents?: Array<{
    type: string;
    url: string;
    uploaded_at: string;
  }>;
  website_url?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  service_areas?: string[]; // Array of locations
  pricing_range?: {
    min: number;
    max: number;
    currency: string;
  };
  portfolio_images?: string[]; // Array of image URLs
  featured_image_url?: string;
  business_hours?: {
    [day: string]: {
      open: string;
      close: string;
      is_open: boolean;
    };
  };
  cancellation_policy?: string;
  terms_of_service?: string;
  average_rating: number;
  total_reviews: number;
  total_bookings: number;
  response_time_hours: number;
  is_featured: boolean;
  is_premium: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface VendorService {
  id: string; // UUID
  vendor_id: string; // UUID
  service_name: string;
  service_category: ServiceCategory;
  service_description?: string;
  base_price?: number;
  price_per_guest?: number;
  minimum_price?: number;
  maximum_price?: number;
  package_inclusions?: string[];
  package_exclusions?: string[];
  duration_hours?: number;
  max_guests?: number;
  advance_booking_days: number;
  cancellation_deadline_days: number;
  requires_deposit: boolean;
  deposit_percentage: number;
  images?: string[]; // Array of image URLs
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface VendorAvailability {
  id: string; // UUID
  vendor_id: string; // UUID
  date: string; // ISO date string
  is_available: boolean;
  time_slots?: Array<{
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>;
  max_bookings_per_day: number;
  notes?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// ============================================================================
// BOOKING SYSTEM INTERFACES
// ============================================================================

// Main Booking Interface (comprehensive)
export interface Booking {
  id: string; // UUID
  booking_reference: string; // Unique reference
  couple_id: string; // UUID
  vendor_id: string; // UUID
  service_id?: string; // UUID
  
  // Event details
  event_date: string; // ISO date string
  event_time?: string; // Time string (HH:MM)
  event_end_time?: string; // Time string (HH:MM)
  event_location?: string;
  venue_details?: string;
  guest_count?: number;
  
  // Service details
  service_type: ServiceCategory;
  service_name: string;
  service_description?: string;
  special_requests?: string;
  
  // Contact information
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  preferred_contact_method: string;
  
  // Pricing and payments
  quoted_price?: number;
  final_price?: number;
  downpayment_amount?: number;
  total_paid: number;
  remaining_balance?: number;
  
  // Status and workflow
  status: BookingStatus;
  vendor_response?: string;
  response_date?: string; // ISO date string
  confirmation_date?: string; // ISO date string
  completion_date?: string; // ISO date string
  
  // Additional fields
  budget_range?: string;
  payment_terms?: string;
  contract_terms?: string;
  contract_signed: boolean;
  contract_url?: string;
  
  // Enhanced vendor information (from joins/views)
  vendor_name?: string; // Business name from vendor_profiles
  vendor_category?: string; // Business type
  vendor_rating?: number; // Average rating
  vendor_image?: string; // Featured image URL
  
  // Enhanced couple information (from joins/views)
  couple_name?: string; // Couple display name
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// Booking request interface (for creating new bookings)
export interface BookingRequest {
  vendor_id: string; // UUID
  service_id?: string; // UUID
  
  // Event details
  event_date: string; // ISO date string
  event_time?: string;
  event_end_time?: string;
  event_location?: string;
  venue_details?: string;
  guest_count?: number;
  
  // Service details
  service_type: ServiceCategory;
  service_name: string;
  service_description?: string;
  special_requests?: string;
  
  // Contact information
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  preferred_contact_method?: string;
  
  // Budget information
  budget_range?: string;
  
  // Additional information
  metadata?: Record<string, any>;
}

// Booking timeline/history entry
export interface BookingTimelineEntry {
  id: string; // UUID
  booking_id: string; // UUID
  actor_id?: string; // UUID
  actor_type?: UserType;
  action: string; // status_change, message_sent, payment_made, etc.
  old_status?: BookingStatus;
  new_status?: BookingStatus;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string; // ISO date string
}

// ============================================================================
// PAYMENT SYSTEM INTERFACES
// ============================================================================

export interface Payment {
  id: string; // UUID
  booking_id: string; // UUID
  payment_reference: string; // Unique reference
  
  // Payment details
  amount: number;
  currency: string;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  
  // Payment gateway information
  gateway_provider?: string;
  gateway_transaction_id?: string;
  gateway_session_id?: string;
  gateway_checkout_url?: string;
  gateway_webhook_id?: string;
  
  // Processing details
  processed_at?: string; // ISO date string
  failed_at?: string; // ISO date string
  failure_reason?: string;
  refunded_at?: string; // ISO date string
  refund_amount?: number;
  refund_reason?: string;
  
  // Fees and charges
  platform_fee: number;
  gateway_fee: number;
  net_amount?: number;
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface PaymentReceipt {
  id: string; // UUID
  payment_id: string; // UUID
  receipt_number: string; // Unique reference
  receipt_url?: string;
  issued_date: string; // ISO date string
  issued_to?: {
    name: string;
    email: string;
    address?: string;
  };
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string; // ISO date string
}

// ============================================================================
// COMMUNICATION INTERFACES
// ============================================================================

export interface Conversation {
  id: string; // UUID
  booking_id?: string; // UUID
  couple_id: string; // UUID
  vendor_id: string; // UUID
  subject?: string;
  last_message_at?: string; // ISO date string
  is_archived: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface Message {
  id: string; // UUID
  conversation_id: string; // UUID
  sender_id: string; // UUID
  message_type: MessageType;
  content?: string;
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
    size: number;
  }>;
  read_at?: string; // ISO date string
  read_by?: string; // UUID
  reply_to_id?: string; // UUID
  created_at: string; // ISO date string
}

// ============================================================================
// REVIEW SYSTEM INTERFACES
// ============================================================================

export interface Review {
  id: string; // UUID
  booking_id: string; // UUID
  vendor_id: string; // UUID
  reviewer_id: string; // UUID
  
  // Rating details
  overall_rating: number; // 1-5
  quality_rating: number; // 1-5
  service_rating: number; // 1-5
  value_rating: number; // 1-5
  communication_rating: number; // 1-5
  
  // Review content
  title?: string;
  review_text?: string;
  pros?: string;
  cons?: string;
  images?: string[]; // Array of review images
  
  // Vendor response
  vendor_response?: string;
  vendor_response_date?: string; // ISO date string
  
  // Moderation
  is_verified: boolean;
  is_featured: boolean;
  is_published: boolean;
  moderation_notes?: string;
  
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface BookingsListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters?: {
    status?: BookingStatus[];
    service_type?: ServiceCategory[];
    date_range?: {
      start: string;
      end: string;
    };
  };
}

export interface BookingStatsResponse {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  pending_payments: number;
  upcoming_events: number;
  monthly_stats: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface VendorBookingsResponse {
  bookings: Booking[];
  stats: {
    total: number;
    pending_response: number;
    confirmed: number;
    completed: number;
    revenue_this_month: number;
    upcoming_events: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Filter types
export type BookingStatusFilter = 'all' | BookingStatus;
export type ServiceCategoryFilter = 'all' | ServiceCategory;

// Sort options
export type BookingSortField = 'created_at' | 'event_date' | 'status' | 'final_price';
export type SortDirection = 'asc' | 'desc';

// Search and filter parameters
export interface BookingFilters {
  status?: BookingStatus[];
  service_type?: ServiceCategory[];
  date_range?: {
    start: string;
    end: string;
  };
  price_range?: {
    min: number;
    max: number;
  };
  vendor_id?: string;
  couple_id?: string;
  service_id?: string; // Add service_id filter support
  search_query?: string;
}

export interface BookingQueryParams extends BookingFilters {
  page?: number;
  limit?: number;
  sort_field?: BookingSortField;
  sort_direction?: SortDirection;
}

// ============================================================================
// FORM INTERFACES
// ============================================================================

export interface BookingFormData {
  vendor_id: string;
  service_id?: string;
  service_type: ServiceCategory;
  service_name: string;
  event_date: string;
  event_time?: string;
  event_location?: string;
  guest_count?: number;
  special_requests?: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  budget_range?: string;
  preferred_contact_method?: string;
}

export interface PaymentFormData {
  booking_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  description?: string;
}

// ============================================================================
// ERROR AND SUCCESS RESPONSE TYPES
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ApiSuccess<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// ============================================================================
// LEGACY COMPATIBILITY (for gradual migration)
// ============================================================================

// Legacy booking status mapping
export const LEGACY_STATUS_MAP: Record<string, BookingStatus> = {
  'pending': 'quote_requested',
  'approved': 'confirmed',
  'completed': 'completed',
  'cancelled': 'cancelled'
};

// Legacy service category mapping
export const LEGACY_CATEGORY_MAP: Record<string, ServiceCategory> = {
  'Photography': 'photography',
  'Catering': 'catering',
  'Venue': 'venue',
  'Music & DJ': 'music_dj',
  'Wedding Planning': 'wedding_planning'
};
