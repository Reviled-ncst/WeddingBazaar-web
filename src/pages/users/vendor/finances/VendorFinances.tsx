import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';

export const VendorFinances: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <VendorHeader />
      
      <main className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-600 mt-2">Manage your earnings, invoices, and financial records.</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <p className="text-gray-600">Financial management coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};
