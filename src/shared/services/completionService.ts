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

    console.log('✅ [CompletionService] Booking completion updated:', data.completionStatus);
    return data;

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

    console.log('✅ [CompletionService] Completion status:', data.completionStatus);
    return data.completionStatus;

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
  // Must be fully paid
  if (!['paid_in_full', 'fully_paid'].includes(booking.status)) {
    return false;
  }

  // If already fully completed, can't mark again
  if (completionStatus?.fullyCompleted) {
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
