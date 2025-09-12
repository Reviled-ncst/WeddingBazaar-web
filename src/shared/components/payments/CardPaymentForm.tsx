import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface CardFormData {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export type CardType = 'visa' | 'mastercard' | 'amex' | 'unknown';

interface CardPaymentFormProps {
  amount: number;
  currency: string;
  formatAmount: (amount: number) => string;
  onSubmit: (cardData: CardFormData) => Promise<void>;
  loading: boolean;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  amount,
  formatAmount,
  onSubmit,
  loading,
}) => {
  const [cardForm, setCardForm] = useState<CardFormData>({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [cardType, setCardType] = useState<CardType>('unknown');

  // Card utility functions
  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/);
    if (!match) return cleaned;
    
    const [, group1, group2, group3, group4] = match;
    let formatted = group1;
    if (group2) formatted += ` ${group2}`;
    if (group3) formatted += ` ${group3}`;
    if (group4) formatted += ` ${group4}`;
    return formatted;
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateCard = (form: CardFormData): boolean => {
    const cleanNumber = form.number.replace(/\s/g, '');
    return (
      cleanNumber.length >= 13 &&
      form.expiry.length === 5 &&
      form.cvc.length >= 3 &&
      form.name.trim().length > 0
    );
  };

  const handleCardInputChange = (field: keyof CardFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
      setCardType(detectCardType(value));
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    
    setCardForm(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = () => {
    if (validateCard(cardForm)) {
      onSubmit(cardForm);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Card Payment</h3>
        <p className="text-gray-600">Enter your card details securely</p>
      </div>

      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardForm.number}
              onChange={(e) => handleCardInputChange('number', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              aria-label="Card number"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
            />
            {/* Card Type Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {cardType === 'visa' && (
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>
              )}
              {cardType === 'mastercard' && (
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">MC</div>
              )}
              {cardType === 'amex' && (
                <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">AMEX</div>
              )}
            </div>
          </div>
        </div>

        {/* Expiry and CVC Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={cardForm.expiry}
              onChange={(e) => handleCardInputChange('expiry', e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              aria-label="Card expiry date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              value={cardForm.cvc}
              onChange={(e) => handleCardInputChange('cvc', e.target.value)}
              placeholder="123"
              maxLength={4}
              aria-label="Card security code"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-mono text-lg"
            />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardForm.name}
            onChange={(e) => handleCardInputChange('name', e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            aria-label="Cardholder name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-lg uppercase"
          />
        </div>
      </div>

      {/* Card Preview */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-full -mr-16 -mt-16" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md" />
            <div className="text-right">
              {cardType === 'visa' && <div className="text-2xl font-bold">VISA</div>}
              {cardType === 'mastercard' && <div className="text-2xl font-bold">MasterCard</div>}
              {cardType === 'amex' && <div className="text-2xl font-bold">AMEX</div>}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="font-mono text-xl tracking-wider">
              {cardForm.number || '•••• •••• •••• ••••'}
            </div>
            
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase">Card Holder</div>
                <div className="font-medium">{cardForm.name || 'YOUR NAME'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase">Expires</div>
                <div className="font-medium font-mono">{cardForm.expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">Secure Payment</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          Your card details are encrypted and secure. We never store your payment information.
        </p>
      </div>

      {/* Payment Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!validateCard(cardForm) || loading}
        whileHover={{ scale: validateCard(cardForm) ? 1.02 : 1 }}
        whileTap={{ scale: validateCard(cardForm) ? 0.98 : 1 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
          validateCard(cardForm)
            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Processing...</span>
          </div>
        ) : (
          `Pay ${formatAmount(amount)}`
        )}
      </motion.button>
    </motion.div>
  );
};
