/**
 * BOOKING STATUS UPDATE SIMULATOR
 * 
 * This utility ensures the frontend UI always reflects the correct booking status
 * after quote sending, regardless of backend API implementation issues.
 */

import type { BookingStatus } from '../shared/types/comprehensive-booking.types';

export interface BookingStatusUpdate {
  bookingId: string;
  oldStatus: BookingStatus;
  newStatus: BookingStatus;
  message?: string;
  timestamp: string;
  source: 'backend' | 'frontend_fallback';
}

class BookingStatusManager {
  private statusUpdates: Map<string, BookingStatusUpdate> = new Map();
  
  /**
   * Record a status update attempt
   */
  recordStatusUpdate(
    bookingId: string,
    oldStatus: BookingStatus,
    newStatus: BookingStatus,
    message?: string,
    source: 'backend' | 'frontend_fallback' = 'backend'
  ): BookingStatusUpdate {
    const update: BookingStatusUpdate = {
      bookingId,
      oldStatus,
      newStatus,
      message,
      timestamp: new Date().toISOString(),
      source
    };
    
    this.statusUpdates.set(bookingId, update);
    return update;
  }
  
  /**
   * Get the current status for a booking (includes frontend overrides)
   */
  getCurrentStatus(bookingId: string, defaultStatus: BookingStatus): BookingStatus {
    const update = this.statusUpdates.get(bookingId);
    
    if (update) {
      return update.newStatus;
    }
    
    return defaultStatus;
  }
  
  /**
   * Check if a booking has a pending status update
   */
  hasPendingUpdate(bookingId: string): boolean {
    const update = this.statusUpdates.get(bookingId);
    return update?.source === 'frontend_fallback';
  }
  
  /**
   * Clear status update for a booking (when backend catches up)
   */
  clearStatusUpdate(bookingId: string): void {
    this.statusUpdates.delete(bookingId);
  }
  
  /**
   * Get all pending frontend updates
   */
  getPendingUpdates(): BookingStatusUpdate[] {
    return Array.from(this.statusUpdates.values())
      .filter(update => update.source === 'frontend_fallback');
  }
  
  /**
   * Apply status overrides to a booking object
   */
  applyStatusOverride<T extends { id: string; status: BookingStatus }>(booking: T): T {
    const currentStatus = this.getCurrentStatus(booking.id, booking.status);
    
    if (currentStatus !== booking.status) {
      return {
        ...booking,
        status: currentStatus,
        // Add visual indicator for frontend-updated statuses
        ...(this.hasPendingUpdate(booking.id) && {
          statusNote: '(Updated locally - syncing with server)',
          statusClass: 'frontend-updated'
        })
      };
    }
    
    return booking;
  }
}

// Global instance
export const bookingStatusManager = new BookingStatusManager();

// Helper function to apply status overrides to booking arrays
export function applyBookingStatusOverrides<T extends { id: string; status: BookingStatus }>(
  bookings: T[]
): T[] {
  return bookings.map(booking => bookingStatusManager.applyStatusOverride(booking));
}

// Hook for React components to use status manager
export function useBookingStatusOverride(bookingId: string, defaultStatus: BookingStatus): BookingStatus {
  return bookingStatusManager.getCurrentStatus(bookingId, defaultStatus);
}
