import React, { useState, useEffect, useCallback } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';
import { mapToEnhancedBooking, type UIBooking } from '../../../../shared/utils/booking-data-mapping';
import { QuoteAcceptanceService } from '../../../../shared/services/QuoteAcceptanceService';
import { PayMongoPaymentModal } from '../../../../shared/components/PayMongoPaymentModal';
import { BookingDetailsModal, QuoteDetailsModal } from './components';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Heart,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Eye,
  MessageSquare,
  Star,
  Filter,
  Search,
  ChevronDown,
  Sparkles,
  Gift,
  Package
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { BookingStatus } from '../../../../shared/types/comprehensive-booking.types';
import type { PaymentType } from '../payment/types/payment.types';

// Enhanced Booking Type
interface EnhancedBooking {
  id: string | number;
  serviceType: string;
  serviceName?: string;
  vendorName: string;
  vendorId: string;
  status: BookingStatus;
  eventDate: string;
  eventTime?: string;
  eventEndTime?: string;
  eventLocation?: string;
  venueDetails?: string;
  guestCount?: number;
  budgetRange?: string;
  totalAmount?: number;
  depositAmount?: number;
  downpaymentAmount?: number;
  totalPaid?: number;
  remainingBalance?: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  formatted?: {
    eventDate?: string;
    eventTime?: string;
    totalAmount?: string;
    downpaymentAmount?: string;
    totalPaid?: string;
    remainingBalance?: string;
  };
  hasQuote?: boolean;
  quoteData?: any;
  bookingReference?: string;
}

// Status configuration
const statusConfig = {
  request: {
    label: 'Inquiry Sent',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: MessageSquare,
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200'
  },
  quote_sent: {
    label: 'Quote Received',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: Gift,
    bgGradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200'
  },
  quote_accepted: {
    label: 'Quote Accepted',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle,
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: CheckCircle,
    bgGradient: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: TrendingUp,
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Star,
    bgGradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    bgGradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200'
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: AlertCircle,
    bgGradient: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-200'
  }
};

export const IndividualBookings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<EnhancedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<EnhancedBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    booking: null as any,
    paymentType: 'downpayment' as PaymentType,
    loading: false
  });

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await bookingApiService.getCoupleBookings(user.id, {
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (response.bookings && response.bookings.length > 0) {
        const uiBookings = response.bookings.map((booking: any) =>
          mapToEnhancedBooking(booking)
        );

        const enhancedBookings: EnhancedBooking[] = uiBookings.map((uiBooking: UIBooking) => {
          const displayStatus = QuoteAcceptanceService.getDisplayStatus({
            id: uiBooking.id,
            status: uiBooking.status
          });

          return {
            ...uiBooking,
            status: displayStatus,
            remainingBalance: (uiBooking.totalAmount || 0) - (uiBooking.totalPaid || 0)
          } as EnhancedBooking;
        });

        setBookings(enhancedBookings);
        setFilteredBookings(enhancedBookings);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (err) {
      console.error('❌ Error loading bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings];

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.eventLocation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, bookings]);

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => ['request', 'quote_sent'].includes(b.status)).length,
    confirmed: bookings.filter(b => ['confirmed', 'quote_accepted'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  // Handlers
  const handleViewDetails = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleViewQuote = (booking: EnhancedBooking) => {
    setSelectedBooking(booking);
    setShowQuoteDetails(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <CoupleHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-700">Loading your bookings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <CoupleHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-3 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Bookings</h1>
              <p className="text-lg text-gray-600 mt-1">Manage your wedding service reservations</p>
            </div>
          </div>
        </div>

        {/* To be continued in next part */}
      </div>
    </div>
  );
};
