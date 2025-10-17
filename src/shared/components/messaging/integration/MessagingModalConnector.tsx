import React from 'react';
import type { ReactNode } from 'react';
import { MessagingModalProvider } from './MessagingModalProvider';
import { MessagingModal } from '../modal/MessagingModal';

interface MessagingModalConnectorProps {
  children: ReactNode;
}

export const MessagingModalConnector: React.FC<MessagingModalConnectorProps> = ({ children }) => {
  return (
    <MessagingModalProvider>
      {children}
      <MessagingModal />
    </MessagingModalProvider>
  );
};
