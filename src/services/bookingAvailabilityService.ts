/**
 * Booking Availability Service
 * Provides calendar view data with booking information
 */

import { silent } from '../utils/logger';

export interface VendorCalendarView {
  vendorId: string;
  date: string; // YYYY-MM-DD format
  status: 'available' | 'partially_booked' | 'fully_booked' | 'off_day';
  bookingCount: number;
  maxBookings: number;
  offDayReason?: string;
  bookings: CalendarBooking[];
}

export interface CalendarBooking {
  id: string;
  clientName: string;
  serviceName: string;
  status: string;
  eventTime?: string;
  guestCount?: number;
}

class BookingAvailabilityService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  /**
   * Map vendor IDs to the correct format for booking data
   */
  private mapVendorIdForBookings(vendorId: string): string {
    // If vendor ID starts with "2-2025-", map it to "2" where the booking data exists
    if (vendorId.startsWith('2-2025-')) {
      silent.info(`🔧 [BookingAvailabilityService] Mapping vendor ID ${vendorId} -> 2 for booking data`);
      return '2';
    }
    
    // For other vendor IDs, return as-is
    return vendorId;
  }

  /**
   * Get vendor calendar view with booking details for a date range
   */
  async getVendorCalendarView(vendorId: string, startDate: string, endDate: string): Promise<VendorCalendarView[]> {
    try {
      silent.info(`📅 [BookingAvailabilityService] Getting calendar view for vendor ${vendorId} from ${startDate} to ${endDate}`);
      
      // Map vendor ID to the format used in booking data
      const bookingVendorId = this.mapVendorIdForBookings(vendorId);
      
      // Get real bookings for this vendor
      const response = await fetch(`${this.apiUrl}/api/bookings/vendor/${bookingVendorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        silent.warn(`⚠️ [BookingAvailabilityService] Could not fetch vendor bookings: ${response.status}`);
        return [];
      }

      const data = await response.json();
      const bookings = data.bookings || [];
      
      silent.info(`📊 [BookingAvailabilityService] Found ${bookings.length} total bookings for vendor ${vendorId} (checked as ${bookingVendorId})`);

      // Generate date range
      const dates = this.generateDateRange(startDate, endDate);
      
      // Build calendar view for each date
      const calendarViews: VendorCalendarView[] = [];
      
      for (const date of dates) {
        // Filter bookings for this specific date
        const bookingsOnDate = bookings.filter((booking: any) => {
          const bookingDate = booking.event_date?.split('T')[0]; // Get YYYY-MM-DD part
          return bookingDate === date;
        });

        // Convert to calendar booking format
        const calendarBookings: CalendarBooking[] = bookingsOnDate.map((booking: any) => ({
          id: booking.id?.toString() || 'unknown',
          clientName: booking.couple_name || 'Unknown Client',
          serviceName: booking.service_name || 'Wedding Service',
          status: booking.status || 'pending',
          eventTime: booking.event_time,
          guestCount: booking.guest_count
        }));

        // Determine status
        const maxBookings = 1; // Most wedding services can only handle 1 booking per day
        const bookingCount = bookingsOnDate.length;
        const confirmedBookings = bookingsOnDate.filter((b: any) => b.status === 'confirmed').length;
        
        let status: VendorCalendarView['status'] = 'available';
        
        if (confirmedBookings >= maxBookings) {
          status = 'fully_booked';
        } else if (bookingCount > 0) {
          status = 'partially_booked';
        }

        calendarViews.push({
          vendorId,
          date,
          status,
          bookingCount,
          maxBookings,
          bookings: calendarBookings
        });
      }

      silent.info(`✅ [BookingAvailabilityService] Generated ${calendarViews.length} calendar view entries`);
      return calendarViews;

    } catch (error) {
      silent.error('❌ [BookingAvailabilityService] Error getting vendor calendar view:', error);
      return [];
    }
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
}

// Export singleton instance
export const bookingAvailabilityService = new BookingAvailabilityService();
export default bookingAvailabilityService;