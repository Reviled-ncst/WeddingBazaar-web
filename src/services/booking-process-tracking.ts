/**
 * BOOKING PROCESS TRACKING SERVICE
 * 
 * Frontend service to integrate with the comprehensive booking process tracking system.
 * This service automatically logs all booking process steps, payments, and communications.
 */

interface ProcessStep {
  id: number;
  booking_id: number;
  process_step: string;
  process_status: string;
  description: string;
  metadata?: any;
  created_by: string;
  created_by_type: 'couple' | 'vendor' | 'admin' | 'system';
  created_at: string;
}

interface PaymentEntry {
  id: number;
  booking_id: number;
  payment_type: 'downpayment' | 'partial' | 'full' | 'refund';
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  transaction_id?: string;
  provider_reference?: string;
  metadata?: any;
  processed_at?: string;
  created_at: string;
}

interface CommunicationEntry {
  id: number;
  booking_id: number;
  communication_type: 'quote' | 'message' | 'call' | 'meeting' | 'email' | 'contract';
  sender_type: 'couple' | 'vendor' | 'admin' | 'system';
  sender_id: string;
  sender_name: string;
  recipient_type: 'couple' | 'vendor' | 'admin' | 'system';
  recipient_id: string;
  subject?: string;
  content: string;
  metadata?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface BookingProcessHistory {
  booking_status: {
    process_stage: string;
    progress_percentage: number;
    next_action: string;
    next_action_by: string;
    last_activity_at: string;
  };
  process_history: ProcessStep[];
  payment_history: PaymentEntry[];
  communication_history: CommunicationEntry[];
  summary: {
    total_process_steps: number;
    total_payments: number;
    total_communications: number;
    current_stage: string;
    progress_percentage: number;
  };
}

class BookingProcessTrackingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  }

  /**
   * Initialize booking process tracking tables in the database
   */
  async initializeTracking(): Promise<any> {
    try {
      console.log('🔧 [PROCESS] Initializing booking process tracking...');
      
      const response = await fetch(`${this.baseUrl}/api/bookings/init-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PROCESS] Booking process tracking initialized successfully');
        console.log('📊 [PROCESS] Tables created:', result.tables_created);
        console.log('🔄 [PROCESS] Columns added:', result.columns_added);
      } else {
        console.error('❌ [PROCESS] Failed to initialize tracking:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ [PROCESS] Error initializing tracking:', error);
      throw error;
    }
  }

  /**
   * Log a process step for a booking
   */
  async logProcessStep(
    bookingId: number,
    processStep: string,
    processStatus: string,
    description: string,
    metadata?: any,
    createdBy?: string,
    createdByType?: 'couple' | 'vendor' | 'admin' | 'system'
  ): Promise<any> {
    try {
      console.log('📋 [PROCESS] Logging process step:', processStep, 'for booking:', bookingId);
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}/log-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_step: processStep,
          process_status: processStatus,
          description,
          metadata,
          created_by: createdBy || 'frontend-user',
          created_by_type: createdByType || 'couple'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PROCESS] Process step logged successfully');
        console.log('📊 [PROCESS] Progress updated:', result.progress_updated);
      } else {
        console.error('❌ [PROCESS] Failed to log process step:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ [PROCESS] Error logging process step:', error);
      throw error;
    }
  }

  /**
   * Log a payment for a booking
   */
  async logPayment(
    bookingId: number,
    paymentData: {
      payment_type: 'downpayment' | 'partial' | 'full' | 'refund';
      amount: number;
      currency?: string;
      payment_method: string;
      payment_provider: string;
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
      transaction_id?: string;
      provider_reference?: string;
      metadata?: any;
    }
  ): Promise<any> {
    try {
      console.log('💳 [PAYMENT] Logging payment for booking:', bookingId);
      console.log('💰 [PAYMENT] Amount:', paymentData.amount, paymentData.currency || 'PHP');
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}/log-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PAYMENT] Payment logged successfully');
        console.log('📊 [PAYMENT] Process step logged:', result.process_step_logged);
      } else {
        console.error('❌ [PAYMENT] Failed to log payment:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ [PAYMENT] Error logging payment:', error);
      throw error;
    }
  }

  /**
   * Log communication for a booking
   */
  async logCommunication(
    bookingId: number,
    communicationData: {
      communication_type: 'quote' | 'message' | 'call' | 'meeting' | 'email' | 'contract';
      sender_type: 'couple' | 'vendor' | 'admin' | 'system';
      sender_id: string;
      sender_name: string;
      recipient_type: 'couple' | 'vendor' | 'admin' | 'system';
      recipient_id: string;
      subject?: string;
      content: string;
      metadata?: any;
    }
  ): Promise<any> {
    try {
      console.log('💬 [COMM] Logging communication for booking:', bookingId);
      console.log('📧 [COMM] Type:', communicationData.communication_type);
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}/log-communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(communicationData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [COMM] Communication logged successfully');
        console.log('📊 [COMM] Process step logged:', result.process_step_logged);
      } else {
        console.error('❌ [COMM] Failed to log communication:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ [COMM] Error logging communication:', error);
      throw error;
    }
  }

  /**
   * Get complete process history for a booking
   */
  async getProcessHistory(bookingId: number): Promise<BookingProcessHistory> {
    try {
      console.log('📜 [PROCESS] Getting process history for booking:', bookingId);
      
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}/process-history`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PROCESS] Retrieved complete process history');
        console.log('📊 [PROCESS] Summary:', result.summary);
        return result;
      } else {
        console.error('❌ [PROCESS] Failed to get process history:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ [PROCESS] Error getting process history:', error);
      throw error;
    }
  }

  /**
   * Auto-track common booking actions
   */
  async trackBookingAction(
    bookingId: number,
    action: 'quote_reviewed' | 'quote_accepted' | 'quote_declined' | 'contract_signed' | 'payment_initiated',
    metadata?: any,
    userId?: string,
    userType?: 'couple' | 'vendor'
  ): Promise<any> {
    const actionMap = {
      'quote_reviewed': {
        step: 'quote_reviewed',
        status: 'completed',
        description: 'Couple reviewed the quote from vendor'
      },
      'quote_accepted': {
        step: 'quote_accepted',
        status: 'completed',
        description: 'Couple accepted the quote and pricing'
      },
      'quote_declined': {
        step: 'quote_declined',
        status: 'completed',
        description: 'Couple declined the quote'
      },
      'contract_signed': {
        step: 'contract_signed',
        status: 'completed',
        description: 'Contract signed by couple'
      },
      'payment_initiated': {
        step: 'downpayment_pending',
        status: 'pending',
        description: 'Payment processing initiated by couple'
      }
    };

    const actionConfig = actionMap[action];
    if (!actionConfig) {
      throw new Error(`Unknown booking action: ${action}`);
    }

    return this.logProcessStep(
      bookingId,
      actionConfig.step,
      actionConfig.status,
      actionConfig.description,
      metadata,
      userId,
      userType
    );
  }

  /**
   * Get process progress percentage for display
   */
  getProgressPercentage(processStage: string): number {
    const progressMap = {
      'inquiry': 10,
      'vendor_reviewed': 20,
      'quote_sent': 30,
      'quote_reviewed': 40,
      'quote_accepted': 50,
      'contract_sent': 60,
      'downpayment_pending': 70,
      'downpayment_confirmed': 80,
      'final_payment_due': 90,
      'completed': 100,
      'cancelled': 0
    };

    return progressMap[processStage as keyof typeof progressMap] || 0;
  }

  /**
   * Get next action text for display
   */
  getNextActionText(processStage: string, nextActionBy: string): string {
    const actionMap = {
      'inquiry': 'Vendor to review booking request',
      'vendor_reviewed': 'Vendor to send quote',
      'quote_sent': nextActionBy === 'couple' ? 'You need to review the quote' : 'Couple to review the quote',
      'quote_reviewed': nextActionBy === 'couple' ? 'You need to accept or decline' : 'Couple to decide on quote',
      'quote_accepted': nextActionBy === 'couple' ? 'Process downpayment to confirm' : 'Awaiting couple payment',
      'contract_sent': nextActionBy === 'couple' ? 'Review and sign the contract' : 'Awaiting contract signature',
      'downpayment_pending': 'Payment processing...',
      'downpayment_confirmed': 'Await event date',
      'final_payment_due': nextActionBy === 'couple' ? 'Process final payment' : 'Awaiting final payment',
      'completed': 'Service completed',
      'cancelled': 'Booking cancelled'
    };

    return actionMap[processStage as keyof typeof actionMap] || 'Pending next step';
  }
}

// Export singleton instance
export const bookingProcessService = new BookingProcessTrackingService();
export default bookingProcessService;
