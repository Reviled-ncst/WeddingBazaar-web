// PayMongo API Service - Core Payment Processing
// Handles all PayMongo API interactions

import type { 
  PayMongoPaymentIntent, 
  PayMongoSource, 
  PaymentConfiguration,
  PaymentResult 
} from '../../types/payment';

class PayMongoService {
  private config: PaymentConfiguration;
  private baseUrl: string;

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || '',
      secretKey: import.meta.env.VITE_PAYMONGO_SECRET_KEY || '',
      webhookSecret: import.meta.env.VITE_PAYMONGO_WEBHOOK_SECRET || '',
      environment: (import.meta.env.VITE_PAYMONGO_ENVIRONMENT as 'test' | 'live') || 'test',
      currency: 'PHP',
      returnUrl: `${window.location.origin}/payment/callback`
    };
    
    // Use our backend API endpoints instead of direct PayMongo calls
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(this.config.secretKey)}`
    };
  }

  // Create Payment Intent for Card Payments via Backend
  async createPaymentIntent(paymentData: {
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<PayMongoPaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/card/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency || 'PHP',
          description: paymentData.description || 'Wedding Bazaar Payment',
          metadata: paymentData.metadata || {}
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('PayMongo Payment Intent Error:', error);
      throw error;
    }
  }

  // Legacy method - use specific payment methods instead
  // Create Source for E-wallet Payments (GCash, PayMaya, GrabPay)
  /*
  async createSource(
    amount: number, 
    type: 'gcash' | 'paymaya' | 'grab_pay',
    currency: string = 'PHP',
    description?: string
  ): Promise<PayMongoSource> {
    // This method is deprecated - use createGCashPayment, createPayMayaPayment, etc. instead
    throw new Error('This method is deprecated. Use specific payment methods instead.');
  }
  */

  // Attach Payment Method to Payment Intent
  async attachPaymentMethod(paymentIntentId: string, paymentMethodId: string): Promise<PayMongoPaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}/attach`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: paymentMethodId
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to attach payment method');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PayMongo Attach Payment Method Error:', error);
      throw error;
    }
  }

  // Create Payment Method (for card payments)
  async createPaymentMethod(cardDetails: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_methods`, {
        method: 'POST',
        headers: this.getHeaders(), // Use public key for payment method creation
        body: JSON.stringify({
          data: {
            attributes: {
              type: 'card',
              details: cardDetails,
              billing: {
                name: 'Wedding Bazaar Customer',
                email: 'customer@weddingbazaar.com'
              }
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to create payment method');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PayMongo Payment Method Error:', error);
      throw error;
    }
  }

  // Get Payment Intent Status
  async getPaymentIntent(paymentIntentId: string): Promise<PayMongoPaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to get payment intent');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PayMongo Get Payment Intent Error:', error);
      throw error;
    }
  }

  // Get Source Status
  async getSource(sourceId: string): Promise<PayMongoSource> {
    try {
      const response = await fetch(`${this.baseUrl}/sources/${sourceId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to get source');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PayMongo Get Source Error:', error);
      throw error;
    }
  }

  // Process Card Payment
  async processCardPayment(
    amount: number,
    cardDetails: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    },
    currency: string = 'PHP',
    description?: string
  ): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await this.createPaymentIntent({
        amount,
        currency,
        description
      });
      
      // Create payment method
      const paymentMethod = await this.createPaymentMethod(cardDetails);
      
      // Attach payment method to payment intent
      const attachedIntent = await this.attachPaymentMethod(paymentIntent.id, paymentMethod.id);
      
      return {
        success: attachedIntent.status === 'succeeded',
        paymentIntent: attachedIntent,
        reference: attachedIntent.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card payment failed'
      };
    }
  }

  // Process E-wallet Payment
  async processEwalletPayment(
    _amount: number,
    _type: 'gcash' | 'paymaya' | 'grab_pay',
    _currency: string = 'PHP',
    _description?: string
  ): Promise<PaymentResult> {
    try {
      // TODO: Implement createSource method or use backend endpoint
      throw new Error('E-wallet payment not yet implemented');
      
      // const source = await this.createSource(amount, type, currency, description);
      // 
      // return {
      //   success: true,
      //   source,
      //   reference: source.id
      // };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'E-wallet payment failed'
      };
    }
  }

  // Create Card Payment
  async createCardPayment(bookingId: string, amount: number, paymentType: string, cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }): Promise<PaymentResult> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/payment/card/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentType,
          cardDetails
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Card payment creation failed');
      }

      return {
        success: true,
        paymentId: result.paymentId,
        paymentIntent: result.paymentIntent,
        requiresAction: result.requiresAction,
        clientSecret: result.clientSecret
      };
    } catch (error) {
      console.error('Card payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card payment failed'
      };
    }
  }

  // Create GrabPay Payment
  async createGrabPayPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/payment/grabpay/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentType
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'GrabPay payment creation failed');
      }

      return {
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl,
        sourceId: result.sourceId
      };
    } catch (error) {
      console.error('GrabPay payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GrabPay payment failed'
      };
    }
  }

  // Create Bank Transfer Payment
  async createBankTransferPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/payment/bank-transfer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentType
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Bank transfer creation failed');
      }

      return {
        success: true,
        paymentId: result.paymentId,
        transferInstructions: result.transferInstructions
      };
    } catch (error) {
      console.error('Bank transfer creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bank transfer creation failed'
      };
    }
  }

  // Create GCash Payment
  async createGCashPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/payment/gcash/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentType
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'GCash payment creation failed');
      }

      return {
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl,
        sourceId: result.sourceId
      };
    } catch (error) {
      console.error('GCash payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GCash payment failed'
      };
    }
  }

  // Create PayMaya Payment
  async createPayMayaPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/payment/paymaya/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentType
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'PayMaya payment creation failed');
      }

      return {
        success: true,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl,
        sourceId: result.sourceId
      };
    } catch (error) {
      console.error('PayMaya payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayMaya payment failed'
      };
    }
  }

  // Get Supported Payment Methods
  async getSupportedPaymentMethods(): Promise<any[]> {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/payment/methods`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payment methods');
      }

      return result.methods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Return default methods if API fails
      return [
        {
          id: 'card',
          name: 'Credit/Debit Card',
          type: 'card',
          description: 'Visa, Mastercard, JCB, and other cards',
          available: true,
          processingTime: 'Instant'
        },
        {
          id: 'gcash',
          name: 'GCash',
          type: 'gcash',
          description: 'Pay instantly with your GCash wallet',
          available: true,
          processingTime: 'Instant'
        }
      ];
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(_payload: string, signature: string): boolean {
    // Implement webhook signature verification
    // This is a simplified version - implement proper HMAC verification
    return signature.length > 0;
  }

  // Format amount for display
  formatAmount(amount: number, _currency: string = 'PHP', currencySymbol: string = '₱'): string {
    return `${currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Get available payment methods based on amount and currency
  getAvailablePaymentMethods(amount: number, currency: string = 'PHP') {
    const methods = [
      {
        id: 'card',
        type: 'card' as const,
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, JCB',
        available: true,
        processingTime: 'Instant',
        fees: 'Free'
      },
      {
        id: 'gcash',
        type: 'gcash' as const,
        name: 'GCash',
        description: 'Pay using your GCash wallet',
        available: currency === 'PHP' && amount >= 20,
        processingTime: 'Instant',
        fees: 'Free'
      },
      {
        id: 'paymaya',
        type: 'paymaya' as const,
        name: 'PayMaya',
        description: 'Pay using your PayMaya wallet',
        available: currency === 'PHP' && amount >= 20,
        processingTime: 'Instant',
        fees: 'Free'
      },
      {
        id: 'grab_pay',
        type: 'grab_pay' as const,
        name: 'GrabPay',
        description: 'Pay using your GrabPay wallet',
        available: currency === 'PHP' && amount >= 20,
        processingTime: 'Instant',
        fees: 'Free'
      }
    ];

    return methods.filter(method => method.available);
  }
}

// Export singleton instance
export const paymongoService = new PayMongoService();
export default PayMongoService;
