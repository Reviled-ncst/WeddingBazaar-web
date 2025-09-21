// Booking Interaction Service - Handles the complete workflow between couples and vendors
import type { Booking, BookingStatus } from '../types/comprehensive-booking.types';
import { bookingApiService } from '../../services/api/bookingApiService';

export interface BookingInteraction {
  id: string;
  bookingId: string;
  actorId: string; // User ID who performed the action
  actorType: 'couple' | 'vendor';
  actionType: BookingActionType;
  message?: string;
  data?: any; // Additional data (quote details, payment info, etc.)
  timestamp: string;
  isRead: boolean;
}

export type BookingActionType = 
  | 'booking_requested'     // Couple submits initial booking request
  | 'booking_received'      // Vendor receives the booking request
  | 'quote_requested'       // Vendor requests more details for quote
  | 'quote_provided'        // Vendor sends quote to couple
  | 'quote_accepted'        // Couple accepts the quote
  | 'quote_rejected'        // Couple rejects the quote
  | 'quote_revised'         // Vendor revises the quote
  | 'contract_sent'         // Vendor sends contract for signature
  | 'contract_signed'       // Couple signs the contract
  | 'downpayment_requested' // Vendor requests downpayment
  | 'downpayment_paid'      // Couple pays downpayment
  | 'booking_confirmed'     // Vendor confirms booking after downpayment
  | 'progress_update'       // Vendor provides progress update
  | 'final_payment_due'     // Vendor notifies final payment is due
  | 'final_payment_paid'    // Couple pays final payment
  | 'service_delivered'     // Vendor marks service as delivered
  | 'service_completed'     // Couple confirms service completion
  | 'review_requested'      // Vendor requests review from couple
  | 'review_submitted'      // Couple submits review
  | 'booking_cancelled'     // Either party cancels booking
  | 'refund_processed'      // Vendor processes refund
  | 'dispute_raised'        // Either party raises a dispute
  | 'dispute_resolved';     // Dispute is resolved

export interface QuoteDetails {
  basePrice: number;
  additionalServices: Array<{
    name: string;
    price: number;
    included: boolean;
  }>;
  totalPrice: number;
  downpaymentAmount: number;
  downpaymentPercentage: number;
  validUntil: string;
  terms: string;
  inclusions: string[];
  exclusions: string[];
  notes?: string;
}

export interface PaymentDetails {
  amount: number;
  paymentType: 'downpayment' | 'installment' | 'final_payment';
  paymentMethod: string;
  paymentReference: string;
  processedAt: string;
  receipt?: {
    url: string;
    number: string;
  };
}

export interface ContractDetails {
  contractUrl: string;
  templateUsed: string;
  signedAt?: string;
  witnessSignature?: string;
}

class BookingInteractionService {
  private apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  // ============================================================================
  // COUPLE ACTIONS
  // ============================================================================

  /**
   * Couple submits initial booking request
   */
  async submitBookingRequest(bookingData: {
    vendorId: string;
    serviceType: string;
    eventDate: string;
    eventTime?: string;
    eventLocation: string;
    guestCount?: number;
    budgetRange: string;
    specialRequests?: string;
    contactPhone: string;
    preferredContactMethod: string;
  }): Promise<{ booking: Booking; interaction: BookingInteraction }> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      throw new Error('Failed to submit booking request');
    }

    const result = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('bookingRequested', { 
      detail: { booking: result.booking, interaction: result.interaction }
    }));

    return result;
  }

  /**
   * Couple accepts vendor's quote
   */
  async acceptQuote(bookingId: string, message?: string): Promise<BookingInteraction> {
    try {
      // Use the bookingApiService for the actual API call
      const booking = await bookingApiService.acceptQuote(bookingId);
      
      // Create interaction record
      const interaction = await this.createInteraction(bookingId, {
        actionType: 'quote_accepted',
        message: message || 'Quote accepted by couple',
        actorType: 'couple'
      });
      
      // Emit event for real-time updates
      window.dispatchEvent(new CustomEvent('quoteAccepted', { 
        detail: { bookingId, interaction, booking }
      }));

      return interaction;
    } catch (error) {
      console.error('Error accepting quote:', error);
      throw new Error('Failed to accept quote');
    }
  }

  /**
   * Couple rejects vendor's quote
   */
  async rejectQuote(bookingId: string, reason: string): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/reject-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      throw new Error('Failed to reject quote');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('quoteRejected', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Couple signs contract
   */
  async signContract(bookingId: string, signatureData: {
    signature: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/sign-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(signatureData)
    });

    if (!response.ok) {
      throw new Error('Failed to sign contract');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('contractSigned', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Couple makes payment
   */
  async makePayment(bookingId: string, paymentData: {
    amount: number;
    paymentType: 'downpayment' | 'installment' | 'final_payment';
    paymentMethod: string;
    paymentReference?: string;
  }): Promise<{ interaction: BookingInteraction; receipt: any }> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    const result = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('paymentMade', { 
      detail: { bookingId, interaction: result.interaction, receipt: result.receipt }
    }));

    return result;
  }

  /**
   * Couple confirms service completion
   */
  async confirmServiceCompletion(bookingId: string, feedback?: string): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/confirm-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ feedback })
    });

    if (!response.ok) {
      throw new Error('Failed to confirm service completion');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('serviceConfirmed', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  // ============================================================================
  // VENDOR ACTIONS
  // ============================================================================

  /**
   * Vendor sends quote to couple
   */
  async sendQuote(bookingId: string, quoteDetails: QuoteDetails): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/send-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ quoteDetails })
    });

    if (!response.ok) {
      throw new Error('Failed to send quote');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('quoteSent', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor revises quote based on couple's feedback
   */
  async reviseQuote(bookingId: string, revisedQuote: QuoteDetails, revisionReason: string): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/revise-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ 
        quoteDetails: revisedQuote,
        revisionReason 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to revise quote');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('quoteRevised', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor sends contract for signature
   */
  async sendContract(bookingId: string, contractDetails: {
    templateId: string;
    customTerms?: string;
    dueDate?: string;
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/send-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(contractDetails)
    });

    if (!response.ok) {
      throw new Error('Failed to send contract');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('contractSent', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor confirms booking after receiving downpayment
   */
  async confirmBooking(bookingId: string, confirmationMessage?: string): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ message: confirmationMessage })
    });

    if (!response.ok) {
      throw new Error('Failed to confirm booking');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('bookingConfirmed', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor provides progress update
   */
  async sendProgressUpdate(bookingId: string, update: {
    title: string;
    description: string;
    images?: string[];
    completionPercentage?: number;
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/progress-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(update)
    });

    if (!response.ok) {
      throw new Error('Failed to send progress update');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('progressUpdate', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor requests final payment
   */
  async requestFinalPayment(bookingId: string, paymentDetails: {
    amount: number;
    dueDate: string;
    instructions: string;
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/request-final-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(paymentDetails)
    });

    if (!response.ok) {
      throw new Error('Failed to request final payment');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('finalPaymentRequested', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor marks service as delivered
   */
  async markServiceDelivered(bookingId: string, deliveryDetails: {
    deliveryDate: string;
    notes?: string;
    images?: string[];
    documentsProvided?: string[];
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/mark-delivered`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(deliveryDetails)
    });

    if (!response.ok) {
      throw new Error('Failed to mark service as delivered');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('serviceDelivered', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Vendor requests review from couple
   */
  async requestReview(bookingId: string, message?: string): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/request-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('Failed to request review');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('reviewRequested', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  // ============================================================================
  // SHARED ACTIONS
  // ============================================================================

  /**
   * Get all interactions for a booking
   */
  async getBookingInteractions(bookingId: string): Promise<BookingInteraction[]> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/interactions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch booking interactions');
    }

    return response.json();
  }

  /**
   * Mark interactions as read
   */
  async markInteractionsAsRead(bookingId: string, interactionIds: string[]): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({ interactionIds })
    });

    if (!response.ok) {
      throw new Error('Failed to mark interactions as read');
    }
  }

  /**
   * Cancel booking (either party can initiate)
   */
  async cancelBooking(bookingId: string, cancellationData: {
    reason: string;
    refundAmount?: number;
    refundMethod?: string;
    cancellationFee?: number;
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(cancellationData)
    });

    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('bookingCancelled', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  /**
   * Raise a dispute
   */
  async raiseDispute(bookingId: string, disputeData: {
    type: 'payment' | 'service_quality' | 'delivery' | 'contract_breach' | 'other';
    description: string;
    evidence?: string[];
    requestedResolution: string;
  }): Promise<BookingInteraction> {
    const response = await fetch(`${this.apiBaseUrl}/bookings/${bookingId}/dispute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(disputeData)
    });

    if (!response.ok) {
      throw new Error('Failed to raise dispute');
    }

    const interaction = await response.json();
    
    // Emit event for real-time updates
    window.dispatchEvent(new CustomEvent('disputeRaised', { 
      detail: { bookingId, interaction }
    }));

    return interaction;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get next expected action for a booking based on current status
   */
  getNextExpectedAction(booking: Booking, userType: 'couple' | 'vendor'): {
    action: string;
    description: string;
    urgent: boolean;
  } | null {
    const status = booking.status;
    
    if (userType === 'couple') {
      switch (status) {
        case 'quote_sent':
          return {
            action: 'review_quote',
            description: 'Review and respond to the vendor\'s quote',
            urgent: true
          };
        case 'downpayment_paid':
          return {
            action: 'wait_confirmation',
            description: 'Waiting for vendor to confirm booking',
            urgent: false
          };
        case 'in_progress':
          return {
            action: 'track_progress',
            description: 'Monitor service progress and communicate with vendor',
            urgent: false
          };
        case 'completed':
          return {
            action: 'leave_review',
            description: 'Leave a review for the vendor\'s service',
            urgent: false
          };
        default:
          return null;
      }
    } else { // vendor
      switch (status) {
        case 'quote_requested':
          return {
            action: 'send_quote',
            description: 'Prepare and send a detailed quote to the couple',
            urgent: true
          };
        case 'quote_accepted':
          return {
            action: 'request_downpayment',
            description: 'Request downpayment to confirm booking',
            urgent: false
          };
        case 'downpayment_paid':
          return {
            action: 'confirm_booking',
            description: 'Confirm the booking and begin service preparation',
            urgent: false
          };
        case 'confirmed':
          return {
            action: 'start_service',
            description: 'Begin service delivery and keep couple updated',
            urgent: false
          };
        case 'in_progress':
          return {
            action: 'complete_service',
            description: 'Complete the service and mark as delivered',
            urgent: false
          };
        default:
          return null;
      }
    }
  }

  /**
   * Get status timeline for display
   */
  getStatusTimeline(): Array<{
    status: BookingStatus;
    label: string;
    description: string;
    actorType: 'couple' | 'vendor' | 'system';
  }> {
    return [
      {
        status: 'draft',
        label: 'Booking Request',
        description: 'Couple submits initial booking request',
        actorType: 'couple'
      },
      {
        status: 'quote_requested',
        label: 'Quote Requested',
        description: 'Vendor reviews request and prepares quote',
        actorType: 'vendor'
      },
      {
        status: 'quote_sent',
        label: 'Quote Sent',
        description: 'Vendor sends detailed quote to couple',
        actorType: 'vendor'
      },
      {
        status: 'quote_accepted',
        label: 'Quote Accepted',
        description: 'Couple accepts the vendor\'s quote',
        actorType: 'couple'
      },
      {
        status: 'confirmed',
        label: 'Booking Confirmed',
        description: 'Booking is confirmed by vendor',
        actorType: 'vendor'
      },
      {
        status: 'downpayment_paid',
        label: 'Downpayment Made',
        description: 'Couple makes required downpayment',
        actorType: 'couple'
      },
      {
        status: 'in_progress',
        label: 'Service In Progress',
        description: 'Vendor begins service preparation/delivery',
        actorType: 'vendor'
      },
      {
        status: 'paid_in_full',
        label: 'Final Payment',
        description: 'Couple makes final payment',
        actorType: 'couple'
      },
      {
        status: 'completed',
        label: 'Service Completed',
        description: 'Service delivered and confirmed complete',
        actorType: 'system'
      }
    ];
  }

  /**
   * Create a booking interaction record
   * @private - Internal method for creating interaction records
   */
  private async createInteraction(bookingId: string, interactionData: {
    actionType: string;
    message: string;
    actorType: 'couple' | 'vendor' | 'admin';
    metadata?: Record<string, any>;
  }): Promise<BookingInteraction> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/bookings/${bookingId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(interactionData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create interaction');
      }

      const result = await response.json();
      return result.interaction;
    } catch (error) {
      console.error('Error creating interaction:', error);
      throw error;
    }
  }
}

export const bookingInteractionService = new BookingInteractionService();
