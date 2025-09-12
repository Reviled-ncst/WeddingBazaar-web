import React, { useState, useEffect } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';

// Import modular components
import {
  BookingStatsCards,
  BookingFilters,
  BookingCard,
  BookingDetailsModal
} from './components';

// Import payment components
import { PaymentModal } from '../payment/components';
import { paymentService } from '../payment/services';

// Import types
import type { 
  Booking, 
  UIBookingStats as BookingStats,
  BookingsResponse,
  FilterStatus
} from './types/booking.types';
import type { PaymentType } from '../payment/types/payment.types';

export const IndividualBookings: React.FC = () => {
  // State management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<BookingsResponse['pagination'] | null>(null);
  
  // Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null as Booking | null,
    paymentType: 'downpayment' as PaymentType,
    loading: false
  });

  // Mock couple ID - in a real app, this would come from auth context
  const coupleId = 'couple_001';

  // Data loading effects
  useEffect(() => {
    loadBookings();
    loadStats();
  }, [filterStatus, currentPage]);

  // Load bookings from API
  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        coupleId,
        page: currentPage.toString(),
        limit: '10',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/bookings/enhanced?${params.toString()}`);
      if (response.ok) {
        const data: BookingsResponse = await response.json();
        setBookings(data.bookings);
        setPagination(data.pagination);
      } else {
        console.error('Failed to load bookings');
        // Set empty state instead of mock data
        setBookings([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Set empty state instead of mock data
      setBookings([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Load stats from API
  const loadStats = async () => {
    try {
      const response = await fetch(`/api/bookings/enhanced/stats/${coupleId}?userType=couple`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to load stats');
        // Set empty stats instead of mock data
        setStats({
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalSpent: 0,
          totalPaid: 0,
          pendingPayments: 0,
          formatted: {
            totalSpent: '₱0.00',
            totalPaid: '₱0.00',
            pendingPayments: '₱0.00'
          }
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set empty stats on error
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpent: 0,
        totalPaid: 0,
        pendingPayments: 0,
        formatted: {
          totalSpent: '₱0.00',
          totalPaid: '₱0.00',
          pendingPayments: '₱0.00'
        }
      });
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = !searchQuery || 
      booking.vendorName && booking.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.bookingReference && booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Event handlers
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handlePayment = (booking: Booking, paymentType: PaymentType) => {
    setPaymentModal({
      isOpen: true,
      booking,
      paymentType,
      loading: false
    });
  };

  const handlePaymentSubmit = async (paymentData: {
    bookingId: string;
    paymentType: PaymentType;
    amount: number;
    paymentMethod: string;
  }) => {
    try {
      setPaymentModal(prev => ({ ...prev, loading: true }));

      const result = await paymentService.processPayment({
        ...paymentData,
        description: `${paymentData.paymentType} payment for booking ${paymentModal.booking?.bookingReference}`
      });

      if (result.success && result.checkoutUrl) {
        // Redirect to PayMongo checkout
        window.open(result.checkoutUrl, '_blank');
      }

      // Update booking status optimistically
      if (paymentModal.booking) {
        setBookings(prev => prev.map(booking => 
          booking.id === paymentModal.booking!.id 
            ? { 
                ...booking, 
                status: paymentData.paymentType === 'downpayment' ? 'downpayment_paid' : 'paid_in_full',
                totalPaid: (booking.totalPaid || 0) + paymentData.amount,
                remainingBalance: paymentData.paymentType === 'full_payment' ? 0 : booking.remainingBalance,
                paymentProgressPercentage: paymentData.paymentType === 'downpayment' ? 30 : 100
              }
            : booking
        ));
      }

      // Refresh stats
      loadStats();
      
      // Close modal
      setPaymentModal({ isOpen: false, booking: null, paymentType: 'downpayment', loading: false });

    } catch (error) {
      console.error('Payment submission failed:', error);
      setPaymentModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <CoupleHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600 text-lg">Track and manage your wedding service bookings</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <BookingStatsCards stats={stats} loading={loading} />
          )}

          {/* Filters */}
          <BookingFilters
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onExport={handleExport}
            totalResults={filteredBookings.length}
          />

          {/* Bookings Grid */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Start by browsing our services and making your first booking!'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <button
                    onClick={() => window.location.href = '/individual/services'}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Browse Services
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onViewDetails={handleViewDetails}
                      onPayment={handlePayment}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPrev}
                        className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNext}
                        className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
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

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, booking: null, paymentType: 'downpayment', loading: false })}
        booking={paymentModal.booking}
        paymentType={paymentModal.paymentType}
        onPaymentSubmit={handlePaymentSubmit}
        loading={paymentModal.loading}
      />
    </div>
  );
};
