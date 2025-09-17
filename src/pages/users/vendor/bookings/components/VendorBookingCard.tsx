import React from 'react';
import { 
  Calendar,
  MapPin,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  Eye,
  Edit,
  Send
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
  createdAt: string;
  updatedAt: string;
  formatted?: {
    totalAmount?: string;
    totalPaid?: string;
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
        label: 'Edit Quote', 
        icon: Edit,
        variant: 'secondary',
        action: () => onSendQuote?.(booking)
      });
    }
    
    // Client communication
    actions.push({
      type: 'contact_client',
      label: 'Contact Client',
      icon: MessageSquare,
      variant: 'secondary',
      action: () => onContactClient?.(booking)
    });
    
    // Status management
    if (booking.status === 'quote_accepted' && onUpdateStatus) {
      actions.push({
        type: 'confirm_booking',
        label: 'Confirm Booking',
        icon: CheckCircle,
        variant: 'primary',
        action: () => onUpdateStatus(booking.id, 'confirmed', 'Booking confirmed by vendor')
      });
    }
    
    if (booking.status === 'confirmed' && onUpdateStatus) {
      actions.push({
        type: 'start_service',
        label: 'Start Service',
        icon: User,
        variant: 'primary',
        action: () => onUpdateStatus(booking.id, 'in_progress', 'Service started')
      });
    }
    
    if (booking.status === 'in_progress' && onUpdateStatus) {
      actions.push({
        type: 'complete_service',
        label: 'Mark Complete',
        icon: CheckCircle,
        variant: 'primary',
        action: () => onUpdateStatus(booking.id, 'completed', 'Service completed successfully')
      });
    }
    
    // View details action
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
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-rose-100">
        {/* Status Bar */}
        <div className={cn("px-6 py-3 border-b", config.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 border-'))}>
          <div className="flex justify-between items-center">
            <span className={cn("text-sm font-semibold", config.color.split(' ')[0])}>
              {config.label}
            </span>
            <span className="text-xs text-gray-600">
              {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Client Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.coupleName}</h3>
            <p className="text-rose-600 font-medium text-lg">{booking.serviceType}</p>
            <div className="flex items-center gap-2 mt-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{booking.contactEmail}</span>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-3 text-rose-500" />
              <span className="font-medium text-gray-900">{booking.eventDate}</span>
              {booking.eventTime && (
                <>
                  <Clock className="w-4 h-4 ml-4 mr-2 text-blue-500" />
                  <span className="text-gray-700">{booking.eventTime}</span>
                </>
              )}
            </div>
            {booking.eventLocation && (
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-3 text-purple-500" />
                <span className="text-gray-700">{booking.eventLocation}</span>
              </div>
            )}
            {booking.guestCount && (
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-3 text-green-500" />
                <span className="text-gray-700">{booking.guestCount} guests</span>
              </div>
            )}
          </div>

          {/* Special Requests Preview */}
          {booking.specialRequests && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">Special Requests:</p>
              <p className="text-sm text-gray-700 line-clamp-2">{booking.specialRequests}</p>
            </div>
          )}

          {/* Price & Payment Status */}
          {booking.totalAmount && (
            <div className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Quote Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                  </p>
                </div>
                {booking.totalPaid > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="text-sm font-medium text-green-700">
                      ₱{booking.totalPaid.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary Action Buttons - More Prominent */}
          <div className="space-y-3">
            {/* Main Action */}
            {vendorActions.filter(action => action.variant === 'primary').map((action) => (
              <button
                key={action.type}
                onClick={action.action}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg"
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </button>
            ))}

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onViewDetails(booking)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Details
              </button>
              {vendorActions.filter(action => action.variant === 'secondary').slice(0, 1).map((action) => (
                <button
                  key={action.type}
                  onClick={action.action}
                  className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label === 'Contact Client' ? 'Message' : action.label}
                </button>
              ))}
            </div>

            {/* Additional Quick Actions */}
            {vendorActions.filter(action => action.variant === 'secondary').length > 1 && (
              <div className="flex gap-2">
                {vendorActions.filter(action => action.variant === 'secondary').slice(1).map((action) => (
                  <button
                    key={action.type}
                    onClick={action.action}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-rose-100 p-5">
      <div className="flex items-center justify-between">
        {/* Basic Info */}
        <div className="flex-1">
          <div className="flex items-start gap-6">
            {/* Status Badge */}
            <div className={cn("px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap", config.color)}>
              {config.label}
            </div>
            
            {/* Client & Event Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{booking.coupleName}</h3>
                  <p className="text-rose-600 font-medium">{booking.serviceType}</p>
                </div>
                {booking.totalAmount && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                    </p>
                    {booking.totalPaid > 0 && (
                      <p className="text-sm text-gray-500">
                        Paid: ₱{booking.totalPaid.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {booking.eventDate}
                </span>
                {booking.eventTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {booking.eventTime}
                  </span>
                )}
                {booking.eventLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {booking.eventLocation}
                  </span>
                )}
                {booking.guestCount && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {booking.guestCount} guests
                  </span>
                )}
              </div>

              {/* Special Requests in List View */}
              {booking.specialRequests && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  <span className="font-medium">Special: </span>
                  {booking.specialRequests.length > 100 ? 
                    `${booking.specialRequests.substring(0, 100)}...` : 
                    booking.specialRequests
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prominent Action Buttons */}
        <div className="flex items-center gap-3 ml-6">
          {/* Primary Action - Most Important */}
          {vendorActions.filter(action => action.variant === 'primary').slice(0, 1).map((action) => (
            <button
              key={action.type}
              onClick={action.action}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg"
            >
              <action.icon className="w-5 h-5" />
              {action.label}
            </button>
          ))}

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onContactClient?.(booking)}
              className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
            
            <button
              onClick={() => onViewDetails(booking)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
          </div>

          {/* More Actions Dropdown (if needed) */}
          {vendorActions.length > 3 && (
            <div className="relative">
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                •••
              </button>
              {/* Dropdown would go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
