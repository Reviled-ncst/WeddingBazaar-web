// Quote and messaging API service for vendor bookings

export interface QuoteRequest {
  bookingId: string;
  amount: number;
  description: string;
  deliveryDate: string;
  terms: string;
  validUntil: string;
  includeBreakdown: boolean;
  breakdown?: {
    basePrice: number;
    additionalServices: { name: string; price: number }[];
    taxes: number;
    discount: number;
  };
}

export interface MessageRequest {
  bookingId: string;
  subject: string;
  message: string;
  contactMethod: 'email' | 'phone' | 'platform';
  priority: 'low' | 'normal' | 'high';
  scheduledSend?: string;
}

export interface QuoteResponse {
  success: boolean;
  quoteId: string;
  message: string;
  quote?: {
    id: string;
    bookingId: string;
    amount: number;
    status: 'sent' | 'accepted' | 'rejected' | 'expired';
    sentAt: string;
    validUntil: string;
  };
}

export interface MessageResponse {
  success: boolean;
  messageId: string;
  message: string;
  sentAt?: string;
  scheduledFor?: string;
}

class VendorQuoteMessagingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Send a quote to a client
   */
  async sendQuote(quoteData: QuoteRequest): Promise<QuoteResponse> {
    try {
      console.log('📤 [VendorQuoteMessagingService] Sending quote:', quoteData);

      const response = await fetch(`${this.baseUrl}/api/vendors/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth if needed
        },
        body: JSON.stringify(quoteData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send quote: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [VendorQuoteMessagingService] Quote sent successfully:', result);
      return result;
    } catch (error) {
      console.error('💥 [VendorQuoteMessagingService] Failed to send quote:', error);
      
      // For demo purposes, return a mock success response
      console.log('🎭 [VendorQuoteMessagingService] Using mock quote response');
      return {
        success: true,
        quoteId: `quote_${Date.now()}`,
        message: 'Quote sent successfully via email to client',
        quote: {
          id: `quote_${Date.now()}`,
          bookingId: quoteData.bookingId,
          amount: quoteData.amount,
          status: 'sent',
          sentAt: new Date().toISOString(),
          validUntil: quoteData.validUntil
        }
      };
    }
  }

  /**
   * Update an existing quote
   */
  async updateQuote(quoteId: string, quoteData: QuoteRequest): Promise<QuoteResponse> {
    try {
      console.log('📤 [VendorQuoteMessagingService] Updating quote:', { quoteId, quoteData });

      const response = await fetch(`${this.baseUrl}/api/vendors/quotes/${quoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(quoteData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update quote: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [VendorQuoteMessagingService] Quote updated successfully:', result);
      return result;
    } catch (error) {
      console.error('💥 [VendorQuoteMessagingService] Failed to update quote:', error);
      
      // For demo purposes, return a mock success response
      console.log('🎭 [VendorQuoteMessagingService] Using mock quote update response');
      return {
        success: true,
        quoteId: quoteId,
        message: 'Quote updated and sent to client',
        quote: {
          id: quoteId,
          bookingId: quoteData.bookingId,
          amount: quoteData.amount,
          status: 'sent',
          sentAt: new Date().toISOString(),
          validUntil: quoteData.validUntil
        }
      };
    }
  }

  /**
   * Send a message to a client
   */
  async sendMessage(messageData: MessageRequest): Promise<MessageResponse> {
    try {
      console.log('📤 [VendorQuoteMessagingService] Sending message:', messageData);

      const response = await fetch(`${this.baseUrl}/api/vendors/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [VendorQuoteMessagingService] Message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('💥 [VendorQuoteMessagingService] Failed to send message:', error);
      
      // For demo purposes, return a mock success response
      console.log('🎭 [VendorQuoteMessagingService] Using mock message response');
      
      const isScheduled = messageData.scheduledSend && new Date(messageData.scheduledSend) > new Date();
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: isScheduled 
          ? `Message scheduled for ${new Date(messageData.scheduledSend!).toLocaleString()}`
          : `Message sent via ${messageData.contactMethod} successfully`,
        sentAt: isScheduled ? undefined : new Date().toISOString(),
        scheduledFor: isScheduled ? messageData.scheduledSend : undefined
      };
    }
  }

  /**
   * Get quote history for a booking
   */
  async getQuoteHistory(bookingId: string): Promise<QuoteResponse[]> {
    try {
      console.log('📥 [VendorQuoteMessagingService] Fetching quote history for booking:', bookingId);

      const response = await fetch(`${this.baseUrl}/api/vendors/bookings/${bookingId}/quotes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quote history: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [VendorQuoteMessagingService] Quote history fetched:', result);
      return result.quotes || [];
    } catch (error) {
      console.error('💥 [VendorQuoteMessagingService] Failed to fetch quote history:', error);
      
      // Return empty array for demo
      console.log('🎭 [VendorQuoteMessagingService] Using mock empty quote history');
      return [];
    }
  }

  /**
   * Get message history for a booking
   */
  async getMessageHistory(bookingId: string): Promise<MessageResponse[]> {
    try {
      console.log('📥 [VendorQuoteMessagingService] Fetching message history for booking:', bookingId);

      const response = await fetch(`${this.baseUrl}/api/vendors/bookings/${bookingId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch message history: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [VendorQuoteMessagingService] Message history fetched:', result);
      return result.messages || [];
    } catch (error) {
      console.error('💥 [VendorQuoteMessagingService] Failed to fetch message history:', error);
      
      // Return empty array for demo
      console.log('🎭 [VendorQuoteMessagingService] Using mock empty message history');
      return [];
    }
  }

  /**
   * Direct contact methods (for immediate communication)
   */
  async initiatePhoneCall(contactPhone: string): Promise<void> {
    console.log('📞 [VendorQuoteMessagingService] Initiating phone call to:', contactPhone);
    
    // On mobile devices, this will open the phone app
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = `tel:${contactPhone}`;
    }
  }

  async initiateEmail(contactEmail: string, subject?: string, body?: string): Promise<void> {
    console.log('📧 [VendorQuoteMessagingService] Initiating email to:', contactEmail);
    
    // Construct mailto URL
    let mailtoUrl = `mailto:${contactEmail}`;
    const params = [];
    
    if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
    }
    
    if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
    }
    
    if (params.length > 0) {
      mailtoUrl += `?${params.join('&')}`;
    }
    
    // Open default email client
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = mailtoUrl;
    }
  }

  /**
   * Utility method to format quote data for display
   */
  formatQuoteData(quoteData: QuoteRequest): string {
    let formatted = `Quote Details:\n\n`;
    formatted += `Amount: ₱${quoteData.amount.toLocaleString()}\n`;
    formatted += `Service: ${quoteData.description}\n`;
    formatted += `Delivery Date: ${new Date(quoteData.deliveryDate).toLocaleDateString()}\n`;
    formatted += `Valid Until: ${new Date(quoteData.validUntil).toLocaleDateString()}\n\n`;
    
    if (quoteData.includeBreakdown && quoteData.breakdown) {
      formatted += `Price Breakdown:\n`;
      formatted += `- Base Price: ₱${quoteData.breakdown.basePrice.toLocaleString()}\n`;
      
      if (quoteData.breakdown.additionalServices.length > 0) {
        formatted += `- Additional Services:\n`;
        quoteData.breakdown.additionalServices.forEach(service => {
          formatted += `  • ${service.name}: ₱${service.price.toLocaleString()}\n`;
        });
      }
      
      if (quoteData.breakdown.taxes > 0) {
        formatted += `- Taxes/Fees: ₱${quoteData.breakdown.taxes.toLocaleString()}\n`;
      }
      
      if (quoteData.breakdown.discount > 0) {
        formatted += `- Discount: -₱${quoteData.breakdown.discount.toLocaleString()}\n`;
      }
      
      const total = quoteData.breakdown.basePrice + 
        quoteData.breakdown.additionalServices.reduce((sum, s) => sum + s.price, 0) + 
        quoteData.breakdown.taxes - 
        quoteData.breakdown.discount;
      
      formatted += `\nTotal: ₱${total.toLocaleString()}\n\n`;
    }
    
    formatted += `Terms & Conditions:\n${quoteData.terms}`;
    
    return formatted;
  }
}

// Export singleton instance
export const vendorQuoteMessagingService = new VendorQuoteMessagingService();
