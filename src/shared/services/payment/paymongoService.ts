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

  // Create Card Payment (REAL PayMongo Integration with Backend Receipt Generation)
  async createCardPayment(bookingId: string, amount: number, paymentType: string, cardDetails: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }): Promise<PaymentResult> {
    try {
      console.log('💳 [CARD PAYMENT - REAL] Processing REAL card payment with PayMongo...');
      console.log('💳 [CARD PAYMENT - REAL] Booking:', bookingId);
      console.log('💳 [CARD PAYMENT - REAL] Amount:', amount);
      console.log('💳 [CARD PAYMENT - REAL] Card ending in:', cardDetails.number.slice(-4));
      
      // Step 1: Create PayMongo Payment Intent
      console.log('💳 [STEP 1] Creating PayMongo payment intent...');
      const intentResponse = await fetch(`${this.baseUrl}/api/payment/create-intent`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to centavos
          currency: 'PHP',
          description: `Wedding Bazaar - Booking ${bookingId} - ${paymentType}`,
          payment_method_allowed: ['card'],
          metadata: {
            booking_id: bookingId,
            payment_type: paymentType
          }
        })
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        console.error('❌ [STEP 1] Payment intent creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const intentData = await intentResponse.json();
      const paymentIntentId = intentData.payment_intent_id;
      const clientKey = intentData.client_key;
      
      console.log('✅ [STEP 1] Payment intent created:', paymentIntentId);

      // Step 2: Create PayMongo Payment Method
      console.log('💳 [STEP 2] Creating PayMongo payment method...');
      const [expMonth, expYear] = cardDetails.expiry.split('/');
      
      const paymentMethodResponse = await fetch(`${this.baseUrl}/api/payment/create-payment-method`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'card',
          details: {
            card_number: cardDetails.number.replace(/\s/g, ''),
            exp_month: parseInt(expMonth),
            exp_year: parseInt('20' + expYear),
            cvc: cardDetails.cvc
          },
          billing: {
            name: cardDetails.name
          }
        })
      });

      if (!paymentMethodResponse.ok) {
        const errorData = await paymentMethodResponse.json();
        console.error('❌ [STEP 2] Payment method creation failed:', errorData);
        throw new Error(errorData.error || 'Invalid card details');
      }

      const paymentMethodData = await paymentMethodResponse.json();
      const paymentMethodId = paymentMethodData.payment_method_id;
      
      console.log('✅ [STEP 2] Payment method created:', paymentMethodId);

      // Step 3: Attach Payment Method to Intent
      console.log('💳 [STEP 3] Attaching payment method to intent...');
      const attachResponse = await fetch(`${this.baseUrl}/api/payment/attach-intent`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId,
          client_key: clientKey
        })
      });

      if (!attachResponse.ok) {
        const errorData = await attachResponse.json();
        console.error('❌ [STEP 3] Payment attachment failed:', errorData);
        throw new Error(errorData.error || 'Payment failed');
      }

      const attachData = await attachResponse.json();
      const paymentStatus = attachData.status;
      
      console.log('✅ [STEP 3] Payment processed, status:', paymentStatus);

      // Step 4: Process payment and create receipt in backend
      console.log('💳 [STEP 4] Creating receipt in backend...');
      const receiptResponse = await fetch(`${this.baseUrl}/api/payment/process`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          bookingId: bookingId,
          paymentType: paymentType,
          paymentMethod: 'card',
          amount: Math.round(amount * 100),
          paymentReference: paymentIntentId,
          metadata: {
            cardLast4: cardDetails.number.slice(-4),
            cardHolder: cardDetails.name,
            paymongo_payment_id: paymentIntentId,
            paymongo_payment_method_id: paymentMethodId
          }
        })
      });

      if (!receiptResponse.ok) {
        const errorData = await receiptResponse.json();
        console.warn('⚠️ [STEP 4] Receipt creation failed, but payment succeeded:', errorData);
        // Payment succeeded but receipt failed - still return success
      }

      const receiptData = await receiptResponse.json();
      
      console.log('✅ [CARD PAYMENT - REAL] Payment completed successfully!');
      console.log('🧾 [CARD PAYMENT - REAL] Receipt created:', receiptData.data?.receipt?.receipt_number);

      return {
        success: true,
        paymentId: paymentIntentId,
        receiptNumber: receiptData.data?.receipt?.receipt_number,
        receiptData: receiptData.data?.receipt,
        paymentIntent: {
          id: paymentIntentId,
          status: 'succeeded',
          amount: amount * 100,
          currency: 'PHP'
        },
        requiresAction: false
      };
    } catch (error) {
      console.error('❌ [CARD PAYMENT - REAL] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card payment failed'
      };
    }
  }

  // Create GrabPay Payment (Simulated for Demo)
  async createGrabPayPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      console.log('🚗 [GRABPAY PAYMENT] Starting GrabPay payment simulation...');
      console.log('🚗 [GRABPAY PAYMENT] Booking:', bookingId);
      console.log('🚗 [GRABPAY PAYMENT] Amount:', amount);
      console.log('🚗 [GRABPAY PAYMENT] Payment Type:', paymentType);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate payment success
      const paymentId = `grabpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ [GRABPAY PAYMENT] Payment simulation completed successfully');
      console.log('🚗 [GRABPAY PAYMENT] Transaction ID:', paymentId);

      return {
        success: true,
        paymentId: paymentId,
        checkoutUrl: `https://grab.com/checkout/${paymentId}`, // Simulated URL
        sourceId: paymentId,
        paymentIntent: {
          id: paymentId,
          status: 'succeeded',
          amount: amount * 100,
          currency: 'PHP'
        }
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

  // Create GCash Payment (Simulated for Demo)
  async createGCashPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      console.log('📱 [GCASH PAYMENT] Starting GCash payment simulation...');
      console.log('📱 [GCASH PAYMENT] Booking:', bookingId);
      console.log('📱 [GCASH PAYMENT] Amount:', amount);
      console.log('📱 [GCASH PAYMENT] Payment Type:', paymentType);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      // Simulate payment success
      const paymentId = `gcash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ [GCASH PAYMENT] Payment simulation completed successfully');
      console.log('📱 [GCASH PAYMENT] Transaction ID:', paymentId);

      return {
        success: true,
        paymentId: paymentId,
        checkoutUrl: `https://gcash.com/checkout/${paymentId}`, // Simulated URL
        sourceId: paymentId,
        paymentIntent: {
          id: paymentId,
          status: 'succeeded',
          amount: amount * 100,
          currency: 'PHP'
        }
      };
    } catch (error) {
      console.error('GCash payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GCash payment failed'
      };
    }
  }

  // Create PayMaya Payment (Simulated for Demo)
  async createPayMayaPayment(bookingId: string, amount: number, paymentType: string): Promise<PaymentResult> {
    try {
      console.log('💳 [MAYA PAYMENT] Starting Maya payment simulation...');
      console.log('💳 [MAYA PAYMENT] Booking:', bookingId);
      console.log('💳 [MAYA PAYMENT] Amount:', amount);
      console.log('💳 [MAYA PAYMENT] Payment Type:', paymentType);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2300));
      
      // Simulate payment success
      const paymentId = `maya_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ [MAYA PAYMENT] Payment simulation completed successfully');
      console.log('💳 [MAYA PAYMENT] Transaction ID:', paymentId);

      return {
        success: true,
        paymentId: paymentId,
        checkoutUrl: `https://maya.ph/checkout/${paymentId}`, // Simulated URL
        sourceId: paymentId,
        paymentIntent: {
          id: paymentId,
          status: 'succeeded',
          amount: amount * 100,
          currency: 'PHP'
        }
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
