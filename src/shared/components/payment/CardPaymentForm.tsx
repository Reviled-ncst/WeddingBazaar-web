// Card Payment Form Component
// Handles credit/debit card payment processing

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard,
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { PaymentProcessorProps } from '../../types/payment';
import { paymongoService } from '../../services/payment/paymongoService';

interface CardFormData {
  number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  name: string;
}

export const CardPaymentForm: React.FC<PaymentProcessorProps> = ({
  booking,
  amount,
  onSuccess,
  onError,
  onCancel
}) => {
  const [formData, setFormData] = useState<CardFormData>({
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState<Partial<CardFormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};

    // Card number validation (simplified)
    if (!formData.number || formData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Please enter a valid card number';
    }

    // Expiry month validation
    const month = parseInt(formData.exp_month);
    if (!formData.exp_month || month < 1 || month > 12) {
      newErrors.exp_month = 'Invalid month';
    }

    // Expiry year validation
    const year = parseInt(formData.exp_year);
    const currentYear = new Date().getFullYear();
    if (!formData.exp_year || year < currentYear || year > currentYear + 20) {
      newErrors.exp_year = 'Invalid year';
    }

    // CVC validation
    if (!formData.cvc || formData.cvc.length < 3) {
      newErrors.cvc = 'Please enter CVC';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    let processedValue = value;

    if (field === 'number') {
      processedValue = formatCardNumber(value);
    } else if (field === 'exp_month' || field === 'exp_year' || field === 'cvc') {
      processedValue = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await paymongoService.processCardPayment(
        amount.amount,
        {
          number: formData.number.replace(/\s/g, ''),
          exp_month: parseInt(formData.exp_month),
          exp_year: parseInt(formData.exp_year),
          cvc: formData.cvc
        },
        amount.currency,
        `Wedding Bazaar - ${booking.vendorName} - ${booking.serviceType}`
      );

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Card Payment</h3>
        <p className="text-gray-600">
          Enter your card details to complete the payment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.number ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.number && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.number}
            </p>
          )}
        </div>

        {/* Expiry and CVC */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <input
              type="text"
              value={formData.exp_month}
              onChange={(e) => handleInputChange('exp_month', e.target.value)}
              placeholder="MM"
              maxLength={2}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.exp_month ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isProcessing}
            />
            {errors.exp_month && (
              <p className="mt-1 text-xs text-red-600">{errors.exp_month}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="text"
              value={formData.exp_year}
              onChange={(e) => handleInputChange('exp_year', e.target.value)}
              placeholder="YYYY"
              maxLength={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.exp_year ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isProcessing}
            />
            {errors.exp_year && (
              <p className="mt-1 text-xs text-red-600">{errors.exp_year}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={formData.cvc}
              onChange={(e) => handleInputChange('cvc', e.target.value)}
              placeholder="123"
              maxLength={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cvc ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isProcessing}
            />
            {errors.cvc && (
              <p className="mt-1 text-xs text-red-600">{errors.cvc}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Lock className="h-4 w-4" />
            <span>Your card information is encrypted and secure</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                <span>Pay {amount.currencySymbol}{amount.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CardPaymentForm;
