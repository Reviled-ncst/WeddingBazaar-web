import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Banknote,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { cn } from '../../../utils/cn';

// Import comprehensive types and API service
import type { 
  ServiceCategory
} from '../../../shared/types/comprehensive-booking.types';
import type { 
  BookingRequest,
  Booking
} from '../../../pages/users/individual/bookings/types/booking.types';
import { mapToUIBooking } from '../../../pages/users/individual/bookings/types/booking.types';
import type { Service } from '../types';

// Define local contact method union for form usage
type ContactMethod = 'email' | 'phone' | 'message';

// Import comprehensive booking API service
import { bookingApiService } from '../../../services/api/bookingApiService';

// Import auth context
import { useAuth } from '../../../shared/contexts/AuthContext';
import { LocationPicker } from '../../../shared/components/forms/LocationPicker';

interface BookingRequestModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated?: (booking: any) => void; // Changed to any for now to avoid circular dependencies
}

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  service,
  isOpen,
  onClose,
  onBookingCreated
}) => {
  console.log('🎭 [BookingModal] Component render with comprehensive API - isOpen:', isOpen);
  if (isOpen) {
    console.log('🎭 [BookingModal] Modal is open with service:', service);
  }
  
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Enhanced form state to match database schema
  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    eventEndTime: '',
    eventLocation: '',
    venueDetails: '',
    guestCount: '',
    budgetRange: '',
    specialRequests: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    preferredContactMethod: 'email' as ContactMethod,
    paymentTerms: ''
  });

  // Check for existing booking when modal opens
  useEffect(() => {
    if (isOpen && user?.id && service?.vendorId) {
      console.log('🎭 [BookingModal] Modal opened, checking for existing booking');
      console.log('Modal state:', { isOpen, userId: user?.id, vendorId: service?.vendorId, serviceId: service?.id });
      checkExistingBooking();
    } else if (isOpen) {
      console.log('⚠️ [BookingModal] Modal opened but missing required data for booking check');
      console.log('Missing data:', { 
        isOpen, 
        hasUser: !!user?.id, 
        hasVendorId: !!service?.vendorId, 
        hasServiceId: !!service?.id 
      });
    }
  }, [isOpen, user?.id, service?.vendorId, service?.id]);

  const checkExistingBooking = async () => {
    if (!user?.id || !service?.vendorId || !service?.id) {
      console.log('⏭️ [BookingModal] Skipping existing booking check - missing required IDs');
      return;
    }
    
    console.log('🔍 [BookingModal] Checking for existing booking...');
    console.log('Parameters:', { 
      userId: user.id, 
      vendorId: service.vendorId, 
      serviceId: service.id 
    });
    
    setCheckingExisting(true);
    try {
      const params = new URLSearchParams({
        coupleId: user.id,
        vendorId: service.vendorId,
        serviceId: service.id,
        limit: '1',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });

      const response = await fetch(`/api/bookings/enhanced?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.bookings && data.bookings.length > 0) {
          console.log('⚠️ [BookingModal] Found existing booking:', data.bookings[0]);
          // Map API booking to UI booking
          setExistingBooking(mapToUIBooking(data.bookings[0]));
        } else {
          console.log('✅ [BookingModal] No existing booking found - user can proceed');
        }
      } else {
        console.log('⚠️ [BookingModal] No existing booking found or API error');
      }
    } catch (error) {
      console.error('❌ [BookingModal] Error checking existing booking:', error);
    } finally {
      setCheckingExisting(false);
      console.log('🏁 [BookingModal] Existing booking check completed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 [BookingModal] Form field changed: ${field} = "${value}"`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log('📋 [BookingModal] Updated form data:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [BookingModal] Starting booking submission process');
    console.log('📋 [BookingModal] Form data:', formData);
    console.log('👤 [BookingModal] User:', user);
    console.log('🏪 [BookingModal] Service:', service);
    
    if (!user?.id || !service?.vendorId) {
      console.error('❌ [BookingModal] Authentication error - missing user or vendor ID');
      console.log('User ID:', user?.id);
      console.log('Vendor ID:', service?.vendorId);
      setErrorMessage('Authentication required. Please log in.');
      setSubmitStatus('error');
      return;
    }

    if (!formData.eventDate) {
      console.error('❌ [BookingModal] Validation error - missing event date');
      setErrorMessage('Event date is required.');
      setSubmitStatus('error');
      return;
    }

    console.log('✅ [BookingModal] Validation passed, proceeding with submission');
    console.log('📍 [BookingModal] Event location value:', formData.eventLocation);
    console.log('📋 [BookingModal] All form values:', {
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      eventLocation: formData.eventLocation,
      guestCount: formData.guestCount,
      budgetRange: formData.budgetRange,
      specialRequests: formData.specialRequests,
      contactPhone: formData.contactPhone,
      preferredContactMethod: formData.preferredContactMethod
    });
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Create comprehensive booking request
      const comprehensiveBookingRequest: BookingRequest = {
        vendor_id: service.vendorId || '',
        service_id: service.id,
        service_type: service.category as ServiceCategory,
        service_name: service.name,
        event_date: formData.eventDate,
        event_time: formData.eventTime || undefined,
        event_end_time: formData.eventEndTime || undefined,
        event_location: formData.eventLocation || undefined,
        venue_details: formData.venueDetails || undefined,
        guest_count: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        special_requests: formData.specialRequests || undefined,
        contact_person: formData.contactPerson || undefined,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail || undefined,
        preferred_contact_method: formData.preferredContactMethod || 'email',
        budget_range: formData.budgetRange || undefined,
        metadata: {
          sourceModal: 'ServiceDetailsModal',
          submissionTimestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          serviceName: service.name,
          vendorName: service.vendorName
        }
      };

      console.log('📤 [BookingModal] Prepared comprehensive booking request:', comprehensiveBookingRequest);
      console.log('🌐 [BookingModal] Sending comprehensive API request');
      
      const createdBooking = await bookingApiService.createBookingRequest(comprehensiveBookingRequest, user?.id);
      
      console.log('📥 [BookingModal] Comprehensive API response received:', createdBooking);
      console.log('✅ [BookingModal] Booking request successful with comprehensive schema!');
      console.log('🎉 [BookingModal] Created booking:', createdBooking);
      
      setSubmitStatus('success');
      onBookingCreated?.(createdBooking);
      
      // Dispatch custom event to notify IndividualBookings to refresh
      const bookingCreatedEvent = new CustomEvent('bookingCreated', {
        detail: createdBooking
      });
      window.dispatchEvent(bookingCreatedEvent);
      console.log('📢 [BookingModal] Dispatched bookingCreated event');
      
      // Close modal after 3 seconds with countdown
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          console.log('🔄 [BookingModal] Auto-closing modal and resetting form');
          onClose();
          resetForm();
        }
      }, 1000);
    } catch (error) {
      console.error('💥 [BookingModal] Exception during booking submission:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Full error object:', error);
      setErrorMessage('An error occurred while submitting your request. Please try again.');
      setSubmitStatus('error');
    } finally {
      console.log('🏁 [BookingModal] Booking submission process completed');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventDate: '',
      eventTime: '',
      eventEndTime: '',
      eventLocation: '',
      venueDetails: '',
      guestCount: '',
      budgetRange: '',
      specialRequests: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      preferredContactMethod: 'email',
      paymentTerms: ''
    });
    setSubmitStatus('idle');
    setErrorMessage('');
    setExistingBooking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-700 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'declined': return 'text-red-700 bg-red-100 border-red-200';
      case 'cancelled': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-blue-700 bg-blue-100 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  // Show loading state while checking existing booking
  if (checkingExisting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 rounded-full">
              <Loader className="h-8 w-8 animate-spin text-rose-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Checking Existing Bookings</h3>
              <p className="text-gray-600">Please wait while we verify your booking history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show existing booking if found
  if (existingBooking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-t-3xl border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Existing Booking Found</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                  <p className="font-semibold text-blue-900 mb-2">You already have a booking with this vendor</p>
                  <p className="text-blue-700 text-sm">Please review your existing booking details below.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-105"
                title="Close existing booking modal"
                aria-label="Close existing booking modal"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-600 font-medium">Service:</span>
                      <span className="font-semibold text-gray-900">{existingBooking.serviceName}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                      <span className="text-gray-600 font-medium">Event Date:</span>
                      <span className="font-semibold text-gray-900">{formatDate(existingBooking.eventDate)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-center">
                      <span className="text-gray-600 font-medium block mb-3">Status:</span>
                      <span className={cn(
                        "inline-flex px-4 py-2 rounded-full text-sm font-semibold border-2",
                        getStatusColor(existingBooking.status)
                      )}>
                        {existingBooking.status.charAt(0).toUpperCase() + existingBooking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {existingBooking.responseMessage && (
                  <div className="mt-6">
                    <span className="text-gray-600 font-medium block mb-3">Vendor Response:</span>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-700 italic">"{existingBooking.responseMessage}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {/* Navigate to bookings page */}}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                title="View all your bookings"
                aria-label="View all bookings"
              >
                <Calendar className="h-5 w-5" />
                <span>View All Bookings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 rounded-t-3xl border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Request Booking</h3>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                <p className="text-lg font-semibold text-gray-800">{service.name}</p>
                <p className="text-gray-600 flex items-center space-x-2">
                  <span>by {service.vendorName}</span>
                  <span className="text-rose-500">•</span>
                  <span className="capitalize">{service.category}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-105"
              title="Close modal"
              aria-label="Close booking request modal"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* Enhanced Success Message with Confetti Effect */}
          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg animate-in slide-in-from-top duration-300 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-2 left-4 w-2 h-2 bg-green-300 rounded-full animate-bounce animation-delay-0"></div>
                <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce animation-delay-200"></div>
                <div className="absolute bottom-4 left-8 w-1 h-1 bg-green-400 rounded-full animate-bounce animation-delay-500"></div>
                <div className="absolute bottom-2 right-6 w-2 h-2 bg-emerald-300 rounded-full animate-bounce animation-delay-700"></div>
              </div>
              
              <div className="relative flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-full shadow-sm animate-pulse">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 text-xl mb-3 flex items-center space-x-2">
                    <span>🎉 Booking Request Submitted Successfully!</span>
                  </h4>
                  <div className="space-y-3 text-green-800">
                    <p className="font-medium text-lg">Your booking request has been sent to <span className="text-green-900 font-bold">{service.vendorName}</span>.</p>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-green-100">
                      <p className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                        <span>📋 What happens next?</span>
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse"></div>
                          <span>The vendor will review your request within <strong>24 hours</strong></span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse animate-delay-100"></div>
                          <span>You'll receive an <strong>email confirmation</strong> shortly</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse animate-delay-200"></div>
                          <span>The vendor will contact you via your <strong>preferred method</strong></span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse animate-delay-300"></div>
                          <span>Track the status in your <strong>bookings dashboard</strong></span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-green-700 bg-green-100/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                        <span className="font-medium">Request ID:</span>
                        <code className="bg-white px-2 py-1 rounded text-xs font-mono">#{Date.now().toString().slice(-6)}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Error Message */}
          {submitStatus === 'error' && errorMessage && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl shadow-lg animate-in slide-in-from-top duration-300 relative">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-100 rounded-full shadow-sm">
                  <AlertCircle className="h-7 w-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 text-xl mb-3 flex items-center space-x-2">
                    <span>❌ Something went wrong</span>
                  </h4>
                  <p className="text-red-800 mb-4 text-lg">{errorMessage}</p>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-red-100">
                    <p className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                      <span>🛠️ Try these solutions:</span>
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span>Check your <strong>internet connection</strong> and try again</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span>Ensure all <strong>required fields</strong> are filled correctly</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span>Try refreshing the page and submitting again</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span>Contact our <strong>support team</strong> if the problem persists</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        setSubmitStatus('idle');
                        setErrorMessage('');
                      }}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors duration-200 font-medium text-sm"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => window.location.href = 'mailto:support@weddingbazaar.com'}
                      className="px-4 py-2 bg-white hover:bg-gray-50 text-red-700 border border-red-200 rounded-lg transition-colors duration-200 font-medium text-sm"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Event Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                      min={new Date().toISOString().split('T')[0]}
                      title="Select event date"
                      aria-label="Event date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Event Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                      title="Select event time"
                      aria-label="Event time"
                      placeholder="Select time"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Event Location
                </label>
                <LocationPicker
                  value={formData.eventLocation}
                  onChange={(location, locationData) => {
                    console.log('📍 [BookingModal] Location selected:', location, locationData);
                    handleInputChange('eventLocation', location);
                  }}
                  placeholder="Search for venue or enter address"
                  className="w-full"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Venue Details <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.venueDetails}
                  onChange={(e) => handleInputChange('venueDetails', e.target.value)}
                  placeholder="e.g., Grand Ballroom, 3rd Floor, specific room requirements..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={formData.guestCount}
                      onChange={(e) => handleInputChange('guestCount', e.target.value)}
                      placeholder="e.g., 150"
                      min="1"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Budget Range
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                      aria-label="Select budget range"
                    >
                      <option value="">Select budget range</option>
                      <option value="₱25,000-₱50,000">₱25,000 - ₱50,000</option>
                      <option value="₱50,000-₱100,000">₱50,000 - ₱100,000</option>
                      <option value="₱100,000-₱250,000">₱100,000 - ₱250,000</option>
                      <option value="₱250,000-₱500,000">₱250,000 - ₱500,000</option>
                      <option value="₱500,000+">₱500,000+</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50/30 rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Contact Information</h4>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Contact Person <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="e.g., John Smith (Groom)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Contact Email <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="contact@example.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="Your phone number (e.g., +63 9XX XXX XXXX)"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="group relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-200">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={formData.preferredContactMethod === 'email'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="sr-only"
                        aria-label="Contact by email"
                      />
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`p-2 rounded-lg transition-colors ${formData.preferredContactMethod === 'email' ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-100'}`}>
                          <Mail className={`h-5 w-5 transition-colors ${formData.preferredContactMethod === 'email' ? 'text-rose-600' : 'text-gray-600 group-hover:text-rose-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium transition-colors ${formData.preferredContactMethod === 'email' ? 'text-rose-900' : 'text-gray-700'}`}>Email</div>
                          <div className="text-xs text-gray-500">Quick response</div>
                        </div>
                        {formData.preferredContactMethod === 'email' && (
                          <div className="p-1 bg-rose-500 rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                    
                    <label className="group relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-200">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={formData.preferredContactMethod === 'phone'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="sr-only"
                        aria-label="Contact by phone"
                      />
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`p-2 rounded-lg transition-colors ${formData.preferredContactMethod === 'phone' ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-100'}`}>
                          <Phone className={`h-5 w-5 transition-colors ${formData.preferredContactMethod === 'phone' ? 'text-rose-600' : 'text-gray-600 group-hover:text-rose-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium transition-colors ${formData.preferredContactMethod === 'phone' ? 'text-rose-900' : 'text-gray-700'}`}>Phone</div>
                          <div className="text-xs text-gray-500">Direct call</div>
                        </div>
                        {formData.preferredContactMethod === 'phone' && (
                          <div className="p-1 bg-rose-500 rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                    
                    <label className="group relative flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-all duration-200">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="message"
                        checked={formData.preferredContactMethod === 'message'}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                        className="sr-only"
                        aria-label="Contact by message"
                      />
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`p-2 rounded-lg transition-colors ${formData.preferredContactMethod === 'message' ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-100'}`}>
                          <MessageSquare className={`h-5 w-5 transition-colors ${formData.preferredContactMethod === 'message' ? 'text-rose-600' : 'text-gray-600 group-hover:text-rose-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium transition-colors ${formData.preferredContactMethod === 'message' ? 'text-rose-900' : 'text-gray-700'}`}>Message</div>
                          <div className="text-xs text-gray-500">In-app chat</div>
                        </div>
                        {formData.preferredContactMethod === 'message' && (
                          <div className="p-1 bg-rose-500 rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Special Requests & Notes</h4>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Tell us about any special requirements, dietary restrictions, accessibility needs, or other important details for your event..."
                  rows={4}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none transition-all duration-200 bg-white shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 The more details you provide, the better the vendor can prepare for your special day!
                </p>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200/50">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'success'}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <div className="relative z-10 flex items-center space-x-3">
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-5 w-5 animate-pulse" />
                        <span>Request Submitted! 🎉</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
                        <span>Submit Booking Request</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              {!isSubmitting && submitStatus !== 'success' && (
                <div className="mt-6 text-center">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-gray-700 flex items-center justify-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animate-delay-100"></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animate-delay-200"></div>
                      </div>
                      <span>🔒 Your information is secure and will only be shared with the selected vendor</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Loading overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-50">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-900">Submitting your request...</p>
                    <p className="text-sm text-gray-600 mt-1">This will only take a moment</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
