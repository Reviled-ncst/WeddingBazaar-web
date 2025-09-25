import React from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Eye,
  Star,
  Phone,
  Mail,
  Map
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Booking } from '../types/booking.types';
import { statusConfig } from '../types/booking.types';
import { VendorImage } from './VendorImage';
import { ServiceImage } from './ServiceImage';
import { BookingProgress } from './BookingProgress';
import { BookingActions } from './BookingActions';

// Enhanced Booking interface to include vendor details and location
interface EnhancedBooking extends Booking {
  vendorBusinessName?: string;
  vendorCategory?: string;
  vendorImage?: string;
  vendorRating?: number;
  serviceImage?: string; // Primary service image
  serviceGallery?: string[]; // Array of service images
  eventCoordinates?: {
    lat: number;
    lng: number;
  };
  formattedEventDate?: string;
  formattedEventTime?: string;
  daysUntilEvent?: number;
}

interface BookingCardProps {
  booking: EnhancedBooking;
  onViewDetails: (booking: EnhancedBooking) => void;
  onBookingUpdate?: (updatedBooking: EnhancedBooking) => void;
  onPayment?: (booking: EnhancedBooking, paymentType: 'downpayment' | 'full_payment' | 'remaining_balance') => void;
  onPayDeposit?: (booking: EnhancedBooking) => void;
  onPayBalance?: (booking: EnhancedBooking) => void;
  onViewLocation?: (location: { name: string; coordinates?: { lat: number; lng: number } }) => void;
  onViewQuoteDetails?: (booking: EnhancedBooking) => void;
  viewMode?: 'grid' | 'list';
}

// Helper function to format event date
const formatEventDate = (dateString: string | Date) => {
  if (!dateString) return 'No date set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
  onBookingUpdate,
  onPayment,
  onPayDeposit,
  onPayBalance,
  onViewLocation,
  onViewQuoteDetails,
  viewMode = 'grid'
}) => {
  // Safe status config lookup
  const config = statusConfig[booking.status] || statusConfig['draft'];
  const StatusIcon = config.icon;

  // Get payment actions (mock implementation for now)
  const getPaymentActions = () => {
    const actions: any[] = [];
    
    if (booking.status === 'confirmed' && (!booking.downpaymentAmount || booking.downpaymentAmount === 0)) {
      actions.push({
        label: 'Pay Deposit',
        action: () => onPayDeposit?.(booking),
        variant: 'primary'
      });
    }
    
    return actions;
  };

  const paymentActions = getPaymentActions();

  // List View Component - Table-like Row Layout
  if (viewMode === 'list') {
    return (
      <div className="group bg-white border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 py-4 px-6">
        <div className="flex items-center gap-4">
          {/* Compact Images */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <ServiceImage
              src={booking.serviceImage}
              alt={`${booking.serviceName} service`}
              serviceType={booking.serviceType}
              size="sm"
              className="border border-gray-200"
            />
            <VendorImage
              src={booking.vendorImage}
              alt={booking.vendorBusinessName || booking.vendorName || 'Vendor'}
              fallbackText={booking.vendorBusinessName || booking.vendorName}
              size="sm"
              className="border border-gray-200"
            />
          </div>
          
          {/* Service & Vendor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {booking.serviceName}
              </h3>
              <span className="text-gray-500">•</span>
              <p className="text-gray-600 truncate">
                {booking.vendorBusinessName || booking.vendorName}
              </p>
            </div>
          </div>

          {/* Event Date & Location */}
          <div className="flex items-center gap-4 text-sm text-gray-600 min-w-0 flex-1">
            {booking.eventDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="truncate">{formatEventDate(booking.eventDate)}</span>
              </div>
            )}
            {booking.eventLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{booking.eventLocation}</span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="text-right min-w-0 flex-shrink-0">
            <p className="font-semibold text-gray-900">
              ₱{(booking.totalAmount || 0).toLocaleString()}
            </p>
            {booking.downpaymentAmount && booking.downpaymentAmount > 0 && (
              <p className="text-xs text-gray-500">
                ₱{booking.downpaymentAmount.toLocaleString()} deposit
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className={cn(
            "px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 flex-shrink-0",
            config.color
          )}>
            <StatusIcon className="w-4 h-4" />
            <span>{config.label}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <BookingActions
              booking={booking}
              onViewDetails={onViewDetails}
              onBookingUpdate={onBookingUpdate}
              onPayment={onPayment}
              onPayDeposit={onPayDeposit}
              onPayBalance={onPayBalance}
              onViewLocation={onViewLocation}
              onViewQuoteDetails={onViewQuoteDetails}
              className="text-xs"
            />
          </div>
        </div>
      </div>
    );
  }

  // Grid View Component (Card Layout) - Original enhanced implementation
  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-pink-200/50 hover:shadow-xl hover:border-pink-300 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Left Section - Enhanced Booking Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Service and Vendor Images */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="relative">
                <ServiceImage
                  src={booking.serviceImage}
                  alt={`${booking.serviceName} service`}
                  serviceType={booking.serviceType}
                  size="lg"
                  className="border-2 border-pink-200 shadow-lg"
                />
                {/* Status overlay on service image */}
                <div className="absolute -top-2 -right-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
                    config.color.split(' ')[2] + ' ' + config.color.split(' ')[0]
                  )}>
                    <StatusIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
              
              <VendorImage
                src={booking.vendorImage}
                alt={booking.vendorBusinessName || booking.vendorName || 'Vendor'}
                fallbackText={booking.vendorBusinessName || booking.vendorName}
                size="md"
                className="border-2 border-pink-200 shadow-lg"
              />
            </div>

            {/* Enhanced Booking Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                    {booking.serviceName}
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-gray-700 font-medium">
                      {booking.vendorBusinessName || booking.vendorName}
                    </p>
                    {booking.vendorRating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-yellow-700">{booking.vendorRating}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 flex-shrink-0",
                  config.color
                )}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{config.label}</span>
                </div>
              </div>
              
              {/* Compact Event Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span className="font-medium">{booking.formattedEventDate || formatEventDate(booking.eventDate)}</span>
                </div>
                {booking.eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="truncate">{booking.eventLocation}</span>
                  </div>
                )}
                {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-700 font-medium">{booking.daysUntilEvent} days left</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Section - Compact Linear Progress */}
          <div className="lg:w-80 xl:w-96">
            <BookingProgress
              currentStatus={booking.status}
              bookingId={booking.id}
              vendorName={booking.vendorBusinessName || booking.vendorName || 'Unknown Vendor'}
              serviceName={booking.serviceName}
              className="border border-gray-100 shadow-sm p-3 bg-gray-50/50 rounded-xl"
            />
          </div>

          {/* Right Section - Enhanced Payment & Actions */}
          <div className="lg:w-64 xl:w-72 space-y-4">
            {/* Enhanced Payment Info */}
            {booking.totalAmount && (
              <div className="bg-gradient-to-r from-gray-50 via-pink-50/30 to-rose-50/30 rounded-xl p-4 border border-gray-100">
                <div className="text-center mb-3">
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{booking.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
                
                {((booking.totalPaid && booking.totalPaid > 0) || (booking.remainingBalance && booking.remainingBalance > 0)) ? (
                  <div className="space-y-2 text-sm">
                    {booking.totalPaid && booking.totalPaid > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-semibold text-green-600">
                          ₱{booking.totalPaid.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.remainingBalance && booking.remainingBalance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-semibold text-rose-600">
                          ₱{booking.remainingBalance.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-500">No payments made</p>
                )}
              </div>
            )}

            {/* Enhanced Actions */}
            <div className="space-y-2">
              <BookingActions
                booking={booking}
                onViewDetails={onViewDetails}
                onBookingUpdate={onBookingUpdate}
                onPayment={onPayment}
                onPayDeposit={onPayDeposit}
                onPayBalance={onPayBalance}
                onViewLocation={onViewLocation}
                onViewQuoteDetails={onViewQuoteDetails}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
