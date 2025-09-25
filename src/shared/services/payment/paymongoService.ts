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
  async createCardPayment(bookingId: string, amount: number, paymentType: string, _cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }): Promise<PaymentResult> {
    try {
      // First create a payment intent
      const response = await fetch(`${this.baseUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: amount * 100, // Convert to centavos
          currency: 'PHP',
          description: `Wedding Bazaar - ${paymentType} payment`,
          metadata: {
            booking_id: bookingId,
            payment_type: paymentType
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Payment intent creation failed');
      }

      return {
        success: true,
        paymentId: result.data?.id,
        paymentIntent: result.data,
        requiresAction: false,
        clientSecret: result.data?.attributes?.client_key
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
      const response = await fetch(`${this.baseUrl}/api/payments/create-source`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'gcash',
          amount: amount * 100, // Convert to centavos
          currency: 'PHP',
          redirect: {
            success: `${window.location.origin}/payment/success?booking_id=${bookingId}&payment_type=${paymentType}`,
            failed: `${window.location.origin}/payment/failed?booking_id=${bookingId}`
          },
          metadata: {
            booking_id: bookingId,
            payment_type: paymentType
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'GCash payment creation failed');
      }

      return {
        success: true,
        paymentId: result.data?.id,
        checkoutUrl: result.data?.attributes?.redirect?.checkout_url,
        sourceId: result.data?.id
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
      const response = await fetch(`${this.baseUrl}/api/payments/create-source`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'paymaya',
          amount: amount * 100, // Convert to centavos
          currency: 'PHP',
          redirect: {
            success: `${window.location.origin}/payment/success?booking_id=${bookingId}&payment_type=${paymentType}`,
            failed: `${window.location.origin}/payment/failed?booking_id=${bookingId}`
          },
          metadata: {
            booking_id: bookingId,
            payment_type: paymentType
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'PayMaya payment creation failed');
      }

      return {
        success: true,
        paymentId: result.data?.id,
        checkoutUrl: result.data?.attributes?.redirect?.checkout_url,
        sourceId: result.data?.id
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

  // Poll payment status for e-wallet payments
  async pollPaymentStatus(sourceId: string): Promise<any> {
    
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/status/${sourceId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check payment status');
      }

      return {
        status: result.status || 'pending',
        payment: result.payment || null
      };
    } catch (error) {
      console.error('Payment status polling error:', error);
      return {
        status: 'pending',
        payment: null,
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  // Compatibility methods for components
  async processCardPayment(
    amount: number,
    cardDetails: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    },
    _currency: string = 'PHP',
    _description?: string
  ): Promise<PaymentResult> {
    // Convert to the format expected by createCardPayment
    const expiry = `${cardDetails.exp_month.toString().padStart(2, '0')}/${cardDetails.exp_year.toString().slice(-2)}`;
    
    return this.createCardPayment(
      'temp-booking-id', // This should be passed as a parameter
      amount,
      'card',
      {
        number: cardDetails.number,
        expiry: expiry,
        cvc: cardDetails.cvc,
        name: 'Cardholder' // This should be passed as a parameter
      }
    );
  }

  async processEwalletPayment(
    amount: number,
    type: 'gcash' | 'paymaya' | 'grab_pay',
    _currency: string = 'PHP',
    _description?: string
  ): Promise<PaymentResult> {
    const bookingId = 'temp-booking-id'; // This should be passed as a parameter
    
    switch (type) {
      case 'gcash':
        return this.createGCashPayment(bookingId, amount, 'gcash');
      case 'paymaya':
        return this.createPayMayaPayment(bookingId, amount, 'paymaya');
      case 'grab_pay':
        return this.createGrabPayPayment(bookingId, amount, 'grab_pay');
      default:
        throw new Error(`Unsupported e-wallet type: ${type}`);
    }
  }

  async getSource(sourceId: string): Promise<any> {
    // Use the polling method to get source status
    return this.pollPaymentStatus(sourceId);
  }

  getAvailablePaymentMethods(amount: number, _currency: string = 'PHP') {
    // Return static list of available payment methods
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        type: 'card',
        enabled: true,
        minimumAmount: 100,
        maximumAmount: 1000000
      },
      {
        id: 'gcash',
        name: 'GCash',
        type: 'ewallet',
        enabled: true,
        minimumAmount: 100,
        maximumAmount: 500000
      },
      {
        id: 'paymaya',
        name: 'PayMaya',
        type: 'ewallet',
        enabled: true,
        minimumAmount: 100,
        maximumAmount: 500000
      },
      {
        id: 'grab_pay',
        name: 'GrabPay',
        type: 'ewallet',
        enabled: true,
        minimumAmount: 100,
        maximumAmount: 100000
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        type: 'bank',
        enabled: true,
        minimumAmount: 100,
        maximumAmount: 2000000
      }
    ].filter(method => amount >= method.minimumAmount && amount <= method.maximumAmount);
  }
}

export const paymongoService = new PayMongoService();
export default paymongoService;
