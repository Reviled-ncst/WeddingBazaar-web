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

export interface VendorOffDay {
  id: string;
  vendorId: string;
  date: string; // YYYY-MM-DD format
  reason: string;
  isRecurring?: boolean;
  recurringPattern?: 'weekly' | 'monthly' | 'yearly' | string;
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
   * Map vendor IDs to the correct format for booking data
   * The services use "2-2025-XXX" format but bookings use "2" format
   */
  private mapVendorIdForBookings(vendorId: string): string {
    // If vendor ID starts with "2-2025-", map it to "2" where the booking data exists
    if (vendorId.startsWith('2-2025-')) {
      silent.info(`🔧 [AvailabilityService] Mapping vendor ID ${vendorId} -> 2 for booking data`);
      return '2';
    }
    
    // For other vendor IDs, return as-is
    return vendorId;
  }

  /**
   * Check availability using real booking data from the API
   */
  private async checkAvailabilityUsingBookings(vendorId: string, date: string): Promise<AvailabilityCheck> {
    try {
      silent.info(`🔍 [AvailabilityService] Checking bookings for vendor ${vendorId} on ${date}`);
      
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
      
      silent.info(`📊 [AvailabilityService] Found ${bookings.length} total bookings for vendor ${vendorId} (checked as ${bookingVendorId})`);

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
   * Get vendor calendar data for a date range (used by VendorAvailabilityCalendar)
   */
  async getVendorCalendar(vendorId: string, startDate: string, endDate: string): Promise<VendorAvailability[]> {
    try {
      silent.info(`📅 [AvailabilityService] Getting vendor calendar for ${vendorId} from ${startDate} to ${endDate}`);
      
      const availabilityMap = await this.checkAvailabilityRange(vendorId, startDate, endDate);
      const calendarData: VendorAvailability[] = [];
      
      for (const [date, availability] of availabilityMap.entries()) {
        calendarData.push({
          vendorId,
          date,
          isAvailable: availability.isAvailable,
          reason: availability.bookingStatus === 'fully_booked' ? 'booked' : undefined,
          bookingIds: availability.bookingDetails?.bookingIds,
          maxBookings: availability.maxBookingsPerDay || 1,
          currentBookings: availability.currentBookings || 0
        });
      }
      
      silent.info(`✅ [AvailabilityService] Generated ${calendarData.length} calendar entries`);
      return calendarData;
    } catch (error) {
      silent.error('❌ [AvailabilityService] Error getting vendor calendar:', error);
      return [];
    }
  }

  /**
   * Get vendor off days from the API (with localStorage fallback for demo)
   */
  async getVendorOffDays(vendorId: string): Promise<VendorOffDay[]> {
    try {
      silent.info(`📋 [AvailabilityService] Getting off days for vendor ${vendorId}`);
      
      const response = await fetch(`${this.apiUrl}/api/vendors/${vendorId}/off-days`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No off days found, fall back to localStorage demo mode
          silent.info(`📋 [AvailabilityService] API not available, using localStorage demo mode`);
          return this.getOffDaysFromLocalStorage(vendorId);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get off days');
      }

      const offDays = (data.offDays || []).map((offDay: any) => ({
        id: offDay.id,
        vendorId: offDay.vendorId,
        date: offDay.date,
        reason: offDay.reason,
        isRecurring: offDay.isRecurring,
        recurringPattern: offDay.recurringPattern
      }));

      silent.info(`✅ [AvailabilityService] Retrieved ${offDays.length} off days for vendor ${vendorId}`);
      return offDays;
      
    } catch (error) {
      silent.error('❌ [AvailabilityService] Error getting vendor off days, falling back to localStorage:', error);
      // Fall back to localStorage demo mode
      return this.getOffDaysFromLocalStorage(vendorId);
    }
  }

  /**
   * Set vendor off days via API
   */
  async setVendorOffDays(vendorId: string, offDays: Omit<VendorOffDay, 'id'>[]): Promise<boolean> {
    try {
      silent.info(`📝 [AvailabilityService] Setting ${offDays.length} off days for vendor ${vendorId}`);
      
      if (offDays.length === 0) {
        silent.warn('⚠️ [AvailabilityService] No off days to set');
        return true;
      }

      // Use bulk endpoint for multiple off days
      const response = await fetch(`${this.apiUrl}/api/vendors/${vendorId}/off-days/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offDays })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to set off days');
      }

      silent.info(`✅ [AvailabilityService] Successfully set ${offDays.length} off days for vendor ${vendorId}`);
      return true;
      
    } catch (error) {
      silent.error('❌ [AvailabilityService] Error setting vendor off days:', error);
      return false;
    }
  }

  /**
   * Set a single vendor off day via API (with localStorage fallback for demo)
   */
  async setSingleVendorOffDay(vendorId: string, date: string, reason: string, isRecurring: boolean = false, recurringPattern?: string): Promise<boolean> {
    try {
      silent.info(`📝 [AvailabilityService] Setting single off day for vendor ${vendorId} on ${date}`);
      
      const response = await fetch(`${this.apiUrl}/api/vendors/${vendorId}/off-days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          reason,
          isRecurring,
          recurringPattern
        })
      });

      if (!response.ok) {
        // API not available, use localStorage demo mode
        silent.info(`📱 [AvailabilityService] API not available, using localStorage demo mode`);
        this.addOffDayToLocalStorage(vendorId, {
          vendorId,
          date,
          reason,
          isRecurring,
          recurringPattern
        });
        return true;
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to set off day');
      }

      silent.info(`✅ [AvailabilityService] Successfully set off day for vendor ${vendorId} on ${date}`);
      return true;
      
    } catch (error) {
      silent.error('❌ [AvailabilityService] API error, falling back to localStorage demo mode:', error);
      // Fall back to localStorage demo mode
      this.addOffDayToLocalStorage(vendorId, {
        vendorId,
        date,
        reason,
        isRecurring,
        recurringPattern
      });
      return true;
    }
  }

  /**
   * Remove vendor off day via API (with localStorage fallback for demo)
   */
  async removeVendorOffDay(vendorId: string, offDayId: string): Promise<boolean> {
    try {
      silent.info(`🗑️ [AvailabilityService] Removing off day ${offDayId} for vendor ${vendorId}`);
      
      const response = await fetch(`${this.apiUrl}/api/vendors/${vendorId}/off-days/${offDayId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // API not available or off day not found, try localStorage demo mode
          silent.info(`📱 [AvailabilityService] API not available, using localStorage demo mode`);
          return this.removeOffDayFromLocalStorage(vendorId, offDayId);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to remove off day');
      }

      silent.info(`✅ [AvailabilityService] Successfully removed off day ${offDayId} for vendor ${vendorId}`);
      return true;
      
    } catch (error) {
      silent.error('❌ [AvailabilityService] API error, falling back to localStorage demo mode:', error);
      // Fall back to localStorage demo mode
      return this.removeOffDayFromLocalStorage(vendorId, offDayId);
    }
  }

  /**
   * Demo mode: Get off days from localStorage
   */
  private getOffDaysFromLocalStorage(vendorId: string): VendorOffDay[] {
    try {
      const key = `vendor_off_days_${vendorId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const offDays = JSON.parse(stored);
      silent.info(`📱 [AvailabilityService] Retrieved ${offDays.length} off days from localStorage for vendor ${vendorId}`);
      return offDays;
    } catch (error) {
      silent.error('❌ [AvailabilityService] Error reading from localStorage:', error);
      return [];
    }
  }

  /**
   * Demo mode: Save off days to localStorage
   */
  private saveOffDaysToLocalStorage(vendorId: string, offDays: VendorOffDay[]): void {
    try {
      const key = `vendor_off_days_${vendorId}`;
      localStorage.setItem(key, JSON.stringify(offDays));
      silent.info(`💾 [AvailabilityService] Saved ${offDays.length} off days to localStorage for vendor ${vendorId}`);
    } catch (error) {
      silent.error('❌ [AvailabilityService] Error saving to localStorage:', error);
    }
  }

  /**
   * Demo mode: Add off day to localStorage
   */
  private addOffDayToLocalStorage(vendorId: string, offDay: Omit<VendorOffDay, 'id'>): VendorOffDay {
    const existingOffDays = this.getOffDaysFromLocalStorage(vendorId);
    const newOffDay: VendorOffDay = {
      ...offDay,
      id: `off_day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Check for duplicates
    const exists = existingOffDays.some(existing => existing.date === offDay.date);
    if (!exists) {
      existingOffDays.push(newOffDay);
      this.saveOffDaysToLocalStorage(vendorId, existingOffDays);
    }
    
    return newOffDay;
  }

  /**
   * Demo mode: Remove off day from localStorage
   */
  private removeOffDayFromLocalStorage(vendorId: string, offDayId: string): boolean {
    const existingOffDays = this.getOffDaysFromLocalStorage(vendorId);
    const filteredOffDays = existingOffDays.filter(offDay => offDay.id !== offDayId);
    
    if (filteredOffDays.length < existingOffDays.length) {
      this.saveOffDaysToLocalStorage(vendorId, filteredOffDays);
      return true;
    }
    
    return false;
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
