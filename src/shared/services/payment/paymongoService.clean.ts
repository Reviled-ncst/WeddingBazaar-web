// PayMongo API Service - Clean Backend Integration
// Handles all payment processing via our backend API endpoints

import type { PaymentResult } from '../../types/payment';

class PayMongoService {
  private baseUrl: string;

  constructor() {
    // Use our backend API endpoints instead of direct PayMongo calls
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Create Card Payment
  async createCardPayment(bookingId: string, amount: number, paymentType: string, cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/card/create`, {
        method: 'POST',
        headers: this.getHeaders(),
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
      const response = await fetch(`${this.baseUrl}/api/payment/grabpay/create`, {
        method: 'POST',
        headers: this.getHeaders(),
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
      const response = await fetch(`${this.baseUrl}/api/payment/bank/create`, {
        method: 'POST',
        headers: this.getHeaders(),
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
        error: error instanceof Error ? error.message : 'Bank transfer failed'
      };
    }
  }

  // Create GCash Payment
  async createGCashPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/gcash/create`, {
        method: 'POST',
        headers: this.getHeaders(),
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
      const response = await fetch(`${this.baseUrl}/api/payment/paymaya/create`, {
        method: 'POST',
        headers: this.getHeaders(),
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

  // Get supported payment methods
  async getSupportedPaymentMethods(): Promise<any[]> {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
        enabled: true
      },
      {
        id: 'gcash',
        name: 'GCash',
        type: 'gcash',
        enabled: true
      },
      {
        id: 'paymaya',
        name: 'PayMaya',
        type: 'paymaya',
        enabled: true
      },
      {
        id: 'grab_pay',
        name: 'GrabPay',
        type: 'grab_pay',
        enabled: true
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        type: 'bank_transfer',
        enabled: true
      }
    ];
  }
}

export const paymongoService = new PayMongoService();
export default paymongoService;
