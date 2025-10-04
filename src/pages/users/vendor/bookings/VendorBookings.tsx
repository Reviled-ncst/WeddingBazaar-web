import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Download, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  Loader2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { VendorBookingDetailsModal } from './components/VendorBookingDetailsModal';
import { SendQuoteModal } from './components/SendQuoteModal';

// Import enhanced booking components
import { 
  EnhancedBookingCard
} from '../../../../shared/components/bookings';

// Import comprehensive booking API and types
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';
import type { 
  BookingStatus
} from '../../../../shared/types/comprehensive-booking.types';

// Import unified mapping utilities
import { 
  mapToUIBookingStats, 
  mapToUIBookingsListResponseWithLookup
} from '../../../../shared/utils/booking-data-mapping';
import type {
  UIBooking,
  UIBookingStats,
  UIBookingsListResponse
} from '../../../../shared/utils/booking-data-mapping';

// Import auth context to get the real vendor ID
import { useAuth } from '../../../../shared/contexts/AuthContext';

// Import currency formatting utility
import { formatPHP } from '../../../../utils/currency';

// Import notification system
import { useNotifications } from '../../../../shared/components/notifications/NotificationProvider';

// Import Universal Quote Acceptance Service for cross-user sync
import { UniversalQuoteAcceptanceService } from '../../../../shared/services/UniversalQuoteAcceptanceService';

// Import Automated Booking Confirmation Service for notifications
import { automatedBookingConfirmationService } from '../../../../shared/services/AutomatedBookingConfirmationService';



type FilterStatus = 'all' | BookingStatus;



// Note: Vendors do NOT process payments - they only track payment status from clients
// Payment receipts and processing are handled by individual/couple users only

export const VendorBookings: React.FC = () => {
  // Get authenticated vendor user for real vendor ID
  const { user } = useAuth();
  
  // Notification system
  const { showSuccess, showError, showInfo } = useNotifications();
  

  
  console.log('🔧 [VendorBookings] NotificationProvider context is working!');
  
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UIBookingStats | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'event_date' | 'status' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC'); // Default to DESC for latest first
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UIBookingsListResponse['pagination'] | null>(null);
  
  // Enhanced UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  
  // Use authenticated vendor ID - For vendors, user.id IS the vendor ID
  const vendorId = user?.role === 'vendor' ? user.id : (user?.vendorId || '2-2025-001');
  
  // API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  
  // Debug logging for vendor identification
  console.log('🔍 [VendorBookings] Vendor identification debug:', {
    'user?.id': user?.id,
    'user?.role': user?.role,
    'user?.vendorId': user?.vendorId, 
    'user?.businessName': user?.businessName,
    'final vendorId used': vendorId,
    'logic': user?.role === 'vendor' ? 'Using user.id as vendorId' : 'Using vendorId field or fallback'
  });

  useEffect(() => {
    console.log('🔄 [VendorBookings] Effect triggered with:', { vendorId, filterStatus, currentPage });
    // Always try to load real data first, fall back to mock if it fails
    loadBookings();
    loadStats();
  }, [filterStatus, dateRange, sortBy, sortOrder, currentPage, vendorId]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadBookings();
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Real-time updates and notifications
  useEffect(() => {
    // Poll for new data every 30 seconds
    const pollInterval = setInterval(() => {
      if (!loading) {
        console.log('🔄 [VendorBookings] Auto-refreshing data...');
        loadBookings(true); // Silent refresh
        loadStats();
        setLastUpdate(new Date());
      }
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [loading, vendorId]);

  // Listen for automated booking confirmations
  useEffect(() => {
    const cleanup = automatedBookingConfirmationService.onConfirmation((result) => {
      console.log('🎉 [VendorBookings] Automated confirmation received:', result);
      
      if (result.success) {
        showSuccess(
          'Booking Auto-Confirmed!', 
          `Booking ${result.bookingId} was automatically confirmed after downpayment. The client has been notified.`
        );
        
        // Refresh bookings to show updated status
        loadBookings(true);
        loadStats();
      } else {
        showInfo(
          'Confirmation Attempt', 
          `Attempted to auto-confirm booking ${result.bookingId} but ${result.method} method was used. Please verify status manually.`
        );
      }
    });

    return cleanup;
  }, [showSuccess, showInfo]);



  const loadBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      console.log('📥 [VendorBookings] Loading bookings with comprehensive API for vendor:', vendorId);
      console.log('🔍 [VendorBookings] Current filters:', { filterStatus, dateRange, sortBy, sortOrder, currentPage, searchQuery });
      
      // Map filter status to array format expected by API
      const statusFilter = filterStatus !== 'all' ? [filterStatus] : undefined;
      console.log('🔍 [VendorBookings] Status filter mapped to:', statusFilter);
      
      // Calculate sort order - comprehensive API expects 'asc'/'desc'
      const sortOrderLower = sortOrder.toLowerCase() as 'asc' | 'desc';
      
      const requestParams = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: sortOrderLower
      };
      
      console.log('🔍 [VendorBookings] Request params:', requestParams);
      
      const response = await bookingApiService.getVendorBookings(vendorId, requestParams);

      console.log('✅ [VendorBookings] Comprehensive bookings loaded successfully:', response);
      console.log('📊 [VendorBookings] Bookings count:', response.bookings?.length || 0);
      console.log('📊 [VendorBookings] Total bookings:', response.total || 0);
      
      // Check for new bookings and show notifications
      if (silent && bookings.length > 0) {
        const newBookings = response.bookings?.filter(newBooking => 
          !bookings.some(existing => existing.id === newBooking.id)
        ) || [];
        
        if (newBookings.length > 0) {
          showInfo('New Updates', `${newBookings.length} new booking${newBookings.length === 1 ? '' : 's'} received!`);
        }
      }
      
      // Map API response to UI format using enhanced mapping with vendor lookup
      const uiResponse = await mapToUIBookingsListResponseWithLookup(response);
      
      console.log('🔄 [VendorBookings] Mapped UI response:', uiResponse);
      console.log('📊 [VendorBookings] UI Bookings count:', uiResponse.bookings?.length || 0);
      
      // Log booking dates to verify sort order
      if (uiResponse.bookings?.length > 0) {
        console.log('📅 [VendorBookings] Booking dates (should be latest first):');
        uiResponse.bookings.slice(0, 5).forEach((booking: UIBooking, index: number) => {
          console.log(`  ${index + 1}. ID: ${booking.id}, Created: ${booking.createdAt}, Updated: ${booking.updatedAt}, Event: ${booking.eventDate}`);
        });
      }
      
      // Apply localStorage quote acceptance status overrides for cross-user sync
      const enhancedBookings = enhanceBookingsWithLocalStorageStatus(uiResponse.bookings);
      
      setBookings(enhancedBookings);
      
      // Normalize pagination data to match expected interface
      if (uiResponse.pagination) {
        const pag = uiResponse.pagination as any; // Type assertion for safe access
        const normalizedPagination = {
          current_page: pag.current_page || 1,
          total_pages: pag.total_pages || 1,
          total_items: pag.total_items || 0,
          per_page: pag.per_page || pag.items_per_page || 10,
          hasNext: pag.hasNext || pag.has_next_page || false,
          hasPrev: pag.hasPrev || pag.has_prev_page || false
        };
        setPagination(normalizedPagination);
      } else {
        setPagination(null);
      }
      
    } catch (error) {
      console.error('💥 [VendorBookings] Error loading bookings with comprehensive API:', error);
      if (!silent) {
        showError('Loading Error', 'Failed to load bookings. Please try again.');
      }
      // No fallback to mock data - display error state instead
      setBookings([]);
      setPagination(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 [VendorBookings] Loading stats with comprehensive API for vendor:', vendorId);
      
      const statsResponse = await bookingApiService.getBookingStats(undefined, vendorId);
      console.log('✅ [VendorBookings] Comprehensive stats loaded:', statsResponse);
      
      // Map API stats to UI format
      const uiStats = mapToUIBookingStats(statsResponse);
      setStats(uiStats);
    } catch (error) {
      console.error('💥 [VendorBookings] Error loading stats with comprehensive API:', error);
      // No fallback to mock data - display error state instead
      setStats(null);
    }
  };

  // Enhanced function to apply localStorage status overrides (quote acceptance + confirmation)
  const enhanceBookingsWithLocalStorageStatus = (bookings: UIBooking[]): UIBooking[] => {
    return bookings.map(booking => {
      let enhancedBooking = { ...booking };
      
      // Extract quote amount from response message if it exists
      if (booking.responseMessage && booking.responseMessage.includes('TOTAL:')) {
        // Try multiple patterns for different currency formats (including decimals)
        const patterns = [
          /TOTAL:\s*₱([\d,]+\.?\d*)/,              // TOTAL: ₱2,016.00 or ₱15000
          /TOTAL:\s*PHP\s*([\d,]+\.?\d*)/,         // TOTAL: PHP 2,016.00
          /TOTAL:\s*([\d,]+\.?\d*)/,               // TOTAL: 2,016.00
          /₱([\d,]+\.?\d*)\s*\|\s*Message:/,      // ₱2,016.00 | Message:
          /₱([\d,]+\.?\d*)\s*\|\s*Valid until:/,  // ₱2,016.00 | Valid until:
          /₱([\d,]+\.?\d*)(?:\s*\||\s*$)/         // ₱2,016.00 at end or before |
        ];
        
        let quoteAmount = null;
        for (const pattern of patterns) {
          const match = booking.responseMessage.match(pattern);
          if (match) {
            // Parse as float to handle decimals, then convert to integer cents or round to nearest peso
            const amountStr = match[1].replace(/,/g, '');
            quoteAmount = Math.round(parseFloat(amountStr));
            console.log(`🔍 [VendorBookings] Pattern "${pattern}" matched "${match[1]}" -> ${quoteAmount}`);
            break;
          }
        }
        
        if (quoteAmount && quoteAmount > 0) {
          enhancedBooking.quoteAmount = quoteAmount;
          enhancedBooking.totalAmount = quoteAmount;
          enhancedBooking.remainingBalance = quoteAmount - (booking.totalPaid || 0);
          console.log(`💰 [VendorBookings] Extracted quote amount ₱${quoteAmount} for booking ${booking.id} from: "${booking.responseMessage}"`);
        } else {
          console.warn(`⚠️ [VendorBookings] Could not extract quote amount from response message for booking ${booking.id}:`);
          console.warn(`⚠️ [VendorBookings] Response message: "${booking.responseMessage}"`);
          console.warn(`⚠️ [VendorBookings] Parsed amount: ${quoteAmount}`);
        }
      }
      
      // Check if this booking has been confirmed in localStorage (highest priority)
      const isBookingConfirmed = UniversalQuoteAcceptanceService.isBookingConfirmed(booking.id);
      if (isBookingConfirmed) {
        console.log(`✅ [VendorBookings] Applying localStorage booking confirmation for booking ${booking.id}`);
        enhancedBooking.status = 'confirmed' as BookingStatus;
      }
      
      // Check if this booking has been quote-accepted in localStorage
      const isQuoteAccepted = UniversalQuoteAcceptanceService.isQuoteAccepted(booking.id);
      if (isQuoteAccepted) {
        console.log(`✅ [VendorBookings] Applying localStorage quote acceptance for booking ${booking.id}`);
        enhancedBooking.status = 'quote_accepted' as BookingStatus;
      }
      
      return enhancedBooking;
    });
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus, responseMessage?: string) => {
    try {
      console.log('🔄 [VendorBookings] Updating booking status:', { bookingId, newStatus, responseMessage });
      
      // Try API first, fall back to localStorage if it fails
      try {
        // Use appropriate API method based on status
        switch (newStatus) {
          case 'confirmed':
            await bookingApiService.confirmBooking(bookingId);
            break;
          case 'completed':
            await bookingApiService.markDelivered(bookingId, responseMessage);
            break;
          case 'quote_sent':
          case 'quote_rejected':
          case 'quote_accepted':
          case 'in_progress':
          case 'cancelled':
          case 'downpayment_paid':
          case 'paid_in_full':
          case 'refunded':
          case 'disputed':
          case 'draft':
          case 'quote_requested':
            // Use the new updateBookingStatus method for all other status changes
            console.log('💡 [VendorBookings] Using updateBookingStatus API for:', newStatus);
            await bookingApiService.updateBookingStatus(bookingId, newStatus, responseMessage);
            break;
          default:
            console.warn('⚠️ [VendorBookings] Status update not implemented for:', newStatus);
            // Use generic status update as fallback
            await bookingApiService.updateBookingStatus(bookingId, newStatus, responseMessage);
        }
        
        console.log('✅ [VendorBookings] API status update successful');
        
      } catch (apiError) {
        console.warn('⚠️ [VendorBookings] API failed, using localStorage fallback:', apiError);
        
        // Apply localStorage fallback based on status
        if (newStatus === 'confirmed') {
          UniversalQuoteAcceptanceService.confirmBooking(bookingId, vendorId, responseMessage);
          showInfo('Status Updated (Offline)', 'Booking confirmed locally. Changes will sync when backend is available.');
        } else if (newStatus === 'quote_accepted') {
          UniversalQuoteAcceptanceService.acceptQuote(bookingId, 'vendor', responseMessage, vendorId);
          showInfo('Status Updated (Offline)', 'Quote acceptance recorded locally. Changes will sync when backend is available.');
        } else {
          // For other statuses, we don't have localStorage fallback yet
          throw apiError;
        }
      }
      
      console.log('✅ [VendorBookings] Booking status updated successfully');
      
      // Show success notification
      showSuccess('Status Updated', `Booking status changed to ${newStatus.replace('_', ' ')}`);
      
      // Reload bookings and stats to reflect changes
      await loadBookings();
      await loadStats();
      
      // Close modal
      setShowDetails(false);
    } catch (error) {
      console.error('💥 [VendorBookings] Failed to update booking status:', error);
      
      // Show error notification
      showError('Update Failed', 'Failed to update booking status. Please try again.');
    }
  };







  // Manual refresh function with localStorage sync status
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadBookings();
      await loadStats();
      setLastUpdate(new Date());
      
      // Check how many bookings have localStorage quote acceptance overrides
      const acceptedQuotes = UniversalQuoteAcceptanceService.getAcceptedQuotes();
      const currentBookingIds = bookings.map(b => b.id.toString());
      const relevantAcceptedQuotes = acceptedQuotes.filter((q: any) => currentBookingIds.includes(q.bookingId));
      
      if (relevantAcceptedQuotes.length > 0) {
        showSuccess('Data Refreshed', `All booking data updated. ${relevantAcceptedQuotes.length} quote acceptance(s) synced from localStorage.`);
      } else {
        showSuccess('Data Refreshed', 'All booking data has been updated');
      }
    } catch (error) {
      showError('Refresh Failed', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch service data for quote prefilling
  const fetchServiceDataForQuote = async (booking: UIBooking) => {
    try {
      console.log('🔍 [VendorBookings] Fetching service data for booking:', booking.id, 'serviceType:', booking.serviceType);
      
      // Try to fetch vendor's service that matches the booking's service type
      const response = await fetch(`${apiUrl}/api/services/vendor/${vendorId}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.services.length > 0) {
          // Find a service that matches the booking's service type/category
          const matchingService = result.services.find((service: any) => 
            service.category === booking.serviceType || 
            service.name.toLowerCase().includes(booking.serviceType.toLowerCase())
          );
          
          if (matchingService) {
            console.log('✅ [VendorBookings] Found matching service for prefill:', matchingService.name);
            return {
              id: matchingService.id,
              name: matchingService.name,
              category: matchingService.category,
              features: matchingService.features || [],
              price: matchingService.price || '10000',
              description: matchingService.description || ''
            };
          } else {
            // Use the first available service as fallback
            const firstService = result.services[0];
            console.log('🔄 [VendorBookings] No exact match, using first service:', firstService.name);
            return {
              id: firstService.id,
              name: firstService.name,
              category: firstService.category,
              features: firstService.features || [],
              price: firstService.price || '10000',
              description: firstService.description || ''
            };
          }
        }
      }
      
      console.log('⚠️ [VendorBookings] No service data available for prefill');
      return null;
    } catch (error) {
      console.error('❌ [VendorBookings] Error fetching service data:', error);
      return null;
    }
  };



  // VENDOR UTILITY FUNCTIONS - No payment processing for vendors
  const formatCurrency = (amount?: number) => {
    return amount ? formatPHP(amount) : 'N/A';
  };

  const exportBookings = () => {
    const csvContent = [
      ['ID', 'Couple Name', 'Service Type', 'Event Date', 'Status', 'Total Amount'].join(','),
      ...bookings.map(booking => [
        booking.id,
        `"${booking.coupleName}"`,
        booking.serviceType,
        booking.eventDate,
        booking.status,
        booking.totalAmount || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${vendorId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-white">
      <VendorHeader />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Enhanced Header with Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rose-700 to-gray-900 bg-clip-text text-transparent mb-3">
                  Booking Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your client bookings and track your business performance
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              
              {/* Refresh Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-xl hover:bg-rose-50 transition-all duration-300 shadow-lg"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
              </div>
            </div>
          </motion.div>





          {/* Enhanced Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
                        {stats.totalBookings || 0}
                      </span>
                      <div className="text-xs text-green-600 font-medium">Total Bookings</div>
                    </div>
                  </div>
                  <h3 className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors duration-300">All Bookings</h3>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-1 rounded-full w-3/4"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        {stats.inquiries || 0}
                      </span>
                      <div className="text-xs text-orange-600 font-medium">Pending</div>
                    </div>
                  </div>
                  <h3 className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors duration-300">New Inquiries</h3>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {stats.fullyPaidBookings || 0}
                      </span>
                      <div className="text-xs text-green-600 font-medium">Completed</div>
                    </div>
                  </div>
                  <h3 className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors duration-300">Fully Paid</h3>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full w-5/6"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {stats.formatted?.totalRevenue || formatCurrency(stats.totalRevenue)}
                      </span>
                      <div className="text-xs text-blue-600 font-medium">+8% this month</div>
                    </div>
                  </div>
                  <h3 className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors duration-300">Total Revenue</h3>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full w-4/5"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-pink-50/20 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full md:w-64 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      aria-label="Search bookings"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-4 py-3 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    aria-label="Filter by status"
                    title="Filter bookings by status"
                  >
                    <option value="all">All Status</option>
                    <option value="quote_requested">New Inquiries</option>
                    <option value="quote_sent">Quote Sent</option>
                    <option value="quote_accepted">Quote Accepted</option>
                    <option value="quote_rejected">Quote Rejected</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="downpayment_paid">Downpayment Received</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paid_in_full">Fully Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                    <option value="disputed">Disputed</option>
                  </select>

                  {/* Date Range Filter */}
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="px-4 py-3 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                    aria-label="Filter by date range"
                    title="Filter bookings by date range"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as any);
                        setSortOrder(order as any);
                      }}
                      className="px-4 py-3 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      aria-label="Sort bookings"
                      title="Sort bookings by different criteria"
                    >
                      <option value="created_at-DESC">Latest First (Newest)</option>
                      <option value="created_at-ASC">Oldest First</option>
                      <option value="updated_at-DESC">Recently Updated First</option>
                      <option value="updated_at-ASC">Least Recently Updated</option>
                      <option value="event_date-ASC">Event Date (Upcoming)</option>
                      <option value="event_date-DESC">Event Date (Distant)</option>
                      <option value="status-ASC">Status (A-Z)</option>
                      <option value="status-DESC">Status (Z-A)</option>
                    </select>
                    {sortOrder === 'DESC' && sortBy === 'created_at' && (
                      <span className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-lg">
                        ↓ Latest First
                      </span>
                    )}
                    {sortOrder === 'DESC' && sortBy === 'updated_at' && (
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-lg">
                        ↓ Recently Updated
                      </span>
                    )}
                    {sortOrder === 'ASC' && (
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                        ↑ Oldest First
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={exportBookings}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      title="Export bookings to CSV"
                      aria-label="Export all bookings to CSV file"
                    >
                      <Download className="h-5 w-5" />
                      <span className="font-medium">Export</span>
                    </button>

                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setSearchQuery('');
                        setDateRange('all');
                        setSortBy('created_at');
                        setSortOrder('DESC');
                        setCurrentPage(1);
                      }}
                      className="flex items-center space-x-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-rose-200/50 text-gray-700 rounded-xl hover:bg-rose-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                      title="Clear all filters"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="font-medium text-sm">Clear</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bookings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-pink-50/20 rounded-2xl"></div>
            <div className="relative z-10">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                  <span className="ml-3 text-gray-600">Loading bookings...</span>
                </div>
              ) : (!bookings || bookings.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600">
                    {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'New bookings will appear here'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-rose-200/30">
                    {bookings.map((booking, index) => {
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <EnhancedBookingCard
                            booking={(() => {
                              // Debug log for price issues
                              console.log(`🔍 [VendorBookings] Card data for booking ${booking.id}:`, {
                                quoteAmount: booking.quoteAmount,
                                totalAmount: booking.totalAmount,
                                status: booking.status,
                                responseMessage: booking.responseMessage ? booking.responseMessage.substring(0, 100) + '...' : 'N/A'
                              });
                              
                              return {
                                id: booking.id,
                                serviceName: booking.serviceType,
                                serviceType: booking.serviceType,
                                vendorName: booking.vendorName,
                                vendorBusinessName: booking.vendorName,
                                vendorPhone: booking.contactPhone,
                                vendorEmail: booking.contactEmail,
                                coupleName: booking.coupleName,
                                clientName: booking.coupleName,
                                eventDate: booking.eventDate,
                                formattedEventDate: new Date(booking.eventDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                }),
                                eventLocation: booking.eventLocation || 'TBD',
                                status: booking.status,
                                totalAmount: booking.quoteAmount || booking.totalAmount || 0,
                                downpaymentAmount: booking.downpaymentAmount || 0,
                                remainingBalance: (booking.quoteAmount || booking.totalAmount || 0) - (booking.totalPaid || 0),
                                paymentProgress: booking.paymentProgressPercentage,
                                createdAt: booking.createdAt,
                                updatedAt: booking.updatedAt,
                                specialRequests: booking.specialRequests,
                                notes: booking.responseMessage,
                                bookingReference: `WB-${booking.id}`,
                                daysUntilEvent: Math.ceil((new Date(booking.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                              };
                            })()}
                            userType="vendor"
                            onViewDetails={() => {
                              setSelectedBooking(booking);
                              setShowDetails(true);
                            }}
                            onSendQuote={async () => {
                              setSelectedBooking(booking);
                              
                              // Fetch service data for prefilling
                              const serviceData = await fetchServiceDataForQuote(booking);
                              setSelectedServiceData(serviceData);
                              
                              setShowQuoteModal(true);
                            }}
                            onContact={() => {
                              // Handle contact client action
                              window.open(`mailto:${booking.contactEmail}?subject=Regarding your wedding booking&body=Hi ${booking.coupleName},%0D%0A%0D%0AThank you for your inquiry about our services.%0D%0A%0D%0ABest regards`);
                            }}

                          />
                          
                          {/* Enhanced hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Enhanced Pagination */}
                  {pagination && pagination.total_pages > 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-6 py-6 border-t border-rose-200/30 bg-gradient-to-r from-rose-50/30 to-pink-50/20"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * 10) + 1}</span> to{' '}
                            <span className="font-semibold text-gray-900">{Math.min(currentPage * 10, pagination.total_items)}</span> of{' '}
                            <span className="font-semibold text-gray-900">{pagination.total_items}</span> bookings
                          </p>
                          
                          {/* Results per page selector */}
                          <select 
                            className="text-sm bg-white border border-rose-200 rounded-lg px-2 py-1"
                            title="Items per page"
                            aria-label="Items per page"
                          >
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm border border-rose-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                            title="First page"
                          >
                            First
                          </button>
                          
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-2 text-sm border border-rose-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                          >
                            Previous
                          </button>
                          
                          {/* Page numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                              const pageNum = currentPage - 2 + i;
                              if (pageNum < 1 || pageNum > pagination.total_pages) return null;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                    pageNum === currentPage
                                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                                      : 'border border-rose-200 hover:bg-rose-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-3 py-2 text-sm border border-rose-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                          >
                            Next
                          </button>
                          
                          <button
                            onClick={() => setCurrentPage(pagination.total_pages)}
                            disabled={currentPage === pagination.total_pages}
                            className="px-3 py-2 text-sm border border-rose-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                            title="Last page"
                          >
                            Last
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vendor Booking Details Modal */}
      <VendorBookingDetailsModal
        booking={selectedBooking ? {
          id: selectedBooking.id,
          vendorId: selectedBooking.vendorId,
          coupleId: selectedBooking.coupleId,
          coupleName: selectedBooking.coupleName,
          contactEmail: selectedBooking.contactEmail,
          contactPhone: selectedBooking.contactPhone,
          serviceType: selectedBooking.serviceType,
          eventDate: selectedBooking.eventDate,
          eventTime: selectedBooking.eventTime,
          eventLocation: selectedBooking.eventLocation,
          guestCount: selectedBooking.guestCount,
          specialRequests: selectedBooking.specialRequests,
          status: selectedBooking.status,
          quoteAmount: selectedBooking.quoteAmount,
          totalAmount: selectedBooking.totalAmount,
          totalPaid: selectedBooking.totalPaid,
          createdAt: selectedBooking.createdAt,
          updatedAt: selectedBooking.updatedAt,
          venueDetails: (selectedBooking as any).venueDetails || undefined,
          preferredContactMethod: selectedBooking.preferredContactMethod,
          budgetRange: selectedBooking.budgetRange,
          responseMessage: selectedBooking.responseMessage,
          formatted: selectedBooking.formatted
        } : null}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onUpdateStatus={(bookingId: string, newStatus: string, message?: string) => {
          handleStatusUpdate(bookingId, newStatus as BookingStatus, message);
        }}
        onSendQuote={async (booking) => {
          setSelectedBooking(booking as any);
          
          // Fetch service data for prefilling
          const serviceData = await fetchServiceDataForQuote(booking as UIBooking);
          setSelectedServiceData(serviceData);
          
          setShowQuoteModal(true);
        }}
        onContactClient={(booking) => {
          // Open email client for vendor-client communication
          window.open(`mailto:${booking.contactEmail}?subject=Regarding your wedding booking&body=Hi ${booking.coupleName},%0D%0A%0D%0AThank you for your inquiry about our services.%0D%0A%0D%0ABest regards`);
        }}
      />

      {/* Send Quote Modal */}
      {showQuoteModal && selectedBooking && (
        <SendQuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          booking={selectedBooking}
          serviceData={selectedServiceData}
          onSendQuote={async (quoteData) => {
            try {
              console.log('📤 [VendorBookings] Sending quote:', quoteData);
              
              // Create a comprehensive quote summary for the booking record
              const quoteItemsSummary = quoteData.items.map((item: any) => 
                `${item.description}: ${formatPHP(item.total)} (${item.quantity}x ${formatPHP(item.unitPrice)})`
              ).join('; ');
              
              const quoteSummary = [
                `ITEMIZED QUOTE: ${quoteData.items.length} items`,
                `Items: ${quoteItemsSummary}`,
                `Subtotal: ${formatPHP(quoteData.subtotal)}`,
                quoteData.tax > 0 ? `Tax: ${formatPHP(quoteData.tax)}` : null,
                quoteData.discount > 0 ? `Discount: -${formatPHP(quoteData.discount)}` : null,
                `TOTAL: ₱${quoteData.total}`,  // Ensure consistent format for extraction
                quoteData.notes ? `Notes: ${quoteData.notes}` : null,
                `Valid until: ${quoteData.validUntil}`,
                quoteData.terms ? `Terms: ${quoteData.terms}` : null
              ].filter(Boolean).join(' | ');
              
              console.log('📋 [VendorBookings] Quote summary prepared:', quoteSummary);
              
              // Update booking status to 'quote_sent' with the detailed quote information
              try {
                console.log('🔄 [VendorBookings] Updating booking status to quote_sent with quote details...');
                await handleStatusUpdate(selectedBooking.id, 'quote_sent', quoteSummary);
                console.log('✅ [VendorBookings] Quote sent and booking status updated successfully');
                
                // Update the local booking data with the quote amount
                setBookings(prevBookings => 
                  prevBookings.map(b => 
                    b.id === selectedBooking.id 
                      ? { 
                          ...b, 
                          status: 'quote_sent' as BookingStatus,
                          quoteAmount: quoteData.total,
                          totalAmount: quoteData.total,
                          remainingBalance: quoteData.total - (b.totalPaid || 0),
                          responseMessage: quoteSummary
                        }
                      : b
                  )
                );
                
                showSuccess(
                  'Quote Sent Successfully!', 
                  `Your detailed quote with ${quoteData.items.length} items totaling ${formatPHP(quoteData.total)} has been sent to the client. They will receive an email notification.`
                );
              } catch (statusError) {
                console.error('💥 [VendorBookings] Failed to send quote via status update:', statusError);
                throw new Error('Failed to send quote. Please try again.');
              }
              
              setShowQuoteModal(false);
              
            } catch (error) {
              console.error('💥 [VendorBookings] Quote sending failure:', error);
              showError(
                'Quote Send Failed', 
                (error as Error)?.message || 'Failed to send quote. Please check your connection and try again.'
              );
            }
          }}
        />
      )}

      {/* DEPRECATED - Old inline modal - Remove this entire section */}
      {/* TODO: Remove this old inline modal implementation 
      {showDetails && selectedBooking && (
        // ...existing code...
      )}
      */}
    </div>
  );
};
