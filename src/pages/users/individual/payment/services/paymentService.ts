import type { PaymentRequest, PaymentResponse, PaymentReceipt } from '../types/payment.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class PaymentService {
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  async getPaymentReceipts(bookingId: string): Promise<PaymentReceipt[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/receipts/booking/${bookingId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch receipts: ${response.statusText}`);
      }

      const result = await response.json();
      return result.receipts || [];
    } catch (error) {
      console.error('Error fetching payment receipts:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getReceipt(receiptId: string): Promise<PaymentReceipt> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/receipt/${receiptId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch receipt: ${response.statusText}`);
      }

      const result = await response.json();
      return result.receipt;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  }

  async downloadReceiptPDF(receiptId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/receipt/${receiptId}/pdf`);
      
      if (!response.ok) {
        throw new Error(`Failed to download receipt PDF: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading receipt PDF:', error);
      throw error;
    }
  }

  async emailReceipt(receiptId: string, email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/receipt/${receiptId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Failed to email receipt: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error emailing receipt:', error);
      return false;
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/verify/${paymentId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, reason?: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/refund/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Refund failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  // PayMongo specific methods
  async createPayMongoPayment(paymentData: {
    bookingId: string;
    amount: number;
    description: string;
    paymentMethod: string;
  }): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/paymongo/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`PayMongo payment creation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayMongo payment creation error:', error);
      throw error;
    }
  }

  async checkPayMongoStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/paymongo/status/${paymentId}`);
      
      if (!response.ok) {
        throw new Error(`PayMongo status check failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayMongo status check error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
