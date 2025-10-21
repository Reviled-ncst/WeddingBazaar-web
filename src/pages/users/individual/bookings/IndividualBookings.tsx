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
  Eye
} from 'lucide-react';

// Import modular components
import {
  BookingDetailsModal,
  QuoteDetailsModal,
  QuoteConfirmationModal,
  ReceiptModal
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

// Import booking actions service
import { 
  getBookingReceipts, 
  cancelBooking, 
  requestCancellation, 
  formatReceipt,
  type Receipt 
} from '../../../../shared/services/bookingActionsService';

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
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'danger';
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    showInput?: boolean;
    inputPlaceholder?: string;
    inputValue?: string;
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

  // Load bookings function
  const loadBookings = useCallback(async () => {
    
    // TEMPORARY: Use fallback user ID for testing if not logged in
    let effectiveUserId = user?.id;
    if (!effectiveUserId) {
      effectiveUserId = '1-2025-001'; // User with 2 bookings for testing
    }
    
    console.log('👤 [IndividualBookings] Loading bookings for user:', effectiveUserId);
    
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

      console.log('🔥 [CRITICAL DEBUG] Raw API response:', response);
      console.log('📊 [IndividualBookings] API response:', 'Count:', response.bookings?.length, 'Total:', response.total);

      if (response.bookings && response.bookings.length > 0) {
        console.log('🔍 [IndividualBookings] Sample raw booking:', {
          id: (response.bookings[0] as any).id,
          vendor_name: (response.bookings[0] as any).vendor_name,
          couple_name: (response.bookings[0] as any).couple_name,
          status: (response.bookings[0] as any).status,
          quoted_price: (response.bookings[0] as any).quoted_price,
          final_price: (response.bookings[0] as any).final_price
        });
        
        // Map backend response to enhanced bookings using unified mapping utility
        const enhancedBookings: EnhancedBooking[] = response.bookings.map((booking: any) => 
          mapToEnhancedBooking(booking)
        );

        setBookings(enhancedBookings);
        console.log('✅ [IndividualBookings] Bookings loaded successfully:', enhancedBookings);
        console.log('🔍 [IndividualBookings] Updated bookings state with', enhancedBookings.length, 'bookings');
      } else {
        console.log('⚠️ [IndividualBookings] No bookings found');
        setBookings([]);
        console.log('🔍 [IndividualBookings] Updated bookings state to empty array');
      }
    } catch (error) {
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
      console.log('🔍 [IndividualBookings] Updated bookings state to empty array due to error');
    } finally {
      setLoading(false);
      console.log('🏁 [IndividualBookings] loadBookings completed');
    }
  }, [user?.id, sortBy, sortOrder]);

  // Load bookings on component mount and when user changes
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Listen for booking creation events from BookingRequestModal
  useEffect(() => {
    const handleBookingCreated = (event: CustomEvent) => {
      console.log('📢 [IndividualBookings] Received bookingCreated event:', event.detail);
      
      // Add a small delay to ensure backend has processed the booking
      setTimeout(() => {
        console.log('⏳ [IndividualBookings] Calling loadBookings after delay...');
        loadBookings();
      }, 500);
    };

    console.log('👂 [IndividualBookings] Setting up bookingCreated event listener');
    
    // Add event listener
    window.addEventListener('bookingCreated', handleBookingCreated as EventListener);

    // Cleanup
    return () => {
      console.log('🧹 [IndividualBookings] Cleaning up bookingCreated event listener');
      window.removeEventListener('bookingCreated', handleBookingCreated as EventListener);
    };
  }, [loadBookings]);

  const handlePayment = (booking: Booking | EnhancedBooking, paymentType: PaymentType) => {
    console.log('💳 [PAYMENT TRIGGER] Opening payment modal for:', {
      bookingId: booking.id,
      paymentType,
      bookingStatus: booking.status,
      totalAmount: booking.totalAmount
    });

    // Opening PayMongo payment modal
    setPaymentModal({
      isOpen: true,
      booking: booking as any,
      paymentType,
      loading: false
    });

    console.log('💳 [PAYMENT MODAL] Payment modal state updated');
  };

  // Handle viewing receipts
  const handleViewReceipt = async (booking: EnhancedBooking) => {
    console.log('📄 [ViewReceipt] Opening receipt modal for booking:', booking.id);
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

  // Enhanced PayMongo payment success handler with proper status updates and comprehensive debugging
  const handlePayMongoPaymentSuccess = useCallback(async (paymentData: any) => {
    console.log('🎉 [PAYMENT SUCCESS TRIGGERED] Handler called with data:', paymentData);

    // Enhanced debugging of payment modal state
    console.log('🔍 [PAYMENT DEBUG] Full payment modal state:', {
      isOpen: paymentModal.isOpen,
      hasBooking: !!paymentModal.booking,
      bookingId: paymentModal.booking?.id,
      paymentType: paymentModal.paymentType,
      loading: paymentModal.loading,
      bookingStatus: paymentModal.booking?.status
    });

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
    
    console.log('🔒 [SECURE REFERENCES] Stored local references:', {
      bookingId: booking.id,
      paymentType: paymentType,
      amount: amount,
      paymentDataKeys: Object.keys(paymentData)
    });

    try {
      console.log('💰 [PAYMENT DETAILS]', {
        bookingId: booking.id,
        paymentType,
        amount,
        currentStatus: booking.status,
        paymentMethod: paymentData.method || 'unknown',
        transactionId: paymentData.transactionId || 'unknown'
      });

      // Get current booking data from state
      const currentBooking = bookings.find(b => b.id === booking.id);
      const currentTotalPaid = (currentBooking as any)?.totalPaid || 0;
      const totalAmount = currentBooking?.totalAmount || booking.totalAmount || 0;

      console.log('📊 [BOOKING STATE] Current booking data:', {
        found: !!currentBooking,
        currentTotalPaid,
        totalAmount,
        existingStatus: currentBooking?.status
      });

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
          console.log('💳 [DOWNPAYMENT] Status will be updated to downpayment_paid');
          break;

        case 'full_payment':
          newStatus = 'paid_in_full';
          paymentProgressPercentage = 100;
          totalPaid = totalAmount;
          remainingBalance = 0;
          console.log('💰 [FULL PAYMENT] Status will be updated to paid_in_full');
          break;

        case 'remaining_balance':
          newStatus = 'paid_in_full';
          paymentProgressPercentage = 100;
          totalPaid = totalAmount;
          remainingBalance = 0;
          console.log('💰 [BALANCE PAYMENT] Status will be updated to paid_in_full');
          break;

        default:
          console.warn('⚠️ [PAYMENT WARNING] Unknown payment type:', paymentType);
          newStatus = 'downpayment_paid';
          paymentProgressPercentage = 30;
          totalPaid = currentTotalPaid + amount;
          remainingBalance = totalAmount - totalPaid;
      }

      // Update booking status optimistically in the UI
      console.log('📋 [BEFORE UPDATE] Current bookings count:', bookings.length);
      console.log('📋 [BEFORE UPDATE] Booking to update found:', !!bookings.find(b => b.id === booking.id));

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

      console.log('🔄 [STATUS UPDATE] Will apply these changes:', updatedBooking);

      // Update local React state optimistically (backend update happens later)
      setBookings(prev => {
        console.log('🔍 [BEFORE STATE UPDATE] Previous bookings:', prev.length);
        const bookingToUpdate = prev.find(b => b.id === booking.id);
        console.log('🔍 [BOOKING TO UPDATE] Found booking:', !!bookingToUpdate, bookingToUpdate?.status);

        const updated = prev.map(currentBooking => {
          if (currentBooking.id === booking.id) {
            const result = {
              ...currentBooking,
              ...updatedBooking
            };
            console.log('✅ [BOOKING UPDATED] New booking state:', {
              id: result.id,
              status: result.status,
              totalPaid: (result as any).totalPaid,
              remainingBalance: (result as any).remainingBalance
            });
            return result;
          }
          return currentBooking;
        });
        
        console.log('✅ [STATE UPDATE COMPLETE] Updated bookings count:', updated.length);
        return updated;
      });

      // Show success message based on payment type
      const successMessages = {
        downpayment: 'Deposit payment successful! Your booking is now confirmed.',
        full_payment: 'Full payment completed! Your booking is fully paid.',
        remaining_balance: 'Balance payment successful! Your booking is now fully paid.'
      };

      const successMessage = successMessages[paymentType] || 'Payment completed successfully!';
      console.log('✅ [PAYMENT SUCCESS]', successMessage);

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
      console.log('📡 [BACKEND UPDATE] Updating booking status in database...');
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
          downpayment_amount: paymentType === 'downpayment' ? amount : currentBooking?.downpaymentAmount,
          remaining_balance: remainingBalance,
          payment_progress: paymentProgressPercentage,
          last_payment_date: new Date().toISOString(),
          payment_method: paymentData.method || 'card',
          transaction_id: paymentData.transactionId
        };
        
        console.log('📡 [BACKEND UPDATE] Sending complete payment update:', {
          url: updateStatusUrl,
          payload: updatePayload
        });
        
        const updateResponse = await fetch(updateStatusUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        });
        
        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('✅ [BACKEND UPDATE] Booking status updated in database:', updateData);
          
          // Reload bookings from backend to get fresh data
          console.log('🔄 [RELOAD BOOKINGS] Fetching latest booking data...');
          setTimeout(() => {
            loadBookings();
          }, 500); // Small delay to ensure backend has committed the changes
        } else {
          const errorData = await updateResponse.json();
          console.warn('⚠️ [BACKEND UPDATE] Failed to update booking status:', errorData);
          // Don't throw - UI update already succeeded
        }
      } catch (backendError) {
        console.error('❌ [BACKEND UPDATE] Error updating booking in backend:', backendError);
        // Don't throw - UI update already succeeded
      }

      // For test bookings, we might want to persist this to localStorage or backend
      if (booking.id.startsWith('test-')) {
        console.log('🧪 [TEST BOOKING] Payment recorded for test booking');
        // Could add localStorage persistence here if needed
      }

      // Close modal with a small delay to ensure state update completes
      setTimeout(() => {
        console.log('🚪 [MODAL CLOSE] Closing payment modal...');
        setPaymentModal({ 
          isOpen: false, 
          booking: null, 
          paymentType: 'downpayment', 
          loading: false 
        });
      }, 1000); // Increased delay to ensure user sees the success state

      console.log('🎉 [PAYMENT COMPLETE] All payment processing completed successfully');

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
    console.log('🔍 [ViewQuote] Button clicked - Original booking:', booking);
    console.log('🔍 [ViewQuote] Booking ID:', booking.id);
    console.log('🔍 [ViewQuote] Booking status:', booking.status);
    console.log('🔍 [ViewQuote] Has quote_itemization (snake_case):', !!(booking as any)?.quote_itemization);
    console.log('🔍 [ViewQuote] Has quoteItemization (camelCase):', !!(booking as any)?.quoteItemization);
    console.log('🔍 [ViewQuote] Has vendor_notes (snake_case):', !!(booking as any)?.vendor_notes);
    console.log('🔍 [ViewQuote] Has vendorNotes (camelCase):', !!(booking as any)?.vendorNotes);
    console.log('🔍 [ViewQuote] All booking keys:', Object.keys(booking));
    
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
                        {/* Quote Requested/Pending - Show View Details */}
                        {(booking.status === 'quote_requested' || booking.status === 'request' || booking.status === 'pending') && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetails(true);
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
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
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handlePayment(booking as any, 'downpayment')}
                              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 font-medium text-sm"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Deposit 30%</span>
                            </button>
                            <button
                              onClick={() => handlePayment(booking as any, 'full_payment')}
                              className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 font-medium text-sm"
                            >
                              <DollarSign className="w-4 h-4" />
                              <span>Full Payment</span>
                            </button>
                          </div>
                        )}

                        {/* Deposit Paid - Show Pay Balance + View Receipt in 2-column */}
                        {(booking.status === 'downpayment_paid' || booking.status === 'deposit_paid' || booking.status === 'downpayment') && (
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

                        {/* Cancel + Contact buttons in 2-column grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Cancel Button */}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="px-3 py-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-1.5 font-medium text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              {(booking.status === 'request' || booking.status === 'quote_requested') ? 'Cancel' : 'Request Cancel'}
                            </button>
                          )}

                          {/* Contact vendor */}
                          {booking.vendorPhone && (
                            <button
                              onClick={() => window.open(`tel:${booking.vendorPhone}`)}
                              className="px-3 py-2 bg-white border-2 border-pink-200 text-pink-600 rounded-lg hover:bg-pink-50 transition-all flex items-center justify-center gap-1.5 font-medium text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              Contact
                            </button>
                          )}
                        </div>
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
            // Downpayment calculation (30% of total)
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
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
          </div>
        </div>
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
    </div>
  );
};
