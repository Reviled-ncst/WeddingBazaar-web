/**
 * Transaction History Service
 * Fetches and manages payment receipt history for individual users (couples)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

export interface TransactionReceipt {
  id: string;
  bookingId: string;
  receiptNumber: string;
  paymentType: string;
  amount: number; // in centavos
  currency: string;
  paymentMethod: string;
  paymentIntentId: string;
  paidBy: string;
  paidByName: string;
  paidByEmail: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  vendorRating: number;
  serviceType: string;
  eventDate: string;
  eventLocation: string;
  bookingStatus: string;
  totalPaid: number;
  remainingBalance: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TransactionStatistics {
  totalSpent: number; // in centavos
  totalSpentFormatted: string;
  totalPayments: number;
  uniqueBookings: number;
  uniqueVendors: number;
  averagePayment: number;
  latestPayment: string;
  oldestPayment: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  receipts: TransactionReceipt[];
  statistics: TransactionStatistics;
  message?: string;
}

/**
 * Get all payment receipts for a user (transaction history)
 */
export async function getUserTransactionHistory(
  userId: string
): Promise<TransactionHistoryResponse> {
  console.log(`💳 [TransactionHistory] Fetching transaction history for user ${userId}...`);
  console.log(`🔗 [TransactionHistory] API URL: ${API_BASE_URL}/api/payment/receipts/user/${userId}`);
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/payment/receipts/user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log(`📡 [TransactionHistory] Response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch transaction history';
      try {
        const data = await response.json();
        errorMessage = data.error || errorMessage;
        console.error(`❌ [TransactionHistory] Error response:`, data);
      } catch {
        console.error(`❌ [TransactionHistory] Could not parse error response`);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`📄 [TransactionHistory] Response data:`, data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch transaction history');
    }
    
    console.log(`✅ [TransactionHistory] Retrieved ${data.receipts?.length || 0} transaction(s)`);
    console.log(`📊 [TransactionHistory] Total spent: ${data.statistics?.totalSpentFormatted || '₱0.00'}`);
    
    return {
      success: true,
      receipts: data.receipts || [],
      statistics: data.statistics || {
        totalSpent: 0,
        totalSpentFormatted: '₱0.00',
        totalPayments: 0,
        uniqueBookings: 0,
        uniqueVendors: 0,
        averagePayment: 0,
        latestPayment: new Date().toISOString(),
        oldestPayment: new Date().toISOString(),
      },
      message: data.message,
    };
  } catch (error) {
    console.error('❌ [TransactionHistory] Error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Network error: Unable to connect to payment service. Please check your internet connection.'
      );
    }
    
    throw error;
  }
}

/**
 * Format amount from centavos to PHP
 */
export function formatAmount(centavos: number): string {
  const php = centavos / 100;
  return `₱${php.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get payment method icon/label
 */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    card: 'Credit/Debit Card',
    gcash: 'GCash',
    paymaya: 'PayMaya',
    grab_pay: 'GrabPay',
    manual: 'Manual Payment',
  };
  return labels[method] || method;
}

/**
 * Get payment type badge color
 */
export function getPaymentTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    deposit: 'bg-blue-100 text-blue-700 border-blue-300',
    balance: 'bg-green-100 text-green-700 border-green-300',
    full: 'bg-purple-100 text-purple-700 border-purple-300',
    payment: 'bg-pink-100 text-pink-700 border-pink-300',
  };
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
}

/**
 * Get booking status badge color
 */
export function getBookingStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 border-green-300',
    paid_in_full: 'bg-blue-100 text-blue-700 border-blue-300',
    fully_paid: 'bg-blue-100 text-blue-700 border-blue-300',
    deposit_paid: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
}

/**
 * Group receipts by booking
 */
export function groupReceiptsByBooking(
  receipts: TransactionReceipt[]
): Map<string, TransactionReceipt[]> {
  const grouped = new Map<string, TransactionReceipt[]>();
  
  receipts.forEach((receipt) => {
    if (!grouped.has(receipt.bookingId)) {
      grouped.set(receipt.bookingId, []);
    }
    grouped.get(receipt.bookingId)!.push(receipt);
  });
  
  return grouped;
}

/**
 * Group receipts by date (month)
 */
export function groupReceiptsByMonth(
  receipts: TransactionReceipt[]
): Map<string, TransactionReceipt[]> {
  const grouped = new Map<string, TransactionReceipt[]>();
  
  receipts.forEach((receipt) => {
    const date = new Date(receipt.createdAt);
    const monthKey = date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
    });
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(receipt);
  });
  
  return grouped;
}

/**
 * Filter receipts by criteria
 */
export function filterReceipts(
  receipts: TransactionReceipt[],
  filters: {
    paymentMethod?: string;
    paymentType?: string;
    vendorName?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): TransactionReceipt[] {
  return receipts.filter((receipt) => {
    if (filters.paymentMethod && receipt.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (filters.paymentType && receipt.paymentType !== filters.paymentType) {
      return false;
    }
    if (
      filters.vendorName &&
      !receipt.vendorName.toLowerCase().includes(filters.vendorName.toLowerCase())
    ) {
      return false;
    }
    if (filters.dateFrom && new Date(receipt.createdAt) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(receipt.createdAt) > new Date(filters.dateTo)) {
      return false;
    }
    return true;
  });
}

/**
 * Sort receipts
 */
export function sortReceipts(
  receipts: TransactionReceipt[],
  sortBy: 'date' | 'amount' | 'vendor',
  order: 'asc' | 'desc' = 'desc'
): TransactionReceipt[] {
  const sorted = [...receipts];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'vendor':
        comparison = a.vendorName.localeCompare(b.vendorName);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}
