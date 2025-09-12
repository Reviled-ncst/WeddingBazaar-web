import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  ExternalLink, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { paymongoService } from '../../../services/paymongoService';

interface GCashPaymentProps {
  booking: {
    id: string;
    vendorName: string;
    serviceType: string;
    bookingReference?: string;
  };
  paymentType: string;
  amount: number;
  currency: string;
  formatAmount: (amount: number) => string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

const GCashPayment: React.FC<GCashPaymentProps> = ({
  booking,
  paymentType,
  amount,
  formatAmount,
  onSuccess,
  onError,
  onBack
}) => {
  const [step, setStep] = useState<'redirect' | 'waiting' | 'manual'>('redirect');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createGCashSource();
  }, []);

  const createGCashSource = async () => {
    setLoading(true);
    try {
      const amountInCentavos = Math.round(amount * 100);
      const description = `${paymentType === 'downpayment' ? 'Downpayment' : 'Payment'} for ${booking.serviceType} - ${booking.vendorName}`;
      
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/individual/bookings?payment=success&booking=${booking.id}`;
      const failedUrl = `${baseUrl}/individual/bookings?payment=failed&booking=${booking.id}`;

      const sourceData = await paymongoService.createSource({
        type: 'gcash',
        amount: amountInCentavos,
        currency: 'PHP',
        description,
        redirect: {
          success: successUrl,
          failed: failedUrl,
        },
        billing: {
          name: 'Customer Name',
          email: 'customer@weddingbazaar.com',
          phone: '+639171234567',
        },
        metadata: {
          booking_id: booking.id,
          payment_type: paymentType,
        },
      });

      setSourceId(sourceData.id);

      // Check for redirect URL
      let checkoutUrl = null;
      if (sourceData.attributes.redirect?.checkout_url) {
        checkoutUrl = sourceData.attributes.redirect.checkout_url;
      } else if (sourceData.attributes.checkout_url) {
        checkoutUrl = sourceData.attributes.checkout_url;
      }

      if (checkoutUrl) {
        setRedirectUrl(checkoutUrl);
        setStep('redirect');
      } else {
        setStep('manual');
      }
    } catch (error: any) {
      onError(error.message || 'Failed to create GCash payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
      setStep('waiting');
    }
  };

  const handleManualComplete = () => {
    setLoading(true);
    // Simulate payment confirmation
    setTimeout(() => {
      const paymentData = {
        source_id: sourceId,
        amount: Math.round(amount * 100),
        currency: 'PHP',
        status: 'succeeded',
        payment_method: 'gcash',
        display_amount: formatAmount(amount),
        transaction_id: sourceId,
      };
      
      onSuccess(paymentData);
      setLoading(false);
    }, 2000);
  };

  if (loading && !sourceId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Setting up GCash Payment</h3>
        <p className="text-gray-600">Please wait while we prepare your payment...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100">
        <div className="flex items-center justify-center mb-4">
          <Smartphone className="h-12 w-12 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Complete Payment with GCash
        </h3>
        
        {step === 'redirect' && redirectUrl && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-medium mb-2">Ready to pay with GCash?</p>
              <p className="text-blue-600 text-sm">Click the button below to open the secure payment page</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              Open GCash Payment
            </motion.button>
            
            <p className="text-xs text-gray-500">
              A new window will open with the secure payment page. Complete your payment there and return here.
            </p>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
                />
                <span className="text-blue-700 font-medium">Waiting for payment confirmation...</span>
              </div>
              <p className="text-xs text-blue-600 text-center">
                This usually takes 3-6 seconds after you complete the payment
              </p>
            </div>
            
            <button
              onClick={handleManualComplete}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              I've Completed the Payment
            </button>
          </div>
        )}

        {step === 'manual' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">Manual Payment Instructions</p>
              </div>
              <div className="text-yellow-700 text-sm space-y-2 text-left">
                <p>1. Open your GCash app</p>
                <p>2. Go to "Pay Bills" or "Send Money"</p>
                <p>3. Enter amount: <strong>{formatAmount(amount)}</strong></p>
                <p>4. Reference: <strong>{sourceId || 'N/A'}</strong></p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManualComplete}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>I've Completed the Payment</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
      >
        Back to Payment Methods
      </button>
    </motion.div>
  );
};

export default GCashPayment;
