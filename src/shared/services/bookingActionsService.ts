/**
 * Booking Actions Service
 * Handles receipt viewing, cancellation, and other booking actions
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface Receipt {
  id: string;
  bookingId: string;
  receiptNumber: string;
  paymentType: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentIntentId: string;
  paidBy: string;
  paidByName: string;
  paidByEmail: string;
  vendorId: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
  totalPaid: number;
  remainingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface CancelBookingRequest {
  userId: string;
  reason?: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  bookingId: string;
  newStatus: string;
  requiresApproval?: boolean;
}

/**
 * Get all receipts for a booking
 */
export async function getBookingReceipts(bookingId: string): Promise<Receipt[]> {
  console.log(`📄 [BookingActions] Fetching receipts for booking ${bookingId}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/receipts/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch receipts');
    }
    
    console.log(`✅ [BookingActions] Retrieved ${data.receipts.length} receipt(s)`);
    return data.receipts;
    
  } catch (error) {
    console.error('❌ [BookingActions] Error fetching receipts:', error);
    throw error;
  }
}

/**
 * Cancel a booking directly (only for 'request' or 'quote_requested' status)
 */
export async function cancelBooking(
  bookingId: string, 
  request: CancelBookingRequest
): Promise<CancelBookingResponse> {
  console.log(`🚫 [BookingActions] Cancelling booking ${bookingId}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to cancel booking');
    }
    
    console.log(`✅ [BookingActions] Booking cancelled:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ [BookingActions] Error cancelling booking:', error);
    throw error;
  }
}

/**
 * Request cancellation for a booking (requires approval)
 */
export async function requestCancellation(
  bookingId: string, 
  request: CancelBookingRequest
): Promise<CancelBookingResponse> {
  console.log(`📝 [BookingActions] Requesting cancellation for booking ${bookingId}...`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/request-cancellation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to request cancellation');
    }
    
    console.log(`✅ [BookingActions] Cancellation request submitted:`, data);
    return data;
    
  } catch (error) {
    console.error('❌ [BookingActions] Error requesting cancellation:', error);
    throw error;
  }
}

/**
 * Format receipt for display
 */
export function formatReceipt(receipt: Receipt): string {
  const amount = (receipt.amount / 100).toFixed(2);
  const totalPaid = (receipt.totalPaid / 100).toFixed(2);
  const remaining = (receipt.remainingBalance / 100).toFixed(2);
  const date = new Date(receipt.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
WEDDING BAZAAR RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt #: ${receipt.receiptNumber}
Date: ${date}

PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Vendor: ${receipt.vendorName}
Service: ${receipt.serviceType}
Event Date: ${new Date(receipt.eventDate).toLocaleDateString()}

Payment Type: ${receipt.paymentType.toUpperCase()}
Amount: ₱${amount}
Method: ${receipt.paymentMethod}

CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${receipt.paidByName}
Email: ${receipt.paidByEmail}

PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Paid: ₱${totalPaid}
Remaining Balance: ₱${remaining}

Transaction ID: ${receipt.paymentIntentId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for choosing Wedding Bazaar!
  `.trim();
}
