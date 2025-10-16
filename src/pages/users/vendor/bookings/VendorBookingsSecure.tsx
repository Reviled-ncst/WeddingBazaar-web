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
  Shield,
  Lock
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { VendorBookingDetailsModal } from './components/VendorBookingDetailsModal';
import { SendQuoteModal } from './components/SendQuoteModal';

// Security-enhanced utilities
import { 
  mapVendorBookingToUI, 
  mapToUIBookingStats, 
  mapToUIBookingsListResponse,
  getRealEventLocation,
  getRealGuestCount,
  getRealContactInfo
} from './utils/bookingDataMapper';
import { downloadCSV, downloadJSON } from './utils/downloadUtils';
import { handleContactClient, handleViewDetails, handleSendQuote } from './utils/bookingActions';

// Types
class SecurityError extends Error {
  code?: string;
  status?: number;
  
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'SecurityError';
    this.code = code;
    this.status = status;
  }
}

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

type BookingStatus = 'pending_review' | 'quote_sent' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

/**
 * SECURITY-ENHANCED VENDOR BOOKINGS COMPONENT
 * 
 * This component includes enhanced security measures to prevent cross-vendor data leakage
 * and handles the security vulnerability identified in the system.
 */
export const VendorBookingsSecure: React.FC = () => {
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
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Security state
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');
  const [vendorId, setVendorId] = useState<string | null>(null);
  
  const apiUrl = process.env.REACT_APP_API_URL || 'https://weddingbazaar-web.onrender.com';

  /**
   * SECURITY ENHANCEMENT: Verify user authorization and extract vendor ID
   */
  const verifyAuthorization = async (): Promise<{ authorized: boolean; vendorId?: string; error?: string }> => {
    try {
      // Check for token in multiple possible keys for compatibility
      const token = localStorage.getItem('jwt_token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('auth_token');
                   
      if (!token) {
        return { authorized: false, error: 'No authentication token found' };
      }

      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        return { authorized: false, error: 'Authentication failed' };
      }

      const data = await response.json();
      const user = data.user;

      // SECURITY CHECK: Ensure user is a vendor
      if (user.user_type !== 'vendor') {
        console.error('🚨 SECURITY: Non-vendor user attempting to access vendor bookings');
        return { authorized: false, error: 'Vendor access required' };
      }

      // SECURITY CHECK: Validate user ID format to detect malformed IDs
      if (isMalformedUserId(user.id)) {
        console.error('🚨 SECURITY: Malformed user ID detected:', user.id);
        setSecurityAlert('Security issue detected with your account. Please contact support.');
        return { authorized: false, error: 'Account security issue detected' };
      }

      // Get the actual vendor ID from the vendors table
      const vendorResponse = await fetch(`${apiUrl}/api/vendors/by-user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!vendorResponse.ok) {
        return { authorized: false, error: 'Vendor record not found' };
      }

      const vendorData = await vendorResponse.json();
      return { authorized: true, vendorId: vendorData.vendor.id };

    } catch (error) {
      console.error('Authorization check failed:', error);
      return { authorized: false, error: 'Authorization check failed' };
    }
  };

  /**
   * SECURITY UTILITY: Check for malformed user IDs that could cause data leakage
   */
  const isMalformedUserId = (userId: string): boolean => {
    // Check for the problematic pattern: "2-2025-001"
    const problematicPatterns = [
      /^\d+-\d{4}-\d{3}$/,  // Pattern: number-year-sequence
      /^[12]-2025-\d+$/     // Specific pattern causing the issue
    ];
    
    return problematicPatterns.some(pattern => pattern.test(userId));
  };

  /**
   * SECURITY-ENHANCED: Load bookings with proper access control
   */
  const loadBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      if (!vendorId) {
        throw new Error('Vendor ID not available');
      }

      const token = localStorage.getItem('jwt_token') || 
                   localStorage.getItem('authToken') || 
                   localStorage.getItem('auth_token');
      if (!token) {
        throw new SecurityError('Authentication required');
      }

      console.log(`🔐 Loading bookings for vendor: ${vendorId}`);

      const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
        
        setAuthStatus('unauthorized');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

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

      setBookings(mappedBookings);
      console.log(`✅ Loaded ${mappedBookings.length} secure bookings`);

    } catch (error) {
      console.error('❌ Failed to load bookings:', error);
      
      if (error instanceof SecurityError) {
        setSecurityAlert((error as Error).message);
        setAuthStatus('unauthorized');
      } else {
        setError('Failed to load bookings. Please try again.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /**
   * SECURITY-ENHANCED: Load stats with validation
   */
  const loadStats = async () => {
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
  };

  /**
   * Initialize component with security checks
   */
  useEffect(() => {
    const initializeComponent = async () => {
      const authResult = await verifyAuthorization();
      
      if (!authResult.authorized) {
        setError(authResult.error || 'Authorization failed');
        setAuthStatus('unauthorized');
        setLoading(false);
        return;
      }

      setVendorId(authResult.vendorId!);
      setAuthStatus('authorized');
      
      // Load data after authorization is confirmed
      await Promise.all([
        loadBookings(),
        loadStats()
      ]);
    };

    initializeComponent();
  }, []);

  /**
   * Handle security alerts
   */
  const handleSecurityAlert = () => {
    setSecurityAlert(null);
    // Optionally redirect to login or security page
  };

  /**
   * Security-enhanced refresh
   */
  const handleSecureRefresh = async () => {
    setIsRefreshing(true);
    
    // Re-verify authorization before refreshing data
    const authResult = await verifyAuthorization();
    if (!authResult.authorized) {
      setAuthStatus('unauthorized');
      setError('Session expired. Please log in again.');
      setIsRefreshing(false);
      return;
    }

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

  // Unauthorized Access Component
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <VendorHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              {error || 'You do not have permission to access this page.'}
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state during authorization check
  if (authStatus === 'checking' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <VendorHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
              <p className="text-gray-600">
                {authStatus === 'checking' ? 'Verifying access...' : 'Loading your bookings...'}
              </p>
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
                <option value="pending_review">Pending Review</option>
                <option value="quote_sent">Quote Sent</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Your bookings will appear here once customers start booking your services.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{booking.coupleName}</h3>
                            <p className="text-sm text-gray-600">{booking.serviceType}</p>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.eventDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.eventLocation}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₱{booking.totalAmount.toLocaleString()}</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-1" />
                              {booking.guestCount} guests
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'quote_sent' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                              booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(booking, setSelectedBooking, setShowDetailsModal)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleContactClient(booking)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Contact Client"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                            
                            {booking.status === 'pending_review' && (
                              <button
                                onClick={() => handleSendQuote(booking, setSelectedBooking, setShowQuoteModal)}
                                className="px-3 py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors"
                              >
                                Send Quote
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && selectedBooking && (
        <VendorBookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {showQuoteModal && selectedBooking && (
        <SendQuoteModal
          booking={selectedBooking}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedBooking(null);
          }}
          onQuoteSent={() => {
            handleSecureRefresh();
          }}
        />
      )}
    </div>
  );
};

export default VendorBookingsSecure;
