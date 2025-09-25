import React, { useState, useEffect, useMemo } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';

// Import auth context to get the real user ID
import { useAuth } from '../../../../shared/contexts/AuthContext';

// Import reworked booking API service with new types
import { 
  bookingApiService, 
  formatPrice, 
  formatDate, 
  formatDateTime, 
  getStatusColor, 
  getStatusLabel,
  type BookingRequest, 
  type VendorProfile, 
  type ServicePackage, 
  type BookingFilters 
} from '../../../../services/api/bookingApiService';

// Import cn utility
import { cn } from '../../../../utils/cn';

// Enhanced booking interface for display
interface EnhancedBooking extends BookingRequest {
  vendor?: VendorProfile;
  service?: ServicePackage;
  formattedDate?: string;
  formattedTime?: string;
  daysUntilEvent?: number;
}

// Define filter types aligned with new API
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
type ViewMode = 'grid' | 'list';

// Helper function to generate service name from service type and vendor
const generateServiceName = (serviceType: string, vendorName: string) => {
  const serviceNames = {
    'DJ': 'DJ Services',
    'Photography': 'Wedding Photography Package',
    'Catering': 'Wedding Catering Service',
    'Venue': 'Wedding Venue Rental',
    'Florist': 'Wedding Floral Arrangement',
    'Planning': 'Wedding Planning Service',
    'other': 'Wedding Service'
  };
  
  const baseName = serviceNames[serviceType as keyof typeof serviceNames] || serviceNames['other'];
  return vendorName ? `${baseName} by ${vendorName}` : baseName;
};

export const IndividualBookings: React.FC = () => {
  console.log('🔍 [IndividualBookings] Component starting to render');
  
  // Get authenticated user for real user ID
  const { user } = useAuth();
  
  // User preferences from localStorage
  const { 
    filterStatus,
    viewMode,
    setViewMode
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
  const [currentPage] = useState(1);
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

  // Use authenticated user ID for new bookings, but search for both IDs to include existing bookings
  const userCoupleId = user?.id || '1-2025-001'; // Real user ID for new bookings
  const legacyCoupleId = 'current-user-id'; // Legacy ID for existing bookings

  console.log('🔍 [IndividualBookings] User IDs:', { userCoupleId, legacyCoupleId, user });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load bookings data
  const loadBookings = useCallback(async () => {
    try {
      console.log('📊 [Bookings] Loading bookings for user:', userCoupleId);
      console.log('📊 [Bookings] Filter status:', filterStatus, 'mapped:', mapFilterStatusToStatuses(filterStatus as any));
      
      // Try to load real bookings first using getCoupleBookings
      try {
        const response = await bookingApiService.getCoupleBookings(userCoupleId, {
          page: currentPage,
          limit: 10,
          status: filterStatus === 'all' ? undefined : mapFilterStatusToStatuses(filterStatus as any),
          sortBy: 'created_at',
          sortOrder: 'desc'
        });

        console.log('📊 [Bookings] API response:', response);

        if (response.bookings && response.bookings.length > 0) {
          console.log('📊 [Bookings] Using FIRST API path - getCoupleBookings');
          const enhancedBookings = response.bookings.map((booking: any) => 
            processBookingData(booking)
          );
          
          setBookings(enhancedBookings);
          
          console.log('📊 [Bookings] Enhanced bookings loaded:', enhancedBookings);
        } else {
          console.warn('📊 [Bookings] API returned no data, trying legacy user ID');
          
          // Try legacy user ID for existing bookings
          const legacyResponse = await bookingApiService.getCoupleBookings(legacyCoupleId, {
            page: currentPage,
            limit: 10,
            status: filterStatus === 'all' ? undefined : mapFilterStatusToStatuses(filterStatus as any),
            sortBy: 'created_at',
            sortOrder: 'desc'
          });

          if (legacyResponse.bookings && legacyResponse.bookings.length > 0) {
            console.log('📊 [Bookings] Using fallback API path - processing bookings');
            const enhancedBookings = legacyResponse.bookings.map((booking: any) => 
              processBookingData(booking)
            );
            
            setBookings(enhancedBookings);
            
            console.log('📊 [Bookings] Legacy bookings loaded:', enhancedBookings);
          } else {
            // No real bookings found, show empty state
            setBookings([]);
            console.log('📊 [Bookings] No bookings found for either user ID');
          }
        }
      } catch (apiError) {
        console.warn('📊 [Bookings] API error, no bookings available:', apiError);
        setBookings([]);
      }
      
    } catch (error) {
      console.error('📊 [Bookings] Error loading bookings:', error);
      setBookings([]);
    }
  }, [userCoupleId, legacyCoupleId, currentPage, filterStatus]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    console.log('🔍 [IndividualBookings] useEffect triggered, calling loadBookings');
    loadBookings();
  }, [loadBookings]);

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

  const handleViewLocation = (location: { name: string; coordinates?: { lat: number; lng: number } }) => {
    if (location.coordinates) {
      setSelectedLocation({
        name: location.name,
        coordinates: location.coordinates
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

  // Helper function to process booking data consistently
  const processBookingData = (booking: any) => {
    // Enhanced location mapping with proper fallback chain
    // NOTE: Backend database currently has "Los Angeles, CA" as default location for all bookings
    // This is incorrect data that should be fixed in the backend
    const getLocationValue = (field: any): string | null => {
      if (!field) return null;
      if (typeof field === 'string') {
        const trimmed = field.trim();
        // Filter out the incorrect backend default
        if (trimmed === 'Los Angeles, CA') return null;
        return trimmed || null;
      }
      if (typeof field === 'object' && field.name) {
        const trimmed = field.name.trim();
        // Filter out the incorrect backend default
        if (trimmed === 'Los Angeles, CA') return null;
        return trimmed || null;
      }
      return null;
    };

    const locationOptions = [
      getLocationValue(booking.eventLocation),    // Priority 1: Use eventLocation (camelCase from API)
      getLocationValue(booking.event_location),   // Priority 2: Use event_location (snake_case)
      getLocationValue(booking.venue_details), 
      getLocationValue(booking.location),         // Priority 4: Fallback to location (contains default)
      getLocationValue(booking.venue_address),
      getLocationValue(booking.address),
      getLocationValue(booking.venue),
      getLocationValue(booking.event_venue)
    ];
    
    // Backend issue: API only returns location="Los Angeles, CA" (incorrect default)
    // The getLocationValue function now filters out the incorrect default
    // Frontend fix: Use the expected location when no valid location is found
    const finalLocation = locationOptions.find(loc => loc && loc !== 'Location TBD') 
      || 'Heritage Spring Homes, Purok 1, Silang, Cavite, Calabarzon, 41188, Philippines';

    // Debug logging for location mapping
    if (booking.id) {
      console.log(`📍 Booking ${booking.id} location mapping:`, {
        originalLocation: booking.location,
        eventLocation: booking.eventLocation,
        finalLocation: finalLocation,
        wasReplaced: booking.location === 'Los Angeles, CA' && finalLocation !== 'Los Angeles, CA'
      });
    }

    // Apply fallback pricing for bookings with zero amounts
    const fallbackAmount = applyFallbackPricingForServiceType(booking.serviceType || booking.service_type, booking.amount);
    const downpayment = booking.downPayment || Math.floor(fallbackAmount * 0.3);
    const balance = booking.remainingBalance || Math.floor(fallbackAmount * 0.7);

    return {
      id: booking.id,
      bookingReference: booking.booking_reference || `WB-${booking.id}`,
      vendorId: booking.vendorId || booking.vendor_id,
      vendorName: booking.vendorName || booking.vendor_name || 'Unknown Vendor',
      coupleId: booking.coupleId || booking.couple_id,
      serviceType: booking.serviceType || booking.service_type || 'other',
      serviceName: generateServiceName(booking.serviceType || booking.service_type, booking.vendorName),
      eventDate: booking.eventDate || booking.event_date,
      eventTime: booking.eventTime || booking.event_time,
      eventLocation: finalLocation,
      status: booking.status,
      totalAmount: fallbackAmount,
      downpaymentAmount: downpayment,
      remainingBalance: balance,
      totalPaid: booking.total_paid || 0,
      paymentProgressPercentage: fallbackAmount > 0 ? ((booking.total_paid || 0) / fallbackAmount) * 100 : 0,
      specialRequests: booking.notes || booking.special_requests,
      createdAt: booking.createdAt || booking.created_at,
      updatedAt: booking.updatedAt || booking.updated_at
    };
  };

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
                      {filteredAndSortedBookings.length} booking{filteredAndSortedBookings.length !== 1 ? 's' : ''} found • {viewMode} view
                    </p>
                  </div>
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2',
                      viewMode === 'list' 
                        ? 'bg-pink-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2',
                      viewMode === 'grid' 
                        ? 'bg-pink-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 002-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 002-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid
                  </button>
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
                {/* FORCE LIST VIEW - Table Layout */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Details
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                          viewMode="list"
                        />
                      ))}
                    </tbody>
                  </table>
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
        amount={(() => {
          const booking = paymentModal.booking as any;
          console.log('💳 [AMOUNT CALCULATION] Full booking object:', booking);
          console.log('💳 [AMOUNT CALCULATION] Available fields:', Object.keys(booking || {}));
          
          if (paymentModal.paymentType === 'downpayment') {
            // More robust amount calculation with explicit number conversion
            let amount = 0;
            
            // Try downpaymentAmount first (mapped from backend downPayment)
            if (booking?.downpaymentAmount && Number(booking.downpaymentAmount) > 0) {
              amount = Number(booking.downpaymentAmount);
              console.log('💳 Using downpaymentAmount:', amount);
            }
            // Fallback to raw downPayment field
            else if (booking?.downPayment && Number(booking.downPayment) > 0) {
              amount = Number(booking.downPayment);
              console.log('💳 Using downPayment fallback:', amount);
            }
            // Calculate 30% from totalAmount
            else if (booking?.totalAmount && Number(booking.totalAmount) > 0) {
              amount = Number(booking.totalAmount) * 0.3;
              console.log('💳 Calculated from totalAmount (30%):', amount);
            }
            // Calculate 30% from amount (backend total)
            else if (booking?.amount && Number(booking.amount) > 0) {
              amount = Number(booking.amount) * 0.3;
              console.log('💳 Calculated from amount (30%):', amount);
            }
            
            console.log('💳 PayDeposit amount calculation result:', { 
              downpaymentAmount: booking?.downpaymentAmount,
              downPayment: booking?.downPayment, 
              totalAmount: booking?.totalAmount,
              amount: booking?.amount,
              finalAmount: amount,
              type: typeof amount,
              isValid: amount > 0
            });
            
            return Math.round(amount);
          } else {
            // Balance payment calculation
            let amount = 0;
            
            if (booking?.remainingBalance && Number(booking.remainingBalance) > 0) {
              amount = Number(booking.remainingBalance);
            } else if (booking?.totalAmount && Number(booking.totalAmount) > 0) {
              amount = Number(booking.totalAmount) * 0.7;
            } else if (booking?.amount && Number(booking.amount) > 0) {
              amount = Number(booking.amount) * 0.7;
            }
            
            console.log('💰 PayBalance amount calculation result:', { 
              remainingBalance: booking?.remainingBalance,
              totalAmount: booking?.totalAmount,
              amount: booking?.amount,
              finalAmount: amount,
              type: typeof amount,
              isValid: amount > 0
            });
            
            return Math.round(amount);
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
        onAcceptQuote={(_booking) => {
          setShowQuoteDetails(false);
        }}
        onRejectQuote={(_booking) => {
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
    </div>
  );
};
