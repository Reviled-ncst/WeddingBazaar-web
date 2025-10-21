import React, { useState } from 'react';
import { PayMongoPaymentModal } from '../shared/components/PayMongoPaymentModal';

/**
 * PayMongo Payment Test Component
 * 
 * Quick test interface for PayMongo payment integration
 * Use this to verify payment processing without going through the full booking flow
 * 
 * Test Card: 4343 4343 4343 4343
 * Expiry: 12/34
 * CVC: 123
 * Name: Test User
 */

export const PayMongoTestPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Test booking data
  const testBooking = {
    id: 'TEST-001',
    vendorName: 'Test Vendor Co.',
    serviceType: 'Photography',
    eventDate: '2025-06-15',
    bookingReference: 'WB-TEST-2025-001'
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('✅ Payment Success!', paymentData);
    setPaymentResult(paymentData);
    setError('');
    
    // Auto-close modal after 3 seconds
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  const handlePaymentError = (errorMsg: string) => {
    console.error('❌ Payment Error:', errorMsg);
    setError(errorMsg);
    setPaymentResult(null);
  };

  const resetTest = () => {
    setPaymentResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💳 PayMongo Payment Test
          </h1>
          <p className="text-gray-600">
            Quick test interface for payment integration
          </p>
        </div>

        {/* Test Card Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📝 Test Card Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">✅ Success Card</h3>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>Card:</strong> 4343 4343 4343 4343</p>
                <p><strong>Expiry:</strong> 12/34</p>
                <p><strong>CVC:</strong> 123</p>
                <p><strong>Name:</strong> Test User</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">❌ Declined Card</h3>
              <div className="space-y-1 text-sm text-red-800">
                <p><strong>Card:</strong> 4571 7360 0000 0008</p>
                <p><strong>Expiry:</strong> 12/34</p>
                <p><strong>CVC:</strong> 123</p>
                <p><strong>Name:</strong> Test User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Booking Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Test Booking Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Booking ID:</p>
              <p className="font-medium">{testBooking.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Reference:</p>
              <p className="font-medium">{testBooking.bookingReference}</p>
            </div>
            <div>
              <p className="text-gray-600">Vendor:</p>
              <p className="font-medium">{testBooking.vendorName}</p>
            </div>
            <div>
              <p className="text-gray-600">Service:</p>
              <p className="font-medium">{testBooking.serviceType}</p>
            </div>
            <div>
              <p className="text-gray-600">Event Date:</p>
              <p className="font-medium">{testBooking.eventDate}</p>
            </div>
          </div>
        </div>

        {/* Test Payment Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🧪 Test Payment Scenarios
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Deposit Payment
              <div className="text-sm opacity-90">₱25,000.00</div>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Balance Payment
              <div className="text-sm opacity-90">₱25,000.00</div>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Test Full Payment
              <div className="text-sm opacity-90">₱50,000.00</div>
            </button>
          </div>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <div className="bg-green-50 border border-green-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-900">
                ✅ Payment Successful!
              </h2>
              <button
                onClick={resetTest}
                className="text-green-700 hover:text-green-900 text-sm font-medium"
              >
                Reset
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-700 font-medium">Payment ID:</p>
                  <p className="text-green-900 font-mono">{paymentResult.payment_id}</p>
                </div>
                <div>
                  <p className="text-green-700 font-medium">Amount:</p>
                  <p className="text-green-900">{paymentResult.display_amount || paymentResult.amount}</p>
                </div>
                <div>
                  <p className="text-green-700 font-medium">Status:</p>
                  <p className="text-green-900 capitalize">{paymentResult.status}</p>
                </div>
                <div>
                  <p className="text-green-700 font-medium">Method:</p>
                  <p className="text-green-900 capitalize">{paymentResult.payment_method}</p>
                </div>
              </div>
              {paymentResult.receiptNumber && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-green-700 font-medium">Receipt Number:</p>
                  <p className="text-green-900 font-mono text-lg">{paymentResult.receiptNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Result */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-red-900">
                ❌ Payment Failed
              </h2>
              <button
                onClick={resetTest}
                className="text-red-700 hover:text-red-900 text-sm font-medium"
              >
                Reset
              </button>
            </div>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            📖 Testing Instructions
          </h2>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Click any payment button above to open the payment modal</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Select "Credit/Debit Card" as payment method</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Enter the test card details shown in the green box</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Click "Pay Now" and watch the payment process</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">5.</span>
              <span>Success! The receipt should be generated automatically</span>
            </li>
          </ol>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-blue-900 font-medium mb-2">🔍 What to Check:</p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✓ Payment modal opens correctly</li>
              <li>✓ Card form validation works</li>
              <li>✓ Payment processing shows progress</li>
              <li>✓ Success animation displays</li>
              <li>✓ Receipt number is generated</li>
              <li>✓ Console logs show detailed flow</li>
            </ul>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            📚 For detailed setup and troubleshooting, see{' '}
            <a 
              href="/PAYMONGO_TEST_SETUP_GUIDE.md" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              PAYMONGO_TEST_SETUP_GUIDE.md
            </a>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <PayMongoPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        booking={testBooking}
        paymentType="downpayment"
        amount={25000}
        currency="PHP"
        currencySymbol="₱"
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};

export default PayMongoTestPage;
