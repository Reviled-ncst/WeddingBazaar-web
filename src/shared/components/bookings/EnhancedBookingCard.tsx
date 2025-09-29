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
        "bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden",
        "hover:shadow-2xl hover:border-pink-200 transition-all duration-500",
        "transform hover:scale-[1.02]",
        className
      )}
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full translate-y-10 -translate-x-10" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Service Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl relative">
              <span className="text-2xl">{getServiceIcon(booking.serviceType)}</span>
              {urgencyLevel === 'urgent' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
            
            {/* Booking Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 truncate">{booking.serviceName}</h3>
                {booking.vendorRating && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-lg">
                    <Star className="h-3 w-3 text-yellow-600 fill-current" />
                    <span className="text-xs font-medium text-yellow-700">{booking.vendorRating}</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 font-medium mb-1">
                {userType === 'vendor' 
                  ? (booking.coupleName || booking.clientName || 'Client')
                  : (booking.vendorName || booking.vendorBusinessName || 'Vendor')
                }
              </p>
              
              <p className="text-sm text-gray-500">
                Booking #{booking.bookingReference || `WB-${booking.id?.slice(-6)}`}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={cn(
            "px-4 py-2 rounded-xl border-2 flex items-center gap-2 shadow-sm",
            statusConfig.bgColor,
            statusConfig.color
          )}>
            {statusConfig.icon}
            <span className="font-semibold text-sm">{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {booking.formattedEventDate || (booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'TBD')}
              </div>
              <div className="text-sm text-gray-500">
                {booking.daysUntilEvent && booking.daysUntilEvent > 0 
                  ? `${booking.daysUntilEvent} days to go`
                  : 'Event Date'
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 truncate">{booking.eventLocation}</div>
              <div className="text-sm text-gray-500">Venue</div>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₱{booking.totalAmount?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-500">Total Amount</div>
            </div>
            
            {/* Progress Bar */}
            {statusConfig.progress > 0 && (
              <div className="flex-1 max-w-32 ml-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{statusConfig.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${statusConfig.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={cn(
                      "h-2 rounded-full",
                      statusConfig.progress === 100 
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-pink-400 to-purple-500"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onViewDetails?.(booking)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>View Details</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          
          {/* Conditional Action Buttons based on user type and status */}
          {userType === 'vendor' && booking.status === 'quote_requested' && (
            <button
              onClick={() => onSendQuote?.(booking)}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Send Quote
            </button>
          )}
          
          {userType === 'individual' && booking.status === 'quote_sent' && (
            <button
              onClick={() => onAcceptQuote?.(booking)}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Accept Quote
            </button>
          )}
          
          {userType === 'individual' && (booking.status === 'confirmed' || booking.status === 'downpayment_paid') && (
            <button
              onClick={() => onPayment?.(booking, booking.status === 'confirmed' ? 'downpayment' : 'remaining_balance')}
              className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              {booking.status === 'confirmed' ? 'Pay Deposit' : 'Pay Balance'}
            </button>
          )}
          
          {/* Contact Button */}
          {onContact && (booking.vendorPhone || booking.vendorEmail) && (
            <button
              onClick={() => onContact?.(booking)}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {booking.vendorPhone ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
