import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { CreditCard, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const VendorBilling: React.FC = () => {
  const billingHistory = [
    { id: '1', date: '2024-01-15', amount: '$29.99', plan: 'Premium Plan', status: 'paid' },
    { id: '2', date: '2023-12-15', amount: '$29.99', plan: 'Premium Plan', status: 'paid' },
    { id: '3', date: '2023-11-15', amount: '$29.99', plan: 'Premium Plan', status: 'paid' },
    { id: '4', date: '2023-10-15', amount: '$19.99', plan: 'Pro Plan', status: 'paid' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Billing & Payments
              </h1>
              <p className="text-gray-600">Manage your subscription and payment history</p>
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">Premium Plan</h3>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-700 mb-2">$29.99</div>
              <div className="text-purple-600 mb-4">per month</div>
              <div className="space-y-2 text-sm text-purple-600">
                <div>✓ Unlimited Services</div>
                <div>✓ Featured Listings</div>
                <div>✓ Advanced Analytics</div>
                <div>✓ Priority Support</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Next Billing Date</h4>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">February 15, 2024</span>
              </div>
              <div className="text-sm text-gray-600">
                Your subscription will auto-renew on this date
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">•••• •••• •••• 4242</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Update Payment Method
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Download className="h-4 w-4" />
              <span>Download All</span>
            </button>
          </div>

          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-700">{item.date}</td>
                    <td className="py-4 px-4 text-gray-700">{item.plan}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{item.amount}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {item.status === 'paid' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-medium">Paid</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-700 font-medium">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
