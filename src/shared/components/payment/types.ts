export interface PaymentCurrency {
  code: string;
  symbol: string;
  rate: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'card' | 'ewallet' | 'bank_transfer';
  description: string;
  enabled: boolean;
}

export interface PaymentBooking {
  id: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
  bookingReference: string;
}

export interface PayMongoSource {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    redirect: {
      success: string;
      failed: string;
    };
    type: 'gcash' | 'grab_pay' | 'paymaya';
    status: 'pending' | 'chargeable' | 'cancelled' | 'expired' | 'paid';
    billing?: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface PayMongoPaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    statement_descriptor: string;
    status: string;
    client_key: string;
    created_at: number;
    updated_at: number;
    last_payment_error?: any;
    payment_method_allowed: string[];
    payments: any[];
    next_action?: {
      type: string;
      redirect?: {
        url: string;
      };
    };
  };
}

export interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardholderName: string;
  email: string;
  phone: string;
}

export type PaymentStep = 'select' | 'form' | 'processing' | 'success' | 'error';
export type PaymentType = 'full_payment' | 'deposit';

export interface PaymentState {
  step: PaymentStep;
  selectedMethod: string;
  amount: number;
  currency: PaymentCurrency;
  booking: PaymentBooking;
  paymentType: PaymentType;
  isProcessing: boolean;
  errorMessage: string;
  paymentIntent?: PayMongoPaymentIntent;
  paymentSource?: PayMongoSource;
}

export interface PaymentContextValue extends PaymentState {
  setStep: (step: PaymentStep) => void;
  setSelectedMethod: (method: string) => void;
  setErrorMessage: (error: string) => void;
  setIsProcessing: (processing: boolean) => void;
  resetPayment: () => void;
  processPayment: (formData?: PaymentFormData) => Promise<void>;
}
