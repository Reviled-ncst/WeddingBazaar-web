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
  onViewLocation?: (booking: EnhancedBooking) => void;
  onViewQuoteDetails?: (booking: EnhancedBooking) => void;
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
  onBookingUpdate,
  onPayment,
  onPayDeposit,
  onPayBalance,
  onViewLocation,
  onViewQuoteDetails,
  viewMode = 'grid'
}) => {
  const config = statusConfig[booking.status];
  const StatusIcon = iconMap[config.icon as keyof typeof iconMap] || Clock;

  const getPaymentActions = () => {
    const actions = [];
    
    // Show downpayment button if booking is confirmed (hasn't been paid yet)
    if (booking.status === 'confirmed') {
      actions.push({
        type: 'downpayment' as const,
        label: 'Pay Deposit',
        amount: booking.downpaymentAmount || (booking.totalAmount ? booking.totalAmount * 0.3 : 0),
        variant: 'primary'
      });
      
      // Also show full payment option for confirmed bookings
      if (booking.totalAmount) {
        actions.push({
          type: 'full_payment' as const,
          label: 'Pay Full Amount',
          amount: booking.totalAmount,
          variant: 'secondary'
        });
      }
    }
    
    // Show balance button if downpayment is paid but full payment isn't complete
    if (booking.status === 'downpayment_paid' && booking.remainingBalance && booking.remainingBalance > 0) {
      actions.push({
        type: 'remaining_balance' as const,
        label: 'Pay Balance',
        amount: booking.remainingBalance,
        variant: 'primary'
      });
    }
    
    return actions;
  };

  const paymentActions = getPaymentActions();

  // List View Component - Enhanced Linear Progress Layout
  if (viewMode === 'list') {
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
                      statusConfig[booking.status].color.split(' ')[2] + ' ' + statusConfig[booking.status].color.split(' ')[0]
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
                    statusConfig[booking.status].color
                  )}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{statusConfig[booking.status].label}</span>
                  </div>
                </div>
                
                {/* Compact Event Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">{booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString()}</span>
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
                      {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                  
                  {(booking.totalPaid && booking.totalPaid > 0) || (booking.remainingBalance && booking.remainingBalance > 0) ? (
                    <div className="space-y-2 text-sm">
                      {booking.totalPaid && booking.totalPaid > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid:</span>
                          <span className="font-semibold text-green-600">
                            {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      {booking.remainingBalance && booking.remainingBalance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className="font-semibold text-red-600">
                            {booking.formatted?.remainingBalance || `₱${booking.remainingBalance.toLocaleString()}`}
                          </span>
                        </div>
                      )}
                      
                      {booking.paymentProgressPercentage !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs font-medium">{booking.paymentProgressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={cn(
                                "bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500",
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
                  ) : null}
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails(booking)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  
                  {booking.eventCoordinates && onViewLocation && (
                    <button
                      onClick={() => onViewLocation(booking)}
                      className="px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl hover:from-blue-200 hover:to-blue-300 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                    >
                      <Map className="w-4 h-4" />
                      Map
                    </button>
                  )}
                </div>
                
                {paymentActions.length > 0 && (
                  <div className="space-y-2">
                    {paymentActions.map((action) => (
                      <button
                        key={action.type}
                        onClick={() => onPayment && onPayment(booking, action.type)}
                        className={cn(
                          "w-full px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm",
                          action.variant === 'primary' 
                            ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700" 
                            : "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 hover:from-rose-200 hover:to-pink-200"
                        )}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="truncate">{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Booking Actions */}
                {onBookingUpdate && (
                  <BookingActions 
                    booking={booking} 
                    onBookingUpdate={onBookingUpdate}
                    onViewQuoteDetails={onViewQuoteDetails}
                    onPayDeposit={onPayDeposit}
                    onPayBalance={onPayBalance}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Component (Enhanced with Better Flow)
  return (
    <div className="group bg-white rounded-3xl shadow-lg border border-pink-200/50 overflow-hidden hover:shadow-2xl hover:border-pink-300 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
      {/* Enhanced Header with Service Image Background and Better Overlay */}
      <div className="relative h-40 overflow-hidden">
        {/* Service Image as Background */}
        <ServiceImage
          src={booking.serviceImage}
          alt={`${booking.serviceName} service`}
          serviceType={booking.serviceType}
          size="full"
          rounded={false}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        
        {/* Status Badge - Enhanced positioning */}
        <div className="absolute top-4 right-4">
          <div className={cn(
            "px-3 py-2 rounded-xl text-xs font-semibold border backdrop-blur-md flex items-center gap-2 shadow-lg",
            "bg-white/95 text-gray-800 border-white/70"
          )}>
            <StatusIcon className="w-4 h-4" />
            <span>{config.label}</span>
          </div>
        </div>
        
        {/* Days Until Event Badge */}
        {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && booking.daysUntilEvent <= 30 && (
          <div className="absolute top-4 left-4">
            <div className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/90 text-white border border-rose-400/50 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <Clock className="w-4 h-4" />
              <span>{booking.daysUntilEvent} days left</span>
            </div>
          </div>
        )}
        
        {/* Enhanced Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                {booking.serviceName}
              </h3>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-white/90 font-medium">{booking.vendorBusinessName || booking.vendorName}</p>
                {booking.vendorRating && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm rounded-full px-2 py-1 border border-yellow-300/30">
                    <Star className="w-3 h-3 text-yellow-300 fill-current" />
                    <span className="text-sm text-yellow-100 font-medium">{booking.vendorRating}</span>
                  </div>
                )}
              </div>
              <p className="text-white/70 text-sm">{booking.vendorCategory || booking.serviceType}</p>
            </div>
            
            {/* Vendor Image - Repositioned */}
            <div className="ml-4">
              <VendorImage
                src={booking.vendorImage}
                alt={booking.vendorBusinessName || booking.vendorName || 'Vendor'}
                fallbackText={booking.vendorBusinessName || booking.vendorName}
                size="md"
                className="border-3 border-white/80 shadow-xl ring-2 ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-6 space-y-6">
        {/* Booking Reference & Service Gallery */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Ref:</span> {booking.bookingReference || booking.id}
          </div>
          {booking.serviceGallery && booking.serviceGallery.length > 1 && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{booking.serviceGallery.length} photos</span>
            </div>
          )}
        </div>

        {/* Compact Progress Section */}
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          <BookingProgress
            currentStatus={booking.status}
            bookingId={booking.id}
            vendorName={booking.vendorBusinessName || booking.vendorName || 'Unknown Vendor'}
            serviceName={booking.serviceName}
            className="border-0 shadow-none p-0 bg-transparent"
          />
        </div>

        {/* Compact Event Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-rose-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString()}
              </p>
              <p className="text-gray-500 text-xs">{booking.formattedEventTime || booking.eventTime || 'Time TBD'}</p>
            </div>
          </div>
          
          {booking.eventLocation && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{booking.eventLocation}</p>
                {booking.eventCoordinates && (
                  <p className="text-gray-500 text-xs">View on map</p>
                )}
              </div>
            </div>
          )}
          
          {booking.guestCount && (
            <div className="flex items-center gap-3 text-sm col-span-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900">{booking.guestCount} guests expected</p>
            </div>
          )}
        </div>

        {/* Compact Contact Information */}
        {(booking.vendorPhone || booking.vendorEmail) && (
          <div className="flex flex-wrap gap-2">
            {booking.vendorPhone && (
              <a
                href={`tel:${booking.vendorPhone}`}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium flex-1 min-w-0"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Call Vendor</span>
              </a>
            )}
            {booking.vendorEmail && (
              <a
                href={`mailto:${booking.vendorEmail}`}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium flex-1 min-w-0"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Email Vendor</span>
              </a>
            )}
          </div>
        )}

        {/* Enhanced Compact Payment Summary */}
        {booking.totalAmount && (
          <div className="bg-gradient-to-r from-gray-50 via-pink-50/30 to-rose-50/30 rounded-2xl p-4 border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">
                  {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                </span>
              </div>
              
              {booking.totalPaid && booking.totalPaid > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-semibold text-green-600">
                    {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                  </span>
                </div>
              )}
              
              {booking.remainingBalance && booking.remainingBalance > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-semibold text-red-600">
                    {booking.formatted?.remainingBalance || `₱${booking.remainingBalance.toLocaleString()}`}
                  </span>
                </div>
              )}
              
              {booking.paymentProgressPercentage !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Payment Progress</span>
                    <span className="text-xs font-medium text-gray-700">{booking.paymentProgressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        "bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500",
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
          </div>
        )}

        {/* Enhanced Compact Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action Row */}
          <div className="flex gap-3">
            <button
              onClick={() => onViewDetails(booking)}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            
            {booking.eventCoordinates && onViewLocation && (
              <button
                onClick={() => onViewLocation(booking)}
                className="px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-2xl hover:from-blue-200 hover:to-blue-300 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            )}
          </div>
          
          {/* Payment Actions Row */}
          {paymentActions.length > 0 && (
            <div className="flex gap-3">
              {paymentActions.map((action) => (
                <button
                  key={action.type}
                  onClick={() => onPayment && onPayment(booking, action.type)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium shadow-sm",
                    action.variant === 'primary' 
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 shadow-lg" 
                      : "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 hover:from-rose-200 hover:to-pink-200"
                  )}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="truncate">{action.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Booking Actions */}
          {onBookingUpdate && (
            <BookingActions 
              booking={booking} 
              onBookingUpdate={onBookingUpdate}
              onViewQuoteDetails={onViewQuoteDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};
