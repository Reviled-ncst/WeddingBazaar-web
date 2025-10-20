// Booking types and status config for BookingCard UI
import type { 
  BookingStatus, 
  Booking as ComprehensiveBooking,
  BookingRequest
} from '../../../../../shared/types/comprehensive-booking.types';

// Re-export types from comprehensive-booking.types for easier importing
export type { BookingRequest } from '../../../../../shared/types/comprehensive-booking.types';

// Status config for BookingCard UI
export const statusConfig: Record<BookingStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: 'FileText' },
  request: { label: 'Request Sent', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'MessageSquare' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-300', icon: 'CheckCircle' },
  quote_requested: { label: 'Quote Requested', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: 'AlertCircle' },
  quote_sent: { label: 'Quote Sent', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: 'AlertCircle' },
  quote_accepted: { label: 'Quote Accepted', color: 'bg-green-100 text-green-800 border-green-300', icon: 'CheckCircle' },
  quote_rejected: { label: 'Quote Rejected', color: 'bg-red-100 text-red-800 border-red-300', icon: 'XCircle' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'CheckCircle' },
  downpayment_paid: { label: 'Downpayment Paid', color: 'bg-pink-100 text-pink-800 border-pink-300', icon: 'CreditCard' },
  downpayment: { label: 'Downpayment Paid', color: 'bg-pink-100 text-pink-800 border-pink-300', icon: 'CreditCard' },
  paid_in_full: { label: 'Paid in Full', color: 'bg-green-100 text-green-800 border-green-300', icon: 'CreditCard' },
  fully_paid: { label: 'Fully Paid', color: 'bg-green-100 text-green-800 border-green-300', icon: 'CreditCard' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'Clock' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300', icon: 'CheckCircle' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-300', icon: 'XCircle' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800 border-red-300', icon: 'XCircle' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'CreditCard' },
  disputed: { label: 'Disputed', color: 'bg-red-100 text-red-800 border-red-300', icon: 'AlertCircle' },
};

// UI-facing Booking type (camelCase, with derived/optional fields)
export interface Booking {
  id: string;
  bookingReference?: string | null;
  vendorId: string;
  vendorName?: string; // may require join; fallback to vendorId
  vendorEmail?: string | null;
  vendorPhone?: string | null;
  coupleId: string;
  coupleName?: string | null;
  serviceType: string;
  serviceName: string;
  eventDate: string; // ISO/date
  eventTime?: string | null;
  eventLocation?: string | null;
  venueDetails?: string | null;
  guestCount?: number | null;
  specialRequests?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  preferredContactMethod?: string | null;
  budgetRange?: string | null;
  totalAmount?: number | null; // maps from final_price or quoted_price/total_amount legacy
  downpaymentAmount?: number | null;
  remainingBalance?: number | null;
  totalPaid?: number | null;
  
  // Itemized services (parsed from vendor_notes for easier access)
  serviceItems?: Array<{
    id: string | number;
    name: string;
    description?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  status: BookingStatus;
  responseMessage?: string | null; // vendor_response
  vendorNotes?: string | null; // JSON string containing detailed quote data with serviceItems
  paymentProgressPercentage?: number; // computed from totalPaid/totalAmount
  formatted?: {
    totalAmount?: string;
    downpaymentAmount?: string;
    remainingBalance?: string;
    totalPaid?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UIBookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  totalPaid: number;
  pendingPayments: number;
  formatted?: {
    totalSpent?: string;
    totalPaid?: string;
    pendingPayments?: string;
  };
}

export interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter type used by UI controls (includes legacy labels)
export type FilterStatus = 'all' | BookingStatus;

// Map UI filter to API statuses
export function mapFilterStatusToStatuses(filter: FilterStatus): BookingStatus[] | undefined {
  if (filter === 'all') return undefined;
  // Return the specific status as an array
  return [filter];
}

// Mapper from comprehensive booking to UI booking
export function mapToUIBooking(b: ComprehensiveBooking): Booking {
  const totalAmount = b.final_price ?? b.quoted_price ?? (b as any).total_amount ?? null;
  const totalPaid = b.total_paid ?? null;
  const remainingBalance = b.remaining_balance ?? (totalAmount != null && totalPaid != null ? Math.max(totalAmount - totalPaid, 0) : null);
  const pct = totalAmount && totalPaid != null && totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : undefined;

  const formatPHP = (n?: number | null) => (typeof n === 'number' ? `₱${n.toLocaleString()}` : undefined);

  return {
    id: b.id,
    bookingReference: b.booking_reference ?? null,
    vendorId: b.vendor_id,
    vendorName: (b as any).vendor_name || b.vendor_id,
    vendorEmail: (b as any).contact_email ?? null,
    vendorPhone: (b as any).contact_phone ?? null,
    coupleId: b.couple_id,
    coupleName: (b as any).couple_name ?? null,
    serviceType: b.service_type,
    serviceName: b.service_name,
    eventDate: b.event_date,
    eventTime: b.event_time ?? null,
    eventLocation: b.event_location ?? null,
    venueDetails: b.venue_details ?? null,
    guestCount: b.guest_count ?? null,
    specialRequests: b.special_requests ?? null,
    contactPerson: b.contact_person ?? null,
    contactPhone: b.contact_phone ?? null,
    contactEmail: b.contact_email ?? null,
    preferredContactMethod: b.preferred_contact_method ?? null,
    budgetRange: b.budget_range ?? null,
    totalAmount,
    downpaymentAmount: b.downpayment_amount ?? null,
    remainingBalance,
    totalPaid,
    status: b.status,
    responseMessage: b.vendor_response ?? null,
    paymentProgressPercentage: pct,
    formatted: {
      totalAmount: formatPHP(totalAmount),
      downpaymentAmount: formatPHP(b.downpayment_amount ?? null),
      remainingBalance: formatPHP(remainingBalance ?? null),
      totalPaid: formatPHP(totalPaid ?? null),
    },
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

// Mapper function to convert UI form data to comprehensive booking request
export function mapToComprehensiveBookingRequest(formData: any): BookingRequest {
  return {
    vendor_id: formData.vendorId || formData.vendor_id,
    service_id: formData.serviceId || formData.service_id,
    event_date: formData.eventDate || formData.event_date,
    event_time: formData.eventTime || formData.event_time,
    event_end_time: formData.eventEndTime || formData.event_end_time,
    event_location: formData.eventLocation || formData.event_location,
    venue_details: formData.venueDetails || formData.venue_details,
    guest_count: formData.guestCount || formData.guest_count,
    service_type: formData.serviceType || formData.service_type,
    service_name: formData.serviceName || formData.service_name,
    service_description: formData.serviceDescription || formData.service_description,
    special_requests: formData.specialRequests || formData.special_requests,
    contact_person: formData.contactPerson || formData.contact_person,
    contact_phone: formData.contactPhone || formData.contact_phone,
    contact_email: formData.contactEmail || formData.contact_email,
    preferred_contact_method: formData.preferredContactMethod || formData.preferred_contact_method,
    budget_range: formData.budgetRange || formData.budget_range,
    metadata: formData.metadata || {}
  };
}
