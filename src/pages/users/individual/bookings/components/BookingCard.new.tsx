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

// Enhanced Booking interface to include vendor details and location
interface EnhancedBooking extends Booking {
  vendorBusinessName?: string;
  vendorCategory?: string;
  vendorImage?: string;
  vendorRating?: number;
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
  onPayment?: (booking: EnhancedBooking, paymentType: 'downpayment' | 'full_payment' | 'remaining_balance') => void;
  onViewLocation?: (booking: EnhancedBooking) => void;
  viewMode?: 'grid' | 'list';
}

const iconMap = {
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  CheckCircle,
  CreditCard,
  XCircle
};

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
  onPayment,
  onViewLocation,
  viewMode = 'grid'
}) => {
  const config = statusConfig[booking.status];
  const StatusIcon = iconMap[config.icon as keyof typeof iconMap] || Clock;

  const getPaymentActions = () => {
    const actions = [];
    
    if (booking.status === 'confirmed' && !booking.downpaymentAmount) {
      actions.push({
        type: 'downpayment' as const,
        label: 'Pay Downpayment',
        amount: booking.downpaymentAmount || (booking.totalAmount ? booking.totalAmount * 0.3 : 0),
        variant: 'primary'
      });
    }
    
    if (booking.status === 'downpayment_paid' && booking.remainingBalance && booking.remainingBalance > 0) {
      actions.push({
        type: 'remaining_balance' as const,
        label: 'Pay Balance',
        amount: booking.remainingBalance,
        variant: 'primary'
      });
    }
    
    if (booking.status === 'confirmed' && booking.totalAmount) {
      actions.push({
        type: 'full_payment' as const,
        label: 'Pay Full Amount',
        amount: booking.totalAmount,
        variant: 'secondary'
      });
    }
    
    return actions;
  };

  const paymentActions = getPaymentActions();

  // List View Component
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Main Info */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Vendor Avatar/Image */}
              <div className="relative">
                {booking.vendorImage ? (
                  <img
                    src={booking.vendorImage}
                    alt={booking.vendorBusinessName || booking.vendorName}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {(booking.vendorBusinessName || booking.vendorName)?.charAt(0) || 'V'}
                    </span>
                  </div>
                )}
                <div className={cn(
                  "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white text-xs",
                  config.color.includes('green') ? 'bg-green-500 text-white' :
                  config.color.includes('blue') ? 'bg-blue-500 text-white' :
                  config.color.includes('yellow') ? 'bg-yellow-500 text-white' :
                  config.color.includes('red') ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                )}>
                  <StatusIcon className="w-3 h-3" />
                </div>
              </div>

              {/* Booking Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {booking.vendorBusinessName || booking.vendorName}
                  </h3>
                  {booking.vendorRating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{booking.vendorRating}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{booking.serviceType} • {booking.serviceName}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString()}</span>
                  </div>
                  {booking.eventLocation && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-xs">{booking.eventLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Section - Status & Payment */}
            <div className="flex items-center space-x-6">
              {/* Status Badge */}
              <div className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2",
                config.color
              )}>
                <StatusIcon className="w-4 h-4" />
                <span>{config.label}</span>
              </div>

              {/* Payment Info */}
              {booking.totalAmount && (
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                  </p>
                  {booking.totalPaid && booking.totalPaid > 0 && (
                    <p className="text-sm text-green-600">
                      Paid: {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                    </p>
                  )}
                  {booking.remainingBalance && booking.remainingBalance > 0 && (
                    <p className="text-sm text-red-600">
                      Balance: {booking.formatted?.remainingBalance || `₱${booking.remainingBalance.toLocaleString()}`}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2 ml-6">
              <button
                onClick={() => onViewDetails(booking)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                Details
              </button>
              
              {booking.eventCoordinates && onViewLocation && (
                <button
                  onClick={() => onViewLocation(booking)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <Map className="w-4 h-4" />
                  Map
                </button>
              )}
              
              {paymentActions.length > 0 && paymentActions[0] && onPayment && (
                <button
                  onClick={() => onPayment(booking, paymentActions[0].type)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium",
                    paymentActions[0].variant === 'primary' 
                      ? "bg-rose-600 text-white hover:bg-rose-700" 
                      : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  )}
                >
                  <CreditCard className="w-4 h-4" />
                  {paymentActions[0].label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Component (Enhanced)
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Enhanced Header with Gradient Overlay */}
      <div className="relative">
        {booking.vendorImage ? (
          <div className="h-32 relative overflow-hidden">
            <img
              src={booking.vendorImage}
              alt={booking.vendorBusinessName || booking.vendorName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {booking.vendorBusinessName || booking.vendorName}
                  </h3>
                  <p className="text-sm text-white/90">{booking.vendorCategory || booking.serviceType}</p>
                </div>
                {booking.vendorRating && (
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-white font-medium">{booking.vendorRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-bold text-white mb-1">
                {booking.vendorBusinessName || booking.vendorName}
              </h3>
              <p className="text-sm text-white/90">{booking.vendorCategory || booking.serviceType}</p>
            </div>
          </div>
        )}
        
        {/* Status Badge - Positioned absolutely */}
        <div className="absolute top-4 right-4">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm flex items-center gap-1.5",
            "bg-white/90 text-gray-800 border-white/50"
          )}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Service Details */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-1">{booking.serviceName}</h4>
          <p className="text-sm text-gray-600">Reference: {booking.bookingReference || booking.id}</p>
        </div>

        {/* Event Details with Icons */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString()}
              </p>
              <p className="text-gray-500">{booking.formattedEventTime || booking.eventTime || 'Time TBD'}</p>
            </div>
          </div>
          
          {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-blue-600 font-medium">{booking.daysUntilEvent} days until event</p>
            </div>
          )}
          
          {booking.eventLocation && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-900 font-medium">{booking.eventLocation}</p>
            </div>
          )}
          
          {booking.guestCount && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-gray-900">{booking.guestCount} guests</p>
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(booking.vendorPhone || booking.vendorEmail) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {booking.vendorPhone && (
              <a
                href={`tel:${booking.vendorPhone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            )}
            {booking.vendorEmail && (
              <a
                href={`mailto:${booking.vendorEmail}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </a>
            )}
          </div>
        )}

        {/* Enhanced Payment Summary */}
        {booking.totalAmount && (
          <div className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">
                {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
              </span>
            </div>
            {booking.totalPaid && booking.totalPaid > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Amount Paid</span>
                <span className="text-sm font-semibold text-green-600">
                  {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                </span>
              </div>
            )}
            {booking.remainingBalance && booking.remainingBalance > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Remaining Balance</span>
                <span className="text-sm font-semibold text-red-600">
                  {booking.formatted?.remainingBalance || `₱${booking.remainingBalance.toLocaleString()}`}
                </span>
              </div>
            )}
            {booking.paymentProgressPercentage !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Payment Progress</span>
                  <span className="text-xs font-medium text-gray-700">{booking.paymentProgressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-300",
                      booking.paymentProgressPercentage >= 100 ? 'w-full' :
                      booking.paymentProgressPercentage >= 75 ? 'w-3/4' :
                      booking.paymentProgressPercentage >= 50 ? 'w-1/2' :
                      booking.paymentProgressPercentage >= 25 ? 'w-1/4' :
                      booking.paymentProgressPercentage > 0 ? 'w-1/12' : 'w-0'
                    )}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex-1 min-w-[120px] bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          
          {booking.eventCoordinates && onViewLocation && (
            <button
              onClick={() => onViewLocation(booking)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl hover:from-blue-200 hover:to-blue-300 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Map className="w-4 h-4" />
              Map
            </button>
          )}
          
          {paymentActions.map((action) => (
            <button
              key={action.type}
              onClick={() => onPayment && onPayment(booking, action.type)}
              className={cn(
                "px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm",
                action.variant === 'primary' 
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700" 
                  : "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 hover:from-rose-200 hover:to-pink-200"
              )}
            >
              <CreditCard className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
