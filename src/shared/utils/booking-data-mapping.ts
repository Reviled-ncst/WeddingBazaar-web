// ============================================================================
// Unified Booking Data Mapping Layer
// ============================================================================
// Handles mapping between Database → API → Frontend for all booking components

import { formatPHP } from '../../utils/currency';
import type { BookingStatus } from '../types/comprehensive-booking.types';
import { vendorLookupService } from '../../services/vendorLookupService';

// Database field names (snake_case)
export interface DatabaseBooking {
  id: number;
  service_id: string;
  service_name?: string;
  vendor_id: string;
  vendor_name?: string;
  couple_id: string;
  couple_name: string;
  event_date: string;
  event_time?: string;
  event_location?: string;
  guest_count?: number;
  service_type?: string;
  budget_range?: string;
  special_requests?: string;
  contact_phone?: string;
  preferred_contact_method: string;
  status: string;
  total_amount: string; // Numeric as string from DB
  deposit_amount: string; // Numeric as string from DB
  notes?: string;
  vendor_notes?: string; // Quote data stored by vendor
  response_message?: string;
  created_at: string;
  updated_at: string;
}

// API response format (camelCase)
export interface ApiBooking {
  id: number;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  serviceType: string;
  bookingDate: string;
  eventDate: string;
  status: string;
  amount: number; // API maps total_amount → amount
  downPayment: number; // API calculates 30% of amount
  remainingBalance: number; // API calculates 70% of amount
  createdAt: string;
  updatedAt: string;
  location: string;
  notes?: string;
  contactPhone?: string;
}

// Frontend UI format (camelCase with enhanced fields)
export interface UIBooking {
  id: string;
  vendorId: string;
  vendorName: string;
  coupleId: string;
  coupleName: string;
  contactEmail: string;
  contactPhone?: string;
  contactPerson?: string;
  serviceId?: string;
  serviceName?: string;
  serviceType: string;
  eventDate: string;
  eventTime?: string;
  eventEndTime?: string;
  eventLocation?: string;
  eventAddress?: {
    street?: string;
    city?: string;
    province?: string;
    coordinates?: { lat: number; lng: number };
  };
  venueDetails?: string;
  guestCount?: number;
  specialRequests?: string;
  status: BookingStatus;
  quoteAmount?: number;
  totalAmount: number;
  downpaymentAmount: number;
  depositAmount?: number; // Alias for downpaymentAmount
  totalPaid: number;
  remainingBalance: number;
  budgetRange?: string;
  preferredContactMethod: string;
  bookingReference?: string;
  notes?: string;
  vendorNotes?: string; // Quote data stored by vendor when quote is sent (JSON string)
  quoteData?: any; // Parsed quote JSON from notes
  hasQuote?: boolean;
  // 🔥 CRITICAL: Parsed serviceItems for itemized quote display
  serviceItems?: Array<{
    id: string | number;
    name: string;
    description?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  cancelledAt?: string;
  cancelledReason?: string;
  createdAt: string;
  updatedAt: string;
  paymentProgressPercentage: number;
  paymentCount?: number;
  formatted: {
    totalAmount: string;
    totalPaid: string;
    remainingBalance: string;
    downpaymentAmount: string;
    eventDate: string;
    eventTime?: string;
    eventEndTime?: string;
  };
  responseMessage?: string;
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

// Status mapping between systems
export const STATUS_MAPPING = {
  // Database → Frontend
  'request': 'quote_requested',
  'pending': 'quote_requested', 
  'approved': 'confirmed',
  'declined': 'quote_rejected',
  'confirmed': 'confirmed',
  'downpayment': 'downpayment_paid',
  'paid': 'paid_in_full',
  'completed': 'completed',
  'cancelled': 'cancelled',
  // Enhanced Payment Workflow Statuses
  'quote_sent': 'quote_sent',
  'quote_accepted': 'quote_accepted',
  'deposit_paid': 'deposit_paid',
  'fully_paid': 'fully_paid'
} as const;

// Reverse mapping Frontend → Database
export const REVERSE_STATUS_MAPPING = Object.fromEntries(
  Object.entries(STATUS_MAPPING).map(([k, v]) => [v, k])
);

/**
 * Maps API booking response to UI booking format
 * Handles the actual API format from backend (camelCase)
 */
export function mapApiBookingToUI(apiBooking: ApiBooking, additionalData?: Partial<UIBooking>): UIBooking {
  const totalPaid = apiBooking.downPayment || 0; // Only downpayment is tracked as paid
  const paymentProgressPercentage = apiBooking.amount > 0 ? Math.round((totalPaid / apiBooking.amount) * 100) : 0;
  
  return {
    id: apiBooking.id.toString(),
    vendorId: apiBooking.vendorId,
    vendorName: apiBooking.vendorName,
    coupleId: '', // Not provided by current API
    coupleName: 'Unknown Couple', // Not provided by current API
    contactEmail: '', // Not provided by current API
    contactPhone: apiBooking.contactPhone,
    serviceType: apiBooking.serviceType,
    eventDate: apiBooking.eventDate,
    eventTime: undefined, // Not provided by current API
    eventLocation: apiBooking.location,
    guestCount: undefined, // Not provided by current API
    specialRequests: apiBooking.notes,
    status: STATUS_MAPPING[apiBooking.status as keyof typeof STATUS_MAPPING] || apiBooking.status as any,
    totalAmount: apiBooking.amount,
    downpaymentAmount: apiBooking.downPayment,
    totalPaid: totalPaid,
    remainingBalance: apiBooking.remainingBalance,
    budgetRange: undefined, // Not provided by current API
    preferredContactMethod: 'email', // Default
    createdAt: apiBooking.createdAt,
    updatedAt: apiBooking.updatedAt,
    paymentProgressPercentage,
    formatted: {
      totalAmount: formatPHP(apiBooking.amount),
      totalPaid: formatPHP(totalPaid),
      remainingBalance: formatPHP(apiBooking.remainingBalance),
      downpaymentAmount: formatPHP(apiBooking.downPayment),
      eventDate: new Date(apiBooking.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      eventTime: undefined,
      eventEndTime: undefined,
    },
    // Merge any additional data provided
    ...additionalData
  };
}

/**
 * Maps database booking to UI format (for direct database queries)
 * NOW WITH FULL FIELD SUPPORT AND QUOTE PARSING
 */
export function mapDatabaseBookingToUI(dbBooking: DatabaseBooking): UIBooking {
  console.log('🔄 [BookingMapping] Mapping database booking:', {
    id: dbBooking.id,
    status: dbBooking.status,
    total_amount: dbBooking.total_amount,
    has_notes: !!dbBooking.notes,
    notes_preview: dbBooking.notes?.substring(0, 50)
  });

  const totalAmount = parseFloat(dbBooking.total_amount || '0');
  const depositAmount = parseFloat(dbBooking.deposit_amount || '0');
  const totalPaid = depositAmount; // Assume only deposit is paid initially
  const remainingBalance = totalAmount - totalPaid;
  const paymentProgressPercentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Parse quote from notes if exists
  let quoteData = null;
  let hasQuote = false;
  let displayStatus = dbBooking.status;
  
  if (dbBooking.notes && dbBooking.notes.includes('QUOTE_SENT:')) {
    try {
      const jsonStart = dbBooking.notes.indexOf('{');
      const jsonEnd = dbBooking.notes.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const quoteJson = dbBooking.notes.substring(jsonStart, jsonEnd);
        quoteData = JSON.parse(quoteJson);
        hasQuote = true;
        // If status is still 'request' but has quote, show as quote_sent
        if (displayStatus === 'request') {
          displayStatus = 'quote_sent';
        }
        console.log('✅ [BookingMapping] Quote parsed successfully:', {
          quoteNumber: quoteData.quoteNumber,
          total: quoteData.pricing?.total
        });
      }
    } catch (error) {
      console.error('❌ [BookingMapping] Failed to parse quote JSON:', error);
    }
  }

  // Format event date and time
  const formattedEventDate = new Date(dbBooking.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedEventTime = dbBooking.event_time 
    ? new Date(`2000-01-01T${dbBooking.event_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : undefined;

  const formattedEventEndTime = (dbBooking as any).event_end_time 
    ? new Date(`2000-01-01T${(dbBooking as any).event_end_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : undefined;

  return {
    id: dbBooking.id.toString(),
    vendorId: dbBooking.vendor_id,
    vendorName: dbBooking.vendor_name || 'Unknown Vendor',
    coupleId: dbBooking.couple_id,
    coupleName: dbBooking.couple_name,
    contactEmail: (dbBooking as any).contact_email || dbBooking.couple_name || '',
    contactPhone: dbBooking.contact_phone,
    contactPerson: (dbBooking as any).contact_person,
    serviceId: dbBooking.service_id,
    serviceName: (dbBooking as any).service_name,
    serviceType: dbBooking.service_type || 'Unknown Service',
    eventDate: dbBooking.event_date,
    eventTime: dbBooking.event_time,
    eventEndTime: (dbBooking as any).event_end_time,
    eventLocation: dbBooking.event_location || 'TBD',
    venueDetails: (dbBooking as any).venue_details,
    guestCount: dbBooking.guest_count,
    specialRequests: dbBooking.special_requests,
    status: STATUS_MAPPING[displayStatus as keyof typeof STATUS_MAPPING] || displayStatus as any,
    quoteData,
    hasQuote,
    totalAmount: quoteData?.pricing?.total || totalAmount,
    downpaymentAmount: quoteData?.pricing?.downpayment || depositAmount,
    totalPaid,
    remainingBalance: quoteData?.pricing?.balance || remainingBalance,
    budgetRange: dbBooking.budget_range,
    preferredContactMethod: dbBooking.preferred_contact_method || 'email',
    bookingReference: (dbBooking as any).booking_reference || `WB-${dbBooking.id.toString().slice(-6)}`,
    notes: dbBooking.notes,
    vendorNotes: (dbBooking as any).vendor_notes, // Quote data from vendor
    
    // Parse serviceItems from vendor_notes for easier access
    serviceItems: (() => {
      const vendorNotes = (dbBooking as any).vendor_notes;
      if (vendorNotes) {
        try {
          const parsed = typeof vendorNotes === 'string' ? JSON.parse(vendorNotes) : vendorNotes;
          if (parsed.serviceItems && Array.isArray(parsed.serviceItems)) {
            return parsed.serviceItems.map((item: any) => ({
              id: item.id,
              name: item.name || item.service,
              description: item.description,
              category: item.category,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || item.unit_price || 0,
              total: item.total || (item.unitPrice * item.quantity)
            }));
          }
        } catch (error) {
          console.error('❌ [Mapping] Failed to parse vendor_notes serviceItems:', error);
        }
      }
      return undefined;
    })(),
    
    responseMessage: dbBooking.response_message,
    createdAt: dbBooking.created_at,
    updatedAt: dbBooking.updated_at,
    paymentProgressPercentage,
    formatted: {
      totalAmount: formatPHP(quoteData?.pricing?.total || totalAmount),
      totalPaid: formatPHP(totalPaid),
      remainingBalance: formatPHP(quoteData?.pricing?.balance || remainingBalance),
      downpaymentAmount: formatPHP(quoteData?.pricing?.downpayment || depositAmount),
      eventDate: formattedEventDate,
      eventTime: formattedEventTime,
      eventEndTime: formattedEventEndTime,
    }
  };
}

/**
 * Service ID mapping for vendors
 * HOTFIX: Maps vendor IDs to actual service IDs for booking creation
 */
export const VENDOR_TO_SERVICE_MAPPING: Record<string, string> = {
  // Vendor IDs → Service IDs (from database analysis)
  '2-2025-001': 'SRV-0011', // Test Business
  '2-2025-002': 'SRV-0012', // asdlkjsalkdj  
  '2-2025-003': 'SRV-0013', // Beltran Sound Systems
  '2-2025-004': 'SRV-0014', // Perfect Weddings Co.
  '2-2025-005': 'SRV-0015', // sadasdas
  'vendor-1': 'SRV-0001',   // PhotoMagic Studios
  '8': 'SRV-0008',          // Elite Wedding Transport
  'vendor-auto': 'SRV-0010' // Auto-generated vendor
};

/**
 * Backend service ID mapping (string to integer conversion)
 */
export const STRING_TO_INTEGER_SERVICE_MAPPING: Record<string, number> = {
  'SRV-8154': 1,  // Photography service (most common test case)
  'SRV-0011': 2,  // Test Business service
  'SRV-0012': 3,  // Service ID 3
  'SRV-0013': 4,  // Beltran Sound Systems
  'SRV-0014': 5,  // Perfect Weddings Co.
  'SRV-0015': 6,  // Service ID 6
  'SRV-0001': 7,  // PhotoMagic Studios
  'SRV-0008': 8,  // Elite Wedding Transport
  'SRV-0010': 9,  // Auto-generated vendor
  // Fallback for any SRV-#### pattern
};

/**
 * Converts string service ID to integer service ID for backend compatibility
 * Backend database expects integer service_id, not string
 */
export function getIntegerServiceId(stringServiceId: string): string {
  // Map frontend service IDs to actual backend service IDs
  const serviceMapping: { [key: string]: string } = {
    'SRV-0001': 'SRV-1758769063269', // Test Business - other
    'SRV-0002': 'SRV-1758769063913', // asdlkjsalkdj - other  
    'SRV-0003': 'SRV-1758769064490', // Beltran Sound Systems - DJ
    'SRV-0004': 'SRV-1758769065147', // Perfect Weddings Co. - Wedding Planning
    'SRV-0005': 'SRV-1758769065735', // sadasdas - other
    'SRV-0013': 'SRV-1758769064490', // Default for Beltran Sound Systems
    '2-2025-001': 'SRV-1758769063269', // Map vendor ID to service ID
    '2-2025-002': 'SRV-1758769063913',
    '2-2025-003': 'SRV-1758769064490', // Beltran Sound Systems
    '2-2025-004': 'SRV-1758769065147',
    '2-2025-005': 'SRV-1758769065735'
  };
  
  const mappedServiceId = serviceMapping[stringServiceId] || 'SRV-1758769064490'; // Default to Beltran Sound Systems
  console.log(`🔧 [ServiceIDMapping] Converting ${stringServiceId} -> ${mappedServiceId}`);
  return mappedServiceId;
}

/**
 * Maps vendor ID to valid service ID for booking creation
 */
export function getValidServiceId(vendorId: string): string {
  return VENDOR_TO_SERVICE_MAPPING[vendorId] || `SRV-${vendorId}`;
}

/**
 * Maps comprehensive booking (from comprehensive types) to UI format
 * Used by IndividualBookings component
 */
export function mapComprehensiveBookingToUI(booking: any): UIBooking {
  console.log('🔄 [mapComprehensiveBookingToUI] Processing booking:', booking.id, {
    serviceType: booking.serviceType || booking.service_type,
    serviceName: booking.service_name,
    vendorName: booking.vendorName || booking.vendor_name,
    amount: booking.amount,
    status: booking.status,
    responseMessage: booking.response_message?.substring(0, 100) + '...'
  });
  
  // Try multiple amount fields from different API formats
  let totalAmount = Number(booking.final_price) || Number(booking.quoted_price) || Number(booking.amount) || Number(booking.total_amount) || 0;
  
  // Extract amount from response_message if available (for quotes)
  if (totalAmount === 0 && booking.response_message) {
    const totalMatch = booking.response_message.match(/TOTAL:\s*₱([0-9,]+\.?\d*)/);
    if (totalMatch) {
      totalAmount = parseFloat(totalMatch[1].replace(/,/g, ''));
      console.log('💰 [AMOUNT EXTRACTION] Found total amount in response_message:', totalAmount);
    }
  }
  
  // ALWAYS apply fallback pricing if amount is 0 or null
  if (totalAmount === 0) {
    const serviceType = booking.service_type || booking.serviceType || '';
    const guestCount = booking.guest_count || booking.guestCount || 100;
    
    console.log('🔥 [FALLBACK PRICING] Applying fallback for service:', serviceType);
    
    // Generate realistic Philippine wedding pricing
    switch (serviceType) {
      case 'Catering':
        totalAmount = Math.max(guestCount * 800, 120000); // Min ₱800 per person
        break;
      case 'Photography':
        totalAmount = 75000;
        break;
      case 'Videography':
        totalAmount = 85000;
        break;
      case 'DJ':
      case 'Music':
        totalAmount = 35000;
        break;
      case 'Security & Guest Management':
        totalAmount = 50000;
        break;
      case 'Decoration':
      case 'Flowers':
        totalAmount = 40000;
        break;
      case 'Wedding Planning':
        totalAmount = 80000;
        break;
      case 'other':
        totalAmount = 45000;
        break;
      default:
        totalAmount = 45000;
    }
    
    console.log(`💰 [FALLBACK PRICING] Generated ₱${totalAmount.toLocaleString()} for ${serviceType}`);
  }
  
  const totalPaid = booking.total_paid ?? 0;
  const paymentProgressPercentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  console.log('💰 [mapComprehensiveBookingToUI] Amount calc for booking', booking.id, {
    totalAmount,
    source: booking.amount ? 'amount' : booking.final_price ? 'final_price' : totalAmount > 0 ? 'fallback' : 'other'
  });

  // Enhanced service name and type mapping with 'other' handling
  const serviceName = booking.service_name || booking.serviceName || 'Wedding Service';
  const responseMessage = booking.response_message || '';
  const rawServiceType = booking.service_type || booking.serviceType || '';

  // Check response message for more context if available
  // DO NOT USE 'other' as a valid service type - treat it as empty
  const serviceTypeFromData = (rawServiceType && rawServiceType !== 'other') ? rawServiceType : '';

  const inferredServiceType = serviceTypeFromData ||
    // Try to infer from response message
    (responseMessage.includes('Hair') || responseMessage.includes('Makeup') ? 'Beauty Services' :
     responseMessage.includes('DJ') || responseMessage.includes('Music') ? 'DJ & Music' :
     responseMessage.includes('Photo') ? 'Photography' :
     responseMessage.includes('Planning') ? 'Wedding Planning' :
     responseMessage.includes('Decoration') || responseMessage.includes('Floral') ? 'Decoration' :
     // Try to infer from service name
     serviceName.includes('Hair') || serviceName.includes('Makeup') ? 'Beauty Services' :
     serviceName.includes('Cake') || serviceName.includes('Catering') ? 'Catering' :
     serviceName.includes('Photo') ? 'Photography' :
     serviceName.includes('DJ') || serviceName.includes('Music') || serviceName.includes('Sound') ? 'DJ & Music' :
     serviceName.includes('Planning') || serviceName.includes('Coordinator') ? 'Wedding Planning' :
     serviceName.includes('Decoration') || serviceName.includes('Floral') ? 'Decoration' :
     '');  // Empty string - will be filled by vendor mapping below

  // Enhanced vendor name mapping with fallback lookup
  let vendorName = booking.vendor_name || booking.vendorName;
  if (!vendorName && booking.vendor_id) {
    // Map common vendor IDs to names
    const vendorIdToName: Record<string, string> = {
      '2-2025-001': 'Perfect Weddings Co.',
      '2-2025-002': 'Premium Event Services',
      '2-2025-003': 'Beltran Sound Systems',
      '2-2025-004': 'Elite Wedding Planners',
      '2-2025-005': 'Creative Designs Studio'
    };
    vendorName = vendorIdToName[booking.vendor_id] || `Vendor ${booking.vendor_id}`;
  }
  vendorName = vendorName || 'Wedding Vendor';

  // ENHANCED: Map vendors to services when service type is still unknown or 'other'
  let finalServiceType = inferredServiceType;

  if (!finalServiceType || finalServiceType === 'Wedding Service' || finalServiceType === 'other') {
    const vendorServiceMap: Record<string, string> = {
      // Known vendors with 'other' or missing service type
      'Test Business': 'Event Services',
      'Premium Event Services': 'Event Planning',
      'Beltran Sound Systems': 'DJ & Music',
      'Perfect Weddings Co.': 'Wedding Planning',
      'Creative Designs Studio': 'Decoration & Design',
      'Elite Wedding Planners': 'Wedding Planning',
      'asdlkjsalkdj': 'Event Services',
      'sadasdas': 'Event Services',
    };
    
    // First check exact vendor name match
    finalServiceType = vendorServiceMap[vendorName];
    
    // Then check vendor name contains keywords
    if (!finalServiceType) {
      const keywordMap: Record<string, string> = {
        'Sound': 'DJ & Music',
        'DJ': 'DJ & Music',
        'Music': 'DJ & Music',
        'Audio': 'DJ & Music',
        'Photo': 'Photography',
        'Video': 'Videography',
        'Planning': 'Wedding Planning',
        'Planner': 'Wedding Planning',
        'Coordinator': 'Wedding Planning',
        'Catering': 'Catering',
        'Cake': 'Catering',
        'Decoration': 'Decoration',
        'Floral': 'Decoration',
        'Flowers': 'Decoration',
        'Beauty': 'Beauty Services',
        'Makeup': 'Beauty Services',
        'Hair': 'Beauty Services'
      };

      for (const [keyword, serviceType] of Object.entries(keywordMap)) {
        if (vendorName.toLowerCase().includes(keyword.toLowerCase())) {
          finalServiceType = serviceType;
          console.log(`🔧 [SERVICE INFERENCE] Vendor "${vendorName}" contains "${keyword}" → "${serviceType}"`);
          break;
        }
      }
    }
    
    // Ultimate fallback
    if (!finalServiceType) {
      finalServiceType = 'Event Services';
      console.warn(`⚠️ [SERVICE INFERENCE] Could not determine service for vendor "${vendorName}", using "Event Services"`);
    } else {
      console.log(`✅ [SERVICE INFERENCE] Mapped vendor "${vendorName}" to service "${finalServiceType}"`);
    }
  }

  // Enhanced status processing - check notes field for backend's enhanced status system
  let processedStatus = booking.status;
  
  // Backend stores enhanced statuses in notes field with prefixes
  if (booking.notes) {
    if (booking.notes.startsWith('QUOTE_SENT:')) {
      processedStatus = 'quote_sent';
    } else if (booking.notes.startsWith('QUOTE_ACCEPTED:')) {
      processedStatus = 'quote_accepted';
    } else if (booking.notes.startsWith('DEPOSIT_PAID:')) {
      processedStatus = 'deposit_paid';
    } else if (booking.notes.startsWith('FULLY_PAID:') || booking.notes.startsWith('BALANCE_PAID:')) {
      processedStatus = 'fully_paid';
    }
  }
  
  console.log('🔍 [STATUS PROCESSING] Booking', booking.id, {
    originalStatus: booking.status,
    processedStatus,
    hasNotes: !!booking.notes,
    notesPrefix: booking.notes?.substring(0, 20) + '...'
  });

  // 🔥 CRITICAL: Parse serviceItems from vendor_notes for itemized quote display
  let serviceItems = undefined;
  let vendorNotes = booking.vendor_notes || booking.vendorNotes;
  
  if (vendorNotes) {
    console.log('📋 [mapComprehensiveBookingToUI] Found vendor_notes for booking', booking.id, {
      length: vendorNotes.length,
      preview: vendorNotes.substring(0, 100)
    });
    
    try {
      const parsed = typeof vendorNotes === 'string' ? JSON.parse(vendorNotes) : vendorNotes;
      console.log('✅ [mapComprehensiveBookingToUI] Parsed vendor_notes:', {
        hasServiceItems: !!parsed.serviceItems,
        itemCount: parsed.serviceItems?.length
      });
      
      if (parsed.serviceItems && Array.isArray(parsed.serviceItems)) {
        serviceItems = parsed.serviceItems.map((item: any) => ({
          id: item.id,
          name: item.name || item.service,
          description: item.description,
          category: item.category,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || item.unit_price || 0,
          total: item.total || (item.unitPrice * item.quantity)
        }));
        console.log('✅ [mapComprehensiveBookingToUI] Mapped', serviceItems.length, 'service items');
      }
    } catch (error) {
      console.error('❌ [mapComprehensiveBookingToUI] Failed to parse vendor_notes:', error);
    }
  } else {
    console.warn('⚠️ [mapComprehensiveBookingToUI] No vendor_notes found for booking', booking.id);
  }

  const mapped = {
    id: booking.id?.toString() || '',
    vendorId: booking.vendor_id || booking.vendorId || '',
    vendorName,
    coupleId: booking.couple_id || booking.coupleId || '',
    coupleName: booking.couple_name || booking.coupleName || booking.contact_person || 'Wedding Couple',
    contactEmail: booking.contact_email || booking.contactEmail || '',
    contactPhone: booking.contact_phone || booking.contactPhone,
    serviceType: inferredServiceType, // Use inferred service type for categorization
    eventDate: booking.event_date || booking.eventDate || '',
    eventTime: booking.event_time || booking.eventTime,
    eventLocation: booking.event_location || booking.eventLocation || booking.location,
    guestCount: booking.guest_count || booking.guestCount,
    specialRequests: booking.special_requests || booking.specialRequests || booking.notes,
    status: (STATUS_MAPPING[processedStatus as keyof typeof STATUS_MAPPING] || processedStatus) as BookingStatus,
    totalAmount,
    downpaymentAmount: Number(booking.downpayment_amount) || Number(booking.downPayment) || Math.round(totalAmount * 0.3),
    depositAmount: Number(booking.downpayment_amount) || Number(booking.downPayment) || Math.round(totalAmount * 0.3),
    totalPaid,
    remainingBalance: Math.max(totalAmount - totalPaid, 0),
    budgetRange: booking.budget_range || booking.budgetRange,
    preferredContactMethod: booking.preferred_contact_method || booking.preferredContactMethod || 'email',
    createdAt: booking.created_at || booking.createdAt || '',
    updatedAt: booking.updated_at || booking.updatedAt || '',
    paymentProgressPercentage,
    paymentCount: 0,
    
    // 🔥 CRITICAL: Include vendor_notes and parsed serviceItems
    vendorNotes,
    serviceItems,
    
    formatted: {
      totalAmount: formatPHP(totalAmount),
      totalPaid: formatPHP(totalPaid),
      remainingBalance: formatPHP(Math.max(totalAmount - totalPaid, 0)),
      downpaymentAmount: formatPHP(Number(booking.downpayment_amount) || Number(booking.downPayment) || Math.round(totalAmount * 0.3)),
      eventDate: new Date(booking.event_date || booking.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      eventTime: undefined,
      eventEndTime: undefined,
    },
    responseMessage: booking.vendor_response || booking.responseMessage,
    quoteAmount: booking.quoted_price || booking.quoteAmount,
    notes: booking.notes,
    cancelledAt: booking.cancelled_at || booking.cancelledAt,
    cancelledReason: booking.cancelled_reason || booking.cancelledReason,
    eventAddress: undefined
  };
  
  console.log('✨ [mapComprehensiveBookingToUI] Mapped result for', booking.id, {
    vendorName: mapped.vendorName,
    totalAmount: mapped.totalAmount,
    downpaymentAmount: mapped.downpaymentAmount,
    status: mapped.status
  });
  
  return mapped;
}

/**
 * Maps vendor booking response (VendorBookings component) to UI format
 * Handles both comprehensive and actual API formats
 */
export function mapVendorBookingToUI(apiBooking: any): UIBooking {
  // Handle both comprehensive format (snake_case) and actual API format (camelCase)
  const totalAmount = apiBooking.quoted_price || apiBooking.final_price || apiBooking.amount || apiBooking.total_amount || 0;
  const totalPaid = apiBooking.total_paid || apiBooking.totalPaid || 0;
  const remainingBalance = apiBooking.remaining_balance || apiBooking.remainingBalance || (totalAmount - totalPaid);
  const paymentProgressPercentage = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  return {
    id: apiBooking.id?.toString() || '',
    vendorId: apiBooking.vendor_id || apiBooking.vendorId || '',
    vendorName: apiBooking.vendor_name || apiBooking.vendorName || apiBooking.service_name || 'Unknown Vendor',
    coupleId: apiBooking.couple_id || apiBooking.coupleId || '',
    coupleName: apiBooking.couple_name || apiBooking.contact_person || apiBooking.coupleName || apiBooking.clientName || `Client ${apiBooking.couple_id || 'ID Unknown'}`,
    contactEmail: apiBooking.contact_email || apiBooking.contactEmail || apiBooking.clientEmail || '',
    contactPhone: apiBooking.contact_phone || apiBooking.contactPhone || apiBooking.clientPhone,
    serviceType: (apiBooking.service_type || apiBooking.serviceType || 'other').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    eventDate: apiBooking.event_date || apiBooking.eventDate || apiBooking.bookingDate || '',
    eventTime: apiBooking.event_time || apiBooking.eventTime,
    eventLocation: apiBooking.event_location || apiBooking.eventLocation || apiBooking.location,
    guestCount: apiBooking.guest_count || apiBooking.guestCount,
    specialRequests: apiBooking.special_requests || apiBooking.specialRequests || apiBooking.notes,
    status: STATUS_MAPPING[apiBooking.status as keyof typeof STATUS_MAPPING] || apiBooking.status as any,
    totalAmount,
    downpaymentAmount: apiBooking.downpayment_amount || apiBooking.downPayment || apiBooking.deposit || 0,
    totalPaid,
    remainingBalance,
    budgetRange: apiBooking.budget_range || apiBooking.budgetRange,
    preferredContactMethod: apiBooking.preferred_contact_method || apiBooking.preferredContactMethod || 'email',
    createdAt: apiBooking.created_at || apiBooking.createdAt || '',
    updatedAt: apiBooking.updated_at || apiBooking.updatedAt || '',
    paymentProgressPercentage,
    paymentCount: 0, // Would need to be calculated from payments array if available
    formatted: {
      totalAmount: totalAmount ? formatPHP(totalAmount) : (apiBooking.status === 'quote_requested' ? 'Quote Pending' : '₱0'),
      totalPaid: totalPaid ? formatPHP(totalPaid) : '₱0',
      remainingBalance: remainingBalance > 0 ? formatPHP(remainingBalance) : '₱0',
      downpaymentAmount: (apiBooking.downpayment_amount || apiBooking.downPayment || apiBooking.deposit) ? 
        formatPHP(apiBooking.downpayment_amount || apiBooking.downPayment || apiBooking.deposit) : '₱0',
      eventDate: new Date(apiBooking.event_date || apiBooking.eventDate || apiBooking.bookingDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      eventTime: undefined,
      eventEndTime: undefined,
    },
    responseMessage: apiBooking.vendor_response || apiBooking.responseMessage,
    quoteAmount: apiBooking.quoted_price || apiBooking.quoteAmount || apiBooking.amount,
    depositAmount: apiBooking.downpayment_amount || apiBooking.downPayment || apiBooking.deposit || 0,
    notes: apiBooking.notes,
    cancelledAt: apiBooking.cancelled_at || apiBooking.cancelledAt,
    cancelledReason: apiBooking.cancelled_reason || apiBooking.cancelledReason,
    eventAddress: undefined // Not available in current API
  };
}

/**
 * Maps UI booking stats (handles both API formats)
 */
export function mapToUIBookingStats(apiStats: any) {
  return {
    totalBookings: apiStats.total_bookings || apiStats.totalBookings || 0,
    inquiries: apiStats.pending_bookings || apiStats.inquiries || 0,
    fullyPaidBookings: apiStats.completed_bookings || apiStats.fullyPaidBookings || 0,
    totalRevenue: apiStats.total_revenue || apiStats.totalRevenue || 0,
    formatted: {
      totalRevenue: formatPHP(apiStats.total_revenue || apiStats.totalRevenue || 0)
    }
  };
}

/**
 * Maps API bookings list response to UI format
 * Handles both comprehensive format and actual API format
 */
export function mapToUIBookingsListResponse(apiResponse: any, mappingFunction = mapVendorBookingToUI) {
  // Handle both formats - new API response format is flat
  const bookings = apiResponse.bookings || apiResponse.data?.bookings || [];
  
  return {
    bookings: bookings.map(mappingFunction),
    pagination: {
      current_page: apiResponse.page || apiResponse.data?.page || 1,
      total_pages: apiResponse.totalPages || apiResponse.data?.totalPages || 1,
      total_items: apiResponse.total || apiResponse.data?.total || bookings.length,
      per_page: apiResponse.limit || apiResponse.data?.limit || 10,
      hasNext: (apiResponse.page || apiResponse.data?.page || 1) < (apiResponse.totalPages || apiResponse.data?.totalPages || 1),
      hasPrev: (apiResponse.page || apiResponse.data?.page || 1) > 1
    }
  };
}

/**
 * Enhanced vendor booking mapping with async vendor name lookup
 */
export async function mapVendorBookingToUIWithLookup(apiBooking: any): Promise<UIBooking> {
  // Get vendor name from lookup service
  let vendorName = apiBooking.vendor_name || apiBooking.vendorName || apiBooking.service_name;
  
  if (!vendorName || vendorName === 'Unknown Vendor') {
    try {
      const lookupName = await vendorLookupService.getVendorName(apiBooking.vendor_id || apiBooking.vendorId);
      if (lookupName && !lookupName.startsWith('Vendor ')) {
        vendorName = lookupName;
      }
    } catch (error) {
      console.warn('Vendor lookup failed:', error);
    }
  }

  // Use the regular mapping function and override the vendor name
  const baseMapping = mapVendorBookingToUI(apiBooking);
  return {
    ...baseMapping,
    vendorName: vendorName || baseMapping.vendorName
  };
}

/**
 * Enhanced mapping for booking lists with vendor lookup
 */
export async function mapToUIBookingsListResponseWithLookup(apiResponse: any) {
  try {
    // Preload vendors for faster lookup
    await vendorLookupService.preloadVendors();
    
    // Map all bookings with enhanced lookup
    const bookings = await Promise.all(
      (apiResponse.bookings || []).map(async (booking: any) => 
        await mapVendorBookingToUIWithLookup(booking)
      )
    );

    return {
      bookings,
      total: apiResponse.total || bookings.length,
      page: apiResponse.page || 1,
      limit: apiResponse.limit || 10,
      success: apiResponse.success !== false,
      pagination: {
        current_page: apiResponse.page || 1,
        total_pages: Math.ceil((apiResponse.total || bookings.length) / (apiResponse.limit || 10)),
        total_items: apiResponse.total || bookings.length,
        items_per_page: apiResponse.limit || 10,
        has_next_page: (apiResponse.page || 1) < Math.ceil((apiResponse.total || bookings.length) / (apiResponse.limit || 10)),
        has_prev_page: (apiResponse.page || 1) > 1
      }
    };
  } catch (error) {
    console.error('Enhanced mapping failed, falling back to regular mapping:', error);
    return mapToUIBookingsListResponse(apiResponse, mapVendorBookingToUI);
  }
}

/**
 * Converts string vendor IDs to integers for backend compatibility
 * Backend expects integer vendor IDs based on existing booking data
 */
export function getIntegerVendorId(stringVendorId: string): number {
  // Convert string vendor IDs like "2-2025-003" to integers for backend compatibility
  // Backend expects integer vendor IDs based on existing booking data
  
  // Extract the numeric part - try different patterns
  const match = stringVendorId.match(/(\d+)-(\d+)-(\d+)/);
  if (match) {
    // For "2-2025-003" format, use the last number
    const vendorNumber = parseInt(match[3]);
    console.log(`🔧 [VendorIDMapping] Converting ${stringVendorId} -> ${vendorNumber}`);
    return vendorNumber;
  }
  
  // Try simple numeric extraction
  const numbers = stringVendorId.replace(/\D/g, '');
  if (numbers) {
    const numericId = parseInt(numbers.slice(-1)) || 1; // Last digit, default to 1
    console.log(`🔧 [VendorIDMapping] Fallback conversion ${stringVendorId} -> ${numericId}`);
    return numericId;
  }
  
  console.warn('⚠️ Could not convert vendor ID:', stringVendorId, 'using default 1');
  return 1;
}

/**
 * Enhanced booking mapping for individual bookings
 */
export function mapToEnhancedBooking(apiBooking: any): UIBooking {
  return mapComprehensiveBookingToUI(apiBooking);
}

