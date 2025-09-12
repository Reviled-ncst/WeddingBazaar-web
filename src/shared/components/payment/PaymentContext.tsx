import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { 
  PaymentState, 
  PaymentContextValue, 
  PaymentStep, 
  PaymentFormData,
  PaymentBooking,
  PaymentCurrency,
  PaymentType
} from './types';
import { paymongoService } from './paymongoService';

// Payment reducer
type PaymentAction = 
  | { type: 'SET_STEP'; payload: PaymentStep }
  | { type: 'SET_SELECTED_METHOD'; payload: string }
  | { type: 'SET_ERROR_MESSAGE'; payload: string }
  | { type: 'SET_IS_PROCESSING'; payload: boolean }
  | { type: 'SET_PAYMENT_INTENT'; payload: any }
  | { type: 'SET_PAYMENT_SOURCE'; payload: any }
  | { type: 'RESET_PAYMENT' };

const initialState: PaymentState = {
  step: 'select',
  selectedMethod: '',
  amount: 0,
  currency: { code: 'USD', symbol: '$', rate: 1 },
  booking: {
    id: '',
    vendorName: '',
    serviceType: '',
    eventDate: '',
    bookingReference: ''
  },
  paymentType: 'full_payment',
  isProcessing: false,
  errorMessage: '',
  paymentIntent: undefined,
  paymentSource: undefined
};

function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, errorMessage: '' };
    case 'SET_SELECTED_METHOD':
      return { ...state, selectedMethod: action.payload, errorMessage: '' };
    case 'SET_ERROR_MESSAGE':
      return { ...state, errorMessage: action.payload, isProcessing: false };
    case 'SET_IS_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_PAYMENT_INTENT':
      return { ...state, paymentIntent: action.payload };
    case 'SET_PAYMENT_SOURCE':
      return { ...state, paymentSource: action.payload };
    case 'RESET_PAYMENT':
      return {
        ...initialState,
        amount: state.amount,
        currency: state.currency,
        booking: state.booking,
        paymentType: state.paymentType
      };
    default:
      return state;
  }
}

// Create context
const PaymentContext = createContext<PaymentContextValue | undefined>(undefined);

// Payment provider props
interface PaymentProviderProps {
  children: React.ReactNode;
  booking: PaymentBooking;
  amount: number;
  currency: PaymentCurrency;
  paymentType: PaymentType;
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({
  children,
  booking,
  amount,
  currency,
  paymentType,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [state, dispatch] = useReducer(paymentReducer, {
    ...initialState,
    booking,
    amount,
    currency,
    paymentType
  });

  const setStep = useCallback((step: PaymentStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setSelectedMethod = useCallback((method: string) => {
    dispatch({ type: 'SET_SELECTED_METHOD', payload: method });
  }, []);

  const setErrorMessage = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR_MESSAGE', payload: error });
    onPaymentError?.(error);
  }, [onPaymentError]);

  const setIsProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_IS_PROCESSING', payload: processing });
  }, []);

  const resetPayment = useCallback(() => {
    dispatch({ type: 'RESET_PAYMENT' });
  }, []);

  const processPayment = useCallback(async (formData?: PaymentFormData) => {
    try {
      setIsProcessing(true);
      setErrorMessage('');

      console.log(`💳 Processing ${paymongoService.formatAmount(state.amount, state.currency)} payment via ${state.selectedMethod}`);
      console.log(`🔄 Currency: ${state.currency.code}, Amount: ${state.amount}`);

      // E-wallet payments (GCash, GrabPay, PayMaya)
      if (['gcash', 'grab_pay', 'paymaya'].includes(state.selectedMethod)) {
        const sourceData = {
          amount: state.amount,
          currency: state.currency.code,
          type: state.selectedMethod as 'gcash' | 'grab_pay' | 'paymaya',
          description: `Payment for ${state.booking.serviceType} - ${state.booking.bookingReference}`,
          billing: formData ? {
            name: formData.cardholderName,
            email: formData.email,
            phone: formData.phone
          } : undefined
        };

        const source = await paymongoService.createSource(sourceData);
        dispatch({ type: 'SET_PAYMENT_SOURCE', payload: source });

        if (source.attributes.redirect) {
          // Redirect to payment provider
          window.location.href = source.attributes.redirect.success;
        } else {
          throw new Error('No redirect URL provided by payment provider');
        }
      }
      
      // Card payments
      else if (state.selectedMethod === 'card') {
        if (!formData) {
          throw new Error('Card details are required for card payments');
        }

        const intentData = {
          amount: state.amount,
          currency: state.currency.code,
          description: `Payment for ${state.booking.serviceType} - ${state.booking.bookingReference}`,
          payment_method_allowed: ['card'],
          metadata: {
            booking_id: state.booking.id,
            booking_reference: state.booking.bookingReference,
            vendor_name: state.booking.vendorName
          }
        };

        const intent = await paymongoService.createPaymentIntent(intentData);
        dispatch({ type: 'SET_PAYMENT_INTENT', payload: intent });

        // For demo purposes, simulate successful payment
        // In production, you would use PayMongo's card processing
        setTimeout(() => {
          setStep('success');
          onPaymentSuccess?.(intent);
        }, 2000);
      }
      
      else {
        throw new Error(`Unsupported payment method: ${state.selectedMethod}`);
      }

    } catch (error: any) {
      console.error('Payment processing error:', error);
      setErrorMessage(error.message || 'Payment processing failed');
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  }, [state, onPaymentSuccess, setIsProcessing, setErrorMessage, setStep]);

  const contextValue: PaymentContextValue = {
    ...state,
    setStep,
    setSelectedMethod,
    setErrorMessage,
    setIsProcessing,
    resetPayment,
    processPayment
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// Hook to use payment context
export const usePayment = (): PaymentContextValue => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
