/**
 * Test script for PayMongo real payment implementation
 * 
 * This script tests the PayMongo integration to ensure:
 * 1. Source creation works for e-wallets
 * 2. Payment Intent creation works for cards
 * 3. Webhook handling works correctly
 * 4. Error handling is robust
 */

import { paymongoService } from '../services/paymongoService.js';
import { paymentWebhookHandler } from '../services/paymentWebhookHandler.js';

async function testPayMongoIntegration() {
  console.log('🧪 Testing PayMongo Real Implementation...\n');

  // Test 1: Create Source for GCash
  try {
    console.log('📱 Test 1: Creating GCash Source...');
    const source = await paymongoService.createSource({
      type: 'gcash',
      amount: 50000, // ₱500.00 in centavos
      currency: 'PHP',
      description: 'Test GCash Payment - Wedding Bazaar',
      redirect: {
        success: 'https://weddingbazaar.com/success',
        failed: 'https://weddingbazaar.com/failed',
      },
      billing: {
        name: 'John Smith',
        email: 'test@weddingbazaar.com',
        phone: '+639171234567',
      },
      metadata: {
        booking_id: 'test_booking_123',
        payment_type: 'subscription_upgrade',
        test_mode: true,
      },
    });

    console.log('✅ GCash Source created successfully:');
    console.log(`   - Source ID: ${source.id}`);
    console.log(`   - Amount: ₱${source.attributes.amount / 100}`);
    console.log(`   - Redirect URL: ${source.attributes.redirect?.checkout_url || 'Not provided'}`);
    console.log('');

  } catch (error) {
    console.error('❌ GCash Source creation failed:', error.message);
    console.log('');
  }

  // Test 2: Create Payment Intent for Cards
  try {
    console.log('💳 Test 2: Creating Card Payment Intent...');
    const intent = await paymongoService.createPaymentIntent({
      amount: 75000, // ₱750.00 in centavos
      currency: 'PHP',
      description: 'Test Card Payment - Wedding Bazaar',
      statement_descriptor: 'Wedding Bazaar',
      metadata: {
        booking_id: 'test_booking_456',
        payment_type: 'downpayment',
        test_mode: true,
      },
    });

    console.log('✅ Card Payment Intent created successfully:');
    console.log(`   - Intent ID: ${intent.id}`);
    console.log(`   - Amount: ₱${intent.attributes.amount / 100}`);
    console.log(`   - Status: ${intent.attributes.status}`);
    console.log(`   - Client Key: ${intent.attributes.client_key.substring(0, 20)}...`);
    console.log('');

  } catch (error) {
    console.error('❌ Card Payment Intent creation failed:', error.message);
    console.log('');
  }

  // Test 3: Webhook Handler
  try {
    console.log('📡 Test 3: Testing Webhook Handler...');
    
    // Set up webhook listener
    paymentWebhookHandler.onPaymentEvent('paid', (data) => {
      console.log('✅ Webhook event received - Payment Paid:');
      console.log(`   - Payment ID: ${data.paymentId}`);
      console.log(`   - Amount: ₱${data.amount / 100}`);
      console.log(`   - Status: ${data.status}`);
      console.log('');
    });

    // Simulate webhook event
    paymentWebhookHandler.simulateWebhookEvent('payment.paid', {
      paymentId: 'pay_test_123456',
      sourceId: 'src_test_789012',
      amount: 50000,
      currency: 'PHP',
      description: 'Test Webhook Payment',
      metadata: { test: true },
    });

  } catch (error) {
    console.error('❌ Webhook handler test failed:', error.message);
    console.log('');
  }

  // Test 4: Error Handling
  try {
    console.log('⚠️  Test 4: Testing Error Handling...');
    
    // Try to create source with invalid data
    await paymongoService.createSource({
      type: 'gcash',
      amount: 50, // Too low amount (below ₱1.00)
      currency: 'PHP',
      description: 'Invalid Amount Test',
      redirect: {
        success: 'invalid-url', // Invalid URL
        failed: 'invalid-url',
      },
      billing: {
        name: '',
        email: 'invalid-email',
        phone: 'invalid-phone',
      },
    });

  } catch (error) {
    console.log('✅ Error handling works correctly:');
    console.log(`   - Error caught: ${error.message}`);
    console.log('');
  }

  console.log('🏁 PayMongo integration tests completed!');
}

// Export for use in other files
export { testPayMongoIntegration };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testPayMongoIntegration().catch(console.error);
}
