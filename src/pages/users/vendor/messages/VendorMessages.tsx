import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { ModernMessagesPage } from '../../../../shared/components/messaging/ModernMessagesPage';

export const VendorMessages: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 flex flex-col">
      <VendorHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ModernMessagesPage userType="vendor" />
      </div>
    </div>
  );
};

