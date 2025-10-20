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
import { BookingWorkflow } from '../../../../../shared/components/booking/BookingWorkflow';

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
  budgetRange?: string;
  preferredContactMethod?: string;
  responseMessage?: string;
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
  const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'payments'>('details');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && booking) {
      // Fetch receipts when the modal opens and booking is available
      fetchReceipts();
    }
  }, [isOpen, booking]);

  const fetchReceipts = async () => {
    if (!booking) return;
    
    setLoadingReceipts(true);
    setError(null);
    try {
      const data = await paymentService.getPaymentReceipts(booking.id);
      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setError("Failed to load payment receipts. Please try again.");
      setReceipts([]);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '₱0';
    return `₱${amount.toLocaleString()}`;
  };

  const calculateDaysUntilEvent = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFormattedEventDate = (eventDate: string) => {
    return new Date(eventDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  const loadReceipts = async () => {
    if (!booking) return;
    await fetchReceipts();
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

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={cn(
                  "py-2 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'details'
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Event Details
              </button>
              <button
                onClick={() => setActiveTab('workflow')}
                className={cn(
                  "py-2 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'workflow'
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Booking Progress
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={cn(
                  "py-2 px-1 border-b-2 font-medium text-sm",
                  activeTab === 'payments'
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Payments & Receipts
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">

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
                      {booking.formattedEventDate || getFormattedEventDate(booking.eventDate)}
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
                
                {(booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0) || calculateDaysUntilEvent(booking.eventDate) > 0 ? (
                  <div className="bg-pink-100 border border-pink-300 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <div>
                        <p className="text-sm text-rose-700 font-medium">Countdown</p>
                        <p className="text-lg font-bold text-rose-800">
                          {booking.daysUntilEvent || calculateDaysUntilEvent(booking.eventDate)} day{(booking.daysUntilEvent || calculateDaysUntilEvent(booking.eventDate)) !== 1 ? 's' : ''} until event
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Event Location</p>
                    <p className="font-semibold">{booking.eventLocation}</p>
                    {/* Always show View on Map button - uses Google Maps search */}
                    <button
                      onClick={() => {
                        if (booking.eventCoordinates) {
                          // If coordinates available, use map modal
                          setShowMapModal(true);
                        } else {
                          // Otherwise, open Google Maps search with location text
                          const address = encodeURIComponent(booking.eventLocation || 'Philippines');
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                        }
                      }}
                      title="View event location on map"
                      aria-label="View event location on map"
                      className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      <Map className="w-4 h-4" />
                      View on Map
                    </button>
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
                
                {booking.formattedEventTime && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-sm text-gray-600">Event Time</p>
                      <p className="font-semibold">{booking.formattedEventTime}</p>
                    </div>
                  </div>
                )}
                
                {booking.budgetRange && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Budget Range</p>
                      <p className="font-semibold">{booking.budgetRange}</p>
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
            
            {/* Communication History Section */}
            {(booking.responseMessage || booking.preferredContactMethod) && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Communication & Updates
                </h3>
                
                <div className="space-y-4">
                  {booking.responseMessage && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 font-medium mb-2">Latest Vendor Response</p>
                          <p className="text-gray-800 leading-relaxed">{booking.responseMessage}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {booking.updatedAt && new Date(booking.updatedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {booking.preferredContactMethod && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Preferred Contact Method</p>
                      <div className="flex items-center gap-2">
                        {booking.preferredContactMethod === 'phone' && <Phone className="w-4 h-4 text-green-600" />}
                        {booking.preferredContactMethod === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                        {booking.preferredContactMethod === 'sms' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                        <span className="font-medium capitalize">{booking.preferredContactMethod}</span>
                      </div>
                    </div>
                  )}
                </div>
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
                  <p className="font-semibold text-lg">{booking.vendorBusinessName || booking.vendorName || 'Vendor Name Not Available'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Category</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {booking.vendorCategory || booking.serviceType || 'General Service'}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Offered</p>
                  <p className="font-medium">{booking.serviceName || 'Service details not available'}</p>
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
                    {booking.formatted?.totalAmount || formatCurrency(booking.totalAmount)}
                  </span>
                </div>
                
                {booking.downpaymentAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Downpayment Required</span>
                    <span className="font-semibold text-blue-600">
                      {booking.formatted?.downpaymentAmount || formatCurrency(booking.downpaymentAmount)}
                    </span>
                  </div>
                )}
                
                {booking.totalPaid && booking.totalPaid > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Amount Paid</span>
                    <span className="font-semibold text-green-600">
                      {booking.formatted?.totalPaid || formatCurrency(booking.totalPaid)}
                    </span>
                  </div>
                )}
                
                {booking.remainingBalance && booking.remainingBalance > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Remaining Balance</span>
                    <span className="font-semibold text-red-600">
                      {booking.formatted?.remainingBalance || formatCurrency(booking.remainingBalance)}
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
          )}

          {/* Workflow Tab */}
          {activeTab === 'workflow' && (
            <div>
              <BookingWorkflow 
                booking={booking as any} // Type cast for compatibility
                onUpdate={() => {
                  // Refresh booking data if needed
                  window.location.reload();
                }}
              />
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  Payment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {booking.totalAmount && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">{booking.formatted?.totalAmount}</p>
                    </div>
                  )}
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-xl font-bold text-green-600">{booking.formatted?.totalPaid || formatCurrency(booking.totalPaid)}</p>
                  </div>
                  
                  {booking.remainingBalance && booking.remainingBalance > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
                      <p className="text-xl font-bold text-orange-600">{booking.formatted?.remainingBalance}</p>
                    </div>
                  )}
                </div>

                {/* Payment Progress Bar */}
                {booking.paymentProgressPercentage !== undefined && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Payment Progress</span>
                      <span className="text-sm font-medium text-gray-900">{booking.paymentProgressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={cn(
                          "bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300",
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

              {/* Payment Actions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Payment Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {paymentActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => onPayment?.(booking, action.type)}
                      className={cn(
                        "px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium",
                        action.variant === 'primary' 
                          ? "bg-pink-500 text-white hover:bg-pink-600" 
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      )}
                    >
                      <CreditCard className="w-5 h-5" />
                      {action.label}
                      <span className="text-sm opacity-90">
                        ({formatCurrency(action.amount)})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipts Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-600" />
                    Payment Receipts
                  </h4>
                  <button
                    onClick={loadReceipts}
                    disabled={loadingReceipts}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                  >
                    {loadingReceipts ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Load Receipts
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 text-xs underline mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                {receipts.length > 0 ? (
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Receipt #{receipt.receiptNumber}</p>
                            <p className="text-sm text-gray-600">
                              {receipt.paymentType} - {formatCurrency(receipt.amount)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setShowReceiptView(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No payment receipts available</p>
                )}
              </div>
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
