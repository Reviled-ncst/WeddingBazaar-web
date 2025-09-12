import React, { useState } from 'react';
import { PayMongoPaymentModal } from '../../shared/components/PayMongoPaymentModal';

export const PayMongoTest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const testBooking = {
    id: 'test-booking-1',
    vendorName: 'Test Photography Studio',
    serviceType: 'Wedding Photography',
    eventDate: '2025-12-15',
    bookingReference: 'WB-TEST-001'
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PayMongo Integration Test</h1>
        
        <div className="space-y-4 mb-6">
          <p><strong>Test API Keys:</strong></p>
          <p className="text-sm text-gray-600">Public: pk_test_your_public_key_here</p>
          <p className="text-sm text-gray-600">Secret: sk_test_your_secret_key_here</p>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="font-semibold">Test Booking Details:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Vendor:</strong> {testBooking.vendorName}</p>
            <p><strong>Service:</strong> {testBooking.serviceType}</p>
            <p><strong>Event Date:</strong> {testBooking.eventDate}</p>
            <p><strong>Reference:</strong> {testBooking.bookingReference}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Downpayment (₱36,000)
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            This will open the PayMongo payment modal with test data
          </p>
        </div>

        <PayMongoPaymentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          booking={testBooking}
          paymentType="downpayment"
          amount={36000}
          onPaymentSuccess={(paymentData: any) => {
            console.log('Test payment success:', paymentData);
            alert(`Payment successful! Amount: ₱${paymentData.amount / 100}`);
            setShowModal(false);
          }}
          onPaymentError={(error: string) => {
            console.error('Test payment error:', error);
            alert(`Payment error: ${error}`);
          }}
        />
      </div>
    </div>
  );
};
