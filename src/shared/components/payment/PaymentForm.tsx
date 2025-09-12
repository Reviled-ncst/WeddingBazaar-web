import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Mail, Phone, User } from 'lucide-react';
import { usePayment } from './PaymentContext';
import type { PaymentFormData } from './types';

const PaymentForm: React.FC = () => {
  const { selectedMethod, setStep, processPayment, isProcessing } = usePayment();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Card validation only for card payments
    if (selectedMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!formData.expiryMonth) {
        newErrors.expiryMonth = 'Expiry month is required';
      }
      if (!formData.expiryYear) {
        newErrors.expiryYear = 'Expiry year is required';
      }
      if (!formData.cvc.trim()) {
        newErrors.cvc = 'CVC is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setStep('processing');
      await processPayment(formData);
    } catch (error) {
      console.error('Payment form submission error:', error);
    }
  };

  const handleBack = () => {
    setStep('select');
  };

  const isEWallet = ['gcash', 'grab_pay', 'paymaya'].includes(selectedMethod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isProcessing}
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {isEWallet ? 'Contact Information' : 'Payment Details'}
          </h3>
          <p className="text-gray-600">
            {isEWallet 
              ? 'Enter your details for the e-wallet payment'
              : 'Enter your card details securely'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Contact Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cardholderName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isProcessing}
            />
            {errors.cardholderName && (
              <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
              disabled={isProcessing}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+63 912 345 6789"
              disabled={isProcessing}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Card Details - Only for card payments */}
        {selectedMethod === 'card' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              <CreditCard className="h-4 w-4 inline mr-2" />
              Card Details
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={isProcessing}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && (
                  <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isProcessing}
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.expiryYear && (
                  <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  value={formData.cvc}
                  onChange={(e) => handleInputChange('cvc', e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cvc ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123"
                  maxLength={4}
                  disabled={isProcessing}
                />
                {errors.cvc && (
                  <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isProcessing ? 'Processing...' : `Pay Now`}
        </motion.button>
      </form>

      {/* Security Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">🔒 Secure Payment</p>
            <p className="text-xs text-gray-600">
              Your payment details are encrypted and secure. We never store your card information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
