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
  Info,
  Timer,
  Target,
  Heart,
  Gift,
  Bookmark
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
  remainingBalance?: number;
  paymentProgressPercentage?: number;
  createdAt: string;
  updatedAt: string;
  venueDetails?: string;
  preferredContactMethod?: string;
  budgetRange?: string;
  responseMessage?: string;
  formatted?: {
    totalAmount?: string;
    totalPaid?: string;
    remainingBalance?: string;
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

  // Payment Progress Component
  const PaymentProgress = ({ totalPaid, totalAmount }: { totalPaid: number; totalAmount: number }) => {
    const percentage = Math.min((totalPaid / totalAmount) * 100, 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

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
          {/* Enhanced Client Information Tab */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              {/* Client Overview Header */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{booking.coupleName}</h2>
                        <p className="text-rose-600 font-medium text-lg">{booking.serviceType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        Booking #{booking.id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        Created {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                      config.color
                    )}>
                      {config.label}
                    </div>
                    {booking.totalAmount && (
                      <p className="text-2xl font-bold text-emerald-600 mt-2">
                        {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Contact Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900">{booking.contactEmail}</p>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Send Email
                        </button>
                      </div>
                    </div>
                    
                    {booking.contactPhone && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Phone className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-900">{booking.contactPhone}</p>
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Call Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Preferred Contact</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {booking.preferredContactMethod || 'Email'}
                        </p>
                        <p className="text-sm text-gray-500">Primary communication method</p>
                      </div>
                    </div>

                    {booking.budgetRange && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <Target className="w-5 h-5 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Budget Range</p>
                          <p className="font-medium text-gray-900">{booking.budgetRange}</p>
                          <p className="text-sm text-gray-500">Client's expected budget</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => onContactClient?.(booking)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Client
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Phone className="w-4 h-4" />
                    Call Client
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                </div>
              </div>

              {/* Client Preferences & Notes */}
              {booking.specialRequests && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-600" />
                    Special Requirements & Preferences
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{booking.specialRequests}</p>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <strong>Important:</strong> Make sure to address these requirements in your service delivery.
                    </p>
                  </div>
                </div>
              )}

              {/* Response History */}
              {booking.responseMessage && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Communication History
                  </h3>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Vendor Response</p>
                        <p className="text-gray-700 mt-1">{booking.responseMessage}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Last updated: {new Date(booking.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline & Updates */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Booking Timeline
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Booking Created</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {booking.updatedAt !== booking.createdAt && (
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Last Updated</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.updatedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Event countdown */}
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Event Date</p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const eventDate = new Date(booking.eventDate);
                          const today = new Date();
                          const diffTime = eventDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) {
                            return `Event occurred ${Math.abs(diffDays)} days ago`;
                          } else if (diffDays === 0) {
                            return 'Event is today!';
                          } else if (diffDays === 1) {
                            return 'Event is tomorrow!';
                          } else {
                            return `${diffDays} days until event`;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Notes & Instructions */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-500" />
                  Internal Notes & Instructions
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">Vendor Notes</h4>
                        <textarea 
                          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Add your internal notes about this booking, client preferences, or special instructions..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-gray-500">Private notes - not visible to client</p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps & Reminders */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Next Steps & Reminders
                </h3>
                
                <div className="space-y-3">
                  {(() => {
                    const steps = [];
                    
                    if (booking.status === 'quote_requested') {
                      steps.push({
                        action: 'Send detailed quote to client',
                        priority: 'high',
                        due: '2 business days'
                      });
                    }
                    
                    if (booking.status === 'quote_sent') {
                      steps.push({
                        action: 'Follow up on quote status',
                        priority: 'medium',
                        due: '1 week'
                      });
                    }
                    
                    if (booking.status === 'confirmed' || booking.status === 'downpayment_paid') {
                      steps.push({
                        action: 'Prepare equipment and timeline',
                        priority: 'high',
                        due: '3 days before event'
                      });
                      steps.push({
                        action: 'Contact client for final details',
                        priority: 'medium',
                        due: '1 week before event'
                      });
                    }
                    
                    return steps.map((step, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        step.priority === 'high' ? 'bg-red-50 border-red-400' :
                        step.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{step.action}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            step.priority === 'high' ? 'bg-red-100 text-red-700' :
                            step.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {step.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Due: {step.due}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
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

              {/* Event Logistics & Planning */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Event Logistics & Setup
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">Pre-Event Checklist</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Equipment check completed</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Client final confirmation</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Venue coordination complete</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Timeline finalized</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">Emergency Contacts</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">Venue: (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-700">Event Coordinator: (555) 987-6543</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-700">Emergency: 911</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather & Travel Information */}
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500" />
                  Day-of-Event Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Weather Forecast</h4>
                    <p className="text-sm text-gray-600">Check weather 24 hours before event</p>
                    <button className="mt-2 px-3 py-1 bg-sky-100 text-sky-700 rounded text-sm hover:bg-sky-200 transition-colors">
                      Check Weather
                    </button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Travel Time</h4>
                    <p className="text-sm text-gray-600">Estimated travel to venue</p>
                    <button className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors">
                      Get Directions
                    </button>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Parking Info</h4>
                    <p className="text-sm text-gray-600">Vendor parking instructions</p>
                    <button className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors">
                      View Details
                    </button>
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
                    <PaymentProgress totalPaid={booking.totalPaid} totalAmount={booking.totalAmount} />
                  )}
                </div>
              </div>

              {/* Business Analytics */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-500" />
                  Business Analytics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Profit Margin</p>
                    <p className="text-xl font-bold text-green-600">
                      {booking.totalAmount ? 
                        `${Math.round(((booking.totalAmount - (booking.totalAmount * 0.3)) / booking.totalAmount) * 100)}%` : 
                        'N/A'
                      }
                    </p>
                    <p className="text-xs text-gray-500">Estimated after costs</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">Time to Event</p>
                    <p className="text-xl font-bold text-blue-600">
                      {(() => {
                        const eventDate = new Date(booking.eventDate);
                        const today = new Date();
                        const diffTime = eventDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays > 0 ? `${diffDays} days` : 'Past event';
                      })()}
                    </p>
                    <p className="text-xs text-gray-500">Until service delivery</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Business Tools */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-500" />
                  Business Tools & Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <Download className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Download Invoice</p>
                      <p className="text-sm text-gray-600">Generate PDF invoice</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <FileText className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Service Contract</p>
                      <p className="text-sm text-gray-600">View/edit contract</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <Camera className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Upload Portfolio</p>
                      <p className="text-sm text-gray-600">Add event photos</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <Mail className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Email Template</p>
                      <p className="text-sm text-gray-600">Send follow-up</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <Clock className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Schedule Meeting</p>
                      <p className="text-sm text-gray-600">Plan consultation</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <AlertTriangle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Report Issue</p>
                      <p className="text-sm text-gray-600">Flag problems</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer Actions */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onContactClient?.(booking)}
                className="px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Message Client
              </button>
              
              <button className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2 font-medium">
                <Phone className="w-4 h-4" />
                Call Client
              </button>
              
              <button className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium">
                <Mail className="w-4 h-4" />
                Send Email
              </button>
              
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            {/* Primary Actions & Close */}
            <div className="flex gap-3">
              {vendorActions.map((action) => (
                <button
                  key={action.type}
                  onClick={action.action}
                  className={cn(
                    "px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-sm",
                    action.variant === 'primary' 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105" 
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  )}
                >
                  <action.icon className="w-5 h-5" />
                  {action.label}
                </button>
              ))}
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
