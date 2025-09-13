// ============================================================================
// Wedding Bazaar - Booking API Service (Comprehensive)
// ============================================================================
// Updated to use comprehensive schema and types
// ============================================================================

import type { 
  Booking, 
  BookingRequest, 
  BookingsListResponse,
  BookingStatsResponse,
  BookingTimelineEntry,
  BookingStatus,
  ApiSuccess
} from '../../shared/types/comprehensive-booking.types';

// ============================================================================
// BOOKING API SERVICE CLASS
// ============================================================================

class BookingApiService {
  private baseUrl = import.meta.env.VITE_API_URL || 'https://wedding-bazaar-backend.onrender.com/api';

  // Get all bookings with advanced filtering
  async getAllBookings(params?: {
    page?: number;
    limit?: number;
    coupleId?: string;
    vendorId?: string;
    serviceId?: string; // Add serviceId parameter
    status?: BookingStatus[];
    serviceType?: string[];
    sortBy?: string;
    sortOrder?: string;
  }): Promise<BookingsListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.coupleId) queryParams.append('coupleId', params.coupleId);
      if (params?.vendorId) queryParams.append('vendorId', params.vendorId);
      if (params?.serviceId) queryParams.append('serviceId', params.serviceId); // Add serviceId to query params
      if (params?.status?.length) queryParams.append('status', params.status.join(','));
      if (params?.serviceType?.length) queryParams.append('serviceType', params.serviceType.join(','));
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`${this.baseUrl}/bookings?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<BookingsListResponse> = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }
      
  // Get specific booking by ID
  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<Booking> = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  // Create a new booking request
  async createBookingRequest(request: BookingRequest, userId?: string): Promise<Booking> {
    try {
      console.log('🔄 [BookingApiService] Creating booking request:', request);
      
      const response = await fetch(`${this.baseUrl}/bookings/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || 'current-user-id' // Use provided userId or fallback
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create booking request: ${response.statusText}`);
      }

      const apiResponse: ApiSuccess<Booking> = await response.json();
      console.log('✅ [BookingApiService] Booking created successfully:', apiResponse.data);
      
      return apiResponse.data;
    } catch (error) {
      console.error('❌ [BookingApiService] Error creating booking request:', error);
      throw error;
    }
  }

  // Get booking statistics
  async getBookingStats(coupleId?: string, vendorId?: string): Promise<BookingStatsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (coupleId) queryParams.append('coupleId', coupleId);
      if (vendorId) queryParams.append('vendorId', vendorId);

      const response = await fetch(`${this.baseUrl}/bookings/stats?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<BookingStatsResponse> = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  }

  // Get booking timeline/history
  async getBookingTimeline(bookingId: string): Promise<BookingTimelineEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/timeline`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<BookingTimelineEntry[]> = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching booking timeline:', error);
      throw error;
    }
  }

  // Update booking status (for vendors)
  async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    vendorResponse?: string
  ): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, vendor_response: vendorResponse }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<Booking> = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Update booking pricing (for vendors)
  async updateBookingPricing(
    bookingId: string,
    pricing: {
      quoted_price?: number;
      final_price?: number;
      downpayment_amount?: number;
    }
  ): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricing),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<Booking> = await response.json();
      return apiResponse.data;
    } catch (error) {
      console.error('Error updating booking pricing:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse: ApiSuccess<{ cancelled: boolean }> = await response.json();
      return apiResponse.data.cancelled;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Get bookings for a specific couple
  async getCoupleBookings(
    coupleId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: BookingStatus[];
      sortBy?: string;
      sortOrder?: string;
    }
  ): Promise<BookingsListResponse> {
    return this.getAllBookings({
      ...params,
      coupleId
    });
  }

  // Get bookings for a specific vendor
  async getVendorBookings(
    vendorId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: BookingStatus[];
      sortBy?: string;
      sortOrder?: string;
    }
  ): Promise<BookingsListResponse> {
    return this.getAllBookings({
      ...params,
      vendorId
    });
  }
}

// Export singleton instance
export const bookingApiService = new BookingApiService();

// Export class for testing
export { BookingApiService };
