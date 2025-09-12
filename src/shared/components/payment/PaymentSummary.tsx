import React from 'react';
import { motion } from 'framer-motion';
import { usePayment } from './PaymentContext';
import { paymongoService } from './paymongoService';

const PaymentSummary: React.FC = () => {
  const { booking, amount, currency, paymentType } = usePayment();

  const formatPaymentType = (type: string) => {
    switch (type) {
      case 'full_payment':
        return 'Full Payment';
      case 'deposit':
        return 'Deposit Payment';
      case 'remaining_balance':
        return 'Remaining Balance';
      default:
        return 'Payment';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Service</span>
          <span className="font-medium text-gray-900">{booking.serviceType}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Vendor</span>
          <span className="font-medium text-gray-900">{booking.vendorName}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Type</span>
          <span className="font-medium text-gray-900">{formatPaymentType(paymentType)}</span>
        </div>
        
        {booking.bookingReference && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reference</span>
            <span className="font-medium text-gray-900 font-mono text-sm">
              {booking.bookingReference}
            </span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">
              {paymongoService.formatAmount(amount, currency)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-xs text-blue-800">
          � <strong>Secure Payment:</strong> All transactions are processed securely through PayMongo's 
          PCI DSS compliant infrastructure.
        </p>
      </div>
    </motion.div>
  );
};

export default PaymentSummary;
