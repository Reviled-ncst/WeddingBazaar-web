// Modular Payment Modal - Main Orchestrator
// Coordinates all payment components in a micro frontend architecture

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import type { 
  PaymentModalProps, 
  PaymentState, 
  PaymentMethod 
} from '../../types/payment';
import { paymongoService } from '../../services/payment/paymongoService';
import PaymentMethodSelector from './PaymentMethodSelector';
import PaymentSummary from './PaymentSummary';
import CardPaymentForm from './CardPaymentForm';
import EwalletPaymentForm from './EwalletPaymentForm';
import PaymentStatus from './PaymentStatus';

export const ModularPaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    step: 'select',
    selectedMethod: '',
    errorMessage: ''
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load available payment methods
  useEffect(() => {
    if (isOpen) {
      const methods = paymongoService.getAvailablePaymentMethods(amount.amount, amount.currency);
      
      // Add icons to methods
      const methodsWithIcons: PaymentMethod[] = methods.map(method => ({
        ...method,
        icon: React.createElement('div') // Icons will be handled by individual components
      }));
      
      setPaymentMethods(methodsWithIcons);
      
      // Reset state when modal opens
      setPaymentState({
        step: 'select',
        selectedMethod: '',
        errorMessage: ''
      });
    }
  }, [isOpen, amount.amount, amount.currency]);

  const handleMethodSelect = (methodId: string) => {
    setPaymentState(prev => ({
      ...prev,
      selectedMethod: methodId,
      errorMessage: ''
    }));
  };

  const handlePaymentSuccess = (result: any) => {
    setPaymentState(prev => ({
      ...prev,
      step: 'success',
      paymentIntent: result.paymentIntent,
      source: result.source
    }));
    
    onPaymentSuccess(result);
  };

  const handlePaymentError = (error: string) => {
    setPaymentState(prev => ({
      ...prev,
      step: 'error',
      errorMessage: error
    }));
    
    onPaymentError(error);
  };

  const handleRetry = () => {
    setPaymentState(prev => ({
      ...prev,
      step: 'select',
      errorMessage: ''
    }));
  };

  const handleProcessorCancel = () => {
    setPaymentState(prev => ({
      ...prev,
      step: 'select'
    }));
  };

  const selectedMethodData = paymentMethods.find(m => m.id === paymentState.selectedMethod);

  const renderPaymentProcessor = () => {
    if (!selectedMethodData || paymentState.step !== 'processing') return null;

    const commonProps = {
      method: selectedMethodData,
      booking,
      amount,
      onSuccess: handlePaymentSuccess,
      onError: handlePaymentError,
      onCancel: handleProcessorCancel
    };

    switch (selectedMethodData.type) {
      case 'card':
        return <CardPaymentForm {...commonProps} />;
      
      case 'gcash':
        return <EwalletPaymentForm {...commonProps} walletType="gcash" />;
      
      case 'paymaya':
        return <EwalletPaymentForm {...commonProps} walletType="paymaya" />;
      
      case 'grab_pay':
        return <EwalletPaymentForm {...commonProps} walletType="grab_pay" />;
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Payment processor not implemented for {selectedMethodData.name}</p>
            <button
              onClick={handleProcessorCancel}
              className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Methods
            </button>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Secure Payment</h2>
                <p className="text-blue-100 mt-1">Wedding Bazaar Payment Gateway</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close payment modal"
                title="Close payment modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Summary - Always visible */}
              <div className="lg:col-span-1">
                <PaymentSummary />
              </div>

              {/* Main Payment Area */}
              <div className="lg:col-span-2">
                <motion.div
                  key={paymentState.step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Method Selection */}
                  {paymentState.step === 'select' && (
                    <div className="space-y-6">
                      <PaymentMethodSelector
                        paymentMethods={paymentMethods}
                        selectedMethod={paymentState.selectedMethod}
                        onMethodSelect={handleMethodSelect}
                        amount={amount}
                      />
                      
                      {paymentState.selectedMethod && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="flex justify-end"
                        >
                          <button
                            onClick={() => setPaymentState(prev => ({ ...prev, step: 'processing' }))}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
                          >
                            Continue to Payment
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Payment Processing */}
                  {paymentState.step === 'processing' && renderPaymentProcessor()}

                  {/* Payment Status (Success/Error) */}
                  {(paymentState.step === 'success' || paymentState.step === 'error') && (
                    <PaymentStatus
                      state={paymentState}
                      booking={booking}
                      amount={amount}
                      onRetry={handleRetry}
                      onClose={onClose}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Footer - Security Badge */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-3xl">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Shield className="h-4 w-4" />
              <span>
                Secured by <span className="font-semibold text-gray-700">PayMongo</span> • 
                SSL Encrypted • PCI DSS Compliant
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModularPaymentModal;
