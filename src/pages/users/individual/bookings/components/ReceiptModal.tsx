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
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Elegant Header with Watermark */}
        <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white px-8 py-10 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" style={{ animation: 'bounce 3s infinite' }}></div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-sm text-pink-100 font-medium">WEDDING BAZAAR</div>
                    <h2 className="text-4xl font-bold tracking-tight">Payment Receipt</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-pink-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Official Receipt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                title="Close receipt"
                aria-label="Close receipt"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            
            {/* Reference Number - Prominent Display */}
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
              <span className="text-pink-100 text-sm font-medium">Ref:</span>
              <span className="font-mono font-bold text-lg tracking-wider">{booking.bookingReference || `WB-${booking.id?.slice(-6)}`}</span>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"
              />
              <span className="mt-4 text-gray-600 font-medium">Loading receipt data...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-700 mb-2">Unable to Load Receipts</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={loadReceipts}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Success State - Beautiful Receipt Layout */}
          {!loading && !error && (
            <div className="space-y-6">
              {/* Payment Status Badge - Center */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center"
              >
                <div className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-lg ${
                  isFullyPaid 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                }`}>
                  <CheckCircle2 className="w-6 h-6" />
                  {isFullyPaid ? '✓ Fully Paid' : '⚡ Partially Paid'}
                </div>
              </motion.div>

              {/* Service & Event Info - Side by Side Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Details Card */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Service Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Service</div>
                      <div className="text-lg font-bold text-gray-900">{booking.serviceName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</div>
                      <div className="text-base text-gray-700">{booking.serviceType}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Vendor</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {booking.vendorName || booking.vendorBusinessName || 'N/A'}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Event Details Card */}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</div>
                      <div className="text-lg font-bold text-gray-900">
                        {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</div>
                      <div className="text-base text-gray-700 flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{booking.eventLocation || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Payment History - Enhanced Timeline */}
              {receipts.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                      <p className="text-sm text-gray-600">{receipts.length} transaction{receipts.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {receipts.map((receipt, index) => (
                      <motion.div 
                        key={receipt.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{getPaymentMethodIcon(receipt.paymentMethod)}</span>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{getPaymentTypeLabel(receipt.paymentType)}</div>
                              <div className="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded inline-block">
                                #{receipt.receiptNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{formatReceiptAmount(receipt.amount)}</div>
                            <div className="text-xs text-gray-500 font-medium">{receipt.paymentMethod}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(receipt.createdAt)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Payment Summary - Grand Total */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 shadow-xl border-2 border-green-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b-2 border-green-200">
                    <span className="text-gray-700 font-medium">Contract Amount</span>
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b-2 border-green-200">
                    <span className="text-gray-700 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Amount Paid
                    </span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</span>
                  </div>
                  {remainingBalance > 0 && (
                    <div className="flex items-center justify-between py-3 border-b-2 border-red-200 bg-red-50 -mx-8 px-8 rounded">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        Balance Due
                      </span>
                      <span className="text-xl font-bold text-red-600">{formatCurrency(remainingBalance)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-6">
                    <span className="text-2xl font-bold text-gray-900">
                      {isFullyPaid ? 'Total Paid' : 'Amount Due'}
                    </span>
                    <span className={`text-4xl font-black ${isFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
                      {isFullyPaid ? formatCurrency(totalPaid) : formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Vendor Contact - If Available */}
              {(booking.vendorPhone || booking.vendorEmail) && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">Vendor Contact</h3>
                  </div>
                  <div className="space-y-3">
                    {booking.vendorPhone && (
                      <div className="flex items-center gap-3 text-gray-700 bg-white px-4 py-3 rounded-xl">
                        <Phone className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span className="font-medium">{booking.vendorPhone}</span>
                      </div>
                    )}
                    {booking.vendorEmail && (
                      <div className="flex items-center gap-3 text-gray-700 bg-white px-4 py-3 rounded-xl">
                        <Mail className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <span className="font-medium">{booking.vendorEmail}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4 pt-4"
              >
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 font-bold text-lg"
                >
                  <Download className="w-6 h-6" />
                  Download / Print Receipt
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-semibold border-2 border-gray-200 hover:border-gray-300"
                >
                  Close
                </button>
              </motion.div>

              {/* Footer Note - Enhanced */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center py-6 border-t-2 border-gray-200"
              >
                <div className="text-pink-500 font-bold text-lg mb-2">💒 Thank You for Choosing Wedding Bazaar!</div>
                <p className="text-gray-600 mb-1">Making your special day unforgettable</p>
                <p className="text-sm text-gray-500">For inquiries: <span className="font-semibold text-purple-600">support@weddingbazaar.com</span></p>
                {receipts.length > 0 && (
                  <p className="mt-3 text-xs text-gray-400 bg-gray-50 inline-block px-4 py-2 rounded-full">
                    {receipts.length} verified payment transaction{receipts.length !== 1 ? 's' : ''}
                  </p>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
