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
  Send,
  Phone,
  Mail,
  Users,
  AlertCircle
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
          {/* Enhanced Client Info */}
          <div className="mb-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.coupleName}</h3>
                <p className="text-rose-600 font-medium text-lg">{booking.serviceType}</p>
                <p className="text-gray-500 text-sm">Booking #{booking.id}</p>
              </div>
              <div className="text-right">
                {booking.totalAmount && (
                  <p className="text-2xl font-bold text-emerald-600">
                    {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                  </p>
                )}
              </div>
            </div>
            
            {/* Contact Information Bar */}
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{booking.contactEmail}</span>
                </div>
                {booking.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{booking.contactPhone}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-auto">
                      {booking.preferredContactMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Event Details */}
          <div className="space-y-3 mb-5">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Event Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Date:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {new Date(booking.eventDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {booking.eventTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Time:</span>
                    <span className="text-sm font-medium text-blue-900">{booking.eventTime}</span>
                  </div>
                )}
                {booking.eventLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Venue:</span>
                    <span className="text-sm font-medium text-blue-900 truncate ml-2">{booking.eventLocation}</span>
                  </div>
                )}
                {booking.guestCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Guests:</span>
                    <span className="text-sm font-medium text-blue-900">{booking.guestCount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Days to Event:</span>
                  <span className="text-sm font-bold text-blue-900">
                    {Math.ceil((new Date(booking.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Special Requests */}
          {booking.specialRequests && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 mb-1">Special Requirements</p>
                  <p className="text-sm text-yellow-700 line-clamp-2">{booking.specialRequests}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Payment Information */}
          {booking.totalAmount && (
            <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Quote</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                    </p>
                    {booking.budgetRange && (
                      <p className="text-xs text-gray-500">Client Budget: {booking.budgetRange}</p>
                    )}
                  </div>
                  {booking.totalPaid > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Received</p>
                      <p className="text-lg font-bold text-green-700">
                        ₱{booking.totalPaid.toLocaleString()}
                      </p>
                      {booking.remainingBalance && booking.remainingBalance > 0 && (
                        <p className="text-xs text-orange-600 font-medium">
                          Pending: ₱{booking.remainingBalance.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Payment Progress */}
                {booking.paymentProgressPercentage !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Payment Progress</span>
                      <span className="font-medium text-gray-700">{booking.paymentProgressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${booking.paymentProgressPercentage}%` }}
                      ></div>
                    </div>
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

  // Enhanced List view
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-rose-100 p-6">
      <div className="flex items-start justify-between">
        {/* Enhanced Main Content */}
        <div className="flex-1">
          <div className="flex items-start gap-6">
            {/* Status Badge */}
            <div className={cn("px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap self-start", config.color)}>
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
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${booking.paymentProgressPercentage}%` }}
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
            <button
              onClick={() => onContactClient?.(booking)}
              className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
              title={`Contact via ${booking.preferredContactMethod}: ${booking.contactEmail}`}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
            
            <button
              onClick={() => onViewDetails(booking)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
          </div>

          {/* Additional Actions Dropdown (if needed) */}
          {vendorActions.filter(action => action.variant === 'secondary').length > 1 && (
            <div className="relative">
              <button 
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="More actions"
              >
                •••
              </button>
              {/* Dropdown implementation would go here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
