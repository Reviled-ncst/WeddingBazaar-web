import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, CreditCard, Building } from 'lucide-react';
import { paymongoService } from '../../../services/paymongoService';
import type { PayMongoSource } from '../../../services/paymongoService';

export type EWalletType = 'gcash' | 'paymaya' | 'grab_pay';

interface EWalletPaymentProps {
  walletType: EWalletType;
  amount: number;
  currency: string;
  description: string;
  redirectUrls: {
    success: string;
    failed: string;
  };
  billing: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
  formatAmount: (amount: number) => string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const EWalletPayment: React.FC<EWalletPaymentProps> = ({
  walletType,
  amount,
  currency,
  description,
  redirectUrls,
  billing,
  metadata,
  formatAmount,
  onPaymentSuccess,
  onPaymentError,
  setLoading,
}) => {
  const [source, setSource] = useState<PayMongoSource | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [checkingPayment, setCheckingPayment] = useState(false);

  const getWalletInfo = (type: EWalletType) => {
    switch (type) {
      case 'gcash':
        return {
          name: 'GCash',
          icon: <Smartphone className="h-6 w-6 text-blue-600" />,
          color: 'blue',
          instructions: [
            'Open your GCash app',
            'Scan the QR code or enter the payment details',
            'Confirm the payment amount and details',
            'Enter your MPIN to complete the transaction'
          ]
        };
      case 'paymaya':
        return {
          name: 'Maya',
          icon: <CreditCard className="h-6 w-6 text-green-600" />,
          color: 'green',
          instructions: [
            'Open your Maya app',
            'Follow the payment instructions',
            'Confirm the payment amount',
            'Complete the transaction securely'
          ]
        };
      case 'grab_pay':
        return {
          name: 'GrabPay',
          icon: <Building className="h-6 w-6 text-green-500" />,
          color: 'emerald',
          instructions: [
            'Open your Grab app',
            'Go to GrabPay section',
            'Enter the payment details',
            'Confirm and complete payment'
          ]
        };
    }
  };

  const walletInfo = getWalletInfo(walletType);

  // Convert amount to centavos for PayMongo
  const getAmountInCentavos = () => {
    return Math.round(amount * 100);
  };

  const createPaymentSource = async () => {
    try {
      setLoading(true);
      
      const amountInCentavos = getAmountInCentavos();
      
      // Validation: PayMongo minimum amount is 100 centavos (₱1.00)
      if (amountInCentavos < 100) {
        throw new Error('Minimum payment amount is ₱1.00');
      }
      
      // Validation: PayMongo maximum amount for e-wallets
      if (amountInCentavos > 100000000) { // ₱1,000,000.00
        throw new Error('Payment amount exceeds maximum limit');
      }

      console.log(`🔄 Creating ${walletType} source for amount: ${amountInCentavos} centavos`);
      
      const sourceData = await paymongoService.createSource({
        type: walletType,
        amount: amountInCentavos,
        currency: 'PHP',
        description,
        redirect: redirectUrls,
        billing,
        metadata,
      });

      console.log(`✅ Source created successfully:`, sourceData.id);
      setSource(sourceData);

      // Check for checkout URL
      let checkoutUrl = null;
      if (sourceData.attributes.redirect?.checkout_url) {
        checkoutUrl = sourceData.attributes.redirect.checkout_url;
      } else if (sourceData.attributes.checkout_url) {
        checkoutUrl = sourceData.attributes.checkout_url;
      }
      
      if (checkoutUrl) {
        setRedirectUrl(checkoutUrl);
        console.log(`🔗 Checkout URL found:`, checkoutUrl);
      }

      // Start payment monitoring
      startPaymentMonitoring(sourceData);

    } catch (error: any) {
      console.error(`${walletType} payment error:`, error);
      onPaymentError(error.message || `${walletInfo.name} payment failed`);
    } finally {
      setLoading(false);
    }
  };

  const startPaymentMonitoring = (sourceData: PayMongoSource) => {
    let pollCount = 0;
    const maxPolls = 120; // Poll for up to 10 minutes
    const amountInCentavos = getAmountInCentavos();
    
    const pollPaymentStatus = async () => {
      try {
        pollCount++;
        console.log(`🔄 Polling payment status (attempt ${pollCount}/${maxPolls}) for source:`, sourceData.id);
        
        const payments = await paymongoService.getPayments(20);
        const relatedPayment = payments.find(payment => {
          return payment.attributes.source?.id === sourceData.id ||
                 payment.attributes.external_reference_number?.includes(sourceData.id) ||
                 (payment.attributes.description && 
                  payment.attributes.description.includes(description) &&
                  Math.abs(payment.attributes.amount - amountInCentavos) < 100);
        });
        
        if (relatedPayment && relatedPayment.attributes.status === 'paid') {
          console.log('🎉 Real payment confirmed via PayMongo API!', relatedPayment);
          
          const paymentData = {
            source_id: sourceData.id,
            payment_id: relatedPayment.id,
            amount: relatedPayment.attributes.amount,
            currency: relatedPayment.attributes.currency,
            status: 'succeeded',
            payment_method: walletType,
            original_currency: currency,
            original_amount: amount,
            display_amount: formatAmount(amount),
            transaction_id: relatedPayment.id,
            external_reference: relatedPayment.attributes.external_reference_number,
          };
          
          onPaymentSuccess(paymentData);
          return;
        }
        
        if (relatedPayment && relatedPayment.attributes.status === 'failed') {
          console.log('❌ Payment failed via PayMongo API');
          onPaymentError('Payment failed. Please try again.');
          return;
        }
        
        // Continue polling if no result and haven't exceeded max attempts
        if (pollCount < maxPolls) {
          setTimeout(pollPaymentStatus, 5000);
        } else {
          console.log('⏰ Payment polling timeout reached');
          onPaymentError('Payment confirmation timeout. Please check your payment status manually.');
        }
        
      } catch (error) {
        console.error('Error polling payment status:', error);
        
        if (pollCount < maxPolls) {
          setTimeout(pollPaymentStatus, 5000);
        } else {
          onPaymentError('Unable to confirm payment status. Please contact support.');
        }
      }
    };
    
    // Start polling after a short delay
    setTimeout(pollPaymentStatus, 2000);
  };

  const checkPaymentManually = async () => {
    if (!source?.id) return;
    
    try {
      setCheckingPayment(true);
      console.log('🔄 Checking payment status immediately for source:', source.id);
      
      const payments = await paymongoService.getPayments(20);
      const amountInCentavos = getAmountInCentavos();
      
      const relatedPayment = payments.find(payment => {
        return payment.attributes.source?.id === source.id ||
               payment.attributes.external_reference_number?.includes(source.id) ||
               (payment.attributes.description && 
                payment.attributes.description.includes(description) &&
                Math.abs(payment.attributes.amount - amountInCentavos) < 100);
      });
      
      if (relatedPayment && relatedPayment.attributes.status === 'paid') {
        console.log('🎉 Real payment confirmed immediately via PayMongo API!');
        const paymentData = {
          source_id: source.id,
          payment_id: relatedPayment.id,
          amount: amountInCentavos,
          currency: 'PHP',
          status: 'succeeded',
          payment_method: walletType,
          original_currency: currency,
          original_amount: amount,
          display_amount: formatAmount(amount),
          transaction_id: relatedPayment.id,
        };
        
        onPaymentSuccess(paymentData);
      } else {
        console.log('⏱️ Payment not yet detected, user should wait for automatic confirmation');
        onPaymentError('Payment not yet detected. Please wait for automatic confirmation, or ensure payment was completed in your e-wallet app.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      onPaymentError('Unable to verify payment status. Please wait for automatic confirmation.');
    } finally {
      setCheckingPayment(false);
    }
  };

  // Auto-create source when component mounts
  useEffect(() => {
    createPaymentSource();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border border-pink-100">
        <div className="flex items-center justify-center mb-4">
          {walletInfo.icon}
          <h3 className="text-xl font-bold text-gray-800 ml-3">
            Complete Payment with {walletInfo.name}
          </h3>
        </div>
        
        {/* If we have a redirect URL, show redirect button */}
        {redirectUrl ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-medium mb-2">Ready to pay with {walletInfo.name}?</p>
              <p className="text-blue-600 text-sm">Click the button below to open the secure payment page</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                console.log(`🔗 Opening PayMongo checkout:`, redirectUrl);
                window.open(redirectUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
              }}
              className={`w-full bg-gradient-to-r from-${walletInfo.color}-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              Open {walletInfo.name} Payment
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
                {walletInfo.instructions.map((instruction, index) => (
                  <p key={index}>{index + 1}. {instruction}</p>
                ))}
                <p className="font-semibold">Amount: {formatAmount(amount)}</p>
                <p className="font-semibold">Reference: {source?.id || 'N/A'}</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkPaymentManually}
              disabled={checkingPayment}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {checkingPayment ? (
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
          Payment status is automatically checked every 5 seconds
        </p>
      </motion.div>
    </motion.div>
  );
};
