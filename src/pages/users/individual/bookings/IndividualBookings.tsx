import React, { useState, useEffect, useMemo } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';

// Import modular components
import {
  BookingCard,
  BookingDetailsModal,
  QuoteDetailsModal,
  EnhancedEventLocationMap
} from './components';

// Import payment components
import { PayMongoPaymentModal } from '../../../../shared/components/PayMongoPaymentModal';

// Import auth context to get the real user ID

// Import custom hooks
import { useBookingPreferences } from './hooks';

// Import cn utility
import { cn } from '../../../../utils/cn';

import type { 
  Booking
} from './types/booking.types';
import type { PaymentType } from '../payment/types/payment.types';

export const IndividualBookings: React.FC = () => {
  // User preferences from localStorage
  const { 
    filterStatus,
    viewMode
  } = useBookingPreferences();
  
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
  const [searchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  
  // Payment modal state (updated for PayMongo)
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null as Booking | null,
    paymentType: 'downpayment' as PaymentType,
    loading: false
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Helper function for payment modal - simple handlers  
  const handlePayDeposit = (booking: EnhancedBooking) => {
    console.log('💳 [PayDeposit] Button clicked for booking:', booking.id);
    console.log('💳 [PayDeposit] Booking status:', booking.status);
    
    setPaymentModal({
      isOpen: true,
      booking: booking as any,
      paymentType: 'downpayment',
      loading: false
    });
  };

  const handlePayBalance = (booking: EnhancedBooking) => {
    console.log('💰 [PayBalance] Button clicked for booking:', booking.id);
    console.log('💰 [PayBalance] Booking status:', booking.status);
    
    setPaymentModal({
      isOpen: true,
      booking: booking as any,
      paymentType: 'remaining_balance',
      loading: false
    });
  };

  // Event handlers
  const handleViewDetails = (booking: Booking | EnhancedBooking) => {
    setSelectedBooking(booking as EnhancedBooking);
    setShowDetails(true);
  };

  const handlePayment = (booking: Booking | EnhancedBooking, paymentType: PaymentType) => {
    setPaymentModal({
      isOpen: true,
      booking: booking as EnhancedBooking,
      paymentType,
      loading: false
    });
  };

  const handleViewLocation = (booking: EnhancedBooking) => {
    if (booking.eventCoordinates) {
      setSelectedLocation({
        name: booking.eventLocation || 'Event Location',
        coordinates: booking.eventCoordinates
      });
      setShowMapModal(true);
    }
  };

  // PayMongo payment success handler
  const handlePayMongoPaymentSuccess = async (paymentData: any) => {
    try {
      console.log('💳 PayMongo payment success:', paymentData);

      // Update booking status optimistically
      if (paymentModal.booking) {
        const amount = paymentData.amount || paymentData.original_amount || 0;
        const paymentType = paymentModal.paymentType;
        
        setBookings(prev => prev.map(booking => 
          booking.id === paymentModal.booking!.id 
            ? { 
                ...booking, 
                status: paymentType === 'downpayment' ? 'downpayment_paid' : 'paid_in_full',
                totalPaid: (booking.totalPaid || 0) + amount,
                remainingBalance: paymentType === 'full_payment' ? 0 : booking.remainingBalance,
                paymentProgressPercentage: paymentType === 'downpayment' ? 30 : 100
              }
            : booking
        ));
      }

      // Close modal
      setPaymentModal({ isOpen: false, booking: null, paymentType: 'downpayment', loading: false });

    } catch (error) {
      console.error('PayMongo payment success handling failed:', error);
    }
  };

  // Handle booking updates from actions
  const handleBookingUpdate = (updatedBooking: EnhancedBooking) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === updatedBooking.id 
          ? { ...booking, ...updatedBooking }
          : booking
      )
    );
  };

  // Handle viewing quote details
  const handleViewQuoteDetails = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setShowQuoteDetails(true);
  };

  // Add test bookings for debugging
  const addTestBookings = () => {
    const testBookings: EnhancedBooking[] = [
      {
        id: 'test-1',
        bookingReference: 'WB-TEST-001',
        vendorId: 'vendor-test-1',
        vendorName: 'Perfect Moments Photography',
        coupleId: 'couple1',
        serviceType: 'photography',
        serviceName: 'Wedding Photography Package',
        eventDate: '2024-03-15',
        eventTime: '14:00',
        eventLocation: 'Manila Hotel',
        status: 'confirmed', // This will show payment buttons
        totalAmount: 50000,
        downpaymentAmount: 15000,
        remainingBalance: 35000,
        specialRequests: 'Test booking with confirmed status - should show Pay Deposit button',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'test-2',
        bookingReference: 'WB-TEST-002',
        vendorId: 'vendor-test-2',
        vendorName: 'Elegant Catering Services',
        coupleId: 'couple1',
        serviceType: 'catering',
        serviceName: 'Wedding Reception Catering',
        eventDate: '2024-03-15',
        eventTime: '18:00',
        eventLocation: 'Manila Hotel',
        status: 'downpayment_paid', // This will show Pay Balance button
        totalAmount: 120000,
        downpaymentAmount: 36000,
        remainingBalance: 84000,
        totalPaid: 36000,
        paymentProgressPercentage: 30,
        specialRequests: 'Test booking with downpayment paid - should show Pay Balance button',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setBookings(testBookings);
    console.log('🧪 [Test] Added test bookings with payment buttons:', testBookings);
  };

  // Enhanced filter and sort function - memoized for performance
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const query = debouncedSearchQuery.toLowerCase();
      const matchesSearch = !query || 
        (booking.vendorBusinessName && booking.vendorBusinessName.toLowerCase().includes(query)) ||
        (booking.vendorName && booking.vendorName.toLowerCase().includes(query)) ||
        (booking.serviceType && booking.serviceType.toLowerCase().includes(query)) ||
        (booking.serviceName && booking.serviceName.toLowerCase().includes(query));
      
      return matchesStatus && matchesSearch;
    });

    return filtered;
  }, [bookings, filterStatus, debouncedSearchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <CoupleHeader />
      
      <main className="flex-1 pb-12">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="bg-white rounded-3xl shadow-lg border border-pink-200 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    My Bookings
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">Track and manage your wedding service bookings</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.href = '/individual/services'}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200 flex items-center gap-2 shadow-lg font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Book Service
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Development Test Button */}
          {process.env.NODE_ENV === 'development' && bookings.length === 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium text-lg">Development Mode</p>
                  <p className="text-yellow-700 mt-1">No bookings found. Test payment modal and booking actions:</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addTestBookings}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors shadow-lg"
                  >
                    Add Test Bookings
                  </button>
                  <button
                    onClick={() => {
                      console.log('🧪 [Test] Direct PayMongo modal test');
                      setPaymentModal({
                        isOpen: true,
                        booking: {
                          id: 'test-direct',
                          bookingReference: 'WB-TEST-DIRECT',
                          vendorId: 'test-vendor',
                          vendorName: 'Test Vendor',
                          coupleId: 'test-couple',
                          serviceType: 'photography',
                          serviceName: 'Test Photography Service',
                          eventDate: '2024-03-15',
                          eventTime: '14:00',
                          eventLocation: 'Test Location',
                          status: 'confirmed',
                          totalAmount: 50000,
                          downpaymentAmount: 15000,
                          remainingBalance: 35000,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        } as any,
                        paymentType: 'downpayment',
                        loading: false
                      });
                    }}
                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors shadow-lg"
                  >
                    Test PayMongo Modal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Bookings Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-pink-200/50 overflow-hidden">
            {/* Section Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-pink-50 via-white to-rose-50 border-b border-pink-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-6L5 19" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
                    <p className="text-gray-600">
                      {filteredAndSortedBookings.length} booking{filteredAndSortedBookings.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {filteredAndSortedBookings.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="h-10 w-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Start planning your dream wedding by booking services from our vendors.
                </p>
                <button
                  onClick={() => window.location.href = '/individual/services'}
                  className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200 font-semibold text-lg shadow-lg"
                >
                  Browse Wedding Services
                </button>
              </div>
            ) : (
              <div className="p-8">
                {/* Enhanced Grid Layout */}
                <div className={cn(
                  "grid gap-8",
                  viewMode === 'grid' 
                    ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3' 
                    : 'grid-cols-1 max-w-6xl mx-auto'
                )}>
                  {filteredAndSortedBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onViewDetails={handleViewDetails}
                      onBookingUpdate={handleBookingUpdate}
                      onPayment={handlePayment}
                      onPayDeposit={handlePayDeposit}
                      onPayBalance={handlePayBalance}
                      onViewLocation={handleViewLocation}
                      onViewQuoteDetails={handleViewQuoteDetails}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
        amount={paymentModal.paymentType === 'downpayment' 
          ? (paymentModal.booking as any)?.downpaymentAmount || 0 
          : (paymentModal.booking as any)?.remainingBalance || 0
        }
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
        onAcceptQuote={() => {
          setShowQuoteDetails(false);
        }}
        onRejectQuote={() => {
          setShowQuoteDetails(false);
        }}
        onRequestModification={(_booking) => {
          setShowQuoteDetails(false);
        }}
      />

      {/* Enhanced Location Map Modal */}
      {showMapModal && selectedLocation && (
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
      )}

      {/* Development Debug Overlay */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50">
          <div>Modal Open: {paymentModal.isOpen ? '✅' : '❌'}</div>
          <div>Modal Booking: {paymentModal.booking?.id || 'None'}</div>
          <div>Payment Type: {paymentModal.paymentType}</div>
          <div>Bookings Count: {bookings.length}</div>
          {bookings.length > 0 && (
            <div>First Booking Status: {bookings[0]?.status}</div>
          )}
        </div>
      )}
    </div>
  );
};
