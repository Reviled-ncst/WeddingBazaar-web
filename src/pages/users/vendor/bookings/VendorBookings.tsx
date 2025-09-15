import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  Eye,
  Loader2,
  TrendingUp,
  Package,
  Phone,
  Mail,
  MessageSquare,
  Edit3,
  CreditCard,
  Receipt,
  Map,
  History,
  FileText
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import EventMap from '../../../../shared/components/EventMap';
import PaymentReceipt from '../../../../shared/components/PaymentReceipt';
import { cn } from '../../../../utils/cn';
import { formatPHP, calculateDownpayment } from '../../../../utils/currency';
import { BookingWorkflow } from '../../../../shared/components/booking/BookingWorkflow';

// Import comprehensive booking API and types
import { bookingApiService } from '../../../../services/api/bookingApiService';
import type { 
  Booking, 
  BookingStatus,
  BookingsListResponse,
  BookingStatsResponse 
} from '../../../../shared/types/comprehensive-booking.types';

// Import auth context to get the real vendor ID
import { useAuth } from '../../../../shared/contexts/AuthContext';

// ============================================================================
// UI-FACING TYPES (camelCase for frontend components)
// ============================================================================

// UI-facing booking type with camelCase properties
export interface UIBooking {
  id: string;
  vendorId: string;
  coupleId: string;
  coupleName: string;
  contactEmail: string;
  contactPhone?: string;
  serviceType: string;
  eventDate: string;
  eventTime?: string;
  eventLocation?: string;
  eventAddress?: {
    street?: string;
    city?: string;
    province?: string;
    coordinates?: { lat: number; lng: number };
  };
  guestCount?: number;
  specialRequests?: string;
  status: BookingStatus;
  quoteAmount?: number;
  totalAmount?: number;
  downpaymentAmount?: number;
  depositAmount?: number; // Alias for downpaymentAmount
  totalPaid: number;
  remainingBalance?: number;
  budgetRange?: string;
  preferredContactMethod: string;
  notes?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  // Computed UI properties
  paymentProgressPercentage?: number;
  paymentCount?: number;
  formatted?: {
    totalAmount?: string;
    totalPaid?: string;
    remainingBalance?: string;
    downpaymentAmount?: string;
  };
  responseMessage?: string;
  vendorName: string; // For PaymentReceipt compatibility
}

// UI-facing booking stats type
export interface UIBookingStats {
  totalBookings: number;
  inquiries: number;
  fullyPaidBookings: number;
  totalRevenue: number;
  formatted?: {
    totalRevenue?: string;
  };
}

// UI-facing bookings list response
export interface UIBookingsListResponse {
  bookings: UIBooking[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// MAPPING FUNCTIONS (API snake_case -> UI camelCase)
// ============================================================================

/**
 * Maps API booking (snake_case) to UI booking (camelCase)
 */
function mapToUIBooking(apiBooking: Booking): UIBooking {
  const totalAmount = apiBooking.quoted_price || apiBooking.final_price || 0;
  const totalPaid = apiBooking.total_paid || 0;
  const remainingBalance = totalAmount - totalPaid;
  const paymentProgressPercentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return {
    id: apiBooking.id,
    vendorId: apiBooking.vendor_id,
    coupleId: apiBooking.couple_id,
    coupleName: apiBooking.contact_person || 'Unknown Couple',
    contactEmail: apiBooking.contact_email || '',
    contactPhone: apiBooking.contact_phone,
    serviceType: apiBooking.service_type,
    eventDate: apiBooking.event_date,
    eventTime: apiBooking.event_time,
    eventLocation: apiBooking.event_location,
    eventAddress: undefined, // Not available in current Booking interface
    guestCount: apiBooking.guest_count,
    specialRequests: apiBooking.special_requests,
    status: apiBooking.status,
    quoteAmount: apiBooking.quoted_price,
    totalAmount: totalAmount,
    downpaymentAmount: apiBooking.downpayment_amount,
    depositAmount: apiBooking.downpayment_amount, // Alias for compatibility
    totalPaid: apiBooking.total_paid,
    remainingBalance: apiBooking.remaining_balance || remainingBalance,
    budgetRange: apiBooking.budget_range,
    preferredContactMethod: apiBooking.preferred_contact_method,
    notes: undefined, // Not available in current Booking interface  
    cancelledAt: undefined, // Not available in current Booking interface
    cancelledReason: undefined, // Not available in current Booking interface
    createdAt: apiBooking.created_at,
    updatedAt: apiBooking.updated_at,
    // Computed properties
    paymentProgressPercentage,
    paymentCount: 0, // Would need to be calculated from payments array if available
    formatted: {
      totalAmount: totalAmount ? formatPHP(totalAmount) : undefined,
      totalPaid: totalPaid ? formatPHP(totalPaid) : undefined,
      remainingBalance: remainingBalance > 0 ? formatPHP(remainingBalance) : undefined,
      downpaymentAmount: apiBooking.downpayment_amount ? formatPHP(apiBooking.downpayment_amount) : undefined,
    },
    responseMessage: apiBooking.vendor_response,
    vendorName: apiBooking.vendor_name || 'Unknown Vendor' // For PaymentReceipt compatibility
  };
}

/**
 * Maps API booking stats (snake_case) to UI booking stats (camelCase)
 */
function mapToUIBookingStats(apiStats: BookingStatsResponse): UIBookingStats {
  return {
    totalBookings: apiStats.total_bookings,
    inquiries: apiStats.pending_bookings || 0, // Use pending_bookings as inquiries
    fullyPaidBookings: apiStats.completed_bookings || 0, // Use completed_bookings as fully paid
    totalRevenue: apiStats.total_revenue,
    formatted: {
      totalRevenue: formatPHP(apiStats.total_revenue)
    }
  };
}

/**
 * Maps API bookings list response to UI format
 */
function mapToUIBookingsListResponse(apiResponse: BookingsListResponse): UIBookingsListResponse {
  return {
    bookings: apiResponse.bookings.map(mapToUIBooking),
    pagination: {
      current_page: apiResponse.page,
      total_pages: apiResponse.totalPages,
      total_items: apiResponse.total,
      per_page: apiResponse.limit,
      hasNext: apiResponse.page < apiResponse.totalPages,
      hasPrev: apiResponse.page > 1
    }
  };
}

type FilterStatus = 'all' | BookingStatus;

// Using comprehensive booking types - no local interfaces needed

interface Receipt {
  id: string;
  receiptNumber: string;
  receiptType: string;
  amount: number;
  formatted: {
    amount: string;
  };
  currency: string;
  taxAmount?: number;
  paymentType: string;
  paymentMethod: string;
  paymentReference?: string;
  issuedTo: any;
  issuedBy: any;
  issuedAt: string;
}

const statusConfig = {
  draft: {
    color: 'text-gray-700 bg-gray-100 border-gray-200',
    icon: FileText,
    label: 'Draft'
  },
  quote_requested: {
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    icon: AlertCircle,
    label: 'Quote Requested'
  },
  quote_sent: {
    color: 'text-purple-700 bg-purple-100 border-purple-200',
    icon: FileText,
    label: 'Quote Sent'
  },
  quote_accepted: {
    color: 'text-green-700 bg-green-100 border-green-200',
    icon: CheckCircle,
    label: 'Quote Accepted'
  },
  quote_rejected: {
    color: 'text-red-700 bg-red-100 border-red-200',
    icon: XCircle,
    label: 'Quote Rejected'
  },
  confirmed: {
    color: 'text-green-700 bg-green-100 border-green-200',
    icon: CheckCircle,
    label: 'Confirmed'
  },
  downpayment_paid: {
    color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    icon: CreditCard,
    label: 'Downpayment Received'
  },
  paid_in_full: {
    color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    icon: CheckCircle,
    label: 'Fully Paid'
  },
  in_progress: {
    color: 'text-blue-700 bg-blue-100 border-blue-200',
    icon: Clock,
    label: 'In Progress'
  },
  completed: {
    color: 'text-green-700 bg-green-100 border-green-200',
    icon: CheckCircle,
    label: 'Completed'
  },
  cancelled: {
    color: 'text-gray-700 bg-gray-100 border-gray-200',
    icon: XCircle,
    label: 'Cancelled'
  },
  refunded: {
    color: 'text-orange-700 bg-orange-100 border-orange-200',
    icon: CreditCard,
    label: 'Refunded'
  },
  disputed: {
    color: 'text-red-700 bg-red-100 border-red-200',
    icon: AlertCircle,
    label: 'Disputed'
  }
};

export const VendorBookings: React.FC = () => {
  // Get authenticated vendor user for real vendor ID
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UIBookingStats | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'event_date' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<UIBookingsListResponse['pagination'] | null>(null);
  
  // Enhanced modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'workflow' | 'actions'>('details');
  
  // Payment and receipt data
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  
  // Quote form data
  const [quoteData, setQuoteData] = useState({
    price: '',
    description: '',
    validUntil: '',
    terms: '',
    includes: '',
    excludes: ''
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  
  // Payment processing
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [paymentType, setPaymentType] = useState<'downpayment' | 'installment' | 'final_payment'>('downpayment');
  
  // Use authenticated vendor ID
  const vendorId = user?.id || 'vendor_001'; // Fallback for demo

  useEffect(() => {
    console.log('🔄 [VendorBookings] Effect triggered with:', { vendorId, filterStatus, currentPage });
    if (vendorId && vendorId !== 'vendor_001') { // Only load if we have real vendor ID
      loadBookings();
      loadStats();
    } else {
      // Load demo data for fallback
      loadMockData();
    }
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

  const loadBookings = async () => {
    try {
      setLoading(true);
      console.log('📥 [VendorBookings] Loading bookings with comprehensive API for vendor:', vendorId);
      
      // Map filter status to array format expected by API
      const statusFilter = filterStatus !== 'all' ? [filterStatus] : undefined;
      
      // Calculate sort order - comprehensive API expects 'asc'/'desc'
      const sortOrderLower = sortOrder.toLowerCase() as 'asc' | 'desc';
      
      const response = await bookingApiService.getVendorBookings(vendorId, {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: sortOrderLower
      });

      console.log('✅ [VendorBookings] Comprehensive bookings loaded successfully:', response);
      
      // Map API response to UI format
      const uiResponse = mapToUIBookingsListResponse(response);
      setBookings(uiResponse.bookings);
      setPagination(uiResponse.pagination);
      
    } catch (error) {
      console.error('💥 [VendorBookings] Error loading bookings with comprehensive API:', error);
      console.log('🎭 [VendorBookings] Falling back to mock data...');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Use realistic data based on actual database analysis
    const mockUIBookings: UIBooking[] = [
      {
        id: '12',
        vendorId: '2-2025-003',
        coupleId: 'couple_006',
        coupleName: 'Chris & Amanda Taylor',
        contactEmail: 'chris.taylor@email.com',
        contactPhone: '+1 (555) 678-9012',
        serviceType: 'Hair & Makeup Artists', // Updated to match database categories
        eventDate: '2025-11-10',
        eventTime: '14:00',
        eventLocation: 'Country Club',
        guestCount: 75,
        specialRequests: 'Classical music only',
        status: 'quote_rejected', // mapping from 'declined' in database
        quoteAmount: 1200,
        totalAmount: 1200,
        downpaymentAmount: 240,
        depositAmount: 240,
        totalPaid: 0,
        remainingBalance: 1200,
        budgetRange: '$1000-$1500',
        preferredContactMethod: 'phone',
        createdAt: '2025-08-30T06:53:17.928Z',
        updatedAt: '2025-08-30T06:53:17.928Z',
        paymentProgressPercentage: 0,
        paymentCount: 0,
        formatted: {
          totalAmount: formatPHP(1200),
          totalPaid: formatPHP(0),
          remainingBalance: formatPHP(1200),
          downpaymentAmount: formatPHP(240),
        },
        vendorName: 'Premium Wedding Services'
      },
      {
        id: '11',
        vendorId: '2-2025-003',
        coupleId: 'couple_005',
        coupleName: 'Ryan & Jennifer White',
        contactEmail: 'ryan.white@email.com',
        contactPhone: '+1 (555) 567-8901',
        serviceType: 'Florist', // Already matches database categories
        eventDate: '2024-08-20',
        eventTime: '16:00',
        eventLocation: 'Historic Mansion',
        guestCount: 200,
        specialRequests: 'Centerpieces with baby breath and roses',
        status: 'completed',
        quoteAmount: 1800,
        totalAmount: 1800,
        downpaymentAmount: 360,
        depositAmount: 360,
        totalPaid: 1800,
        remainingBalance: 0,
        budgetRange: '$1500-$2000',
        preferredContactMethod: 'email',
        createdAt: '2025-08-30T06:53:17.854Z',
        updatedAt: '2025-08-30T06:53:17.854Z',
        paymentProgressPercentage: 100,
        paymentCount: 2,
        formatted: {
          totalAmount: formatPHP(1800),
          totalPaid: formatPHP(1800),
          remainingBalance: formatPHP(0),
          downpaymentAmount: formatPHP(360),
        },
        vendorName: 'Premium Wedding Services'
      },
      {
        id: '10',
        vendorId: '2-2025-003',
        coupleId: 'couple_004',
        coupleName: 'Alex & Maria Garcia',
        contactEmail: 'alex.garcia@email.com',
        contactPhone: '+1 (555) 456-7890',
        serviceType: 'Wedding Planner', // Already matches database categories
        eventDate: '2025-12-05',
        eventTime: '15:00',
        eventLocation: 'Mountain Lodge',
        guestCount: 120,
        specialRequests: 'Outdoor ceremony weather backup plan needed',
        status: 'paid_in_full',
        quoteAmount: 2500,
        totalAmount: 2500,
        downpaymentAmount: 500,
        depositAmount: 500,
        totalPaid: 2500,
        remainingBalance: 0,
        budgetRange: '$2000-$3000',
        preferredContactMethod: 'phone',
        createdAt: '2025-08-30T06:53:17.780Z',
        updatedAt: '2025-08-30T06:53:17.780Z',
        paymentProgressPercentage: 100,
        paymentCount: 3,
        formatted: {
          totalAmount: formatPHP(2500),
          totalPaid: formatPHP(2500),
          remainingBalance: formatPHP(0),
          downpaymentAmount: formatPHP(500),
        },
        vendorName: 'Premium Wedding Services'
      },
      {
        id: '9',
        vendorId: '2-2025-003',
        coupleId: 'couple_003',
        coupleName: 'David & Lisa Brown',
        contactEmail: 'david.brown@email.com',
        contactPhone: '+1 (555) 345-6789',
        serviceType: 'Caterer', // Updated to match database categories
        eventDate: '2025-09-30',
        eventTime: '18:00',
        eventLocation: 'Beachfront Resort',
        guestCount: 80,
        specialRequests: 'Vegetarian options required',
        status: 'downpayment_paid', // mapping from 'downpayment' in database
        quoteAmount: 1200,
        totalAmount: 1200,
        downpaymentAmount: 600,
        depositAmount: 600,
        totalPaid: 600,
        remainingBalance: 600,
        budgetRange: '$1000-$1500',
        preferredContactMethod: 'email',
        createdAt: '2025-08-30T06:53:17.706Z',
        updatedAt: '2025-08-30T06:53:17.706Z',
        paymentProgressPercentage: 50,
        paymentCount: 1,
        formatted: {
          totalAmount: formatPHP(1200),
          totalPaid: formatPHP(600),
          remainingBalance: formatPHP(600),
          downpaymentAmount: formatPHP(600),
        },
        vendorName: 'Premium Wedding Services'
      },
      {
        id: '8',
        vendorId: '2-2025-003',
        coupleId: 'couple_002',
        coupleName: 'Mike & Emma Johnson',
        contactEmail: 'mike.johnson@email.com',
        contactPhone: '+1 (555) 234-5678',
        serviceType: 'Photographer & Videographer', // Updated to match database categories
        eventDate: '2025-11-20',
        eventTime: '12:00',
        eventLocation: 'Garden Venue',
        guestCount: 150,
        specialRequests: 'Drone photography for aerial shots',
        status: 'confirmed', // mapping from 'approved' in database
        quoteAmount: 1800,
        totalAmount: 1800,
        downpaymentAmount: 360,
        depositAmount: 360,
        totalPaid: 360,
        remainingBalance: 1440,
        budgetRange: '$1500-$2000',
        preferredContactMethod: 'phone',
        createdAt: '2025-08-30T06:53:17.632Z',
        updatedAt: '2025-08-30T06:53:17.632Z',
        paymentProgressPercentage: 20,
        paymentCount: 1,
        formatted: {
          totalAmount: formatPHP(1800),
          totalPaid: formatPHP(360),
          remainingBalance: formatPHP(1440),
          downpaymentAmount: formatPHP(360),
        },
        vendorName: 'Premium Wedding Services'
      },
      {
        id: '7',
        vendorId: '2-2025-003',
        coupleId: 'couple_001',
        coupleName: 'John & Sarah Smith',
        contactEmail: 'john.smith@email.com',
        contactPhone: '+1 (555) 123-4567',
        serviceType: 'DJ/Band', // Already matches database categories
        eventDate: '2025-10-15',
        eventTime: '19:00',
        eventLocation: 'Downtown Hotel',
        guestCount: 100,
        specialRequests: 'Mix of modern and classic music',
        status: 'quote_requested', // mapping from 'request' in database
        quoteAmount: 2500,
        totalAmount: 2500,
        downpaymentAmount: 500,
        depositAmount: 500,
        totalPaid: 500,
        remainingBalance: 2000,
        budgetRange: '$2000-$3000',
        preferredContactMethod: 'email',
        createdAt: '2025-08-30T06:53:17.558Z',
        updatedAt: '2025-08-30T06:53:17.558Z',
        paymentProgressPercentage: 20,
        paymentCount: 1,
        formatted: {
          totalAmount: formatPHP(2500),
          totalPaid: formatPHP(500),
          remainingBalance: formatPHP(2000),
          downpaymentAmount: formatPHP(500),
        },
        vendorName: 'Premium Wedding Services'
      }
    ];
    
    setBookings(mockUIBookings);
    setPagination({
      current_page: 1,
      total_pages: 1,
      total_items: 6,
      per_page: 10,
      hasNext: false,
      hasPrev: false
    });
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
      console.log('🎭 [VendorBookings] Falling back to realistic mock stats based on actual data...');
      // Realistic stats based on actual database analysis (vendor 2-2025-003)
      const mockStats: UIBookingStats = {
        totalBookings: 6, // Actual count from database
        inquiries: 1, // quote_requested status (mapped from 'request')
        fullyPaidBookings: 2, // completed + paid_in_full statuses  
        totalRevenue: 600000, // ₱11,000 USD = ~₱600,000 PHP (updated realistic conversion)
        formatted: {
          totalRevenue: formatPHP(600000)
        }
      };
      setStats(mockStats);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus, responseMessage?: string) => {
    try {
      console.log('🔄 [VendorBookings] Updating booking status with comprehensive API:', { bookingId, newStatus, responseMessage });
      
      await bookingApiService.updateBookingStatus(bookingId, newStatus, responseMessage);
      
      console.log('✅ [VendorBookings] Booking status updated successfully');
      
      // Reload bookings and stats to reflect changes
      loadBookings();
      loadStats();
      
      // Close modals
      setShowDetails(false);
      setShowUpdateModal(false);
    } catch (error) {
      console.error('💥 [VendorBookings] Failed to update booking status:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleSubmitQuote = async () => {
    if (!selectedBooking || !quoteData.price || !quoteData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmittingQuote(true);
    
    try {
      console.log('📝 [VendorBookings] Submitting quote:', { bookingId: selectedBooking.id, quoteData });
      
      // Create a comprehensive vendor response message
      const vendorResponse = `QUOTE DETAILS:
Price: ${formatPHP(parseFloat(quoteData.price))}
Description: ${quoteData.description}
${quoteData.validUntil ? `Valid Until: ${quoteData.validUntil}` : ''}
${quoteData.terms ? `Terms: ${quoteData.terms}` : ''}
${quoteData.includes ? `Includes: ${quoteData.includes}` : ''}
${quoteData.excludes ? `Excludes: ${quoteData.excludes}` : ''}`;
      
      // Update the booking with the quote price and vendor response
      await bookingApiService.updateBookingStatus(
        selectedBooking.id, 
        'quote_sent', 
        vendorResponse
      );
      
      // Also update the quoted price separately if there's an endpoint for it
      try {
        await bookingApiService.updateBookingPricing(selectedBooking.id, {
          quoted_price: parseFloat(quoteData.price)
        });
      } catch (pricingError) {
        console.log('📝 [VendorBookings] Note: Could not update quoted_price separately, but quote was sent successfully');
      }
      
      console.log('✅ [VendorBookings] Quote submitted successfully');
      
      // Reset form and close modal
      setQuoteData({
        price: '',
        description: '',
        validUntil: '',
        terms: '',
        includes: '',
        excludes: ''
      });
      setShowQuoteModal(false);
      setSelectedBooking(null);
      
      // Reload bookings to reflect changes
      loadBookings();
      loadStats();
      
      alert('Quote sent successfully!');
    } catch (error) {
      console.error('💥 [VendorBookings] Failed to submit quote:', error);
      alert('Failed to send quote. Please try again.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Payment automation functions
  const processAutomatedDownpayment = async (bookingId: string, amount: number) => {
    try {
      setProcessingPayment(true);
      const response = await fetch(`/api/bookings/enhanced/${bookingId}/automate-downpayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethod
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process downpayment: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Reload data
      loadBookings();
      loadStats();
      
      // Show success message
      alert('Downpayment processed successfully!');
      setShowPaymentModal(false);
      
      return data;
    } catch (error) {
      console.error('Failed to process downpayment:', error);
      alert('Failed to process downpayment. Please try again.');
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const processAutomatedFullPayment = async (bookingId: string, amount: number) => {
    try {
      setProcessingPayment(true);
      const response = await fetch(`/api/bookings/enhanced/${bookingId}/automate-full-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethod
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process full payment: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Reload data
      loadBookings();
      loadStats();
      
      // Show success message
      alert('Full payment processed successfully!');
      setShowPaymentModal(false);
      
      return data;
    } catch (error) {
      console.error('Failed to process full payment:', error);
      alert('Failed to process full payment. Please try again.');
      throw error;
    } finally {
      setProcessingPayment(false);
    }
  };

  const loadReceipts = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/enhanced/${bookingId}/receipts`);
      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts);
      }
    } catch (error) {
      console.error('Failed to load receipts:', error);
    }
  };

  const loadStatusHistory = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/enhanced/${bookingId}/status-history`);
      if (response.ok) {
        const data = await response.json();
        setStatusHistory(data.history);
      }
    } catch (error) {
      console.error('Failed to load status history:', error);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedBooking || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      if (paymentType === 'downpayment') {
        await processAutomatedDownpayment(selectedBooking.id, amount);
      } else {
        await processAutomatedFullPayment(selectedBooking.id, amount);
      }
    } catch (error) {
      // Error already handled in the individual functions
    }
  };

  const formatCurrency = (amount?: number) => {
    return amount ? formatPHP(amount) : 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-white">
      <VendorHeader />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-rose-700 to-gray-900 bg-clip-text text-transparent mb-3">
              Booking Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your client bookings and track your business performance
            </p>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
                  </div>
                  <h3 className="text-gray-600 font-medium">Total Bookings</h3>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.inquiries}</span>
                  </div>
                  <h3 className="text-gray-600 font-medium">New Inquiries</h3>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{stats.fullyPaidBookings}</span>
                  </div>
                  <h3 className="text-gray-600 font-medium">Fully Paid</h3>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{stats.formatted?.totalRevenue || formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <h3 className="text-gray-600 font-medium">Total Revenue</h3>
                </div>
              </div>
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
                    <option value="inquiry">New Inquiries</option>
                    <option value="quote_sent">Quote Sent</option>
                    <option value="negotiations">In Negotiations</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="downpayment_paid">Downpayment Received</option>
                    <option value="preparation">In Preparation</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paid_in_full">Fully Paid</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="declined">Declined</option>
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
                    <option value="created_at-DESC">Newest First</option>
                    <option value="created_at-ASC">Oldest First</option>
                    <option value="event_date-ASC">Event Date (Soon)</option>
                    <option value="event_date-DESC">Event Date (Far)</option>
                  </select>

                  {/* Export Button */}
                  <button 
                    onClick={exportBookings}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    title="Export bookings to CSV"
                    aria-label="Export all bookings to CSV file"
                  >
                    <Download className="h-5 w-5" />
                    <span className="font-medium">Export</span>
                  </button>
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
                    {bookings.map((booking) => {
                      const statusInfo = statusConfig[booking.status] || statusConfig.draft;
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <div
                          key={booking.id}
                          className="p-6 hover:bg-white/60 transition-all duration-300 group"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {booking.coupleName}
                                  </h3>
                                  <p className="text-rose-600 font-medium">{booking.serviceType}</p>
                                </div>
                                <div className={cn(
                                  "flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border",
                                  statusInfo.color
                                )}>
                                  <StatusIcon className="h-4 w-4" />
                                  <span>{statusInfo.label}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Calendar className="h-4 w-4 text-rose-500" />
                                  <span>{formatDate(booking.eventDate)}</span>
                                </div>
                                
                                {booking.eventTime && (
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <Clock className="h-4 w-4 text-rose-500" />
                                    <span>{formatTime(booking.eventTime)}</span>
                                  </div>
                                )}
                                
                                {booking.eventLocation && (
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <MapPin className="h-4 w-4 text-rose-500" />
                                    <span className="truncate">{booking.eventLocation}</span>
                                  </div>
                                )}
                                
                                {booking.guestCount && (
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <Users className="h-4 w-4 text-rose-500" />
                                    <span>{booking.guestCount} guests</span>
                                  </div>
                                )}
                              </div>

                              {booking.totalAmount && (
                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <DollarSign className="h-4 w-4 text-green-500" />
                                      <span className="text-lg font-semibold text-gray-900">
                                        {booking.formatted?.totalAmount || formatCurrency(booking.totalAmount)}
                                      </span>
                                    </div>
                                    {booking.totalPaid && booking.totalPaid > 0 && (
                                      <div className="text-sm text-gray-600">
                                        Paid: {booking.formatted?.totalPaid || formatCurrency(booking.totalPaid)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Payment Progress Bar */}
                                  {booking.paymentProgressPercentage !== undefined && booking.paymentProgressPercentage > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={
                                          `bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-300 w-[${Math.min(
                                            booking.paymentProgressPercentage,
                                            100
                                          )}%]`
                                        }
                                      ></div>
                                    </div>
                                  )}
                                  
                                  {booking.paymentProgressPercentage !== undefined && (
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>{booking.paymentProgressPercentage}% paid</span>
                                      {booking.remainingBalance && booking.remainingBalance > 0 && (
                                        <span>Balance: {booking.formatted?.remainingBalance || formatCurrency(booking.remainingBalance)}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              {/* Contact Actions */}
                              <div className="flex items-center space-x-2">
                                {booking.contactPhone && (
                                  <button
                                    className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                                    title={`Call ${booking.contactPhone}`}
                                    aria-label={`Call ${booking.coupleName} at ${booking.contactPhone}`}
                                  >
                                    <Phone className="h-4 w-4" />
                                  </button>
                                )}
                                
                                <button
                                  className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                                  title="Send email"
                                  aria-label={`Send email to ${booking.coupleName}`}
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                                
                                <button
                                  className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                                  title="Send message"
                                  aria-label={`Send message to ${booking.coupleName}`}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowDetails(true);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-200"
                                  title="View booking details"
                                  aria-label={`View details for ${booking.coupleName}'s booking`}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline">Details</span>
                                </button>

                                {/* Payment Actions */}
                                {(booking.status === 'confirmed' || booking.status === 'downpayment_paid') && booking.totalAmount && (
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setPaymentAmount('');
                                      const suggestedAmount = booking.status === 'confirmed' 
                                        ? calculateDownpayment(booking.totalAmount || 0, 30)
                                        : (booking.totalAmount || 0) - (booking.totalPaid || 0);
                                      setPaymentAmount(suggestedAmount.toString());
                                      setPaymentType(booking.status === 'confirmed' ? 'downpayment' : 'final_payment');
                                      setShowPaymentModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    title="Process payment"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                      {booking.status === 'confirmed' ? 'Downpayment' : 'Final Payment'}
                                    </span>
                                  </button>
                                )}

                                {/* Receipt Button */}
                                {booking.paymentCount && booking.paymentCount > 0 && (
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      loadReceipts(booking.id);
                                      setShowReceiptModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-200"
                                    title="View receipts"
                                  >
                                    <Receipt className="h-4 w-4" />
                                    <span className="hidden sm:inline">Receipts</span>
                                  </button>
                                )}

                                {/* Map Button */}
                                {booking.eventAddress?.coordinates && (
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowMapModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-200"
                                    title="View location map"
                                  >
                                    <Map className="h-4 w-4" />
                                    <span className="hidden sm:inline">Map</span>
                                  </button>
                                )}

                                {/* Status History Button */}
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    loadStatusHistory(booking.id);
                                    setShowStatusHistory(true);
                                  }}
                                  className="flex items-center space-x-2 px-3 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-200"
                                  title="View status history"
                                >
                                  <History className="h-4 w-4" />
                                  <span className="hidden sm:inline">History</span>
                                </button>

                                {booking.status === 'quote_requested' && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setShowQuoteModal(true);
                                      }}
                                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                      Send Quote
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(booking.id, 'quote_rejected')}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowUpdateModal(true);
                                  }}
                                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                  title="Update booking"
                                  aria-label={`Update ${booking.coupleName}'s booking`}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.total_pages > 1 && (
                    <div className="px-6 py-4 border-t border-rose-200/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total_items)} of {pagination.total_items} bookings
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-1 text-sm border border-rose-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm bg-rose-100 text-rose-700 rounded-lg">
                            Page {currentPage} of {pagination.total_pages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={!pagination.hasNext}
                            className="px-3 py-1 text-sm border border-rose-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-pink-50/20 rounded-2xl"></div>
            <div className="relative z-10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-rose-200/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close booking details"
                  >
                    ×
                  </button>
                </div>
                
                {/* Tab Navigation */}
                <div className="mt-4 border-b border-gray-200">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={cn(
                        "py-2 px-1 border-b-2 font-medium text-sm",
                        activeTab === 'details'
                          ? "border-rose-500 text-rose-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      Event Details
                    </button>
                    <button
                      onClick={() => setActiveTab('workflow')}
                      className={cn(
                        "py-2 px-1 border-b-2 font-medium text-sm",
                        activeTab === 'workflow'
                          ? "border-rose-500 text-rose-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      Booking Progress
                    </button>
                    <button
                      onClick={() => setActiveTab('actions')}
                      className={cn(
                        "py-2 px-1 border-b-2 font-medium text-sm",
                        activeTab === 'actions'
                          ? "border-rose-500 text-rose-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      Vendor Actions
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Client Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
                    <div className="bg-white/80 rounded-xl p-4 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedBooking.coupleName}</p>
                      <p><span className="font-medium">Phone:</span> {selectedBooking.contactPhone || 'N/A'}</p>
                      <p><span className="font-medium">Preferred Contact:</span> {selectedBooking.preferredContactMethod}</p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Event Details</h3>
                    <div className="bg-white/80 rounded-xl p-4 space-y-2">
                      <p><span className="font-medium">Service:</span> {selectedBooking.serviceType}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(selectedBooking.eventDate)}</p>
                      <p><span className="font-medium">Time:</span> {formatTime(selectedBooking.eventTime)}</p>
                      <p><span className="font-medium">Location:</span> {selectedBooking.eventLocation || 'N/A'}</p>
                      <p><span className="font-medium">Guest Count:</span> {selectedBooking.guestCount || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Financial */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
                    <div className="bg-white/80 rounded-xl p-4 space-y-2">
                      <p><span className="font-medium">Budget Range:</span> {selectedBooking.budgetRange || 'N/A'}</p>
                      <p><span className="font-medium">Total Amount:</span> {formatCurrency(selectedBooking.totalAmount)}</p>
                      <p><span className="font-medium">Deposit:</span> {formatCurrency(selectedBooking.depositAmount || selectedBooking.downpaymentAmount || 0)}</p>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.specialRequests && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                      <div className="bg-white/80 rounded-xl p-4">
                        <p className="text-gray-700">{selectedBooking.specialRequests}</p>
                      </div>
                    </div>
                  )}

                  {/* Response Message */}
                  {selectedBooking.responseMessage && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Response</h3>
                      <div className="bg-white/80 rounded-xl p-4">
                        <p className="text-gray-700">{selectedBooking.responseMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Workflow Tab */}
                {activeTab === 'workflow' && (
                  <BookingWorkflow 
                    booking={selectedBooking}
                    onUpdate={() => {
                      // Refresh booking data
                      loadBookings();
                      loadStats();
                    }}
                  />
                )}

                {/* Actions Tab */}
                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quote Actions */}
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          Quote Management
                        </h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowQuoteModal(true)}
                            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <FileText className="h-5 w-5" />
                            <span>Send Quote</span>
                          </button>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      <div className="bg-green-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-green-500" />
                          Payment Actions
                        </h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <CreditCard className="h-5 w-5" />
                            <span>Process Payment</span>
                          </button>
                          <button
                            onClick={() => setShowReceiptModal(true)}
                            className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Receipt className="h-4 w-4" />
                            <span>View Receipts</span>
                          </button>
                        </div>
                      </div>

                      {/* Status Management */}
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-500" />
                          Status Management
                        </h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => setShowUpdateModal(true)}
                            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <Edit3 className="h-5 w-5" />
                            <span>Update Status</span>
                          </button>
                          <button
                            onClick={() => setShowStatusHistory(true)}
                            className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                          >
                            <History className="h-4 w-4" />
                            <span>Status History</span>
                          </button>
                        </div>
                      </div>

                      {/* Communication */}
                      <div className="bg-pink-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-pink-500" />
                          Communication
                        </h3>
                        <div className="space-y-3">
                          <button className="w-full px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                            <MessageSquare className="h-5 w-5" />
                            <span>Message Client</span>
                          </button>
                          <div className="flex space-x-2">
                            {selectedBooking.contactPhone && (
                              <button className="flex-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors flex items-center justify-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>Call</span>
                              </button>
                            )}
                            <button className="flex-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors flex items-center justify-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Status Update Buttons */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Status Updates</h3>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedBooking.id, 'in_progress')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          <Clock className="h-4 w-4" />
                          <span>In Progress</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {showUpdateModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
                 onClick={() => setShowUpdateModal(false)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative inline-block w-full max-w-md p-6 mx-auto my-8 text-left bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">Update Booking Status</h3>
                  <p className="text-gray-600 mt-2">{selectedBooking.coupleName}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirm Booking</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'quote_rejected')}
                    className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <XCircle className="h-5 w-5" />
                    <span>Decline Booking</span>
                  </button>

                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'completed')}
                      className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Mark as Completed</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
                 onClick={() => setShowPaymentModal(false)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative inline-block w-full max-w-lg p-6 mx-auto my-8 text-left bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
            >
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">Process Payment</h3>
                  <p className="text-gray-600 mt-2">{selectedBooking.coupleName}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      aria-label="Select payment type"
                      title="Select payment type"
                    >
                      <option value="downpayment">Downpayment (30%)</option>
                      <option value="installment">Installment Payment</option>
                      <option value="final_payment">Final Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (PHP)
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {selectedBooking.totalAmount && (
                      <p className="text-sm text-gray-500 mt-1">
                        Total Amount: {formatCurrency(selectedBooking.totalAmount)}
                        {paymentType === 'downpayment' && (
                          <span className="ml-2">
                            (Suggested: {formatCurrency(calculateDownpayment(selectedBooking.totalAmount, 30))})
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      aria-label="Select payment method"
                      title="Select payment method"
                    >
                      <option value="online">Online Payment</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={processingPayment || !paymentAmount}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Process Payment</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
                 onClick={() => setShowReceiptModal(false)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative inline-block w-full max-w-4xl p-6 mx-auto my-8 text-left bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Payment Receipts</h3>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                    aria-label="Close receipt modal"
                    title="Close receipt modal"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {receipts.length > 0 ? (
                    receipts.map((receipt) => (
                      <PaymentReceipt
                        key={receipt.id}
                        receipt={receipt}
                        booking={selectedBooking}
                        onDownload={() => {
                          // Implement receipt download functionality
                          console.log('Download receipt:', receipt.receiptNumber);
                        }}
                        className="border border-gray-200"
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No receipts found for this booking</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && selectedBooking && selectedBooking.eventAddress?.coordinates && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
                 onClick={() => setShowMapModal(false)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative inline-block w-full max-w-4xl p-6 mx-auto my-8 text-left bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Event Location</h3>
                    <p className="text-gray-600">{selectedBooking.eventLocation}</p>
                  </div>
                  <button
                    onClick={() => setShowMapModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                    aria-label="Close map modal"
                    title="Close map modal"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <EventMap
                  latitude={selectedBooking.eventAddress.coordinates.lat}
                  longitude={selectedBooking.eventAddress.coordinates.lng}
                  eventLocation={selectedBooking.eventLocation}
                  eventAddress={typeof selectedBooking.eventAddress === 'string' 
                    ? selectedBooking.eventAddress 
                    : `${selectedBooking.eventAddress.street || ''}, ${selectedBooking.eventAddress.city || ''}, ${selectedBooking.eventAddress.province || ''}`}
                  height="500px"
                  zoom={16}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showStatusHistory && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
                 onClick={() => setShowStatusHistory(false)}></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative inline-block w-full max-w-2xl p-6 mx-auto my-8 text-left bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Status History</h3>
                  <button
                    onClick={() => setShowStatusHistory(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                    aria-label="Close status history modal"
                    title="Close status history modal"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {statusHistory.length > 0 ? (
                    <div className="space-y-3">
                      {statusHistory.map((entry, index) => (
                        <div key={entry.id} className="flex items-start space-x-4 p-4 bg-white/80 rounded-xl border border-gray-200">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {entry.previousStatus && `${entry.previousStatus} → `}
                                  <span className="text-rose-600">{entry.newStatus}</span>
                                </p>
                                <p className="text-sm text-gray-600">{entry.changeReason}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {new Date(entry.changedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                  by {entry.changedBy}
                                  {entry.isAutomated && (
                                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      Auto
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No status history available</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Send Quote</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a detailed quote for {selectedBooking.coupleName}'s {selectedBooking.serviceType} booking
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowQuoteModal(false);
                    setQuoteData({
                      price: '',
                      description: '',
                      validUntil: '',
                      terms: '',
                      includes: '',
                      excludes: ''
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Summary */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Event Date</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBooking.eventDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Type</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedBooking.serviceType}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900">{selectedBooking.eventLocation}</p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-600">Client Notes</p>
                      <p className="text-gray-900 text-sm">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Price * <span className="text-red-500">Required</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      value={quoteData.price}
                      onChange={(e) => setQuoteData({ ...quoteData, price: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Description * <span className="text-red-500">Required</span>
                  </label>
                  <textarea
                    value={quoteData.description}
                    onChange={(e) => setQuoteData({ ...quoteData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    placeholder="Describe what's included in your service package..."
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Valid Until
                  </label>
                  <input
                    type="date"
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Includes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's Included
                  </label>
                  <textarea
                    value={quoteData.includes}
                    onChange={(e) => setQuoteData({ ...quoteData, includes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    placeholder="List what's included in this package..."
                  />
                </div>

                {/* Excludes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's NOT Included
                  </label>
                  <textarea
                    value={quoteData.excludes}
                    onChange={(e) => setQuoteData({ ...quoteData, excludes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    placeholder="List any exclusions or additional costs..."
                  />
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={quoteData.terms}
                    onChange={(e) => setQuoteData({ ...quoteData, terms: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    placeholder="Payment terms, cancellation policy, etc..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4">
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setQuoteData({
                    price: '',
                    description: '',
                    validUntil: '',
                    terms: '',
                    includes: '',
                    excludes: ''
                  });
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmittingQuote}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                disabled={isSubmittingQuote || !quoteData.price || !quoteData.description}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmittingQuote ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sending Quote...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    <span>Send Quote</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
