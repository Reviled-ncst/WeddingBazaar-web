import React from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { ModernMessagesPage } from '../../../../shared/components/messaging/ModernMessagesPage';

export const IndividualMessages: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 flex flex-col">
      <CoupleHeader />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ModernMessagesPage userType="couple" />
      </div>
    </div>
  );
};

