import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Building,
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  ArrowLeft,
  X,
  Zap,
  QrCode
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { paymongoService } from '../services/payment/paymongoService';
import { paymentWebhookHandler } from '../../services/paymentWebhookHandler';
import QRCodeDisplay from './payment/QRCodeDisplay';
import type { PaymentWebhookData } from '../../services/paymentWebhookHandler';

// Local type definitions for payment state
interface PayMongoPaymentIntent {
  id: string;
  type: string;
  attributes: any;
}

interface PayMongoSource {
  id: string;
  checkout_url?: string;
  status: string;
}

export interface PayMongoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    vendorName: string;
    serviceType: string;
    eventDate: string;
    bookingReference?: string;
  };
  paymentType: 'downpayment' | 'full_payment' | 'remaining_balance';
  amount: number; // amount in the specified currency
  currency?: string; // currency code (defaults to PHP)
  currencySymbol?: string; // currency symbol for display
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'gcash' | 'paymaya' | 'grab_pay' | 'bank_transfer';
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

export const PayMongoPaymentModal: React.FC<PayMongoPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  paymentType,
  amount,
  currency = 'PHP',
  currencySymbol = '₱',
  onPaymentSuccess,
  onPaymentError,
}) => {
  console.log('💳 PayMongoPaymentModal rendered with props:', {
    isOpen,
    amount,
    currency,
    paymentType,
    hasSuccessCallback: !!onPaymentSuccess,
    bookingId: booking?.id,
    vendorName: booking?.vendorName
  });
  
  console.log('💳 PayMongoPaymentModal state check:', {
    isModalOpen: isOpen,
    willRender: isOpen ? 'YES' : 'NO'
  });
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'card_form' | 'processing' | 'qr_code' | 'redirect' | 'bank_transfer_instructions' | 'success' | 'error'>('select');
  const [paymentIntent, setPaymentIntent] = useState<PayMongoPaymentIntent | null>(null);
  const [source, setSource] = useState<PayMongoSource | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingTime, setProcessingTime] = useState(0);

  // Card form state
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');
  const [successCallbackCalled, setSuccessCallbackCalled] = useState(false);

  // Progress tracking state
  const [currentProgress, setCurrentProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [showProgress, setShowProgress] = useState(false);

  // Define payment flow steps for progress tracking
  const paymentSteps = [
    { step: 1, title: 'Payment Method', description: 'Choose your preferred payment option' },
    { step: 2, title: 'Payment Details', description: 'Enter payment information' },
    { step: 3, title: 'Processing', description: 'Securely processing your payment' },
    { step: 4, title: 'Confirmation', description: 'Payment completed successfully' }
  ];

  // Update progress based on payment step
  useEffect(() => {
    console.log('🔄 Payment step changed to:', paymentStep);
    switch (paymentStep) {
      case 'select':
        setCurrentProgress(1);
        setProgressMessage('Choose your payment method');
        setShowProgress(true);
        console.log('📍 Progress: Step 1 - Payment Method Selection');
        break;
      case 'card_form':
      case 'redirect':
        setCurrentProgress(2);
        setProgressMessage('Enter your payment details');
        setShowProgress(true);
        console.log('📍 Progress: Step 2 - Payment Details');
        break;
      case 'processing':
        setCurrentProgress(3);
        setProgressMessage('Processing your payment securely...');
        setShowProgress(true);
        console.log('📍 Progress: Step 3 - Processing Payment');
        break;
      case 'qr_code':
        setCurrentProgress(3);
        setProgressMessage('Scan QR code to complete payment');
        setShowProgress(true);
        console.log('📍 Progress: Step 3 - QR Code Payment');
        break;
      case 'success':
        setCurrentProgress(4);
        setProgressMessage('Payment completed successfully!');
        setShowProgress(true);
        console.log('📍 Progress: Step 4 - Payment Success');
        break;
      case 'error':
        setShowProgress(false);
        console.log('📍 Progress: Hidden due to error');
        break;
      default:
        setShowProgress(false);
        console.log('📍 Progress: Hidden (unknown step)');
    }
  }, [paymentStep]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setLoading(false);
      setPaymentStep('select');
      setPaymentIntent(null);
      setSource(null);
      setRedirectUrl('');
      setErrorMessage('');
      setProcessingTime(0);
      setSuccessCallbackCalled(false);
    }
  }, [isOpen]);

  // Set up webhook listener for real-time payment updates
  useEffect(() => {
    if (!isOpen) return;

    const handlePaymentUpdate = (data: PaymentWebhookData) => {
      console.log('📡 Received real-time payment update:', data);
      
      // Check if this update is for our current source
      if (source?.id && data.sourceId === source.id) {
        if (data.status === 'paid') {
          console.log('🎉 Real-time payment success detected!');
          
          const paymentData = {
            source_id: data.sourceId,
            payment_id: data.paymentId,
            amount: data.amount,
            currency: data.currency,
            status: 'succeeded',
            payment_method: selectedMethod,
            original_currency: currency,
            original_amount: amount,
            display_amount: formatAmount(amount),
            transaction_id: data.paymentId,
          };
          
          if (!successCallbackCalled) {
            setSuccessCallbackCalled(true);
            onPaymentSuccess(paymentData);
            console.log('✅ Success callback called from webhook');
          }
          
          setPaymentStep('success');
          setLoading(false);
        } else if (data.status === 'failed') {
          console.log('❌ Real-time payment failure detected');
          setErrorMessage('Payment failed. Please try again.');
          setPaymentStep('error');
          setLoading(false);
          onPaymentError('Payment failed');
        }
      }
    };

    // Set up browser event listener for webhook updates
    const cleanup = paymentWebhookHandler.setupBrowserListener(handlePaymentUpdate);

    return cleanup;
  }, [isOpen, source?.id, selectedMethod, successCallbackCalled, currency, amount, onPaymentSuccess, onPaymentError]);

  // Auto-increment processing time for better UX
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === 'processing') {
      interval = setInterval(() => {
        setProcessingTime(prev => prev + 1);
      }, 1000);
    } else {
      setProcessingTime(0);
    }
    return () => clearInterval(interval);
  }, [paymentStep]);

  // Enhanced close handler with state reset
  const handleClose = () => {
    if (paymentStep === 'processing') {
      // Don't allow closing during processing
      return;
    }
    
    // Reset all state
    setSelectedMethod('');
    setLoading(false);
    setPaymentStep('select');
    setPaymentIntent(null);
    setSource(null);
    setRedirectUrl('');
    setErrorMessage('');
    setProcessingTime(0);
    
    onClose();
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setPaymentStep('select');
      setProcessingTime(0);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Customer details - In production, get from auth context
  // const customerInfo = {
  //   name: 'Wedding Customer', // In production: get from user profile
  //   email: 'customer@weddingbazaar.com', // In production: get from authenticated user
  //   phone: '+639171234567' // In production: get from user profile or input
  // };

  // Format amount with proper currency
  const formatAmount = (amt: number) => {
    if (currency === 'PHP') {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(amt);
    } else {
      return `${currencySymbol}${amt.toFixed(2)}`;
    }
  };

  // Card utility functions
  const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/);
    if (!match) return cleaned;
    
    const [, group1, group2, group3, group4] = match;
    let formatted = group1;
    if (group2) formatted += ` ${group2}`;
    if (group3) formatted += ` ${group3}`;
    if (group4) formatted += ` ${group4}`;
    return formatted;
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateCard = (form: typeof cardForm): boolean => {
    const cleanNumber = form.number.replace(/\s/g, '');
    return (
      cleanNumber.length >= 13 &&
      form.expiry.length === 5 &&
      form.cvc.length >= 3 &&
      form.name.trim().length > 0
    );
  };

  const handleCardInputChange = (field: keyof typeof cardForm, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
      setCardType(detectCardType(value));
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardForm(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleCardSubmit = async () => {
    if (!validateCard(cardForm)) {
      setErrorMessage('Please fill in all card details correctly');
      return;
    }

    setLoading(true);
    setPaymentStep('processing');

    try {
      console.log('💳 Processing card payment via backend...');
      
      // Prepare card details for backend
      const cardDetails = {
        number: cardForm.number.replace(/\s/g, ''), // Remove spaces
        expiry: cardForm.expiry,
        cvc: cardForm.cvc,
        name: cardForm.name
      };
      
      // Use the specific card payment method that calls our backend
      const paymentResult = await paymongoService.createCardPayment(
        booking.id,
        amount,
        paymentType,
        cardDetails
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Card payment failed');
      }

      console.log('✅ Card payment processed successfully:', paymentResult);
      setPaymentStep('success');
      
      onPaymentSuccess({
        payment: paymentResult,
        paymentIntent: paymentResult.paymentIntent,
        amount: amount,
        currency: currency,
        method: 'card',
        status: 'succeeded',
        transactionId: paymentResult.paymentId || `card_${Date.now()}`,
        formattedAmount: formatAmount(amount)
      });

    } catch (error: any) {
      console.error('Card payment error:', error);
      setErrorMessage(error.message || 'Card payment failed');
      setPaymentStep('error');
      onPaymentError(error.message || 'Card payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Convert amount to PHP centavos for PayMongo (if not already PHP)
  const getAmountInPHPCentavos = () => {
    if (currency === 'PHP') {
      const centavos = Math.round(amount * 100); // Convert PHP to centavos
      console.log(`💰 Converting PHP ${amount} to ${centavos} centavos`);
      return centavos;
    } else {
      // For non-PHP currencies, assume amount is already in equivalent PHP value
      const centavos = Math.round(amount * 100);
      console.log(`💰 Converting ${currency} ${amount} to ${centavos} centavos (assuming already converted to PHP)`);
      return centavos;
    }
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, JCB, and other cards',
      available: true,
    },
    {
      id: 'gcash',
      type: 'gcash',
      name: 'GCash',
      icon: <Smartphone className="h-6 w-6 text-blue-600" />,
      description: 'Pay instantly with your GCash wallet',
      available: true,
    },
    {
      id: 'paymaya',
      type: 'paymaya',
      name: 'Maya',
      icon: <CreditCard className="h-6 w-6 text-green-600" />,
      description: 'Pay securely with your Maya account',
      available: true,
    },
    {
      id: 'grab_pay',
      type: 'grab_pay',
      name: 'GrabPay',
      icon: <Zap className="h-6 w-6 text-green-500" />,
      description: 'Quick payment with your GrabPay wallet',
      available: true,
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Bank Transfer',
      icon: <Building className="h-6 w-6 text-blue-500" />,
      description: 'Direct bank transfer for larger payments',
      available: true,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      setErrorMessage('Please select a payment method');
      return;
    }

    setLoading(true);
    setPaymentStep('processing');
    setErrorMessage('');
    
    try {
        console.log(`💳 Processing ${formatAmount(amount)} payment via ${selectedMethod}`);
        console.log(`🔄 Currency: ${currency}, Amount: ${amount}`);
        
        const amountInCentavos = getAmountInPHPCentavos();
        
        // Validation: PayMongo minimum amount is 100 centavos (₱1.00)
        if (amountInCentavos < 100) {
          throw new Error('Minimum payment amount is ₱1.00');
        }
        
        // Validation: PayMongo maximum amount for e-wallets
        if (amountInCentavos > 100000000) { // ₱1,000,000.00
          throw new Error('Payment amount exceeds maximum limit');
        }
        
        // const description = `${paymentType === 'downpayment' ? 'Downpayment' : 'Payment'} for ${booking.serviceType} - ${booking.vendorName}`;        
        // Base URLs for redirect (ensure they're valid URLs)
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/individual/bookings?payment=success&booking=${booking.id}`;
        const failedUrl = `${baseUrl}/individual/bookings?payment=failed&booking=${booking.id}`;
        
        console.log(`🔗 Redirect URLs - Success: ${successUrl}, Failed: ${failedUrl}`);

      if (selectedMethod === 'card') {
        // For card payments, show card form first
        setPaymentStep('card_form');
        setLoading(false);
        return;

      } else if (selectedMethod === 'bank_transfer') {
        // Handle bank transfer
        console.log('🏦 Creating bank transfer payment...');
        
        const result = await paymongoService.createBankTransferPayment(
          booking.id,
          amount,
          paymentType
        );
        
        if (result.success && result.transferInstructions) {
          // Show bank transfer instructions
          setPaymentStep('bank_transfer_instructions');
          setLoading(false);
          
          // Call success handler with transfer instructions
          onPaymentSuccess({
            success: true,
            paymentMethod: selectedMethod,
            transferInstructions: result.transferInstructions,
            paymentId: result.paymentId
          });
          
          return;
        } else {
          throw new Error(result.error || 'Failed to create bank transfer');
        }

      } else if (['gcash', 'paymaya', 'grab_pay'].includes(selectedMethod)) {
        // Handle e-wallet payments
        let result: any = null;
        
        if (selectedMethod === 'grab_pay') {
          console.log('🚗 Creating GrabPay payment...');
          result = await paymongoService.createGrabPayPayment(
            booking.id,
            amount,
            paymentType
          );
        } else if (selectedMethod === 'gcash') {
          console.log('� Creating GCash payment...');
          result = await paymongoService.createGCashPayment(
            booking.id,
            amount,
            paymentType
          );
        } else if (selectedMethod === 'paymaya') {
          console.log('💳 Creating PayMaya payment...');
          result = await paymongoService.createPayMayaPayment(
            booking.id,
            amount,
            paymentType
          );
        }
        
        if (result && result.success && result.checkoutUrl) {
          setSource({
            id: result.sourceId || 'temp-source',
            checkout_url: result.checkoutUrl,
            status: 'pending'
          });
          
          setRedirectUrl(result.checkoutUrl);
          setPaymentStep('redirect');
          
          // Redirect to payment page
          console.log(`🔗 Redirecting to ${selectedMethod} payment page: ${result.checkoutUrl}`);
          window.location.href = result.checkoutUrl;
          
          return;
        } else {
          throw new Error((result && result.error) || `Failed to create ${selectedMethod} payment`);
        }
      } else {
        throw new Error(`Payment method ${selectedMethod} is not supported yet`);
      }

    } catch (error: any) {
      console.error('� Payment processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setErrorMessage(errorMessage);
      setPaymentStep('error');
      setLoading(false);
      
      // Call error handler
      onPaymentError(errorMessage);
    }
  };

  console.log('💳 PayMongoPaymentModal: Render called with isOpen:', isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] overflow-auto">
          {/* Perfect Center Container */}
          <div className="min-h-screen flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={paymentStep === 'processing' ? undefined : handleClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden z-10"
            >
              {/* Header - Matching Subscription Modal Design */}
              <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-10 text-white relative overflow-hidden">
                <button
                  onClick={handleClose}
                  disabled={loading || paymentStep === 'processing'}
                  className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-full transition-all duration-200 z-20 backdrop-blur-sm disabled:opacity-50"
                  aria-label="Close payment modal"
                  title="Close payment modal"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <CreditCard className="h-12 w-12" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold mb-2">Secure Payment</h2>
                      <p className="text-xl text-pink-100">Complete your {paymentType === 'downpayment' ? 'deposit' : 'balance'} payment</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-pink-100">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span>Instant Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span>256-bit SSL Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Verified Payment</span>
                    </div>
                  </div>
                </div>
                
                {/* Animated background elements - Matching subscription modal */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full animate-pulse" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-bounce [animation-duration:3s]" />
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
                {/* Progress Tracker */}
                {showProgress && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Payment Progress
                      </h3>
                      <span className="text-sm text-gray-500">
                        Step {currentProgress} of {paymentSteps.length}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative mb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentProgress / paymentSteps.length) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="flex justify-between items-center mb-4">
                      {paymentSteps.map((step) => (
                        <div key={step.step} className="flex flex-col items-center flex-1">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                            currentProgress >= step.step
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          )}>
                            {currentProgress > step.step ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              step.step
                            )}
                          </div>
                          <div className="text-xs text-center mt-2 max-w-20">
                            <div className={cn(
                              "font-medium",
                              currentProgress >= step.step ? "text-gray-900" : "text-gray-500"
                            )}>
                              {step.title}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Current Progress Message */}
                    {progressMessage && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                      >
                        <p className="text-sm font-medium text-gray-700">
                          {progressMessage}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Payment Summary */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-100"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Payment Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Vendor:</span>
                      <span className="font-semibold text-gray-900">{booking.vendorName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-semibold text-gray-900">{booking.serviceType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold text-gray-900 capitalize">{paymentType.replace('_', ' ')}</span>
                    </div>
                    {currency !== 'PHP' && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Currency:</span>
                        <span className="font-semibold text-gray-900">{currency}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount:</span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Steps */}
                {paymentStep === 'select' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Payment Method</h3>
                      <p className="text-gray-600">Select your preferred payment option below</p>
                    </div>
                    
                    <div className="grid gap-4">
                      {paymentMethods.map((method, index) => (
                        <motion.label
                          key={method.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className={cn(
                            "relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group",
                            selectedMethod === method.id
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-[1.02]"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md",
                            !method.available && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            disabled={!method.available}
                            className="sr-only"
                            aria-label={`Select ${method.name} payment method`}
                            title={`Select ${method.name} payment method`}
                          />
                          
                          {/* Payment Method Icon */}
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                            selectedMethod === method.id 
                              ? "bg-blue-500 text-white scale-110" 
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          )}>
                            {method.icon}
                          </div>
                          
                          {/* Payment Method Details */}
                          <div className="flex-1 ml-4">
                            <div className="font-bold text-gray-900 mb-1">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                          
                          {/* Selection Indicator */}
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all duration-300",
                            selectedMethod === method.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          )}>
                            {selectedMethod === method.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center"
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                          
                          {/* Hover Effect */}
                          {selectedMethod === method.id && (
                            <motion.div
                              layoutId="selectedPayment"
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl -z-10"
                            />
                          )}
                        </motion.label>
                      ))}
                    </div>

                    {/* Security Notice */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-800">Secure Payment</div>
                          <div className="text-sm text-green-700">Your payment information is encrypted and secure</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex gap-4 pt-4"
                    >
                      <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (selectedMethod === 'card') {
                            setPaymentStep('redirect');
                          } else {
                            handlePayment();
                          }
                        }}
                        disabled={!selectedMethod || loading}
                        className={cn(
                          "flex-1 px-6 py-4 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2",
                          selectedMethod && !loading
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        )}
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            <span>{selectedMethod === 'card' ? 'Continue' : `Pay ${formatAmount(amount)}`}</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {paymentStep === 'processing' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="relative mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 mx-auto"
                      >
                        <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <CreditCard className="h-8 w-8 text-blue-600" />
                      </motion.div>
                    </div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-gray-900 mb-3"
                    >
                      Processing Payment
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-600 mb-6"
                    >
                      Please wait while we securely process your payment...
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-center gap-2 text-sm text-gray-500"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Processing time: {processingTime}s</span>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div className="text-sm text-blue-800">
                          <div className="font-semibold">Secure Processing</div>
                          <div>Your payment is being processed securely</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {paymentStep === 'redirect' && selectedMethod && selectedMethod.startsWith('card') && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Card Payment</h3>
                      <p className="text-gray-600">Enter your card details securely</p>
                    </div>

                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardForm.number}
                            onChange={(e) => handleCardInputChange('number', e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
                          />
                          {/* Card Type Icon */}
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {cardType === 'visa' && (
                              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>
                            )}
                            {cardType === 'mastercard' && (
                              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">MC</div>
                            )}
                            {cardType === 'amex' && (
                              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">AMEX</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expiry and CVC Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardForm.expiry}
                            onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVC
                          </label>
                          <input
                            type="text"
                            value={cardForm.cvc}
                            onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
                          />
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardForm.name}
                          onChange={(e) => handleCardInputChange('name', e.target.value.toUpperCase())}
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-lg uppercase"
                        />
                      </div>
                    </div>

                    {/* Card Preview */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full -mr-16 -mt-16" />
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md" />
                          <div className="text-right">
                            {cardType === 'visa' && <div className="text-2xl font-bold">VISA</div>}
                            {cardType === 'mastercard' && <div className="text-2xl font-bold">MasterCard</div>}
                            {cardType === 'amex' && <div className="text-2xl font-bold">AMEX</div>}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="font-mono text-xl tracking-wider">
                            {cardForm.number || '•••• •••• •••• ••••'}
                          </div>
                          
                          <div className="flex justify-between">
                            <div>
                              <div className="text-xs text-gray-400 uppercase">Card Holder</div>
                              <div className="font-medium">{cardForm.name || 'YOUR NAME'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 uppercase">Expires</div>
                              <div className="font-medium font-mono">{cardForm.expiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Note */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Secure Payment</span>
                      </div>
                      <p className="text-green-600 text-sm mt-1">
                        Your card details are encrypted and secure. We never store your payment information.
                      </p>
                    </div>

                    {/* Payment Button */}
                    <motion.button
                      onClick={handleCardSubmit}
                      disabled={!validateCard(cardForm) || loading}
                      whileHover={{ scale: validateCard(cardForm) ? 1.02 : 1 }}
                      whileTap={{ scale: validateCard(cardForm) ? 0.98 : 1 }}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        validateCard(cardForm)
                          ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        `Pay ${formatAmount(amount)}`
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {paymentStep === 'redirect' && selectedMethod && !selectedMethod.startsWith('card') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border border-pink-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Complete Payment with {selectedMethod === 'gcash' ? 'GCash' : selectedMethod === 'paymaya' ? 'Maya' : 'GrabPay'}
                      </h3>
                      
                      {/* For GCash, show QR code option; for others, show redirect button */}
                      {redirectUrl && selectedMethod === 'gcash' ? (
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-blue-800 font-medium mb-2">Choose your payment method</p>
                            <p className="text-blue-600 text-sm">Scan QR code or open GCash app directly</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setPaymentStep('qr_code')}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <QrCode className="h-5 w-5" />
                              Scan QR Code
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                console.log(`🔗 Opening PayMongo checkout:`, redirectUrl);
                                window.open(redirectUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
                              }}
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <Smartphone className="h-5 w-5" />
                              Open GCash App
                            </motion.button>
                          </div>
                          
                          <p className="text-xs text-gray-500 text-center">
                            Choose QR code for mobile scanning or open the app directly
                          </p>
                        </div>
                      ) : redirectUrl ? (
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-blue-800 font-medium mb-2">Ready to pay with {selectedMethod === 'paymaya' ? 'Maya' : 'GrabPay'}?</p>
                            <p className="text-blue-600 text-sm">Click the button below to open the secure payment page</p>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              console.log(`🔗 Opening PayMongo checkout:`, redirectUrl);
                              window.open(redirectUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Open {selectedMethod === 'paymaya' ? 'Maya' : 'GrabPay'} Payment
                          </motion.button>
                          
                          <p className="text-xs text-gray-500">
                            A new window will open with the secure payment page. Complete your payment there and return here.
                          </p>
                        </div>
                      ) : (
                        /* Fallback: Show payment instructions */
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-yellow-800 font-medium mb-2">Manual Payment Instructions</p>
                            <div className="text-yellow-700 text-sm space-y-2">
                              <p>1. Open your {selectedMethod === 'gcash' ? 'GCash' : selectedMethod === 'paymaya' ? 'Maya' : 'GrabPay'} app</p>
                              <p>2. Go to "Pay Bills" or "Send Money"</p>
                              <p>3. Enter amount: <strong>{formatAmount(amount)}</strong></p>
                              <p>4. Reference: <strong>{source?.id || 'N/A'}</strong></p>
                            </div>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              console.log('✅ User manually requested payment status check');
                              setLoading(true);
                              
                              // Use the improved polling method for immediate check
                              const checkPaymentNow = async () => {
                                try {
                                  if (!source?.id) {
                                    throw new Error('No source ID available for status checking');
                                  }
                                  
                                  console.log('🔄 Checking payment status immediately for source:', source.id);
                                  
                                  // Use improved polling with single attempt for immediate check
                                  const result = await paymongoService.pollPaymentStatus(source.id);
                                  
                                  if (result.status === 'paid' && result.payment) {
                                    console.log('🎉 Real payment confirmed immediately via enhanced polling!');
                                    const paymentData = {
                                      source_id: source.id,
                                      payment_id: result.payment.id,
                                      amount: getAmountInPHPCentavos(),
                                      currency: 'PHP',
                                      status: 'succeeded',
                                      payment_method: selectedMethod,
                                      original_currency: currency,
                                      original_amount: amount,
                                      display_amount: formatAmount(amount),
                                      transaction_id: result.payment.id,
                                    };
                                    
                                    if (!successCallbackCalled) {
                                      setSuccessCallbackCalled(true);
                                      onPaymentSuccess(paymentData);
                                      console.log('✅ Success callback called for confirmed e-wallet payment');
                                    }
                                    
                                    setPaymentStep('success');
                                  } else {
                                    // If not found immediately, inform user to wait
                                    console.log('⏱️ Payment not yet detected, user should wait for automatic confirmation');
                                    setErrorMessage('Payment not yet detected. Please wait for automatic confirmation, or ensure payment was completed in your e-wallet app.');
                                  }
                                } catch (error) {
                                  console.error('Error checking payment status:', error);
                                  setErrorMessage('Unable to verify payment status. Please wait for automatic confirmation.');
                                }
                                
                                setLoading(false);
                              };
                              
                              // Check payment status immediately
                              checkPaymentNow();
                            }}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                          >
                            {loading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                                <span>Checking...</span>
                              </div>
                            ) : (
                              "Check Payment Status"
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Status */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                        />
                        <span className="text-blue-700 font-medium">Waiting for payment confirmation...</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-2 text-center">
                        This usually takes 3-6 seconds after you complete the payment
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {paymentStep === 'qr_code' && selectedMethod === 'gcash' && redirectUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Scan QR Code with GCash</h3>
                        <p className="text-gray-600">Open your GCash app and scan the QR code below</p>
                      </div>
                      
                      <div className="flex justify-center mb-6">
                        <QRCodeDisplay
                          data={redirectUrl}
                          size={200}
                          title=""
                          description="Scan this QR code with your GCash app"
                          showDownload={false}
                          showCopy={false}
                          className="mx-auto"
                        />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                          />
                          <span className="text-blue-700 font-medium">Waiting for payment confirmation...</span>
                        </div>
                        <p className="text-xs text-blue-600 text-center">
                          Payment will be confirmed automatically once you complete the transaction
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>1. Open your GCash app</p>
                          <p>2. Tap "Scan QR" or use your camera</p>
                          <p>3. Scan the QR code above</p>
                          <p>4. Confirm the payment amount: <span className="font-semibold">{formatAmount(amount)}</span></p>
                          <p>5. Enter your MPIN to complete</p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setPaymentStep('redirect')}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Can't scan? Open GCash app instead
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentStep === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </motion.div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-gray-900 mb-3"
                    >
                      Payment Successful!
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-600 mb-8"
                    >
                      Your payment of {formatAmount(amount)} has been processed successfully via PayMongo.
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
                    >
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Transaction ID:</span>
                          <span className="font-mono text-green-800">{paymentIntent?.id || source?.id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Amount Paid:</span>
                          <span className="font-bold text-green-800">{formatAmount(amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Payment Method:</span>
                          <span className="font-semibold text-green-800 capitalize">{selectedMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Status:</span>
                          <span className="font-semibold text-green-800">✅ Confirmed</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      onClick={() => {
                        console.log('🎉 Payment completed, closing modal (success callback already called)');
                        handleClose();
                      }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Continue</span>
                    </motion.button>
                  </motion.div>
                )}

                {paymentStep === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <XCircle className="h-12 w-12 text-red-600" />
                    </motion.div>
                    
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-bold text-gray-900 mb-3"
                    >
                      Payment Failed
                    </motion.h3>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-600 mb-6"
                    >
                      We encountered an issue processing your payment.
                    </motion.p>
                    
                    {errorMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8"
                      >
                        <div className="flex items-center gap-3">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div className="text-sm text-red-800">
                            <div className="font-semibold">Error Details</div>
                            <div>{errorMessage}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex gap-4"
                    >
                      <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setPaymentStep('select');
                          setErrorMessage('');
                          setSelectedMethod('');
                        }}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Try Again</span>
                      </button>
                    </motion.div>
                  </motion.div>
                )}
                
                {/* PayMongo Branding */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center mt-8 pt-6 border-t border-gray-200"
                >
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>Secured by <span className="font-semibold text-gray-700">PayMongo</span> • PCI DSS Compliant</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
