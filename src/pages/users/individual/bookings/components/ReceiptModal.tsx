import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  CreditCard,
  FileText,
  Phone,
  Mail,
  Building2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { getBookingReceipts, type Receipt } from '../../../../../shared/services/bookingActionsService';

// Use local booking type since EnhancedBooking is defined in IndividualBookings.tsx
interface EnhancedBooking {
  id: string;
  serviceName: string;
  serviceType: string;
  vendorName?: string;
  vendorBusinessName?: string;
  vendorRating?: number;
  vendorPhone?: string | null;
  vendorEmail?: string | null;
  coupleName?: string | null;
  clientName?: string | null;
  eventDate: string;
  formattedEventDate?: string;
  eventLocation: string;
  status: string;
  totalAmount?: number;
  downpaymentAmount?: number;
  remainingBalance?: number;
  bookingReference?: string;
  createdAt: string;
  updatedAt?: string;
  paymentProgress?: number;
  daysUntilEvent?: number;
  specialRequests?: string;
  notes?: string;
}

interface ReceiptModalProps {
  booking: EnhancedBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, isOpen, onClose }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && booking?.id) {
      loadReceipts();
    }
  }, [isOpen, booking?.id]);

  const loadReceipts = async () => {
    if (!booking?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📄 [ReceiptModal] Fetching receipts for booking:', booking.id);
      const fetchedReceipts = await getBookingReceipts(booking.id);
      console.log('📄 [ReceiptModal] Fetched receipts:', fetchedReceipts);
      setReceipts(fetchedReceipts);
    } catch (err) {
      console.error('❌ [ReceiptModal] Error loading receipts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  // Calculate totals from actual receipts
  const calculateTotals = () => {
    if (receipts.length === 0) {
      // Fallback to booking amounts if no receipts
      return {
        totalPaid: booking.downpaymentAmount || 0,
        totalAmount: booking.totalAmount || 0,
        remainingBalance: (booking.totalAmount || 0) - (booking.downpaymentAmount || 0),
      };
    }

    // Sum all payments from receipts (amounts are in centavos)
    const totalPaid = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0) / 100;
    const totalAmount = booking.totalAmount || 0;
    const remainingBalance = Math.max(0, totalAmount - totalPaid);

    return { totalPaid, totalAmount, remainingBalance };
  };

  const { totalPaid, totalAmount, remainingBalance } = calculateTotals();
  const isFullyPaid = remainingBalance <= 0;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount && amount !== 0) return 'PHP 0.00';
    return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatReceiptAmount = (centavos: number) => {
    return formatCurrency(centavos / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'deposit': 'Deposit Payment',
      'downpayment': 'Down Payment',
      'balance': 'Balance Payment',
      'full': 'Full Payment',
      'payment': 'Payment'
    };
    return labels[type.toLowerCase()] || type;
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method?.toLowerCase().includes('card')) return '💳';
    if (method?.toLowerCase().includes('gcash')) return '💙';
    if (method?.toLowerCase().includes('maya') || method?.toLowerCase().includes('paymaya')) return '💚';
    if (method?.toLowerCase().includes('grab')) return '🟢';
    return '💰';
  };

  const handleDownloadReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate payment history HTML
    const paymentHistoryHTML = receipts.map(receipt => `
      <div class="payment-item">
        <div class="payment-header">
          <span>${getPaymentMethodIcon(receipt.paymentMethod)} ${getPaymentTypeLabel(receipt.paymentType)}</span>
          <span class="payment-amount">${formatReceiptAmount(receipt.amount)}</span>
        </div>
        <div class="payment-details">
          <span>Date: ${formatDate(receipt.createdAt)}</span>
          <span>Method: ${receipt.paymentMethod}</span>
          <span>Receipt #: ${receipt.receiptNumber}</span>
        </div>
      </div>
    `).join('');

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${booking.bookingReference}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ec4899;
            padding-bottom: 20px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ec4899;
            margin-bottom: 10px;
          }
          .receipt-title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }
          .info-section {
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .label {
            font-weight: 600;
            color: #6b7280;
          }
          .value {
            color: #111827;
          }
          .payment-history {
            margin: 20px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .payment-item {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #ec4899;
          }
          .payment-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .payment-amount {
            color: #059669;
            font-size: 18px;
          }
          .payment-details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #6b7280;
          }
          .total-section {
            margin-top: 30px;
            padding: 20px;
            background: #fdf2f8;
            border-radius: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 16px;
          }
          .total-row.grand-total {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #ec4899;
            padding-top: 15px;
            margin-top: 10px;
            color: ${isFullyPaid ? '#059669' : '#dc2626'};
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: ${isFullyPaid ? '#dcfce7' : '#fef3c7'};
            color: ${isFullyPaid ? '#166534' : '#92400e'};
            border-radius: 20px;
            font-weight: 600;
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">💒 Wedding Bazaar</div>
          <div style="color: #6b7280;">Official Payment Receipt</div>
        </div>

        <div class="receipt-title">Payment Receipt</div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Booking Reference:</span>
            <span class="value">${booking.bookingReference || `WB-${booking.id?.slice(-6)}`}</span>
          </div>
          <div class="info-row">
            <span class="label">Date Issued:</span>
            <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Status:</span>
            <span class="value"><span class="status-badge">${isFullyPaid ? 'Fully Paid' : 'Partially Paid'}</span></span>
          </div>
        </div>

        <div class="info-section">
          <h3 style="margin-bottom: 15px; color: #111827;">Service Details</h3>
          <div class="info-row">
            <span class="label">Service:</span>
            <span class="value">${booking.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${booking.serviceType}</span>
          </div>
          <div class="info-row">
            <span class="label">Vendor:</span>
            <span class="value">${booking.vendorName || booking.vendorBusinessName || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Event Date:</span>
            <span class="value">${booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="info-row">
            <span class="label">Event Location:</span>
            <span class="value">${booking.eventLocation || 'N/A'}</span>
          </div>
        </div>

        ${receipts.length > 0 ? `
        <div class="payment-history">
          <h3 style="margin-bottom: 15px; color: #111827;">Payment History</h3>
          ${paymentHistoryHTML}
        </div>
        ` : ''}

        <div class="total-section">
          <div class="total-row">
            <span>Total Amount:</span>
            <span>${formatCurrency(totalAmount)}</span>
          </div>
          <div class="total-row">
            <span>Total Paid:</span>
            <span style="color: #059669;">${formatCurrency(totalPaid)}</span>
          </div>
          ${remainingBalance > 0 ? `
          <div class="total-row">
            <span>Remaining Balance:</span>
            <span style="color: #dc2626;">${formatCurrency(remainingBalance)}</span>
          </div>
          ` : ''}
          <div class="total-row grand-total">
            <span>${isFullyPaid ? 'Fully Paid' : 'Balance Due'}:</span>
            <span>${isFullyPaid ? formatCurrency(totalPaid) : formatCurrency(remainingBalance)}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>Wedding Bazaar</strong></p>
          <p>Thank you for choosing Wedding Bazaar for your special day!</p>
          <p>For inquiries, contact us at support@weddingbazaar.com</p>
          <p style="margin-top: 20px; font-size: 12px;">
            This is a computer-generated receipt and requires no signature.
          </p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Payment Receipt</h2>
                <p className="text-pink-100 text-sm">Reference: {booking.bookingReference || `WB-${booking.id?.slice(-6)}`}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close receipt"
              aria-label="Close receipt"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Loading receipt data...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 text-red-700 mb-2">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold">Error Loading Receipts</h3>
              </div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadReceipts}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && (
            <>
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <div className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 ${
                  isFullyPaid 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                  {isFullyPaid ? 'Fully Paid' : 'Partially Paid'}
                </div>
              </div>

              {/* Service Information */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-500" />
                  Service Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Service:</span>
                    <span className="text-gray-900 font-semibold text-right">{booking.serviceName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Type:</span>
                    <span className="text-gray-900 text-right">{booking.serviceType}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-medium">Vendor:</span>
                    <span className="text-gray-900 font-semibold text-right">
                      {booking.vendorName || booking.vendorBusinessName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-pink-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-pink-500 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Event Date</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-500 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">Location</span>
                  </div>
                  <p className="text-gray-900 font-medium">{booking.eventLocation || 'N/A'}</p>
                </div>
              </div>

              {/* Payment History */}
              {receipts.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Payment History ({receipts.length} transaction{receipts.length !== 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getPaymentMethodIcon(receipt.paymentMethod)}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{getPaymentTypeLabel(receipt.paymentType)}</p>
                              <p className="text-sm text-gray-600">#{receipt.receiptNumber}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-green-600">{formatReceiptAmount(receipt.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>{formatDate(receipt.createdAt)}</span>
                          <span className="font-medium">{receipt.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-green-200">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-green-200">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="text-green-600 font-semibold">{formatCurrency(totalPaid)}</span>
                  </div>
                  {remainingBalance > 0 && (
                    <div className="flex justify-between items-center pb-3 border-b border-green-200">
                      <span className="text-gray-600">Remaining Balance</span>
                      <span className="text-red-600 font-semibold">{formatCurrency(remainingBalance)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-bold text-gray-900">
                      {isFullyPaid ? 'Total Paid' : 'Balance Due'}
                    </span>
                    <span className={`text-2xl font-bold ${isFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
                      {isFullyPaid ? formatCurrency(totalPaid) : formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Contact (if available) */}
              {(booking.vendorPhone || booking.vendorEmail) && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    Vendor Contact
                  </h3>
                  <div className="space-y-2">
                    {booking.vendorPhone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-purple-500" />
                        <span>{booking.vendorPhone}</span>
                      </div>
                    )}
                    {booking.vendorEmail && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <span>{booking.vendorEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                >
                  <Download className="w-5 h-5" />
                  Download / Print
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>

              {/* Footer Note */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p>Thank you for choosing Wedding Bazaar for your special day!</p>
                <p className="mt-1">For inquiries, contact us at support@weddingbazaar.com</p>
                {receipts.length > 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    {receipts.length} payment transaction{receipts.length !== 1 ? 's' : ''} recorded
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
