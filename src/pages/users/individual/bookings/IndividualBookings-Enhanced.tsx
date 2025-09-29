import React, { useState, useEffect, useCallback } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';

// Import enhanced booking components
import { 
  EnhancedBookingList, 
  EnhancedBookingStats,
  type EnhancedBooking,
  type BookingStats
} from '../../../../shared/components/bookings';

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
  
  // State management
  const [bookings, setBookings] = useState<EnhancedBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  
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
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 transform transition-all duration-300 max-w-md';
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

      await response.json();
      
      // Refresh bookings to show updated status
      await loadBookings();
      
      // Show success message
      alert('Quotation accepted successfully! You can now proceed with payment.');
      
      console.log('✅ [AcceptQuotation] Successfully accepted quotation for booking:', booking.id);
    } catch (error) {
      console.error('❌ [AcceptQuotation] Error accepting quotation:', error);
      alert('Failed to accept quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                {loading ? 'Loading...' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            
            <div className="text-right">
              <button
                onClick={() => window.location.href = '/individual/services'}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                + Book Service
              </button>
            </div>
          </div>
        </div>

        {/* Booking Statistics */}
        {bookings.length > 0 && (
          <EnhancedBookingStats
            stats={{
              totalBookings: bookings.length,
              totalRevenue: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
              pendingQuotes: bookings.filter(b => b.status === 'quote_requested').length,
              confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
              completedBookings: bookings.filter(b => b.status === 'completed').length,
              cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
              averageBookingValue: bookings.length > 0 ? bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) / bookings.length : 0,
              monthlyGrowth: 15, // Mock data - would come from API
              revenueGrowth: 23, // Mock data - would come from API
              upcomingEvents: bookings.filter(b => b.daysUntilEvent && b.daysUntilEvent > 0 && b.daysUntilEvent <= 30).length
            }}
            userType="individual"
            loading={loading}
          />
        )}

        {/* Enhanced Booking List */}
        <EnhancedBookingList
          bookings={bookings.map(booking => ({
            ...booking,
            coupleName: user?.name || 'You',
            clientName: user?.name || 'You'
          }))}
          userType="individual"
          loading={loading}
          onRefresh={loadBookings}
          onViewDetails={(booking) => {
            setSelectedBooking(booking as any);
            setShowDetails(true);
          }}
          onAcceptQuote={handleAcceptQuotation}
          onPayment={handlePayment}
          onContact={(booking) => {
            if (booking.vendorPhone) {
              window.open(`tel:${booking.vendorPhone}`);
            } else if (booking.vendorEmail) {
              window.open(`mailto:${booking.vendorEmail}`);
            }
          }}
          onExport={() => {
            // TODO: Implement booking export functionality
            console.log('Export bookings requested');
          }}
        />

        {/* Error Display */}
        {error && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
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
          
          try {
            console.log('✅ [IndividualBookings] Accepting quote for booking:', booking.id);
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
              
              console.log('✅ [IndividualBookings] Booking status updated to confirmed');
              setShowQuoteDetails(false);
            }
          } catch (error) {
            console.error('❌ [IndividualBookings] Error accepting quote:', error);
          }
        }}
        onRejectQuote={async (booking) => {
          if (!booking?.id) return;
          
          try {
            console.log('❌ [IndividualBookings] Rejecting quote for booking:', booking.id);
            const updatedBooking = await bookingApiService.updateBookingStatus(booking.id, 'quote_rejected');
            
            if (updatedBooking) {
              // Update local state
              setBookings(prevBookings => 
                prevBookings.map(b => 
                  b.id === booking.id 
                    ? { ...b, status: 'quote_rejected' as BookingStatus }
                    : b
                )
              );
              
              console.log('❌ [IndividualBookings] Booking status updated to quote_rejected');
              setShowQuoteDetails(false);
            }
          } catch (error) {
            console.error('❌ [IndividualBookings] Error rejecting quote:', error);
          }
        }}
        onRequestModification={async (booking) => {
          if (!booking?.id) return;
          
          try {
            console.log('🔄 [IndividualBookings] Requesting modification for booking:', booking.id);
            // TODO: Implement quote modification request
            alert('Quote modification request sent to vendor.');
            setShowQuoteDetails(false);
          } catch (error) {
            console.error('❌ [IndividualBookings] Error requesting modification:', error);
          }
        }}
      />
    </div>
  );
};
