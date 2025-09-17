import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  FileText, 
  User,
  Building,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { bookingInteractionService, type BookingInteraction } from '../../services/bookingInteractionService';
import { useAuth } from '../../contexts/AuthContext';
import type { Booking } from '../../types/comprehensive-booking.types';

interface BookingWorkflowProps {
  booking: Booking;
  onUpdate: () => void;
}

export const BookingWorkflow: React.FC<BookingWorkflowProps> = ({ booking }) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<BookingInteraction[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'actions' | 'details'>('timeline');

  const userType = user?.role === 'vendor' ? 'vendor' : 'couple';
  const isCouple = userType === 'couple';
  const isVendor = userType === 'vendor';

  useEffect(() => {
    loadInteractions();
  }, [booking.id]);

  const loadInteractions = async () => {
    try {
      const data = await bookingInteractionService.getBookingInteractions(booking.id);
      setInteractions(data);
    } catch (error) {
      console.error('Failed to load interactions:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-700',
      'quote_requested': 'bg-yellow-100 text-yellow-800',
      'quote_sent': 'bg-blue-100 text-blue-800',
      'quote_accepted': 'bg-green-100 text-green-800',
      'quote_rejected': 'bg-red-100 text-red-800',
      'confirmed': 'bg-emerald-100 text-emerald-800',
      'downpayment_paid': 'bg-purple-100 text-purple-800',
      'paid_in_full': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-500',
      'disputed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'booking_requested': return User;
      case 'quote_provided': return FileText;
      case 'quote_accepted': return CheckCircle;
      case 'downpayment_paid': return DollarSign;
      case 'booking_confirmed': return CheckCircle;
      case 'progress_update': return Clock;
      case 'service_completed': return CheckCircle;
      default: return MessageSquare;
    }
  };

  const nextAction = bookingInteractionService.getNextExpectedAction(booking, userType);
  const timeline = bookingInteractionService.getStatusTimeline();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Booking #{booking.id.slice(-8)}
            </h3>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-gray-600">{booking.service_type}</span>
              <span className="text-gray-600">{new Date(booking.event_date).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          {nextAction && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Next Action:</p>
              <p className="font-medium text-rose-600">{nextAction.description}</p>
              {nextAction.urgent && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800 mt-1">
                  Urgent
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['timeline', 'actions', 'details'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-rose-500 text-rose-600 bg-rose-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">Booking Progress</h4>
            
            {/* Status Timeline */}
            <div className="relative">
              {timeline.map((step, index) => {
                const isCompleted = timeline.findIndex(s => s.status === booking.status) >= index;
                const isCurrent = step.status === booking.status;
                
                return (
                  <div key={step.status} className="flex items-start space-x-4 pb-6">
                    {/* Status indicator */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : isCurrent
                        ? 'bg-rose-100 border-rose-500 text-rose-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className={`font-medium ${
                          isCompleted ? 'text-gray-900' : isCurrent ? 'text-rose-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h5>
                        <span className={`text-xs px-2 py-1 rounded ${
                          step.actorType === 'couple' ? 'bg-blue-100 text-blue-700' :
                          step.actorType === 'vendor' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {step.actorType === 'couple' ? 'Your Action' : 
                           step.actorType === 'vendor' ? 'Vendor Action' : 'System'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                    
                    {/* Connector line */}
                    {index < timeline.length - 1 && (
                      <div className={`absolute left-4 w-0.5 h-6 ${
                        isCompleted ? 'bg-rose-500' : 'bg-gray-200'
                      }`} style={{ top: `${(index + 1) * 80 + 32}px` }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recent Interactions */}
            {interactions.length > 0 && (
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {interactions.slice(-5).reverse().map((interaction) => {
                    const Icon = getActionIcon(interaction.actionType);
                    return (
                      <div key={interaction.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {interaction.actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(interaction.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {interaction.message && (
                            <p className="text-sm text-gray-600 mt-1">{interaction.message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 mb-4">Available Actions</h4>
            
            {/* Couple Actions */}
            {isCouple && (
              <div className="space-y-4">
                {booking.status === 'quote_sent' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">Quote Review Required</h5>
                    <p className="text-sm text-yellow-700 mb-4">
                      The vendor has sent you a quote. Please review and respond.
                    </p>
                    <div className="flex space-x-3">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Accept Quote
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                        Request Revision
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Decline Quote
                      </button>
                    </div>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Payment Required</h5>
                    <p className="text-sm text-blue-700 mb-4">
                      Make your downpayment to secure this booking.
                    </p>
                    {/* TODO: Re-implement payment modal functionality
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Make Payment</span>
                    </button>
                    */}
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      disabled
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Make Payment (Coming Soon)</span>
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2">Leave a Review</h5>
                    <p className="text-sm text-green-700 mb-4">
                      Share your experience with this vendor to help other couples.
                    </p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Write Review
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Vendor Actions */}
            {isVendor && (
              <div className="space-y-4">
                {booking.status === 'quote_requested' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-2">Quote Request</h5>
                    <p className="text-sm text-yellow-700 mb-4">
                      A couple has requested a quote for your services.
                    </p>
                    {/* TODO: Re-implement quote modal functionality
                    <button 
                      onClick={() => setShowQuoteModal(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Send Quote</span>
                    </button>
                    */}
                    <button 
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                      disabled
                    >
                      <FileText className="w-4 h-4" />
                      <span>Send Quote (Coming Soon)</span>
                    </button>
                  </div>
                )}

                {booking.status === 'downpayment_paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2">Confirm Booking</h5>
                    <p className="text-sm text-green-700 mb-4">
                      The couple has made their downpayment. Confirm the booking to proceed.
                    </p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Confirm Booking
                    </button>
                  </div>
                )}

                {booking.status === 'in_progress' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Service in Progress</h5>
                    <p className="text-sm text-blue-700 mb-4">
                      Keep the couple updated on your progress.
                    </p>
                    <div className="flex space-x-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Send Update
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Mark Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Communication */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Communication</h5>
              <p className="text-sm text-gray-600 mb-4">
                Send a message to {isCouple ? 'the vendor' : 'the couple'}.
              </p>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 mb-4">Booking Details</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Information
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type:</span>
                    <span className="font-medium">{booking.service_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Date:</span>
                    <span className="font-medium">{new Date(booking.event_date).toLocaleDateString()}</span>
                  </div>
                  {booking.event_time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{booking.event_time}</span>
                    </div>
                  )}
                  {booking.event_location && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{booking.event_location}</span>
                    </div>
                  )}
                  {booking.guest_count && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Count:</span>
                      <span className="font-medium">{booking.guest_count}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  {isCouple ? <Building className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                  {isCouple ? 'Vendor' : 'Client'} Information
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {isCouple ? booking.vendor_name : booking.contact_person}
                    </span>
                  </div>
                  {booking.contact_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Email:
                      </span>
                      <span className="font-medium">
                        {booking.contact_email}
                      </span>
                    </div>
                  )}
                  {booking.contact_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Phone:
                      </span>
                      <span className="font-medium">
                        {booking.contact_phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {(booking.quoted_price || booking.total_paid) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payment Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    {booking.quoted_price && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quote Amount:</span>
                        <span className="font-medium">₱{booking.quoted_price.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.total_paid > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">₱{booking.total_paid.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.quoted_price && booking.total_paid && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-medium">₱{(booking.quoted_price - booking.total_paid).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {booking.special_requests && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Special Requests</h5>
                  <p className="text-sm text-gray-600">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingWorkflow;
