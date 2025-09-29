// Enhanced Booking List Component with Advanced Filtering
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortDesc, 
  Calendar,
  Grid3X3,
  List,
  Download,
  RefreshCw
} from 'lucide-react';
import { EnhancedBookingCard, type EnhancedBooking } from './EnhancedBookingCard';
import { cn } from '../../../utils/cn';

interface BookingFilters {
  status: string;
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  serviceType: string;
  sortBy: 'created_at' | 'event_date' | 'status' | 'amount';
  sortOrder: 'ASC' | 'DESC';
}

interface EnhancedBookingListProps {
  bookings: EnhancedBooking[];
  userType: 'individual' | 'vendor' | 'admin';
  loading?: boolean;
  onRefresh?: () => void;
  onViewDetails?: (booking: EnhancedBooking) => void;
  onSendQuote?: (booking: EnhancedBooking) => void;
  onAcceptQuote?: (booking: EnhancedBooking) => void;
  onPayment?: (booking: EnhancedBooking, paymentType: 'downpayment' | 'remaining_balance' | 'full_payment') => void;
  onContact?: (booking: EnhancedBooking) => void;
  onExport?: () => void;
  className?: string;
}

export const EnhancedBookingList: React.FC<EnhancedBookingListProps> = ({
  bookings,
  userType,
  loading = false,
  onRefresh,
  onViewDetails,
  onSendQuote,
  onAcceptQuote,
  onPayment,
  onContact,
  onExport,
  className
}) => {
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    dateRange: 'all',
    serviceType: 'all',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort bookings
  const filteredBookings = React.useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.serviceName?.toLowerCase().includes(query) ||
        booking.vendorName?.toLowerCase().includes(query) ||
        booking.vendorBusinessName?.toLowerCase().includes(query) ||
        booking.coupleName?.toLowerCase().includes(query) ||
        booking.clientName?.toLowerCase().includes(query) ||
        booking.eventLocation?.toLowerCase().includes(query) ||
        booking.bookingReference?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Service type filter
    if (filters.serviceType !== 'all') {
      filtered = filtered.filter(booking => booking.serviceType === filters.serviceType);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate >= startDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'event_date':
          aValue = new Date(a.eventDate);
          bValue = new Date(b.eventDate);
          break;
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bookings, searchQuery, filters]);

  // Get unique service types for filter
  const serviceTypes = React.useMemo(() => {
    const types = [...new Set(bookings.map(b => b.serviceType))];
    return types.filter(Boolean);
  }, [bookings]);

  // Status options based on user type
  const statusOptions = React.useMemo(() => {
    const baseStatuses = [
      { value: 'all', label: 'All Statuses' },
      { value: 'quote_requested', label: 'Quote Requested' },
      { value: 'quote_sent', label: 'Quote Sent' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'downpayment_paid', label: 'Deposit Paid' },
      { value: 'paid_in_full', label: 'Fully Paid' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];
    
    return baseStatuses;
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Search and Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
                showFilters 
                  ? "bg-pink-50 border-pink-200 text-pink-700"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={cn(
                "px-3 py-2 rounded-lg transition-all duration-200",
                viewMode === 'grid' 
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={cn(
                "px-3 py-2 rounded-lg transition-all duration-200",
                viewMode === 'list' 
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            </div>

            {/* Action Buttons */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Refresh bookings"
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                title="Export bookings"
                className="p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all duration-200"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  aria-label="Filter by status"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={filters.serviceType}
                  onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  aria-label="Filter by service type"
                >
                  <option value="all">All Services</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  aria-label="Filter by date range"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex gap-1">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    aria-label="Sort by field"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="event_date">Event Date</option>
                    <option value="status">Status</option>
                    <option value="amount">Amount</option>
                  </select>
                  <button
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' 
                    }))}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors"
                    title={`Sort ${filters.sortOrder === 'ASC' ? 'descending' : 'ascending'}`}
                  >
                    <SortDesc className={cn(
                      "h-4 w-4 transition-transform",
                      filters.sortOrder === 'ASC' && "rotate-180"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredBookings.length}</span> of <span className="font-semibold text-gray-900">{bookings.length}</span> bookings
        </div>
        
        {searchQuery && (
          <div className="text-sm text-gray-500">
            Search results for: <span className="font-medium text-gray-700">"{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* Booking Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? `No bookings match your search "${searchQuery}"`
              : "You don't have any bookings yet"
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <EnhancedBookingCard
                booking={booking}
                userType={userType}
                onViewDetails={onViewDetails}
                onSendQuote={onSendQuote}
                onAcceptQuote={onAcceptQuote}
                onPayment={onPayment}
                onContact={onContact}
                className={viewMode === 'list' ? 'max-w-none' : ''}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
