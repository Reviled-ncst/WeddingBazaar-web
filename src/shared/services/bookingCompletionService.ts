/**
 * 🎉 Booking Completion Service
 * Handles two-sided completion system for bookings
 * Both vendor and couple must mark as completed for final completion
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface CompletionStatus {
  booking_id: string;
  status: string;
  vendor_completed: boolean;
  vendor_completed_at: string | null;
  couple_completed: boolean;
  couple_completed_at: string | null;
  both_completed: boolean;
  completion_notes: string | null;
  waiting_for: 'vendor' | 'couple' | 'both' | null;
}

/**
 * Mark booking as completed from vendor or couple side
 */
export const markBookingCompleted = async (
  bookingId: string,
  completedBy: 'vendor' | 'couple',
  notes?: string
): Promise<{
  success: boolean;
  message?: string;
  booking?: any;
  waiting_for?: 'vendor' | 'couple' | null;
  error?: string;
}> => {
  try {
    console.log(`🎉 [CompletionService] Marking booking ${bookingId} as completed by ${completedBy}`);

    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/mark-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed_by: completedBy,
        notes: notes || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [CompletionService] Error:`, data.error);
      throw new Error(data.error || 'Failed to mark booking as completed');
    }

    console.log(`✅ [CompletionService] Success:`, data.message);
    console.log(`📊 [CompletionService] Both completed:`, data.booking.both_completed);
    console.log(`⏳ [CompletionService] Waiting for:`, data.waiting_for);

    return data;
  } catch (error) {
    console.error('❌ [CompletionService] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark booking as completed'
    };
  }
};

/**
 * Get completion status of a booking
 */
export const getCompletionStatus = async (
  bookingId: string
): Promise<{
  success: boolean;
  completion_status?: CompletionStatus;
  error?: string;
}> => {
  try {
    console.log(`🔍 [CompletionService] Getting completion status for ${bookingId}`);

    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/completion-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get completion status');
    }

    console.log(`✅ [CompletionService] Completion status:`, data.completion_status);

    return data;
  } catch (error) {
    console.error('❌ [CompletionService] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get completion status'
    };
  }
};

/**
 * Unmark completion (admin or error correction)
 */
export const unmarkCompletion = async (
  bookingId: string,
  unmarkBy: 'vendor' | 'couple' | 'both',
  reason: string
): Promise<{
  success: boolean;
  message?: string;
  booking?: any;
  error?: string;
}> => {
  try {
    console.log(`🔄 [CompletionService] Unmarking completion for ${bookingId} by ${unmarkBy}`);

    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/unmark-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        unmark_by: unmarkBy,
        reason
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to unmark completion');
    }

    console.log(`✅ [CompletionService] Unmarked successfully`);

    return data;
  } catch (error) {
    console.error('❌ [CompletionService] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unmark completion'
    };
  }
};

/**
 * Helper: Check if user can mark booking as completed
 */
export const canMarkAsCompleted = (
  booking: any,
  userRole: 'vendor' | 'couple'
): {
  can: boolean;
  reason?: string;
  alreadyMarked?: boolean;
} => {
  // Check if booking is fully paid
  const paidStatuses = ['paid_in_full', 'fully_paid', 'completed'];
  if (!paidStatuses.includes(booking.status)) {
    return {
      can: false,
      reason: 'Booking must be fully paid before marking as completed'
    };
  }

  // Check if already marked by this user
  if (userRole === 'vendor' && booking.vendor_completed) {
    return {
      can: false,
      reason: 'You have already marked this booking as completed. Waiting for couple confirmation.',
      alreadyMarked: true
    };
  }

  if (userRole === 'couple' && booking.couple_completed) {
    return {
      can: false,
      reason: 'You have already marked this booking as completed. Waiting for vendor confirmation.',
      alreadyMarked: true
    };
  }

  // All checks passed
  return {
    can: true
  };
};

/**
 * Helper: Get completion status message
 */
export const getCompletionMessage = (booking: any): string => {
  if (booking.vendor_completed && booking.couple_completed) {
    return '✅ Completed by both parties';
  }
  
  if (booking.vendor_completed && !booking.couple_completed) {
    return '⏳ Vendor marked as completed. Waiting for couple confirmation.';
  }
  
  if (!booking.vendor_completed && booking.couple_completed) {
    return '⏳ Couple marked as completed. Waiting for vendor confirmation.';
  }
  
  return '⏳ Pending completion confirmation from both parties';
};
