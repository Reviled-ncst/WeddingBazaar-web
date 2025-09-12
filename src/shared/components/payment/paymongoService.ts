import axios from 'axios';
import type { PayMongoSource, PayMongoPaymentIntent, PaymentCurrency } from './types';

// PayMongo API configuration
// PayMongo API configuration
// These keys should be set via environment variables
export const PAYMONGO_PUBLIC_KEY = import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || '';
const PAYMONGO_SECRET_KEY = import.meta.env.VITE_PAYMONGO_SECRET_KEY || '';

// Validate that required keys are present
if (!PAYMONGO_PUBLIC_KEY || !PAYMONGO_SECRET_KEY) {
  console.warn('PayMongo API keys not configured. Please set VITE_PAYMONGO_PUBLIC_KEY and VITE_PAYMONGO_SECRET_KEY environment variables.');
}
const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Browser-compatible base64 encoding (replaces Node.js Buffer)
function base64Encode(str: string): string {
  try {
    return btoa(str);
  } catch (error) {
    // Fallback for non-ASCII characters
    return btoa(unescape(encodeURIComponent(str)));
  }
}

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
  const authString = base64Encode(`${PAYMONGO_SECRET_KEY}:`);
  config.headers.Authorization = `Basic ${authString}`;
  return config;
});

export interface CreateSourceData {
  amount: number;
  currency: string;
  type: 'gcash' | 'grab_pay' | 'paymaya';
  description: string;
  billing?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  payment_method_allowed: string[];
  metadata?: Record<string, any>;
}

class PayMongoService {
  // Create payment source for e-wallets (GCash, GrabPay, PayMaya)
  async createSource(data: CreateSourceData): Promise<PayMongoSource> {
    try {
      console.log('🔄 Creating PayMongo source with data:', data);
      
      const redirectUrls = {
        success: `${window.location.origin}/payment/success`,
        failed: `${window.location.origin}/payment/failed`
      };

      const sourceData = {
        data: {
          attributes: {
            amount: Math.round(data.amount * 100), // Convert to centavos/cents
            currency: data.currency.toUpperCase(),
            type: data.type,
            description: data.description,
            redirect: redirectUrls,
            billing: data.billing
          }
        }
      };

      const response = await paymongoAPI.post('/sources', sourceData);
      
      if (response.data && response.data.data) {
        console.log('✅ PayMongo source created successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Invalid response format from PayMongo API');
      }
    } catch (error: any) {
      console.error('❌ PayMongo Source Error:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.detail).join(', ');
        throw new Error(`PayMongo API Error: ${errorMessages}`);
      } else if (error.message) {
        throw new Error(`Source creation failed: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating payment source');
      }
    }
  }

  // Create payment intent for card payments
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PayMongoPaymentIntent> {
    try {
      console.log('🔄 Creating PayMongo payment intent with data:', data);
      
      const intentData = {
        data: {
          attributes: {
            amount: Math.round(data.amount * 100), // Convert to centavos/cents
            currency: data.currency.toUpperCase(),
            description: data.description,
            payment_method_allowed: data.payment_method_allowed,
            payment_method_options: {
              card: {
                request_three_d_secure: 'automatic'
              }
            },
            metadata: data.metadata || {}
          }
        }
      };

      const response = await paymongoAPI.post('/payment_intents', intentData);
      
      if (response.data && response.data.data) {
        console.log('✅ PayMongo payment intent created successfully:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Invalid response format from PayMongo API');
      }
    } catch (error: any) {
      console.error('❌ PayMongo Payment Intent Error:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.detail).join(', ');
        throw new Error(`PayMongo API Error: ${errorMessages}`);
      } else if (error.message) {
        throw new Error(`Payment intent creation failed: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating payment intent');
      }
    }
  }

  // Get payment source status
  async getSource(sourceId: string): Promise<PayMongoSource> {
    try {
      const response = await paymongoAPI.get(`/sources/${sourceId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching PayMongo source:', error);
      throw new Error(`Failed to fetch payment source: ${error.message}`);
    }
  }

  // Get payment intent status
  async getPaymentIntent(intentId: string): Promise<PayMongoPaymentIntent> {
    try {
      const response = await paymongoAPI.get(`/payment_intents/${intentId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching PayMongo payment intent:', error);
      throw new Error(`Failed to fetch payment intent: ${error.message}`);
    }
  }

  // Format amount for display
  formatAmount(amount: number, currency: PaymentCurrency): string {
    if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
    } else {
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
  }

  // Convert amount to PayMongo format (centavos/cents)
  convertToMinorUnits(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert amount from PayMongo format to major units
  convertFromMinorUnits(amount: number): number {
    return amount / 100;
  }

  // Validate payment method availability
  isPaymentMethodAvailable(method: string, currency: string): boolean {
    const methodAvailability: Record<string, string[]> = {
      'gcash': ['PHP'],
      'grab_pay': ['PHP'],
      'paymaya': ['PHP'],
      'card': ['PHP', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD']
    };

    return methodAvailability[method]?.includes(currency.toUpperCase()) || false;
  }

  // Get redirect URL for payment completion
  getRedirectUrl(type: 'success' | 'failed'): string {
    return `${window.location.origin}/payment/${type}`;
  }
}

export const paymongoService = new PayMongoService();
export default paymongoService;
