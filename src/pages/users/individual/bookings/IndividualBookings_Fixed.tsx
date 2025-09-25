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
  vendor?: VendorProfile | null;
  service?: ServicePackage | null;
  formattedDate?: string;
  formattedTime?: string;
  daysUntilEvent?: number;
}

// Define filter types aligned with new API
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
type ViewMode = 'grid' | 'list';

export const IndividualBookings: React.FC = () => {
  console.log('🔍 [IndividualBookings] Component starting to render');
  
  // Get authenticated user for real user ID
  const { user } = useAuth();
  
  // State management
  const [bookings, setBookings] = useState<EnhancedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // User ID - use authenticated user or fallback
  const userId = user?.id || 'user-couple-1';
  
  console.log('🔍 [IndividualBookings] User ID:', userId);

  // Load bookings data
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 [Bookings] Loading bookings for user:', userId);
      
      // Create filters for API call
      const filters: BookingFilters = {};
      if (filterStatus !== 'all') {
        filters.status = [filterStatus];
      }
      filters.sortBy = 'date';
      filters.sortOrder = 'desc';
      
      // Get bookings from real backend API service - centralized method
      const bookingResponse = await bookingApiService.getCoupleBookings(userId, {
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        status: filters.status
      });
      
      console.log('📊 [Bookings] Raw booking response:', bookingResponse);
      
      if (!bookingResponse.success || !bookingResponse.bookings) {
        console.error('❌ [Bookings] Failed to fetch bookings:', bookingResponse);
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const bookingData = bookingResponse.bookings;
      console.log('📊 [Bookings] Processing bookings:', bookingData);
      
      // Enhance bookings with basic data transformation (simplified for now)
      const enhancedBookings: EnhancedBooking[] = bookingData.map((booking: any) => {
        console.log('🔍 [Bookings] Raw booking structure:', booking);
        
        // Calculate days until event if event date exists
        let daysUntilEvent = 0;
        let formattedDate = 'TBD';
        let formattedTime = 'TBD';
        
        try {
          if (booking.event_date || booking.eventDetails?.date) {
            const eventDate = new Date(booking.event_date || booking.eventDetails.date);
            const today = new Date();
            daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            formattedDate = eventDate.toLocaleDateString();
            formattedTime = booking.event_time || booking.eventDetails?.time || 'TBD';
          }
        } catch (err) {
          console.warn('Error processing event date:', err);
        }
        
        // Create enhanced booking with available data
        const enhanced: EnhancedBooking = {
          ...booking,
          // Map backend fields to frontend expected fields
          id: booking.id,
          vendorName: booking.vendor_name || booking.vendorName || 'Unknown Vendor',
          vendorBusinessName: booking.vendor_name || booking.vendorBusinessName,
          serviceType: booking.service_type || booking.serviceType || 'Wedding Service',
          serviceName: booking.service_name || booking.serviceName || 'Wedding Service',
          status: booking.status || 'pending',
          totalAmount: booking.total_amount || booking.totalAmount || 0,
          downpaymentAmount: booking.down_payment || booking.downpaymentAmount || 0,
          remainingBalance: booking.remaining_balance || booking.remainingBalance || 0,
          eventDate: booking.event_date || booking.eventDate || formattedDate,
          eventTime: booking.event_time || booking.eventTime || formattedTime,
          eventLocation: booking.event_location || booking.eventLocation || 'TBD',
          formattedDate,
          formattedTime,
          daysUntilEvent,
          createdAt: booking.created_at || booking.createdAt,
          updatedAt: booking.updated_at || booking.updatedAt
        };
        
        console.log('✅ [Bookings] Enhanced booking:', enhanced);
        return enhanced;
      });
      
      console.log('📊 [Bookings] Enhanced bookings:', enhancedBookings);
      
      setBookings(enhancedBookings);
      
    } catch (err) {
      console.error('❌ [Bookings] Error loading bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load bookings on component mount and when filters change
  useEffect(() => {
    loadBookings();
  }, [userId, filterStatus]);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.vendor?.name.toLowerCase().includes(query) ||
        booking.service?.name.toLowerCase().includes(query) ||
        booking.eventDetails.location.venue.toLowerCase().includes(query) ||
        booking.eventDetails.location.city.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [bookings, searchQuery]);

  // Handle booking actions
  const handleViewDetails = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingApiService.cancelBooking(bookingId, 'Cancelled by user');
      await loadBookings(); // Reload bookings
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  // Filter counts for tabs
  const filterCounts = useMemo(() => {
    const counts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      acc.all = (acc.all || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return counts;
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <CoupleHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">
                Manage your wedding service bookings and track your progress
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'grid'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                List
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bookings by vendor, service, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'pending', label: 'Pending' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as FilterStatus)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filterStatus === filter.key
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-pink-600 hover:bg-pink-50 shadow-sm'
                )}
              >
                {filter.label}
                {filterCounts[filter.key] && (
                  <span className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs',
                    filterStatus === filter.key
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {filterCounts[filter.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={loadBookings}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Bookings Content */}
        {!loading && !error && (
          <>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Start booking vendors for your special day!'}
                </p>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    viewMode={viewMode}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelBooking}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetails(false);
            setSelectedBooking(null);
          }}
          onUpdate={loadBookings}
        />
      )}
    </div>
  );
};

// Booking Card Component
interface BookingCardProps {
  booking: EnhancedBooking;
  viewMode: ViewMode;
  onViewDetails: (booking: EnhancedBooking) => void;
  onCancel: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, viewMode, onViewDetails, onCancel }) => {
  const isGridView = viewMode === 'grid';
  
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200',
      isGridView ? 'h-full' : 'flex'
    )}>
      {/* Service Image */}
      <div className={cn(
        'relative bg-gradient-to-br from-pink-100 to-rose-100',
        isGridView ? 'h-48' : 'w-48 flex-shrink-0'
      )}>
        {booking.service?.images && booking.service.images.length > 0 ? (
          <img 
            src={booking.service.images[0]} 
            alt={booking.service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            getStatusColor(booking.status) === 'green' && 'bg-green-100 text-green-800',
            getStatusColor(booking.status) === 'yellow' && 'bg-yellow-100 text-yellow-800',
            getStatusColor(booking.status) === 'blue' && 'bg-blue-100 text-blue-800',
            getStatusColor(booking.status) === 'gray' && 'bg-gray-100 text-gray-800',
            getStatusColor(booking.status) === 'red' && 'bg-red-100 text-red-800'
          )}>
            {getStatusLabel(booking.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={cn('p-6', !isGridView && 'flex-1')}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {booking.service?.name || 'Wedding Service'}
          </h3>
          <p className="text-sm text-gray-600">
            by {booking.vendor?.name || 'Wedding Vendor'}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {booking.formattedDate} at {booking.formattedTime}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {booking.eventDetails.location.venue}, {booking.eventDetails.location.city}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {formatPrice(booking.pricing.total, booking.pricing.currency)}
          </div>
        </div>

        {/* Days Until Event */}
        {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && (
          <div className="mb-4 p-2 bg-pink-50 rounded-lg">
            <p className="text-sm text-pink-700 font-medium">
              {booking.daysUntilEvent} days until your event
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
          >
            View Details
          </button>
          
          {booking.status === 'pending' && (
            <button
              onClick={() => onCancel(booking.id)}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Booking Details Modal Component
interface BookingDetailsModalProps {
  booking: EnhancedBooking;
  onClose: () => void;
  onUpdate: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'details' | 'contact' | 'timeline'>('overview');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  // Handle tab change with animation
  const handleTabChange = (newTab: 'overview' | 'details' | 'contact' | 'timeline') => {
    if (newTab === activeTab) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsAnimating(false);
    }, 150);
  };

  // Get booking progress percentage
  const getBookingProgress = (status: string): number => {
    switch (status) {
      case 'pending': return 25;
      case 'confirmed': return 50;
      case 'in_progress': return 75;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Enhanced Header with Status */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {booking.service?.name || 'Wedding Service'}
                  </h2>
                  <p className="text-pink-100 text-lg">
                    by {booking.vendor?.name || 'Wedding Vendor'}
                  </p>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between text-xs text-pink-100 mb-2">
                  <span>Booking Progress</span>
                  <span>{getBookingProgress(booking.status)}% Complete</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                  <div 
                    className={cn(
                      "bg-gradient-to-r from-white to-pink-200 h-2 rounded-full transition-all duration-500 ease-out",
                      getBookingProgress(booking.status) === 25 && "w-1/4",
                      getBookingProgress(booking.status) === 50 && "w-1/2", 
                      getBookingProgress(booking.status) === 75 && "w-3/4",
                      getBookingProgress(booking.status) === 100 && "w-full",
                      getBookingProgress(booking.status) === 0 && "w-0"
                    )}
                  ></div>
                </div>
              </div>

              {/* Key Info Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm',
                  getStatusColor(booking.status) === 'green' && 'bg-green-500/30 border-green-300/50',
                  getStatusColor(booking.status) === 'yellow' && 'bg-yellow-500/30 border-yellow-300/50',
                  getStatusColor(booking.status) === 'blue' && 'bg-blue-500/30 border-blue-300/50',
                  getStatusColor(booking.status) === 'red' && 'bg-red-500/30 border-red-300/50'
                )}>
                  {getStatusLabel(booking.status)}
                </span>
                
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm">
                  💰 {formatPrice(booking.pricing.total, booking.pricing.currency)}
                </span>
                
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm">
                  📅 {booking.formattedDate}
                </span>
                
                {booking.eventDetails.guestCount > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm">
                    👥 {booking.eventDetails.guestCount} guests
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
              title="Close modal"
              aria-label="Close booking details modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: '📋' },
              { key: 'details', label: 'Event Details', icon: '🎯' },
              { key: 'contact', label: 'Vendor Info', icon: '👥' },
              { key: 'timeline', label: 'Timeline', icon: '⏰' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={cn(
                  'py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 relative group',
                  activeTab === tab.key
                    ? 'border-pink-500 text-pink-600 bg-pink-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <span className="mr-2 transition-transform group-hover:scale-110">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tabbed Content */}
        <div className={cn(
          "flex-1 overflow-y-auto transition-opacity duration-150",
          isAnimating ? "opacity-50" : "opacity-100"
        )}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Event Summary Card */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Event Summary</h3>
                  {booking.daysUntilEvent !== undefined && booking.daysUntilEvent > 0 && (
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold">
                      {booking.daysUntilEvent} days to go!
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-900">{booking.formattedDate}</p>
                      <p className="text-sm text-gray-700">{booking.formattedTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-semibold text-gray-900">{booking.eventDetails.location.venue}</p>
                      <p className="text-sm text-gray-700">{booking.eventDetails.location.city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="font-bold text-lg text-gray-900">{formatPrice(booking.pricing.total, booking.pricing.currency)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {booking.vendor?.contactInfo.phone && (
                  <a
                    href={`tel:${booking.vendor.contactInfo.phone}`}
                    className="group flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-blue-700 font-semibold">Call Vendor</span>
                  </a>
                )}
                
                {booking.vendor?.contactInfo.email && (
                  <a
                    href={`mailto:${booking.vendor.contactInfo.email}`}
                    className="group flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-green-700 font-semibold">Email Vendor</span>
                  </a>
                )}
                
                <button
                  onClick={() => handleTabChange('details')}
                  className="group flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-purple-700 font-semibold">View Details</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('timeline')}
                  className="group flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 border border-orange-200 hover:border-orange-300 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  <svg className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-orange-700 font-semibold">Timeline</span>
                </button>
              </div>

              {/* Service Description */}
              {booking.service?.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Service Description
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {showFullDescription || booking.service.description.length <= 200
                        ? booking.service.description
                        : `${booking.service.description.substring(0, 200)}...`}
                    </p>
                    {booking.service.description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-2 text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                      >
                        {showFullDescription ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-xl border border-green-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Pricing Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">{formatPrice(booking.pricing.basePrice, booking.pricing.currency)}</span>
                  </div>
                  {booking.pricing.addOns > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-medium text-blue-600">+{formatPrice(booking.pricing.addOns, booking.pricing.currency)}</span>
                    </div>
                  )}
                  {booking.pricing.discount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-{formatPrice(booking.pricing.discount, booking.pricing.currency)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-pink-600">{formatPrice(booking.pricing.total, booking.pricing.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Tab */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Event Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Event Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date & Time</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{booking.formattedDate}</p>
                      <p className="text-gray-700">{booking.formattedTime}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Duration</label>
                      <p className="text-gray-900 mt-1">{booking.eventDetails.duration}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Guest Count</label>
                      <p className="text-gray-900 mt-1">{booking.eventDetails.guestCount} guests</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Venue Location</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900">{booking.eventDetails.location.venue}</p>
                      <p className="text-gray-700 mt-1">{booking.eventDetails.location.address}</p>
                      <p className="text-gray-700">{booking.eventDetails.location.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              {booking.service && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Service Package Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</label>
                      <p className="text-gray-900 mt-2 leading-relaxed">{booking.service.description}</p>
                    </div>
                    
                    {booking.service.inclusions && booking.service.inclusions.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">What's Included</label>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {booking.service.inclusions.map((inclusion, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{inclusion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {(booking.clientNotes || booking.vendorNotes) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                    </svg>
                    Notes & Communications
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {booking.clientNotes && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="text-sm font-medium text-blue-800 uppercase tracking-wide">Your Notes</label>
                        <p className="text-blue-900 mt-2">{booking.clientNotes}</p>
                      </div>
                    )}
                    
                    {booking.vendorNotes && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <label className="text-sm font-medium text-green-800 uppercase tracking-wide">Vendor Notes</label>
                        <p className="text-green-900 mt-2">{booking.vendorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vendor Contact Tab */}
          {activeTab === 'contact' && booking.vendor && (
            <div className="p-6 space-y-6">
              {/* Vendor Profile Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-pink-100 rounded-xl">
                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m2 0H7m0 0H5m2 0h2M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{booking.vendor.name}</h3>
                    <p className="text-gray-600 mt-1">{booking.vendor.category}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {booking.vendor && Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < Math.floor(booking.vendor!.rating) ? 'text-yellow-400' : 'text-gray-300'
                            )}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        {booking.vendor && (
                          <span className="ml-2 text-sm text-gray-600">
                            {booking.vendor.rating} ({booking.vendor.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                      <a
                        href={`tel:${booking.vendor.contactInfo.phone}`}
                        className="block text-blue-600 hover:text-blue-800 font-medium mt-1"
                      >
                        {booking.vendor.contactInfo.phone}
                      </a>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                      <a
                        href={`mailto:${booking.vendor.contactInfo.email}`}
                        className="block text-blue-600 hover:text-blue-800 font-medium mt-1"
                      >
                        {booking.vendor.contactInfo.email}
                      </a>
                    </div>
                    
                    {booking.vendor.contactInfo.website && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Website</label>
                        <a
                          href={booking.vendor.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 font-medium mt-1"
                        >
                          Visit Website →
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Business Location
                  </h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</label>
                    <p className="text-gray-900 mt-1">{booking.vendor.location}</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href={`tel:${booking.vendor.contactInfo.phone}`}
                  className="flex items-center justify-center space-x-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-semibold">Call Now</span>
                </a>
                
                <a
                  href={`mailto:${booking.vendor.contactInfo.email}?subject=Wedding Booking Inquiry - ${booking.service?.name}`}
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Send Email</span>
                </a>
                
{booking.vendor?.contactInfo.phone && (
                  <button
                    onClick={() => window.open(`https://wa.me/${booking.vendor!.contactInfo.phone.replace(/\D/g, '')}`, '_blank')}
                    className="flex items-center justify-center space-x-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    <span className="font-semibold">WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-6">
              <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-xl border border-orange-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Booking Progress Timeline
                </h3>
                
                <div className="space-y-6">
                  {/* Timeline Items */}
                  <div className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-blue-100">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="ml-4 flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">Booking Request Sent</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Completed</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Your booking request was submitted and is being processed</p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDateTime(booking.timeline.requestDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.timeline.responseDate && (
                    <div className="relative">
                      <div className="absolute left-5 top-0 w-px h-6 bg-gradient-to-b from-blue-200 to-green-200"></div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-green-100">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Vendor Responded</h4>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">The vendor has reviewed and responded to your request</p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDateTime(booking.timeline.responseDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.timeline.confirmedDate && (
                    <div className="relative">
                      <div className="absolute left-4 top-0 w-px h-6 bg-gray-200"></div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">Booking Confirmed</h4>
                          <p className="text-sm text-gray-500 mt-1">Your booking has been confirmed by the vendor</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDateTime(booking.timeline.confirmedDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.timeline.completedDate && (
                    <div className="relative">
                      <div className="absolute left-4 top-0 w-px h-6 bg-gray-200"></div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">Service Completed</h4>
                          <p className="text-sm text-gray-500 mt-1">The wedding service has been successfully completed</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDateTime(booking.timeline.completedDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                getStatusColor(booking.status) === 'green' && 'bg-green-100 text-green-800',
                getStatusColor(booking.status) === 'yellow' && 'bg-yellow-100 text-yellow-800',
                getStatusColor(booking.status) === 'blue' && 'bg-blue-100 text-blue-800',
                getStatusColor(booking.status) === 'gray' && 'bg-gray-100 text-gray-800',
                getStatusColor(booking.status) === 'red' && 'bg-red-100 text-red-800'
              )}>
                {getStatusLabel(booking.status)}
              </span>
              
              {booking.contractSigned && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Contract Signed
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              
              {booking.vendor?.contactInfo.phone && (
                <a
                  href={`tel:${booking.vendor.contactInfo.phone}`}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Contact Vendor
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualBookings;
