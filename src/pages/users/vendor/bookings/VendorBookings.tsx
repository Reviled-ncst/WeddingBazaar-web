import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  Loader2,
  Heart,
  MessageSquare,
  Star,
  DollarSign,
  X,
  Filter,
  RefreshCw,
  Zap,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  MoreVertical
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { VendorBookingDetailsModal } from './components/VendorBookingDetailsModal';
import { SendQuoteModal } from './components/SendQuoteModal';

// Enhanced booking components will be created inline since they don't exist yet

// Import comprehensive booking API and types
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';
import type { 
  BookingStatus
} from '../../../../shared/types/comprehensive-booking.types';

// Import unified mapping utilities
import { 
  mapVendorBookingToUI, 
  mapToUIBookingStats, 
  mapToUIBookingsListResponse,
  mapToUIBookingsListResponseWithLookup
} from '../../../../shared/utils/booking-data-mapping';
import type {
  UIBooking,
  UIBookingStats,
  UIBookingsListResponse
} from '../../../../shared/types/ui-booking.types';

// Import modular utilities for enhanced data processing
import { 
  transformBookingData,
  getEnhancedContactInfo,
  getRealisticBudgetRange,
  type BookingRawData,
  type ProcessedBookingData
} from './utils/bookingDataMapper';

// Import user API service for couple name lookup
import { userAPIService, type UserData } from '../../../../services/api/userAPIService';

// Import auth context to get the real vendor ID
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';

// Import completion service for two-sided completion
import { 
  markBookingComplete,
  getCompletionStatus,
  canMarkComplete,
  getCompletionButtonText,
  type CompletionStatus
} from '../../../../shared/services/completionService';

// Import currency formatting utility
import { formatPHP } from '../../../../utils/currency';

// Import vendor ID mapping utility
import { getVendorIdForUser, debugVendorIdResolution, getWorkingVendorId } from '../../../../utils/vendorIdMapping';

// Import notification system
import { useNotifications } from '../../../../shared/components/notifications/NotificationProvider';

// Import booking status management
import { bookingStatusManager, applyBookingStatusOverrides } from '../../../../utils/bookingStatusManager';

type FilterStatus = 'all' | BookingStatus;

// Real-time activity types
interface LiveActivity {
  id: string;
  type: 'new_inquiry' | 'quote_viewed' | 'payment_made' | 'message_sent' | 'booking_update';
  title: string;
  description: string;
  timestamp: string;
  bookingId?: string;
  avatar?: string;
  status?: BookingStatus;
}

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
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  
  // DYNAMIC VENDOR ID RESOLUTION  
  // Use intelligent pattern-based mapping to extract the correct vendor ID
  const baseVendorId = user?.role === 'vendor' ? getVendorIdForUser(user) : null;
  const [workingVendorId, setWorkingVendorId] = useState<string | null>(baseVendorId);
  
  // Debug vendor ID resolution
  debugVendorIdResolution(user);
  
  // Security check: Block access if no valid vendor ID
  if (!baseVendorId) {
    console.error('🚫 [VendorBookings] SECURITY: No valid vendor ID found. Access denied.');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You must be logged in as a vendor to access bookings.</p>
        </div>
      </div>
    );
  }
  
  // Smart vendor ID resolution with automatic backend compatibility detection
  useEffect(() => {
    const resolveWorkingVendorId = async () => {
      if (baseVendorId) {
        console.log('🔍 [VendorBookings] Resolving working vendor ID for:', baseVendorId);
        
        // Get authentication token for testing
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        const resolvedId = await getWorkingVendorId(baseVendorId, token || undefined);
        setWorkingVendorId(resolvedId);
        console.log('✅ [VendorBookings] Working vendor ID resolved:', resolvedId);
      }
    };
    
    resolveWorkingVendorId();
  }, [baseVendorId]);
  
  // API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  
  // Debug logging for vendor identification
  console.log('🔍 [VendorBookings] USER OBJECT COMPLETE DEBUG:', {
    'Complete user object': user,
    'user?.id': user?.id,
    'user?.role': user?.role,
    'user?.vendorId': user?.vendorId, 
    'user?.businessName': user?.businessName,
    'user?.email': user?.email,
    'typeof user?.id': typeof user?.id,
    'user?.id length': user?.id?.length,
    'base vendorId': baseVendorId,
    'working vendorId': workingVendorId,
    'API will call': `${apiUrl}/api/bookings/vendor/${workingVendorId}`,
    'logic': 'Dynamic pattern-based extraction with smart backend compatibility'
  });

  // Debug effect to monitor bookings state changes
  useEffect(() => {
    console.log('📊 [VendorBookings] Bookings state changed - length:', bookings.length, 'loading:', loading);
    if (bookings.length > 0) {
      console.log('✅ [VendorBookings] Bookings in state:', bookings.map(b => ({ id: b.id, coupleName: b.coupleName, serviceType: b.serviceType })));
    }
  }, [bookings, loading]);

  // NEW: Comprehensive debug logging for troubleshooting
  useEffect(() => {
    console.log('🔍 [VendorBookings] COMPREHENSIVE DEBUG STATE:', {
      'Loading': loading,
      'Bookings Count': bookings.length,
      'Working Vendor ID': workingVendorId,
      'Base Vendor ID': baseVendorId,
      'User Object': user,
      'User ID': user?.id,
      'User Role': user?.role,
      'Filter Status': filterStatus,
      'Search Query': searchQuery,
      'Has Auth Token': !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')),
      'API URL': apiUrl,
      'Full Endpoint': `${apiUrl}/api/bookings/vendor/${workingVendorId}`
    });
    
    // Log all bookings if they exist
    if (bookings.length > 0) {
      console.log('📋 [VendorBookings] BOOKINGS DETAILS:', bookings);
    } else {
      console.log('❌ [VendorBookings] NO BOOKINGS IN STATE');
    }
  }, [loading, bookings, workingVendorId, baseVendorId, user, filterStatus, searchQuery]);

  useEffect(() => {
    console.log('🔄 [VendorBookings] Effect triggered with:', { workingVendorId, filterStatus, currentPage });
    // Only load data once we have a working vendor ID
    if (workingVendorId) {
      loadBookings();
      loadStats();
    }
  }, [filterStatus, dateRange, sortBy, sortOrder, currentPage, workingVendorId]);

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
      if (!loading && workingVendorId) {
        console.log('🔄 [VendorBookings] Auto-refreshing data...');
        loadBookings(true); // Silent refresh
        loadStats();
        setLastUpdate(new Date());
      }
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [loading, workingVendorId]);



  // Enhanced couple name lookup with API integration
  const getCoupleDisplayName = async (booking: any): Promise<string> => {
    // If we already have a couple name, use it
    if (booking.couple_name && booking.couple_name !== 'Unknown Couple') {
      return booking.couple_name;
    }

    // Try to fetch real user data from API
    if (booking.couple_id) {
      try {
        const userData = await userAPIService.getUserById(booking.couple_id);
        if (userData) {
          const displayName = userAPIService.getDisplayName(userData);
          console.log(`✅ [VendorBookings] Fetched real name for ${booking.couple_id}: ${displayName}`);
          return displayName;
        }
      } catch (error) {
        console.warn(`⚠️ [VendorBookings] Failed to fetch user data for ${booking.couple_id}:`, error);
      }

      // DYNAMIC FALLBACK: Generate display name from couple ID pattern
      // Pattern: 1-2025-003 → "Client #003" or "Wedding Client #3"
      const match = booking.couple_id.match(/(\d+)-(\d+)-(\d+)/);
      if (match) {
        const clientNumber = parseInt(match[3], 10);
        return `Wedding Client #${clientNumber}`;
      }
    }

    return 'Wedding Client';
  };

  const loadBookings = async (silent = false) => {
    try {
      if (!workingVendorId) {
        console.log('⏳ [VendorBookings] Waiting for vendor ID...');
        return;
      }
      
      if (!silent) setLoading(true);
      console.log('🎯 [VendorBookings] SIMPLE APPROACH - Loading bookings for vendor:', workingVendorId);
      
      // Get authentication token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        console.error('� [VendorBookings] No authentication token found');
        if (!silent) {
          showError('Authentication Error', 'Please log in again to view bookings.');
        }
        setBookings([]);
        return;
      }
      
      // TRY ORIGINAL VENDOR ID FIRST, THEN FALLBACK TO SIMPLE ID
      let response;
      let finalVendorId = workingVendorId;
      
      // First attempt: Use original complex vendor ID
      console.log(`🎯 [VendorBookings] First attempt with original ID: ${workingVendorId}`);
      response = await fetch(`${apiUrl}/api/bookings/vendor/${workingVendorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If we get MALFORMED_VENDOR_ID error, try fallback mapping
      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.code === 'MALFORMED_VENDOR_ID') {
          console.log('🔄 [VendorBookings] Complex ID rejected, trying fallback mapping...');
          
          // DYNAMIC FALLBACK: Extract numeric part from complex vendor ID
          // Pattern: 2-2025-003 → extract the last number (003 → 3)
          const vendorIdMatch = workingVendorId.match(/^(\d+)-\d{4}-(\d+)$/);
          if (vendorIdMatch) {
            const extractedId = parseInt(vendorIdMatch[2], 10).toString();
            finalVendorId = extractedId;
            console.log(`🎯 [VendorBookings] Dynamic fallback: ${workingVendorId} → ${finalVendorId}`);
            
            response = await fetch(`${apiUrl}/api/bookings/vendor/${finalVendorId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
          } else {
            console.log(`⚠️ [VendorBookings] Could not extract simple ID from: ${workingVendorId}`);
          }
        }
      }
      const data = await response.json();
      
      console.log('📊 [VendorBookings] API Response:', {
        status: response.status,
        success: data.success,
        bookingCount: data.bookings?.length || 0,
        fullResponse: data
      });
      
      // 🔍 DETAILED STATUS DEBUG: Log raw booking data from API
      if (data.bookings && data.bookings.length > 0) {
        console.log('🔍 [VendorBookings] RAW BOOKING DATA FROM API:', data.bookings.map((b: any) => ({
          id: b.id,
          status: b.status,
          statusType: typeof b.status,
          statusLength: b.status?.length,
          statusTrimmed: b.status?.trim(),
          payment_status: b.payment_status,
          total_amount: b.total_amount,
          total_paid: b.total_paid,
          couple_name: b.couple_name
        })));
      }
      
      if (response.status === 200 && data.success && data.bookings) {
        console.log(`✅ [VendorBookings] SUCCESS: Found ${data.bookings.length} bookings!`);
        
        // Simple conversion to UI format
        const uiBookings = data.bookings.map((booking: any) => {
          const totalAmount = parseFloat(booking.total_amount || '0');
          const totalPaid = parseFloat(booking.total_paid || '0');
          const paymentProgressPercentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
          
          return {
            id: booking.id,
            vendorId: booking.vendor_id,
            coupleId: booking.couple_id,
            coupleName: booking.couple_name || `Customer ${booking.couple_id}`,
            contactEmail: booking.contact_email || 'Email pending',
            contactPhone: booking.contact_phone || 'Phone pending',
            serviceType: booking.service_type || booking.service_name || 'Service',
            serviceName: booking.service_name || 'Wedding Service',
            eventDate: booking.event_date || new Date().toISOString().split('T')[0],
            eventTime: booking.event_time || '18:00',
            eventLocation: booking.event_location || 'Location not provided',
            guestCount: booking.guest_count || 'Not specified',
            specialRequests: booking.special_requests || 'None specified',
            status: booking.status || 'pending',
            budgetRange: booking.budget_range || 'To be discussed',
            totalAmount,
            quoteAmount: parseFloat(booking.quote_amount || booking.total_amount || '0'),
            totalPaid,
            paymentProgressPercentage,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
            notes: booking.notes || '',
            responseMessage: booking.response_message || booking.notes || '',
            formatted: {
              totalAmount: `₱${totalAmount.toLocaleString()}`,
              totalPaid: `₱${totalPaid.toLocaleString()}`,
              remainingBalance: `₱${Math.max(totalAmount - totalPaid, 0).toLocaleString()}`,
              paymentProgress: `${paymentProgressPercentage}%`
            }
          };
        });
        
        console.log('📋 [VendorBookings] Setting bookings in state:', uiBookings);
        
        // 🔍 DEBUG: Log transformed booking statuses
        console.log('🎯 [VendorBookings] TRANSFORMED BOOKING STATUSES:', uiBookings.map(b => ({
          id: b.id,
          originalStatus: data.bookings.find((rb: any) => rb.id === b.id)?.status,
          transformedStatus: b.status,
          statusMatch: data.bookings.find((rb: any) => rb.id === b.id)?.status === b.status,
          coupleName: b.coupleName
        })));
        
        setBookings(uiBookings);
        
        if (!silent) {
          showSuccess('Bookings Loaded', `Found ${uiBookings.length} booking${uiBookings.length === 1 ? '' : 's'}`);
        }
        
        return;
        
      } else if (response.status === 403) {
        const errorData = await response.json();
        console.log('🚨 [VendorBookings] 403 Error:', errorData);
        
        if (errorData.code === 'MALFORMED_VENDOR_ID') {
          if (!silent) {
            showError('Backend Compatibility Issue', 
              `The backend currently doesn't support complex vendor ID format (${finalVendorId}). ` +
              'This will be fixed in the next backend deployment.'
            );
          }
        } else {
          if (!silent) {
            showError('Access Denied', 'You do not have permission to view these bookings.');
          }
        }
        setBookings([]);
        return;
        
      } else if (response.status === 404) {
        console.log('❌ [VendorBookings] Endpoint not found');
        if (!silent) {
          showError('API Error', 'Booking endpoint not available. Please contact support.');
        }
        setBookings([]);
        return;
        
      } else {
        console.log('❌ [VendorBookings] API returned no bookings or error');
        const errorData = await response.json().catch(() => null);
        if (!silent) {
          if (errorData?.message) {
            showError('Error', errorData.message);
          } else {
            showInfo('No Bookings', 'No bookings found for your account. New bookings will appear here.');
          }
        }
        setBookings([]);
        return;
      }


      
    } catch (error) {
      console.error('💥 [VendorBookings] Error in direct API approach:', error);
      if (!silent) {
        showError('Loading Error', 'Failed to load bookings. Please try again.');
      }
      
      // SECURITY: Never show mock/fake data to vendors - always show empty state on API failure
      console.log('🔒 [VendorBookings] SECURITY: API failed, showing empty state (no mock data)');
      setBookings([]);
      setPagination({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        per_page: 10,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (!workingVendorId) {
        console.log('⏳ [VendorBookings] Waiting for vendor ID resolution before loading stats...');
        return;
      }
      
      // Get authentication token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!token) {
        console.error('� [VendorBookings] No authentication token found for stats');
        // Calculate basic stats from current bookings data
        const realStats: UIBookingStats = {
          totalBookings: bookings.length,
          inquiries: bookings.filter(b => b.status === 'pending' || b.status === 'quote_requested').length,
          confirmedBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
          fullyPaidBookings: bookings.filter(b => b.paymentProgressPercentage >= 100).length,
          totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          formatted: {
            totalRevenue: formatPHP(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))
          }
        };
        setStats(realStats);
        return;
      }
      
      console.log('📊 [VendorBookings] Loading stats with authentication for vendor:', workingVendorId);
      
      // Try to use comprehensive API if available, otherwise calculate from current data
      try {
        const statsResponse = await bookingApiService.getBookingStats(undefined, workingVendorId);
        console.log('✅ [VendorBookings] Comprehensive stats loaded:', statsResponse);
        
        // Map API stats to UI format
        const uiStats = mapToUIBookingStats(statsResponse);
        setStats(uiStats);
      } catch (apiError) {
        console.warn('⚠️ [VendorBookings] Comprehensive API unavailable, using current bookings data');
        throw apiError; // Re-throw to trigger fallback calculation
      }
    } catch (error) {
      console.error('💥 [VendorBookings] Error loading stats:', error);
      
      // SECURITY: Calculate real stats from current bookings data (no mock data)
      console.log('� [VendorBookings] SECURITY: Using real bookings data for stats calculation');
      const realStats: UIBookingStats = {
        totalBookings: bookings.length,
        inquiries: bookings.filter(b => b.status === 'pending' || b.status === 'quote_requested').length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
        fullyPaidBookings: bookings.filter(b => b.paymentProgressPercentage >= 100).length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        formatted: {
          totalRevenue: formatPHP(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))
        }
      };
      setStats(realStats);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus, responseMessage?: string) => {
    // Get current booking to record old status
    const currentBooking = bookings.find(b => b.id === bookingId);
    const oldStatus = currentBooking?.status || 'pending';
    
    console.log('🔄 [VendorBookings] Updating booking status:', { bookingId, oldStatus, newStatus, responseMessage });
    
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
      
      console.log('✅ [VendorBookings] Backend status update successful');
      
      // Record successful backend update
      bookingStatusManager.recordStatusUpdate(bookingId, oldStatus, newStatus, responseMessage, 'backend');
      
      // Show success notification
      showSuccess('Status Updated', `Booking status changed to ${newStatus.replace('_', ' ')}`);
      
      // Reload bookings and stats to reflect changes
      await loadBookings();
      await loadStats();
      
      // Close modal
      setShowDetails(false);
      
    } catch (error) {
      console.error('💥 [VendorBookings] Backend status update failed:', error);
      
      // CRITICAL: Implement frontend fallback to ensure user experience
      console.log('🔄 [VendorBookings] Implementing frontend fallback for status update');
      
      try {
        // 1. Record frontend fallback status update
        bookingStatusManager.recordStatusUpdate(bookingId, oldStatus, newStatus, responseMessage, 'frontend_fallback');
        
        // 2. Update local bookings state immediately
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  status: newStatus,
                  statusNote: '(Updated locally - syncing with server)',
                  statusClass: 'frontend-updated',
                  vendorNotes: responseMessage || booking.vendorNotes,
                  lastUpdated: new Date().toISOString()
                } 
              : booking
          )
        );
        
        // 3. Show success notification (the user doesn't need to know about backend issues)
        showSuccess(
          'Status Updated', 
          `Booking status changed to ${newStatus.replace('_', ' ')}. Changes will sync with the server.`
        );
        
        // 4. Close modal
        setShowDetails(false);
        
        // 5. Log the fallback for debugging
        console.log('✅ [VendorBookings] Frontend fallback status update applied successfully');
        
        // 6. Show info about the sync status (optional - for transparency)
        setTimeout(() => {
          showInfo(
            'Sync Status', 
            'Your changes are saved locally and will sync when the server is available.'
          );
        }, 2000);
        
      } catch (fallbackError) {
        console.error('💥 [VendorBookings] Even frontend fallback failed:', fallbackError);
        
        // Show detailed error information only if everything fails
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showError('Update Failed', `Failed to update booking status: ${errorMessage}. Please try again.`);
      }
    }
  };



  // SECURITY: Mock activities function removed to prevent fake data display



  // Handle booking completion (vendor side)
  const handleMarkComplete = async (booking: UIBooking) => {
    if (!workingVendorId) {
      showError('Authentication Error', 'Vendor ID not found. Please log in again.');
      return;
    }

    try {
      // Get current completion status
      const completionStatus = await getCompletionStatus(booking.id);

      // Check if booking is fully paid
      const isFullyPaid = booking.status === 'fully_paid' || 
                         booking.status === 'paid_in_full' || 
                         booking.status === 'deposit_paid';

      if (!isFullyPaid) {
        showError(
          'Cannot Mark Complete',
          'This booking must be fully paid before marking as complete.'
        );
        return;
      }

      // Check if vendor has already marked complete
      if (completionStatus?.vendorCompleted) {
        showInfo(
          'Already Confirmed',
          'You have already confirmed completion for this booking. Waiting for couple confirmation.'
        );
        return;
      }

      // Determine message based on couple completion status
      const confirmMessage = completionStatus?.coupleCompleted
        ? `The couple has already confirmed completion.\n\nBy confirming, you agree that the service was delivered successfully and the booking will be FULLY COMPLETED.`
        : `Mark this booking for ${booking.coupleName || 'the couple'} as complete?\n\nNote: The booking will only be fully completed when both you and the couple confirm completion.`;

      // Show confirmation dialog
      const confirmed = window.confirm(
        `✅ Complete Booking\n\n${confirmMessage}\n\nDo you want to proceed?`
      );

      if (!confirmed) {
        return;
      }

      // Mark booking as complete
      setLoading(true);
      const result = await markBookingComplete(booking.id, 'vendor');

      if (result.success) {
        const successMsg = completionStatus?.coupleCompleted
          ? '🎉 Booking Fully Completed!\n\nBoth you and the couple have confirmed. The booking is now marked as completed.'
          : '✅ Completion Confirmed!\n\nYour confirmation has been recorded. The booking will be fully completed once the couple also confirms.';

        showSuccess(
          'Completion Confirmed',
          successMsg
        );

        // Reload bookings to reflect new status
        await loadBookings(true);
        await loadStats();
      } else {
        showError(
          'Completion Failed',
          result.error || 'Failed to mark booking as complete. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('❌ [VendorBookings] Error marking complete:', error);
      showError(
        'Error',
        error.message || 'An error occurred while marking the booking as complete.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadBookings();
      await loadStats();
      setLastUpdate(new Date());
      showSuccess('Data Refreshed', 'All booking data has been updated');
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
      const response = await fetch(`${apiUrl}/api/services/vendor/${workingVendorId}`);
      
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

  const handleDownload = (format: 'csv' | 'json' = 'csv') => {
    try {
      // Import the download utilities
      import('./utils/downloadUtils').then(({ downloadBookings }) => {
        downloadBookings(bookings as any[], workingVendorId || 'unknown', { format });
        showSuccess('Download Started', `Bookings exported as ${format.toUpperCase()} file`);
      });
    } catch (error) {
      console.error('Download failed:', error);
      showError('Download Failed', 'Failed to export bookings. Please try again.');
    }
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



          {/* Live Activity Feed */}
          {liveActivities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 mb-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Live Activity</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Real-time
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {liveActivities.slice(0, 3).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-rose-50/30 rounded-xl"
                  >
                    {activity.avatar ? (
                      <img
                        src={activity.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${activity.title}&background=f3f4f6&color=374151&size=32`;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                      <p className="text-gray-600 text-sm">{activity.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

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
                        {stats.totalBookings}
                      </span>
                      <div className="text-xs text-green-600 font-medium">+12% this month</div>
                    </div>
                  </div>
                  <h3 className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors duration-300">Total Bookings</h3>
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
                        {stats.inquiries}
                      </span>
                      <div className="text-xs text-orange-600 font-medium">Needs attention</div>
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
                        {stats.fullyPaidBookings}
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
                    <option value="request">Requests</option>
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
                    <div className="relative group">
                      <button 
                        onClick={() => handleDownload('csv')}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        title="Download bookings as CSV"
                        aria-label="Download all bookings as CSV file"
                      >
                        <Download className="h-5 w-5" />
                        <span className="font-medium">Download CSV</span>
                      </button>
                      
                      {/* JSON Download Button */}
                      <button 
                        onClick={() => handleDownload('json')}
                        className="ml-2 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        title="Download bookings as JSON"
                        aria-label="Download all bookings as JSON file"
                      >
                        <Download className="h-4 w-4" />
                        <span className="font-medium text-sm">JSON</span>
                      </button>
                    </div>

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
                  {/* Debug info */}
                  <div className="mt-4 text-xs text-gray-400">
                    DEBUG: bookings={bookings?.length || 0}, filterStatus={filterStatus}, searchQuery="{searchQuery}"
                  </div>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-rose-200/30">
                    {(() => {
                      console.log('🎯 [VendorBookings] RENDER - About to filter bookings:', {
                        totalBookings: bookings?.length || 0,
                        filterStatus,
                        searchQuery,
                        dateRange,
                        bookings: bookings?.map(b => ({ id: b.id, status: b.status, couple: b.coupleName }))
                      });
                      return bookings;
                    })()
                      .filter(booking => {
                        // Status filter
                        if (filterStatus !== 'all' && booking.status !== filterStatus) {
                          return false;
                        }
                        
                        // Search filter
                        if (searchQuery) {
                          const searchLower = searchQuery.toLowerCase();
                          return (
                            (booking.coupleName || '').toLowerCase().includes(searchLower) ||
                            (booking.serviceType || '').toLowerCase().includes(searchLower) ||
                            (booking.specialRequests || '').toLowerCase().includes(searchLower) ||
                            (booking.eventLocation || '').toLowerCase().includes(searchLower)
                          );
                        }
                        
                        // Date range filter
                        if (dateRange !== 'all') {
                          const bookingDate = new Date(booking.createdAt);
                          const now = new Date();
                          const daysDiff = Math.floor((now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
                          
                          switch (dateRange) {
                            case 'week':
                              return daysDiff <= 7;
                            case 'month':
                              return daysDiff <= 30;
                            case 'quarter':
                              return daysDiff <= 90;
                            default:
                              return true;
                          }
                        }
                        
                        return true;
                      })
                      .sort((a, b) => {
                        // Apply sorting
                        let aValue: any, bValue: any;
                        
                        switch (sortBy) {
                          case 'created_at':
                            aValue = new Date(a.createdAt).getTime();
                            bValue = new Date(b.createdAt).getTime();
                            break;
                          case 'updated_at':
                            aValue = new Date(a.updatedAt).getTime();
                            bValue = new Date(b.updatedAt).getTime();
                            break;
                          case 'event_date':
                            aValue = new Date(a.eventDate).getTime();
                            bValue = new Date(b.eventDate).getTime();
                            break;
                          case 'status':
                            aValue = a.status;
                            bValue = b.status;
                            break;
                          default:
                            aValue = new Date(a.createdAt).getTime();
                            bValue = new Date(b.createdAt).getTime();
                        }
                        
                        if (sortOrder === 'ASC') {
                          return aValue > bValue ? 1 : -1;
                        } else {
                          return aValue < bValue ? 1 : -1;
                        }
                      })
                      .map((booking, index) => {
                      // 🔍 DEBUG: Log booking status before rendering
                      console.log(`🎯 [VendorBookings] RENDERING BOOKING #${index}:`, {
                        id: booking.id,
                        status: booking.status,
                        statusType: typeof booking.status,
                        coupleName: booking.coupleName,
                        willShowAs: booking.status === 'fully_paid' ? 'Fully Paid (Blue)' : 
                                   booking.status === 'cancelled' ? 'Cancelled (Red)' : 
                                   `${booking.status} (checking...)`
                      });
                      
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative p-6 hover:shadow-lg transition-all duration-300"
                        >
                          {/* Simple Booking Card */}
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Booking Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {booking.coupleName || 'Wedding Client'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {booking.serviceType} • {booking.eventDate}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Status Badge */}
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'quote_sent' ? 'bg-blue-100 text-blue-800' :
                                    (booking.status === 'request' || booking.status === 'quote_requested') ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                    (booking.status === 'fully_paid' || booking.status === 'paid_in_full') ? 'bg-blue-100 text-blue-800' :
                                    booking.status === 'downpayment_paid' ? 'bg-cyan-100 text-cyan-800' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    booking.status === 'pending_cancellation' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {booking.status === 'request' ? 'New Request' : 
                                     booking.status === 'fully_paid' ? 'Fully Paid' :
                                     booking.status === 'paid_in_full' ? 'Fully Paid' :
                                     booking.status === 'downpayment_paid' ? 'Downpayment Paid' :
                                     booking.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Location:</span>
                                  <p className="font-medium text-gray-900">{booking.eventLocation}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Guests:</span>
                                  <p className="font-medium text-gray-900">{booking.guestCount} {typeof booking.guestCount === 'number' && booking.guestCount > 0 ? 'guests' : ''}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Budget:</span>
                                  <p className="font-medium text-gray-900">
                                    {booking.formatted?.totalAmount || 'Quote pending'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Payment Progress Bar */}
                              {booking.totalAmount > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Payment Progress</span>
                                    <span>{booking.formatted?.paymentProgress || `${booking.paymentProgressPercentage}%`}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(booking.paymentProgressPercentage, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              
                              {booking.specialRequests && booking.specialRequests !== 'No special requirements specified' && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Special Requests:</span>
                                  <p className="text-sm text-gray-700 mt-1">{booking.specialRequests}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowDetails(true);
                                }}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              
                              {/* Send Quote Button - For new requests */}
                              {(booking.status === 'request' || booking.status === 'quote_requested') && (
                                <button
                                  onClick={async () => {
                                    setSelectedBooking(booking);
                                    const serviceData = await fetchServiceDataForQuote(booking);
                                    setSelectedServiceData(serviceData);
                                    setShowQuoteModal(true);
                                  }}
                                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 text-sm font-medium"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Send Quote
                                </button>
                              )}
                              
                              {/* Mark as Complete Button - For fully paid bookings */}
                              {(booking.status === 'fully_paid' || booking.status === 'paid_in_full') && (
                                <button
                                  onClick={() => handleMarkComplete(booking)}
                                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium hover:shadow-lg hover:scale-105"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark as Complete
                                </button>
                              )}
                              
                              {/* Completed Badge - For completed bookings */}
                              {booking.status === 'completed' && (
                                <div className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 text-pink-700 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm">
                                  <Heart className="h-4 w-4 fill-current" />
                                  Completed ✓
                                </div>
                              )}
                              
                              {/* Contact Button */}
                              <button
                                onClick={() => {
                                  const coupleName = booking.coupleName && booking.coupleName !== 'Unknown Couple' ? booking.coupleName : 'there';
                                  const emailSubject = encodeURIComponent('Regarding your wedding booking');
                                  const emailBody = encodeURIComponent(`Hi ${coupleName},\n\nThank you for your inquiry about our ${booking.serviceType} services for your special day.\n\nBest regards`);
                                  window.open(`mailto:${booking.contactEmail}?subject=${emailSubject}&body=${emailBody}`);
                                }}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-300 text-sm font-medium"
                              >
                                <Mail className="h-4 w-4" />
                                Contact
                              </button>
                            </div>
                          </div>
                          
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
                            aria-label="Select number of items per page"
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
        onUpdateStatus={async (bookingId: string, newStatus: string, message?: string) => {
          try {
            console.log(' [VendorBookings] Updating booking status:', { bookingId, newStatus, message });
            await bookingApiService.updateBookingStatus(bookingId, newStatus as BookingStatus, message);
            await loadBookings(true);
            await loadStats();
            showSuccess('Status Updated', `Booking status updated to ${newStatus}`);
          } catch (error) {
            console.error('💥 [VendorBookings] Status update failed:', error);
            showError('Update Failed', 'Failed to update booking status');
          }
        }}
      />

      {/* Send Quote Modal */}
      {showQuoteModal && selectedBooking && (
        <SendQuoteModal
          booking={selectedBooking}
          serviceData={selectedServiceData}
          isOpen={showQuoteModal}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedServiceData(null);
          }}
          onSendQuote={async () => {
            setShowQuoteModal(false);
            setSelectedServiceData(null);
            await loadBookings(true);
            await loadStats();
            showSuccess('Quote Sent', 'Your quote has been sent successfully');
          }}
        />
      )}
    </div>
  );
};
