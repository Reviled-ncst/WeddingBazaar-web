
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
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
import { VisualCalendar } from '../../../components/calendar/VisualCalendar';
import { LocationPicker } from '../../../shared/components/forms/LocationPicker';

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

  // Auto-computed pricing based on guest count
  const estimatedQuote = useMemo(() => {
    const guestCount = parseInt(formData.guestCount) || 0;
    if (guestCount === 0) return null;

    // Pricing calculation based on service category
    const basePrices: Record<string, number> = {
      'Photography': 15000,
      'Catering': 25000,
      'Venue': 50000,
      'Music': 12000,
      'Planning': 20000,
      'Videography': 18000,
      'Flowers': 10000,
      'Decoration': 15000,
      'default': 15000
    };

    const perGuestFees: Record<string, number> = {
      'Catering': 500,
      'Venue': 300,
      'default': 150
    };

    const category = service.category || 'default';
    const basePrice = basePrices[category] || basePrices['default'];
    const perGuestFee = perGuestFees[category] || perGuestFees['default'];

    const subtotal = basePrice + (perGuestFee * guestCount);
    const tax = subtotal * 0.12; // 12% tax
    const total = subtotal + tax;

    return {
      basePrice,
      guestFee: perGuestFee,
      totalGuests: guestCount,
      subtotal,
      tax,
      total
    };
  }, [formData.guestCount, service.category]);

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

  // Calculate form completion (5 steps now)
  const formProgress = useMemo(() => {
    const step1Complete = formData.eventDate;
    const step2Complete = formData.eventLocation;
    const step3Complete = formData.guestCount && formData.eventTime;
    const step4Complete = formData.budgetRange;
    const step5Complete = formData.contactPhone && formData.contactPerson;
    
    let completed = 0;
    if (step1Complete) completed++;
    if (step2Complete) completed++;
    if (step3Complete) completed++;
    if (step4Complete) completed++;
    if (step5Complete) completed++;
    
    return {
      completed,
      total: 5,
      percentage: Math.round((completed / 5) * 100)
    };
  }, [formData]);

  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (step === 1) {
      // Step 1: Calendar only
      if (!formData.eventDate) errors.eventDate = 'Event date is required';
    } else if (step === 2) {
      // Step 2: Location only
      if (!formData.eventLocation) errors.eventLocation = 'Location is required';
    } else if (step === 3) {
      // Step 3: Time and Guests
      if (!formData.guestCount) {
        errors.guestCount = 'Number of guests is required';
      } else {
        const count = parseInt(formData.guestCount);
        if (isNaN(count) || count < 1) {
          errors.guestCount = 'Please enter a valid number';
        }
      }
    } else if (step === 4) {
      // Step 4: Budget
      if (!formData.budgetRange) errors.budgetRange = 'Budget range is required';
    } else if (step === 5) {
      // Step 5: Contact Info
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
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

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
        guestCount?: number;
        budgetRange?: string;
        estimatedQuote?: {
          basePrice: number;
          guestFee: number;
          totalGuests: number;
          subtotal: number;
          tax: number;
          total: number;
        };
      } = {
        id: createdBooking.id || createdBooking.booking_id || 'pending',
        serviceName: service.name,
        vendorName: service.vendorName || 'Service Provider',
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventLocation: formData.eventLocation,
        guestCount: parseInt(formData.guestCount) || undefined,
        budgetRange: formData.budgetRange || undefined,
        estimatedQuote: estimatedQuote || undefined
      };

      // Success! Show inline success message first
      setSubmitStatus('success');
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('bookingCreated', {
        detail: createdBooking
      }));

      if (onBookingCreated) {
        onBookingCreated(createdBooking);
      }

      // After 2 seconds, show the full success modal
      setTimeout(() => {
        setSuccessBookingData(successData);
        setShowSuccessModal(true);
      }, 2000);

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced backdrop with blur */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-black/60 backdrop-blur-md animate-in fade-in duration-300" 
           onClick={submitStatus !== 'success' ? onClose : undefined} />
      
      {/* Modal container with better positioning */}
      <div className="min-h-screen px-4 text-center">
        {/* Vertical centering trick */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
        
        {/* Modal */}
        <div className="inline-block align-middle bg-white rounded-3xl max-w-3xl w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 text-left overflow-hidden transform transition-all">
          {/* Header with enhanced gradient */}
          <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-6 text-white overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20 animate-pulse"></div>
            
            {/* Floating orbs for depth */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse [animation-delay:500ms]"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl animate-pulse [animation-delay:1000ms]"></div>
          
          {/* Header content */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Book {service.name}</h2>
                  <p className="text-pink-100 text-sm font-medium mt-0.5">with {service.vendorName}</p>
                </div>
              </div>
            </div>
            <button
              onClick={submitStatus !== 'success' ? onClose : undefined}
              disabled={submitStatus === 'success'}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close booking modal"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Enhanced Progress Steps - 5 Steps */}
          <div className="flex items-center justify-between relative">
            {[
              { num: 1, label: "Date", icon: "📅" },
              { num: 2, label: "Location", icon: "📍" },
              { num: 3, label: "Details", icon: "👥" },
              { num: 4, label: "Budget", icon: "💰" },
              { num: 5, label: "Contact", icon: "📞" }
            ].map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center flex-1">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 transform",
                      currentStep >= stepInfo.num
                        ? "bg-white text-purple-600 shadow-2xl scale-110 ring-4 ring-white/30"
                        : "bg-white/20 backdrop-blur-sm text-white/70 scale-95",
                      currentStep === stepInfo.num && "animate-pulse"
                    )}
                  >
                    <span className="text-xl">{stepInfo.icon}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] sm:text-xs mt-2 font-semibold text-center transition-all duration-300 whitespace-nowrap",
                    currentStep >= stepInfo.num ? "text-white drop-shadow-lg" : "text-white/60"
                  )}>
                    {stepInfo.label}
                  </span>
                </div>
                {index < 4 && (
                  <div className="flex-1 h-1.5 mx-2 sm:mx-3 mb-6 sm:mb-8 rounded-full overflow-hidden bg-white/20">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      currentStep > stepInfo.num ? "bg-white shadow-lg w-full" : "bg-transparent w-0"
                    )}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(92vh-220px)]">
          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl flex items-start gap-4 animate-in zoom-in-95 duration-300 shadow-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-green-800 mb-1">🎉 Booking Request Submitted!</p>
                <p className="text-sm text-green-700">
                  Your booking request has been sent successfully. The service provider will review and respond soon!
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting to confirmation...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Step 1: Select Date (Calendar Only) */}
          {submitStatus !== 'success' && currentStep === 1 && (
            <div className="space-y-3 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 mb-1">📅 When is your event?</h3>
                <p className="text-sm text-gray-600">Select an available date from the calendar</p>
              </div>
              
              {/* Visual Calendar with Availability - Compact */}
              <VisualCalendar
                vendorId={service.vendorId || ''}
                selectedDate={formData.eventDate}
                onDateSelect={(date) => {
                  setFormData(prev => ({ ...prev, eventDate: date }));
                  // Clear date error when valid date is selected
                  if (formErrors.eventDate) {
                    setFormErrors(prev => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { eventDate, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                minDate={new Date().toISOString().split('T')[0]}
                className="shadow-none border-0"
              />
              {formErrors.eventDate && (
                <p className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.eventDate}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Select Location (Map Only) */}
          {submitStatus !== 'success' && currentStep === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">📍 Where will it be?</h3>
                <p className="text-gray-600">Search or click on the map to select your event location</p>
              </div>

              {/* Interactive Map Location Picker */}
              <div className="bg-white rounded-xl border-2 border-purple-100 shadow-lg overflow-hidden">
                <div className="p-4">
                  <LocationPicker
                    value={formData.eventLocation}
                    onChange={(location) => {
                      setFormData(prev => ({ ...prev, eventLocation: location }));
                      // Clear location error when valid location is selected
                      if (formErrors.eventLocation) {
                        setFormErrors(prev => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { eventLocation, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    placeholder="Search for venue or city (e.g., Manila, Philippines)"
                    className="w-full"
                  />
                </div>
                {formErrors.eventLocation && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{formErrors.eventLocation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Event Details (Time & Guests) */}
          {submitStatus !== 'success' && currentStep === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">⏰ Event Details</h3>
                <p className="text-gray-600">Tell us more about your event</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Event Time (Optional)
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  aria-label="Event time"
                  title="Select event time"
                />
              </div>

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

                {/* Live Quote Preview */}
                {estimatedQuote && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-900">Estimated Total:</span>
                      </div>
                      <span className="text-xl font-bold text-green-900">
                        ₱{estimatedQuote.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Based on {estimatedQuote.totalGuests} guests. Full breakdown shown after submission.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Budget & Special Requests */}
          {submitStatus !== 'success' && currentStep === 4 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">💰 Budget & Requirements</h3>
                <p className="text-gray-600">Help us understand your needs</p>
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
                  aria-label="Budget range"
                  title="Select your budget range"
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
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">Tell us about any specific needs, preferences, or questions you have</p>
              </div>
            </div>
          )}

          {/* Step 5: Contact Info */}
          {submitStatus !== 'success' && currentStep === 5 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">📞 Contact Information</h3>
                <p className="text-gray-600">How can we reach you?</p>
              </div>

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
          {submitStatus !== 'success' && (
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

            {currentStep < 5 ? (
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
          )}

          {/* Progress Indicator */}
          {submitStatus !== 'success' && (
            <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span className="font-semibold">{formProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${formProgress.percentage}%` } as React.CSSProperties}
              ></div>
            </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
