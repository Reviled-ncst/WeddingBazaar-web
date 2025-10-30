import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  MessageSquare,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../../shared/contexts/HybridAuthContext';
import type { Service } from '../types';
import type { 
  ServiceCategory,
  BookingRequest
} from '../../../shared/types/comprehensive-booking.types';
import { availabilityService } from '../../../services/availabilityService';
import { optimizedBookingApiService } from '../../../services/api/optimizedBookingApiService';
import { BookingSuccessModal } from './BookingSuccessModal';

interface BookingRequestModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated?: (booking: BookingRequest) => void;
}

type ContactMethod = 'email' | 'phone' | 'message';

export const BookingRequestModal: React.FC<BookingRequestModalProps> = ({
  service,
  isOpen,
  onClose,
  onBookingCreated
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState<{
    id: string | number;
    serviceName: string;
    vendorName: string;
    eventDate: string;
    eventTime?: string;
    eventLocation?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    guestCount: '',
    budgetRange: '',
    selectedPackage: '',
    specialRequests: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    preferredContactMethod: 'email' as ContactMethod
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Prefill user data
  useEffect(() => {
    if (isOpen && user) {
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim() 
        : user.firstName || user.lastName || '';
      
      setFormData(prev => ({
        ...prev,
        contactPerson: fullName || prev.contactPerson,
        contactEmail: user.email || prev.contactEmail,
        contactPhone: user.phone || prev.contactPhone
      }));
    }
  }, [isOpen, user]);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Calculate form completion
  const formProgress = useMemo(() => {
    const step1Complete = formData.eventDate && formData.eventLocation;
    const step2Complete = formData.guestCount && formData.budgetRange;
    const step3Complete = formData.contactPhone && formData.contactPerson;
    
    let completed = 0;
    if (step1Complete) completed++;
    if (step2Complete) completed++;
    if (step3Complete) completed++;
    
    return {
      completed,
      total: 3,
      percentage: Math.round((completed / 3) * 100)
    };
  }, [formData]);

  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.eventDate) errors.eventDate = 'Event date is required';
      if (!formData.eventLocation) errors.eventLocation = 'Location is required';
    } else if (step === 2) {
      if (!formData.guestCount) {
        errors.guestCount = 'Number of guests is required';
      } else {
        const count = parseInt(formData.guestCount);
        if (isNaN(count) || count < 1) {
          errors.guestCount = 'Please enter a valid number';
        }
      }
      if (!formData.budgetRange) errors.budgetRange = 'Budget range is required';
    } else if (step === 3) {
      if (!formData.contactPerson) errors.contactPerson = 'Name is required';
      if (!formData.contactPhone) errors.contactPhone = 'Phone number is required';
      if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        errors.contactEmail = 'Please enter a valid email';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Check availability
      if (formData.eventDate && service?.vendorId) {
        const availabilityCheck = await availabilityService.checkAvailability(
          service.vendorId,
          formData.eventDate
        );
        
        if (!availabilityCheck.isAvailable) {
          setErrorMessage(
            `This date is not available. ${availabilityCheck.reason || 'Please select a different date.'}`
          );
          setSubmitStatus('error');
          setIsSubmitting(false);
          return;
        }
      }

      const bookingRequest: BookingRequest = {
        vendor_id: service.vendorId || '',
        service_id: service.id || service.vendorId || '',
        service_type: service.category as ServiceCategory,
        service_name: service.name,
        event_date: formData.eventDate,
        event_time: formData.eventTime || undefined,
        event_location: formData.eventLocation,
        guest_count: parseInt(formData.guestCount),
        budget_range: formData.budgetRange,
        special_requests: formData.specialRequests || undefined,
        contact_person: formData.contactPerson,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail || undefined,
        preferred_contact_method: formData.preferredContactMethod,
        metadata: {
          sourceModal: 'BookingRequestModal',
          submissionTimestamp: new Date().toISOString()
        }
      };

      const createdBooking = await optimizedBookingApiService.createBookingRequest(bookingRequest, user?.id);

      // Transform booking data for success modal (matches BookingSuccessModal props)
      const successData: {
        id: string | number;
        serviceName: string;
        vendorName: string;
        eventDate: string;
        eventTime?: string;
        eventLocation?: string;
      } = {
        id: createdBooking.id || createdBooking.booking_id || 'pending',
        serviceName: service.name,
        vendorName: service.vendorName || 'Wedding Vendor',
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventLocation: formData.eventLocation
      };

      // Success!
      setSuccessBookingData(successData);
      setShowSuccessModal(true);
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('bookingCreated', {
        detail: createdBooking
      }));

      if (onBookingCreated) {
        onBookingCreated(createdBooking);
      }

    } catch (error) {
      console.error('Booking submission failed:', error);
      setErrorMessage('Failed to submit booking request. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show success modal
  if (showSuccessModal && successBookingData) {
    return (
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessBookingData(null);
          onClose();
        }}
        bookingData={successBookingData}
        onViewBookings={() => {
          window.location.href = '/individual/bookings';
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Book {service.name}</h2>
              <p className="text-pink-100 text-sm">{service.vendorName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center justify-between relative">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                      currentStep >= step
                        ? "bg-white text-purple-600 shadow-lg scale-110"
                        : "bg-purple-400/50 text-white"
                    )}
                  >
                    {step}
                  </div>
                  <span className="text-xs mt-2 font-medium text-white/90">
                    {step === 1 && "Event Details"}
                    {step === 2 && "Requirements"}
                    {step === 3 && "Contact Info"}
                  </span>
                </div>
                {step < 3 && (
                  <div className="flex-1 h-1 mx-2 mb-6">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-300",
                      currentStep > step ? "bg-white" : "bg-purple-400/50"
                    )}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Error Message */}
          {submitStatus === 'error' && errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.eventDate ? "border-red-300" : "border-gray-200"
                  )}
                />
                {formErrors.eventDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.eventDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Time (Optional)
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Event Location *
                </label>
                <input
                  type="text"
                  value={formData.eventLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventLocation: e.target.value }))}
                  placeholder="e.g., Manila, Philippines"
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.eventLocation ? "border-red-300" : "border-gray-200"
                  )}
                />
                {formErrors.eventLocation && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.eventLocation}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Number of Guests *
                </label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                  placeholder="e.g., 100"
                  min="1"
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.guestCount ? "border-red-300" : "border-gray-200"
                  )}
                />
                {formErrors.guestCount && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.guestCount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Budget Range *
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.budgetRange ? "border-red-300" : "border-gray-200"
                  )}
                >
                  <option value="">Select your budget</option>
                  <option value="₱10,000-₱25,000">₱10,000 - ₱25,000</option>
                  <option value="₱25,000-₱50,000">₱25,000 - ₱50,000</option>
                  <option value="₱50,000-₱100,000">₱50,000 - ₱100,000</option>
                  <option value="₱100,000-₱200,000">₱100,000 - ₱200,000</option>
                  <option value="₱200,000+">₱200,000+</option>
                </select>
                {formErrors.budgetRange && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.budgetRange}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Special Requests (Optional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any specific requirements or questions?"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Your full name"
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.contactPerson ? "border-red-300" : "border-gray-200"
                  )}
                />
                {formErrors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.contactPerson}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+63 XXX XXX XXXX"
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.contactPhone ? "border-red-300" : "border-gray-200"
                  )}
                />
                {formErrors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.contactPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="your@email.com"
                  className={cn(
                    "w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                    formErrors.contactEmail ? "border-red-300" : "border-gray-200"
                  )}
                />
                {formErrors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="flex gap-3">
                  {(['email', 'phone', 'message'] as ContactMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredContactMethod: method }))}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize transition-all",
                        formData.preferredContactMethod === method
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                Next
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-semibold">{formProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${formProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
