# Payment Integration Guide for Wedding Bazaar

## Overview
This guide explains how online payments work and how to integrate them into the Wedding Bazaar platform.

## How Online Payments Work

### 1. Payment Flow
```
Customer → Frontend → Payment Gateway → Bank → Vendor Account
```

### 2. Key Components

#### A. Payment Gateway
- **Purpose**: Secure intermediary between customer and bank
- **Examples**: Stripe, PayPal, GCash, PayMaya, Paymongo (Philippines)
- **Responsibilities**:
  - Card processing and validation
  - PCI compliance
  - Fraud detection
  - Currency conversion
  - Transaction monitoring

#### B. Payment Methods
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Digital Wallets**: GCash, PayMaya, PayPal, Apple Pay, Google Pay
- **Bank Transfers**: Direct bank-to-bank transfers
- **Online Banking**: BPI, BDO, Metrobank online
- **Cryptocurrency**: Bitcoin, Ethereum (advanced)

#### C. Security Standards
- **PCI DSS**: Payment Card Industry Data Security Standard
- **SSL/TLS**: Encrypted data transmission
- **Tokenization**: Replace card data with secure tokens
- **3D Secure**: Additional authentication layer

## Implementation for Philippines

### 1. Local Payment Gateways

#### Paymongo (Recommended for Philippines)
```javascript
// Install
npm install @paymongo/paymongo-js

// Frontend Integration
import { Paymongo } from '@paymongo/paymongo-js';

const paymongo = new Paymongo('pk_test_your_public_key');

const paymentData = {
  amount: 3600000, // Amount in centavos (36,000 PHP)
  currency: 'PHP',
  description: 'Wedding Photography Downpayment',
  statement_descriptor: 'Wedding Bazaar'
};

// Create payment method
const paymentMethod = await paymongo.createPaymentMethod({
  type: 'card',
  card: {
    number: '4343434343434345',
    exp_month: 12,
    exp_year: 25,
    cvc: '123'
  },
  billing: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+639171234567'
  }
});

// Create payment intent
const paymentIntent = await paymongo.createPaymentIntent(paymentData);

// Confirm payment
const confirmedPayment = await paymongo.confirmPaymentIntent(
  paymentIntent.id,
  { payment_method: paymentMethod.id }
);
```

#### GCash Integration
```javascript
// Backend webhook handler
app.post('/webhook/gcash', (req, res) => {
  const { reference_number, amount, status } = req.body;
  
  if (status === 'COMPLETED') {
    // Update booking payment status
    updateBookingPayment(reference_number, amount);
  }
  
  res.status(200).send('OK');
});
```

### 2. Frontend Implementation (React)

#### Payment Modal Component
```tsx
// src/components/PaymentModal.tsx
import React, { useState } from 'react';
import { Paymongo } from '@paymongo/paymongo-js';

interface PaymentModalProps {
  booking: Booking;
  amount: number;
  paymentType: 'downpayment' | 'full_payment';
  onSuccess: (paymentResult: any) => void;
  onError: (error: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  amount,
  paymentType,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const processPayment = async (paymentMethod: string) => {
    setLoading(true);
    
    try {
      switch (paymentMethod) {
        case 'card':
          await processCardPayment();
          break;
        case 'gcash':
          await processGCashPayment();
          break;
        case 'paymaya':
          await processPayMayaPayment();
          break;
      }
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const processCardPayment = async () => {
    const paymongo = new Paymongo(process.env.REACT_APP_PAYMONGO_PUBLIC_KEY);
    
    // Create payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100, // Convert to centavos
        currency: 'PHP',
        booking_id: booking.id,
        payment_type: paymentType
      })
    });
    
    const { client_secret } = await response.json();
    
    // Confirm payment
    const result = await paymongo.confirmPaymentIntent(client_secret, {
      payment_method: {
        type: 'card',
        card: {
          // Card details collected from secure form
        }
      }
    });
    
    if (result.status === 'succeeded') {
      onSuccess(result);
    }
  };

  const processGCashPayment = async () => {
    // Redirect to GCash authorization
    const response = await fetch('/api/payments/gcash/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        booking_id: booking.id,
        payment_type: paymentType,
        redirect_url: window.location.origin + '/payment/callback'
      })
    });
    
    const { authorization_url } = await response.json();
    window.location.href = authorization_url;
  };

  return (
    <div className="payment-modal">
      {/* Payment method selection UI */}
      <div className="payment-methods">
        <button onClick={() => setSelectedMethod('card')}>
          Credit/Debit Card
        </button>
        <button onClick={() => setSelectedMethod('gcash')}>
          GCash
        </button>
        <button onClick={() => setSelectedMethod('paymaya')}>
          PayMaya
        </button>
      </div>
      
      {selectedMethod && (
        <button 
          onClick={() => processPayment(selectedMethod)}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay ₱${amount.toLocaleString()}`}
        </button>
      )}
    </div>
  );
};
```

### 3. Backend Implementation (Node.js/Express)

#### Payment Service
```javascript
// backend/services/paymentService.js
import Paymongo from '@paymongo/paymongo-node';

const paymongo = new Paymongo(process.env.PAYMONGO_SECRET_KEY);

export class PaymentService {
  async createPaymentIntent(data) {
    try {
      const paymentIntent = await paymongo.paymentIntents.create({
        amount: data.amount,
        currency: 'PHP',
        description: data.description,
        statement_descriptor: 'Wedding Bazaar',
        metadata: {
          booking_id: data.booking_id,
          payment_type: data.payment_type
        }
      });
      
      return paymentIntent;
    } catch (error) {
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const confirmedPayment = await paymongo.paymentIntents.confirm(
        paymentIntentId,
        { payment_method: paymentMethodId }
      );
      
      return confirmedPayment;
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  async createGCashSource(data) {
    try {
      const source = await paymongo.sources.create({
        type: 'gcash',
        amount: data.amount,
        currency: 'PHP',
        redirect: {
          success: data.success_url,
          failed: data.failed_url
        },
        metadata: {
          booking_id: data.booking_id
        }
      });
      
      return source;
    } catch (error) {
      throw new Error(`GCash source creation failed: ${error.message}`);
    }
  }

  async processWebhook(event) {
    try {
      switch (event.type) {
        case 'payment.paid':
          await this.handlePaymentSuccess(event.data);
          break;
        case 'payment.failed':
          await this.handlePaymentFailure(event.data);
          break;
        case 'source.chargeable':
          await this.handleSourceChargeable(event.data);
          break;
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  async handlePaymentSuccess(paymentData) {
    const { booking_id, payment_type } = paymentData.attributes.metadata;
    
    // Update booking payment status
    await this.updateBookingPayment(booking_id, {
      payment_id: paymentData.id,
      amount: paymentData.attributes.amount / 100, // Convert from centavos
      payment_type,
      status: 'completed',
      payment_method: paymentData.attributes.source.type,
      transaction_reference: paymentData.attributes.source.id
    });
    
    // Update booking status
    await this.automateBookingStatus(booking_id);
    
    // Send confirmation email/SMS
    await this.sendPaymentConfirmation(booking_id);
  }
}
```

#### Payment Routes
```javascript
// backend/api/payments/routes.js
import express from 'express';
import { PaymentService } from '../../services/paymentService.js';

const router = express.Router();
const paymentService = new PaymentService();

// Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const paymentIntent = await paymentService.createPaymentIntent(req.body);
    
    res.json({
      success: true,
      client_secret: paymentIntent.attributes.client_key,
      payment_intent_id: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GCash authorization
router.post('/gcash/authorize', async (req, res) => {
  try {
    const source = await paymentService.createGCashSource(req.body);
    
    res.json({
      success: true,
      authorization_url: source.attributes.redirect.checkout_url,
      source_id: source.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    await paymentService.processWebhook(event);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

// Payment callback
router.get('/callback', async (req, res) => {
  const { source_id, booking_id } = req.query;
  
  try {
    // Verify payment status
    const source = await paymongo.sources.retrieve(source_id);
    
    if (source.attributes.status === 'chargeable') {
      // Create charge
      await paymentService.chargeSource(source_id, booking_id);
      res.redirect('/payment/success');
    } else {
      res.redirect('/payment/failed');
    }
  } catch (error) {
    res.redirect('/payment/error');
  }
});

export default router;
```

### 4. Database Schema for Payments

```sql
-- Payment records
CREATE TABLE IF NOT EXISTS booking_payments (
  id VARCHAR(255) PRIMARY KEY,
  booking_id VARCHAR(255) NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'downpayment', 'full_payment', 'partial'
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50) NOT NULL, -- 'card', 'gcash', 'paymaya', 'bank_transfer'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_gateway VARCHAR(50), -- 'paymongo', 'gcash', 'paymaya'
  transaction_reference VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  reference_number VARCHAR(255),
  notes TEXT,
  receipt_number VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (booking_id) REFERENCES enhanced_bookings(id)
);

-- Payment receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
  id VARCHAR(255) PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL,
  booking_id VARCHAR(255) NOT NULL,
  receipt_number VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50) NOT NULL,
  issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  receipt_data JSONB, -- Store receipt details as JSON
  
  FOREIGN KEY (payment_id) REFERENCES booking_payments(id),
  FOREIGN KEY (booking_id) REFERENCES enhanced_bookings(id)
);

-- Payment refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
  id VARCHAR(255) PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL,
  booking_id VARCHAR(255) NOT NULL,
  refund_amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  refund_status VARCHAR(50) DEFAULT 'pending',
  gateway_refund_id VARCHAR(255),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (payment_id) REFERENCES booking_payments(id),
  FOREIGN KEY (booking_id) REFERENCES enhanced_bookings(id)
);
```

### 5. Security Best Practices

#### Frontend Security
```javascript
// Never store sensitive data in localStorage
// Use secure tokens and client-side encryption

// Validate all user inputs
const validatePaymentForm = (data) => {
  const errors = {};
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Valid amount is required';
  }
  
  if (!data.payment_method) {
    errors.payment_method = 'Payment method is required';
  }
  
  return errors;
};

// Use HTTPS only
if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
  window.location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

#### Backend Security
```javascript
// Verify webhook signatures
const verifyWebhookSignature = (payload, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Rate limiting
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 payment requests per windowMs
  message: 'Too many payment attempts, please try again later.'
});

app.use('/api/payments', paymentLimiter);

// Input validation and sanitization
const { body, validationResult } = require('express-validator');

const validatePaymentRequest = [
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('booking_id').isLength({ min: 1 }).withMessage('Booking ID is required'),
  body('payment_type').isIn(['downpayment', 'full_payment']).withMessage('Invalid payment type'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

app.post('/api/payments/process', validatePaymentRequest, async (req, res) => {
  // Payment processing logic
});
```

### 6. Testing

#### Unit Tests
```javascript
// tests/paymentService.test.js
import { PaymentService } from '../backend/services/paymentService.js';

describe('PaymentService', () => {
  test('should create payment intent successfully', async () => {
    const paymentService = new PaymentService();
    const data = {
      amount: 3600000,
      currency: 'PHP',
      booking_id: 'test_booking_1',
      payment_type: 'downpayment'
    };
    
    const result = await paymentService.createPaymentIntent(data);
    
    expect(result).toHaveProperty('id');
    expect(result.attributes.amount).toBe(3600000);
  });
});
```

#### Integration Tests
```javascript
// tests/paymentFlow.test.js
import request from 'supertest';
import app from '../server/index.js';

describe('Payment Flow', () => {
  test('should process downpayment successfully', async () => {
    const response = await request(app)
      .post('/api/bookings/enhanced/1/automate-downpayment')
      .send({
        amount: 36000,
        paymentMethod: 'card'
      });
      
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Environment Variables

```bash
# .env
# Paymongo
PAYMONGO_SECRET_KEY=sk_test_your_secret_key
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key

# GCash
GCASH_MERCHANT_ID=your_merchant_id
GCASH_SECRET_KEY=your_secret_key

# PayMaya
PAYMAYA_PUBLIC_KEY=your_public_key
PAYMAYA_SECRET_KEY=your_secret_key

# Webhook
WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=your_database_connection_string
```

## Error Handling

```javascript
// Common payment errors and handling
const PaymentErrors = {
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  INVALID_CARD: 'invalid_card',
  EXPIRED_CARD: 'expired_card',
  NETWORK_ERROR: 'network_error',
  GATEWAY_ERROR: 'gateway_error'
};

const handlePaymentError = (error) => {
  switch (error.code) {
    case PaymentErrors.INSUFFICIENT_FUNDS:
      return 'Insufficient funds. Please check your account balance.';
    case PaymentErrors.INVALID_CARD:
      return 'Invalid card details. Please check and try again.';
    case PaymentErrors.EXPIRED_CARD:
      return 'Card has expired. Please use a different card.';
    default:
      return 'Payment processing failed. Please try again.';
  }
};
```

This comprehensive guide covers the complete payment integration for the Wedding Bazaar platform, including Philippine-specific payment methods and security best practices.
