import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Loader2,
  MessageSquare,
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
  Download
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { VendorBookingDetailsModal } from './components/VendorBookingDetailsModal';
import { SendQuoteModal } from './components/SendQuoteModal';

// Import our separate utility files
import { 
  transformBookingData, 
  type BookingRawData, 
  type ProcessedBookingData 
} from './utils/bookingDataMapper';
import { 
  downloadBookings, 
  generateSummaryReport,
  type DownloadOptions 
} from './utils/downloadUtils';
import { 
  handleEmailContact, 
  handlePhoneContact, 
  handleViewDetails, 
  handleSendQuote,
  validateBookingForAction,
  type ContactOptions 
} from './utils/bookingActions';

// Import existing services (don't break what's working)
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';
import type { BookingStatus } from '../../../../shared/types/comprehensive-booking.types';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { formatPHP } from '../../../../utils/currency';
import { useNotifications } from '../../../../shared/components/notifications/NotificationProvider';

type FilterStatus = 'all' | BookingStatus;

interface UIBookingStats {
  totalBookings: number;
  inquiries: number;
  fullyPaidBookings: number;
  totalRevenue: number;
  formatted?: {
    totalRevenue: string;
  };
}

interface UIBookingsListResponse {
  bookings: ProcessedBookingData[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const VendorBookingsModular: React.FC = () => {
  // Get authenticated vendor user for real vendor ID
  const { user } = useAuth();
  
  // Notification system
  const { showSuccess, showError } = useNotifications();
  
  const [bookings, setBookings] = useState<ProcessedBookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UIBookingStats | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<ProcessedBookingData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'event_date' | 'status' | 'updated_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UIBookingsListResponse['pagination'] | null>(null);
  
  // Enhanced UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  
  // Use authenticated vendor ID
  const vendorId = user?.role === 'vendor' ? user.id : user?.vendorId;
  
  // Security check: Block access if no valid vendor ID
  if (!vendorId) {
    console.error('🚫 [VendorBookingsModular] SECURITY: No valid vendor ID found. Access denied.');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You must be logged in as a vendor to access this page.</p>
        </div>
      </div>
    );
  }
  
  // API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

  useEffect(() => {
    console.log('🔄 [VendorBookingsModular] Effect triggered with:', { vendorId, filterStatus, currentPage });
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

  const loadBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      console.log('🔄 [VendorBookingsModular] Loading bookings for vendor:', vendorId);
      
      const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
      const data = await response.json();
      
      console.log(`🔗 [VendorBookingsModular] API Response:`, data);
      
      if (data.success && data.bookings && data.bookings.length > 0) {
        console.log(`✅ [VendorBookingsModular] Found ${data.bookings.length} bookings`);
        
        // Transform raw booking data using our separate utility
        const transformedBookings = await Promise.all(
          data.bookings.map((booking: BookingRawData) => 
            transformBookingData(booking, vendorId)
          )
        );
        
        console.log('🎯 [VendorBookingsModular] Transformed bookings:', transformedBookings.length);
        setBookings(transformedBookings);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_items: transformedBookings.length,
          per_page: 10,
          hasNext: false,
          hasPrev: false
        });
        
        if (!silent && transformedBookings.length > 0) {
          showSuccess('Bookings Loaded', `Found ${transformedBookings.length} booking${transformedBookings.length === 1 ? '' : 's'}`);
        }
      } else {
        console.log('ℹ️ [VendorBookingsModular] No bookings found');
        setBookings([]);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          per_page: 10,
          hasNext: false,
          hasPrev: false
        });
      }
      
    } catch (error) {
      console.error('💥 [VendorBookingsModular] Error loading bookings:', error);
      if (!silent) {
        showError('Loading Failed', 'Failed to load bookings. Please try again.');
      }
      setBookings([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 [VendorBookingsModular] Loading stats for vendor:', vendorId);
      
      // Calculate stats from current bookings data (real data approach)
      const realStats: UIBookingStats = {
        totalBookings: bookings.length,
        inquiries: bookings.filter(b => b.status === 'pending' || b.status === 'quote_requested').length,
        fullyPaidBookings: bookings.filter(b => b.paymentProgressPercentage >= 100).length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        formatted: {
          totalRevenue: formatPHP(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))
        }
      };
      setStats(realStats);
    } catch (error) {
      console.error('💥 [VendorBookingsModular] Error loading stats:', error);
    }
  };

  // Fetch service data for quote prefilling
  const fetchServiceDataForQuote = async (booking: ProcessedBookingData) => {
    try {
      console.log('🔍 [VendorBookingsModular] Fetching service data for booking:', booking.id);
      
      const response = await fetch(`${apiUrl}/api/services/vendor/${vendorId}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.services && result.services.length > 0) {
          const matchingService = result.services.find((service: any) => 
            service.category?.toLowerCase() === booking.serviceType.toLowerCase() ||
            service.name?.toLowerCase().includes(booking.serviceType.toLowerCase())
          );
          
          if (matchingService) {
            console.log('✅ [VendorBookingsModular] Found matching service:', matchingService.name);
            return {
              id: matchingService.id,
              name: matchingService.name,
              category: matchingService.category,
              features: matchingService.features || [],
              price: matchingService.price || '10000',
              description: matchingService.description || ''
            };
          }
        }
      }
      
      console.log('⚠️ [VendorBookingsModular] No service data available');
      return null;
    } catch (error) {
      console.error('❌ [VendorBookingsModular] Error fetching service data:', error);
      return null;
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

  // Handle download action using our separate utility
  const handleDownload = (format: 'csv' | 'json' = 'csv') => {
    try {
      const options: DownloadOptions = { 
        format,
        dateRange: dateRange !== 'all' ? {
          start: new Date(Date.now() - (dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        } : undefined
      };
      
      downloadBookings(bookings, vendorId, options);
      showSuccess('Download Started', `Your ${format.toUpperCase()} file is being prepared`);
    } catch (error) {
      console.error('Download failed:', error);
      showError('Download Failed', 'Failed to generate download file. Please try again.');
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = bookings
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
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-white">
      <VendorHeader />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Enhanced Header */}
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
                  Manage your client bookings and track business performance
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-xl hover:bg-rose-50 transition-all duration-300 shadow-lg"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
                
                {/* Download Button */}
                <div className="relative group">
                  <button
                    onClick={() => handleDownload('csv')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>
                  
                  {/* Download Options Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-2">
                      <button
                        onClick={() => handleDownload('csv')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Download as CSV
                      </button>
                      <button
                        onClick={() => handleDownload('json')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Download as JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {/* Total Bookings */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Bookings</h3>
              </motion.div>

              {/* New Inquiries */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats.inquiries}</span>
                </div>
                <h3 className="text-gray-600 font-medium">New Inquiries</h3>
              </motion.div>

              {/* Fully Paid */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stats.fullyPaidBookings}</span>
                </div>
                <h3 className="text-gray-600 font-medium">Fully Paid</h3>
              </motion.div>

              {/* Total Revenue */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.formatted?.totalRevenue || formatPHP(stats.totalRevenue)}
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Revenue</h3>
              </motion.div>
            </motion.div>
          )}

          {/* Continue with the rest of the component... */}
          {/* I'll create the rest in the next file to keep it modular */}
        </div>
      </div>
    </div>
  );
};

export default VendorBookingsModular;
