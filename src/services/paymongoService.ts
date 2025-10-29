import axios from 'axios';
import type { AxiosResponse } from 'axios';

// PayMongo API configuration
export const PAYMONGO_PUBLIC_KEY = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || 'pk_test_your_public_key_here';
const PAYMONGO_SECRET_KEY = import.meta.env.VITE_PAYMONGO_SECRET_KEY || 'sk_test_your_secret_key_here';
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Create axios instance with base configuration
const paymongoAPI = axios.create({
  baseURL: PAYMONGO_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth interceptor with browser-compatible base64
paymongoAPI.interceptors.request.use((config) => {
  // Browser-compatible base64 encoding (replaces Node.js Buffer)
  const authString = btoa(`${PAYMONGO_SECRET_KEY}:`);
  config.headers.Authorization = `Basic ${authString}`;
  return config;
});

// PayMongo types
export interface PayMongoSource {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    status?: 'pending' | 'chargeable' | 'cancelled' | 'expired' | 'paid';
    redirect: {
      success: string;
      failed: string;
      checkout_url?: string; // PayMongo returns this for e-wallet redirects
    };
    type: 'gcash' | 'grab_pay' | 'paymaya';
    checkout_url?: string; // Alternative location for checkout URL
    billing?: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface PayMongoPaymentIntent {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    statement_descriptor: string;
    status: string;
    client_key: string;
    created_at: number;
    updated_at: number;
    last_payment_error?: any;
    payment_method_allowed: string[];
    payments: any[];
    next_action?: {
      type: string;
      redirect?: {
        url: string;
      };
    };
  };
}

export interface PayMongoPayment {
  id: string;
  type: string;
  attributes: {
    access_url: string;
    amount: number;
    balance_transaction_id: string;
    billing: any;
    currency: string;
    description: string;
    disputed: boolean;
    external_reference_number: string;
    fee: number;
    foreign_fee: number;
    livemode: boolean;
    net_amount: number;
    origin: string;
    payment_intent_id: string;
    payout: any;
    source: any;
    statement_descriptor: string;
    status: string;
    tax_amount: number;
    refunds: any[];
    created_at: number;
    updated_at: number;
  };
}

export interface CreatePaymentIntentRequest {
  amount: number; // in centavos (e.g., 100000 = ₱1,000.00)
  currency: 'PHP';
  description: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
}

export interface CreateSourceRequest {
  type: 'gcash' | 'grab_pay' | 'paymaya';
  amount: number; // in centavos
  currency: 'PHP';
  description: string;
  redirect: {
    success: string;
    failed: string;
  };
  billing?: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, any>;
}

class PayMongoService {
  /**
   * Create a Payment Intent for card payments
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PayMongoPaymentIntent> {
    try {
      const requestBody = {
        data: {
          attributes: {
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            payment_method_allowed: ['card'],
            metadata: data.metadata || {},
          },
        },
      };
      const response: AxiosResponse<{ data: PayMongoPaymentIntent }> = await paymongoAPI.post('/payment_intents', requestBody);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ PayMongo Payment Intent Error:', error.response?.data || error.message);
      
      if (error.response?.data?.errors) {
        const errorDetails = error.response.data.errors.map((err: any) => err.detail || err.message).join(', ');
        throw new Error(`Payment Intent creation failed: ${errorDetails}`);
      }
      
      throw new Error(`Payment Intent creation failed: ${error.message}`);
    }
  }

  /**
   * Create a Source for e-wallet payments (GCash, Maya, GrabPay)
   */
  async createSource(data: CreateSourceRequest): Promise<PayMongoSource> {
    try {
      const requestBody = {
        data: {
          attributes: {
            type: data.type,
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            redirect: data.redirect,
            billing: data.billing,
            metadata: data.metadata || {},
          },
        },
      };
      const response: AxiosResponse<{ data: PayMongoSource }> = await paymongoAPI.post('/sources', requestBody);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ PayMongo Source Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      
      // More specific error messages
      if (error.response?.status === 400) {
        const errorDetails = error.response?.data?.errors || [];
        const errorMessages = errorDetails.map((err: any) => err.detail || err.message).join(', ');
        throw new Error(`PayMongo API Error (400): ${errorMessages || 'Invalid request parameters'}`);
      } else if (error.response?.status === 401) {
        throw new Error('PayMongo Authentication Error: Invalid API keys');
      } else if (error.response?.status === 422) {
        const errorDetails = error.response?.data?.errors || [];
        const errorMessages = errorDetails.map((err: any) => err.detail || err.message).join(', ');
        throw new Error(`PayMongo Validation Error: ${errorMessages}`);
      }
      
      throw new Error(`Source creation failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * Attach Source to Payment Intent
   */
  async attachSourceToPaymentIntent(paymentIntentId: string, sourceId: string): Promise<PayMongoPaymentIntent> {
    try {
      const response: AxiosResponse<{ data: PayMongoPaymentIntent }> = await paymongoAPI.post(
        `/payment_intents/${paymentIntentId}/attach`,
        {
          data: {
            attributes: {
              source_id: sourceId,
            },
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PayMongo Attach Source Error:', error.response?.data || error.message);
      throw new Error(`Source attachment failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * Retrieve Payment Intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PayMongoPaymentIntent> {
    try {
      const response: AxiosResponse<{ data: PayMongoPaymentIntent }> = await paymongoAPI.get(
        `/payment_intents/${paymentIntentId}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PayMongo Get Payment Intent Error:', error.response?.data || error.message);
      throw new Error(`Payment Intent retrieval failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * Retrieve Source
   */
  async getSource(sourceId: string): Promise<PayMongoSource> {
    try {
      const response: AxiosResponse<{ data: PayMongoSource }> = await paymongoAPI.get(`/sources/${sourceId}`);

      return response.data.data;
    } catch (error: any) {
      console.error('PayMongo Get Source Error:', error.response?.data || error.message);
      throw new Error(`Source retrieval failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * List Payments
   */
  async getPayments(limit: number = 10): Promise<PayMongoPayment[]> {
    try {
      const response: AxiosResponse<{ data: PayMongoPayment[] }> = await paymongoAPI.get(
        `/payments?limit=${limit}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error('PayMongo Get Payments Error:', error.response?.data || error.message);
      throw new Error(`Payments retrieval failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * Create a Payment using a Source (for e-wallet payments)
   */
  async createPayment(sourceId: string, options: {
    description: string;
    amount: number;
    currency: 'PHP';
  }): Promise<PayMongoPayment> {
    try {
      const requestBody = {
        data: {
          attributes: {
            amount: options.amount,
            currency: options.currency,
            description: options.description,
            source: {
              id: sourceId,
              type: 'source'
            }
          },
        },
      };
      const response: AxiosResponse<{ data: PayMongoPayment }> = await paymongoAPI.post('/payments', requestBody);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ PayMongo Payment Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
      
      // More specific error messages
      if (error.response?.status === 400) {
        const errorDetails = error.response?.data?.errors || [];
        const errorMessages = errorDetails.map((err: any) => err.detail || err.message).join(', ');
        throw new Error(`PayMongo API Error (400): ${errorMessages || 'Invalid request parameters'}`);
      } else if (error.response?.status === 401) {
        throw new Error('PayMongo Authentication Error: Invalid API keys');
      } else if (error.response?.status === 422) {
        const errorDetails = error.response?.data?.errors || [];
        const errorMessages = errorDetails.map((err: any) => err.detail || err.message).join(', ');
        throw new Error(`PayMongo Validation Error: ${errorMessages}`);
      }
      
      throw new Error(`Payment creation failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
    }
  }

  /**
   * Poll payment status for e-wallet payments
   */
  async pollPaymentStatus(sourceId: string, options: {
    maxAttempts?: number;
    intervalMs?: number;
    timeoutMs?: number;
  } = {}): Promise<{ status: 'paid' | 'failed' | 'pending'; payment?: PayMongoPayment; source?: PayMongoSource }> {
    const { maxAttempts = 60, intervalMs = 3000, timeoutMs = 180000 } = options; // 3 minutes timeout
    return new Promise((resolve) => {
      let attempts = 0;
      const startTime = Date.now();
      
      const poll = async () => {
        attempts++;
        
        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          resolve({ status: 'pending' });
          return;
        }
        
        // Check max attempts
        if (attempts > maxAttempts) {
          resolve({ status: 'pending' });
          return;
        }
        
        try {
          // First, check existing payments to see if one already exists for this source
          const payments = await this.getPayments(50); // Check more payments
          const existingPayment = payments.find(payment => {
            const sourceMatch = payment.attributes.source?.id === sourceId;
            const referenceMatch = payment.attributes.external_reference_number?.includes(sourceId);
            return sourceMatch || referenceMatch;
          });
          
          if (existingPayment) {
            if (existingPayment.attributes.status === 'paid') {
              resolve({ status: 'paid', payment: existingPayment });
              return;
            } else if (existingPayment.attributes.status === 'failed') {
              resolve({ status: 'failed', payment: existingPayment });
              return;
            }
          }
          
          // Get source status
          const source = await this.getSource(sourceId);
          // Check if source is chargeable (user has completed payment in e-wallet app)
          if (source.attributes.status === 'chargeable') {
            try {
              // Create payment from the chargeable source
              const payment = await this.createPayment(sourceId, {
                amount: source.attributes.amount,
                currency: 'PHP',
                description: source.attributes.description || 'Wedding Bazaar Payment',
              });
              if (payment.attributes.status === 'paid') {
                resolve({ status: 'paid', payment, source });
                return;
              } else if (payment.attributes.status === 'failed') {
                resolve({ status: 'failed', payment, source });
                return;
              } else {
              }
            } catch (paymentError: any) {
              console.error('❌ Error creating payment from chargeable source:', paymentError.message);
              // Continue polling as the source might become available later
            }
          } else if (source.attributes.status === 'cancelled' || source.attributes.status === 'expired') {
            resolve({ status: 'failed', source });
            return;
          }
          
          // Continue polling
          setTimeout(poll, intervalMs);
          
        } catch (error: any) {
          console.error('❌ Error during payment polling:', error.message);
          
          // If it's a 404 or source not found, the source might not be ready yet
          if (error.message.includes('404') || error.message.includes('not found')) {
            setTimeout(poll, intervalMs);
            return;
          }
          
          // If it's a rate limit error, wait longer before next attempt
          if (error.message.includes('429') || error.message.includes('rate limit')) {
            setTimeout(poll, intervalMs * 2);
            return;
          }
          
          // For other errors, continue polling for a while before giving up
          if (attempts < maxAttempts / 2) {
            setTimeout(poll, intervalMs);
            return;
          }
          
          // Give up after too many errors
          resolve({ status: 'pending' });
        }
      };
      
      // Start polling after a short delay to allow source to be processed
      setTimeout(poll, 2000);
    });
  }

  /**
   * Get QR code data for GCash/Maya payments
   */
  async getPaymentQRCode(sourceId: string): Promise<string | null> {
    try {
      const source = await this.getSource(sourceId);
      
      // Check if source has QR code data
      if (source.attributes.redirect?.checkout_url) {
        // For now, return the checkout URL - in a real implementation,
        // you might need to extract QR code data from PayMongo's response
        return source.attributes.redirect.checkout_url;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error getting QR code:', error);
      return null;
    }
  }

  /**
   * Convert amount from PHP to centavos
   */
  toCentavos(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from centavos to PHP
   */
  fromCentavos(amount: number): number {
    return amount / 100;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(this.fromCentavos(amount));
  }

  /**
   * Check if payment method requires source creation (e-wallets)
   */
  isEWalletMethod(method: string): boolean {
    return ['gcash', 'maya', 'grab_pay'].includes(method);
  }

  /**
   * Check if payment method requires payment intent creation (cards)
   */
  isCardMethod(method: string): boolean {
    return method === 'card';
  }

  /**
   * Get payment method display information
   */
  getPaymentMethodInfo(method: string) {
    const methodMap = {
      gcash: {
        name: 'GCash',
        color: 'blue',
        icon: '📱',
        description: 'Mobile wallet payment via QR code',
        typicalTime: '15 seconds'
      },
      maya: {
        name: 'Maya',
        color: 'green',
        icon: '💳',
        description: 'Digital wallet payment and cards',
        typicalTime: '12 seconds'
      },
      grab_pay: {
        name: 'GrabPay',
        color: 'emerald',
        icon: '🚖',
        description: 'Grab app integrated payment',
        typicalTime: '10 seconds'
      },
      card: {
        name: 'Credit/Debit Card',
        color: 'purple',
        icon: '💳',
        description: 'Visa, Mastercard, and other cards',
        typicalTime: '8 seconds'
      }
    };
    
    return methodMap[method as keyof typeof methodMap] || {
      name: method,
      color: 'gray',
      icon: '💳',
      description: 'Payment method',
      typicalTime: '10 seconds'
    };
  }
}

export const paymongoService = new PayMongoService();
export default paymongoService;
