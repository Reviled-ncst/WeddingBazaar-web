/**
 * Simplified Availability Service - Uses real booking data only
 * Focused on working with the existing booking API endpoints
 */

import { silent } from '../utils/logger';

export interface VendorAvailability {
  vendorId: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  reason?: 'booked' | 'off_day' | 'holiday' | 'maintenance';
  bookingIds?: string[];
  maxBookings?: number;
  currentBookings?: number;
}

export interface AvailabilityCheck {
  date: string;
  vendorId: string;
  isAvailable: boolean;
  reason?: string;
  alternativeDates?: string[];
  bookingStatus?: 'available' | 'booked' | 'unavailable' | 'fully_booked';
  currentBookings?: number;
  maxBookingsPerDay?: number;
  existingBookings?: any[];
  bookingDetails?: {
    totalBookings: number;
    bookingIds: string[];
    bookingStatuses: string[];
    canAcceptMore: boolean;
  };
}

class AvailabilityService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  /**
   * Check if a vendor is available on a specific date using real booking data
   */
  async checkAvailability(vendorId: string, date: string): Promise<AvailabilityCheck> {
    try {
      silent.info('📅 [AvailabilityService] Checking availability:', { vendorId, date });
      
      return await this.checkAvailabilityUsingBookings(vendorId, date);
    } catch (error) {
      silent.error('❌ [AvailabilityService] Error checking availability:', error);
      
      // Default to available if there's an error
      return {
        date,
        vendorId,
        isAvailable: true,
        reason: 'Available (error checking bookings)',
        bookingStatus: 'available',
        currentBookings: 0,
        maxBookingsPerDay: 1
      };
    }
  }

  /**
   * Check availability using real booking data from the API
   */
  private async checkAvailabilityUsingBookings(vendorId: string, date: string): Promise<AvailabilityCheck> {
    try {
      silent.info(`🔍 [AvailabilityService] Checking bookings for vendor ${vendorId} on ${date}`);
      
      // Get real bookings for this vendor
      const response = await fetch(`${this.apiUrl}/api/bookings/vendor/${vendorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        silent.warn(`⚠️ [AvailabilityService] Could not fetch vendor bookings: ${response.status}`);
        
        // Default to available if we can't check bookings
        return {
          date,
          vendorId,
          isAvailable: true,
          reason: 'Available (could not verify bookings)',
          bookingStatus: 'available',
          currentBookings: 0,
          maxBookingsPerDay: 1
        };
      }

      const data = await response.json();
      const bookings = data.bookings || [];
      
      silent.info(`📊 [AvailabilityService] Found ${bookings.length} total bookings for vendor ${vendorId}`);

      // Filter bookings for the specific date
      const bookingsOnDate = bookings.filter((booking: any) => {
        const bookingDate = booking.event_date?.split('T')[0]; // Get YYYY-MM-DD part
        return bookingDate === date;
      });

      silent.info(`📅 [AvailabilityService] Found ${bookingsOnDate.length} bookings on ${date}`);

      // For most wedding services, assume max 1 booking per day
      const maxBookingsPerDay = 1;
      const currentBookings = bookingsOnDate.length;
      
      // Count confirmed bookings specifically
      const confirmedBookings = bookingsOnDate.filter((booking: any) => booking.status === 'confirmed').length;
      const pendingBookings = bookingsOnDate.filter((booking: any) => 
        booking.status === 'pending' || booking.status === 'request'
      ).length;

      let isAvailable = false;
      let reason = '';
      let bookingStatus: 'available' | 'booked' | 'unavailable' | 'fully_booked' = 'available';

      if (confirmedBookings >= maxBookingsPerDay) {
        // Has confirmed booking - completely unavailable
        isAvailable = false;
        reason = `Already booked (${confirmedBookings} confirmed booking${confirmedBookings > 1 ? 's' : ''})`;
        bookingStatus = 'fully_booked';
      } else if (pendingBookings > 0) {
        // Has pending booking - still available but show partial status
        isAvailable = true;
        reason = `Available with ${pendingBookings} pending request${pendingBookings > 1 ? 's' : ''}`;
        bookingStatus = 'booked';
      } else {
        // No bookings - completely available
        isAvailable = true;
        reason = 'Available for booking';
        bookingStatus = 'available';
      }

      const result: AvailabilityCheck = {
        date,
        vendorId,
        isAvailable,
        reason,
        bookingStatus,
        currentBookings,
        maxBookingsPerDay,
        existingBookings: bookingsOnDate,
        bookingDetails: {
          totalBookings: currentBookings,
          bookingIds: bookingsOnDate.map((b: any) => b.id),
          bookingStatuses: bookingsOnDate.map((b: any) => b.status),
          canAcceptMore: confirmedBookings < maxBookingsPerDay
        }
      };

      silent.info(`✅ [AvailabilityService] Availability result for ${date}:`, result);
      return result;

    } catch (error) {
      silent.error('❌ [AvailabilityService] Error in availability check:', error);
      
      // Default to available on error
      return {
        date,
        vendorId,
        isAvailable: true,
        reason: 'Available (error checking bookings)',
        bookingStatus: 'available',
        currentBookings: 0,
        maxBookingsPerDay: 1
      };
    }
  }

  /**
   * Check availability for a date range
   */
  async checkAvailabilityRange(vendorId: string, startDate: string, endDate: string): Promise<Map<string, AvailabilityCheck>> {
    const availabilityMap = new Map<string, AvailabilityCheck>();
    const dates = this.generateDateRange(startDate, endDate);

    // Check each date individually
    for (const date of dates) {
      try {
        const availability = await this.checkAvailability(vendorId, date);
        availabilityMap.set(date, availability);
      } catch (error) {
        silent.error(`❌ [AvailabilityService] Error checking ${date}:`, error);
        
        // Add default available status on error
        availabilityMap.set(date, {
          date,
          vendorId,
          isAvailable: true,
          reason: 'Available (error checking)',
          bookingStatus: 'available',
          currentBookings: 0,
          maxBookingsPerDay: 1
        });
      }
    }

    return availabilityMap;
  }

  /**
   * Generate array of dates between start and end date
   */
  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      dates.push(this.formatDate(current));
    }

    return dates;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  }

  /**
   * Clear any caches (for future optimization)
   */
  clearCache(): void {
    // No caches in this simplified version
    silent.info('🧹 [AvailabilityService] Cache cleared (no-op in simplified version)');
  }

  /**
   * Notify service that a booking has changed
   */
  onBookingChanged(vendorId: string, date: string): void {
    // In the simplified version, we just log this
    silent.info(`📢 [AvailabilityService] Booking changed notification for vendor ${vendorId} on ${date}`);
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();
export default availabilityService;
