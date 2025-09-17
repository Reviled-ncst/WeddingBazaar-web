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
  FileText,
  Eye,
  Phone,
  Mail,
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
        <div className="p-6">
          {/* Header with status */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{booking.coupleName}</h3>
              <p className="text-rose-600 font-medium">{booking.serviceType}</p>
            </div>
            <div className={cn("px-3 py-1 rounded-lg text-sm font-medium", config.color)}>
              {config.label}
            </div>
          </div>

          {/* Event details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-rose-500" />
              {booking.eventDate}
            </div>
            {booking.eventTime && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-rose-500" />
                {booking.eventTime}
              </div>
            )}
            {booking.eventLocation && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-rose-500" />
                {booking.eventLocation}
              </div>
            )}
          </div>

          {/* Price */}
          {booking.totalAmount && (
            <div className="mb-4">
              <p className="text-xl font-bold text-green-600">
                {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onViewDetails(booking)}
              className="flex-1 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            {vendorActions.slice(0, 4).map((action) => (
              <button
                key={action.type}
                onClick={action.action}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  action.variant === 'primary' 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                )}
              >
                <action.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-rose-100 p-4">
      <div className="flex items-center justify-between">
        {/* Basic Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{booking.coupleName}</h3>
              <p className="text-rose-600 text-sm">{booking.serviceType}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>{booking.eventDate}</span>
                {booking.eventTime && <span>{booking.eventTime}</span>}
                {booking.eventLocation && <span>{booking.eventLocation}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        {booking.totalAmount && (
          <div className="text-right mr-4">
            <p className="text-lg font-bold text-green-600">
              {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="mr-4">
          <div className={cn("px-3 py-1 rounded-lg text-sm font-medium", config.color)}>
            {config.label}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-medium"
          >
            Details
          </button>
          {vendorActions.slice(0, 1).map((action) => (
            <button
              key={action.type}
              onClick={action.action}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                action.variant === 'primary' 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              )}
            >
              <action.icon className="w-4 h-4 mr-1" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
