export type PaymentType = 'downpayment' | 'full_payment' | 'remaining_balance';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'gcash' | 'paymaya' | 'credit_card';

export interface PaymentInfo {
  bookingId: string;
  paymentType: PaymentType;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentModalState {
  isOpen: boolean;
  booking: any; // We'll import Booking from booking types
  paymentType: PaymentType;
  loading: boolean;
}

export interface PaymentRequest {
  bookingId: string;
  paymentType: PaymentType;
  amount: number;
  description: string;
}

export interface PaymentMethodType {
  id: string;
  type: 'gcash' | 'paymaya' | 'credit_card' | 'bank_transfer';
  name: string;
  icon: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  message?: string;
  error?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  bookingId: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  issuedDate: string;
  receiptUrl?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
    issuedDate: string;
  };
  lineItems?: {
    service: {
      description: string;
      category: string;
      eventDate: string;
      venue?: string;
      amount: number;
    };
    payment: {
      type: string;
      method: string;
      amount: number;
    };
    breakdown: Array<{
      description: string;
      amount: number;
      type: 'service' | 'tax' | 'fee';
    }>;
    vendor: {
      name: string;
      businessName?: string;
      email: string;
    };
    totals: {
      subtotal: number;
      taxes: number;
      fees: number;
      total: number;
    };
  };
  // Legacy fields for backward compatibility
  referenceNumber?: string;
  createdAt?: string;
  processedAt?: string;
  notes?: string;
}
