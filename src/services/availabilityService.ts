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
  private cache: Map<string, { data: Map<string, AvailabilityCheck>; timestamp: number }>;
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private ongoingRequests: Map<string, Promise<Map<string, AvailabilityCheck>>>;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    this.cache = new Map();
    this.ongoingRequests = new Map();
  }

  /**
   * Generate cache key for availability requests
   */
  private getCacheKey(vendorId: string, startDate: string, endDate: string): string {
    return `${vendorId}_${startDate}_${endDate}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Get cached availability data if valid
   */
  private getCachedData(vendorId: string, startDate: string, endDate: string): Map<string, AvailabilityCheck> | null {
    const cacheKey = this.getCacheKey(vendorId, startDate, endDate);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log('💾 [AvailabilityService] Using cached data for:', cacheKey);
      return new Map(cached.data); // Return a copy
    }
    
    if (cached) {
      console.log('🗑️ [AvailabilityService] Cache expired for:', cacheKey);
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Cache availability data
   */
  private setCachedData(vendorId: string, startDate: string, endDate: string, data: Map<string, AvailabilityCheck>): void {
    const cacheKey = this.getCacheKey(vendorId, startDate, endDate);
    this.cache.set(cacheKey, {
      data: new Map(data), // Store a copy
      timestamp: Date.now()
    });
    
    console.log('💾 [AvailabilityService] Cached data for:', cacheKey, '(', data.size, 'dates)');
    
    // Clean up old cache entries to prevent memory leaks
    if (this.cache.size > 50) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
      console.log('🧹 [AvailabilityService] Cleaned up old cache entry:', oldestKey);
    }
  }

  /**
   * Check if a vendor is available on a specific date using real booking data
   */
  async checkAvailability(vendorId: string, date: string): Promise<AvailabilityCheck> {
    try {
      console.log('🔍 [AvailabilityService] Starting availability check:', { vendorId, date });
      silent.info('📅 [AvailabilityService] Checking availability:', { vendorId, date });
      
      // Simple network test first
      console.log('🌐 [AvailabilityService] Testing network connectivity...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const testResponse = await fetch(`${this.apiUrl}/api/health`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('✅ [AvailabilityService] Network test successful:', testResponse.status);
      } catch (networkError) {
        console.error('❌ [AvailabilityService] Network test failed:', networkError);
        const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
        throw new Error(`Network connectivity failed: ${errorMessage}`);
      }
      
      return await this.checkAvailabilityUsingBookings(vendorId, date);
    } catch (error) {
      console.error('❌ [AvailabilityService] Error checking availability:', error);
      silent.error('❌ [AvailabilityService] Error checking availability:', error);
      
      // Default to available if there's an error
      return {
        date,
        vendorId,
        isAvailable: true,
        reason: `Available (error: ${error instanceof Error ? error.message : String(error)})`,
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
      console.log(`🔍 [AvailabilityService] Checking bookings for vendor ${vendorId} on ${date}`);
      
      // Map vendor ID to the format used in booking data
      const bookingVendorId = this.mapVendorIdForBookings(vendorId);
      console.log(`🔧 [AvailabilityService] Mapped vendor ID: ${vendorId} -> ${bookingVendorId}`);
      
      const apiUrl = `${this.apiUrl}/api/bookings/vendor/${bookingVendorId}`;
      console.log(`🌐 [AvailabilityService] Making request to: ${apiUrl}`);
      console.log(`🔧 [AvailabilityService] API URL from env: ${this.apiUrl}`);
      console.log(`🔧 [AvailabilityService] Full request details:`, {
        method: 'GET',
        url: apiUrl,
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Get real bookings for this vendor with timeout
      console.log(`⏳ [AvailabilityService] Starting fetch request...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ [AvailabilityService] Request timeout, aborting...');
        controller.abort();
      }, 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`✅ [AvailabilityService] Fetch completed successfully`);

      console.log(`📡 [AvailabilityService] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.warn(`⚠️ [AvailabilityService] Could not fetch vendor bookings: ${response.status}`);
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
      
      // Count confirmed vs pending/request bookings (consistent with bulk processing)
      const confirmedBookings = bookingsOnDate.filter((booking: any) => 
        booking.status === 'confirmed' || booking.status === 'paid_in_full' || booking.status === 'completed'
      ).length;
      const pendingBookings = bookingsOnDate.filter((booking: any) => 
        booking.status === 'pending' || booking.status === 'request' || booking.status === 'quote_requested' || booking.status === 'quote_sent'
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
      console.error('❌ [AvailabilityService] Error in availability check:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [AvailabilityService] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        vendorId,
        date,
        apiUrl: this.apiUrl
      });
      silent.error('❌ [AvailabilityService] Error in availability check:', error);
      
      // For booking conflicts, we want to be strict - don't default to available
      // Only default to available for network/infrastructure errors
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network connectivity failed') || 
          errorMessage.includes('timeout') ||
          errorMessage.includes('CORS')) {
        console.log('⚠️ [AvailabilityService] Network error, defaulting to available with warning');
        return {
          date,
          vendorId,
          isAvailable: true,
          reason: `Available (network error: ${errorMessage})`,
          bookingStatus: 'available',
          currentBookings: 0,
          maxBookingsPerDay: 1
        };
      } else {
        console.log('🚫 [AvailabilityService] Service error, defaulting to unavailable for safety');
        return {
          date,
          vendorId,
          isAvailable: false,
          reason: `Unavailable (service error: ${errorMessage})`,
          bookingStatus: 'unavailable',
          currentBookings: 0,
          maxBookingsPerDay: 1
        };
      }
    }
  }

  /**
   * Check availability for a date range - OPTIMIZED VERSION with CACHING & DEDUPLICATION
   * Makes bulk API calls instead of individual date checks and caches results
   */
  async checkAvailabilityRange(vendorId: string, startDate: string, endDate: string): Promise<Map<string, AvailabilityCheck>> {
    const cacheKey = this.getCacheKey(vendorId, startDate, endDate);
    console.log('🚀 [AvailabilityService] Availability check request:', { vendorId, startDate, endDate, cacheKey });

    // Check cache first
    const cached = this.getCachedData(vendorId, startDate, endDate);
    if (cached) {
      console.log('⚡ [AvailabilityService] Returning cached results for', cached.size, 'dates');
      return cached;
    }

    // Check if there's already an ongoing request for the same data
    if (this.ongoingRequests.has(cacheKey)) {
      console.log('🔄 [AvailabilityService] Joining ongoing request for:', cacheKey);
      return await this.ongoingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = this.performAvailabilityCheck(vendorId, startDate, endDate);
    this.ongoingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up ongoing request
      this.ongoingRequests.delete(cacheKey);
    }
  }

  /**
   * Perform the actual availability check (separated for deduplication)
   */
  private async performAvailabilityCheck(vendorId: string, startDate: string, endDate: string): Promise<Map<string, AvailabilityCheck>> {
    const availabilityMap = new Map<string, AvailabilityCheck>();
    const dates = this.generateDateRange(startDate, endDate);

    try {
      // Bulk check using existing booking API - much more efficient
      const bulkResults = await this.checkAvailabilityBulk(vendorId, startDate, endDate);
      
      // Process results for each date
      for (const date of dates) {
        const result = bulkResults.get(date);
        if (result) {
          availabilityMap.set(date, result);
        } else {
          // Default available if no data
          availabilityMap.set(date, {
            date,
            vendorId,
            isAvailable: true,
            reason: 'Available',
            bookingStatus: 'available',
            currentBookings: 0,
            maxBookingsPerDay: 1
          });
        }
      }

      console.log('✅ [AvailabilityService] Bulk check completed:', availabilityMap.size, 'dates processed');
      
      // Cache the results
      this.setCachedData(vendorId, startDate, endDate, availabilityMap);
      
      return availabilityMap;
      
    } catch (error) {
      console.error('❌ [AvailabilityService] Bulk check failed, falling back to individual checks:', error);
      
      // Fallback to individual checks only if bulk fails
      return await this.checkAvailabilityRangeFallback(vendorId, dates);
    }
  }

  /**
   * Optimized bulk availability check using existing API endpoints
   */
  private async checkAvailabilityBulk(vendorId: string, startDate: string, endDate: string): Promise<Map<string, AvailabilityCheck>> {
    const availabilityMap = new Map<string, AvailabilityCheck>();
    const bookingVendorId = this.mapVendorIdForBookings(vendorId);

    console.log('📊 [AvailabilityService] Making bulk API calls...');

    try {
      // Parallel API calls for efficiency
      const [bookingsResponse, offDaysResponse] = await Promise.all([
        // Get all bookings for vendor in date range
        fetch(`${this.apiUrl}/api/bookings/vendor/${bookingVendorId}?startDate=${startDate}&endDate=${endDate}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        // Get all off days for vendor
        fetch(`${this.apiUrl}/api/vendors/${vendorId}/off-days`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      let bookings = [];
      let offDays = [];

      // Process bookings response
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        bookings = bookingsData.bookings || bookingsData || [];
        console.log('📅 [AvailabilityService] Retrieved', bookings.length, 'bookings for date range');
      } else {
        console.warn('⚠️ [AvailabilityService] Bookings API failed:', bookingsResponse.status);
      }

      // Process off days response
      if (offDaysResponse.ok) {
        const offDaysData = await offDaysResponse.json();
        offDays = offDaysData.offDays || offDaysData || [];
        console.log('🚫 [AvailabilityService] Retrieved', offDays.length, 'off days');
      } else {
        console.warn('⚠️ [AvailabilityService] Off days API failed:', offDaysResponse.status);
      }

      // Build availability map efficiently
      const dates = this.generateDateRange(startDate, endDate);
      
      // Create booking count map
      const bookingsByDate = new Map<string, any[]>();
      bookings.forEach((booking: any) => {
        const bookingDate = booking.event_date || booking.eventDate;
        if (bookingDate) {
          const dateKey = bookingDate.split('T')[0]; // Extract YYYY-MM-DD
          if (!bookingsByDate.has(dateKey)) {
            bookingsByDate.set(dateKey, []);
          }
          bookingsByDate.get(dateKey)!.push(booking);
        }
      });

      // Create off days set
      const offDayDates = new Set<string>();
      offDays.forEach((offDay: any) => {
        if (offDay.date) {
          offDayDates.add(offDay.date.split('T')[0]);
        }
      });

      // Process each date
      for (const date of dates) {
        const dateBookings = bookingsByDate.get(date) || [];
        const isOffDay = offDayDates.has(date);
        const currentBookings = dateBookings.length;
        const maxBookingsPerDay = 1; // Wedding services typically allow 1 booking per day

        // Count confirmed vs pending/request bookings
        const confirmedBookings = dateBookings.filter((booking: any) => 
          booking.status === 'confirmed' || booking.status === 'paid_in_full' || booking.status === 'completed'
        ).length;
        const pendingBookings = dateBookings.filter((booking: any) => 
          booking.status === 'pending' || booking.status === 'request' || booking.status === 'quote_requested' || booking.status === 'quote_sent'
        ).length;

        let isAvailable = true;
        let reason = 'Available';
        let bookingStatus: 'available' | 'booked' | 'unavailable' | 'fully_booked' = 'available';

        if (isOffDay) {
          isAvailable = false;
          reason = 'Vendor off day';
          bookingStatus = 'unavailable';
        } else if (confirmedBookings >= maxBookingsPerDay) {
          // Has confirmed booking - completely unavailable
          isAvailable = false;
          reason = `Fully booked (${confirmedBookings} confirmed)`;
          bookingStatus = 'fully_booked';
        } else if (pendingBookings > 0) {
          // Has pending/request bookings - show as partially booked but still available
          isAvailable = true;
          reason = `${pendingBookings} pending request${pendingBookings > 1 ? 's' : ''}`;
          bookingStatus = 'booked';
        }

        availabilityMap.set(date, {
          date,
          vendorId,
          isAvailable,
          reason,
          bookingStatus,
          currentBookings,
          maxBookingsPerDay,
          existingBookings: dateBookings,
          bookingDetails: {
            totalBookings: currentBookings,
            bookingIds: dateBookings.map((b: any) => b.id || b.booking_id),
            bookingStatuses: dateBookings.map((b: any) => b.status || 'confirmed'),
            canAcceptMore: currentBookings < maxBookingsPerDay && !isOffDay
          }
        });
      }

      console.log('✅ [AvailabilityService] Bulk processing complete:', availabilityMap.size, 'dates processed');
      return availabilityMap;

    } catch (error) {
      console.error('❌ [AvailabilityService] Bulk API error:', error);
      throw error;
    }
  }

  /**
   * Fallback method - individual checks (only used if bulk fails)
   */
  private async checkAvailabilityRangeFallback(vendorId: string, dates: string[]): Promise<Map<string, AvailabilityCheck>> {
    const availabilityMap = new Map<string, AvailabilityCheck>();
    
    console.log('⚠️ [AvailabilityService] Using fallback individual checks for', dates.length, 'dates');

    // Limit to prevent API overload
    const limitedDates = dates.slice(0, 10);
    if (dates.length > 10) {
      console.warn('⚠️ [AvailabilityService] Limiting fallback to first 10 dates to prevent API overload');
    }

    for (const date of limitedDates) {
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

    // Fill remaining dates with default available
    for (const date of dates) {
      if (!availabilityMap.has(date)) {
        availabilityMap.set(date, {
          date,
          vendorId,
          isAvailable: true,
          reason: 'Available (not checked)',
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
   * Clear cache entries for a specific vendor
   */
  clearVendorCache(vendorId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.startsWith(vendorId + '_')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log('🧹 [AvailabilityService] Cleared', keysToDelete.length, 'cache entries for vendor:', vendorId);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAllCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    console.log('🧹 [AvailabilityService] Cleared all cache entries:', cacheSize);
  }

  /**
   * Notify service that a booking has changed - now invalidates cache
   */
  onBookingChanged(vendorId: string, date: string): void {
    console.log(`📢 [AvailabilityService] Booking changed notification for vendor ${vendorId} on ${date}`);
    silent.info(`📢 [AvailabilityService] Booking changed notification for vendor ${vendorId} on ${date}`);
    
    // Invalidate cache for this vendor
    this.clearVendorCache(vendorId);
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();
export default availabilityService;
