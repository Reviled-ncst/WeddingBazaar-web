// Payment System Types for Wedding Bazaar
// Modular Payment Architecture

export interface PaymentBooking {
  id: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
  bookingReference?: string;
}

export interface PaymentAmount {
  amount: number;
  currency: string;
  currencySymbol: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'gcash' | 'paymaya' | 'grab_pay' | 'bank_transfer';
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
  processingTime?: string;
  fees?: string;
}

export interface PaymentState {
  step: 'select' | 'processing' | 'success' | 'error';
  selectedMethod: string;
  errorMessage: string;
  paymentIntent?: PayMongoPaymentIntent;
  source?: PayMongoSource;
}

export interface PayMongoPaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  statement_descriptor?: string;
  payment_method?: any;
  last_payment_error?: any;
  client_key?: string;
  next_action?: any;
}

export interface PayMongoSource {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status?: string;
  redirect?: {
    checkout_url: string;
    return_url: string;
  };
  billing?: any;
}

export interface PaymentConfiguration {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  environment: 'test' | 'live';
  currency: string;
  returnUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PayMongoPaymentIntent;
  source?: PayMongoSource;
  error?: string;
  reference?: string;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: PaymentBooking;
  paymentType: 'downpayment' | 'full_payment' | 'remaining_balance';
  amount: PaymentAmount;
  onPaymentSuccess: (paymentData: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

export interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
  amount: PaymentAmount;
  disabled?: boolean;
}

export interface PaymentProcessorProps {
  method: PaymentMethod;
  booking: PaymentBooking;
  amount: PaymentAmount;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export interface PaymentSummaryProps {
  booking: PaymentBooking;
  amount: PaymentAmount;
  paymentType: string;
  method?: PaymentMethod;
}

export interface PaymentStatusProps {
  state: PaymentState;
  booking: PaymentBooking;
  amount: PaymentAmount;
  onRetry: () => void;
  onClose: () => void;
}
