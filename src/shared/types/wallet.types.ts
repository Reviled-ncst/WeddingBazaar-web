// ============================================================================
// Wedding Bazaar - Vendor Wallet System Types
// ============================================================================
// TypeScript interfaces for vendor wallet and earnings management
// Integrated with PayMongo payment system
// ============================================================================

export interface WalletTransaction {
  id: string;
  receipt_id: string;
  receipt_number: string;
  booking_id: string;
  booking_reference: string;
  
  // Transaction Details
  transaction_type: 'earning' | 'withdrawal' | 'refund' | 'adjustment';
  transaction_date: string; // ISO date string
  
  // Amounts (in centavos for precision)
  amount: number; // Amount in centavos (₱100.00 = 10000)
  currency: string; // 'PHP', 'USD', etc.
  
  // Payment Details
  payment_method: 'card' | 'gcash' | 'paymaya' | 'grab_pay' | 'bank_transfer';
  payment_type: 'deposit' | 'balance' | 'full_payment';
  paymongo_payment_id?: string;
  paymongo_source_id?: string;
  
  // Booking Information
  service_name: string;
  service_category: string;
  event_date: string;
  event_location?: string;
  
  // Customer Information
  couple_id: string;
  couple_name?: string;
  couple_email?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorWallet {
  vendor_id: string;
  vendor_name: string;
  business_name: string;
  
  // Balance Information (in centavos)
  total_earnings: number; // All-time earnings
  available_balance: number; // Available for withdrawal
  pending_balance: number; // Pending completion confirmation
  withdrawn_amount: number; // Total withdrawn
  
  // Currency
  currency: string;
  currency_symbol: string;
  
  // Statistics
  total_transactions: number;
  completed_bookings: number;
  pending_bookings: number;
  
  // Timestamps
  last_transaction_date?: string;
  last_withdrawal_date?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletSummary {
  // Current Period (This Month)
  current_month_earnings: number;
  current_month_bookings: number;
  
  // Previous Period (Last Month)
  previous_month_earnings: number;
  previous_month_bookings: number;
  
  // Growth Metrics
  earnings_growth_percentage: number;
  bookings_growth_percentage: number;
  
  // Top Service Category
  top_category: string;
  top_category_earnings: number;
  
  // Average Transaction
  average_transaction_amount: number;
}

export interface WithdrawalRequest {
  id: string;
  vendor_id: string;
  amount: number; // In centavos
  currency: string;
  
  // Withdrawal Method
  withdrawal_method: 'bank_transfer' | 'gcash' | 'paymaya' | 'check';
  
  // Bank Details (for bank transfer)
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  
  // E-Wallet Details
  ewallet_number?: string;
  ewallet_name?: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  
  // Processing Details
  processed_by?: string;
  processed_at?: string;
  rejection_reason?: string;
  
  // References
  transaction_reference?: string;
  paymongo_transfer_id?: string;
  
  // Timestamps
  requested_at: string;
  completed_at?: string;
  
  // Notes
  notes?: string;
  admin_notes?: string;
}

export interface EarningsBreakdown {
  category: string;
  earnings: number;
  transactions: number;
  percentage: number;
}

export interface MonthlyEarnings {
  month: string; // 'YYYY-MM'
  year: number;
  month_number: number;
  month_name: string;
  earnings: number;
  transactions: number;
  average_transaction: number;
}

export interface WalletFilters {
  start_date?: string;
  end_date?: string;
  transaction_type?: WalletTransaction['transaction_type'];
  status?: WalletTransaction['status'];
  payment_method?: WalletTransaction['payment_method'];
  service_category?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface WalletResponse {
  success: boolean;
  wallet?: VendorWallet;
  transactions?: WalletTransaction[];
  summary?: WalletSummary;
  breakdown?: EarningsBreakdown[];
  monthly_earnings?: MonthlyEarnings[];
  error?: string;
  message?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  withdrawal?: WithdrawalRequest;
  new_balance?: number;
  error?: string;
  message?: string;
}

// Helper function to format centavos to currency
export const formatCentavos = (centavos: number, currency: string = 'PHP'): string => {
  const amount = centavos / 100;
  const currencySymbol = currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : currency;
  return `${currencySymbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Helper function to parse currency to centavos
export const parseToCentavos = (amount: number | string): number => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(numAmount * 100);
};

// Helper function to calculate growth percentage
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get month name
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '';
};
