import React, { useState } from 'react';
import { X, CreditCard, Shield, Info } from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { PaymentType } from '../types/payment.types';
import type { Booking } from '../../bookings/types/booking.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  paymentType: PaymentType;
  onPaymentSubmit: (paymentData: {
    bookingId: string;
    paymentType: PaymentType;
    amount: number;
    paymentMethod: string;
  }) => Promise<void>;
  loading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  paymentType,
  onPaymentSubmit,
  loading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('gcash');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !booking) return null;

  const getPaymentAmount = () => {
    switch (paymentType) {
      case 'downpayment':
        return booking.downpaymentAmount || (booking.totalAmount ? booking.totalAmount * 0.3 : 0);
      case 'remaining_balance':
        return booking.remainingBalance || 0;
      case 'full_payment':
        return booking.totalAmount || 0;
      default:
        return 0;
    }
  };

  const getPaymentTitle = () => {
    switch (paymentType) {
      case 'downpayment':
        return 'Pay Downpayment';
      case 'remaining_balance':
        return 'Pay Remaining Balance';
      case 'full_payment':
        return 'Pay Full Amount';
      default:
        return 'Make Payment';
    }
  };

  const amount = getPaymentAmount();
  const formattedAmount = `₱${amount.toLocaleString()}`;

  const paymentMethods = [
    {
      id: 'gcash',
      name: 'GCash',
      description: 'Pay using your GCash wallet',
      icon: '📱',
      popular: true
    },
    {
      id: 'paymaya',
      name: 'PayMaya',
      description: 'Pay using your PayMaya account',
      icon: '💳',
      popular: true
    },
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, JCB, and more',
      icon: '💳',
      popular: false
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: '🏦',
      popular: false
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || isProcessing || loading) return;

    setIsProcessing(true);
    try {
      await onPaymentSubmit({
        bookingId: booking.id,
        paymentType,
        amount,
        paymentMethod: selectedMethod
      });
    } catch (error) {
      console.error('Payment submission failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-xl">
              <CreditCard className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {getPaymentTitle()}
              </h2>
              <p className="text-sm text-gray-600">
                {booking.vendorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close payment modal"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={isProcessing || loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Payment Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                {formattedAmount}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              For: {booking.serviceType} • {new Date(booking.eventDate).toLocaleDateString()}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200",
                    selectedMethod === method.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center w-full">
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                        {method.popular && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 border-2 rounded-full flex items-center justify-center",
                      selectedMethod === method.id
                        ? "border-pink-500 bg-pink-500"
                        : "border-gray-300"
                    )}>
                      {selectedMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Secure Payment
              </p>
              <p className="text-sm text-blue-700">
                Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
              </p>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                Payment Information
              </p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• You will receive a payment confirmation email</li>
                <li>• Refunds are processed according to our cancellation policy</li>
                <li>• For support, contact us at support@weddingbazaar.com</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing || loading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || loading || !selectedMethod}
              className={cn(
                "flex-1 px-6 py-3 bg-pink-500 text-white rounded-xl transition-colors",
                "hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {(isProcessing || loading) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay {formattedAmount}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
