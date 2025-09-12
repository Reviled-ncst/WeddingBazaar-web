import React, { useEffect } from 'react';
import { useGlobalMessenger } from '../../../shared/contexts/GlobalMessengerContext';

interface FloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
  serviceName?: string;
}

/**
 * Legacy FloatingChat component that acts as a bridge to the GlobalMessengerContext.
 * This component is maintained for backward compatibility with existing code.
 * 
 * @deprecated Use GlobalFloatingChat from GlobalMessengerContext instead.
 * The actual chat UI is now rendered by GlobalFloatingChat component.
 */
export const FloatingChat: React.FC<FloatingChatProps> = ({
  isOpen,
  onClose: _onClose, // Unused in bridge mode, but kept for API compatibility
  vendorName,
  serviceName
}) => {
  const { openFloatingChat, closeFloatingChat } = useGlobalMessenger();

  // Debug logging for development only
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MESSENGER) {
    console.log('FloatingChat (Legacy Bridge) rendered with props:', { 
      isOpen, 
      vendorName, 
      serviceName 
    });
    console.warn('FloatingChat is deprecated. Use GlobalFloatingChat from GlobalMessengerContext instead.');
  }

  // When this legacy component opens, trigger the global messenger
  useEffect(() => {
    if (isOpen && vendorName && serviceName) {
      openFloatingChat({
        name: vendorName,
        service: serviceName,
        vendorId: `legacy-${vendorName.replace(/\s+/g, '-').toLowerCase()}`
      });
    }
  }, [isOpen, vendorName, serviceName, openFloatingChat]);

  // When this legacy component closes, close the global messenger
  useEffect(() => {
    if (!isOpen) {
      closeFloatingChat();
    }
  }, [isOpen, closeFloatingChat]);

  // This component now just acts as a bridge to the global messenger
  // The actual UI is rendered by GlobalFloatingChat
  return null;
};
