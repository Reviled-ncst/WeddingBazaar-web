import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Zap,
  CreditCard,
  CheckCircle,
  Smartphone,
  Building
} from 'lucide-react';

// PayMongo service and types - removed unused imports
// import { paymongoService } from '../../services/paymongoService';
// import type { PayMongoPaymentIntent, PayMongoSource } from '../../services/paymongoService';

// Modular payment components
import CardPayment from './payment/CardPayment';
import GCashPayment from './payment/GCashPayment';
import MayaPayment from './payment/MayaPayment';
import GrabPayPayment from './payment/GrabPayPayment';

export interface PayMongoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    vendorName: string;
    serviceType: string;
    bookingReference?: string;
  };
  paymentType: string;
  amount: number;
  currency?: string;
  currencySymbol?: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'gcash' | 'paymaya' | 'grab_pay';
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
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success' | 'error'>('select');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod('');
      setPaymentStep('select');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (paymentStep === 'processing') return;
    
    setSelectedMethod('');
    setPaymentStep('select');
    onClose();
  };

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
      icon: <Building className="h-6 w-6 text-green-500" />,
      description: 'Quick payment with your GrabPay wallet',
      available: true,
    },
  ];

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentStep('success');
    onPaymentSuccess(paymentData);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStep('error');
    onPaymentError(error);
  };

  const renderPaymentComponent = () => {
    const commonProps = {
      booking,
      paymentType,
      amount,
      currency,
      formatAmount,
      onSuccess: handlePaymentSuccess,
      onError: handlePaymentError,
      onBack: () => setPaymentStep('select'),
    };

    switch (selectedMethod) {
      case 'card':
        return <CardPayment {...commonProps} />;
      case 'gcash':
        return <GCashPayment {...commonProps} />;
      case 'paymaya':
        return <MayaPayment {...commonProps} />;
      case 'grab_pay':
        return <GrabPayPayment {...commonProps} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] overflow-auto">
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
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                <button
                  onClick={handleClose}
                  disabled={paymentStep === 'processing'}
                  className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-all duration-200 z-20 backdrop-blur-sm disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Secure Payment</h2>
                      <p className="text-blue-100">Complete your subscription upgrade</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-blue-100 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Instant Processing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
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
                      <span className="text-gray-600">Service Provider:</span>
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
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount:</span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method Selection */}
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
                          className={`relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                            selectedMethod === method.id
                              ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-[1.02]"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                          } ${!method.available && "opacity-50 cursor-not-allowed"}`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            disabled={!method.available}
                            className="sr-only"
                          />
                          
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                            selectedMethod === method.id 
                              ? "bg-blue-500 text-white scale-110" 
                              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          }`}>
                            {method.icon}
                          </div>
                          
                          <div className="flex-1 ml-4">
                            <div className="font-bold text-gray-900 mb-1">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                            selectedMethod === method.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}>
                            {selectedMethod === method.id && (
                              <CheckCircle className="w-6 h-6 text-white" />
                            )}
                          </div>
                        </motion.label>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex gap-4 pt-4"
                    >
                      <button
                        onClick={onClose}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (selectedMethod) {
                            setPaymentStep('processing');
                          }
                        }}
                        disabled={!selectedMethod}
                        className={`flex-1 px-6 py-4 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 ${
                          selectedMethod
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span>Pay {formatAmount(amount)}</span>
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Render Selected Payment Component */}
                {paymentStep === 'processing' && selectedMethod && renderPaymentComponent()}

                {/* Success State */}
                {paymentStep === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h3>
                    <p className="text-gray-600 mb-8">Your payment has been processed successfully.</p>
                    <button
                      onClick={handleClose}
                      className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {/* Error State */}
                {paymentStep === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-red-500 mb-6">
                      <X className="h-20 w-20 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h3>
                    <p className="text-gray-600 mb-8">There was an issue processing your payment.</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setPaymentStep('select')}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
