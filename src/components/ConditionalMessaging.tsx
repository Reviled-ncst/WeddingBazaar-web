import React from 'react';
import { useAuth } from '../shared/contexts/AuthContext';
import { GlobalFloatingChat } from '../shared/components/messaging/GlobalFloatingChat';
import { GlobalFloatingChatButton } from '../shared/components/messaging/GlobalFloatingChatButton';

/**
 * Conditional Messaging Component
 * Renders messaging components only for non-vendor users
 * Vendors have messaging functionality completely disabled
 */
export const ConditionalMessaging: React.FC = () => {
  const { user } = useAuth();
  
  // Don't render messaging components for vendors
  if (user?.role === 'vendor') {
    console.log('🚫 [ConditionalMessaging] Messaging disabled for vendor user:', user.id);
    return null;
  }
  
  // Render messaging components for individual/couple and admin users
  console.log('✅ [ConditionalMessaging] Messaging enabled for user role:', user?.role || 'guest');
  return (
    <>
      <GlobalFloatingChatButton />
      <GlobalFloatingChat />
    </>
  );
};
