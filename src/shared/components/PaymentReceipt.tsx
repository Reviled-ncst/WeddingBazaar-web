import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, User, MapPin, CreditCard, Check } from 'lucide-react';

interface PaymentReceiptProps {
  receipt: {
    id: string;
    receiptNumber: string;
    receiptType: string;
    amount: number;
    formatted: {
      amount: string;
    };
    currency: string;
    taxAmount?: number;
    paymentType: string;
    paymentMethod: string;
    paymentReference?: string;
    issuedTo: any;
    issuedBy: any;
    issuedAt: string;
  };
  booking?: {
    id: string;
    serviceName?: string;
    eventDate: string;
    eventLocation?: string;
    coupleName: string;
    vendorName: string;
  };
  onDownload?: () => void;
  className?: string;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  receipt,
  booking,
  onDownload,
  className = ''
}) => {
  const issuedTo = typeof receipt.issuedTo === 'string' 
    ? JSON.parse(receipt.issuedTo) 
    : receipt.issuedTo;
  
  const issuedBy = typeof receipt.issuedBy === 'string' 
    ? JSON.parse(receipt.issuedBy) 
    : receipt.issuedBy;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'downpayment': 'Downpayment',
      'installment': 'Installment Payment',
      'final_payment': 'Final Payment',
      'full_payment': 'Full Payment',
      'refund': 'Refund'
    };
    return labels[type] || type;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/95 backdrop-blur-sm border border-rose-200/30 rounded-2xl p-8 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
            <p className="text-sm text-gray-500">{receipt.receiptNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>Paid</span>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Download Receipt"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Amount and Payment Info */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Type:</span>
                <span className="font-medium text-gray-900">{getPaymentTypeLabel(receipt.paymentType)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-rose-600">{receipt.formatted.amount}</span>
              </div>
              {receipt.taxAmount && receipt.taxAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax Amount:</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP'
                    }).format(receipt.taxAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(receipt.paymentMethod)}
                  <span className="font-medium text-gray-900">
                    {receipt.paymentMethod.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              {receipt.paymentReference && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reference:</span>
                  <span className="font-mono text-sm text-gray-900">{receipt.paymentReference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service and Event Info */}
        {booking && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>
              <div className="space-y-3">
                {booking.serviceName && (
                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-600">Service:</span>
                      <p className="font-medium text-gray-900">{booking.serviceName}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-600">Event Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.eventDate).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                {booking.eventLocation && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <p className="font-medium text-gray-900">{booking.eventLocation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer and Vendor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Billed To */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Billed To</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{issuedTo?.name || booking?.coupleName}</p>
                {issuedTo?.email && (
                  <p className="text-sm text-gray-600">{issuedTo.email}</p>
                )}
                {issuedTo?.phone && (
                  <p className="text-sm text-gray-600">{issuedTo.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Service Provider */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Service Provider</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{issuedBy?.name || booking?.vendorName}</p>
                <p className="text-sm text-gray-600">Wedding Bazaar Service Provider</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Issued on: {formatDate(receipt.issuedAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Wedding Bazaar Platform</p>
            <p className="text-xs text-gray-500">Thank you for your business!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentReceipt;
