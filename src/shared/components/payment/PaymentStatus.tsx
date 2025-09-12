// Payment Status Component
// Displays payment success, error, and processing states

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Download,
  Mail
} from 'lucide-react';
import type { PaymentStatusProps } from '../../types/payment';

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  state,
  booking,
  amount,
  onRetry,
  onClose
}) => {
  const getStatusContent = () => {
    switch (state.step) {
      case 'processing':
        return {
          icon: <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />,
          title: 'Processing Payment',
          description: 'Please wait while we process your payment...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900'
        };
      
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-600" />,
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900'
        };
      
      case 'error':
        return {
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          title: 'Payment Failed',
          description: state.errorMessage || 'There was an error processing your payment.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900'
        };
      
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();

  if (!statusContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Status Display */}
      <div className={`${statusContent.bgColor} ${statusContent.borderColor} border rounded-2xl p-8 text-center`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          {statusContent.icon}
        </motion.div>
        
        <h3 className={`text-2xl font-bold ${statusContent.textColor} mb-2`}>
          {statusContent.title}
        </h3>
        
        <p className={`${statusContent.textColor} opacity-80 mb-6`}>
          {statusContent.description}
        </p>

        {/* Payment Details for Success */}
        {state.step === 'success' && (
          <div className="bg-white rounded-lg p-4 space-y-3 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Amount Paid</span>
                <p className="font-semibold text-gray-900">
                  {amount.currencySymbol}{amount.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              
              <div>
                <span className="text-gray-500">Vendor</span>
                <p className="font-semibold text-gray-900">{booking.vendorName}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Service</span>
                <p className="font-semibold text-gray-900">{booking.serviceType}</p>
              </div>
              
              {state.paymentIntent?.id && (
                <div>
                  <span className="text-gray-500">Reference</span>
                  <p className="font-semibold text-gray-900 font-mono text-xs">
                    {state.paymentIntent.id}
                  </p>
                </div>
              )}
              
              {state.source?.id && (
                <div>
                  <span className="text-gray-500">Transaction ID</span>
                  <p className="font-semibold text-gray-900 font-mono text-xs">
                    {state.source.id}
                  </p>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Date</span>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {state.step === 'success' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  // Generate receipt
                  console.log('Generate receipt for:', state.paymentIntent?.id || state.source?.id);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Download Receipt</span>
              </button>
              
              <button
                onClick={() => {
                  // Send receipt via email
                  console.log('Email receipt for:', state.paymentIntent?.id || state.source?.id);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>Email Receipt</span>
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Continue
            </button>
          </>
        )}
        
        {state.step === 'error' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
        
        {state.step === 'processing' && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This may take a few moments. Please don't close this window.
            </p>
          </div>
        )}
      </div>

      {/* Support Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
        <p className="text-sm text-gray-600 mb-3">
          If you have any questions about your payment, please contact our support team.
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Support Email:</span>
          <a href="mailto:support@weddingbazaar.com" className="text-blue-600 hover:text-blue-700">
            support@weddingbazaar.com
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentStatus;
