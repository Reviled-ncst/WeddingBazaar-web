import React from 'react';
import { Outlet } from 'react-router-dom';
import { CoupleHeader } from '../landing/CoupleHeader';

export const IndividualLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CoupleHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
