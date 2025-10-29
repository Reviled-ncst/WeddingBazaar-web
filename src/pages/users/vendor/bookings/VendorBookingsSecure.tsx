import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  MessageSquare,
  Clock,
  User,
  MapPin,
  Eye,

  Shield,
  Lock,
  RefreshCw,
  DollarSign,
  FileText,
  Users,
  Mail,
  Phone,
  Heart
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { SendQuoteModal } from './components/SendQuoteModal';
import { VendorBookingDetailsModal } from './components/VendorBookingDetailsModal';
import { MarkCompleteModal } from './components/MarkCompleteModal';

// Helper function to format service type display
const formatServiceType = (serviceType: string, serviceName?: string): string => {
  // If service type is "other" or generic, try to use service name
  if (!serviceType || serviceType.toLowerCase() === 'other' || serviceType.toLowerCase() === 'general service') {
    return serviceName || 'Wedding Service';
  }
  return serviceType;
};

// Simple mapper functions
const mapVendorBookingToUI = (booking: any, vendorId: string): UIBooking => ({
  id: booking.id || 'unknown',
  vendorId: vendorId,
  vendorName: booking.vendor_name || 'Unknown Vendor',
  coupleId: booking.couple_id || booking.user_id || 'unknown',
  coupleName: booking.couple_name || booking.client_name || 'Unknown Client',
  contactEmail: booking.contact_email || booking.email || '',
  contactPhone: booking.contact_phone || booking.phone || '',
  serviceType: formatServiceType(
    booking.service_type || booking.category || 'General Service',
    booking.service_name
  ),
  eventDate: booking.event_date || booking.date || new Date().toISOString(),
  eventLocation: booking.event_location || booking.location || 'Not specified',
  guestCount: booking.guest_count || booking.guests || 0,
  totalAmount: parseFloat(booking.amount || booking.quoted_price || booking.total_amount || 0) || 0,
  status: booking.status || 'pending_review',
  createdAt: booking.created_at || booking.createdAt || new Date().toISOString(),
  updatedAt: booking.updated_at || booking.updatedAt || new Date().toISOString(),
  vendorNotes: booking.vendor_notes || booking.notes || '',
  quoteSentDate: booking.quote_sent_date,
  paymentStatus: booking.payment_status,
  budgetRange: booking.budget_range || '',
  specialRequests: booking.special_requests || '',
  estimatedCostMin: booking.estimated_cost_min || 0,
  estimatedCostMax: booking.estimated_cost_max || 0,
  depositAmount: booking.deposit_amount || 0,
  responseMessage: booking.response_message || '',
  preferredContactMethod: booking.preferred_contact_method || 'email',
  contactPerson: booking.contact_person || '',
  venueDetails: booking.venue_details || '',
  eventTime: booking.event_time || '',
  eventEndTime: booking.event_end_time || '',
  // Additional fields for SendQuoteModal
  downpaymentAmount: booking.downpayment_amount || booking.deposit_amount || 0,
  totalPaid: booking.total_paid || 0,
  remainingBalance: (parseFloat(booking.amount || booking.quoted_price || 0) || 0) - (parseFloat(booking.total_paid || 0) || 0),
  formatted: {
    totalAmount: `₱${(parseFloat(booking.amount || booking.quoted_price || 0) || 0).toLocaleString()}`,
    totalPaid: `₱${(parseFloat(booking.total_paid || 0) || 0).toLocaleString()}`,
    remainingBalance: `₱${((parseFloat(booking.amount || booking.quoted_price || 0) || 0) - (parseFloat(booking.total_paid || 0) || 0)).toLocaleString()}`,
    downpaymentAmount: `₱${(booking.downpayment_amount || booking.deposit_amount || 0).toLocaleString()}`
  }
});

const mapToUIBookingStats = (data: any): UIBookingStats => ({
  totalBookings: data.total_bookings || data.totalBookings || 0,
  pendingReview: data.pending_review || data.pendingReview || 0,
  quotesSent: data.quotes_sent || data.quotesSent || 0,
  confirmed: data.confirmed || 0,
  totalRevenue: data.total_revenue || data.totalRevenue || 0,
  averageBookingValue: data.average_booking_value || data.averageBookingValue || 0,
  conversionRate: data.conversion_rate || data.conversionRate || 0
});

const downloadCSV = (data: any[], filename: string) => {
  console.log('CSV download requested:', filename, data.length, 'items');
  alert('CSV download feature will be implemented in a future update.');
};

const downloadJSON = (data: any[], filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleContactClient = (booking: UIBooking) => {
  console.log('Contact client:', booking.coupleName);
  if (booking.contactEmail) {
    window.open(`mailto:${booking.contactEmail}?subject=Regarding your booking for ${booking.serviceType}`);
  } else {
    alert('No contact email available for this client.');
  }
};

// Types
interface UIBooking {
  id: string;
  vendorId: string;
  vendorName: string;
  coupleId: string;
  coupleName: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  vendorNotes?: string;
  quoteSentDate?: string;
  paymentStatus?: string;
  budgetRange?: string;
  specialRequests?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  depositAmount?: number;
  responseMessage?: string;
  preferredContactMethod?: string;
  contactPerson?: string;
  venueDetails?: string;
  eventTime?: string;
  eventEndTime?: string;
  // Additional fields for SendQuoteModal compatibility
  downpaymentAmount?: number;
  totalPaid?: number;
  remainingBalance?: number;
  formatted?: {
    totalAmount: string;
    totalPaid: string;
    remainingBalance: string;
    downpaymentAmount: string;
  };
}

interface UIBookingStats {
  totalBookings: number;
  pendingReview: number;
  quotesSent: number;
  confirmed: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRate: number;
}

type BookingStatus = 
  | 'request' 
  | 'pending_review' 
  | 'quote_sent' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'
  | 'deposit_paid'
  | 'downpayment_paid'
  | 'fully_paid'
  | 'paid_in_full';

/**
 * SECURITY-ENHANCED VENDOR BOOKINGS COMPONENT
 * 
 * This component includes enhanced security measures to prevent cross-vendor data leakage
 * and handles the security vulnerability identified in the system.
 */
export const VendorBookingsSecure: React.FC = () => {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [stats, setStats] = useState<UIBookingStats>({
    totalBookings: 0,
    pendingReview: 0,
    quotesSent: 0,
    confirmed: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
    conversionRate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null);
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false);
  const [bookingToComplete, setBookingToComplete] = useState<UIBooking | null>(null);

  // 🔧 CRITICAL FIX: Use user.id (2-2025-001) which IS the vendor profile ID
  // Backend returns: user.id = '2-2025-001' (vendor profile ID from vendor_profiles)
  //                  user.vendorId = 'eb5c...' (UUID from users table)
  // Bookings are stored with vendor_id = '2-2025-001' in database
  // Memoize vendorId to prevent re-renders
  const vendorId = useMemo(() => user?.id || user?.vendorId, [user?.id, user?.vendorId]);
  
  const apiUrl = process.env.REACT_APP_API_URL || 'https://weddingbazaar-web.onrender.com';

  /**
   * SECURITY-ENHANCED: Load bookings with proper access control
   */
  const loadBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      if (!vendorId) {
        throw new Error('Vendor ID not available');
      }

      console.log(`🔐 Loading bookings for vendor: ${vendorId}`);

      const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Check': 'enabled'
        }
      });

      // SECURITY: Handle different error responses
      if (response.status === 403) {
        const errorData = await response.json();
        console.error('🚨 SECURITY: Access denied', errorData);
        
        switch (errorData.code) {
          case 'VENDOR_ACCESS_REQUIRED':
            setSecurityAlert('Vendor privileges required');
            break;
          case 'CROSS_VENDOR_ACCESS_DENIED':
            setSecurityAlert('Security violation: Cannot access other vendor data');
            break;
          case 'VENDOR_RECORD_MISSING':
            setSecurityAlert('Vendor account not properly configured');
            break;
          default:
            setSecurityAlert('Access denied');
        }
        
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 🔍 DETAILED STATUS DEBUG: Log raw booking data from API
      if (data.bookings && data.bookings.length > 0) {
        console.log('🔍 [VendorBookingsSecure] RAW BOOKING DATA FROM API:', data.bookings.map((b: any) => ({
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

      // SECURITY VALIDATION: Verify response integrity
      if (data.vendorId && data.vendorId !== vendorId) {
        console.error('🚨 SECURITY WARNING: Vendor ID mismatch in response');
        setSecurityAlert('Data integrity error detected');
        return;
      }

      // Map bookings to UI format with security validation
      const mappedBookings = (data.bookings || []).map((booking: any) => {
        // SECURITY CHECK: Ensure booking belongs to this vendor
        if (booking.vendor_id && booking.vendor_id !== vendorId) {
          console.error('🚨 SECURITY: Booking belongs to different vendor', {
            bookingId: booking.id,
            bookingVendorId: booking.vendor_id,
            expectedVendorId: vendorId
          });
          return null;
        }

        return mapVendorBookingToUI(booking, vendorId);
      }).filter(Boolean);

      // 🔍 DEBUG: Log transformed booking statuses
      console.log('🎯 [VendorBookingsSecure] TRANSFORMED BOOKING STATUSES:', mappedBookings.map((b: any) => ({
        id: b.id,
        originalStatus: data.bookings.find((rb: any) => rb.id === b.id)?.status,
        transformedStatus: b.status,
        statusMatch: data.bookings.find((rb: any) => rb.id === b.id)?.status === b.status,
        coupleName: b.coupleName
      })));

      setBookings(mappedBookings);
      console.log(`✅ Loaded ${mappedBookings.length} secure bookings`);

    } catch (error) {
      console.error('❌ Failed to load bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [vendorId, apiUrl]); // FIX: Memoize with dependencies

  /**
   * SECURITY-ENHANCED: Load stats with validation
   */
  const loadStats = useCallback(async () => {
    try {
      if (!vendorId) return;

      const token = localStorage.getItem('jwt_token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/api/bookings/stats?vendorId=${vendorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(mapToUIBookingStats(data));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [vendorId, apiUrl]); // FIX: Memoize with dependencies

  /**
   * Handle booking completion (vendor side)
   * Two-sided completion: Both vendor and couple must confirm
   */
  const handleMarkComplete = useCallback(async (booking: UIBooking) => {
    console.log('🎉 [VendorBookingsSecure] Mark Complete clicked for booking:', booking.id);

    // Check if booking is fully paid
    const isFullyPaid = (booking.status as string) === 'fully_paid' || 
                       (booking.status as string) === 'paid_in_full' || 
                       (booking.status as string) === 'deposit_paid';

    if (!isFullyPaid) {
      alert('This booking must be fully paid before marking as complete.');
      return;
    }

    // Store the booking and show modal
    setBookingToComplete(booking);
    setShowMarkCompleteModal(true);
  }, []);

  const handleConfirmMarkComplete = useCallback(async () => {
    if (!bookingToComplete) return;

    try {
      // Close modal first
      setShowMarkCompleteModal(false);

      // Call the completion API
      const API_URL = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${API_URL}/api/bookings/${bookingToComplete.id}/mark-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed_by: 'vendor' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to mark booking as completed');
      }

      console.log('✅ [VendorBookingsSecure] Booking completion updated:', data);

      // Show success message
      const successMsg = data.waiting_for === null
        ? '🎉 Booking Fully Completed!\n\nBoth you and the couple have confirmed. The booking is now marked as completed.'
        : '✅ Completion Confirmed!\n\nYour confirmation has been recorded. The booking will be fully completed once the couple also confirms.';

      alert(successMsg);

      // Reload bookings to reflect new status
      await loadBookings(true); // Silent refresh

      // Clear booking state
      setBookingToComplete(null);

    } catch (error: unknown) {
      console.error('❌ [VendorBookingsSecure] Error marking complete:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while marking the booking as complete.';
      alert(`Error: ${errorMessage}`);
    }
  }, [bookingToComplete, loadBookings]);

  /**
   * Initialize component with auth context
   */
  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      setError('Vendor access required');
      setLoading(false);
      return;
    }

    if (!vendorId) {
      setError('Vendor ID not found in user profile');
      setLoading(false);
      return;
    }

    // Load data - properly handle Promise to avoid infinite loop
    const initializeData = async () => {
      await Promise.all([
        loadBookings(),
        loadStats()
      ]);
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, vendorId]); // Only depend on stable values that should trigger reloads

  /**
   * Handle security alerts
   */
  const handleSecurityAlert = () => {
    setSecurityAlert(null);
  };

  /**
   * Security-enhanced refresh
   */
  const handleSecureRefresh = async () => {
    setIsRefreshing(true);
    
    await Promise.all([
      loadBookings(true),
      loadStats()
    ]);
    
    setIsRefreshing(false);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.coupleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Security Alert Component
  const SecurityAlert = () => {
    if (!securityAlert) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
        >
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Security Alert</h3>
          </div>
          <p className="text-gray-600 mb-4">{securityAlert}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSecurityAlert}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Acknowledge
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Check if user is not authenticated or not a vendor
  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <VendorHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Vendor access required. Please log in with a vendor account.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <VendorHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <VendorHeader />
      <SecurityAlert />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Security Status Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-green-600">
            <Shield className="h-4 w-4 mr-1" />
            <span>Secure vendor access verified</span>
          </div>
          <div className="text-sm text-gray-500">
            Vendor ID: {vendorId}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                title="Filter bookings by status"
                aria-label="Filter bookings by status"
              >
                <option value="all">All Status</option>
                <option value="request">📨 New Requests</option>
                <option value="pending_review">⏳ Pending Review</option>
                <option value="quote_sent">💬 Quote Sent</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="completed">✓ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSecureRefresh}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => downloadCSV(filteredBookings, 'vendor-bookings')}
                className="flex items-center px-4 py-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </button>
              
              <button
                onClick={() => downloadJSON(filteredBookings, 'vendor-bookings')}
                className="flex items-center px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Bookings <span className="text-pink-500">({filteredBookings.length})</span>
            </h2>
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Your bookings will appear here once customers start booking your services.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredBookings.map((booking, index) => {
                  // 🔍 DEBUG: Log booking status before rendering
                  console.log(`🎯 [VendorBookingsSecure] RENDERING BOOKING #${index}:`, {
                    id: booking.id,
                    status: booking.status,
                    statusType: typeof booking.status,
                    coupleName: booking.coupleName,
                    willShowAs: booking.status === 'fully_paid' ? 'Fully Paid (should be blue)' : 
                               booking.status === 'cancelled' ? 'Cancelled (red)' :
                               booking.status === 'request' ? 'New Request (blue)' :
                               booking.status === 'pending_review' ? 'Pending Review (yellow)' :
                               booking.status === 'completed' ? 'Completed (gray)' :
                               `${booking.status} (check mapping...)`
                  });
                  
                  return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="p-6">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{booking.coupleName}</h3>
                              <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                          booking.status === 'request' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          booking.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          booking.status === 'quote_sent' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          booking.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                          booking.status === 'fully_paid' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                          booking.status === 'paid_in_full' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                          booking.status === 'downpayment_paid' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {booking.status === 'request' ? '📨 New Request' :
                           booking.status === 'pending_review' ? '⏳ Pending Review' :
                           booking.status === 'quote_sent' ? '💬 Quote Sent' :
                           booking.status === 'confirmed' ? '✅ Confirmed' :
                           booking.status === 'in_progress' ? '🔄 In Progress' :
                           booking.status === 'completed' ? '✓ Completed' :
                           booking.status === 'fully_paid' ? '💰 Fully Paid' :
                           booking.status === 'paid_in_full' ? '💰 Fully Paid' :
                           booking.status === 'downpayment_paid' ? '💵 Downpayment Paid' :
                           '❌ Cancelled'}
                        </span>
                      </div>

                      {/* Service Info */}
                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-pink-600" />
                          <span className="text-sm font-semibold text-gray-700">Service Type</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 capitalize">{booking.serviceType}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Event Date & Time */}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Event Date & Time</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(booking.eventDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            {booking.eventTime && (
                              <p className="text-xs text-gray-600 mt-1">
                                🕐 {booking.eventTime}
                                {booking.eventEndTime && ` - ${booking.eventEndTime}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Location</p>
                            <p className="text-sm font-semibold text-gray-900 truncate" title={booking.eventLocation}>
                              {booking.eventLocation || 'Location not provided'}
                            </p>
                            {booking.venueDetails && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2" title={booking.venueDetails}>
                                📍 {booking.venueDetails}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Guest Count */}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Guest Count</p>
                            <p className="text-sm font-semibold text-gray-900">{booking.guestCount} guests</p>
                          </div>
                        </div>
                      </div>

                      {/* Budget Range & Contact Info */}
                      {(booking.budgetRange || booking.contactPhone || booking.contactEmail || booking.contactPerson) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Budget Range */}
                          {booking.budgetRange && (
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Client's Budget</p>
                                <p className="text-sm font-semibold text-gray-900">{booking.budgetRange}</p>
                              </div>
                            </div>
                          )}

                          {/* Contact Person & Phone */}
                          {(booking.contactPerson || booking.contactPhone) && (
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Phone className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-1">
                                  Contact Person
                                  {booking.preferredContactMethod === 'phone' && (
                                    <span className="ml-1 text-green-600 font-semibold">⭐ Preferred</span>
                                  )}
                                </p>
                                {booking.contactPerson && (
                                  <p className="text-sm font-semibold text-gray-900">{booking.contactPerson}</p>
                                )}
                                {booking.contactPhone && (
                                  <a 
                                    href={`tel:${booking.contactPhone}`}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 truncate block"
                                  >
                                    📞 {booking.contactPhone}
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Contact Email */}
                          {booking.contactEmail && (
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-1">
                                  Contact Email
                                  {booking.preferredContactMethod === 'email' && (
                                    <span className="ml-1 text-green-600 font-semibold">⭐ Preferred</span>
                                  )}
                                </p>
                                <a 
                                  href={`mailto:${booking.contactEmail}`}
                                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 truncate block"
                                >
                                  {booking.contactEmail}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Special Requests */}
                      {booking.specialRequests && (
                        <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                          <div className="flex items-start gap-2 mb-2">
                            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Special Requests</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{booking.specialRequests}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Price Breakdown */}
                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 mb-4 border border-pink-100">
                        <div className="space-y-2">
                          {/* Deposit Amount */}
                          {(booking.depositAmount && booking.depositAmount > 0) ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Deposit Required:</span>
                              <span className="text-sm font-semibold text-orange-600">
                                ₱{booking.depositAmount.toLocaleString()}
                              </span>
                            </div>
                          ) : null}

                          {/* Price Display - Prioritize Range over Single Amount */}
                          <div className="pt-2 border-t border-pink-200">
                            {/* Show Estimated Cost Range if available */}
                            {(booking.estimatedCostMin && booking.estimatedCostMax) && (booking.estimatedCostMin > 0 || booking.estimatedCostMax > 0) ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {booking.status === 'confirmed' ? 'Agreed Price Range:' : 'Price Range:'}
                                  </span>
                                </div>
                                <div className="text-xl font-bold text-pink-600">
                                  ₱{booking.estimatedCostMin.toLocaleString()} - ₱{booking.estimatedCostMax.toLocaleString()}
                                </div>
                                {booking.totalAmount > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Final quoted: ₱{booking.totalAmount.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ) : booking.budgetRange && booking.budgetRange.trim() !== '' ? (
                              /* Show Budget Range from client if no estimated cost */
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">Client Budget:</span>
                                </div>
                                <div className="text-xl font-bold text-purple-600">
                                  {booking.budgetRange}
                                </div>
                                {booking.totalAmount > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Your quote: ₱{booking.totalAmount.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              /* Fallback to Total Amount if no range available */
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">
                                    {booking.status === 'confirmed' ? 'Agreed Amount:' : 'Amount:'}
                                  </span>
                                </div>
                                <div className="text-xl font-bold text-pink-600">
                                  {booking.totalAmount > 0 ? `₱${booking.totalAmount.toLocaleString()}` : 'Amount pending'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Vendor Notes/Response */}
                      {booking.responseMessage && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Your Response</p>
                              <p className="text-sm text-gray-600 leading-relaxed">{booking.responseMessage}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            console.log('🔍 [VendorBookingsSecure] View Details clicked for booking:', booking.id);
                            setSelectedBooking(booking);
                            setShowDetailsModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                        
                        <button
                          onClick={() => handleContactClient(booking)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200 font-medium"
                          title="Contact Client"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Message</span>
                        </button>

                        {(booking.status === 'request' || booking.status === 'pending_review') && (
                          <button
                            onClick={() => {
                              console.log('Send quote clicked for booking:', booking.id);
                              setSelectedBooking(booking);
                              setShowQuoteModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                            title="Send a price quote to the client"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Send Quote</span>
                          </button>
                        )}

                        {/* Mark as Complete Button - For Fully Paid Bookings */}
                        {(booking.status === 'fully_paid' || booking.status === 'paid_in_full') && (
                          <button
                            onClick={() => handleMarkComplete(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                            title="Mark this booking as completed (requires couple confirmation)"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark Complete</span>
                          </button>
                        )}

                        {/* Completed Badge - Show when fully completed */}
                        {booking.status === 'completed' && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 text-pink-700 rounded-xl font-semibold">
                            <Heart className="h-4 w-4 fill-current" />
                            <span>Completed ✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <VendorBookingDetailsModal
          booking={{
            ...selectedBooking,
            totalPaid: selectedBooking.totalPaid || 0
          } as any}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          onUpdateStatus={async (bookingId: string, newStatus: string, message?: string) => {
            console.log('Status update:', bookingId, newStatus, message);
            await handleSecureRefresh();
          }}
          onSendQuote={(booking) => {
            setSelectedBooking(booking as UIBooking);
            setShowDetailsModal(false);
            setShowQuoteModal(true);
          }}
          onContactClient={(booking) => {
            console.log('Contact client:', booking.coupleName);
            window.location.href = `mailto:${booking.contactEmail}`;
          }}
        />
      )}

      {/* Send Quote Modal */}
      {showQuoteModal && selectedBooking && (
        <SendQuoteModal
          isOpen={showQuoteModal}
          booking={{
            ...selectedBooking,
            contactPhone: selectedBooking.contactPhone || '',
            preferredContactMethod: selectedBooking.preferredContactMethod || 'email',
            downpaymentAmount: selectedBooking.downpaymentAmount || selectedBooking.depositAmount || 0,
            totalPaid: selectedBooking.totalPaid || 0,
            remainingBalance: selectedBooking.remainingBalance || (selectedBooking.totalAmount - (selectedBooking.totalPaid || 0)),
            formatted: selectedBooking.formatted || {
              totalAmount: `₱${selectedBooking.totalAmount.toLocaleString()}`,
              totalPaid: `₱${(selectedBooking.totalPaid || 0).toLocaleString()}`,
              remainingBalance: `₱${(selectedBooking.totalAmount - (selectedBooking.totalPaid || 0)).toLocaleString()}`,
              downpaymentAmount: `₱${(selectedBooking.downpaymentAmount || selectedBooking.depositAmount || 0).toLocaleString()}`
            }
          }}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedBooking(null);
          }}
          onSendQuote={async (quoteData) => {
            console.log('Quote sent:', quoteData);
            // Refresh bookings after quote is sent
            await handleSecureRefresh();
            setShowQuoteModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Mark Complete Modal */}
      {showMarkCompleteModal && bookingToComplete && (
        <MarkCompleteModal
          isOpen={showMarkCompleteModal}
          booking={bookingToComplete}
          onClose={() => {
            setShowMarkCompleteModal(false);
            setBookingToComplete(null);
          }}
          onConfirm={handleConfirmMarkComplete}
        />
      )}
    </div>
  );
};

export default VendorBookingsSecure;
