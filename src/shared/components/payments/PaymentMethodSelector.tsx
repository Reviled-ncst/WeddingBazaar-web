import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Building, CheckCircle, Shield } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'gcash' | 'paymaya' | 'grab_pay';
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
  formatAmount: (amount: number) => string;
  amount: number;
  onContinue: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  formatAmount,
  amount,
  onContinue,
  onCancel,
  loading,
}) => {
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

  return (
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
            className={cn(
              "relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group",
              selectedMethod === method.id
                ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-[1.02]"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md",
              !method.available && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => onMethodSelect(e.target.value)}
              disabled={!method.available}
              aria-label={`Select ${method.name} payment method`}
              className="sr-only"
            />
            
            {/* Payment Method Icon */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
              selectedMethod === method.id 
                ? "bg-blue-500 text-white scale-110" 
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
            )}>
              {method.icon}
            </div>
            
            {/* Payment Method Details */}
            <div className="flex-1 ml-4">
              <div className="font-bold text-gray-900 mb-1">{method.name}</div>
              <div className="text-sm text-gray-600">{method.description}</div>
            </div>
            
            {/* Selection Indicator */}
            <div className={cn(
              "w-6 h-6 rounded-full border-2 transition-all duration-300",
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300"
            )}>
              {selectedMethod === method.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
            
            {/* Hover Effect */}
            {selectedMethod === method.id && (
              <motion.div
                layoutId="selectedPayment"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl -z-10"
              />
            )}
          </motion.label>
        ))}
      </div>

      {/* Security Notice */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-green-600" />
          <div>
            <div className="font-semibold text-green-800">Secure Payment</div>
            <div className="text-sm text-green-700">Your payment information is encrypted and secure</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 pt-4"
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedMethod || loading}
          className={cn(
            "flex-1 px-6 py-4 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2",
            selectedMethod && !loading
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          )}
        >
          <CreditCard className="h-5 w-5" />
          <span>
            {selectedMethod === 'card' 
              ? 'Continue' 
              : selectedMethod 
                ? `Pay ${formatAmount(amount)}`
                : 'Select Method'
            }
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
};
