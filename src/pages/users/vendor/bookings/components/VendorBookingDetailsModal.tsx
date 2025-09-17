import React, { useState } from 'react';
import { 
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Send,
  Edit,
  CheckCircle,
  DollarSign,
  Camera,
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';

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
  venueDetails?: string;
  preferredContactMethod?: string;
  budgetRange?: string;
  responseMessage?: string;
  formatted?: {
    totalAmount?: string;
    totalPaid?: string;
  };
}

interface VendorBookingDetailsModalProps {
  booking: VendorBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (bookingId: string, newStatus: string, message?: string) => void;
  onSendQuote?: (booking: VendorBooking) => void;
  onContactClient?: (booking: VendorBooking) => void;
}

const statusConfig = {
  draft: { color: 'text-gray-700 bg-gray-100 border-gray-200', label: 'Draft', icon: FileText },
  quote_requested: { color: 'text-blue-700 bg-blue-100 border-blue-200', label: 'Quote Requested', icon: Mail },
  quote_sent: { color: 'text-purple-700 bg-purple-100 border-purple-200', label: 'Quote Sent', icon: Send },
  quote_accepted: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Quote Accepted', icon: CheckCircle },
  quote_rejected: { color: 'text-red-700 bg-red-100 border-red-200', label: 'Quote Rejected', icon: X },
  confirmed: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Confirmed', icon: CheckCircle },
  downpayment_paid: { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', label: 'Downpayment Received', icon: DollarSign },
  paid_in_full: { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', label: 'Fully Paid', icon: DollarSign },
  in_progress: { color: 'text-blue-700 bg-blue-100 border-blue-200', label: 'In Progress', icon: Clock },
  completed: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Completed', icon: CheckCircle },
  cancelled: { color: 'text-gray-700 bg-gray-100 border-gray-200', label: 'Cancelled', icon: X },
};

export const VendorBookingDetailsModal: React.FC<VendorBookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  onSendQuote,
  onContactClient
}) => {
  const [activeTab, setActiveTab] = useState<'client' | 'event' | 'business'>('client');

  if (!isOpen || !booking) return null;

  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.icon;

  const getVendorActions = () => {
    const actions = [];
    
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
    
    return actions;
  };

  const vendorActions = getVendorActions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl", config.color)}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{booking.coupleName}</h2>
                <p className="text-lg text-rose-600 font-medium">{booking.serviceType}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={cn("px-3 py-1 rounded-lg text-sm font-medium", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    Booking #{booking.id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close modal"
              aria-label="Close booking details"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('client')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'client'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Client Information
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'event'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Event Details
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === 'business'
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Business & Payment
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Client Information Tab */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{booking.contactEmail}</p>
                      </div>
                    </div>
                    
                    {booking.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{booking.contactPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {booking.preferredContactMethod && (
                      <div>
                        <p className="text-sm text-gray-600">Preferred Contact Method</p>
                        <p className="font-medium text-gray-900">{booking.preferredContactMethod}</p>
                      </div>
                    )}
                    
                    {booking.budgetRange && (
                      <div>
                        <p className="text-sm text-gray-600">Budget Range</p>
                        <p className="font-medium text-gray-900">{booking.budgetRange}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Special Requests & Requirements
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{booking.specialRequests}</p>
                </div>
              )}

              {/* Response Message */}
              {booking.responseMessage && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    Previous Communication
                  </h3>
                  <p className="text-gray-700 italic">"{booking.responseMessage}"</p>
                </div>
              )}
            </div>
          )}

          {/* Event Details Tab */}
          {activeTab === 'event' && (
            <div className="space-y-6">
              {/* Event Information */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  Event Schedule
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      <div>
                        <p className="text-sm text-gray-600">Event Date</p>
                        <p className="text-xl font-bold text-gray-900">{booking.eventDate}</p>
                      </div>
                    </div>
                    
                    {booking.eventTime && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Event Time</p>
                          <p className="text-lg font-semibold text-gray-900">{booking.eventTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {booking.eventLocation && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Event Location</p>
                          <p className="font-medium text-gray-900">{booking.eventLocation}</p>
                        </div>
                      </div>
                    )}
                    
                    {booking.guestCount && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Guest Count</p>
                          <p className="font-medium text-gray-900">{booking.guestCount} guests</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              {booking.venueDetails && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    Venue Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{booking.venueDetails}</p>
                </div>
              )}

              {/* Service Planning Notes */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Service Planning Notes
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-medium text-gray-900">{booking.serviceType}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600">Booking Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business & Payment Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              {/* Quote Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Quote & Payment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {booking.totalAmount && (
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600">Total Quote</p>
                      <p className="text-2xl font-bold text-green-600">
                        {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₱{booking.totalPaid.toLocaleString()}
                    </p>
                  </div>
                  
                  {booking.totalAmount && booking.totalPaid < booking.totalAmount && (
                    <div className="bg-white p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600">Outstanding</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₱{(booking.totalAmount - booking.totalPaid).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Payment Status
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Payment Progress</span>
                    <span className="font-medium">
                      {booking.totalAmount ? Math.round((booking.totalPaid / booking.totalAmount) * 100) : 0}%
                    </span>
                  </div>
                  
                  {booking.totalAmount && (
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={cn(
                          "bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                        )}
                        style={{ 
                          width: `${Math.min((booking.totalPaid / booking.totalAmount) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Actions */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Business Tools
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Download Contract</p>
                      <p className="text-sm text-gray-600">Get booking agreement</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors flex items-center gap-3">
                    <Camera className="w-5 h-5 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Upload Photos</p>
                      <p className="text-sm text-gray-600">Share event photos</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6">
          <div className="flex flex-wrap gap-3 justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => onContactClient?.(booking)}
                className="px-6 py-3 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition-colors flex items-center gap-2 font-medium"
              >
                <MessageSquare className="w-5 h-5" />
                Message Client
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
            
            {/* Primary Actions */}
            <div className="flex gap-3">
              {vendorActions.map((action) => (
                <button
                  key={action.type}
                  onClick={action.action}
                  className={cn(
                    "px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-semibold",
                    action.variant === 'primary' 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg" 
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  )}
                >
                  <action.icon className="w-5 h-5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
