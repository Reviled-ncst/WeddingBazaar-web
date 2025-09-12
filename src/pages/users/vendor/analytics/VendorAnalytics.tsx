import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';

export const VendorAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <VendorHeader />
      <div className="flex-1 bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track your business performance and insights.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-rose-500 text-2xl">📊</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-4">Comprehensive analytics dashboard coming soon...</p>
              <button className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-colors">
                Get Notified
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
