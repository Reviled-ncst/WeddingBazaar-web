import React from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  Star,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { Booking } from '../types/booking.types';
import { statusConfig } from '../types/booking.types';
import { VendorImage } from './VendorImage';
import { ServiceImage } from './ServiceImage';

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
  
  // Icon mapping
  const iconMap: Record<string, any> = {
    FileText,
    MessageSquare,
    AlertCircle,
    CheckCircle,
    XCircle,
    CreditCard,
    Clock
  };
  
  const StatusIcon = iconMap[config.icon] || FileText;

  // List View Component - Simple Row Layout (NO CARDS!)
  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <ServiceImage
                src={booking.serviceImage}
                alt={`${booking.serviceName} service`}
                serviceType={booking.serviceType}
                size="sm"
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{booking.serviceName}</div>
              <div className="text-sm text-gray-500">{booking.vendorBusinessName || booking.vendorName}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{formatEventDate(booking.eventDate)}</div>
          <div className="text-sm text-gray-500">
            {booking.eventLocation}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="text-sm font-medium text-gray-900">₱{(booking.totalAmount || 0).toLocaleString()}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={cn(
            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
            config.color
          )}>
            {config.label}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => onViewDetails(booking)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            View
          </button>
        </td>
      </tr>
    );
  }

  // Grid View Component (Card Layout) - Clean implementation  
  return (
    <div className="w-full h-auto min-h-0 bg-white rounded-2xl shadow-lg border border-pink-200/50 hover:shadow-xl hover:border-pink-300 transition-all duration-300 overflow-hidden isolate flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 flex-1">
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

          {/* Center Section - Simple Status Display */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  config.color.includes('green') ? 'bg-green-500' :
                  config.color.includes('blue') ? 'bg-blue-500' :
                  config.color.includes('yellow') ? 'bg-yellow-500' :
                  config.color.includes('red') ? 'bg-red-500' :
                  'bg-gray-400'
                )}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{config.label}</p>
                  <p className="text-xs text-gray-500 truncate">Status: {booking.status.replace('_', ' ')}</p>
                </div>
                <StatusIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Right Section - Payment & Actions */}
          <div className="flex-shrink-0 w-full lg:w-64 space-y-4">
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
                onBookingUpdate={onBookingUpdate || (() => {})}
                onPayDeposit={onPayDeposit}
                onPayBalance={onPayBalance}
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
