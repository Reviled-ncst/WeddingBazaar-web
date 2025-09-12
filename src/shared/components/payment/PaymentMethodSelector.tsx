// Payment Method Selector Component
// Displays available payment methods with selection

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Building,
  Clock,
  Check
} from 'lucide-react';
import type { PaymentMethodSelectorProps } from '../../types/payment';
import { cn } from '../../../utils/cn';

const getPaymentMethodIcon = (type: string) => {
  switch (type) {
    case 'card':
      return <CreditCard className="h-6 w-6" />;
    case 'gcash':
      return <Smartphone className="h-6 w-6 text-blue-600" />;
    case 'paymaya':
      return <Smartphone className="h-6 w-6 text-green-600" />;
    case 'grab_pay':
      return <Smartphone className="h-6 w-6 text-green-700" />;
    case 'bank_transfer':
      return <Building className="h-6 w-6" />;
    default:
      return <CreditCard className="h-6 w-6" />;
  }
};

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethod,
  onMethodSelect,
  amount,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Payment Method</h3>
        <p className="text-gray-600">
          Select your preferred payment method for {amount.currencySymbol}{amount.amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
      </div>

      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onMethodSelect(method.id)}
            disabled={disabled || !method.available}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
              "flex items-center justify-between group",
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
              !method.available && "opacity-50 cursor-not-allowed",
              disabled && "opacity-75 cursor-not-allowed"
            )}
          >
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-3 rounded-lg transition-colors",
                selectedMethod === method.id
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
              )}>
                {getPaymentMethodIcon(method.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  {!method.available && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  {method.processingTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{method.processingTime}</span>
                    </div>
                  )}
                  {method.fees && (
                    <div className="text-xs text-gray-500">
                      <span>Fee: {method.fees}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300"
            )}>
              {selectedMethod === method.id && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-800 mb-2">No Payment Methods Available</h4>
            <p className="text-sm text-yellow-700">
              No payment methods are currently available for this amount and currency.
              Please contact support for assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
