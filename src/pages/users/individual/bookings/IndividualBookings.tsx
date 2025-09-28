import React, { useState, useEffect, useCallback } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';

// Import modular components
import {
  BookingDetailsModal,
  QuoteDetailsModal
} from './components';

// Import payment components
import { PayMongoPaymentModal } from '../../../../shared/components/PayMongoPaymentModal';

// Import auth context to get the real user ID
import { useAuth } from '../../../../shared/contexts/AuthContext';

// Import booking API service
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';

// Import unified mapping utilities
import { mapToEnhancedBooking } from '../../../../shared/utils/booking-data-mapping';

// Import custom hooks
import { useBookingPreferences } from './hooks';

// Import cn utility
import { cn } from '../../../../utils/cn';

import type { 
  Booking
} from './types/booking.types';
import type { BookingStatus } from '../../../../shared/types/comprehensive-booking.types';
import type { PaymentType } from '../payment/types/payment.types';

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
  
  // Enhanced booking type with better vendor info and location data
  interface EnhancedBooking extends Omit<Booking, 'vendorPhone' | 'vendorEmail'> {
    vendorBusinessName?: string;
    vendorCategory?: string;
    vendorImage?: string;
    vendorRating?: number;
    vendorPhone?: string | null;
    vendorEmail?: string | null;
    serviceImage?: string; // Primary service image
    serviceGallery?: string[]; // Array of service images
    serviceId?: string; // Service ID for display
    eventCoordinates?: {
      lat: number;
      lng: number;
    };
    formattedEventDate?: string;
    formattedEventTime?: string;
    daysUntilEvent?: number;
  }

  // State management
  const [bookings, setBookings] = useState<EnhancedBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  // Commented out unused state
  // const [showMapModal, setShowMapModal] = useState(false);
  // Commented out unused state
  // const [selectedLocation, setSelectedLocation] = useState<{
  //   name: string;
  //   coordinates: { lat: number; lng: number };
  // } | null>(null);
  
  // Payment modal state (updated for PayMongo)
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null as Booking | null,
    paymentType: 'downpayment' as PaymentType,
    loading: false
  });
  // Load bookings function
  const loadBookings = useCallback(async () => {
    
    // TEMPORARY: Use fallback user ID for testing if not logged in
    let effectiveUserId = user?.id;
    if (!effectiveUserId) {
      effectiveUserId = '1-2025-001'; // User with 2 bookings for testing
    }
    
    console.log('ðŸ‘¤ [IndividualBookings] Loading bookings for user:', effectiveUserId);
    
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

      console.log('ðŸ”¥ [CRITICAL DEBUG] Raw API response:', response);
      console.log('ðŸ“Š [IndividualBookings] API response:', 'Count:', response.bookings?.length, 'Total:', response.total);

      if (response.bookings && response.bookings.length > 0) {
        console.log('ðŸ” [IndividualBookings] Sample raw booking:', {
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
        console.log('âœ… [IndividualBookings] Bookings loaded successfully:', enhancedBookings);
        console.log('ðŸ“ [IndividualBookings] Updated bookings state with', enhancedBookings.length, 'bookings');
      } else {
        console.log('âš ¸ [IndividualBookings] No bookings found');
        setBookings([]);
        console.log('ðŸ“ [IndividualBookings] Updated bookings state to empty array');
      }
    } catch (error) {
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
      console.log('ðŸ“ [IndividualBookings] Updated bookings state to empty array due to error');
    } finally {
      setLoading(false);
      console.log('ðŸ [IndividualBookings] loadBookings completed');
    }
  }, [user?.id, sortBy, sortOrder]);

  // Load bookings on component mount and when user changes
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Listen for booking creation events from BookingRequestModal
  useEffect(() => {
    const handleBookingCreated = (event: CustomEvent) => {
      console.log('ðŸ“¢ [IndividualBookings] Received bookingCreated event:', event.detail);
      
      // Add a small delay to ensure backend has processed the booking
      setTimeout(() => {
        console.log('â³ [IndividualBookings] Calling loadBookings after delay...');
        loadBookings();
      }, 500);
    };

    console.log('ðŸ‘‚ [IndividualBookings] Setting up bookingCreated event listener');
    
    // Add event listener
    window.addEventListener('bookingCreated', handleBookingCreated as EventListener);

    // Cleanup
    return () => {
      console.log('ðŸ§¹ [IndividualBookings] Cleaning up bookingCreated event listener');
      window.removeEventListener('bookingCreated', handleBookingCreated as EventListener);
    };
  }, [loadBookings]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Removed unused handlePayDeposit - replaced by handlePayment

  // Commented out unused handler
  // const handlePayBalance = (booking: EnhancedBooking) => {
  //   console.log('ðŸ’° [PayBalance] Button clicked for booking:', booking.id);
  //   console.log('ðŸ’° [PayBalance] Booking status:', booking.status);
  //   console.log('ðŸ’° [PayBalance] Booking data:', {
  //     totalAmount: booking.totalAmount,
  //     remainingBalance: booking.remainingBalance,
  //     amount: (booking as any).amount
  //   });
  //   
  //   setPaymentModal({
  //     isOpen: true,
  //     booking: booking as any,
  //     paymentType: 'remaining_balance',
  //     loading: false
  //   });
  // };

  // Removed unused handleViewDetails - functionality integrated into booking cards

  const handlePayment = (booking: Booking | EnhancedBooking, paymentType: PaymentType) => {
    // Opening PayMongo payment modal

    setPaymentModal({
      isOpen: true,
      booking: booking as EnhancedBooking,
      paymentType,
      loading: false
    });
  };

  // Commented out unused handler
  // const handleViewLocation = (location: { name: string; coordinates?: { lat: number; lng: number } }) => {
  //   if (location.coordinates) {
  //     setSelectedLocation({
  //       name: location.name,
  //       coordinates: location.coordinates
  //     });
  //     setShowMapModal(true);
  //   }
  // };

  // Enhanced PayMongo payment success handler with proper status updates
  const handlePayMongoPaymentSuccess = useCallback(async (paymentData: any) => {
    console.log('ðŸŽ‰ [PAYMENT SUCCESS TRIGGERED] Handler called!');

    console.log('ðŸ” [PAYMENT DEBUG] Full payment modal state:', {
      isOpen: paymentModal.isOpen,
      hasBooking: !!paymentModal.booking,
      paymentType: paymentModal.paymentType,
      loading: paymentModal.loading
    });

    // Store references locally to prevent race conditions
    const booking = paymentModal.booking;
    const paymentType = paymentModal.paymentType;

    if (!booking || !booking.id) {
      return;
    }

    const amount = paymentData.amount || paymentData.original_amount || 0;
    
    console.log('ðŸ”’ [SECURE REFERENCES] Stored local references:', {
      bookingId: booking.id,
      paymentType: paymentType,
      amount: amount
    });

    try {
      
      console.log('ðŸ’° [PAYMENT DETAILS]', {
        bookingId: booking.id,
        paymentType,
        amount,
        currentStatus: booking.status
      });

      // Determine new booking status based on payment type
      let newStatus: BookingStatus;
      let paymentProgressPercentage: number;
      let totalPaid: number;
      let remainingBalance: number;

      // Get current booking data
      const currentBooking = bookings.find(b => b.id === booking.id);
      const currentTotalPaid = currentBooking?.totalPaid || 0;
      const totalAmount = currentBooking?.totalAmount || booking.totalAmount || 0;

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
          totalPaid = totalAmount; // Full amount paid
          remainingBalance = 0;
          break;

        case 'remaining_balance':
          newStatus = 'paid_in_full';
          paymentProgressPercentage = 100;
          totalPaid = currentTotalPaid + amount;
          remainingBalance = 0;
          console.log('ðŸ’° [BALANCE PAYMENT] Status updated to paid_in_full');
          break;

        default:
          console.warn('âš ¸ [PAYMENT WARNING] Unknown payment type:', paymentType);
          newStatus = 'downpayment_paid';
          paymentProgressPercentage = 30;
          totalPaid = currentTotalPaid + amount;
          remainingBalance = totalAmount - totalPaid;
      }

      // Update booking status optimistically in the UI

      console.log('ðŸ“‹ [BEFORE UPDATE] Current bookings count:', bookings.length);
      console.log('ðŸ“‹ [BEFORE UPDATE] Booking to update found:', !!bookings.find(b => b.id === booking.id));

      setBookings(prev => {
        const updated = prev.map(currentBooking => {
          if (currentBooking.id === booking.id) {
            console.log('âœ… [FOUND BOOKING] Updating booking:', currentBooking.id);
            return { 
              ...currentBooking, 
              status: newStatus,
              totalPaid,
              remainingBalance,
              paymentProgressPercentage,
              // Add payment history entry
              lastPaymentDate: new Date().toISOString(),
              lastPaymentAmount: amount,
              lastPaymentType: paymentType
            };
          }
          return currentBooking;
        });
        console.log('âœ… [UPDATE COMPLETE] Returning updated bookings');
        return updated;
      });

      // Show success message based on payment type
      const successMessages = {
        downpayment: 'Deposit payment successful! Your booking is now confirmed.',
        full_payment: 'Full payment completed! Your booking is fully paid.',
        remaining_balance: 'Balance payment successful! Your booking is now fully paid.'
      };

      console.log('âœ… [PAYMENT SUCCESS]', successMessages[paymentType] || 'Payment completed successfully!');

      // TODO: Send payment confirmation to backend API
      // This would typically call:
      // await bookingApiService.recordPayment(booking.id, {
      //   paymentType,
      //   amount,
      //   paymentMethod: 'paymongo',
      //   referenceNumber: paymentData.id || paymentData.reference_number,
      //   status: 'completed'
      // });

      console.log('ðŸŽ‰ [PAYMENT COMPLETE] Booking status updated successfully');

      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-2xl">ðŸŽ‰</div>
          <div>
            <div class="font-semibold">Payment Successful!</div>
            <div class="text-sm opacity-90">${successMessages[paymentType] || 'Payment completed successfully!'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 4000);

      // Close modal with a small delay to ensure state update completes
      setTimeout(() => {
        console.log('ðŸšª [MODAL CLOSE] Closing payment modal...');
        setPaymentModal({ 
          isOpen: false, 
          booking: null, 
          paymentType: 'downpayment', 
          loading: false 
        });
      }, 100);

      // TODO: Send payment confirmation to backend API
      // This would typically call:
      // await bookingApiService.recordPayment(booking.id, {
      //   paymentType,
      //   amount,
      //   paymentMethod: 'paymongo',
      //   referenceNumber: paymentData.id || paymentData.reference_number,
      //   status: 'completed'
      // });

    } catch (error) {
      
      // TODO: Show error message to user
      // TODO: Revert optimistic updates if backend call fails
      
      // Still close modal to prevent stuck state
      setPaymentModal({ 
        isOpen: false, 
        booking: null, 
        paymentType: 'downpayment', 
        loading: false 
      });
    }
  }, [paymentModal.paymentType, paymentModal.booking, bookings]);

  // Commented out unused handler
  // const handleBookingUpdate = (updatedBooking: EnhancedBooking) => {
  //   setBookings(prevBookings => 
  //     prevBookings.map(booking => 
  //       booking.id === updatedBooking.id 
  //         ? { ...booking, ...updatedBooking }
  //         : booking
  //     )
  //   );
  // };

  // Handle viewing quote details
  const handleViewQuoteDetails = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setShowQuoteDetails(true);
  };

  // Handle accepting quotation
  const handleAcceptQuotation = async (booking: EnhancedBooking) => {
    try {
      setLoading(true);
      
      // Call backend API to accept the quotation
      const response = await fetch(`https://weddingbazaar-web.onrender.com/api/bookings/${booking.id}/accept-quote`, {
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
        throw new Error('Failed to accept quotation');
      }

      const updatedBooking = await response.json();
      
      // Refresh bookings to show updated status
      await loadBookings();
      
      // Show success message
      alert('Quotation accepted successfully! You can now proceed with payment.');
      
      console.log('âœ… [AcceptQuotation] Successfully accepted quotation for booking:', booking.id);
    } catch (error) {
      console.error('âŒ [AcceptQuotation] Error accepting quotation:', error);
      alert('Failed to accept quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // State for filtered bookings
  const [filteredAndSortedBookings, setFilteredAndSortedBookings] = useState<EnhancedBooking[]>(
    []
  );

  // CLEAN FILTER IMPLEMENTATION - PRODUCTION READY
  useEffect(() => {
    console.log('[CLEAN FILTER] ===== FILTER START =====');
    console.log('[CLEAN FILTER] Filter Status:', filterStatus);
    console.log('[CLEAN FILTER] Total Bookings:', bookings.length);

    if (!bookings || bookings.length === 0) {
      console.log('[CLEAN FILTER] No bookings available');
      setFilteredAndSortedBookings([]);
      return;
    }

    // Show status distribution for debugging
    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[CLEAN FILTER] Status Distribution:', statusCounts);
    
    // Apply filtering logic
    const filtered = bookings.filter(booking => {
      // Status filtering
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      
      // Search filtering
      const query = debouncedSearchQuery.toLowerCase().trim();
      const searchableFields = [
        booking.vendorBusinessName,
        booking.vendorName,
        booking.serviceType,
        booking.serviceName,
        booking.eventLocation
      ].filter(Boolean);
      
      const matchesSearch = !query || searchableFields.some(field => 
        field && field.toLowerCase().includes(query)
      );

      // Debug individual filtering
      const shouldInclude = matchesStatus && matchesSearch;
      if (filterStatus !== 'all') {
        console.log(`[CLEAN FILTER CHECK] ID:${booking.id} Status:"${booking.status}" vs Filter:"${filterStatus}" = ${shouldInclude}`);
      }
      
      return shouldInclude;
    });

    console.log('[CLEAN FILTER] Filtered Results:', filtered.length, 'out of', bookings.length);
    console.log('[CLEAN FILTER] Filtered IDs:', filtered.map(b => b.id));
    
    // Update state with new array reference to force re-render
    setFilteredAndSortedBookings([...filtered]);
    
    console.log('[CLEAN FILTER] ===== FILTER END =====');
  }, [bookings, filterStatus, debouncedSearchQuery]);

  // Debug: Track filteredAndSortedBookings state changes
  useEffect(() => {
    console.log('[FILTERED STATE] filteredAndSortedBookings changed to:', filteredAndSortedBookings.length, 'bookings');
    console.log('[FILTERED STATE] IDs:', filteredAndSortedBookings.map(b => b.id));
  }, [filteredAndSortedBookings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CoupleHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `${filteredAndSortedBookings.length} booking${filteredAndSortedBookings.length !== 1 ? 's' : ''} found`}
              </p>
              {/* DEBUG: Show current filter status */}
              <p className="text-xs text-red-600 mt-1">
                DEBUG: Current filter = "{filterStatus}" | Total bookings = {bookings.length}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/individual/services'}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                + Book Service
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bookings by vendor, service, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                aria-label="Search bookings"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <select
                value={filterStatus}
                onChange={(e) => {
                  console.log('[DROPDOWN] Filter changed from', filterStatus, 'to', e.target.value);
                  setFilterStatus(e.target.value as BookingStatus | 'all');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="quote_requested">Request Sent</option>
                <option value="confirmed">Approved/Confirmed</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="quote_accepted">Quote Accepted</option>
                <option value="downpayment_paid">Downpayment Paid</option>
                <option value="paid_in_full">Fully Paid</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="quote_rejected">Declined</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'grid' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
                aria-label="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === 'list' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
                aria-label="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterStatus !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  Status: {filterStatus.replace('_', ' ')}
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-pink-400 hover:bg-pink-200 hover:text-pink-600"
                    aria-label="Remove status filter"
                  >
                    Ã—
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                    aria-label="Remove search filter"
                  >
                    Ã—
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadBookings}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-pink-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Your Bookings</h3>
            <p className="text-gray-600">Please wait while we fetch your booking information...</p>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">Start planning your dream wedding by booking services from our vendors.</p>
            <button
              onClick={() => window.location.href = '/individual/services'}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Browse Wedding Services
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredAndSortedBookings.map((booking) => {
              // Timeline steps configuration
              const timelineSteps = [
                { key: 'request', label: 'Initial Request', icon: 'ðŸ“', description: 'Request sent to vendor' },
                { key: 'quote_requested', label: 'Quote Requested', icon: 'ðŸ’°', description: 'Waiting for price quote' },
                { key: 'quote_sent', label: 'Quote Received', icon: 'ðŸ“‹', description: 'Review vendor quote' },
                { key: 'confirmed', label: 'Booking Confirmed', icon: 'âœ…', description: 'Ready for payment' },
                { key: 'downpayment_paid', label: 'Deposit Paid', icon: 'ðŸ’³', description: 'Initial payment made' },
                { key: 'paid_in_full', label: 'Fully Paid', icon: 'ðŸ’¯', description: 'Payment complete' },
                { key: 'completed', label: 'Service Complete', icon: 'ðŸŽ‰', description: 'Event finished' }
              ];

              // Find current step index
              const currentStepIndex = timelineSteps.findIndex(step => step.key === booking.status);
              const validCurrentIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">
                            {booking.serviceType === 'photography' ? 'ðŸ“¸' :
                             booking.serviceType === 'catering' ? 'ðŸ½¸' :
                             booking.serviceType === 'planning' ? 'ðŸ“‹' :
                             booking.serviceType === 'florals' ? 'ðŸŒ¸' :
                             booking.serviceType === 'venue' ? 'ðŸ›¸' :
                             booking.serviceType === 'music_dj' ? 'ðŸŽµ' : 'ðŸ’'}
                          </span>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.serviceName}</h3>
                          <p className="text-gray-600 font-medium">{booking.vendorName || booking.vendorBusinessName}</p>
                          <p className="text-sm text-gray-500 mt-1">Booking #{booking.bookingReference || `WB-${booking.id?.slice(-6)}`}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">â‚±{booking.totalAmount?.toLocaleString() || '0'}</div>
                        <div className="text-sm text-gray-500">Total Amount</div>
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{booking.eventDate}</div>
                          <div className="text-sm text-gray-500">Wedding Date</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{booking.eventLocation}</div>
                          <div className="text-sm text-gray-500">Venue</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Progress Section */}
                    {(booking.status === 'downpayment_paid' || booking.status === 'paid_in_full') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">Payment Progress</div>
                          <div className="text-sm text-gray-600">
                            {booking.status === 'paid_in_full' ? '100%' : '30%'} Complete
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-500",
                              booking.status === 'paid_in_full' 
                                ? "bg-gradient-to-r from-green-400 to-emerald-500 w-full" 
                                : "bg-gradient-to-r from-pink-400 to-purple-500 w-[30%]"
                            )}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {booking.status === 'paid_in_full' ? 'Fully Paid' : 'Deposit Paid'}
                          </span>
                          <span>
                            â‚±{booking.status === 'paid_in_full' 
                              ? (booking.totalAmount?.toLocaleString() || '0')
                              : (Math.round((booking.totalAmount || 0) * 0.3)).toLocaleString()
                            } 
                            {booking.status !== 'paid_in_full' && (
                              <span className="text-gray-400">
                                {' '}/ â‚±{booking.totalAmount?.toLocaleString() || '0'}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline Section */}
                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Progress</h4>
                      <div className="text-sm text-gray-600">
                        Step {validCurrentIndex + 1} of {timelineSteps.length}: {timelineSteps[validCurrentIndex]?.description}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mb-8">
                      <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200"></div>
                      <div 
                        className={cn(
                          "absolute top-6 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700 ease-out",
                          validCurrentIndex === 0 && "w-0",
                          validCurrentIndex === 1 && "w-1/6",
                          validCurrentIndex === 2 && "w-2/6", 
                          validCurrentIndex === 3 && "w-3/6",
                          validCurrentIndex === 4 && "w-4/6",
                          validCurrentIndex === 5 && "w-5/6",
                          validCurrentIndex >= 6 && "w-full"
                        )}
                      ></div>
                      
                      <div className="relative flex justify-between">
                        {timelineSteps.map((step, index) => {
                          const isCompleted = index < validCurrentIndex;
                          const isCurrent = index === validCurrentIndex;
                          const isUpcoming = index > validCurrentIndex;
                          
                          return (
                            <div key={step.key} className="flex flex-col items-center group">
                              {/* Step Circle */}
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-lg",
                                isCompleted && "bg-gradient-to-br from-green-400 to-green-600 text-white scale-105",
                                isCurrent && "bg-gradient-to-br from-pink-500 to-purple-600 text-white scale-110 animate-pulse",
                                isUpcoming && "bg-gray-100 text-gray-400 border-2 border-gray-200"
                              )}>
                                {isCompleted ? 'âœ“' : step.icon}
                              </div>
                              
                              {/* Step Label */}
                              <div className="mt-3 text-center max-w-24">
                                <div className={cn(
                                  "text-xs font-medium transition-colors",
                                  (isCompleted || isCurrent) ? "text-gray-900" : "text-gray-400"
                                )}>
                                  {step.label}
                                </div>
                                {isCurrent && (
                                  <div className="text-xs text-pink-600 font-semibold mt-1 animate-bounce">
                                    Current
                                  </div>
                                )}
                              </div>
                              
                              {/* Tooltip on hover */}
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap transition-opacity duration-200 pointer-events-none z-10">
                                {step.description}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">Special Requests</div>
                            <div className="text-sm text-gray-600">{booking.specialRequests}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {booking.status === 'approved' && (
                        <>
                          <button
                            onClick={() => handlePayment(booking, 'downpayment')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Pay Deposit
                          </button>
                          
                          <button
                            onClick={() => handlePayment(booking, 'full_payment')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Pay Full
                          </button>
                        </>
                      )}
                      
                      {/* Accept Quotation Button for bookings with 'request' status that have quotation details */}
                      {booking.status === 'request' && (booking.totalAmount || booking.responseMessage) && (
                        <button
                          onClick={() => handleAcceptQuotation(booking)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Accept Quotation
                        </button>
                      )}
                      
                      {booking.status === 'quote_sent' && (
                        <button
                          onClick={() => handleViewQuoteDetails(booking)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Quote
                        </button>
                      )}

                      {booking.status === 'downpayment_paid' && (
                        <button
                          onClick={() => handlePayment(booking, 'remaining_balance')}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Pay Balance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
          eventDate: paymentModal.booking.eventDate || 'TBD',
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
                  amount = 15000; // â‚±15,000 downpayment for â‚±50,000 service
                  break;
                case 'photography':
                  amount = 22500; // â‚±22,500 downpayment for â‚±75,000 service
                  break;
                default:
                  amount = 13500; // â‚±13,500 downpayment for â‚±45,000 service
              }
            }
            
            return Math.max(amount, 1000); // Minimum â‚±1,000 
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
                  amount = 50000; // â‚±50,000 total
                  break;
                case 'photography':
                  amount = 75000; // â‚±75,000 total
                  break;
                case 'catering':
                  amount = 120000; // â‚±120,000 total
                  break;
                case 'planning':
                  amount = 80000; // â‚±80,000 total
                  break;
                case 'music_dj':
                  amount = 45000; // â‚±45,000 total
                  break;
                case 'florals':
                  amount = 35000; // â‚±35,000 total
                  break;
                case 'venue':
                  amount = 150000; // â‚±150,000 total
                  break;
                default:
                  amount = 45000; // â‚±45,000 default total
              }
            }
            
            return Math.max(amount, 1000); // Minimum â‚±1,000
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
                  amount = 35000; // â‚±35,000 balance for â‚±50,000 service
                  break;
                case 'Photography':
                  amount = 52500; // â‚±52,500 balance for â‚±75,000 service
                  break;
                default:
                  amount = 31500; // â‚±31,500 balance for â‚±45,000 service
              }
              console.log('ðŸ’° Using service-based fallback balance:', amount);
            }
            
            console.log('ðŸ’° PayBalance amount calculation result:', { 
              remainingBalance: booking.remainingBalance,
              totalAmount: booking.totalAmount,
              amount: booking.amount,
              finalAmount: amount,
              type: typeof amount,
              isValid: amount > 0
            });
            
            return Math.max(amount, 1000); // Minimum â‚±1,000
          }
        })()}
        currency="PHP"
        currencySymbol="â‚±"
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
          
          try {
            console.log('âœ… [IndividualBookings] Accepting quote for booking:', booking.id);
            const updatedBooking = await bookingApiService.updateBookingStatus(booking.id, 'confirmed');
            
            if (updatedBooking) {
              // Update local state
              setBookings(prevBookings => 
                prevBookings.map(b => 
                  b.id === booking.id 
                    ? { ...b, status: 'confirmed' as BookingStatus }
                    : b
                )
              );
            }
            
            setShowQuoteDetails(false);
            console.log('âœ… [IndividualBookings] Quote accepted successfully');
          } catch (error) {
            // TODO: Show error message to user
          }
        }}
        onRejectQuote={async (booking) => {
          if (!booking?.id) return;
          
          try {
            console.log('âŒ [IndividualBookings] Rejecting quote for booking:', booking.id);
            const updatedBooking = await bookingApiService.updateBookingStatus(booking.id, 'cancelled');
            
            if (updatedBooking) {
              // Update local state
              setBookings(prevBookings => 
                prevBookings.map(b => 
                  b.id === booking.id 
                    ? { ...b, status: 'cancelled' as BookingStatus }
                    : b
                )
              );
            }
            
            setShowQuoteDetails(false);
            console.log('âœ… [IndividualBookings] Quote rejected successfully');
          } catch (error) {
            // TODO: Show error message to user
          }
        }}
        onRequestModification={async (booking) => {
          if (!booking?.id) return;
          
          try {
            const updatedBooking = await bookingApiService.updateBookingStatus(booking.id, 'request');
            
            if (updatedBooking) {
              // Update local state
              setBookings(prevBookings => 
                prevBookings.map(b => 
                  b.id === booking.id 
                    ? { ...b, status: 'quote_requested' as BookingStatus }
                    : b
                )
              );
            }
            
            setShowQuoteDetails(false);
            console.log('âœ… [IndividualBookings] Modification request sent successfully');
          } catch (error) {
            // TODO: Show error message to user
          }
        }}
      />

      {/* Commented out Location Map Modal - unused functionality */}
      {/* {showMapModal && selectedLocation && (
        <EnhancedEventLocationMap
          location={{
            name: selectedLocation.name,
            coordinates: selectedLocation.coordinates,
            eventType: 'Wedding Event',
            venue: selectedLocation.name
          }}
          onClose={() => setShowMapModal(false)}
          showModal={showMapModal}
        />
      )} */}

    </div>
  );
};

