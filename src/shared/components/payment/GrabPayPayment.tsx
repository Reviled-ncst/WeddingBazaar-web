import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  ExternalLink, 
  Loader2,
  CheckCircle,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { paymongoService } from '../../../services/paymongoService';
import QRCodeDisplay from './QRCodeDisplay';

interface GrabPayPaymentProps {
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

const GrabPayPayment: React.FC<GrabPayPaymentProps> = ({
  booking,
  paymentType,
  amount,
  formatAmount,
  onSuccess,
  onError,
  onBack
}) => {
  const [step, setStep] = useState<'redirect' | 'waiting' | 'manual' | 'qr'>('redirect');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  useEffect(() => {
    createGrabPaySource();
  }, []);

  const createGrabPaySource = async () => {
    setLoading(true);
    try {
      const amountInCentavos = Math.round(amount * 100);
      const description = `${paymentType === 'downpayment' ? 'Downpayment' : 'Payment'} for ${booking.serviceType} - ${booking.vendorName}`;
      
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/individual/bookings?payment=success&booking=${booking.id}`;
      const failedUrl = `${baseUrl}/individual/bookings?payment=failed&booking=${booking.id}`;

      const sourceData = await paymongoService.createSource({
        type: 'grab_pay',
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
      onError(error.message || 'Failed to create GrabPay payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'width=600,height=800,scrollbars=yes,resizable=yes');
      setStep('waiting');
      startPaymentPolling();
    }
  };

  const startPaymentPolling = async () => {
    if (!sourceId || pollingActive) return;
    
    setPollingActive(true);
    setLoading(true);
    
    try {
      console.log('🔄 Starting payment polling for GrabPay source:', sourceId);
      
      const result = await paymongoService.pollPaymentStatus(sourceId, {
        maxAttempts: 30,
        intervalMs: 3000,
        timeoutMs: 90000 // 1.5 minutes
      });
      
      if (result.status === 'paid' && result.payment) {
        console.log('✅ GrabPay payment confirmed via polling');
        
        const paymentData = {
          payment_id: result.payment.id,
          source_id: sourceId,
          amount: result.payment.attributes.amount,
          currency: 'PHP',
          status: 'succeeded',
          payment_method: 'grab_pay',
          display_amount: formatAmount(amount),
          transaction_id: result.payment.id,
        };
        
        onSuccess(paymentData);
      } else if (result.status === 'failed') {
        console.log('❌ GrabPay payment failed');
        onError('Payment failed. Please try again.');
      } else {
        console.log('⏰ GrabPay payment polling timeout - showing manual confirmation');
        setStep('manual');
      }
    } catch (error: any) {
      console.error('❌ Error during payment polling:', error);
      setStep('manual');
    } finally {
      setLoading(false);
      setPollingActive(false);
    }
  };

  const handleQRCode = () => {
    setStep('qr');
    startPaymentPolling();
  };

  const handleManualComplete = () => {
    setLoading(true);
    // This should ideally trigger a final status check
    setTimeout(async () => {
      try {
        // Try one more status check before simulating
        const result = await paymongoService.pollPaymentStatus(sourceId, {
          maxAttempts: 1,
          intervalMs: 1000,
          timeoutMs: 5000
        });
        
        if (result.status === 'paid' && result.payment) {
          const paymentData = {
            payment_id: result.payment.id,
            source_id: sourceId,
            amount: result.payment.attributes.amount,
            currency: 'PHP',
            status: 'succeeded',
            payment_method: 'grab_pay',
            display_amount: formatAmount(amount),
            transaction_id: result.payment.id,
          };
          onSuccess(paymentData);
        } else {
          // Fallback to manual confirmation
          const paymentData = {
            source_id: sourceId,
            amount: Math.round(amount * 100),
            currency: 'PHP',
            status: 'succeeded',
            payment_method: 'grab_pay',
            display_amount: formatAmount(amount),
            transaction_id: sourceId,
            manual_confirmation: true,
          };
          onSuccess(paymentData);
        }
      } catch (error) {
        // Fallback to manual confirmation
        const paymentData = {
          source_id: sourceId,
          amount: Math.round(amount * 100),
          currency: 'PHP',
          status: 'succeeded',
          payment_method: 'grab_pay',
          display_amount: formatAmount(amount),
          transaction_id: sourceId,
          manual_confirmation: true,
        };
        onSuccess(paymentData);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  if (loading && !sourceId) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Setting up GrabPay Payment</h3>
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
      <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100">
        <div className="flex items-center justify-center mb-4">
          <Building className="h-12 w-12 text-green-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Complete Payment with GrabPay
        </h3>
        
        {step === 'redirect' && redirectUrl && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 font-medium mb-2">Choose your payment method</p>
              <p className="text-green-600 text-sm">Select how you'd like to complete your GrabPay payment</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleQRCode}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <QrCode className="h-5 w-5" />
                Scan QR Code
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRedirect}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                Open GrabPay App
              </motion.button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Choose QR code for mobile scanning or open the app directly
            </p>
          </div>
        )}

        {step === 'qr' && redirectUrl && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Scan QR Code with GrabPay</h4>
              <p className="text-sm text-gray-600">Open your Grab app and scan the QR code below</p>
            </div>
            
            <QRCodeDisplay
              data={redirectUrl}
              size={200}
              title=""
              description="Scan this QR code with your Grab app"
              showDownload={false}
              showCopy={false}
              className="mx-auto"
            />
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"
                />
                <span className="text-green-700 font-medium">Waiting for payment confirmation...</span>
              </div>
              <p className="text-xs text-green-600 text-center">
                Payment will be confirmed automatically once completed
              </p>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setStep('manual')}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Having trouble? Use manual confirmation
              </button>
            </div>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"
                />
                <span className="text-green-700 font-medium">Monitoring payment status...</span>
              </div>
              <p className="text-xs text-green-600 text-center">
                Complete your payment in the GrabPay app. We'll detect it automatically.
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Complete your payment in the opened window and we'll automatically confirm it here.
              </p>
              
              <button
                onClick={() => setStep('manual')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Skip automatic detection
              </button>
            </div>
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
                <p>1. Open your Grab app</p>
                <p>2. Go to "GrabPay" or "Pay"</p>
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

export default GrabPayPayment;
