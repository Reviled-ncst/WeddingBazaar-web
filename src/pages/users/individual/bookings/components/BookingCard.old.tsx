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
  onViewLocation
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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Vendor Header with Image */}
      <div className="relative">
        {booking.vendorImage && (
          <div className="h-24 bg-gradient-to-r from-rose-500 to-pink-500 relative overflow-hidden">
            <img
              src={booking.vendorImage}
              alt={booking.vendorBusinessName || booking.vendorName}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
        )}
        
        <div className="p-6">
          {/* Vendor Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {booking.vendorImage && (
                  <img
                    src={booking.vendorImage}
                    alt={booking.vendorBusinessName || booking.vendorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.vendorBusinessName || booking.vendorName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {booking.vendorCategory || booking.serviceType}
                    </span>
                    {booking.vendorRating && typeof booking.vendorRating === 'number' && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {booking.vendorRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {booking.serviceName}
              </p>
              
              {booking.bookingReference && (
                <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                  Ref: {booking.bookingReference}
                </p>
              )}
            </div>
            
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 shrink-0",
              config.color
            )}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span className="font-medium">
                {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString()}
              </span>
              {booking.formattedEventTime && (
                <>
                  <Clock className="w-4 h-4 ml-2 text-blue-500" />
                  <span>{booking.formattedEventTime}</span>
                </>
              )}
            </div>
            
            {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && (
              <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                {booking.daysUntilEvent} day{booking.daysUntilEvent !== 1 ? 's' : ''} until event
              </div>
            )}
            
            {booking.eventLocation && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span>{booking.eventLocation}</span>
                  {booking.eventCoordinates && onViewLocation && (
                    <button
                      onClick={() => onViewLocation(booking)}
                      className="ml-2 text-blue-600 hover:text-blue-700 underline text-xs"
                    >
                      View Map
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {booking.guestCount && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-purple-500" />
                <span>{booking.guestCount} guests</span>
              </div>
            )}
          </div>

          {/* Vendor Contact Info */}
          {(booking.vendorPhone || booking.vendorEmail) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {booking.vendorPhone && (
                <a
                  href={`tel:${booking.vendorPhone}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{booking.vendorPhone}</span>
                </a>
              )}
              {booking.vendorEmail && (
                <a
                  href={`mailto:${booking.vendorEmail}`}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 bg-green-50 px-2 py-1 rounded-md transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{booking.vendorEmail}</span>
                </a>
              )}
            </div>
          )}

          {/* Payment Summary */}
          {booking.totalAmount && (
            <div className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-xl p-4 mb-4 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                </span>
              </div>
              {booking.totalPaid && booking.totalPaid > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount Paid</span>
                  <span className="text-sm font-medium text-green-600">
                    {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                  </span>
                </div>
              )}
              {booking.remainingBalance && booking.remainingBalance > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining Balance</span>
                  <span className="text-sm font-medium text-red-600">
                    {booking.formatted?.remainingBalance || `₱${booking.remainingBalance.toLocaleString()}`}
                  </span>
                </div>
              )}
              {booking.paymentProgressPercentage !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Payment Progress</span>
                    <span>{booking.paymentProgressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                    <div 
                      className={cn(
                        "bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300",
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
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onViewDetails(booking)}
              className="flex-1 min-w-[120px] bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            
            {booking.eventCoordinates && onViewLocation && (
              <button
                onClick={() => onViewLocation(booking)}
                className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                title="View event location on map"
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            )}
            
            {paymentActions.map((action) => (
              <button
                key={action.type}
                onClick={() => onPayment?.(booking, action.type)}
                className={cn(
                  "flex-1 min-w-[120px] px-4 py-2 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium",
                  action.variant === 'primary' 
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600" 
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                )}
              >
                <CreditCard className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
