// E-wallet Payment Component
// Handles GCash, PayMaya, and GrabPay payments

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import type { PaymentProcessorProps } from '../../types/payment';
import { paymongoService } from '../../services/payment/paymongoService';

export const EwalletPaymentForm: React.FC<PaymentProcessorProps & { walletType: 'gcash' | 'paymaya' | 'grab_pay' }> = ({
  booking,
  amount,
  walletType,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'redirect' | 'checking' | 'completed'>('idle');

  const getWalletInfo = (type: string) => {
    switch (type) {
      case 'gcash':
        return {
          name: 'GCash',
          color: 'blue',
          description: 'Pay securely using your GCash wallet',
          instructions: 'You will be redirected to GCash to complete your payment'
        };
      case 'paymaya':
        return {
          name: 'PayMaya',
          color: 'green',
          description: 'Pay securely using your PayMaya wallet',
          instructions: 'You will be redirected to PayMaya to complete your payment'
        };
      case 'grab_pay':
        return {
          name: 'GrabPay',
          color: 'green',
          description: 'Pay securely using your GrabPay wallet',
          instructions: 'You will be redirected to GrabPay to complete your payment'
        };
      default:
        return {
          name: 'E-wallet',
          color: 'blue',
          description: 'Pay securely using your e-wallet',
          instructions: 'You will be redirected to complete your payment'
        };
    }
  };

  const walletInfo = getWalletInfo(walletType);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await paymongoService.processEwalletPayment(
        amount.amount,
        walletType,
        amount.currency,
        `Wedding Bazaar - ${booking.vendorName} - ${booking.serviceType}`
      );

      if (result.success && result.source?.redirect?.checkout_url) {
        setCheckoutUrl(result.source.redirect.checkout_url);
        setSourceId(result.source.id);
        setPaymentStatus('redirect');
      } else {
        onError(result.error || `${walletInfo.name} payment failed`);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : `${walletInfo.name} payment processing failed`);
    } finally {
      setIsProcessing(false);
    }
  };

  const openCheckout = () => {
    if (checkoutUrl) {
      // Open in new tab
      const paymentWindow = window.open(checkoutUrl, '_blank', 'width=600,height=700');
      setPaymentStatus('checking');
      
      // Start polling for payment status
      const pollInterval = setInterval(async () => {
        if (sourceId) {
          try {
            const source = await paymongoService.getSource(sourceId);
            
            if (source.status === 'chargeable' || source.status === 'paid') {
              clearInterval(pollInterval);
              setPaymentStatus('completed');
              onSuccess({
                success: true,
                source,
                reference: source.id
              });
            } else if (source.status === 'failed' || source.status === 'cancelled') {
              clearInterval(pollInterval);
              onError(`${walletInfo.name} payment was cancelled or failed`);
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }
      }, 3000); // Check every 3 seconds

      // Clean up interval after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (paymentStatus === 'checking') {
          onError('Payment verification timeout. Please check your payment status.');
        }
      }, 600000);

      // Check if window was closed
      const windowCheck = setInterval(() => {
        if (paymentWindow?.closed) {
          clearInterval(windowCheck);
          if (paymentStatus === 'redirect') {
            setPaymentStatus('checking');
          }
        }
      }, 1000);
    }
  };

  useEffect(() => {
    // Listen for payment callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'payment_success') {
        setPaymentStatus('completed');
        onSuccess({
          success: true,
          source: event.data.source,
          reference: event.data.reference
        });
      } else if (event.data.type === 'payment_error') {
        onError(event.data.error || `${walletInfo.name} payment failed`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError, walletInfo.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className={`bg-${walletInfo.color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
          <Smartphone className={`h-8 w-8 text-${walletInfo.color}-600`} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{walletInfo.name} Payment</h3>
        <p className="text-gray-600">{walletInfo.description}</p>
      </div>

      {paymentStatus === 'idle' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Payment Instructions</h4>
                <p className="text-sm text-blue-700">{walletInfo.instructions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Payment Amount</span>
              <span className="text-lg font-semibold text-gray-900">
                {amount.currencySymbol}{amount.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900">{walletInfo.name}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-${walletInfo.color}-600 to-${walletInfo.color}-700 text-white rounded-lg hover:from-${walletInfo.color}-700 hover:to-${walletInfo.color}-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Payment...</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-5 w-5" />
                  <span>Pay with {walletInfo.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {paymentStatus === 'redirect' && checkoutUrl && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-semibold text-green-900 mb-2">Payment Link Ready</h4>
            <p className="text-sm text-green-700 mb-4">
              Click the button below to open {walletInfo.name} and complete your payment
            </p>
            <button
              onClick={openCheckout}
              className={`w-full px-6 py-3 bg-gradient-to-r from-${walletInfo.color}-600 to-${walletInfo.color}-700 text-white rounded-lg hover:from-${walletInfo.color}-700 hover:to-${walletInfo.color}-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg`}
            >
              <ExternalLink className="h-5 w-5" />
              <span>Open {walletInfo.name}</span>
            </button>
          </div>
          
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to payment methods</span>
          </button>
        </div>
      )}

      {paymentStatus === 'checking' && (
        <div className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <Loader2 className="h-12 w-12 text-yellow-600 mx-auto mb-4 animate-spin" />
            <h4 className="font-semibold text-yellow-900 mb-2">Verifying Payment</h4>
            <p className="text-sm text-yellow-700">
              We're checking your payment status. Please wait...
            </p>
          </div>
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-semibold text-green-900 mb-2">Payment Successful!</h4>
            <p className="text-sm text-green-700">
              Your {walletInfo.name} payment has been processed successfully.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EwalletPaymentForm;
