import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Eye,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import type { ProcessedBookingData } from '../utils/bookingDataMapper';
import { 
  handleEmailContact, 
  handlePhoneContact, 
  handleViewDetails, 
  handleSendQuote,
  validateBookingForAction
} from '../utils/bookingActions';

interface BookingListSectionProps {
  bookings: ProcessedBookingData[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  setSelectedBooking: (booking: ProcessedBookingData) => void;
  setShowDetails: (show: boolean) => void;
  setShowQuoteModal: (show: boolean) => void;
  setSelectedServiceData: (data: any) => void;
  fetchServiceDataForQuote: (booking: ProcessedBookingData) => Promise<any>;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
}

export const BookingListSection: React.FC<BookingListSectionProps> = ({
  bookings,
  loading,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  dateRange,
  setDateRange,
  setSelectedBooking,
  setShowDetails,
  setShowQuoteModal,
  setSelectedServiceData,
  fetchServiceDataForQuote,
  showSuccess,
  showError
}) => {

  return (
    <>
      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 mb-8 shadow-lg"
      >
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
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="quote_requested">New Inquiries</option>
              <option value="quote_sent">Quote Sent</option>
              <option value="quote_accepted">Quote Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="downpayment_paid">Downpayment Received</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="paid_in_full">Fully Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>

          <div className="flex gap-4">
            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setSortBy(sort);
                setSortOrder(order);
              }}
              className="px-4 py-3 border border-rose-200/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
            >
              <option value="created_at-DESC">Latest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="updated_at-DESC">Recently Updated</option>
              <option value="event_date-ASC">By Event Date</option>
              <option value="status-ASC">By Status</option>
            </select>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-rose-200/30">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {booking.coupleName}
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status === 'request' ? 'New Request' : 
                           booking.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <p className="font-medium text-gray-900">{booking.eventLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Guests:</span>
                          <p className="font-medium text-gray-900">
                            {typeof booking.guestCount === 'number' ? 
                              `${booking.guestCount} guests` : 
                              booking.guestCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <p className="font-medium text-gray-900">{booking.eventTime}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <p className="font-medium text-gray-900">
                          {booking.formatted.totalAmount}
                        </p>
                      </div>
                    </div>
                    
                    {/* Payment Progress Bar - Only show if there's a real amount */}
                    {booking.totalAmount > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Payment Progress</span>
                          <span>{booking.formatted.paymentProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(booking.paymentProgressPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Special Requests - Only show if meaningful */}
                    {booking.specialRequests && 
                     booking.specialRequests !== 'No special requirements specified' && 
                     booking.specialRequests !== 'No special requests' && (
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Special Requests:</span>
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                    <button
                      onClick={() => {
                        handleViewDetails(booking, setSelectedBooking, setShowDetails);
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    
                    {(booking.status === 'request' || booking.status === 'quote_requested') && (
                      <button
                        onClick={async () => {
                          await handleSendQuote(
                            booking,
                            setSelectedBooking,
                            setShowQuoteModal,
                            setSelectedServiceData,
                            fetchServiceDataForQuote
                          );
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 text-sm font-medium"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Quote
                      </button>
                    )}
                    
                    {/* Contact Options */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const validation = validateBookingForAction(booking, 'email');
                          if (validation.valid) {
                            handleEmailContact(booking, { template: 'inquiry_response' });
                          } else {
                            showError('Contact Failed', validation.message || 'Unable to send email');
                          }
                        }}
                        className="flex items-center justify-center px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-300 text-sm"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          const validation = validateBookingForAction(booking, 'phone');
                          if (validation.valid) {
                            handlePhoneContact(booking);
                          } else {
                            showError('Contact Failed', validation.message || 'Phone number not available');
                          }
                        }}
                        className="flex items-center justify-center px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-300 text-sm"
                        title="Call Client"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
};
