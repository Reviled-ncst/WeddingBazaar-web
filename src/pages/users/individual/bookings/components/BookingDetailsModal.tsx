import React, { useState, useEffect } from 'react';
import { 
  X,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  CreditCard,
  Download,
  Receipt,
  Star,
  Map,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Booking } from '../types/booking.types';
import { statusConfig } from '../types/booking.types';
import { paymentService } from '../../payment/services';
import type { PaymentReceipt } from '../../payment/types/payment.types';
import { ReceiptView } from '../../payment/components/ReceiptView';
import { VendorImage } from './VendorImage';
import { ServiceImage } from './ServiceImage';

// Import Leaflet for maps
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Configure Leaflet marker icons
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Enhanced Booking interface to include vendor details and location
interface EnhancedBooking extends Booking {
  vendorBusinessName?: string;
  vendorCategory?: string;
  vendorImage?: string;
  vendorRating?: number;
  serviceImage?: string; // Primary service image
  serviceGallery?: string[]; // Array of service images
  serviceId?: string; // Service ID for display
  eventCoordinates?: {
    lat: number;
    lng: number;
  };
  formattedEventDate?: string;
  formattedEventTime?: string;
  daysUntilEvent?: number;
}

interface BookingDetailsModalProps {
  booking: EnhancedBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onPayment?: (booking: EnhancedBooking, paymentType: 'downpayment' | 'full_payment' | 'remaining_balance') => void;
}

const iconMap = {
  Clock,
  AlertCircle: MessageSquare, // Fallback
  FileText,
  MessageSquare,
  CheckCircle: CreditCard, // Fallback
  CreditCard,
  XCircle: X // Fallback
};

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onPayment
}) => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [showReceiptView, setShowReceiptView] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      // Fetch receipts when the modal opens and booking is available
      fetchReceipts();
    }
  }, [isOpen, booking]);

  const fetchReceipts = async () => {
    if (!booking) return;
    
    setLoadingReceipts(true);
    try {
      const data = await paymentService.getPaymentReceipts(booking.id);
      setReceipts(data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setReceipts([]);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptView(true);
  };

  const handleDownloadPDF = async (receipt: PaymentReceipt) => {
    try {
      const blob = await paymentService.downloadReceiptPDF(receipt.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const handleEmailReceipt = async (receipt: PaymentReceipt, email: string) => {
    try {
      const success = await paymentService.emailReceipt(receipt.id, email);
      if (success) {
        // Show success message
        console.log('Receipt emailed successfully');
      }
    } catch (error) {
      console.error('Error emailing receipt:', error);
    }
  };

  if (!isOpen || !booking) return null;

  const config = statusConfig[booking.status];
  const StatusIcon = iconMap[config.icon as keyof typeof iconMap] || Clock;

  const getPaymentActions = () => {
    const actions = [];
    
    // Get total amount from totalAmount property
    const totalAmount = booking.totalAmount;
    const downpaymentAmount = booking.downpaymentAmount;
    const remainingBalance = booking.remainingBalance;
    
    if (booking.status === 'confirmed' && !downpaymentAmount && totalAmount) {
      actions.push({
        type: 'downpayment' as const,
        label: 'Pay Downpayment',
        amount: downpaymentAmount || (totalAmount * 0.3),
        variant: 'primary'
      });
    }
    
    if (booking.status === 'downpayment_paid' && remainingBalance && remainingBalance > 0) {
      actions.push({
        type: 'remaining_balance' as const,
        label: 'Pay Remaining Balance',
        amount: remainingBalance,
        variant: 'primary'
      });
    }
    
    if (booking.status === 'confirmed' && totalAmount) {
      actions.push({
        type: 'full_payment' as const,
        label: 'Pay Full Amount',
        amount: totalAmount,
        variant: 'secondary'
      });
    }
    
    return actions;
  };

  const paymentActions = getPaymentActions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header with Service Image Background */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-pink-400 to-rose-400 relative overflow-hidden">
            <ServiceImage
              src={booking.serviceImage}
              alt={`${booking.serviceName} service`}
              serviceType={booking.serviceType}
              size="full"
              rounded={false}
              className="w-full h-32 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 to-transparent"></div>
          </div>
          
          <div className="p-6 border-b border-pink-100 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <VendorImage
                  src={booking.vendorImage}
                  alt={booking.vendorBusinessName || booking.vendorName || 'Vendor'}
                  fallbackText={booking.vendorBusinessName || booking.vendorName}
                  size="md"
                  className="border-4 border-pink-200 shadow-lg"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {booking.serviceName}
                  </h2>
                  <p className="text-pink-600 font-medium text-lg mb-1">
                    by {booking.vendorBusinessName || booking.vendorName}
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-gray-700">
                      {booking.vendorCategory || booking.serviceType}
                    </span>
                    {booking.vendorRating && typeof booking.vendorRating === 'number' && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-pink-400 fill-current" />
                        <span className="text-sm font-medium text-gray-800">
                          {booking.vendorRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {booking.bookingReference && (
                      <span className="text-sm text-gray-600 font-mono bg-pink-50 px-2 py-1 rounded border border-pink-200">
                        Ref: {booking.bookingReference}
                      </span>
                    )}
                    {booking.serviceId && (
                      <span className="text-sm text-pink-700 font-mono bg-pink-100 px-2 py-1 rounded border border-pink-300">
                        Service ID: {booking.serviceId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                title="Close modal"
                aria-label="Close booking details"
                className="p-2 hover:bg-pink-50 rounded-xl transition-colors text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-white">
          {/* Status */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2",
              config.color
            )}>
              <StatusIcon className="w-4 h-4" />
              {config.label}
            </div>
            {booking.bookingReference && (
              <span className="text-sm text-gray-600">
                Reference: {booking.bookingReference}
              </span>
            )}
          </div>

          {/* Enhanced Event Information */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Event Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="text-sm text-gray-700">Event Date</p>
                    <p className="font-semibold text-lg text-gray-900">
                      {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                {booking.eventTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-pink-400" />
                    <div>
                      <p className="text-sm text-gray-700">Event Time</p>
                      <p className="font-semibold text-gray-900">
                        {booking.formattedEventTime || booking.eventTime}
                      </p>
                    </div>
                  </div>
                )}
                
                {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && (
                  <div className="bg-pink-100 border border-pink-300 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <div>
                        <p className="text-sm text-rose-700 font-medium">Countdown</p>
                        <p className="text-lg font-bold text-rose-800">
                          {booking.daysUntilEvent} day{booking.daysUntilEvent !== 1 ? 's' : ''} until event
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Event Location</p>
                    <p className="font-semibold">{booking.eventLocation}</p>
                    {booking.eventCoordinates && (
                      <button
                        onClick={() => setShowMapModal(true)}
                        title="View event location on map"
                        aria-label="View event location on map"
                        className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        <Map className="w-4 h-4" />
                        View on Map
                      </button>
                    )}
                  </div>
                </div>
                
                {booking.guestCount && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Guest Count</p>
                      <p className="font-semibold">{booking.guestCount} guests</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {booking.venueDetails && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">Venue Details</p>
                <p className="text-gray-800">{booking.venueDetails}</p>
              </div>
            )}
            
            {booking.specialRequests && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">Special Requests</p>
                <p className="text-gray-800">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Enhanced Vendor Information */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Vendor Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-semibold text-lg">{booking.vendorBusinessName || booking.vendorName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Category</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {booking.vendorCategory || booking.serviceType}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Offered</p>
                  <p className="font-medium">{booking.serviceName}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {(booking.vendorPhone || booking.vendorEmail) && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Contact Methods</p>
                    <div className="space-y-3">
                      {booking.vendorPhone && (
                        <a
                          href={`tel:${booking.vendorPhone}`}
                          className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
                        >
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm text-green-700 font-medium">Call Vendor</p>
                            <p className="font-semibold text-green-800">{booking.vendorPhone}</p>
                          </div>
                        </a>
                      )}
                      
                      {booking.vendorEmail && (
                        <a
                          href={`mailto:${booking.vendorEmail}`}
                          className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                        >
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-700 font-medium">Email Vendor</p>
                            <p className="font-semibold text-blue-800 truncate">{booking.vendorEmail}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {booking.responseMessage && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Vendor Response</p>
                    <p className="text-gray-800 italic">"{booking.responseMessage}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {booking.totalAmount && (
            <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                  </span>
                </div>
                
                {booking.downpaymentAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Downpayment Required</span>
                    <span className="font-semibold text-blue-600">
                      {booking.formatted?.downpaymentAmount || `₱${booking.downpaymentAmount.toLocaleString()}`}
                    </span>
                  </div>
                )}
                
                {booking.totalPaid && booking.totalPaid > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Amount Paid</span>
                    <span className="font-semibold text-green-600">
                      {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                    </span>
                  </div>
                )}
                
                {booking.remainingBalance && booking.remainingBalance > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Remaining Balance</span>
                    <span className="font-semibold text-red-600">
                      {booking.formatted?.remainingBalance || `₱${booking.remainingBalance.toLocaleString()}`}
                    </span>
                  </div>
                )}
                
                {booking.paymentProgressPercentage !== undefined && (
                  <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Payment Progress</span>
                      <span>{booking.paymentProgressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={cn(
                          "bg-green-500 h-3 rounded-full transition-all duration-300",
                          booking.paymentProgressPercentage >= 100 ? "w-full" :
                          booking.paymentProgressPercentage >= 75 ? "w-3/4" :
                          booking.paymentProgressPercentage >= 50 ? "w-1/2" :
                          booking.paymentProgressPercentage >= 25 ? "w-1/4" :
                          booking.paymentProgressPercentage > 0 ? "w-1/12" : "w-0"
                        )}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Receipts Section */}
          {receipts.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-600" />
                Payment Receipts ({receipts.length})
              </h3>
              
              {loadingReceipts ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading receipts...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receipts.map((receipt) => (
                    <div key={receipt.id} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">#{receipt.receiptNumber}</span>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              receipt.status === 'completed' ? 'bg-green-100 text-green-700' :
                              receipt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {receipt.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              {new Intl.NumberFormat('en-PH', {
                                style: 'currency',
                                currency: receipt.currency || 'PHP'
                              }).format(receipt.amount)}
                            </span>
                            <span className="capitalize">{receipt.paymentType.replace('_', ' ')}</span>
                            <span>
                              {new Date(receipt.issuedDate).toLocaleDateString('en-PH')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewReceipt(receipt)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Receipt"
                            aria-label="View receipt details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDownloadPDF(receipt)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download PDF"
                            aria-label="Download receipt as PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Requests</h3>
              <p className="text-gray-700">{booking.specialRequests}</p>
            </div>
          )}

          {/* Response Message */}
          {booking.responseMessage && (
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendor Response</h3>
              <p className="text-gray-700 italic">"{booking.responseMessage}"</p>
            </div>
          )}



          {/* Venue Details */}
          {booking.venueDetails && (
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Venue Details</h3>
              <p className="text-gray-700">{booking.venueDetails}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              title="Close modal"
              aria-label="Close booking details modal"
            >
              Close
            </button>
            <button 
              className="px-6 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors flex items-center gap-2"
              title="Send message to vendor"
              aria-label="Send message to vendor"
            >
              <MessageSquare className="w-4 h-4" />
              Message Vendor
            </button>
            <button 
              className="px-6 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors flex items-center gap-2"
              title="Download contract"
              aria-label="Download booking contract"
            >
              <Download className="w-4 h-4" />
              Download Contract
            </button>
            
            {paymentActions.map((action) => (
              <button
                key={action.type}
                onClick={() => onPayment?.(booking, action.type)}
                title={action.label}
                aria-label={action.label}
                className={cn(
                  "px-6 py-2 rounded-xl transition-colors flex items-center gap-2",
                  action.variant === 'primary' 
                    ? "bg-pink-500 text-white hover:bg-pink-600" 
                    : "bg-blue-500 text-white hover:bg-blue-600"
                )}
              >
                <CreditCard className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Receipt View Modal */}
      {showReceiptView && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Receipt</h2>
              <button
                onClick={() => setShowReceiptView(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close receipt modal"
                aria-label="Close receipt modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <ReceiptView
                receipt={selectedReceipt}
                onDownloadPDF={() => handleDownloadPDF(selectedReceipt)}
                onEmailReceipt={(email) => handleEmailReceipt(selectedReceipt, email)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Map Modal */}
      {showMapModal && booking.eventCoordinates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Event Location</h3>
                <p className="text-gray-600 mt-1">{booking.eventLocation}</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close map"
                aria-label="Close map modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Map Container */}
            <div className="h-96">
              <MapContainer
                center={[booking.eventCoordinates.lat, booking.eventCoordinates.lng]}
                zoom={15}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[booking.eventCoordinates.lat, booking.eventCoordinates.lng]}>
                  <Popup>
                    <div className="text-center">
                      <h4 className="font-semibold">{booking.eventLocation}</h4>
                      <p className="text-sm text-gray-600 mt-1">Event Venue</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.formattedEventDate} • {booking.formattedEventTime}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            
            {/* Map Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Coordinates: {booking.eventCoordinates.lat.toFixed(6)}, {booking.eventCoordinates.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Event on {booking.formattedEventDate} at {booking.formattedEventTime}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={`https://www.google.com/maps?q=${booking.eventCoordinates.lat},${booking.eventCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                  >
                    Open in Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?q=${booking.eventCoordinates.lat},${booking.eventCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors text-sm font-medium"
                  >
                    Open in Apple Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
