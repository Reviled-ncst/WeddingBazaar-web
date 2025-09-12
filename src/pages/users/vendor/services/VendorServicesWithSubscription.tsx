// Example of how to integrate subscription access into VendorServices

import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { SubscriptionGate } from '../../../../shared/components/subscription/SubscriptionGate';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';
import { VendorServices } from './VendorServices';

// This shows how the VendorServices component would integrate subscription controls
export const VendorServicesWithSubscription: React.FC = () => {
  const { loading } = useSubscription();

  if (loading) {
    return <div>Loading subscription data...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <VendorHeader />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SubscriptionGate
            feature="service_listings"
            requiredTier="basic"
            fallback={
              <div className="text-center py-12">
                <p className="text-gray-600">Service management requires a subscription.</p>
              </div>
            }
          >
            <VendorServices />
          </SubscriptionGate>
        </div>
      </main>
    </div>
  );
};

export default VendorServicesWithSubscription;
