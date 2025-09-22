import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { UniversalMessagesPage } from '../../../../shared/components/messaging/UniversalMessagesPage';

export const VendorMessages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <VendorHeader />
      <div className="pt-20">
        <UniversalMessagesPage userType="vendor" />
      </div>
    </div>
  );
};

