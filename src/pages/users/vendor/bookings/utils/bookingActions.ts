/**
 * BOOKING ACTIONS UTILITIES
 * Separate file to handle booking actions without affecting existing components
 */

import type { ProcessedBookingData } from './bookingDataMapper';

export interface ContactOptions {
  subject?: string;
  template?: 'inquiry_response' | 'quote_sent' | 'booking_confirmed' | 'custom';
  customMessage?: string;
}

export interface MessageClientOptions {
  platform: 'email' | 'sms' | 'whatsapp';
  template?: string;
  urgency?: 'low' | 'normal' | 'high';
}

/**
 * Generate email templates for different scenarios
 */
export const generateEmailTemplate = (booking: ProcessedBookingData, template: string = 'inquiry_response'): { subject: string; body: string } => {
  const clientName = booking.coupleName && booking.coupleName !== 'Unknown Couple' ? booking.coupleName.split(' ')[0] : 'there';
  
  const templates = {
    inquiry_response: {
      subject: `Re: Your ${booking.serviceType} Inquiry - Wedding on ${booking.eventDate}`,
      body: `Hi ${clientName},

Thank you for your inquiry about our ${booking.serviceType} services for your special day on ${booking.eventDate}.

I've reviewed your requirements:
- Event Location: ${booking.eventLocation}
- Guest Count: ${booking.guestCount} guests
- Special Requests: ${booking.specialRequests}

I'm excited to be part of your wedding celebration and will prepare a detailed quote for you shortly.

Please feel free to call me at your convenience to discuss any additional details.

Best regards,
Wedding Vendor Team`
    },
    
    quote_sent: {
      subject: `Wedding Quote Ready - ${booking.serviceType} for ${booking.eventDate}`,
      body: `Dear ${clientName},

I hope this email finds you well!

I've prepared a detailed quote for your ${booking.serviceType} services on ${booking.eventDate}. The quote includes everything we discussed and some additional options that might interest you.

Event Details:
- Date: ${booking.eventDate} at ${booking.eventTime}
- Location: ${booking.eventLocation}
- Guests: ${booking.guestCount}

Please review the quote and let me know if you have any questions. I'm happy to discuss any adjustments or additional services you might need.

Looking forward to hearing from you soon!

Warm regards,
Wedding Vendor Team`
    },
    
    booking_confirmed: {
      subject: `Booking Confirmed! ${booking.serviceType} - ${booking.eventDate}`,
      body: `Congratulations ${clientName}!

Your booking has been confirmed! I'm thrilled to be part of your special day.

Confirmed Details:
- Service: ${booking.serviceType}
- Date: ${booking.eventDate} at ${booking.eventTime}
- Location: ${booking.eventLocation}
- Guest Count: ${booking.guestCount}

Next Steps:
1. We'll send you a detailed timeline closer to your wedding date
2. Please keep us updated on any changes to guest count or venue details
3. Final payment will be due 30 days before the event

Thank you for choosing us for your wedding. We can't wait to make your day absolutely perfect!

Best wishes,
Wedding Vendor Team`
    }
  };

  return templates[template as keyof typeof templates] || templates.inquiry_response;
};

/**
 * Handle email contact action
 */
export const handleEmailContact = (booking: ProcessedBookingData, options: ContactOptions = {}) => {
  const template = generateEmailTemplate(booking, options.template || 'inquiry_response');
  
  const subject = encodeURIComponent(options.subject || template.subject);
  const body = encodeURIComponent(options.customMessage || template.body);
  
  const mailtoURL = `mailto:${booking.contactEmail}?subject=${subject}&body=${body}`;
  window.open(mailtoURL);
};

/**
 * Handle phone contact action
 */
export const handlePhoneContact = (booking: ProcessedBookingData) => {
  if (booking.contactPhone && booking.contactPhone !== 'Contact pending') {
    const cleanPhone = booking.contactPhone.replace(/[^\d+]/g, '');
    window.open(`tel:${cleanPhone}`);
  } else {
    console.warn('No phone number available for this booking');
    alert('Phone number not available for this client. Please use email contact instead.');
  }
};

/**
 * Handle WhatsApp contact action
 */
export const handleWhatsAppContact = (booking: ProcessedBookingData, message?: string) => {
  if (booking.contactPhone && booking.contactPhone !== 'Contact pending') {
    const cleanPhone = booking.contactPhone.replace(/[^\d]/g, '');
    const defaultMessage = `Hi ${booking.coupleName}! Thank you for your inquiry about our ${booking.serviceType} services for your wedding on ${booking.eventDate}. I'd love to discuss your requirements in detail.`;
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    
    // WhatsApp Web URL format
    const whatsappURL = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  } else {
    console.warn('No phone number available for WhatsApp');
    alert('Phone number not available for WhatsApp. Please use email contact instead.');
  }
};

/**
 * Open booking details modal (placeholder for modal state management)
 */
export const handleViewDetails = (
  booking: ProcessedBookingData, 
  setSelectedBooking: (booking: ProcessedBookingData) => void,
  setShowDetails: (show: boolean) => void
) => {
  setSelectedBooking(booking);
  setShowDetails(true);
};

/**
 * Open send quote modal with service data fetching
 */
export const handleSendQuote = async (
  booking: ProcessedBookingData,
  setSelectedBooking: (booking: ProcessedBookingData) => void,
  setShowQuoteModal: (show: boolean) => void,
  setSelectedServiceData: (data: any) => void,
  fetchServiceDataForQuote: (booking: ProcessedBookingData) => Promise<any>
) => {
  setSelectedBooking(booking);
  
  try {
    const serviceData = await fetchServiceDataForQuote(booking);
    setSelectedServiceData(serviceData);
  } catch (error) {
    console.warn('Could not fetch service data for quote prefill:', error);
    setSelectedServiceData(null);
  }
  
  setShowQuoteModal(true);
};

/**
 * Generate contact summary for booking
 */
export const generateContactSummary = (booking: ProcessedBookingData): string => {
  return `
Contact Information for ${booking.coupleName}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email: ${booking.contactEmail}
📱 Phone: ${booking.contactPhone}
💒 Event: ${booking.serviceType}
📅 Date: ${booking.eventDate} at ${booking.eventTime}
📍 Location: ${booking.eventLocation}
👥 Guests: ${booking.guestCount}

💰 Budget: ${booking.formatted.totalAmount}
📋 Status: ${booking.status.replace(/_/g, ' ').toUpperCase()}

Special Requests:
${booking.specialRequests}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
};

/**
 * Copy contact information to clipboard
 */
export const copyContactInfo = async (booking: ProcessedBookingData): Promise<boolean> => {
  try {
    const contactSummary = generateContactSummary(booking);
    await navigator.clipboard.writeText(contactSummary);
    return true;
  } catch (error) {
    console.error('Failed to copy contact info:', error);
    return false;
  }
};

/**
 * Validate booking data before actions
 */
export const validateBookingForAction = (booking: ProcessedBookingData, action: string): { valid: boolean; message?: string } => {
  if (!booking) {
    return { valid: false, message: 'No booking data available' };
  }

  switch (action) {
    case 'email':
      if (!booking.contactEmail || booking.contactEmail.includes('@weddingclient.com')) {
        return { valid: false, message: 'Valid email address not available' };
      }
      break;
    
    case 'phone':
      if (!booking.contactPhone || booking.contactPhone === 'Contact pending') {
        return { valid: false, message: 'Phone number not available' };
      }
      break;
    
    case 'quote':
      if (booking.status !== 'request' && booking.status !== 'quote_requested') {
        return { valid: false, message: 'Quote can only be sent for new requests' };
      }
      break;
  }

  return { valid: true };
};
