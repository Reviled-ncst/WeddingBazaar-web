/**
 * CENTRALIZED BOOKING API SERVICE
 * 
 * This service provides a unified interface for all booking operations
 * across the Wedding Bazaar platform. It handles:
 * - Individual/Couple bookings
 * - Vendor booking management
 * - Admin booking oversight
 * - Real-time booking creation and updates
 * - Payment integration
 * - Status management
 */

import type { 
  BookingStatus, 
  Booking, 
  BookingsListResponse,
  ServiceCategory
} from '../../shared/types/comprehensive-booking.types';

// Additional interfaces for API responses
interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  statusBreakdown: Record<BookingStatus, number>;
  revenueByMonth?: Array<{ month: string; revenue: number }>;
}

// ================== CENTRALIZED API CONFIGURATION ==================

class CentralizedBookingAPI {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    // Use production backend URL
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://weddingbazaar-web.onrender.com';
    console.log('🚀 [CentralizedBookingAPI] Initialized with base URL:', this.baseUrl);
  }

  // ================== AUTHENTICATION ==================

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token') || this.authToken;
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  // ================== HTTP UTILITIES ==================

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`📡 [API] ${options.method || 'GET'} ${url}`);

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [API] Response:`, { status: response.status, hasData: !!data });
      return data;
    } catch (error) {
      console.error(`❌ [API] Request failed:`, error);
      throw error;
    }
  }

  // ================== BOOKING CREATION ==================

  /**
   * Create a new booking request
   */
  async createBooking(bookingData: {
    vendor_id: string;
    service_id: string;
    service_type: ServiceCategory;
    service_name: string;
    event_date: string;
    event_time?: string;
    event_end_time?: string;
    event_location?: string;
    venue_details?: string;
    guest_count?: number;
    special_requests?: string;
    contact_person?: string;
    contact_phone?: string;
    contact_email?: string;
    preferred_contact_method?: string;
    budget_range?: string;
    metadata?: Record<string, any>;
  }, userId: string): Promise<Booking> {
    console.log('🔥 [API] Creating booking:', { bookingData, userId });

    return this.request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        ...bookingData,
        couple_id: userId,
      }),
    });
  }

  /**
   * Create a booking request (compatibility method)
   */
  async createBookingRequest(
    bookingData: {
      vendor_id: string;
      service_id: string;
      service_type: ServiceCategory;
      service_name: string;
      event_date: string;
      event_time?: string;
      event_end_time?: string;
      event_location?: string;
      venue_details?: string;
      guest_count?: number;
      special_requests?: string;
      contact_person?: string;
      contact_phone?: string;
      contact_email?: string;
      preferred_contact_method?: string;
      budget_range?: string;
      metadata?: Record<string, any>;
    },
    userId: string
  ): Promise<Booking> {
    return this.createBooking(bookingData, userId);
  }

  // ================== BOOKING RETRIEVAL ==================

  /**
   * Get bookings for a couple/individual user
   */
  async getCoupleBookings(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: BookingStatus[];
    } = {}
  ): Promise<BookingsListResponse> {
    console.log('👥 [API] Fetching couple bookings:', { userId, options });

    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.status) {
      options.status.forEach(status => params.append('status', status));
    }

    // Try multiple endpoints for compatibility
    try {
      // Primary endpoint: Enhanced bookings API
      return await this.request<BookingsListResponse>(
        `/api/bookings/enhanced?coupleId=${userId}&${params.toString()}`
      );
    } catch (error) {
      console.warn('⚠️ [API] Enhanced endpoint failed, trying couple endpoint');
      
      // Fallback: Couple-specific endpoint
      return await this.request<BookingsListResponse>(
        `/api/bookings/couple/${userId}?${params.toString()}`
      );
    }
  }

  /**
   * Get bookings for a vendor
   */
  async getVendorBookings(
    vendorId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: BookingStatus[];
    } = {}
  ): Promise<BookingsListResponse> {
    console.log('🏪 [API] Fetching vendor bookings:', { vendorId, options });

    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.status) {
      options.status.forEach(status => params.append('status', status));
    }

    return this.request<BookingsListResponse>(
      `/api/bookings/vendor/${vendorId}?${params.toString()}`
    );
  }

  /**
   * Get all bookings for admin users
   */
  async getAdminBookings(
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: BookingStatus[];
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<BookingsListResponse> {
    console.log('👑 [API] Fetching admin bookings:', options);

    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);
    if (options.status) {
      options.status.forEach(status => params.append('status', status));
    }

    return this.request<BookingsListResponse>(
      `/api/bookings/admin?${params.toString()}`
    );
  }

  /**
   * Get a single booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    console.log('🔍 [API] Fetching booking:', bookingId);
    return this.request<Booking>(`/api/bookings/${bookingId}`);
  }

  // ================== BOOKING MANAGEMENT ==================

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    message?: string
  ): Promise<Booking> {
    console.log('🔄 [API] Updating booking status:', { bookingId, status, message });

    return this.request<Booking>(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, message }),
    });
  }

  /**
   * Confirm a booking (vendor action)
   */
  async confirmBooking(bookingId: string, message?: string): Promise<Booking> {
    console.log('✅ [API] Confirming booking:', bookingId);

    return this.request<Booking>(`/api/bookings/${bookingId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    console.log('❌ [API] Cancelling booking:', bookingId);

    return this.request<Booking>(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Mark booking as completed
   */
  async completeBooking(bookingId: string, message?: string): Promise<Booking> {
    console.log('🎉 [API] Completing booking:', bookingId);

    return this.request<Booking>(`/api/bookings/${bookingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Mark booking as delivered (vendor action)
   */
  async markDelivered(bookingId: string, message?: string): Promise<Booking> {
    console.log('📦 [API] Marking booking as delivered:', bookingId);

    return this.request<Booking>(`/api/bookings/${bookingId}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ================== QUOTES & PRICING ==================

  /**
   * Send a quote for a booking (vendor action)
   */
  async sendQuote(
    bookingId: string,
    quoteData: {
      amount: number;
      currency?: string;
      breakdown?: Array<{ item: string; amount: number; description?: string }>;
      validUntil?: string;
      terms?: string;
      message?: string;
    }
  ): Promise<Booking> {
    console.log('💰 [API] Sending quote:', { bookingId, quoteData });

    return this.request<Booking>(`/api/bookings/${bookingId}/quote`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
  }

  /**
   * Accept a quote (client action)
   */
  async acceptQuote(bookingId: string, message?: string): Promise<Booking> {
    console.log('✅ [API] Accepting quote:', bookingId);

    return this.request<Booking>(`/api/bookings/${bookingId}/quote/accept`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Reject a quote (client action)
   */
  async rejectQuote(bookingId: string, reason?: string): Promise<Booking> {
    console.log('❌ [API] Rejecting quote:', bookingId);

    return this.request<Booking>(`/api/bookings/${bookingId}/quote/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ================== PAYMENTS ==================

  /**
   * Record a payment for a booking
   */
  async recordPayment(
    bookingId: string,
    paymentData: {
      amount: number;
      currency?: string;
      paymentType: 'downpayment' | 'full_payment' | 'remaining_balance';
      paymentMethod: string;
      referenceNumber: string;
      status: 'completed' | 'pending' | 'failed';
    }
  ): Promise<Booking> {
    console.log('💳 [API] Recording payment:', { bookingId, paymentData });

    return this.request<Booking>(`/api/bookings/${bookingId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // ================== STATISTICS ==================

  /**
   * Get booking statistics
   */
  async getBookingStats(
    userId?: string,
    vendorId?: string,
    options: {
      dateFrom?: string;
      dateTo?: string;
      groupBy?: 'day' | 'week' | 'month';
    } = {}
  ): Promise<BookingStats> {
    console.log('📊 [API] Fetching booking stats:', { userId, vendorId, options });

    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (vendorId) params.append('vendorId', vendorId);
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);
    if (options.groupBy) params.append('groupBy', options.groupBy);

    return this.request<BookingStats>(`/api/bookings/stats?${params.toString()}`);
  }

  // ================== MESSAGING ==================

  /**
   * Send a message related to a booking
   */
  async sendBookingMessage(
    bookingId: string,
    message: {
      text: string;
      type?: 'text' | 'image' | 'document';
      attachments?: string[];
    }
  ): Promise<{ success: boolean; messageId: string }> {
    console.log('💬 [API] Sending booking message:', { bookingId, message });

    return this.request<{ success: boolean; messageId: string }>(
      `/api/bookings/${bookingId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(message),
      }
    );
  }

  /**
   * Get messages for a booking
   */
  async getBookingMessages(bookingId: string): Promise<Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    type: string;
    timestamp: string;
    attachments?: string[];
  }>> {
    console.log('💬 [API] Fetching booking messages:', bookingId);

    return this.request<Array<any>>(`/api/bookings/${bookingId}/messages`);
  }

  // ================== UTILITY METHODS ==================

  /**
   * Health check for the booking API
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/bookings/health');
  }

  /**
   * Clear local caches
   */
  clearCache(): void {
    // Clear any local storage caches
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('booking_cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('🧹 [API] Cache cleared');
  }
}

// ================== EXPORT SINGLETON ==================

export const centralizedBookingAPI = new CentralizedBookingAPI();

// ================== UTILITY FUNCTIONS ==================

export const formatCurrency = (amount: number, currency: string = 'PHP'): string => {
  if (currency === 'PHP') {
    return `₱${amount.toLocaleString('en-PH')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
};

export const getStatusColor = (status: BookingStatus): string => {
  const statusColors: Record<BookingStatus, string> = {
    'request': 'bg-blue-100 text-blue-800',
    'quote_requested': 'bg-yellow-100 text-yellow-800',
    'quote_sent': 'bg-orange-100 text-orange-800',
    'quote_accepted': 'bg-green-100 text-green-800',
    'quote_rejected': 'bg-red-100 text-red-800',
    'confirmed': 'bg-green-100 text-green-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-gray-100 text-gray-800',
    'cancelled': 'bg-red-100 text-red-800',
    'downpayment_paid': 'bg-emerald-100 text-emerald-800',
    'paid_in_full': 'bg-green-100 text-green-800',
    'refunded': 'bg-yellow-100 text-yellow-800',
    'disputed': 'bg-red-100 text-red-800',
    'draft': 'bg-gray-100 text-gray-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: BookingStatus): string => {
  const statusLabels: Record<BookingStatus, string> = {
    'request': 'Request Submitted',
    'quote_requested': 'Quote Requested',
    'quote_sent': 'Quote Sent',
    'quote_accepted': 'Quote Accepted',
    'quote_rejected': 'Quote Rejected',
    'confirmed': 'Confirmed',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'downpayment_paid': 'Deposit Paid',
    'paid_in_full': 'Fully Paid',
    'refunded': 'Refunded',
    'disputed': 'Disputed',
    'draft': 'Draft',
  };
  
  return statusLabels[status] || status;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ================== LEGACY COMPATIBILITY ==================

// Re-export as bookingApiService for backward compatibility
export const bookingApiService = centralizedBookingAPI;

export default centralizedBookingAPI;
