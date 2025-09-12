import React from 'react';
import { Download, Mail, Calendar, MapPin, User, Building, CreditCard } from 'lucide-react';
import type { PaymentReceipt } from '../types/payment.types';
import { cn } from '../../../../../utils/cn';

interface ReceiptViewProps {
  receipt: PaymentReceipt;
  onDownloadPDF?: () => void;
  onEmailReceipt?: (email: string) => void;
  className?: string;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receipt,
  onDownloadPDF,
  onEmailReceipt,
  className
}) => {
  const [emailAddress, setEmailAddress] = React.useState(
    receipt.customerInfo?.email || ''
  );
  const [isEmailingReceipt, setIsEmailingReceipt] = React.useState(false);

  const handleEmailReceipt = async () => {
    if (!emailAddress || !onEmailReceipt) return;
    
    setIsEmailingReceipt(true);
    try {
      await onEmailReceipt(emailAddress);
    } finally {
      setIsEmailingReceipt(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: receipt.currency || 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-lg border border-pink-100 p-8 max-w-2xl mx-auto",
      className
    )}>
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Receipt</h1>
        <p className="text-lg font-semibold text-pink-600">#{receipt.receiptNumber}</p>
        <p className="text-sm text-gray-500 mt-1">
          Issued on {formatDate(receipt.issuedDate)}
        </p>
      </div>

      {/* Customer & Vendor Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {receipt.customerInfo && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User size={16} />
              Billed To
            </h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium">{receipt.customerInfo.name}</p>
              <p className="text-sm text-gray-600">{receipt.customerInfo.email}</p>
              {receipt.customerInfo.phone && (
                <p className="text-sm text-gray-600">{receipt.customerInfo.phone}</p>
              )}
            </div>
          </div>
        )}

        {receipt.lineItems?.vendor && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building size={16} />
              Service Provider
            </h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium">{receipt.lineItems.vendor.businessName || receipt.lineItems.vendor.name}</p>
              <p className="text-sm text-gray-600">{receipt.lineItems.vendor.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Service Details */}
      {receipt.lineItems?.service && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
            <div className="grid gap-3">
              <div>
                <p className="font-medium text-gray-900">{receipt.lineItems.service.description}</p>
                <p className="text-sm text-gray-600 capitalize">{receipt.lineItems.service.category}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-pink-500" />
                  <span>{formatDate(receipt.lineItems.service.eventDate)}</span>
                </div>
                
                {receipt.lineItems.service.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-pink-500" />
                    <span>{receipt.lineItems.service.venue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Payment Type</p>
              <p className="font-medium capitalize">{receipt.paymentType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-gray-500" />
                <span className="font-medium capitalize">{receipt.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className={cn(
                "font-medium capitalize",
                receipt.status === 'completed' ? 'text-green-600' : 
                receipt.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              )}>
                {receipt.status}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Receipt ID</p>
              <p className="font-medium font-mono text-xs">{receipt.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items & Totals */}
      {receipt.lineItems?.breakdown && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {receipt.lineItems.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3">
                  <span className="text-gray-700">{item.description}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
            
            {receipt.lineItems.totals && (
              <div className="bg-gray-50 border-t border-gray-200 p-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-pink-600">{formatCurrency(receipt.amount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        {onDownloadPDF && (
          <button
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Download size={16} />
            Download PDF
          </button>
        )}
        
        {onEmailReceipt && (
          <div className="flex gap-2 flex-1">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              onClick={handleEmailReceipt}
              disabled={!emailAddress || isEmailingReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={16} />
              {isEmailingReceipt ? 'Sending...' : 'Email'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100">
        <p>Wedding Bazaar Platform - Thank you for your business!</p>
        <p>For support, contact us at support@weddingbazaar.com</p>
      </div>
    </div>
  );
};
