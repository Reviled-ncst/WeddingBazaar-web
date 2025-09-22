import React from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { UniversalMessagesPage } from '../../../../shared/components/messaging/UniversalMessagesPage';

export const IndividualMessages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      <CoupleHeader />
      <div className="pt-20">
        <UniversalMessagesPage userType="couple" />
      </div>
    </div>
  );
};

