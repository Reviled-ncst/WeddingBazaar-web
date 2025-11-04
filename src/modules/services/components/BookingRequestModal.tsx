import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { flushSync } from 'react-dom';
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
import { SuccessBanner } from './SuccessBanner';
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
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
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
      setFormData(prev => ({
        ...prev,
        contactName: user.full_name || user.email.split('@')[0],
        contactPhone: user.phone || '',
        contactEmail: user.email
      }));
    }
  }, [isOpen, user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Calculate form completion (6 steps now - added review step)
  const formProgress = useMemo(() => {
    // Step completion based on REQUIRED fields only
    const step1Complete = !!formData.eventDate;
    const step2Complete = !!formData.eventLocation;
    const step3Complete = !!formData.guestCount; // Only guests required (time is optional)
    const step4Complete = !!formData.budgetRange;
    const step5Complete = !!formData.contactPhone && !!formData.contactPerson;
    
    let completed = 0;
    if (step1Complete) completed++;
    if (step2Complete) completed++;
    if (step3Complete) completed++;
    if (step4Complete) completed++;
    if (step5Complete) completed++;
    
    // Step 6 is review (doesn't count toward data completion)
    return {
      completed,
      total: 5,
      percentage: Math.min(100, Math.round((completed / 5) * 100)) // Cap at 100%
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
      setCurrentStep(prev => Math.min(prev + 1, 6));
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

      // Success! Show success modal using flushSync for immediate rendering
      flushSync(() => {
        setSuccessBookingData(successData);
        setShowSuccessModal(true);
        setShowSuccessBanner(true);
        setSubmitStatus('success');
      });
      
      // MULTI-LAYERED NOTIFICATION SYSTEM
      // 1. Browser notification (if permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('✅ Booking Request Sent!', {
          body: `Your booking request for ${service.name} on ${formData.eventDate} has been submitted successfully.`,
          icon: '/favicon.ico',
          tag: 'booking-success',
          requireInteraction: true
        });
      }
      
      // 2. Toast notification (always visible, top-right)
      const toastContainer = document.createElement('div');
      toastContainer.className = 'fixed top-4 right-4 z-[10000] animate-in slide-in-from-top-5 duration-500';
      toastContainer.innerHTML = `
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="font-bold text-lg">Booking Request Sent! ✅</p>
              <p class="text-sm text-green-50 mt-1">Your request for <strong>${service.name}</strong> on <strong>${formData.eventDate}</strong> has been submitted.</p>
              <p class="text-xs text-green-100 mt-2">Check your email and bookings page for updates.</p>
            </div>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" class="ml-auto flex-shrink-0 text-white hover:text-green-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(toastContainer);
      
      // Auto-remove toast after 10 seconds
      setTimeout(() => {
        if (toastContainer.parentNode) {
          toastContainer.style.animation = 'fade-out 500ms ease-out';
          setTimeout(() => toastContainer.remove(), 500);
        }
      }, 10000);
      
      // 3. Console log with styled output
      console.log(
        '%c✅ BOOKING SUCCESS!',
        'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 8px; font-size: 16px; font-weight: bold;',
        '\n📅 Service:', service.name,
        '\n📆 Date:', formData.eventDate,
        '\n🏢 Vendor:', service.vendorName || 'Service Provider',
        '\n📍 Location:', formData.eventLocation,
        '\n👥 Guests:', formData.guestCount || 'Not specified',
        '\n💰 Budget:', formData.budgetRange || 'To be discussed',
        '\n🆔 Booking ID:', successData.id
      );
      
      // 4. Dispatch event
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

  return (
    <>
    {/* Booking Modal - Hide when success modal is active */}
    {!showSuccessModal && (
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

          {/* Enhanced Progress Steps - 6 Steps (Added Review) */}
          <div className="flex items-center justify-between relative">
            {[
              { num: 1, label: "Date", icon: "📅" },
              { num: 2, label: "Location", icon: "📍" },
              { num: 3, label: "Details", icon: "👥" },
              { num: 4, label: "Budget", icon: "💰" },
              { num: 5, label: "Contact", icon: "📞" },
              { num: 6, label: "Review", icon: "✅" }
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
                {index < 5 && (
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

          {/* Step 6: Review & Confirm */}
          {submitStatus !== 'success' && currentStep === 6 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">✅ Review Your Booking</h3>
                <p className="text-gray-600">Please confirm all details before submitting</p>
              </div>

              {/* Review Cards */}
              <div className="space-y-3">
                {/* Event Details Card */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Event Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-900">{new Date(formData.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {formData.eventTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-900">{formData.eventTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold text-gray-900">{formData.eventLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-semibold text-gray-900">{formData.guestCount} people</span>
                    </div>
                  </div>
                </div>

                {/* Budget & Requirements Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget & Requirements
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget Range:</span>
                      <span className="font-semibold text-gray-900">{formData.budgetRange}</span>
                    </div>
                    {estimatedQuote && (
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="text-gray-600">Estimated Quote:</span>
                        <span className="font-bold text-green-700">₱{estimatedQuote.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {formData.specialRequests && (
                      <div className="pt-2 border-t border-green-200">
                        <span className="text-gray-600 block mb-1">Special Requests:</span>
                        <p className="text-gray-900 text-xs bg-white/50 p-2 rounded">{formData.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{formData.contactPerson}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-900">{formData.contactPhone}</span>
                    </div>
                    {formData.contactEmail && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold text-gray-900">{formData.contactEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Contact:</span>
                      <span className="font-semibold text-gray-900 capitalize">{formData.preferredContactMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Notice */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">Please Review Carefully</p>
                    <p className="text-xs text-yellow-700">
                      By clicking "Confirm & Submit", you agree to send this booking request to the vendor. 
                      The vendor will review your request and get back to you shortly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review & Confirm */}
          {submitStatus !== 'success' && currentStep === 6 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">✅ Review Your Booking</h3>
                <p className="text-gray-600">Please review all details before submitting</p>
              </div>

              {/* Event Details Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-gray-800">Event Details</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Service</p>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Vendor</p>
                    <p className="font-semibold text-gray-900">{service.vendorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">{new Date(formData.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  {formData.eventTime && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Time</p>
                      <p className="font-semibold text-gray-900">{formData.eventTime}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{formData.eventLocation}</p>
                  </div>
                </div>
              </div>

              {/* Guest & Budget Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-gray-800">Guest & Budget</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Number of Guests</p>
                    <p className="font-semibold text-gray-900">{formData.guestCount} guests</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Budget Range</p>
                    <p className="font-semibold text-gray-900">{formData.budgetRange}</p>
                  </div>
                  {estimatedQuote && (
                    <div className="col-span-2 bg-white/50 rounded-lg p-3 border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Estimated Total</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₱{estimatedQuote.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Based on {estimatedQuote.totalGuests} guests (inclusive of tax)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-gray-800">Contact Information</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{formData.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{formData.contactPhone}</p>
                  </div>
                  {formData.contactEmail && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{formData.contactEmail}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Preferred Contact</p>
                    <p className="font-semibold text-gray-900 capitalize">{formData.preferredContactMethod}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests (if provided) */}
              {formData.specialRequests && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border-2 border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-gray-800">Special Requests</h4>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.specialRequests}</p>
                </div>
              )}

              {/* Confirmation Notice */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300 mt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-purple-900 mb-1">Ready to submit?</p>
                    <p className="text-xs text-purple-800">
                      By clicking "Confirm & Submit", you agree to send this booking request to {service.vendorName}. 
                      The vendor will review your request and send you a detailed quote.
                    </p>
                  </div>
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

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 group"
              >
                {currentStep === 5 ? 'Review Booking' : 'Next'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Confirm & Submit Request
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
    )}
    
    {/* Render success modal using Portal at body level */}
    {showSuccessModal && successBookingData && createPortal(
      <BookingSuccessModal
        isOpen={true}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessBookingData(null);
          setShowSuccessBanner(false);
          onClose();
        }}
        bookingData={successBookingData}
        onViewBookings={() => {
          window.location.href = '/individual/bookings';
        }}
      />,
      document.body
    )}
    
    {/* Success Banner - Top of page, always visible */}
    {showSuccessBanner && successBookingData && (
      <SuccessBanner
        message="Booking Request Sent Successfully!"
        details={{
          serviceName: successBookingData.serviceName,
          eventDate: successBookingData.eventDate,
          vendorName: successBookingData.vendorName,
          bookingId: String(successBookingData.id)
        }}
        onClose={() => setShowSuccessBanner(false)}
      />
    )}
    </>
  );
};
