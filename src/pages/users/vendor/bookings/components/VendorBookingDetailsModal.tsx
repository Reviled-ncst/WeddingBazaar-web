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
  Download,
  AlertTriangle,
  Info,
  Timer,
  Target,
  Heart,
  Gift,
  Bookmark,
  Zap,
  Settings,
  Package,
  Receipt
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
  eventEndTime?: string;
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
  contactPerson?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  depositAmount?: number;
  downpaymentAmount?: number;
  quoteSentDate?: string;
  paymentStatus?: string;
  vendorNotes?: string;
  // Package/Itemization fields
  packageName?: string;
  packagePrice?: number;
  packageItems?: Array<{
    item: string;
    quantity?: number;
    price?: number;
  }>;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
  itemizationType?: 'package' | 'custom';
  customItems?: Array<{
    description: string;
    quantity?: number;
    price?: number;
  }>;
  formatted?: {
    totalAmount?: string;
    totalPaid?: string;
    remainingBalance?: string;
    downpaymentAmount?: string;
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
  const [activeTab, setActiveTab] = useState<'client' | 'event' | 'business' | 'actions'>('client');

  if (!isOpen || !booking) return null;

  // Utility function to get display-friendly couple name with real user data mapping
  const getDisplayCoupleName = (booking: VendorBooking): string => {
    // PRIORITY 1: Use contact person name directly (from booking form)
    if (booking.contactPerson && booking.contactPerson.trim() !== '' && booking.contactPerson !== 'Unknown') {
      return booking.contactPerson;
    }

    // PRIORITY 2: Use couple name if available
    if (booking.coupleName && booking.coupleName !== 'Unknown Couple') {
      return booking.coupleName;
    }
    
    // PRIORITY 3: Map known couple IDs to their actual names from the users database  
    if (booking.coupleId) {
      const coupleIdNameMap: Record<string, string> = {
        '1-2025-001': 'Couple1 One',
        '1-2025-002': 'John Smith', 
        '1-2025-003': 'Test User',
        '1-2025-004': 'TestUser Demo',
        '1-2025-005': 'TestCouple User',
        '1-2025-006': 'John Doe',
        '1-2025-007': 'Jane Smith',
        '1-2025-008': 'Test User',
        '1-2025-009': 'Test User',
        '1-2025-010': 'Test User',
        '1-2025-011': 'Test Couple',
        'USR-02275708': 'Debug User',
        'USR-02316913': 'Auth Test',
        'USR-02738714': 'Diag Test',
        'c-38164444-999': 'Test User',
        'c-38256644-742': 'Test User',
        'c-38319639-149': 'Test User',
        'c-74997498-279': 'John And',
        'c-87035732-903': 'Test User',
        'c-88096339-358': 'Message Test',
        'c-89651245-512': 'Location Tester',
        'unv-17126016': 'Unverified User'
      };
      
      if (coupleIdNameMap[booking.coupleId]) {
        return coupleIdNameMap[booking.coupleId];
      }
      
      // Fallback: Try to generate from couple_id
      const match = booking.coupleId.match(/(\d+)-(\d+)-(\d+)/);
      if (match) {
        return `Couple #${match[3]}`;
      }
      const simpleMatch = booking.coupleId.match(/\d+$/);
      if (simpleMatch) {
        return `Couple #${simpleMatch[0].padStart(3, '0')}`;
      }
      return `Couple ${booking.coupleId}`;
    }
    
    // FALLBACK: Use generic name (DO NOT extract from email - could be vendor's email!)
    return 'Wedding Client';
  };

  // Utility function to format contact email for display
  const getDisplayEmail = (email: string): string => {
    if (!email || email === 'no-email@example.com') {
      return 'Contact email not provided';
    }
    return email;
  };

  const displayCoupleName = getDisplayCoupleName(booking);
  const displayEmail = getDisplayEmail(booking.contactEmail);

  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.icon;

  const getVendorActions = () => {
    const actions = [];
    
    // Handle both 'request' (database) and 'quote_requested' (UI) statuses
    if (booking.status === 'request' || booking.status === 'quote_requested') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start gap-5">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                <StatusIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-black tracking-tight mb-2">
                  {displayCoupleName}
                </h2>
                <p className="text-xl text-white/90 font-semibold mb-3">{booking.serviceType}</p>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold border border-white/30">
                    {config.label}
                  </span>
                  <span className="text-sm text-white/80 font-medium">
                    ID: {String(booking.id).slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
              title="Close modal"
              aria-label="Close booking details"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 sticky top-0 z-20">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('client')}
              className={cn(
                "py-4 px-6 font-bold text-sm relative transition-all duration-200",
                activeTab === 'client'
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Client Information
              {activeTab === 'client' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={cn(
                "py-4 px-6 font-bold text-sm relative transition-all duration-200",
                activeTab === 'event'
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Event Details
              {activeTab === 'event' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={cn(
                "py-4 px-6 font-bold text-sm relative transition-all duration-200",
                activeTab === 'business'
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Quote & Pricing
              {activeTab === 'business' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={cn(
                "py-4 px-6 font-bold text-sm relative transition-all duration-200",
                activeTab === 'actions'
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Actions
              {activeTab === 'actions' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-t-full"></div>
              )}
            </button>
          </nav>
        </div>

        {/* Content Area with Scroll */}
        <div className="p-8 max-h-[calc(95vh-240px)] overflow-y-auto">
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
                        <h2 className="text-2xl font-bold text-gray-900">
                          {displayCoupleName}
                        </h2>
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
                        <p className="font-medium text-gray-900">{displayEmail}</p>
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
                  Event Schedule & Timing
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-rose-100">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      <div>
                        <p className="text-sm text-gray-600">Event Date</p>
                        <p className="text-xl font-bold text-gray-900">
                          {new Date(booking.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {booking.eventTime && (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-100">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Start Time</p>
                          <p className="text-lg font-semibold text-gray-900">{booking.eventTime}</p>
                        </div>
                      </div>
                    )}

                    {booking.eventEndTime && (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-purple-100">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">End Time</p>
                          <p className="text-lg font-semibold text-gray-900">{booking.eventEndTime}</p>
                        </div>
                      </div>
                    )}

                    {/* Duration Calculation */}
                    {booking.eventTime && booking.eventEndTime && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                        <Timer className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(() => {
                              const start = new Date(`2000-01-01 ${booking.eventTime}`);
                              const end = new Date(`2000-01-01 ${booking.eventEndTime}`);
                              const diffMs = end.getTime() - start.getTime();
                              const diffHrs = Math.floor(diffMs / 3600000);
                              const diffMins = Math.floor((diffMs % 3600000) / 60000);
                              return `${diffHrs}h ${diffMins}m`;
                            })()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {booking.eventLocation ? (
                      <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-100">
                        <MapPin className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Event Location</p>
                          <p className="font-medium text-gray-900">{booking.eventLocation}</p>
                          <button 
                            onClick={() => {
                              const address = encodeURIComponent(booking.eventLocation || 'Philippines');
                              window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                            }}
                            className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                          >
                            View on Map →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Event Location</p>
                          <p className="text-gray-500 italic">Location to be confirmed</p>
                        </div>
                      </div>
                    )}
                    
                    {booking.guestCount ? (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-100">
                        <User className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Guest Count</p>
                          <p className="font-medium text-gray-900">{booking.guestCount} guests</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Guest Count</p>
                          <p className="text-gray-500 italic">To be determined</p>
                        </div>
                      </div>
                    )}

                    {/* Contact Person */}
                    {booking.contactPerson && (
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-yellow-100">
                        <User className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm text-gray-600">Contact Person</p>
                          <p className="font-medium text-gray-900">{booking.contactPerson}</p>
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
              {/* Quote & Pricing Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Quote & Pricing Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Budget Range */}
                  {booking.budgetRange && booking.budgetRange !== 'To be discussed' && (
                    <div className="bg-white rounded-lg p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-orange-500" />
                        <p className="text-sm text-gray-600">Client Budget Range</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{booking.budgetRange}</p>
                    </div>
                  )}

                  {/* Estimated Cost Range - Only show if both values exist and > 0 */}
                  {booking.estimatedCostMin && booking.estimatedCostMax && booking.estimatedCostMin > 0 && booking.estimatedCostMax > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <p className="text-sm text-gray-600">Estimated Cost Range</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ₱{booking.estimatedCostMin.toLocaleString()} - ₱{booking.estimatedCostMax.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Quote Amount */}
                  {booking.quoteAmount && booking.quoteAmount > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <p className="text-sm text-gray-600">Quote Amount</p>
                      </div>
                      <p className="text-lg font-bold text-purple-700">
                        ₱{booking.quoteAmount.toLocaleString()}
                      </p>
                      {booking.quoteSentDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Sent: {new Date(booking.quoteSentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total Amount */}
                  {booking.totalAmount && booking.totalAmount > 0 && (
                    <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg p-4 border-2 border-emerald-300">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-700" />
                        <p className="text-sm font-medium text-emerald-700">Total Service Amount</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-800">
                        {booking.formatted?.totalAmount || `₱${booking.totalAmount.toLocaleString()}`}
                      </p>
                    </div>
                  )}

                  {/* Deposit Amount */}
                  {booking.depositAmount && booking.depositAmount > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-yellow-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-gray-600">Required Deposit</p>
                      </div>
                      <p className="text-lg font-bold text-yellow-700">
                        ₱{booking.depositAmount.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Downpayment Amount */}
                  {booking.downpaymentAmount && booking.downpaymentAmount > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-indigo-500" />
                        <p className="text-sm text-gray-600">Downpayment</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-700">
                        {booking.formatted?.downpaymentAmount || `₱${booking.downpaymentAmount.toLocaleString()}`}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Package/Itemization Details Section */}
                {(booking.packageName || booking.customItems) && (
                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Package & Itemization Details
                    </h3>

                    {/* Package Information */}
                    {booking.packageName && (
                      <div className="space-y-4">
                        {/* Package Header */}
                        <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-xl font-bold text-purple-900">{booking.packageName}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {booking.itemizationType === 'package' ? 'Pre-designed Package' : 'Custom Package'}
                              </p>
                            </div>
                            {booking.packagePrice && booking.packagePrice > 0 && (
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Package Price</p>
                                <p className="text-2xl font-bold text-purple-700">
                                  ₱{booking.packagePrice.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Package Items */}
                          {booking.packageItems && booking.packageItems.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Package Includes:</p>
                              <div className="space-y-2">
                                {booking.packageItems.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      <span className="text-gray-800">{item.item}</span>
                                      {item.quantity && (
                                        <span className="text-sm text-gray-600">×{item.quantity}</span>
                                      )}
                                    </div>
                                    {item.price && item.price > 0 && (
                                      <span className="text-sm font-medium text-gray-700">
                                        ₱{item.price.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Add-ons */}
                        {booking.addOns && booking.addOns.length > 0 && (
                          <div className="bg-white rounded-lg p-5 border border-pink-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-pink-500" />
                              Add-ons & Extras
                            </h4>
                            <div className="space-y-2">
                              {booking.addOns.map((addon, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-3 bg-pink-50 rounded-lg">
                                  <span className="text-gray-800">{addon.name}</span>
                                  <span className="text-sm font-semibold text-pink-700">
                                    +₱{addon.price.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom Items (when no package selected) */}
                    {!booking.packageName && booking.customItems && booking.customItems.length > 0 && (
                      <div className="bg-white rounded-lg p-5 border-2 border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-purple-500" />
                          Custom Itemization
                        </h4>
                        <div className="space-y-2">
                          {booking.customItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-800">{item.description}</span>
                                {item.quantity && (
                                  <span className="text-sm text-gray-600">×{item.quantity}</span>
                                )}
                              </div>
                              {item.price && item.price > 0 && (
                                <span className="text-sm font-semibold text-purple-700">
                                  ₱{item.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Package Summary */}
                    {(booking.packagePrice || booking.addOns?.length) && (
                      <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-300">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">Package Total</span>
                          <span className="text-2xl font-bold text-purple-800">
                            ₱{((booking.packagePrice || 0) + 
                               (booking.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0)
                              ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show message if no quote has been sent yet */}
                {!booking.vendorNotes && !booking.totalAmount && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">No Quote Sent Yet</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Send a detailed quote to the client to provide pricing information and service details. 
                          Use the "Send Quote" button in the Actions tab to create and send a professional quote.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Progress */}
              {booking.totalAmount && booking.totalAmount > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Payment Progress
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Payment Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">Payment Status</p>
                        <p className="text-sm font-bold text-blue-600">
                          {Math.min((booking.totalPaid / booking.totalAmount) * 100, 100).toFixed(0)}% Complete
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={cn(
                            "bg-gradient-to-r from-blue-500 to-emerald-500 h-4 rounded-full transition-all duration-300",
                            booking.totalPaid === 0 ? "w-0" :
                            (booking.totalPaid / booking.totalAmount) >= 1 ? "w-full" :
                            (booking.totalPaid / booking.totalAmount) >= 0.75 ? "w-3/4" :
                            (booking.totalPaid / booking.totalAmount) >= 0.50 ? "w-1/2" :
                            (booking.totalPaid / booking.totalAmount) >= 0.25 ? "w-1/4" :
                            "w-1/12"
                          )}
                        />
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {booking.formatted?.totalPaid || `₱${booking.totalPaid.toLocaleString()}`}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-orange-100">
                        <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
                        <p className="text-xl font-bold text-orange-600">
                          {booking.formatted?.remainingBalance || `₱${(booking.totalAmount - booking.totalPaid).toLocaleString()}`}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {booking.paymentStatus || 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Notes & Terms - Professional Quote Display */}
              {booking.vendorNotes && (
                <div className="space-y-4">
                  {(() => {
                    try {
                      const quoteData = JSON.parse(booking.vendorNotes);
                      
                      return (
                        <div className="space-y-4">
                          {/* Professional Quote Header Card */}
                          <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl p-8 text-white shadow-xl">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                  <Receipt className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm text-rose-100 font-medium">Quote Reference</p>
                                  <h4 className="text-3xl font-bold tracking-tight">#{quoteData.quoteNumber}</h4>
                                </div>
                              </div>
                              <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                <p className="text-xs text-rose-100 mb-1">Valid Until</p>
                                <p className="text-lg font-bold">{new Date(quoteData.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>
                            {quoteData.message && (
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-white/95 leading-relaxed">{quoteData.message}</p>
                              </div>
                            )}
                          </div>

                          {/* Service Items - Modern Card Design */}
                          {quoteData.serviceItems && quoteData.serviceItems.length > 0 && (
                            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-pink-100 rounded-lg p-2">
                                      <Package className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Service Items</h4>
                                  </div>
                                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
                                    {quoteData.serviceItems.length} {quoteData.serviceItems.length === 1 ? 'item' : 'items'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="divide-y divide-gray-100">
                                {quoteData.serviceItems.map((item: any, index: number) => (
                                  <div key={item.id || index} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex justify-between items-start gap-6">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-3 mb-2">
                                          <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center text-sm font-bold text-pink-700">
                                            {index + 1}
                                          </span>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-pink-600 transition-colors">{item.name}</h5>
                                            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                          </div>
                                        </div>
                                        {item.category && (
                                          <div className="ml-11">
                                            <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 text-xs font-semibold rounded-full border border-pink-200">
                                              {item.category}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                          <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                          <p className="text-lg font-bold text-gray-900 mb-2">×{item.quantity}</p>
                                          <div className="border-t border-gray-200 pt-2">
                                            <p className="text-2xl font-black text-gray-900">₱{item.total?.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">₱{item.unitPrice?.toLocaleString()} each</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pricing Summary - Premium Design */}
                          {quoteData.pricing && (
                            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200 shadow-sm">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="bg-emerald-500 rounded-xl p-2.5">
                                  <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">Pricing Breakdown</h4>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100">
                                  <span className="text-gray-700 font-medium">Subtotal</span>
                                  <span className="text-xl font-bold text-gray-900">₱{quoteData.pricing.subtotal?.toLocaleString()}</span>
                                </div>
                                
                                {quoteData.pricing.tax > 0 && (
                                  <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100">
                                    <span className="text-gray-700 font-medium">Tax (12%)</span>
                                    <span className="text-xl font-bold text-gray-900">₱{quoteData.pricing.tax?.toLocaleString()}</span>
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-lg">
                                  <span className="text-white text-lg font-bold">Total Amount</span>
                                  <span className="text-white text-3xl font-black tracking-tight">₱{quoteData.pricing.total?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Payment Terms - Elegant Split Design */}
                          {quoteData.paymentTerms && quoteData.pricing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-3">
                                  <p className="text-white text-sm font-semibold">Downpayment Required</p>
                                </div>
                                <div className="p-6">
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <p className="text-4xl font-black text-amber-600">₱{quoteData.pricing.downpayment?.toLocaleString()}</p>
                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                      {quoteData.paymentTerms.downpayment}%
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">Due upon booking confirmation</p>
                                </div>
                              </div>
                              
                              <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3">
                                  <p className="text-white text-sm font-semibold">Remaining Balance</p>
                                </div>
                                <div className="p-6">
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <p className="text-4xl font-black text-blue-600">₱{quoteData.pricing.balance?.toLocaleString()}</p>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                      {quoteData.paymentTerms.balance}%
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">Due before service delivery</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Terms & Conditions - Professional Notice */}
                          {quoteData.terms && quoteData.terms.trim() !== '' && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
                              <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 border-b border-amber-200">
                                <div className="flex items-center gap-3">
                                  <div className="bg-amber-500 rounded-lg p-2">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">Terms & Conditions</h4>
                                </div>
                              </div>
                              <div className="p-6">
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-amber-100">
                                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{quoteData.terms}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Quote Metadata - Footer */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Quote generated on</span>
                              <span className="font-semibold text-gray-900">
                                {new Date(quoteData.timestamp).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      // Fallback for non-JSON vendor notes
                      return (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-4 border-b border-blue-200">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-500 rounded-lg p-2">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <h4 className="text-lg font-bold text-gray-900">Vendor Notes</h4>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-blue-100">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{booking.vendorNotes}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Business Information Note */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Processing Information</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      All payment processing is handled through the Wedding Bazaar platform. 
                      Vendors can send quotes and track booking status, but actual payment collection 
                      is managed by the client's payment system. For payment-related inquiries, 
                      please refer clients to their booking dashboard or contact platform support.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Business Tab */}
              <div className="flex flex-wrap gap-3">
                {booking.status === 'quote_requested' && onSendQuote && (
                  <button
                    onClick={() => onSendQuote(booking)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    Send Quote
                  </button>
                )}
                {booking.status === 'quote_sent' && onSendQuote && (
                  <button
                    onClick={() => onSendQuote(booking)}
                    className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2 font-semibold"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Quote
                  </button>
                )}
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Quote
                </button>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Primary Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Primary Actions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendorActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={action.action}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 group text-left",
                        action.variant === 'primary' 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105" 
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        action.variant === 'primary' 
                          ? "bg-white/20" 
                          : "bg-blue-100"
                      )}>
                        <action.icon className={cn(
                          "w-5 h-5",
                          action.variant === 'primary' 
                            ? "text-white" 
                            : "text-blue-600"
                        )} />
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium",
                          action.variant === 'primary' 
                            
                            ? "text-white" 
                            : "text-gray-900"
                        )}>
                          {action.label}
                        </p>
                        <p className={cn(
                          "text-sm",
                          action.variant === 'primary' 
                            ? "text-blue-100" 
                            : "text-gray-600"
                        )}>
                          {action.type === 'send_quote' && 'Create and send a detailed quote to the client'}
                          {action.type === 'edit_quote' && 'Modify the existing quote details'}
                          {action.type === 'confirm_booking' && 'Confirm the booking after quote acceptance'}
                          {action.type === 'start_service' && 'Mark service as started/in progress'}
                          {action.type === 'complete_service' && 'Mark service as completed'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication Actions */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Communication
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => onContactClient?.(booking)}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3 group"
                  >
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Message Client</p>
                      <p className="text-sm text-gray-600">Send direct message</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Schedule Call</p>
                      <p className="text-sm text-gray-600">Book consultation call</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Send Email</p>
                      <p className="text-sm text-gray-600">Professional email</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Schedule Meeting</p>
                      <p className="text-sm text-gray-600">In-person consultation</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Administrative Actions */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  Administrative Actions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Generate Contract</p>
                      <p className="text-sm text-gray-600">Create service agreement</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Export Data</p>
                      <p className="text-sm text-gray-600">Download booking info</p>
                    </div>
                  </button>
                  
                  <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all flex items-center gap-3 group">
                    <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Flag Issue</p>
                      <p className="text-sm text-gray-600">Report problems</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status History - LATEST FIRST */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Booking Timeline
                </h3>
                
                <div className="space-y-3">
                  {/* Show timeline in REVERSE order - Latest events first */}
                  
                  {/* 4. LATEST - Booking Confirmed (if applicable) */}
                  {booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed' ? (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-green-500 shadow-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Booking Confirmed</p>
                        <p className="text-sm text-green-600 font-medium">Service scheduled</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-500">Booking Confirmed</p>
                        <p className="text-sm text-gray-400">Pending</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 3. Quote Sent (if applicable) */}
                  {booking.status === 'quote_sent' || booking.status === 'quote_accepted' || booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed' ? (
                    <div className={cn(
                      "flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm",
                      booking.status === 'quote_sent' ? "border-2 border-blue-500" : "border-gray-200"
                    )}>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        booking.status === 'quote_sent' ? "bg-blue-500 animate-pulse" : "bg-blue-500"
                      )}></div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium text-gray-900",
                          booking.status === 'quote_sent' && "font-bold"
                        )}>Quote Sent</p>
                        <p className="text-sm text-blue-600">Waiting for client response</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-500">Quote Sent</p>
                        <p className="text-sm text-gray-400">Pending</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 2. Quote Requested */}
                  {booking.status === 'quote_requested' || booking.status === 'request' ? (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-purple-500 shadow-sm">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">Quote Requested</p>
                        <p className="text-sm text-purple-600 font-medium">Waiting for vendor quote</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Quote Requested</p>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 1. OLDEST - Booking Request Received (always at bottom) */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Booking Request Received</p>
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
