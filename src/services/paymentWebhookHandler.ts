/**
 * PayMongo Webhook Handler for Real-time Payment Notifications
 * 
 * This service handles webhook events from PayMongo to provide real-time
 * payment status updates without the need for polling.
 */

export interface PayMongoWebhookEvent {
  id: string;
  type: string;
  attributes: {
    type: 'source.chargeable' | 'payment.paid' | 'payment.failed';
    livemode: boolean;
    data: any;
    previous_data?: any;
    created_at: number;
    updated_at: number;
  };
}

export interface PaymentWebhookData {
  paymentId: string;
  sourceId?: string;
  status: 'paid' | 'failed' | 'chargeable';
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, any>;
}

class PaymentWebhookHandler {
  private eventListeners: Map<string, ((data: PaymentWebhookData) => void)[]> = new Map();

  /**
   * Register a listener for payment events
   */
  onPaymentEvent(eventType: 'paid' | 'failed' | 'chargeable', callback: (data: PaymentWebhookData) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove a listener for payment events
   */
  offPaymentEvent(eventType: 'paid' | 'failed' | 'chargeable', callback: (data: PaymentWebhookData) => void) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming webhook event
   */
  handleWebhookEvent(event: PayMongoWebhookEvent) {
    

    try {
      const webhookData = this.parseWebhookEvent(event);
      
      // Emit to all registered listeners
      const listeners = this.eventListeners.get(webhookData.status);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(webhookData);
          } catch (error) {
            console.error('Error in webhook event listener:', error);
          }
        });
      }

      // Also emit custom events for browser-based listening
      this.emitBrowserEvent(webhookData);

    } catch (error) {
      console.error('Error parsing webhook event:', error);
    }
  }

  /**
   * Parse PayMongo webhook event into standardized format
   */
  private parseWebhookEvent(event: PayMongoWebhookEvent): PaymentWebhookData {
    const { type, data } = event.attributes;

    switch (type) {
      case 'payment.paid':
        return {
          paymentId: data.id,
          sourceId: data.attributes.source?.id,
          status: 'paid',
          amount: data.attributes.amount,
          currency: data.attributes.currency,
          description: data.attributes.description,
          metadata: data.attributes.metadata || {},
        };

      case 'payment.failed':
        return {
          paymentId: data.id,
          sourceId: data.attributes.source?.id,
          status: 'failed',
          amount: data.attributes.amount,
          currency: data.attributes.currency,
          description: data.attributes.description,
          metadata: data.attributes.metadata || {},
        };

      case 'source.chargeable':
        return {
          paymentId: '', // No payment ID yet for chargeable sources
          sourceId: data.id,
          status: 'chargeable',
          amount: data.attributes.amount,
          currency: data.attributes.currency,
          description: data.attributes.description,
          metadata: data.attributes.metadata || {},
        };

      default:
        throw new Error(`Unsupported webhook event type: ${type}`);
    }
  }

  /**
   * Emit browser event for frontend components to listen to
   */
  private emitBrowserEvent(data: PaymentWebhookData) {
    const customEvent = new CustomEvent('paymongo-payment-update', {
      detail: data
    });
    window.dispatchEvent(customEvent);
  }

  /**
   * Set up browser event listener for payment updates
   */
  setupBrowserListener(callback: (data: PaymentWebhookData) => void) {
    const handleEvent = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('paymongo-payment-update', handleEvent as EventListener);

    // Return cleanup function
    return () => {
      window.removeEventListener('paymongo-payment-update', handleEvent as EventListener);
    };
  }

  /**
   * Simulate webhook event for testing
   */
  simulateWebhookEvent(type: 'payment.paid' | 'payment.failed' | 'source.chargeable', mockData: Partial<PaymentWebhookData>) {
    const event: PayMongoWebhookEvent = {
      id: `evt_${Date.now()}`,
      type: 'event',
      attributes: {
        type,
        livemode: false,
        data: {
          id: mockData.paymentId || `payment_${Date.now()}`,
          attributes: {
            amount: mockData.amount || 10000,
            currency: mockData.currency || 'PHP',
            description: mockData.description || 'Test Payment',
            metadata: mockData.metadata || {},
            source: mockData.sourceId ? { id: mockData.sourceId } : undefined,
          }
        },
        created_at: Date.now(),
        updated_at: Date.now(),
      }
    };

    this.handleWebhookEvent(event);
  }
}

// Export singleton instance
export const paymentWebhookHandler = new PaymentWebhookHandler();
