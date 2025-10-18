import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  Download,
  Eye,
  Ban,
  User,
  Building,
  CreditCard,
  Award
} from 'lucide-react';
import { AdminLayout } from '../shared';

/**
 * Admin Bookings Management
 * 
 * Environment Configuration:
 * - VITE_USE_MOCK_BOOKINGS=true  -> Use mock/sample data (75 bookings)
 * - VITE_USE_MOCK_BOOKINGS=false -> Use real API data from backend
 * 
 * If not set or API fails, falls back to mock data automatically.
 */

// Booking interface - aligned with database schema (enhanced with rich data)
interface AdminBooking {
  id: string;
  bookingReference: string;
  userId: string;
  vendorId: string;
  serviceId: string;
  userName: string;
  vendorName: string;
  serviceName: string;
  serviceCategory: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  bookingDate: string;
  eventDate: string;
  duration: number;
  totalAmount: number;
  paidAmount: number;
  commission: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  clientContact: {
    email: string;
    phone?: string;
  };
  vendorContact: {
    email: string;
    phone?: string;
  };
  // Additional rich data fields
  eventLocation?: string;
  eventTime?: string;
  guestCount?: number;
  budgetRange?: string;
  processStage?: string;
  progressPercentage?: number;
  nextAction?: string;
  nextActionBy?: string;
  hasAmounts?: boolean; // Flag to indicate if financial amounts are set
}

// Sample data for development
const generateSampleBookings = (): AdminBooking[] => {
  const statuses: AdminBooking['status'][] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'];
  const paymentStatuses: AdminBooking['paymentStatus'][] = ['pending', 'partial', 'paid', 'refunded', 'failed'];
  const categories = ['Photography', 'Catering', 'Venues', 'Music & DJ', 'Planning', 'Flowers', 'Beauty', 'Transportation'];
  const vendors = ['Perfect Weddings Co.', 'Elegant Events', 'Dream Catchers', 'Blissful Moments', 'Royal Affairs'];
  const clients = ['John & Sarah Smith', 'Mike & Emily Johnson', 'David & Lisa Brown', 'Tom & Anna Wilson'];

  return Array.from({ length: 75 }, (_, i) => ({
    id: `booking-${i + 1}`,
    bookingReference: `WB${String(10000 + i).slice(-4)}`,
    userId: `user-${Math.floor(Math.random() * 50) + 1}`,
    vendorId: `vendor-${Math.floor(Math.random() * 20) + 1}`,
    serviceId: `service-${Math.floor(Math.random() * 100) + 1}`,
    userName: clients[Math.floor(Math.random() * clients.length)],
    vendorName: vendors[Math.floor(Math.random() * vendors.length)],
    serviceName: `${categories[Math.floor(Math.random() * categories.length)]} Service`,
    serviceCategory: categories[Math.floor(Math.random() * categories.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    bookingDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    eventDate: new Date(Date.now() + Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    duration: Math.floor(Math.random() * 8) + 1,
    totalAmount: Math.floor(Math.random() * 5000) + 500,
    paidAmount: Math.floor(Math.random() * 3000),
    commission: Math.floor(Math.random() * 500) + 50,
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
    paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'Bank Transfer',
    notes: Math.random() > 0.7 ? 'Special requirements noted' : undefined,
    cancellationReason: statuses[Math.floor(Math.random() * statuses.length)] === 'cancelled' ? 'Client request' : undefined,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    clientContact: {
      email: `client${i + 1}@example.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    },
    vendorContact: {
      email: `vendor${Math.floor(Math.random() * 20) + 1}@example.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    },
  }));
};

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AdminBooking['status'] | 'all'>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<AdminBooking['paymentStatus'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'bookingDate' | 'eventDate' | 'totalAmount' | 'status'>('bookingDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Load bookings data
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      
      // Check if we should use mock data
      const useMockData = import.meta.env.VITE_USE_MOCK_BOOKINGS === 'true';
      
      if (useMockData) {
        console.log('📊 [AdminBookings] Using mock data (VITE_USE_MOCK_BOOKINGS=true)');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setBookings(generateSampleBookings());
        setLoading(false);
        return;
      }
      
      try {
        console.log('🌐 [AdminBookings] Fetching real data from API...');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bookings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ [AdminBookings] Loaded ${data.bookings?.length || 0} bookings from API`);
          
          // Map database schema to frontend interface with rich data
          const mappedBookings: AdminBooking[] = (data.bookings || []).map((booking: any) => {
            // Handle NULL/missing amounts properly - don't default to 0
            const hasTotalAmount = booking.total_amount !== null && booking.total_amount !== undefined;
            const hasDepositAmount = booking.deposit_amount !== null && booking.deposit_amount !== undefined;
            
            const totalAmount = hasTotalAmount ? parseFloat(booking.total_amount) : 0;
            const paidAmount = hasDepositAmount ? parseFloat(booking.deposit_amount) : 0;
            const commission = hasTotalAmount ? totalAmount * 0.1 : 0;
            
            return {
              id: booking.id?.toString() || '',
              bookingReference: booking.booking_reference || `WB${String(booking.id).padStart(4, '0')}`,
              userId: booking.couple_id || '',
              vendorId: booking.vendor_id || '',
              serviceId: booking.service_id || '',
              userName: booking.couple_name || 'Unknown Client',
              vendorName: booking.vendor_name || 'Unknown Vendor',
              serviceName: booking.service_name || 'Service',
              serviceCategory: booking.service_type || 'Other',
              status: mapDatabaseStatus(booking.status || 'pending'),
              bookingDate: booking.created_at || new Date().toISOString(),
              eventDate: booking.event_date || new Date().toISOString(),
              duration: 1,
              totalAmount: totalAmount,
              paidAmount: paidAmount,
              commission: commission,
              // Add flag to indicate if amounts are set
              hasAmounts: hasTotalAmount,
              paymentStatus: mapPaymentStatus(booking.status || 'pending'),
              paymentMethod: booking.preferred_contact_method || 'Not specified',
              notes: booking.special_requests || booking.notes || undefined,
              cancellationReason: booking.status === 'cancelled' ? 'Cancelled' : undefined,
              createdAt: booking.created_at || new Date().toISOString(),
              updatedAt: booking.updated_at || new Date().toISOString(),
              // Use real contact info from database
              clientContact: {
                email: booking.couple_email || 'N/A',
                phone: booking.contact_phone || booking.couple_phone || undefined
              },
              vendorContact: {
                email: booking.vendor_email || 'N/A',
                phone: booking.vendor_phone || undefined
              },
              // Additional fields for richer display
              eventLocation: booking.event_location,
              eventTime: booking.event_time,
              guestCount: booking.guest_count,
              budgetRange: booking.budget_range,
              processStage: booking.process_stage,
              progressPercentage: booking.progress_percentage,
              nextAction: booking.next_action,
              nextActionBy: booking.next_action_by
            };
          });
          
          setBookings(mappedBookings);
        } else {
          console.warn(`⚠️ [AdminBookings] API returned ${response.status}, falling back to mock data`);
          setBookings(generateSampleBookings());
        }
      } catch (error) {
        console.error('❌ [AdminBookings] API request failed, falling back to mock data:', error);
        setBookings(generateSampleBookings());
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentPage, itemsPerPage]);

  // Map database status to frontend status
  const mapDatabaseStatus = (dbStatus: string): AdminBooking['status'] => {
    const statusMap: Record<string, AdminBooking['status']> = {
      'request': 'pending',
      'approved': 'confirmed',
      'downpayment': 'in_progress',
      'fully_paid': 'in_progress',
      'completed': 'completed',
      'declined': 'cancelled',
      'cancelled': 'cancelled'
    };
    return statusMap[dbStatus] || 'pending';
  };

  // Map database status to payment status
  const mapPaymentStatus = (dbStatus: string): AdminBooking['paymentStatus'] => {
    const paymentMap: Record<string, AdminBooking['paymentStatus']> = {
      'request': 'pending',
      'approved': 'pending',
      'downpayment': 'partial',
      'fully_paid': 'paid',
      'completed': 'paid',
      'declined': 'failed',
      'cancelled': 'refunded'
    };
    return paymentMap[dbStatus] || 'pending';
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      const matchesSearch = searchTerm === '' || 
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
      const matchesPaymentStatus = filterPaymentStatus === 'all' || booking.paymentStatus === filterPaymentStatus;
      const matchesCategory = filterCategory === 'all' || booking.serviceCategory === filterCategory;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus && matchesCategory;
    });

    // Sort bookings
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'bookingDate':
          valueA = new Date(a.bookingDate).getTime();
          valueB = new Date(b.bookingDate).getTime();
          break;
        case 'eventDate':
          valueA = new Date(a.eventDate).getTime();
          valueB = new Date(b.eventDate).getTime();
          break;
        case 'totalAmount':
          valueA = a.totalAmount;
          valueB = b.totalAmount;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return filtered;
  }, [bookings, searchTerm, filterStatus, filterPaymentStatus, filterCategory, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredAndSortedBookings.slice(startIndex, endIndex);

  // Statistics - only count revenue from bookings with amounts set
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    
    // Only sum amounts from bookings that have amounts set
    const bookingsWithAmounts = bookings.filter(b => b.hasAmounts);
    const totalRevenue = bookingsWithAmounts.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCommission = bookingsWithAmounts.reduce((sum, b) => sum + b.commission, 0);
    const pendingQuotes = bookings.filter(b => !b.hasAmounts).length;

    return { 
      total, 
      pending, 
      confirmed, 
      completed, 
      totalRevenue, 
      totalCommission,
      pendingQuotes  // Number of bookings awaiting pricing
    };
  }, [bookings]);

  const getStatusIcon = (status: AdminBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <Ban className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AdminBooking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: AdminBooking['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      switch (action) {
        case 'confirm':
          console.log(`Confirming booking ${bookingId}`);
          break;
        case 'cancel':
          console.log(`Cancelling booking ${bookingId}`);
          break;
        case 'refund':
          console.log(`Processing refund for booking ${bookingId}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  return (
    <AdminLayout title="Booking Management" subtitle="Monitor and manage all platform bookings">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Booking Management
              </h1>
              <p className="text-gray-600">Monitor and manage all platform bookings</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all">
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.confirmed.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.completed.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commission</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCommission)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AdminBooking['status'] | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Filter by booking status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as AdminBooking['paymentStatus'] | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Filter by payment status"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Filter by service category"
              >
                <option value="all">All Categories</option>
                <option value="Photography">Photography</option>
                <option value="Catering">Catering</option>
                <option value="Venues">Venues</option>
                <option value="Music & DJ">Music & DJ</option>
                <option value="Planning">Planning</option>
                <option value="Flowers">Flowers</option>
                <option value="Beauty">Beauty</option>
                <option value="Transportation">Transportation</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                aria-label="Sort bookings by"
              >
                <option value="bookingDate">Booking Date</option>
                <option value="eventDate">Event Date</option>
                <option value="totalAmount">Total Amount</option>
                <option value="status">Status</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <TrendingUp className={`w-5 h-5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
              {currentBookings.map((booking) => (
                <div key={booking.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
                  {/* Background gradient accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
                  
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.bookingReference}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-pink-600 mb-1">{booking.serviceCategory}</p>
                      <p className="text-sm text-gray-600">{booking.serviceName}</p>
                    </div>
                    
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Booking actions menu"
                      aria-label="Booking actions menu"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Participants Section */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <User className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">Client</p>
                          <p className="font-semibold text-gray-900 truncate">{booking.userName}</p>
                          <p className="text-xs text-gray-600 truncate">{booking.clientContact.email}</p>
                          {booking.clientContact.phone && (
                            <p className="text-xs text-gray-600">{booking.clientContact.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">Vendor</p>
                          <p className="font-semibold text-gray-900 truncate">{booking.vendorName}</p>
                          <p className="text-xs text-gray-600 truncate">{booking.vendorContact.email}</p>
                          {booking.vendorContact.phone && (
                            <p className="text-xs text-gray-600">{booking.vendorContact.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Details */}
                    {booking.hasAmounts ? (
                      // Show actual amounts if they exist
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <DollarSign className="w-4 h-4 text-green-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-green-900">{formatCurrency(booking.totalAmount)}</p>
                          <p className="text-xs text-green-600">Total</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                          <CreditCard className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-blue-900">{formatCurrency(booking.paidAmount)}</p>
                          <p className="text-xs text-blue-600">Paid</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                          <Award className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                          <p className="text-lg font-bold text-purple-900">{formatCurrency(booking.commission)}</p>
                          <p className="text-xs text-purple-600">Commission</p>
                        </div>
                      </div>
                    ) : (
                      // Show "Pending Quote" if amounts not set
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-amber-900 mb-1">Pending Quote</p>
                        <p className="text-xs text-amber-700">Awaiting vendor pricing and confirmation</p>
                        {/* Show budget range if available */}
                        {booking.budgetRange && (
                          <div className="mt-3 pt-3 border-t border-amber-300">
                            <p className="text-xs text-amber-600 mb-1">Client Budget Range</p>
                            <p className="text-sm font-bold text-amber-900">{booking.budgetRange}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Status - only show if amounts are set */}
                    {booking.hasAmounts && (
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-600">Payment Status</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          <CreditCard className="w-3 h-3" />
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                    )}

                    {/* Event Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">Event Date:</span>
                        <span className="text-gray-900">{formatDate(booking.eventDate)}</span>
                      </div>
                      {booking.eventTime && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Time:</span>
                          <span className="text-gray-900">{booking.eventTime}</span>
                        </div>
                      )}
                      {booking.eventLocation && (
                        <div className="flex items-start gap-2 text-gray-700">
                          <Building className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">Location:</span>
                            <p className="text-gray-900 text-xs mt-0.5">{booking.eventLocation}</p>
                          </div>
                        </div>
                      )}
                      {booking.guestCount && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Guests:</span>
                          <span className="text-gray-900">{booking.guestCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar (if available) */}
                    {booking.progressPercentage !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{booking.progressPercentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 ${
                              booking.progressPercentage === 0 ? 'w-0' :
                              booking.progressPercentage <= 25 ? 'w-1/4' :
                              booking.progressPercentage <= 50 ? 'w-1/2' :
                              booking.progressPercentage <= 75 ? 'w-3/4' :
                              'w-full'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Notes/Special Requests */}
                    {booking.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-900 mb-1">Special Requests:</p>
                        <p className="text-xs text-amber-800">{booking.notes}</p>
                      </div>
                    )}

                    {/* Timeline Info */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-3 border-t border-gray-200">
                      <div>
                        <span className="block mb-1">Booked on:</span>
                        <span className="font-medium text-gray-700">{formatDate(booking.bookingDate)}</span>
                      </div>
                      <div>
                        <span className="block mb-1">Last updated:</span>
                        <span className="font-medium text-gray-700">{formatDate(booking.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => console.log('View booking', booking.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-lg transition-all duration-200 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleBookingAction(booking.id, 'confirm')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl transition-colors ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};
