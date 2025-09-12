import { useState, useCallback } from 'react';

interface UseMessengerReturn {
  isMessengerOpen: boolean;
  openMessenger: (conversationId?: string) => void;
  closeMessenger: () => void;
  toggleMessenger: () => void;
  activeConversationId?: string;
}

export const useMessenger = (): UseMessengerReturn => {
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  const openMessenger = useCallback((conversationId?: string) => {
    setActiveConversationId(conversationId);
    setIsMessengerOpen(true);
  }, []);

  const closeMessenger = useCallback(() => {
    setIsMessengerOpen(false);
    setActiveConversationId(undefined);
  }, []);

  const toggleMessenger = useCallback(() => {
    setIsMessengerOpen(prev => !prev);
  }, []);

  return {
    isMessengerOpen,
    openMessenger,
    closeMessenger,
    toggleMessenger,
    activeConversationId,
  };
};
