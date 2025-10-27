/**
 * Booking Completion Service
 * Two-sided completion system: both vendor and couple must confirm
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface CompletionStatus {
  vendorCompleted: boolean;
  vendorCompletedAt?: string;
  coupleCompleted: boolean;
  coupleCompletedAt?: string;
  fullyCompleted: boolean;
  fullyCompletedAt?: string;
  currentStatus: string;
  canComplete: boolean;
  waitingFor?: 'vendor' | 'couple';
}

export interface CompletionResponse {
  success: boolean;
  message: string;
  booking?: any;
  completionStatus: CompletionStatus;
  error?: string;
}

/**
 * Mark booking as completed from vendor or couple side
 */
export async function markBookingComplete(
  bookingId: string,
  completedBy: 'vendor' | 'couple'
): Promise<CompletionResponse> {
  try {
    console.log(`📋 [CompletionService] Marking booking ${bookingId} complete by ${completedBy}`);

    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/mark-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed_by: completedBy }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [CompletionService] Failed to mark complete:', data.error);
      throw new Error(data.error || data.message || 'Failed to mark booking as completed');
    }

    // Map backend response to frontend format
    const backendBooking = data.booking;
    const completionStatus: CompletionStatus = {
      vendorCompleted: backendBooking.vendor_completed,
      vendorCompletedAt: backendBooking.vendor_completed_at,
      coupleCompleted: backendBooking.couple_completed,
      coupleCompletedAt: backendBooking.couple_completed_at,
      fullyCompleted: backendBooking.fully_completed,
      fullyCompletedAt: backendBooking.fully_completed_at,
      currentStatus: backendBooking.status,
      canComplete: !backendBooking.fully_completed,
      waitingFor: data.waiting_for,
    };

    console.log('✅ [CompletionService] Booking completion updated:', completionStatus);
    
    return {
      success: true,
      message: data.message,
      booking: backendBooking,
      completionStatus,
    };

  } catch (error: any) {
    console.error('❌ [CompletionService] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to mark booking as completed',
      error: error.message,
      completionStatus: {
        vendorCompleted: false,
        coupleCompleted: false,
        fullyCompleted: false,
        currentStatus: 'unknown',
        canComplete: false,
      },
    };
  }
}

/**
 * Get completion status for a booking
 */
export async function getCompletionStatus(bookingId: string): Promise<CompletionStatus | null> {
  try {
    console.log(`📋 [CompletionService] Fetching completion status for ${bookingId}`);

    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/completion-status`);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [CompletionService] Failed to fetch status:', data.error);
      return null;
    }

    // Backend returns snake_case, map to camelCase
    const backendStatus = data.completion_status;
    const mapped: CompletionStatus = {
      vendorCompleted: backendStatus.vendor_completed,
      vendorCompletedAt: backendStatus.vendor_completed_at,
      coupleCompleted: backendStatus.couple_completed,
      coupleCompletedAt: backendStatus.couple_completed_at,
      fullyCompleted: backendStatus.fully_completed,
      fullyCompletedAt: backendStatus.fully_completed_at,
      currentStatus: backendStatus.status,
      canComplete: !backendStatus.fully_completed,
      waitingFor: backendStatus.waiting_for,
    };

    console.log('✅ [CompletionService] Completion status:', mapped);
    return mapped;

  } catch (error: any) {
    console.error('❌ [CompletionService] Error fetching status:', error);
    return null;
  }
}

/**
 * Check if user can mark booking as complete
 */
export function canMarkComplete(
  booking: any,
  userRole: 'vendor' | 'couple',
  completionStatus?: CompletionStatus
): boolean {
  // If already fully completed, can't mark again
  if (completionStatus?.fullyCompleted || booking.status === 'completed') {
    return false;
  }

  // Must be fully paid or in completion process
  const validStatuses = ['paid_in_full', 'fully_paid', 'deposit_paid'];
  if (!validStatuses.includes(booking.status)) {
    return false;
  }

  // Check if this user has already marked complete
  if (userRole === 'vendor' && completionStatus?.vendorCompleted) {
    return false;
  }

  if (userRole === 'couple' && completionStatus?.coupleCompleted) {
    return false;
  }

  return true;
}

/**
 * Get completion button text based on status
 */
export function getCompletionButtonText(
  userRole: 'vendor' | 'couple',
  completionStatus?: CompletionStatus
): string {
  if (!completionStatus) {
    return 'Mark as Complete';
  }

  if (completionStatus.fullyCompleted) {
    return 'Completed ✓';
  }

  if (userRole === 'vendor') {
    if (completionStatus.vendorCompleted) {
      return 'Waiting for Couple...';
    }
    if (completionStatus.coupleCompleted) {
      return 'Confirm Completion';
    }
    return 'Mark as Complete';
  } else {
    if (completionStatus.coupleCompleted) {
      return 'Waiting for Vendor...';
    }
    if (completionStatus.vendorCompleted) {
      return 'Confirm Completion';
    }
    return 'Mark as Complete';
  }
}

/**
 * Get completion button variant (color) based on status
 */
export function getCompletionButtonVariant(
  userRole: 'vendor' | 'couple',
  completionStatus?: CompletionStatus
): 'success' | 'warning' | 'info' {
  if (!completionStatus) {
    return 'success';
  }

  if (completionStatus.fullyCompleted) {
    return 'success';
  }

  const otherPartyCompleted = userRole === 'vendor' 
    ? completionStatus.coupleCompleted 
    : completionStatus.vendorCompleted;

  if (otherPartyCompleted) {
    return 'warning'; // Urgent - waiting for you
  }

  const currentUserCompleted = userRole === 'vendor'
    ? completionStatus.vendorCompleted
    : completionStatus.coupleCompleted;

  if (currentUserCompleted) {
    return 'info'; // Already marked by you
  }

  return 'success'; // Ready to mark
}
