/**
 * Booking Completion Service
 * Two-sided completion system: both vendor and couple must confirm
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

// Completion proof file interface
export interface CompletionProofFile {
  url: string;
  publicId: string;
  uploadedAt: string;
  fileType: string;
  size: number;
  duration?: number; // For videos
  description?: string;
}

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
  // NEW: Completion proof fields
  vendorCompletionProof?: CompletionProofFile[];
  coupleCompletionProof?: CompletionProofFile[];
  vendorCompletionNotes?: string;
  coupleCompletionNotes?: string;
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
 * NOW WITH COMPLETION PROOF SUPPORT
 */
export async function markBookingComplete(
  bookingId: string,
  completedBy: 'vendor' | 'couple',
  completionProof?: CompletionProofFile[], // NEW: Optional completion proof
  completionNotes?: string // NEW: Optional notes
): Promise<CompletionResponse> {
  try {
    console.log(`📋 [CompletionService] Marking booking ${bookingId} complete by ${completedBy}`);

    const payload: Record<string, unknown> = {
      completed_by: completedBy,
    };

    // Add completion proof if provided
    if (completionProof && completionProof.length > 0) {
      if (completedBy === 'vendor') {
        payload.vendor_completion_proof = completionProof;
      } else {
        payload.couple_completion_proof = completionProof;
      }
      console.log(`📸 [CompletionService] Uploading ${completionProof.length} proof files`);
    }

    // Add notes if provided
    if (completionNotes) {
      if (completedBy === 'vendor') {
        payload.vendor_completion_notes = completionNotes;
      } else {
        payload.couple_completion_notes = completionNotes;
      }
      console.log(`📝 [CompletionService] Adding completion notes`);
    }

    const response = await fetch(`${API_URL}/api/bookings/${bookingId}/mark-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [CompletionService] Failed to mark complete:', data.error);
      throw new Error(data.error || data.message || 'Failed to mark booking as completed');
    }

    const backendBooking = data.booking;
    
    // Check if response is already in camelCase
    const alreadyCamelCase = backendBooking.vendorCompleted !== undefined;
    
    const completionStatus: CompletionStatus = alreadyCamelCase ? {
      vendorCompleted: backendBooking.vendorCompleted,
      vendorCompletedAt: backendBooking.vendorCompletedAt,
      coupleCompleted: backendBooking.coupleCompleted,
      coupleCompletedAt: backendBooking.coupleCompletedAt,
      fullyCompleted: backendBooking.fullyCompleted,
      fullyCompletedAt: backendBooking.fullyCompletedAt,
      currentStatus: backendBooking.status,
      canComplete: !backendBooking.fullyCompleted,
      waitingFor: data.waiting_for || data.waitingFor,
      // NEW: Include completion proof
      vendorCompletionProof: backendBooking.vendorCompletionProof || [],
      coupleCompletionProof: backendBooking.coupleCompletionProof || [],
      vendorCompletionNotes: backendBooking.vendorCompletionNotes,
      coupleCompletionNotes: backendBooking.coupleCompletionNotes,
    } : {
      vendorCompleted: backendBooking.vendor_completed,
      vendorCompletedAt: backendBooking.vendor_completed_at,
      coupleCompleted: backendBooking.couple_completed,
      coupleCompletedAt: backendBooking.couple_completed_at,
      fullyCompleted: backendBooking.fully_completed,
      fullyCompletedAt: backendBooking.fully_completed_at,
      currentStatus: backendBooking.status,
      canComplete: !backendBooking.fully_completed,
      waitingFor: data.waiting_for,
      // NEW: Include completion proof
      vendorCompletionProof: backendBooking.vendor_completion_proof || [],
      coupleCompletionProof: backendBooking.couple_completion_proof || [],
      vendorCompletionNotes: backendBooking.vendor_completion_notes,
      coupleCompletionNotes: backendBooking.couple_completion_notes,
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

    // Support both camelCase (new backend) and snake_case (old backend)
    const status = data.completionStatus || data.completion_status;
    
    if (!status) {
      console.error('❌ [CompletionService] No completion status in response');
      return null;
    }

    // If already in camelCase, use directly
    if (status.vendorCompleted !== undefined) {
      console.log('✅ [CompletionService] Using camelCase format:', status);
      return status;
    }

    // Otherwise map from snake_case to camelCase
    const mapped: CompletionStatus = {
      vendorCompleted: status.vendor_completed,
      vendorCompletedAt: status.vendor_completed_at,
      coupleCompleted: status.couple_completed,
      coupleCompletedAt: status.couple_completed_at,
      fullyCompleted: status.fully_completed,
      fullyCompletedAt: status.fully_completed_at,
      currentStatus: status.status,
      canComplete: !status.fully_completed,
      waitingFor: status.waiting_for,
    };

    console.log('✅ [CompletionService] Mapped from snake_case:', mapped);
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
  console.log('🔍 [canMarkComplete] Checking if user can mark complete:', {
    bookingId: booking.id,
    bookingStatus: booking.status,
    userRole,
    completionStatus,
    fullyCompleted: completionStatus?.fullyCompleted,
    vendorCompleted: completionStatus?.vendorCompleted,
    coupleCompleted: completionStatus?.coupleCompleted
  });

  // If already fully completed, can't mark again
  if (completionStatus?.fullyCompleted || booking.status === 'completed') {
    console.log('❌ [canMarkComplete] Already fully completed');
    return false;
  }

  // Must be fully paid or in completion process
  const validStatuses = ['paid_in_full', 'fully_paid', 'deposit_paid'];
  if (!validStatuses.includes(booking.status)) {
    console.log('❌ [canMarkComplete] Invalid status. Status:', booking.status, 'Valid:', validStatuses);
    return false;
  }

  // Check if this user has already marked complete
  if (userRole === 'vendor' && completionStatus?.vendorCompleted) {
    console.log('❌ [canMarkComplete] Vendor already marked complete');
    return false;
  }

  if (userRole === 'couple' && completionStatus?.coupleCompleted) {
    console.log('❌ [canMarkComplete] Couple already marked complete');
    return false;
  }

  console.log('✅ [canMarkComplete] User CAN mark complete');
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
