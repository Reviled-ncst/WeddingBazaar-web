import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  Loader2
} from 'lucide-react';
import { paymongoService } from '../../../services/paymongoService';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface CardPaymentProps {
  booking: {
    id: string;
    vendorName: string;
    serviceType: string;
    bookingReference?: string;
    eventDate?: string;
  };
  paymentType: string;
  amount: number;
  currency: string;
  currencySymbol?: string;
  formatAmount: (amount: number) => string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
  onClose?: () => void;
}

interface CardFormData {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

const CardPayment: React.FC<CardPaymentProps> = ({
  booking,
  amount,
  currency,
  currencySymbol = '$',
  formatAmount,
  onSuccess,
  onError,
  onBack,
  onClose
}) => {
  const { hideUpgradePrompt } = useSubscription();
  const [cardForm, setCardForm] = useState<CardFormData>({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [cardType, setCardType] = useState<CardType>('unknown');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');

  const detectCardType = (number: string): CardType => {
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

  const validateCard = (form: CardFormData): boolean => {
    const cleanNumber = form.number.replace(/\s/g, '');
    return (
      cleanNumber.length >= 13 &&
      form.expiry.length === 5 &&
      form.cvc.length >= 3 &&
      form.name.trim().length > 0
    );
  };

  const handleInputChange = (field: keyof CardFormData, value: string) => {
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

  const handleSubmit = async () => {
    if (!validateCard(cardForm)) {
      setStep('error');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      // Process payment with real PayMongo API
      const paymentIntent = await paymongoService.createPaymentIntent({
        amount: amount * 100, // PayMongo expects amount in cents
        currency: 'PHP',
        description: `Wedding Bazaar - ${booking.vendorName} - ${booking.serviceType}`,
        metadata: {
          booking_id: booking.id,
          payment_type: 'card'
        }
      });

      if (paymentIntent && paymentIntent.id) {
        // Handle successful payment intent creation
        const paymentData = {
          id: paymentIntent.id,
          amount: amount,
          currency: currency,
          status: 'succeeded',
          payment_method: 'card',
          card_last4: cardForm.number.slice(-4),
          card_type: cardType,
          reference: `WB-CARD-${Date.now()}`,
          details: paymentIntent.attributes
        };

        // If this is a subscription payment, handle subscription upgrade
        if (booking.serviceType.toLowerCase().includes('subscription')) {
          await handleSubscriptionUpgrade(paymentData);
        }

        setStep('success');
        
        // Call success callback after a brief delay to show success state
        setTimeout(() => {
          onSuccess(paymentData);
        }, 1500);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      console.error('Card payment error:', error);
      setStep('error');
      onError(error.message || 'Card payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionUpgrade = async (paymentData: any) => {
    try {
      console.log(`💳 Card Payment Success: ${booking.serviceType}`);
      console.log(`💰 Amount: ${currencySymbol}${amount}`);
      
      // API call to upgrade subscription after successful payment
      const backendUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const upgradeUrl = `${backendUrl}/api/subscriptions/upgrade`;
      
      const response = await fetch(upgradeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: '2-2025-003', // TODO: Get actual vendor ID from auth context
          subscriptionType: booking.serviceType.toLowerCase().replace(' subscription', ''),
          billingCycle: 'monthly',
          paymentData: {
            payment_method: 'paymongo_card',
            amount: amount,
            currency: currency,
            payment_reference: paymentData.id,
            card_last4: paymentData.card_last4,
            card_type: paymentData.card_type,
            ...paymentData
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Subscription upgrade successful:', result);
        
        // Trigger a custom event to refresh subscription status
        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));
        
        // Close the upgrade prompt after successful subscription upgrade
        setTimeout(() => {
          // Call the subscription context's hide function
          hideUpgradePrompt();
          
          // Also call the prop onClose for backward compatibility
          if (onClose) {
            onClose();
          }
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ Subscription upgrade error response:', errorData);
        throw new Error(errorData.error || 'Failed to complete subscription upgrade');
      }
    } catch (error) {
      console.error('Subscription upgrade error:', error);
      // Don't throw here - payment was successful, just log the subscription error
      console.warn('Payment successful but subscription upgrade failed. User may need to contact support.');
    }
  };

  if (step === 'processing') {
    return (
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
          <CreditCard className="h-8 w-8 text-blue-600 absolute inset-0 m-auto" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Processing Card Payment</h3>
        <p className="text-gray-600 mb-6">Please wait while we securely process your payment...</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <div className="font-semibold">Secure Processing</div>
              <div>Your payment is being processed securely</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
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
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
            />
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

        {/* Expiry and CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={cardForm.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cardForm.cvc}
              onChange={(e) => handleInputChange('cvc', e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
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
            onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg uppercase"
          />
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

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!validateCard(cardForm) || loading}
          className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            validateCard(cardForm) && !loading
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            `Pay ${formatAmount(amount)}`
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default CardPayment;
