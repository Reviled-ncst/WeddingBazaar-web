import React from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  Eye,
  Edit,
  Send,
  Phone,
  Mail,
  Users,
  AlertCircle,
  Package
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';

// Simplified booking interface for vendor view
interface VendorBooking {
  id: string;
  vendorId: string;
  coupleId: string;
  coupleName: string;
  contactEmail: string;
  contactPhone?: string;
  serviceType: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  guestCount?: number;
  specialRequests?: string;
  status: string;
  quoteAmount?: number;
  totalAmount?: number;
  totalPaid: number;
  remainingBalance?: number;
  paymentProgressPercentage?: number;
  budgetRange?: string;
  preferredContactMethod: string;
  createdAt: string;
  updatedAt: string;
  formatted?: {
    totalAmount?: string;
    totalPaid?: string;
    remainingBalance?: string;
  };
}

interface VendorBookingCardProps {
  booking: VendorBooking;
  onViewDetails: (booking: VendorBooking) => void;
  onUpdateStatus?: (bookingId: string, newStatus: string, message?: string) => void;
  onSendQuote?: (booking: VendorBooking) => void;
  onContactClient?: (booking: VendorBooking) => void;
  viewMode?: 'grid' | 'list';
}

const statusConfig = {
  draft: { color: 'text-gray-700 bg-gray-100 border-gray-200', label: 'Draft' },
  quote_requested: { color: 'text-blue-700 bg-blue-100 border-blue-200', label: 'Quote Requested' },
  quote_sent: { color: 'text-purple-700 bg-purple-100 border-purple-200', label: 'Quote Sent' },
  quote_accepted: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Quote Accepted' },
  quote_rejected: { color: 'text-red-700 bg-red-100 border-red-200', label: 'Quote Rejected' },
  confirmed: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Confirmed' },
  downpayment_paid: { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', label: 'Downpayment Received' },
  paid_in_full: { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', label: 'Fully Paid' },
  in_progress: { color: 'text-blue-700 bg-blue-100 border-blue-200', label: 'In Progress' },
  completed: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Completed' },
  cancelled: { color: 'text-gray-700 bg-gray-100 border-gray-200', label: 'Cancelled' },
};

export const VendorBookingCard: React.FC<VendorBookingCardProps> = ({
  booking,
  onViewDetails,
  onUpdateStatus,
  onSendQuote,
  onContactClient,
  viewMode = 'grid'
}) => {
  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.draft;

  // Vendor-specific actions (NO PAYMENT BUTTONS FOR VENDORS)
  const getVendorActions = () => {
    const actions = [];
    
    // Quote-related actions
    if (booking.status === 'quote_requested') {
      actions.push({
        type: 'send_quote',
        label: 'Send Quote',
        icon: Send,
        variant: 'primary',
        action: () => onSendQuote?.(booking)
      });
    }
    
    if (booking.status === 'quote_sent') {
      actions.push({
        type: 'edit_quote',
        label: 'Update Quote', 
        icon: Edit,
        variant: 'secondary',
        action: () => onSendQuote?.(booking)
      });
    }
    
    // Booking confirmation
    if (booking.status === 'quote_accepted' && onUpdateStatus) {
      actions.push({
        type: 'confirm_booking',
        label: 'Accept & Confirm',
        icon: CheckCircle,
        variant: 'primary',
        action: () => onUpdateStatus(booking.id, 'confirmed', 'Booking confirmed by vendor')
      });
    }
    
    // Service delivery tracking for confirmed bookings
    if (booking.status === 'confirmed' && onUpdateStatus) {
      // Check if event date is today or has passed
      const eventDate = new Date(booking.eventDate);
      const today = new Date();
      const isEventToday = eventDate.toDateString() === today.toDateString();
      const isEventPast = eventDate < today;
      
      if (isEventToday || isEventPast) {
        actions.push({
          type: 'mark_delivered',
          label: 'Mark as Delivered',
          icon: CheckCircle,
          variant: 'primary',
          action: () => onUpdateStatus(booking.id, 'completed', 'Service delivered successfully')
        });
      } else {
        // Show prepare action for future events
        actions.push({
          type: 'prepare_service',
          label: 'Prepare Service',
          icon: Package,
          variant: 'secondary',
          action: () => onViewDetails(booking) // Open details to view preparation checklist
        });
      }
    }
    
    // For in-progress bookings (legacy status support)
    if (booking.status === 'in_progress' && onUpdateStatus) {
      actions.push({
        type: 'complete_service',
        label: 'Mark as Delivered',
        icon: CheckCircle,
        variant: 'primary',
        action: () => onUpdateStatus(booking.id, 'completed', 'Service delivered successfully')
      });
    }
    
    // Client communication - always available for active bookings
    if (!['cancelled', 'completed'].includes(booking.status)) {
      actions.push({
        type: 'contact_client',
        label: 'Message Client',
        icon: MessageSquare,
        variant: 'secondary',
        action: () => onContactClient?.(booking)
      });
    }
    
    // View details action - always available
    actions.push({
      type: 'view_details',
      label: 'View Details',
      icon: Eye,
      variant: 'secondary',
      action: () => onViewDetails(booking)
    });
    
    return actions;
  };

  const vendorActions = getVendorActions();

  if (viewMode === 'grid') {
    return (
      <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-rose-200/50 transform hover:scale-[1.02]">
        {/* Enhanced Status Bar with Gradient */}
        <div className={cn("px-6 py-4 border-b bg-gradient-to-r", 
          booking.status === 'completed' ? 'from-green-50 to-emerald-50 border-green-100' :
          booking.status === 'confirmed' ? 'from-blue-50 to-indigo-50 border-blue-100' :
          booking.status === 'quote_requested' ? 'from-yellow-50 to-orange-50 border-yellow-100' :
          booking.status === 'quote_rejected' ? 'from-red-50 to-pink-50 border-red-100' :
          'from-gray-50 to-slate-50 border-gray-100'
        )}>
          <div className="flex justify-between items-center">
            <span className={cn("text-sm font-bold px-3 py-1 rounded-full", 
              booking.status === 'completed' ? 'text-green-700 bg-green-100' :
              booking.status === 'confirmed' ? 'text-blue-700 bg-blue-100' :
              booking.status === 'quote_requested' ? 'text-yellow-700 bg-yellow-100' :
              booking.status === 'quote_rejected' ? 'text-red-700 bg-red-100' :
              'text-gray-700 bg-gray-100'
            )}>
              {config.label}
            </span>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-600">
                {new Date(booking.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Client Info Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                  {booking.coupleName}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-rose-600 font-semibold text-lg">{booking.serviceType}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    #{booking.id}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {booking.totalAmount && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-3 border border-emerald-100">
                    <p className="text-2xl font-bold text-emerald-700">
                      {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">Total Quote</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Contact Information */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-100">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium truncate flex-1">{booking.contactEmail}</span>
                </div>
                {booking.contactPhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{booking.contactPhone}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-auto capitalize">
                      {booking.preferredContactMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Event Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-2xl p-5 border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Date</span>
                    <p className="text-sm font-bold text-blue-900 mt-1">
                      {new Date(booking.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {booking.eventTime && (
                    <div>
                      <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Time</span>
                      <p className="text-sm font-bold text-blue-900 mt-1">{booking.eventTime}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {booking.eventLocation && (
                    <div>
                      <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Venue</span>
                      <p className="text-sm font-bold text-blue-900 mt-1">{booking.eventLocation}</p>
                    </div>
                  )}
                  {booking.guestCount && (
                    <div>
                      <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Guests</span>
                      <p className="text-sm font-bold text-blue-900 mt-1">{booking.guestCount} people</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Countdown to Event */}
              <div className="mt-4 pt-4 border-t border-blue-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Days to Event</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const daysToEvent = Math.ceil((new Date(booking.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <>
                          <span className={`text-lg font-bold ${
                            daysToEvent < 0 ? 'text-gray-500' :
                            daysToEvent <= 7 ? 'text-red-600' :
                            daysToEvent <= 30 ? 'text-yellow-600' :
                            'text-blue-900'
                          }`}>
                            {daysToEvent < 0 ? 'Completed' : `${daysToEvent} days`}
                          </span>
                          {daysToEvent > 0 && daysToEvent <= 7 && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              Urgent
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Special Requests */}
          {booking.specialRequests && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50/30 border border-yellow-200/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-yellow-800 mb-2 uppercase tracking-wide">Special Requirements</p>
                    <p className="text-sm text-yellow-800 leading-relaxed">{booking.specialRequests}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Payment Information */}
          {booking.totalAmount && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-2xl p-5 border border-emerald-200/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 mb-1 uppercase tracking-wide">Total Quote</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                    </p>
                    {booking.budgetRange && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                        Client Budget: {booking.budgetRange}
                      </p>
                    )}
                  </div>
                  {booking.totalPaid > 0 && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-800 mb-1 uppercase tracking-wide">Received</p>
                      <p className="text-xl font-bold text-green-700">
                        ₱{booking.totalPaid.toLocaleString()}
                      </p>
                      {booking.remainingBalance && booking.remainingBalance > 0 && (
                        <p className="text-xs text-orange-600 font-bold mt-1">
                          Balance: ₱{booking.remainingBalance.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Payment Progress */}
                {booking.paymentProgressPercentage !== undefined && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Payment Progress</span>
                      <span className="text-sm font-bold text-emerald-700">{booking.paymentProgressPercentage}%</span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-3 shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-400 to-green-500 shadow-sm ${
                          booking.paymentProgressPercentage >= 100 ? 'w-full' :
                          booking.paymentProgressPercentage >= 75 ? 'w-3/4' :
                          booking.paymentProgressPercentage >= 50 ? 'w-1/2' :
                          booking.paymentProgressPercentage >= 25 ? 'w-1/4' :
                          booking.paymentProgressPercentage > 0 ? 'w-1/12' : 'w-0'
                        }`}
                      ></div>
                    </div>
                    {booking.paymentProgressPercentage === 100 && (
                      <div className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Fully Paid</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="space-y-4">
            {/* Primary Action - Most Prominent */}
            {vendorActions.filter(action => action.variant === 'primary').map((action) => (
              <button
                key={action.type}
                onClick={action.action}
                className="group w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-2xl hover:from-rose-600 hover:to-purple-600 transition-all duration-300 font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <action.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">{action.label}</span>
              </button>
            ))}

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onViewDetails(booking)}
                className="group px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 hover:shadow-md"
              >
                <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Details</span>
              </button>
              
              {/* Show message button only for active bookings */}
              {!['cancelled', 'completed'].includes(booking.status) && (
                <button
                  onClick={() => onContactClient?.(booking)}
                  className="group px-4 py-3 bg-gradient-to-r from-rose-100 to-pink-100 hover:from-rose-200 hover:to-pink-200 text-rose-700 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 hover:shadow-md"
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Message</span>
                </button>
              )}
            </div>

            {/* Additional Actions */}
            {vendorActions.filter(action => action.variant === 'secondary' && !['contact_client', 'view_details'].includes(action.type)).length > 0 && (
              <div className="flex gap-2">
                {vendorActions.filter(action => action.variant === 'secondary' && !['contact_client', 'view_details'].includes(action.type)).map((action) => (
                  <button
                    key={action.type}
                    onClick={action.action}
                    className="group flex-1 px-3 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 border border-blue-200/50 hover:border-blue-300"
                  >
                    <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="hidden sm:inline text-sm">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced List view with modern glassmorphic design
  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:border-rose-200/50 p-6 transform hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        {/* Enhanced Main Content */}
        <div className="flex-1">
          <div className="flex items-start gap-6">
            {/* Enhanced Status Badge */}
            <div className={cn("px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap self-start shadow-sm", 
              booking.status === 'completed' ? 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200' :
              booking.status === 'confirmed' ? 'text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200' :
              booking.status === 'quote_requested' ? 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200' :
              booking.status === 'quote_rejected' ? 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border border-red-200' :
              'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-200'
            )}>
              {config.label}
            </div>
            
            {/* Client & Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{booking.coupleName}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      #{booking.id}
                    </span>
                  </div>
                  <p className="text-rose-600 font-medium mb-2">{booking.serviceType}</p>
                  
                  {/* Contact Info Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-48">{booking.contactEmail}</span>
                    </div>
                    {booking.contactPhone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{booking.contactPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="capitalize">{booking.preferredContactMethod}</span>
                    </div>
                  </div>
                </div>
                
                {/* Price & Payment Section */}
                {booking.totalAmount && (
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-emerald-600 mb-1">
                      {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                    </p>
                    {booking.totalPaid > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-green-700 font-medium">
                          Paid: ₱{booking.totalPaid.toLocaleString()}
                        </p>
                        {booking.remainingBalance && booking.remainingBalance > 0 && (
                          <p className="text-sm text-orange-600 font-medium">
                            Pending: ₱{booking.remainingBalance.toLocaleString()}
                          </p>
                        )}
                        {/* Payment progress indicator */}
                        {booking.paymentProgressPercentage !== undefined && (
                          <div className="w-24 bg-gray-200 rounded-full h-2 ml-auto">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 bg-green-500 ${
                                booking.paymentProgressPercentage >= 100 ? 'w-full' :
                                booking.paymentProgressPercentage >= 75 ? 'w-3/4' :
                                booking.paymentProgressPercentage >= 50 ? 'w-1/2' :
                                booking.paymentProgressPercentage >= 25 ? 'w-1/4' :
                                booking.paymentProgressPercentage > 0 ? 'w-1/12' : 'w-0'
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}
                    {booking.budgetRange && (
                      <p className="text-xs text-gray-500 mt-1">Budget: {booking.budgetRange}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Enhanced Event Details Row */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">
                    {new Date(booking.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-1">
                    {Math.ceil((new Date(booking.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                {booking.eventTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>{booking.eventTime}</span>
                  </div>
                )}
                {booking.eventLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="truncate max-w-32">{booking.eventLocation}</span>
                  </div>
                )}
                {booking.guestCount && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{booking.guestCount} guests</span>
                  </div>
                )}
              </div>

              {/* Special Requests with Better Formatting */}
              {booking.specialRequests && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-medium text-yellow-800">Special Requirements:</span>
                      <p className="text-sm text-yellow-700 mt-1">
                        {booking.specialRequests.length > 120 ? 
                          `${booking.specialRequests.substring(0, 120)}...` : 
                          booking.specialRequests
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Timeline Info */}
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
                <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(booking.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-3 ml-6">
          {/* Primary Action - Most Important */}
          {vendorActions.filter(action => action.variant === 'primary').slice(0, 1).map((action) => (
            <button
              key={action.type}
              onClick={action.action}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              <action.icon className="w-5 h-5" />
              {action.label}
            </button>
          ))}

          {/* Secondary Actions */}
          <div className="flex gap-2">
            {/* Show message button only for active bookings */}
            {!['cancelled', 'completed'].includes(booking.status) && (
              <button
                onClick={() => onContactClient?.(booking)}
                className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                title={`Contact via ${booking.preferredContactMethod}: ${booking.contactEmail}`}
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            )}
            
            <button
              onClick={() => onViewDetails(booking)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
          </div>

          {/* Additional Secondary Actions */}
          {vendorActions.filter(action => action.variant === 'secondary' && !['contact_client', 'view_details'].includes(action.type)).length > 0 && (
            <div className="flex gap-2">
              {vendorActions.filter(action => action.variant === 'secondary' && !['contact_client', 'view_details'].includes(action.type)).slice(0, 2).map((action) => (
                <button
                  key={action.type}
                  onClick={action.action}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-1 whitespace-nowrap"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
