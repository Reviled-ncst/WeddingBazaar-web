import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';

// Import modular components
import {
  BookingStatsCards,
  BookingFilters,
  BookingCard,
  BookingDetailsModal,
  EnhancedEventLocationMap
} from './components';

// Import payment components
import { PaymentModal } from '../payment/components';
import { paymentService } from '../payment/services';

// Import auth context to get the real user ID
import { useAuth } from '../../../../shared/contexts/AuthContext';

// Import comprehensive booking API service
import { bookingApiService } from '../../../../services/api/bookingApiService';

// Import custom hooks
import { useBookingPreferences } from './hooks';

// Import cn utility
import { cn } from '../../../../utils/cn';

// Import types - now using comprehensive types with UI extensions
import { 
  mapToUIBooking,
  mapFilterStatusToStatuses
} from './types/booking.types';
import type { 
  Booking, 
  UIBookingStats as BookingStats, 
  BookingsResponse
} from './types/booking.types';
import type { PaymentType } from '../payment/types/payment.types';

export const IndividualBookings: React.FC = () => {
  // Get authenticated user for real user ID
  const { user } = useAuth();
  
  // User preferences from localStorage
  const { 
    filterStatus, 
    setFilterStatus, 
    viewMode,
    setViewMode,
    sortBy,
    sortOrder
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<BookingsResponse['pagination'] | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  
  // Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null as Booking | null,
    paymentType: 'downpayment' as PaymentType,
    loading: false
  });

  // Use authenticated user ID for new bookings, but search for both IDs to include existing bookings
  const userCoupleId = user?.id || '1-2025-001'; // Real user ID for new bookings
  const legacyCoupleId = 'current-user-id'; // Legacy ID for existing bookings

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Function to enhance booking data with better presentation
  const enhanceBookingData = (booking: any): EnhancedBooking => {
    // Debug logging to see actual vendor and service data
    console.log('🎭 [Image Debug] Raw booking data:', {
      // IDs
      id: booking.id,
      service_id: booking.service_id,
      serviceId: booking.serviceId,
      // Vendor images
      vendor_image: booking.vendor_image,
      vendor_photo: booking.vendor_photo,
      vendorImage: booking.vendorImage,
      featured_image_url: booking.featured_image_url,
      // Service images
      service_image: booking.service_image,
      image: booking.image,
      serviceImage: booking.serviceImage,
      gallery: booking.gallery,
      images: booking.images,
      // Names
      vendor_business_name: booking.vendor_business_name,
      vendor_name: booking.vendor_name,
      vendorName: booking.vendorName,
      serviceName: booking.serviceName,
      serviceType: booking.serviceType
    });

    // Enhanced vendor information mapping
    const getVendorInfo = (booking: any) => {
      return {
        businessName: booking.vendor_business_name || 
                     booking.vendor_name || 
                     booking.vendorName || 
                     `${booking.serviceType} Vendor`,
        category: booking.vendor_category || 
                 booking.service_category || 
                 booking.serviceType || 
                 'Wedding Service',
        image: booking.vendor_image || 
               booking.vendor_photo || 
               booking.vendorImage || 
               booking.featured_image_url ||
               `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.vendor_business_name || booking.vendor_name || booking.vendorName || 'Vendor')}&background=f43f5e&color=ffffff&size=200`,
        rating: booking.vendor_rating || 
               booking.rating || 
               4.5,
        phone: booking.vendor_phone || 
               booking.contact_phone || 
               booking.vendorPhone || 
               null,
        email: booking.vendor_email || 
               booking.contact_email || 
               booking.vendorEmail || 
               null
      };
    };

    // Enhanced service information mapping
    const getServiceInfo = (booking: any) => {
      // Handle service gallery - could be JSONB array or string
      let gallery: string[] = [];
      if (booking.gallery) {
        if (typeof booking.gallery === 'string') {
          try {
            gallery = JSON.parse(booking.gallery);
          } catch {
            gallery = [booking.gallery];
          }
        } else if (Array.isArray(booking.gallery)) {
          gallery = booking.gallery;
        }
      }
      
      // Handle service images - could be JSONB array
      if (booking.images && Array.isArray(booking.images)) {
        gallery = [...gallery, ...booking.images];
      }

      // Get primary service image
      const primaryImage = booking.service_image || 
                          booking.image || 
                          booking.serviceImage ||
                          (gallery.length > 0 ? gallery[0] : null) ||
                          `https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`;

      return {
        image: primaryImage,
        gallery: gallery.filter(img => img && typeof img === 'string')
      };
    };

    // Format date and time with better presentation
    const eventDate = new Date(booking.event_date);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    const vendorInfo = getVendorInfo(booking);
    const serviceInfo = getServiceInfo(booking);
    const baseBooking = mapToUIBooking(booking);

    // Debug logging for final vendor and service info
    console.log('🎭 [Image Debug] Final vendor info:', {
      businessName: vendorInfo.businessName,
      vendorImage: vendorInfo.image,
      category: vendorInfo.category,
      rating: vendorInfo.rating
    });
    
    console.log('🖼️ [Image Debug] Final service info:', {
      serviceImage: serviceInfo.image,
      galleryCount: serviceInfo.gallery.length,
      gallery: serviceInfo.gallery.slice(0, 3) // Show first 3 for debugging
    });

    // Simple geocoding for Philippine locations
    const getCoordinatesFromLocation = (location: string): { lat: number; lng: number } | null => {
      // Default coordinates for common Philippine wedding venues
      const locationMap: Record<string, { lat: number; lng: number }> = {
        'heritage spring homes': { lat: 14.2306, lng: 120.9856 }, // Silang, Cavite
        'manila': { lat: 14.5995, lng: 120.9842 },
        'quezon city': { lat: 14.6760, lng: 121.0437 },
        'makati': { lat: 14.5547, lng: 121.0244 },
        'taguig': { lat: 14.5176, lng: 121.0509 },
        'pasig': { lat: 14.5764, lng: 121.0851 },
        'cebu': { lat: 10.3157, lng: 123.8854 },
        'davao': { lat: 7.1907, lng: 125.4553 },
        'baguio': { lat: 16.4023, lng: 120.5960 }
      };
      
      const lowercaseLocation = location.toLowerCase();
      for (const [key, coords] of Object.entries(locationMap)) {
        if (lowercaseLocation.includes(key)) {
          return coords;
        }
      }
      
      // Default to Manila if no match found
      return { lat: 14.5995, lng: 120.9842 };
    };

    // Use the geocoding utility for accurate location mapping
    const eventLocation = booking.event_location || booking.eventLocation || '';
    const eventCoordinates = getCoordinatesFromLocation(eventLocation) || undefined;

    const enhanced: EnhancedBooking = {
      ...baseBooking,
      vendorBusinessName: vendorInfo.businessName,
      vendorCategory: vendorInfo.category,
      vendorImage: vendorInfo.image,
      vendorRating: vendorInfo.rating,
      vendorPhone: vendorInfo.phone,
      vendorEmail: vendorInfo.email,
      serviceImage: serviceInfo.image,
      serviceGallery: serviceInfo.gallery,
      serviceId: booking.service_id || booking.serviceId || null, // Map service ID for display
      eventCoordinates,
      formattedEventDate: eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      formattedEventTime: booking.event_time ? 
        new Date(`1970-01-01T${booking.event_time}`).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }) : 'Time TBD',
      daysUntilEvent: daysUntilEvent > 0 ? daysUntilEvent : 0
    };

    return enhanced;
  };

  // Data loading effects
  useEffect(() => {
    console.log('🔄 [IndividualBookings] Effect triggered with:', { userCoupleId, legacyCoupleId, filterStatus, currentPage });
    if (userCoupleId) {
      loadBookings();
      loadStats();
    }
  }, [filterStatus, currentPage, userCoupleId, legacyCoupleId]);

  // Listen for booking creation events
  useEffect(() => {
    const handleBookingCreated = () => {
      console.log('🎉 [IndividualBookings] Booking created event received, refreshing data');
      loadBookings();
      loadStats();
    };

    // Listen for custom booking created event
    window.addEventListener('bookingCreated', handleBookingCreated);
    
    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
    };
  }, [userCoupleId, legacyCoupleId]);

  // Retry function with exponential backoff
  const retryWithBackoff = useCallback(async (fn: () => Promise<void>, maxRetries = 3) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        await fn();
        setError(null);
        setRetryCount(0);
        return;
      } catch (err) {
        if (i === maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(errorMessage);
          setRetryCount(i + 1);
          throw err;
        }
        // Exponential backoff: wait 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }, []);

  // Enhanced refresh function with retry logic
  const refreshBookings = useCallback(async () => {
    console.log('🔄 [IndividualBookings] Manual refresh triggered');
    setError(null);
    try {
      await retryWithBackoff(async () => {
        await Promise.all([loadBookings(), loadStats()]);
      });
    } catch (err) {
      console.error('💥 [IndividualBookings] Refresh failed after retries:', err);
    }
  }, [retryWithBackoff]);

  // Load bookings from comprehensive API
  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('📥 [IndividualBookings] Loading bookings with comprehensive API for users:', { userCoupleId, legacyCoupleId });
      
      // Load bookings for both the real user ID and the legacy ID to include existing bookings
      const [userBookingsResponse, legacyBookingsResponse] = await Promise.allSettled([
        bookingApiService.getCoupleBookings(userCoupleId, {
          page: currentPage,
          limit: 10,
          status: mapFilterStatusToStatuses(filterStatus),
          sortBy: 'created_at',
          sortOrder: 'desc'
        }),
        bookingApiService.getCoupleBookings(legacyCoupleId, {
          page: 1, // Get all legacy bookings from first page
          limit: 50, // Increase limit to get all legacy bookings
          status: mapFilterStatusToStatuses(filterStatus),
          sortBy: 'created_at',
          sortOrder: 'desc'
        })
      ]);

      let allBookings: any[] = [];
      let totalCount = 0;

      // Combine bookings from both requests
      if (userBookingsResponse.status === 'fulfilled' && userBookingsResponse.value.bookings) {
        allBookings = [...allBookings, ...userBookingsResponse.value.bookings];
        totalCount += userBookingsResponse.value.total;
      }

      if (legacyBookingsResponse.status === 'fulfilled' && legacyBookingsResponse.value.bookings) {
        allBookings = [...allBookings, ...legacyBookingsResponse.value.bookings];
        totalCount += legacyBookingsResponse.value.total;
      }

      // Remove duplicates by ID (in case there are any)
      const uniqueBookings = allBookings.filter((booking, index, self) => 
        index === self.findIndex(b => b.id === booking.id)
      );

      // Sort by creation date (newest first)
      uniqueBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('✅ [IndividualBookings] Comprehensive bookings loaded successfully:', {
        userBookings: userBookingsResponse.status === 'fulfilled' ? userBookingsResponse.value.bookings?.length : 0,
        legacyBookings: legacyBookingsResponse.status === 'fulfilled' ? legacyBookingsResponse.value.bookings?.length : 0,
        totalUnique: uniqueBookings.length
      });
      
      // Enhance bookings with better data presentation
      const enhancedBookings = uniqueBookings.map(enhanceBookingData);
      setBookings(enhancedBookings);
      
      setPagination({
        page: currentPage,
        limit: 10,
        total: totalCount,
        totalPages: Math.ceil(totalCount / 10),
        hasNext: currentPage < Math.ceil(totalCount / 10),
        hasPrev: currentPage > 1
      });
      
    } catch (error) {
      console.error('💥 [IndividualBookings] Error loading bookings with comprehensive API:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      // Don't fall back to mock data - show empty state instead
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

  // Load stats from comprehensive API
  const loadStats = async () => {
    try {
      console.log('📊 [IndividualBookings] Loading stats with comprehensive API for users:', { userCoupleId, legacyCoupleId });
      
      // Load stats for both user IDs and combine them
      const [userStatsResponse, legacyStatsResponse] = await Promise.allSettled([
        bookingApiService.getBookingStats(userCoupleId),
        bookingApiService.getBookingStats(legacyCoupleId)
      ]);

      let combinedStats = {
        total_bookings: 0,
        pending_bookings: 0,
        confirmed_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        total_revenue: 0,
        pending_payments: 0
      };

      // Combine stats from both responses
      if (userStatsResponse.status === 'fulfilled') {
        const userStats = userStatsResponse.value;
        combinedStats.total_bookings += userStats.total_bookings;
        combinedStats.pending_bookings += userStats.pending_bookings;
        combinedStats.confirmed_bookings += userStats.confirmed_bookings;
        combinedStats.completed_bookings += userStats.completed_bookings;
        combinedStats.cancelled_bookings += userStats.cancelled_bookings;
        combinedStats.total_revenue += userStats.total_revenue;
        combinedStats.pending_payments += userStats.pending_payments;
      }

      if (legacyStatsResponse.status === 'fulfilled') {
        const legacyStats = legacyStatsResponse.value;
        combinedStats.total_bookings += legacyStats.total_bookings;
        combinedStats.pending_bookings += legacyStats.pending_bookings;
        combinedStats.confirmed_bookings += legacyStats.confirmed_bookings;
        combinedStats.completed_bookings += legacyStats.completed_bookings;
        combinedStats.cancelled_bookings += legacyStats.cancelled_bookings;
        combinedStats.total_revenue += legacyStats.total_revenue;
        combinedStats.pending_payments += legacyStats.pending_payments;
      }
      
      console.log('✅ [IndividualBookings] Comprehensive stats loaded:', combinedStats);
      
      // Map comprehensive stats to UI stats
      const uiStats: BookingStats = {
        totalBookings: combinedStats.total_bookings,
        pendingBookings: combinedStats.pending_bookings,
        confirmedBookings: combinedStats.confirmed_bookings,
        completedBookings: combinedStats.completed_bookings,
        cancelledBookings: combinedStats.cancelled_bookings,
        totalSpent: combinedStats.total_revenue,
        totalPaid: combinedStats.total_revenue - combinedStats.pending_payments,
        pendingPayments: combinedStats.pending_payments,
        formatted: {
          totalSpent: `₱${combinedStats.total_revenue.toLocaleString()}`,
          totalPaid: `₱${(combinedStats.total_revenue - combinedStats.pending_payments).toLocaleString()}`,
          pendingPayments: `₱${combinedStats.pending_payments.toLocaleString()}`
        }
      };
      setStats(uiStats);
    } catch (error) {
      console.error('💥 [IndividualBookings] Error loading stats with comprehensive API:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      // Don't fall back to mock stats - show zero stats instead
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

  // Enhanced filter and sort function - memoized for performance
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const query = debouncedSearchQuery.toLowerCase();
      const matchesSearch = !query || 
        (booking.vendorBusinessName && booking.vendorBusinessName.toLowerCase().includes(query)) ||
        (booking.vendorName && booking.vendorName.toLowerCase().includes(query)) ||
        (booking.serviceType && booking.serviceType.toLowerCase().includes(query)) ||
        (booking.serviceName && booking.serviceName.toLowerCase().includes(query)) ||
        (booking.vendorCategory && booking.vendorCategory.toLowerCase().includes(query)) ||
        (booking.bookingReference && booking.bookingReference.toLowerCase().includes(query)) ||
        (booking.eventLocation && booking.eventLocation.toLowerCase().includes(query));
      
      return matchesStatus && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'event_date':
          aValue = new Date(a.eventDate);
          bValue = new Date(b.eventDate);
          break;
        case 'vendor_name':
          aValue = a.vendorBusinessName || a.vendorName || '';
          bValue = b.vendorBusinessName || b.vendorName || '';
          break;
        case 'service_type':
          aValue = a.serviceType || '';
          bValue = b.serviceType || '';
          break;
        case 'total_amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'created_at':
        default:
          aValue = new Date(a.createdAt || new Date());
          bValue = new Date(b.createdAt || new Date());
          break;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [bookings, filterStatus, debouncedSearchQuery, sortBy, sortOrder]);

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
      console.log('🗺️ [Map] Opening map for location:', booking.eventLocation);
      console.log('🗺️ [Map] Coordinates:', booking.eventCoordinates);
      console.log('🗺️ [Map] Expected: Heritage Spring Homes should be at lat=14.2306, lng=120.9856 (Silang, Cavite)');
      console.log('🗺️ [Map] NOT at lat=14.5995, lng=120.9842 (Manila/Quiapo)');
      
      setSelectedLocation({
        name: booking.eventLocation || 'Event Location',
        coordinates: booking.eventCoordinates
      });
      setShowMapModal(true);
    }
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

  // Show loading state like Services page
  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <CoupleHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700">Loading your bookings...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state with retry option
  if (error && bookings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <CoupleHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Bookings</h3>
                <p className="text-gray-700 mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={refreshBookings}
                    disabled={loading}
                    className="px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? 'Retrying...' : 'Try Again'}
                  </button>
                  <button
                    onClick={() => window.location.href = '/individual/services'}
                    className="px-6 py-2 bg-white text-gray-700 border border-pink-300 rounded-xl hover:bg-pink-50 transition-colors"
                  >
                    Browse Services
                  </button>
                </div>
                {retryCount > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    Attempted {retryCount} time{retryCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <CoupleHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
                <p className="text-gray-700 text-lg">Track and manage your wedding service bookings</p>
              </div>
              <button
                onClick={refreshBookings}
                disabled={loading}
                className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Error Banner (when there are existing bookings) */}
          {error && bookings.length > 0 && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-rose-800 font-medium">Unable to refresh bookings</p>
                    <p className="text-rose-600 text-sm">{error}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshBookings}
                    disabled={loading}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 text-sm transition-colors"
                  >
                    {loading ? 'Retrying...' : 'Retry'}
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 text-rose-400 hover:text-rose-600 transition-colors"
                    title="Dismiss error"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

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
            viewMode={viewMode}
            setViewMode={setViewMode}
            onExport={handleExport}
            totalResults={filteredAndSortedBookings.length}
          />

          {/* Bookings Grid */}
          <div className="bg-white rounded-2xl shadow-lg border border-pink-200 overflow-hidden">
            <div className="p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-700">
                    {loading ? 'Loading...' : `${filteredAndSortedBookings.length} booking${filteredAndSortedBookings.length !== 1 ? 's' : ''} found`}
                  </p>
                    {searchQuery !== debouncedSearchQuery && (
                      <div className="flex items-center gap-1 text-sm text-pink-600">
                        <div className="w-3 h-3 border border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    )}
                  </div>
                </div>
                {filteredAndSortedBookings.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {searchQuery && `Filtered by: "${searchQuery}"`}
                    {filterStatus !== 'all' && ` • Status: ${filterStatus}`}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                <p className="text-gray-700">Loading your bookings...</p>
              </div>
            ) : filteredAndSortedBookings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-700 mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Start by browsing our services and making your first booking!'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <button
                    onClick={() => window.location.href = '/individual/services'}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Browse Services
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                )}>
                  {filteredAndSortedBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onViewDetails={handleViewDetails}
                      onPayment={handlePayment}
                      onViewLocation={handleViewLocation}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPrev}
                        className="px-4 py-2 border border-pink-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors text-gray-700"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNext}
                        className="px-4 py-2 border border-pink-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors text-gray-700"
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
