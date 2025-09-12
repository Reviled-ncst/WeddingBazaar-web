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
  private baseUrl = 'https://api.paymongo.com/v1';

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || '',
      secretKey: import.meta.env.VITE_PAYMONGO_SECRET_KEY || '',
      webhookSecret: import.meta.env.VITE_PAYMONGO_WEBHOOK_SECRET || '',
      environment: (import.meta.env.VITE_PAYMONGO_ENVIRONMENT as 'test' | 'live') || 'test',
      currency: 'PHP',
      returnUrl: `${window.location.origin}/payment/callback`
    };
  }

  private getHeaders(useSecretKey = false) {
    const key = useSecretKey ? this.config.secretKey : this.config.publicKey;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(key + ':')}`
    };
  }

  // Create Payment Intent for Card Payments
  async createPaymentIntent(amount: number, currency: string = 'PHP', description?: string): Promise<PayMongoPaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(amount * 100), // Convert to centavos
              payment_method_allowed: ['card'],
              payment_method_options: {
                card: {
                  request_three_d_secure: 'automatic'
                }
              },
              currency,
              description: description || 'Wedding Bazaar Payment',
              statement_descriptor: 'Wedding Bazaar'
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to create payment intent');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PayMongo Payment Intent Error:', error);
      throw error;
    }
  }

  // Create Source for E-wallet Payments (GCash, PayMaya, GrabPay)
  async createSource(
    amount: number, 
    type: 'gcash' | 'paymaya' | 'grab_pay',
    currency: string = 'PHP',
    description?: string
  ): Promise<PayMongoSource> {
    try {
      const response = await fetch(`${this.baseUrl}/sources`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(amount * 100), // Convert to centavos
              currency,
              type,
              redirect: {
                success: this.config.returnUrl + '?status=success',
                failed: this.config.returnUrl + '?status=failed'
              },
              billing: {
                name: 'Wedding Bazaar Customer',
                email: 'customer@weddingbazaar.com'
              },
              description: description || 'Wedding Bazaar Payment'
            }
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Failed to create payment source');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PayMongo Source Error:', error);
      throw error;
    }
  }

  // Attach Payment Method to Payment Intent
  async attachPaymentMethod(paymentIntentId: string, paymentMethodId: string): Promise<PayMongoPaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}/attach`, {
        method: 'POST',
        headers: this.getHeaders(true),
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
        headers: this.getHeaders(false), // Use public key for payment method creation
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
        headers: this.getHeaders(true)
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
        headers: this.getHeaders(true)
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
      const paymentIntent = await this.createPaymentIntent(amount, currency, description);
      
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
    amount: number,
    type: 'gcash' | 'paymaya' | 'grab_pay',
    currency: string = 'PHP',
    description?: string
  ): Promise<PaymentResult> {
    try {
      const source = await this.createSource(amount, type, currency, description);
      
      return {
        success: true,
        source,
        reference: source.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'E-wallet payment failed'
      };
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
