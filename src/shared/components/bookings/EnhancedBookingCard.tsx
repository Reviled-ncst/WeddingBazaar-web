// Enhanced Booking Card Component with Modern UI
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  CreditCard,
  Clock,
  Star,
  Phone,
  Mail,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { formatPHP } from '../../../utils/currency';

export interface EnhancedBooking {
  id: string;
  serviceName: string;
  serviceType: string;
  vendorName?: string;
  vendorBusinessName?: string;
  vendorRating?: number;
  vendorPhone?: string;
  vendorEmail?: string;
  coupleName?: string;
  clientName?: string;
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

interface EnhancedBookingCardProps {
  booking: EnhancedBooking;
  userType: 'individual' | 'vendor' | 'admin';
  onViewDetails?: (booking: EnhancedBooking) => void;
  onSendQuote?: (booking: EnhancedBooking) => void;
  onAcceptQuote?: (booking: EnhancedBooking) => void;
  onPayment?: (booking: EnhancedBooking, paymentType: 'downpayment' | 'remaining_balance' | 'full_payment') => void;
  onContact?: (booking: EnhancedBooking) => void;
  className?: string;
}

export const EnhancedBookingCard: React.FC<EnhancedBookingCardProps> = ({
  booking,
  userType,
  onViewDetails,
  onSendQuote,
  onAcceptQuote,
  onPayment,
  onContact,
  className
}) => {
  // Service type icons with better visuals
  const getServiceIcon = (serviceType: string) => {
    const iconMap: Record<string, string> = {
      'photography': '📸',
      'catering': '🍽️',
      'planning': '📋',
      'florals': '🌸',
      'venue': '🏛️',
      'music_dj': '🎵',
      'videography': '🎥',
      'decoration': '🎨',
      'transportation': '🚗',
      'entertainment': '🎭'
    };
    return iconMap[serviceType] || '💍';
  };

  // Status configuration with better colors
  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { 
      label: string; 
      color: string; 
      bgColor: string; 
      icon: React.ReactNode;
      progress: number;
    }> = {
      'quote_requested': {
        label: 'Quote Requested',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <Clock className="h-4 w-4" />,
        progress: 20
      },
      'quote_sent': {
        label: 'Quote Received',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200',
        icon: <DollarSign className="h-4 w-4" />,
        progress: 40
      },
      'quote_accepted': {
        label: 'Quote Accepted',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        icon: <CheckCircle className="h-4 w-4" />,
        progress: 60
      },
      'confirmed': {
        label: 'Confirmed',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
        progress: 60
      },
      'downpayment_paid': {
        label: 'Deposit Paid',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200',
        icon: <CreditCard className="h-4 w-4" />,
        progress: 75
      },
      'paid_in_full': {
        label: 'Fully Paid',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        icon: <CheckCircle className="h-4 w-4" />,
        progress: 90
      },
      'completed': {
        label: 'Completed',
        color: 'text-green-700',
        bgColor: 'bg-green-100 border-green-300',
        icon: <CheckCircle className="h-4 w-4" />,
        progress: 100
      },
      'cancelled': {
        label: 'Cancelled',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="h-4 w-4" />,
        progress: 0
      }
    };
    return statusMap[status] || statusMap['quote_requested'];
  };

  const statusConfig = getStatusConfig(booking.status);
  const urgencyLevel = booking.daysUntilEvent && booking.daysUntilEvent <= 30 ? 'urgent' : 
                      booking.daysUntilEvent && booking.daysUntilEvent <= 90 ? 'soon' : 'normal';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden",
        "hover:shadow-2xl hover:border-pink-200/50 transition-all duration-500",
        "transform hover:scale-[1.02] hover:-translate-y-1",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-pink-50/30 before:via-transparent before:to-purple-50/30 before:pointer-events-none",
        className
      )}
    >
      {/* Header with enhanced gradient background */}
      <div className="relative bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-indigo-50/80 backdrop-blur-sm p-5 overflow-hidden">
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full -translate-y-20 translate-x-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-300/30 to-blue-300/30 rounded-full translate-y-12 -translate-x-12 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -translate-x-8 -translate-y-8" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Enhanced Service Icon */}
            <div className="relative w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-xl ring-3 ring-white/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
              <span className="text-xl relative z-10 drop-shadow-sm">{getServiceIcon(booking.serviceType)}</span>
              {urgencyLevel === 'urgent' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
              )}
              {urgencyLevel === 'soon' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-white shadow-lg" />
              )}
            </div>
            
            {/* Booking Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate leading-tight">
                    {booking.serviceType || booking.serviceName || 'Wedding Service'}
                  </h3>
                  <p className="text-gray-600 font-medium text-sm truncate">
                    {userType === 'vendor' 
                      ? (booking.coupleName || booking.clientName || 'Wedding Couple')
                      : (booking.vendorName || booking.vendorBusinessName || 'Wedding Vendor')
                    }
                  </p>
                </div>
                {booking.vendorRating && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-100 rounded-md flex-shrink-0">
                    <Star className="h-2.5 w-2.5 text-yellow-600 fill-current" />
                    <span className="text-xs font-medium text-yellow-700">{booking.vendorRating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 truncate">
                Booking #{booking.bookingReference || `WB-${booking.id?.slice(-6)}`}
              </p>
            </div>
          </div>
          
          {/* Enhanced Status Badge */}
          <div className={cn(
            "px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-md backdrop-blur-sm relative overflow-hidden",
            statusConfig.bgColor,
            statusConfig.color,
            "hover:scale-105 transition-transform duration-200"
          )}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="relative z-10 flex items-center gap-1.5">
              <div className="w-3 h-3">{statusConfig.icon}</div>
              <span className="font-semibold text-xs">{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-4 space-y-3 bg-gradient-to-b from-transparent to-gray-50/30">
        {/* Enhanced Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-pink-50/70 to-purple-50/70 backdrop-blur-sm rounded-lg border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[50px]">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center shadow-sm ring-1 ring-white/50 flex-shrink-0">
              <Calendar className="h-3 w-3 text-pink-600 drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-xs truncate">
                {booking.formattedEventDate || (booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'TBD')}
              </div>
              <div className="text-xs text-gray-500 truncate">
                Event Date
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-purple-50/70 to-indigo-50/70 backdrop-blur-sm rounded-lg border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[50px]">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm ring-1 ring-white/50 flex-shrink-0">
              <MapPin className="h-3 w-3 text-purple-600 drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-xs truncate">
                {booking.eventLocation || 'Venue TBD'}
              </div>
              <div className="text-xs text-gray-500">Event Location</div>
            </div>
          </div>
        </div>

        {/* Enhanced Amount Section */}
        <div className="relative bg-gradient-to-r from-gray-50/80 via-white/50 to-gray-100/80 backdrop-blur-sm p-3 rounded-lg border border-white/40 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {booking.totalAmount ? formatPHP(booking.totalAmount) : '₱0.00'}
              </div>
              <div className="text-xs text-gray-500 font-medium">Total Amount</div>
            </div>
            
            {/* Enhanced Progress Bar */}
            {statusConfig.progress > 0 && (
              <div className="flex-shrink-0 w-20">
                <div className="flex justify-between text-xs text-gray-600 font-medium mb-0.5">
                  <span className="text-xs">Progress</span>
                  <span className="font-bold text-xs">{statusConfig.progress}%</span>
                </div>
                <div className="w-full bg-gray-200/80 rounded-full h-1.5 shadow-inner border border-gray-300/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${statusConfig.progress}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    className={cn(
                      "h-1.5 rounded-full shadow-sm relative overflow-hidden",
                      statusConfig.progress === 100 
                        ? "bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"
                        : "bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onViewDetails?.(booking)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">View Details</span>
            <ChevronRight className="h-3 w-3 relative z-10 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
          
          {/* Enhanced Conditional Action Buttons */}
          {userType === 'vendor' && booking.status === 'quote_requested' && (
            <button
              onClick={() => onSendQuote?.(booking)}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group text-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Send Quote</span>
            </button>
          )}
          
          {userType === 'individual' && booking.status === 'quote_sent' && (
            <button
              onClick={() => onAcceptQuote?.(booking)}
              className="px-3 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group text-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Accept Quote</span>
            </button>
          )}
          
          {/* Payment buttons for quote accepted/confirmed bookings */}
          {userType === 'individual' && (booking.status === 'quote_accepted' || booking.status === 'confirmed') && (
            <div className="flex gap-2">
              <button
                onClick={() => onPayment?.(booking, 'downpayment')}
                className="px-3 py-2 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Pay Deposit</span>
              </button>
              <button
                onClick={() => onPayment?.(booking, 'full_payment')}
                className="px-3 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Pay Full</span>
              </button>
            </div>
          )}
          
          {/* Balance payment for downpayment_paid bookings */}
          {userType === 'individual' && booking.status === 'downpayment_paid' && (
            <button
              onClick={() => onPayment?.(booking, 'remaining_balance')}
              className="px-3 py-2 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group text-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Pay Balance</span>
            </button>
          )}
          
          {          /* Enhanced Contact & Message Buttons */}
          <div className="flex gap-2">
            {onContact && (booking.vendorPhone || booking.vendorEmail) && (
              <button
                onClick={() => onContact?.(booking)}
                className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm border border-white/50"
                title="Contact client"
              >
                {booking.vendorPhone ? <Phone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
              </button>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};
