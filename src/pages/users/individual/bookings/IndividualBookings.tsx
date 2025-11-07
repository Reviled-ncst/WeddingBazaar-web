import React, { useState, useEffect, useCallback } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Heart,
  Star,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  DollarSign,
  Filter,
  Search,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Package,
  FileText,
  Eye,
  CheckCircle
} from 'lucide-react';

// Import modular components
import {
  BookingDetailsModal,
  QuoteDetailsModal,
  QuoteConfirmationModal,
  ReceiptModal,
  RatingModal,
  CustomDepositModal,
  ReportIssueModal
} from './components';

// Import payment components
import { PayMongoPaymentModal } from '../../../../shared/components/PayMongoPaymentModal';

// Import auth context to get the real user ID
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';

// Import booking API service
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';

// Import unified mapping utilities
import { mapToEnhancedBooking } from '../../../../shared/utils/booking-data-mapping';

// Import custom hooks
import { useBookingPreferences } from './hooks';

// Import booking completion service (two-sided completion system)
import { 
  markBookingComplete,
  getCompletionStatus,
  canMarkComplete,
  getCompletionButtonText,
  getCompletionButtonVariant,
  type CompletionStatus
} from '../../../../shared/services/completionService';

// Import booking actions service
import { 
  getBookingReceipts, 
  cancelBooking, 
  requestCancellation, 
  formatReceipt,
  type Receipt 
} from '../../../../shared/services/bookingActionsService';

// Import review service for modular review functionality
import { reviewService } from '../../../../shared/services/reviewService';

// Import booking reports service
import { bookingReportsService } from '../../../../shared/services/bookingReportsService';
import type { ReportType } from '../../../../shared/types/booking-reports.types';

import type { 
  Booking
} from './types/booking.types';
import type { BookingStatus } from '../../../../shared/types/comprehensive-booking.types';
import type { PaymentType } from '../payment/types/payment.types';

// Enhanced booking interface for our new design
interface EnhancedBooking {
  id: string;
  serviceName: string;
  serviceType: string;
  vendorName?: string;
  vendorBusinessName?: string;
  vendorRating?: number;
  vendorPhone?: string | null;
  vendorEmail?: string | null;
  coupleName?: string | null;
  clientName?: string | null;
  eventDate: string;
  formattedEventDate?: string;
  eventLocation: string;
  status: string;
  totalAmount?: number;
  downpaymentAmount?: number;
  remainingBalance?: number;
  bookingReference?: string;
  createdAt: string;
  updatedAt?: string;
  paymentProgress?: number;
  daysUntilEvent?: number;
  specialRequests?: string;
  notes?: string;
  serviceItems?: Array<{
    id: string | number;
    name: string;
    description?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export const IndividualBookings: React.FC = () => {
  
  // User preferences from localStorage
  const { 
    filterStatus,
    setFilterStatus,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder
  } = useBookingPreferences();
  
  // Auth context to get user information
  const { user } = useAuth();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State management
  const [bookings, setBookings] = useState<EnhancedBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Quote confirmation modal state
  const [quoteConfirmation, setQuoteConfirmation] = useState<{
    isOpen: boolean;
    booking: EnhancedBooking | null;
    type: 'accept' | 'reject' | 'modify';
  }>({
    isOpen: false,
    booking: null,
    type: 'accept'
  });
  
  // Success/Error modal states
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<EnhancedBooking | null>(null);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingBooking, setRatingBooking] = useState<EnhancedBooking | null>(null);
  
  // Track which bookings have been reviewed (to hide "Rate & Review" button)
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  
  // Report Issue modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportBooking, setReportBooking] = useState<EnhancedBooking | null>(null);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger' | 'complete';
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    showInput?: boolean;
    inputPlaceholder?: string;
    inputValue?: string;
    bookingData?: EnhancedBooking; // For enhanced completion modal
    completionStatus?: CompletionStatus | null; // For completion progress
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });
  
  // Payment modal state (updated for PayMongo)
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null as Booking | null,
    paymentType: 'downpayment' as PaymentType,
    loading: false
  });

  // Custom deposit modal state
  const [customDepositModal, setCustomDepositModal] = useState({
    isOpen: false,
    booking: null as Booking | null,
    totalAmount: 0
  });

  // Helper functions for UI
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
      'quote_requested': { 
        label: 'Awaiting Quote', 
        icon: <Clock className="w-4 h-4" />, 
        className: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
      'request': { 
        label: 'Awaiting Quote', 
        icon: <Clock className="w-4 h-4" />, 
        className: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
      'quote_sent': { 
        label: 'Quote Received', 
        icon: <FileText className="w-4 h-4" />, 
        className: 'bg-purple-100 text-purple-700 border-purple-200' 
      },
      'quote_accepted': { 
        label: 'Quote Accepted', 
        icon: <CheckCircle2 className="w-4 h-4" />, 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      'approved': { 
        label: 'Confirmed', 
        icon: <CheckCircle2 className="w-4 h-4" />, 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      'confirmed': { 
        label: 'Confirmed', 
        icon: <CheckCircle2 className="w-4 h-4" />, 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      'downpayment_paid': { 
        label: 'Deposit Paid', 
        icon: <CreditCard className="w-4 h-4" />, 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
      },
      'deposit_paid': { 
        label: 'Deposit Paid', 
        icon: <CreditCard className="w-4 h-4" />, 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
      },
      'downpayment': { 
        label: 'Deposit Paid', 
        icon: <CreditCard className="w-4 h-4" />, 
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
      },
      'paid_in_full': { 
        label: 'Fully Paid', 
        icon: <Sparkles className="w-4 h-4" />, 
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
      },
      'fully_paid': { 
        label: 'Fully Paid', 
        icon: <Sparkles className="w-4 h-4" />, 
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200' 
      },
      'completed': { 
        label: 'Completed', 
        icon: <Heart className="w-4 h-4" />, 
        className: 'bg-pink-100 text-pink-700 border-pink-200' 
      },
      'cancelled': { 
        label: 'Cancelled', 
        icon: <XCircle className="w-4 h-4" />, 
        className: 'bg-red-100 text-red-700 border-red-200' 
      },
      'quote_rejected': { 
        label: 'Quote Declined', 
        icon: <XCircle className="w-4 h-4" />, 
        className: 'bg-gray-100 text-gray-700 border-gray-200' 
      }
    };
    return statusMap[status] || statusMap['quote_requested'];
  };

  const getServiceIcon = (serviceType: string) => {
    const iconMap: Record<string, string> = {
      'photography': '📸',
      'catering': '🍽️',
      'planning': '📋',
      'Wedding Planning': '📋',
      'florals': '🌸',
      'venue': '🏛️',
      'music_dj': '🎵',
      'DJ & Music': '🎵',
      'videography': '🎥',
      'decoration': '🎨',
      'Decoration': '🎨',
      'transportation': '🚗',
      'entertainment': '🎭',
      'Event Services': '🎯',
      'Beauty Services': '💄'
    };
    return iconMap[serviceType] || '💍';
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH')}`;
  };

  const getDaysUntilEvent = (eventDate: string) => {
    const event = new Date(eventDate);
    const today = new Date();
    const diff = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUrgencyClass = (days: number) => {
    if (days < 0) return 'text-gray-500';
    if (days <= 7) return 'text-red-600 font-bold animate-pulse';
    if (days <= 30) return 'text-orange-600 font-semibold';
    if (days <= 90) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Check which bookings have been reviewed
  const checkReviewedBookings = useCallback(async (bookingIds: string[]) => {
    const reviewed = new Set<string>();
    
    // Check each completed booking to see if it has been reviewed
    for (const bookingId of bookingIds) {
      try {
        const hasReview = await reviewService.hasBookingBeenReviewed(bookingId);
        if (hasReview) {
          reviewed.add(bookingId);
        }
      } catch (error) {
        console.error('❌ [CheckReviews] Error checking review for booking:', bookingId, error);
      }
    }
    setReviewedBookings(reviewed);
  }, []);

  // Load bookings function
  const loadBookings = useCallback(async () => {
    
    // TEMPORARY: Use fallback user ID for testing if not logged in
    let effectiveUserId = user?.id;
    if (!effectiveUserId) {
      effectiveUserId = '1-2025-001'; // User with 2 bookings for testing
    }
    try {
      setLoading(true);
      setError(null);

      // Call the booking API service with current sort preferences
      const response = await bookingApiService.getCoupleBookings(effectiveUserId, {
        page: 1,
        limit: 50,
        sortBy,
        sortOrder
      });
      if (response.bookings && response.bookings.length > 0) {
        // Map backend response to enhanced bookings using unified mapping utility
        const enhancedBookings: EnhancedBooking[] = response.bookings.map((booking: any) => 
          mapToEnhancedBooking(booking)
        );

        setBookings(enhancedBookings);
        // Check which completed bookings have been reviewed
        const completedBookingIds = enhancedBookings
          .filter(b => b.status === 'completed')
          .map(b => b.id);
        
        if (completedBookingIds.length > 0) {
          checkReviewedBookings(completedBookingIds);
        }
      } else {
        setBookings([]);
      }
    } catch (error) {
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, sortBy, sortOrder]);

  // Load bookings on component mount and when user changes
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Listen for booking creation events from BookingRequestModal
  useEffect(() => {
    const handleBookingCreated = (event: CustomEvent) => {
      // Add a small delay to ensure backend has processed the booking
      setTimeout(() => {
        loadBookings();
      }, 500);
    };
    // Add event listener
    window.addEventListener('bookingCreated', handleBookingCreated as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated as EventListener);
    };
  }, [loadBookings]);

  const handlePayment = (booking: Booking | EnhancedBooking, paymentType: PaymentType) => {
    // For deposit/downpayment, show custom deposit modal first
    if (paymentType === 'downpayment') {
      setCustomDepositModal({
        isOpen: true,
        booking: booking as any,
        totalAmount: booking.totalAmount || 0
      });
    } else {
      // For full payment or remaining balance, go directly to payment modal
      setPaymentModal({
        isOpen: true,
        booking: booking as any,
        paymentType,
        loading: false
      });
    }
  };

  // Handle custom deposit confirmation
  const handleCustomDepositConfirm = (depositAmount: number, percentage: number) => {
    const booking = customDepositModal.booking;
    if (!booking) return;

    // Close custom deposit modal
    setCustomDepositModal({ isOpen: false, booking: null, totalAmount: 0 });

    // Open PayMongo payment modal with custom amount
    setPaymentModal({
      isOpen: true,
      booking: {
        ...booking,
        // Store custom deposit amount temporarily for the payment modal
        customDepositAmount: depositAmount,
        customDepositPercentage: percentage
      } as any,
      paymentType: 'downpayment',
      loading: false
    });
  };

  // Handle viewing receipts
  const handleViewReceipt = async (booking: EnhancedBooking) => {
    setReceiptBooking(booking);
    setShowReceiptModal(true);
  };

  // Handle booking cancellation
  const handleCancelBooking = async (booking: EnhancedBooking) => {
    if (!user?.id) {
      setConfirmationModal({
        isOpen: true,
        title: 'Login Required',
        message: 'You must be logged in to cancel a booking.',
        type: 'warning',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        cancelText: ''
      });
      return;
    }

    // Determine if this is a direct cancel or requires approval
    const isDirectCancel = booking.status === 'request' || booking.status === 'quote_requested';
    
    const confirmMessage = isDirectCancel
      ? `Are you sure you want to cancel this booking with ${booking.vendorName || 'the vendor'}?\n\nThis action cannot be undone.`
      : `Request cancellation for this booking with ${booking.vendorName || 'the vendor'}?\n\nThis will require vendor or admin approval.\n\nNote: Refunds (if applicable) will be processed according to the vendor's cancellation policy.`;
    
    // Show confirmation modal with optional reason input
    setConfirmationModal({
      isOpen: true,
      title: isDirectCancel ? '🚫 Cancel Booking' : '📝 Request Cancellation',
      message: confirmMessage,
      type: 'danger',
      showInput: true,
      inputPlaceholder: 'Optional: Reason for cancellation...',
      inputValue: '',
      onConfirm: async () => {
        const reason = confirmationModal.inputValue;
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        
        try {
          setLoading(true);
          
          if (isDirectCancel) {
            const result = await cancelBooking(booking.id, {
              userId: user.id,
              reason: reason || undefined
            });
            
            setSuccessMessage(result.message);
            setShowSuccessModal(true);
            await loadBookings();
          } else {
            const result = await requestCancellation(booking.id, {
              userId: user.id,
              reason: reason || undefined
            });
            
            setSuccessMessage(result.message);
            setShowSuccessModal(true);
            await loadBookings();
          }
        } catch (error) {
          setErrorMessage(`Failed to cancel booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      },
      confirmText: isDirectCancel ? 'Yes, Cancel Booking' : 'Submit Cancellation Request',
      cancelText: 'Keep Booking'
    });
  };

  // Handle opening rating modal for completed bookings
  const handleRateBooking = (booking: EnhancedBooking) => {
    setRatingBooking(booking);
    setShowRatingModal(true);
  };

  // Handle opening report issue modal
  const handleReportIssue = (booking: EnhancedBooking) => {
    setReportBooking(booking);
    setShowReportModal(true);
  };

  // Handle report submission
  const handleSubmitReport = async (reportData: {
    reportType: ReportType;
    subject: string;
    description: string;
  }) => {
    if (!reportBooking || !user?.id) return;

    try {
      await bookingReportsService.submitReport({
        booking_id: reportBooking.id,
        reported_by: user.id,
        reporter_type: 'couple',
        report_type: reportData.reportType,
        subject: reportData.subject,
        description: reportData.description,
        evidence_urls: [] // Can be added later for file uploads
      });

      // Show success message
      setSuccessMessage(
        `Report submitted successfully! Our admin team will review your issue and respond within 1-2 business days. ` +
        `You'll receive updates via email at ${user.email || 'your registered email'}.`
      );
      setShowSuccessModal(true);

      // Close report modal
      setShowReportModal(false);
      setReportBooking(null);
    } catch (error) {
      console.error('❌ [SubmitReport] Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit report. Please try again.');
      setShowErrorModal(true);
    }
  };

  // Handle review submission - modular function (matching RatingModal interface)
  const handleSubmitReview = async (reviewData: {
    bookingId: string;
    rating: number;
    comment: string;
    images?: string[];
  }) => {
    if (!ratingBooking) return;

    try {
      // Note: Images are already Cloudinary URLs from RatingModal
      const reviewPayload = {
        bookingId: reviewData.bookingId,
        vendorId: (ratingBooking as any).vendorId || '',
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || []
      };

      const response = await reviewService.submitReview(reviewPayload);

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit review');
      }

      // Show success message
      setSuccessMessage(`Thank you for your ${reviewData.rating}-star review! Your feedback helps other couples make informed decisions.`);
      setShowSuccessModal(true);

      // Reload bookings to update status
      await loadBookings();
      
    } catch (error: any) {
      console.error('❌ [SubmitReview] Error:', error);
      setErrorMessage(error.message || 'Failed to submit review. Please try again.');
      setShowErrorModal(true);
    }
  };

  // Handle booking completion (couple side)
  const handleMarkComplete = async (booking: EnhancedBooking) => {
    if (!user?.id) {
      setConfirmationModal({
        isOpen: true,
        title: 'Login Required',
        message: 'You must be logged in to mark a booking as complete.',
        type: 'warning',
        onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        cancelText: ''
      });
      return;
    }

    // Get current completion status
    const completionStatus = await getCompletionStatus(booking.id);
    // CRITICAL: Check if booking is already fully completed
    if (completionStatus?.fullyCompleted || completionStatus?.currentStatus === 'completed') {
      // Show success message - booking is already done!
      setSuccessMessage(
        'This booking is already marked as complete by both you and the vendor. ' +
        'Refreshing your booking list to show the correct status...'
      );
      setShowSuccessModal(true);
      
      // Reload bookings to sync the status
      await loadBookings();
      return;
    }

    // Check if can mark complete
    const canComplete = canMarkComplete(booking, 'couple', completionStatus || undefined);
    if (!canComplete) {
      console.error('❌ [handleMarkComplete] Cannot mark complete. Booking status:', booking.status, 'Completion status:', completionStatus);
      
      // Check if couple already marked complete
      if (completionStatus?.coupleCompleted) {
        setSuccessMessage(
          'You have already confirmed completion for this booking. ' +
          'Waiting for the vendor to confirm. Refreshing your booking list...'
        );
        setShowSuccessModal(true);
        await loadBookings();
      } else {
        setErrorMessage('This booking cannot be marked as complete yet. It must be fully paid first.');
        setShowErrorModal(true);
      }
      return;
    }

    const confirmMessage = completionStatus?.vendorCompleted
      ? `The vendor has already confirmed completion.\n\nBy confirming, you agree that the service was delivered satisfactorily and the booking will be FULLY COMPLETED.`
      : `Mark this booking with ${booking.vendorName || 'the vendor'} as complete?\n\nNote: The booking will only be fully completed when both you and the vendor confirm completion.`;

    // Show ENHANCED confirmation modal with booking data
    setConfirmationModal({
      isOpen: true,
      title: '✅ Complete Booking',
      message: confirmMessage,
      type: 'complete', // New type for completion modal
      bookingData: booking, // Pass booking data for enhanced UI
      completionStatus: completionStatus, // Pass completion status
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        
        try {
          setLoading(true);
          
          const result = await markBookingComplete(booking.id, 'couple');
          
          if (result.success) {
            setSuccessMessage(result.message);
            setShowSuccessModal(true);
            await loadBookings();
          } else {
            setErrorMessage(result.error || 'Failed to mark booking as complete');
            setShowErrorModal(true);
          }
        } catch (error: any) {
          console.error('❌ [MarkComplete] Error:', error);
          setErrorMessage(error.message || 'Failed to mark booking as complete');
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      },
      confirmText: completionStatus?.vendorCompleted ? 'Yes, Confirm Completion' : 'Mark as Complete',
      cancelText: 'Not Yet'
    });
  };

  // Enhanced PayMongo payment success handler with proper status updates and comprehensive debugging
  const handlePayMongoPaymentSuccess = useCallback(async (paymentData: any) => {
    // Enhanced debugging of payment modal state
    // Store references locally to prevent race conditions
    const booking = paymentModal.booking;
    const paymentType = paymentModal.paymentType;

    if (!booking || !booking.id) {
      console.error('❌ [PAYMENT ERROR] No booking found in payment modal state');
      return;
    }

    // Extract amount from different possible payment data formats
    const amount = paymentData.amount || 
                   paymentData.original_amount || 
                   paymentData.payment?.amount ||
                   paymentData.formattedAmount ||
                   0;
    try {
      // Get current booking data from state
      const currentBooking = bookings.find(b => b.id === booking.id);
      const currentTotalPaid = (currentBooking as any)?.totalPaid || 0;
      const totalAmount = currentBooking?.totalAmount || booking.totalAmount || 0;
      // Determine new booking status based on payment type
      let newStatus: BookingStatus;
      let paymentProgressPercentage: number;
      let totalPaid: number;
      let remainingBalance: number;

      switch (paymentType) {
        case 'downpayment':
          newStatus = 'downpayment_paid';
          paymentProgressPercentage = 30;
          totalPaid = currentTotalPaid + amount;
          remainingBalance = totalAmount - totalPaid;
          break;

        case 'full_payment':
          newStatus = 'paid_in_full';
          paymentProgressPercentage = 100;
          totalPaid = totalAmount;
          remainingBalance = 0;
          break;

        case 'remaining_balance':
          newStatus = 'paid_in_full';
          paymentProgressPercentage = 100;
          totalPaid = totalAmount;
          remainingBalance = 0;
          break;

        default:
          newStatus = 'downpayment_paid';
          paymentProgressPercentage = 30;
          totalPaid = currentTotalPaid + amount;
          remainingBalance = totalAmount - totalPaid;
      }

      // Update booking status optimistically in the UI
      const updatedBooking = {
        status: newStatus,
        paymentProgressPercentage,
        totalPaid,
        remainingBalance,
        lastPaymentDate: new Date().toISOString(),
        paymentMethod: paymentData.method || paymentType,
        transactionId: paymentData.transactionId,
        paymentStatus: 'completed'
      };
      // Update local React state optimistically (backend update happens later)
      setBookings(prev => {
        const bookingToUpdate = prev.find(b => b.id === booking.id);
        const updated = prev.map(currentBooking => {
          if (currentBooking.id === booking.id) {
            const result = {
              ...currentBooking,
              ...updatedBooking
            };
            return result;
          }
          return currentBooking;
        });
        return updated;
      });

      // Show success message based on payment type
      const successMessages = {
        downpayment: 'Deposit payment successful! Your booking is now confirmed.',
        full_payment: 'Full payment completed! Your booking is fully paid.',
        remaining_balance: 'Balance payment successful! Your booking is now fully paid.'
      };

      const successMessage = successMessages[paymentType] || 'Payment completed successfully!';
      // Show enhanced payment success notification with detailed information
      const notification = document.createElement('div');
      notification.className = 'fixed top-24 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] transform transition-all duration-300 max-w-md';
      notification.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="text-3xl flex-shrink-0">🎉</div>
          <div class="flex-1">
            <div class="font-bold text-lg mb-1">Payment Successful!</div>
            <div class="text-sm opacity-95 mb-3">${successMessage}</div>
            
            <div class="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div class="font-semibold">💰 Amount Paid</div>
                  <div>₱${amount.toLocaleString()}</div>
                </div>
                <div>
                  <div class="font-semibold">📊 Progress</div>
                  <div>${paymentProgressPercentage}% Complete</div>
                </div>
                <div>
                  <div class="font-semibold">💳 Total Paid</div>
                  <div>₱${totalPaid.toLocaleString()}</div>
                </div>
                <div>
                  <div class="font-semibold">⏳ Remaining</div>
                  <div>₱${remainingBalance.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div class="text-xs bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-80 rounded p-2">
              <div class="font-semibold">📋 Booking Status: ${newStatus.replace('_', ' ').toUpperCase()}</div>
              <div class="opacity-95">
                ID: ${booking.id} • Service: ${(booking as any).serviceType || 'Wedding Service'}
                ${remainingBalance > 0 ? `<br>💡 Next: Pay remaining ₱${remainingBalance.toLocaleString()} before event` : '<br>✅ Booking fully paid - you\'re all set!'}
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 6000);

      // Update booking status in backend database
      try {
        const backendUrl = 'https://weddingbazaar-web.onrender.com/api/bookings';
        const updateStatusUrl = `${backendUrl}/${booking.id}/status`;
        
        // Prepare backend status mapping
        let backendStatus = newStatus;
        let statusNote = '';
        
        if (newStatus === 'downpayment_paid') {
          backendStatus = 'deposit_paid';
          statusNote = `DEPOSIT_PAID: ₱${amount.toLocaleString()} paid via ${paymentData.method || 'card'} (Transaction ID: ${paymentData.transactionId})`;
        } else if (newStatus === 'paid_in_full') {
          backendStatus = 'fully_paid';
          statusNote = `FULLY_PAID: ₱${amount.toLocaleString()} paid via ${paymentData.method || 'card'} (Transaction ID: ${paymentData.transactionId})`;
        }
        
        // Prepare complete payment update data
        const updatePayload = {
          status: backendStatus,
          vendor_notes: statusNote,
          // CRITICAL: Include payment amounts to persist in database
          total_paid: totalPaid, // FIXED: Always send total_paid
          downpayment_amount: paymentType === 'downpayment' ? amount : (currentBooking?.downpaymentAmount || 0),
          remaining_balance: remainingBalance,
          payment_progress: paymentProgressPercentage,
          payment_amount: amount, // Include the actual payment amount
          last_payment_date: new Date().toISOString(),
          payment_method: paymentData.method || 'card',
          transaction_id: paymentData.transactionId,
          payment_type: paymentType // Include payment type for backend logging
        };
        const updateResponse = await fetch(updateStatusUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        });
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          // Reload bookings from backend to get fresh data
          setTimeout(() => {
            loadBookings();
          }, 500); // Small delay to ensure backend has committed the changes
        } else {
          const errorData = await updateResponse.json();
          // Don't throw - UI update already succeeded
        }
      } catch (backendError) {
        console.error('❌ [BACKEND UPDATE] Error updating booking in backend:', backendError);
        // Don't throw - UI update already succeeded
      }

      // For test bookings, we might want to persist this to localStorage or backend
      if (booking.id.startsWith('test-')) {
        // Could add localStorage persistence here if needed
      }

      // Close modal with a small delay to ensure state update completes
      setTimeout(() => {
        setPaymentModal({ 
          isOpen: false, 
          booking: null, 
          paymentType: 'downpayment', 
          loading: false 
        });
      }, 1000); // Increased delay to ensure user sees the success state
    } catch (error) {
      console.error('❌ [PAYMENT ERROR] Error updating booking status:', error);
      console.error('❌ [PAYMENT ERROR] Stack trace:', error);
      
      // Show error notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      errorNotification.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-2xl">❌</div>
          <div>
            <div class="font-semibold">Payment Processing Error</div>
            <div class="text-sm opacity-90">Payment may have succeeded but status update failed</div>
          </div>
        </div>
      `;
      document.body.appendChild(errorNotification);

      setTimeout(() => {
        errorNotification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(errorNotification), 300);
      }, 5000);
      
      // Still close modal to prevent stuck state
      setPaymentModal({ 
        isOpen: false, 
        booking: null, 
        paymentType: 'downpayment', 
        loading: false 
      });
    }
  }, [paymentModal.paymentType, paymentModal.booking, bookings]);

  // Handle viewing quote details
  const handleViewQuoteDetails = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setShowQuoteDetails(true);
  };

  // Open confirmation modal for quote acceptance
  const handleAcceptQuotation = async (booking: EnhancedBooking) => {
    setQuoteConfirmation({
      isOpen: true,
      booking: booking,
      type: 'accept'
    });
  };

  // Perform actual quote acceptance after confirmation
  // Perform actual quote acceptance after confirmation
  const confirmAcceptQuotation = async () => {
    const booking = quoteConfirmation.booking;
    if (!booking) return;
    
    try {
      setLoading(true);
      setQuoteConfirmation({ isOpen: false, booking: null, type: 'accept' });
      
      // Call backend API to accept the quotation
      const url = `https://weddingbazaar-web.onrender.com/api/bookings/${booking.id}/accept-quote`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          notes: 'Quotation accepted by couple'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to accept quotation: ${response.status} ${response.statusText}`);
      }

      await response.json();
      
      // Refresh bookings to show updated status
      await loadBookings();
      
      // Show success message with custom modal
      setSuccessMessage('Quotation accepted successfully! You can now proceed with payment.');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to accept quotation. Please try again.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        booking.serviceName?.toLowerCase().includes(query) ||
        booking.serviceType?.toLowerCase().includes(query) ||
        booking.vendorName?.toLowerCase().includes(query) ||
        booking.vendorBusinessName?.toLowerCase().includes(query) ||
        booking.bookingReference?.toLowerCase().includes(query) ||
        booking.eventLocation?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Calculate stats from filtered bookings
  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter(b => b.status === 'quote_requested' || b.status === 'request').length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'quote_accepted' || b.status === 'approved').length,
    paid: filteredBookings.filter(b => b.status === 'downpayment_paid' || b.status === 'paid_in_full').length,
    completed: filteredBookings.filter(b => b.status === 'completed').length,
    totalSpent: filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    totalPaid: filteredBookings.reduce((sum, b) => sum + ((b as any).totalPaid || 0), 0),
    remainingBalance: filteredBookings.reduce((sum, b) => sum + (b.remainingBalance || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <CoupleHeader />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl shadow-2xl p-8"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  My Wedding Bookings
                </h1>
                <p className="text-pink-100 text-lg">
                  {loading ? 'Loading your bookings...' : `Managing ${filteredBookings.length} service${filteredBookings.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              
              <button
                onClick={() => window.location.href = '/individual/services'}
                className="px-6 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Book New Service
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <div className="text-white/80 text-sm mb-1">Total Bookings</div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <div className="text-white/80 text-sm mb-1">Confirmed</div>
                <div className="text-3xl font-bold text-white">{stats.confirmed}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <div className="text-white/80 text-sm mb-1">Total Spent</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <div className="text-white/80 text-sm mb-1">Remaining</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.remainingBalance)}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vendor, service, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter bookings by status"
                className="w-full pl-12 pr-4 py-3 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Status</option>
                <option value="quote_requested">Awaiting Quote</option>
                <option value="quote_sent">Quote Received</option>
                <option value="quote_accepted">Quote Accepted</option>
                <option value="confirmed">Confirmed</option>
                <option value="downpayment_paid">Deposit Paid</option>
                <option value="paid_in_full">Fully Paid</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={loadBookings}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Bookings</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadBookings}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm border border-pink-200 rounded-2xl p-12 text-center"
          >
            <Heart className="w-20 h-20 text-pink-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">Start planning your dream wedding by booking services!</p>
            <button
              onClick={() => window.location.href = '/individual/services'}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Browse Services
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => {
                const statusBadge = getStatusBadge(booking.status);
                const daysUntil = getDaysUntilEvent(booking.eventDate);
                const urgencyClass = getUrgencyClass(daysUntil);
                
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-pink-100 overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -translate-y-16 translate-x-16" />
                      
                      <div className="relative z-10 flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                            {getServiceIcon(booking.serviceType)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">
                              {booking.serviceName || booking.serviceType || 'Wedding Service'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.vendorName || booking.vendorBusinessName || 'Wedding Vendor'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusBadge.className} text-sm font-medium`}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Event Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-pink-500" />
                          <span className="text-gray-700">
                            {booking.formattedEventDate || new Date(booking.eventDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className={`w-4 h-4 ${daysUntil < 0 ? 'text-gray-400' : 'text-orange-500'}`} />
                          <span className={urgencyClass}>
                            {daysUntil < 0 ? 'Event passed' : daysUntil === 0 ? 'Today!' : `${daysUntil} days away`}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 line-clamp-1">
                            {booking.eventLocation || 'Location TBD'}
                          </span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-4 border-t border-pink-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Total Amount</span>
                          <span className="font-bold text-lg text-gray-900">
                            {formatCurrency(booking.totalAmount || 0)}
                          </span>
                        </div>
                        
                        {booking.remainingBalance && booking.remainingBalance > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Balance</span>
                            <span className="font-semibold text-orange-600">
                              {formatCurrency(booking.remainingBalance)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Compact grid layout for multiple buttons */}
                      <div className="pt-4 space-y-2">
                        {/* Quote Requested/Pending - Show View Details + Cancel in 2-column grid */}
                        {(booking.status === 'quote_requested' || booking.status === 'request' || booking.status === 'pending') && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowDetails(true);
                              }}
                              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Quote Sent - Show View Quote + Accept in 2-column grid */}
                        {booking.status === 'quote_sent' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleViewQuoteDetails(booking)}
                              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 font-medium text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              View Quote
                            </button>
                            <button
                              onClick={() => handleAcceptQuotation(booking)}
                              className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 font-medium text-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Accept
                            </button>
                          </div>
                        )}

                        {/* Quote Accepted/Confirmed - Show Pay Deposit AND Pay Full in 2-column grid */}
                        {(booking.status === 'quote_accepted' || booking.status === 'confirmed' || booking.status === 'approved') && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handlePayment(booking as any, 'downpayment')}
                                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 font-medium text-sm"
                              >
                                <CreditCard className="w-4 h-4" />
                                <span>Pay Deposit</span>
                              </button>
                              <button
                                onClick={() => handlePayment(booking as any, 'full_payment')}
                                className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 font-medium text-sm"
                              >
                                <DollarSign className="w-4 h-4" />
                                <span>Full Payment</span>
                              </button>
                            </div>
                            {/* Cancel button - full width below payment options */}
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Request Cancellation
                            </button>
                          </>
                        )}

                        {/* Deposit Paid - Show Pay Balance + View Receipt in 2-column */}
                        {(booking.status === 'downpayment_paid' || booking.status === 'deposit_paid' || booking.status === 'downpayment') && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              {booking.remainingBalance && booking.remainingBalance > 0 && (
                                <button
                                  onClick={() => handlePayment(booking as any, 'remaining_balance')}
                                  className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 font-medium text-sm"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Pay Balance
                                </button>
                              )}
                              <button
                                onClick={() => handleViewReceipt(booking)}
                                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 font-medium text-sm"
                              >
                                <FileText className="w-4 h-4" />
                                View Receipt
                              </button>
                            </div>
                            {/* Cancel button - requires approval for paid bookings */}
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Request Cancellation
                            </button>
                          </>
                        )}

                        {/* View Receipt Button - Show for fully paid bookings only (deposit paid is handled above) */}
                        {(booking.status === 'fully_paid' || booking.status === 'paid_in_full' || booking.status === 'completed') && (
                          <button
                            onClick={() => handleViewReceipt(booking)}
                            className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            View Receipt
                          </button>
                        )}

                        {/* Mark as Complete Button - Show for fully paid bookings (two-sided completion) */}
                        {/* Only show if status is fully_paid/paid_in_full AND not already completed */}
                        {(booking.status === 'fully_paid' || booking.status === 'paid_in_full') && 
                         booking.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => handleMarkComplete(booking)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as Complete
                            </button>
                            {/* Cancel button - for fully paid bookings before completion */}
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              Request Cancellation
                            </button>
                          </>
                        )}

                        {/* Fully Completed Badge - Show when both sides confirmed */}
                        {booking.status === 'completed' && (
                          <>
                            <div className="w-full px-3 py-2 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 text-pink-700 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm">
                              <Heart className="w-4 h-4 fill-current" />
                              Completed ✓
                            </div>
                            
                            {/* Rate & Review Button - Only show if not already reviewed */}
                            {!reviewedBookings.has(booking.id) && (
                              <button
                                onClick={() => handleRateBooking(booking)}
                                className="w-full px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                              >
                                <Star className="w-4 h-4 fill-current" />
                                Rate & Review
                              </button>
                            )}
                          </>
                        )}

                        {/* Report Issue Button - Available for ALL bookings (universal) */}
                        <button
                          onClick={() => handleReportIssue(booking)}
                          className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm border border-orange-300"
                          title="Report an issue with this booking"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Report Issue
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modals */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onPayment={handlePayment}
      />

      {/* PayMongo Payment Modal */}
      <PayMongoPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, booking: null, paymentType: 'downpayment', loading: false })}
        booking={paymentModal.booking ? {
          id: paymentModal.booking.id,
          vendorName: (paymentModal.booking as any).vendorName || (paymentModal.booking as any).vendorBusinessName || 'Unknown Vendor',
          serviceType: paymentModal.booking.serviceType || 'Wedding Service',
          eventDate: (paymentModal.booking as any).formattedEventDate || 
                     (paymentModal.booking.eventDate ? new Date(paymentModal.booking.eventDate).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long', 
                       day: 'numeric'
                     }) : 'TBD'),
          bookingReference: paymentModal.booking.bookingReference || `WB-${paymentModal.booking.id?.slice(-6)}`
        } : {
          id: '',
          vendorName: '',
          serviceType: '',
          eventDate: ''
        }}
        paymentType={paymentModal.paymentType}
        amount={(() => {
          const booking = paymentModal.booking as any;
          
          if (!booking) {
            return 0;
          }
          
          if (paymentModal.paymentType === 'downpayment') {
            // Check if there's a custom deposit amount from the CustomDepositModal
            if (booking.customDepositAmount && Number(booking.customDepositAmount) > 0) {
              return Number(booking.customDepositAmount);
            }
            
            // Downpayment calculation (30% of total by default)
            let amount = 0;
            
            // Try downpaymentAmount first (mapped from backend downPayment)
            if (booking.downpaymentAmount && Number(booking.downpaymentAmount) > 0) {
              amount = Number(booking.downpaymentAmount);
            }
            // Fallback to raw downPayment field
            else if (booking.downPayment && Number(booking.downPayment) > 0) {
              amount = Number(booking.downPayment);
            }
            // Calculate 30% from totalAmount
            else if (booking.totalAmount && Number(booking.totalAmount) > 0) {
              amount = Math.round(Number(booking.totalAmount) * 0.3);
            }
            // Calculate 30% from amount (backend total)
            else if (booking.amount && Number(booking.amount) > 0) {
              amount = Math.round(Number(booking.amount) * 0.3);
            }
            // Ultimate fallback - default downpayment based on service type
            else {
              const serviceType = booking.serviceType || '';
              switch (serviceType) {
                case 'Security & Guest Management':
                  amount = 15000; // ₱15,000 downpayment for ₱50,000 service
                  break;
                case 'photography':
                  amount = 22500; // ₱22,500 downpayment for ₱75,000 service
                  break;
                default:
                  amount = 13500; // ₱13,500 downpayment for ₱45,000 service
              }
            }
            
            return Math.max(amount, 1000); // Minimum ₱1,000 
          } else if (paymentModal.paymentType === 'full_payment') {
            // Full payment calculation (100% of total)
            let amount = 0;
            
            // Use totalAmount first
            if (booking.totalAmount && Number(booking.totalAmount) > 0) {
              amount = Number(booking.totalAmount);
            }
            // Fallback to amount field (backend total)
            else if (booking.amount && Number(booking.amount) > 0) {
              amount = Number(booking.amount);
            }
            // Ultimate fallback - service-based total amounts
            else {
              const serviceType = booking.serviceType || '';
              switch (serviceType) {
                case 'Security & Guest Management':
                  amount = 50000; // ₱50,000 total
                  break;
                case 'photography':
                  amount = 75000; // ₱75,000 total
                  break;
                case 'catering':
                  amount = 120000; // ₱120,000 total
                  break;
                case 'planning':
                  amount = 80000; // ₱80,000 total
                  break;
                case 'music_dj':
                  amount = 45000; // ₱45,000 total
                  break;
                case 'florals':
                  amount = 35000; // ₱35,000 total
                  break;
                case 'venue':
                  amount = 150000; // ₱150,000 total
                  break;
                default:
                  amount = 45000; // ₱45,000 default total
              }
            }
            
            return Math.max(amount, 1000); // Minimum ₱1,000
          } else {
            // Balance payment calculation
            let amount = 0;
            
            if (booking.remainingBalance && Number(booking.remainingBalance) > 0) {
              amount = Number(booking.remainingBalance);
            } else if (booking.totalAmount && Number(booking.totalAmount) > 0) {
              amount = Math.round(Number(booking.totalAmount) * 0.7);
            } else if (booking.amount && Number(booking.amount) > 0) {
              amount = Math.round(Number(booking.amount) * 0.7);
            }
            // Ultimate fallback for balance payment
            else {
              const serviceType = booking.serviceType || '';
              switch (serviceType) {
                case 'Security & Guest Management':
                  amount = 35000; // ₱35,000 balance for ₱50,000 service
                  break;
                case 'photography':
                  amount = 52500; // ₱52,500 balance for ₱75,000 service
                  break;
                default:
                  amount = 31500; // ₱31,500 balance for ₱45,000 service
              }
            }
            
            return Math.max(amount, 1000); // Minimum ₱1,000
          }
        })()}
        currency="PHP"
        currencySymbol="₱"
        onPaymentSuccess={handlePayMongoPaymentSuccess}
        onPaymentError={(error) => {
          console.error('Payment error:', error);
          setPaymentModal({ isOpen: false, booking: null, paymentType: 'downpayment', loading: false });
        }}
      />

      {/* Quote Details Modal */}
      <QuoteDetailsModal
        booking={selectedBooking}
        isOpen={showQuoteDetails}
        onClose={() => setShowQuoteDetails(false)}
        onAcceptQuote={async (booking) => {
          if (!booking?.id) return;
          
          // Show confirmation modal instead of direct action
          setQuoteConfirmation({
            isOpen: true,
            booking: booking as unknown as EnhancedBooking,
            type: 'accept'
          });
        }}
        onRejectQuote={async (booking) => {
          if (!booking?.id) return;
          
          // Show confirmation modal instead of direct action
          setQuoteConfirmation({
            isOpen: true,
            booking: booking as unknown as EnhancedBooking,
            type: 'reject'
          });
        }}
        onRequestModification={async (booking) => {
          if (!booking?.id) return;
          
          // Show confirmation modal instead of direct action
          setQuoteConfirmation({
            isOpen: true,
            booking: booking as unknown as EnhancedBooking,
            type: 'modify'
          });
        }}
      />

      {/* Quote Confirmation Modal */}
      <QuoteConfirmationModal
        isOpen={quoteConfirmation.isOpen}
        onClose={() => setQuoteConfirmation({ isOpen: false, booking: null, type: 'accept' })}
        onConfirm={async () => {
          if (!quoteConfirmation.booking) return;
          
          const action = quoteConfirmation.type;
          
          if (action === 'accept') {
            // Use the new confirmation handler that calls the API
            await confirmAcceptQuotation();
            setShowQuoteDetails(false);
          } else if (action === 'reject') {
            // Show info modal that reject is not yet implemented
            setConfirmationModal({
              isOpen: true,
              title: 'Feature Coming Soon',
              message: 'Quote rejection is not yet implemented. Please contact the vendor directly to decline their quote.',
              type: 'info',
              onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false })),
              confirmText: 'OK',
              cancelText: ''
            });
            setQuoteConfirmation({ isOpen: false, booking: null, type: 'accept' });
            setShowQuoteDetails(false);
          } else if (action === 'modify') {
            // TODO: Implement proper modification request
            setSuccessMessage('Quote modification request sent to vendor.');
            setShowSuccessModal(true);
            setQuoteConfirmation({ isOpen: false, booking: null, type: 'accept' });
            setShowQuoteDetails(false);
          }
        }}
        booking={quoteConfirmation.booking ? {
          vendorName: quoteConfirmation.booking.vendorName || quoteConfirmation.booking.vendorBusinessName,
          serviceType: quoteConfirmation.booking.serviceType,
          totalAmount: quoteConfirmation.booking.totalAmount,
          eventDate: quoteConfirmation.booking.formattedEventDate || quoteConfirmation.booking.eventDate,
          eventLocation: quoteConfirmation.booking.eventLocation,
          serviceItems: quoteConfirmation.booking.serviceItems
        } : null}
        type={quoteConfirmation.type}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button

                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                               className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            {confirmationModal.type === 'complete' && confirmationModal.bookingData ? (
              // ✨ ENHANCED COMPLETION MODAL WITH WEDDING THEME
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-gradient-to-br from-white via-pink-50 to-rose-50 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-pink-200"
              >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="flex items-center justify-center mb-3"
                    >
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-4 shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white text-center">
                      Complete Your Booking
                    </h3>
                    <p className="text-pink-100 text-center text-sm mt-1">
                      {confirmationModal.completionStatus?.vendorCompleted 
                        ? '🎉 Final Step - Confirm Service Completion' 
                        : '📋 Mark Service as Complete'
                      }
                    </p>
                  </div>
                               </div>

                {/* Booking Information Card */}
                <div className="p-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-pink-100 shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-3 flex-shrink-0">
                        <Package className="w-6 h-6 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">
                          {confirmationModal.bookingData.serviceName}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <span className="font-medium">{confirmationModal.bookingData.vendorName}</span>
                          {confirmationModal.bookingData.vendorRating && (

                            <span className="flex items-center gap-1 text-yellow-600">
                              <Star className="w-3 h-3 fill-current" />
                              {confirmationModal.bookingData.vendorRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-700">{confirmationModal.bookingData.formattedEventDate || confirmationModal.bookingData.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            <span className="text-gray-700 truncate">{confirmationModal.bookingData.eventLocation}</span>
                          </div>
                          {confirmationModal.bookingData.totalAmount && (
                            <div className="flex items-center gap-2 col-span-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-700">
                                ₱{confirmationModal.bookingData.totalAmount.toLocaleString()}
                              </span>
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Fully Paid
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Completion Progress */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 mb-6 border border-pink-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      Completion Progress
                    </h4>
                    <div className="space-y-3">
                      {/* Couple Completion */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          confirmationModal.completionStatus?.coupleCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {confirmationModal.completionStatus?.coupleCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Heart className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">You (Couple)</p>
                          <p className="text-xs text-gray-500">
                            {confirmationModal.completionStatus?.coupleCompleted 
                              ? '✅ Confirmed completion' 
                              : '⏳ Awaiting confirmation'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: confirmationModal.completionStatus?.coupleCompleted 
                              ? (confirmationModal.completionStatus?.vendorCompleted ? '100%' : '50%')
                              : '0%'
                          }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500"
                        />
                      </div>

                      {/* Vendor Completion */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          confirmationModal.completionStatus?.vendorCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {confirmationModal.completionStatus?.vendorCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Users className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {confirmationModal.bookingData.vendorName || 'Vendor'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {confirmationModal.completionStatus?.vendorCompleted 
                              ? '✅ Confirmed completion' 
                              : '⏳ Awaiting confirmation'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {confirmationModal.completionStatus?.vendorCompleted ? (
                            <>
                              <span className="font-semibold text-blue-900">Great news!</span> The vendor has already confirmed completion. 
                              By confirming, you agree that the service was delivered satisfactorily and the booking will be <span className="font-semibold text-green-600">FULLY COMPLETED</span>.
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-blue-900">Note:</span> The booking will only be fully completed when <span className="font-semibold">both you and the vendor</span> confirm completion. 
                              This ensures both parties are satisfied with the service delivery.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      {confirmationModal.cancelText || 'Cancel'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmationModal.onConfirm}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {confirmationModal.confirmText || 'Confirm'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // 📋 STANDARD CONFIRMATION MODAL (for other actions)
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <div className="text-center">
                  <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                    confirmationModal.type === 'danger' ? 'bg-red-100' : 
                    confirmationModal.type === 'warning' ? 'bg-yellow-100' : 
                    'bg-blue-100'
                  }`}>
                    {confirmationModal.type === 'danger' ? (
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : confirmationModal.type === 'warning' ? (
                      <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmationModal.title}</h3>
                  <p className="text-gray-600 mb-4 whitespace-pre-line">{confirmationModal.message}</p>
                  
                  {confirmationModal.showInput && (
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
                      rows={3}
                      placeholder={confirmationModal.inputPlaceholder}
                      value={confirmationModal.inputValue}
                      onChange={(e) => setConfirmationModal(prev => ({ ...prev, inputValue: e.target.value }))}
                    />
                  )}
                  
                  <div className="flex gap-3">
                    {confirmationModal.cancelText && (
                      <button
                        onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        {confirmationModal.cancelText}
                      </button>
                    )}
                    <button
                      onClick={confirmationModal.onConfirm}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                        confirmationModal.type === 'danger' 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : confirmationModal.type === 'warning'
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-pink-600 text-white hover:bg-pink-700'
                      }`}
                    >
                      {confirmationModal.confirmText}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        booking={receiptBooking}
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setReceiptBooking(null);
        }}
      />

      {/* Rating Modal - Modular Review System */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRatingBooking(null);
        }}
        booking={ratingBooking ? {
          id: ratingBooking.id,
          vendorName: ratingBooking.vendorName || ratingBooking.vendorBusinessName || 'Vendor',
          serviceType: ratingBooking.serviceType,
          eventDate: ratingBooking.formattedEventDate || ratingBooking.eventDate
        } : null}
        onSubmitReview={handleSubmitReview}
      />

      {/* Custom Deposit Modal */}
      <CustomDepositModal
        isOpen={customDepositModal.isOpen}
        onClose={() => setCustomDepositModal({ isOpen: false, booking: null, totalAmount: 0 })}
        totalAmount={customDepositModal.totalAmount}
        onConfirm={handleCustomDepositConfirm}
        vendorName={
          customDepositModal.booking
            ? ((customDepositModal.booking as any).vendorName || (customDepositModal.booking as any).vendorBusinessName || 'Vendor')
            : 'Vendor'
        }
        currencySymbol="₱"
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportBooking(null);
        }}
        booking={reportBooking ? {
          id: reportBooking.id,
          vendorName: reportBooking.vendorName || reportBooking.vendorBusinessName,
          serviceType: reportBooking.serviceType,
          bookingReference: reportBooking.bookingReference
        } : null}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
};
