import React from 'react';
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
  Building2
} from 'lucide-react';
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
  if (!isOpen || !booking) return null;

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'PHP 0.00';
    return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDownloadReceipt = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
            font-size: 18px;
            font-weight: bold;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #dcfce7;
            color: #166534;
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
            <span class="label">Receipt Number:</span>
            <span class="value">${booking.bookingReference || `WB-${booking.id?.slice(-6)}`}</span>
          </div>
          <div class="info-row">
            <span class="label">Date Issued:</span>
            <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Status:</span>
            <span class="value"><span class="status-badge">Fully Paid</span></span>
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

        <div class="info-section">
          <h3 style="margin-bottom: 15px; color: #111827;">Payment Details</h3>
          <div class="info-row">
            <span class="label">Downpayment:</span>
            <span class="value">${formatCurrency(booking.downpaymentAmount)}</span>
          </div>
          <div class="info-row">
            <span class="label">Balance Paid:</span>
            <span class="value">${formatCurrency((booking.totalAmount || 0) - (booking.downpaymentAmount || 0))}</span>
          </div>
        </div>

        <div class="total-section">
          <div class="total-row">
            <span>Total Amount Paid:</span>
            <span>${formatCurrency(booking.totalAmount)}</span>
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
    
    // Wait for content to load then print
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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
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
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <div className="px-6 py-3 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Fully Paid
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

          {/* Payment Breakdown */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Payment Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-600">Downpayment</span>
                <span className="text-gray-900 font-semibold">{formatCurrency(booking.downpaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-green-200">
                <span className="text-gray-600">Balance Paid</span>
                <span className="text-gray-900 font-semibold">
                  {formatCurrency((booking.totalAmount || 0) - (booking.downpaymentAmount || 0))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Vendor Contact (if available) */}
          {(booking.vendorPhone || booking.vendorEmail) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Vendor Contact
              </h3>
              <div className="space-y-2">
                {booking.vendorPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{booking.vendorPhone}</span>
                  </div>
                )}
                {booking.vendorEmail && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-blue-500" />
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
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
