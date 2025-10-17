import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useUnifiedMessaging } from '../../../contexts/UnifiedMessagingContext';
import type { 
  MessagingModalContextType, 
  OpenModalParams,
  MessagingModalState 
} from '../../../types/messaging-modal.types';

const MessagingModalContext = createContext<MessagingModalContextType | null>(null);

interface MessagingModalProviderProps {
  children: ReactNode;
}

export const MessagingModalProvider: React.FC<MessagingModalProviderProps> = ({ children }) => {
  // Local modal state
  const [modalState, setModalState] = useState<MessagingModalState>({
    isOpen: false,
    loading: false,
    sending: false,
    error: null,
    conversationId: null,
    vendorInfo: null,
    serviceInfo: null,
    messages: []
  });

  // Get unified messaging functions
  const {
    createBusinessConversation,
    setActiveConversation,
    setModalOpen: setUnifiedModalOpen,
    sendMessage: unifiedSendMessage,
    messages: unifiedMessages,
    sending: unifiedSending,
    loading: unifiedLoading
  } = useUnifiedMessaging();

  // Open modal and create/load conversation
  const openModal = useCallback(async (params: OpenModalParams) => {
    console.log('🎯 [MessagingModalProvider] Opening modal with params:', params);
    
    try {
      setModalState((prev: MessagingModalState) => ({
        ...prev,
        loading: true,
        error: null,
        vendorInfo: {
          id: params.vendorId,
          name: params.vendorName,
          businessName: params.vendorName,
          category: params.serviceCategory,
          ...params.vendorInfo
        },
        serviceInfo: params.serviceName ? {
          id: `service-${params.vendorId}`,
          name: params.serviceName,
          category: params.serviceCategory || 'General',
          ...params.serviceInfo
        } : null
      }));

      // Create or get conversation
      const conversationId = await createBusinessConversation(
        params.vendorId,
        undefined, // bookingId
        params.serviceName || params.serviceCategory,
        params.vendorName
      );

      if (conversationId) {
        console.log('✅ [MessagingModalProvider] Conversation created/found:', conversationId);
        
        // Set the active conversation in unified messaging
        setActiveConversation(conversationId);
        
        // Update modal state
        setModalState((prev: MessagingModalState) => ({
          ...prev,
          isOpen: true,
          loading: false,
          conversationId,
          messages: unifiedMessages // Use messages from unified messaging system
        }));

        // Open the unified modal
        setUnifiedModalOpen(true);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('❌ [MessagingModalProvider] Error opening modal:', error);
      setModalState((prev: MessagingModalState) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to open conversation'
      }));
    }
  }, [createBusinessConversation, setActiveConversation, setUnifiedModalOpen, unifiedMessages]);

  // Close modal
  const closeModal = useCallback(() => {
    console.log('🔒 [MessagingModalProvider] Closing modal');
    
    setModalState((prev: MessagingModalState) => ({
      ...prev,
      isOpen: false,
      conversationId: null,
      vendorInfo: null,
      serviceInfo: null,
      error: null
    }));

    // Close the unified modal
    setUnifiedModalOpen(false);
  }, [setUnifiedModalOpen]);

  // Send message through unified system
  const sendMessage = useCallback(async (content: string) => {
    if (!modalState.conversationId) {
      console.error('❌ [MessagingModalProvider] No conversation ID for sending message');
      return;
    }

    console.log('📤 [MessagingModalProvider] Sending message:', content.substring(0, 50));
    
    try {
      setModalState((prev: MessagingModalState) => ({ ...prev, sending: true, error: null }));
      
      await unifiedSendMessage(modalState.conversationId, content);
      
      console.log('✅ [MessagingModalProvider] Message sent successfully');
    } catch (error) {
      console.error('❌ [MessagingModalProvider] Error sending message:', error);
      setModalState((prev: MessagingModalState) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }));
    } finally {
      setModalState((prev: MessagingModalState) => ({ ...prev, sending: false }));
    }
  }, [modalState.conversationId, unifiedSendMessage]);

  // Clear error
  const clearError = useCallback(() => {
    setModalState((prev: MessagingModalState) => ({ ...prev, error: null }));
  }, []);

  // Sync unified messages with modal state
  useEffect(() => {
    if (modalState.isOpen && modalState.conversationId && unifiedMessages) {
      console.log('🔄 [MessagingModalProvider] Syncing unified messages to modal:', unifiedMessages.length);
      setModalState((prev: MessagingModalState) => ({
        ...prev,
        messages: unifiedMessages
      }));
    }
  }, [unifiedMessages, modalState.isOpen, modalState.conversationId]);

  // Context value
  const contextValue: MessagingModalContextType = {
    ...modalState,
    // Override with unified messaging state where applicable
    loading: modalState.loading || unifiedLoading,
    sending: modalState.sending || unifiedSending,
    messages: (unifiedMessages || modalState.messages) as any, // Type conversion for compatibility
    
    // Actions
    openModal,
    closeModal,
    sendMessage,
    clearError
  };

  return (
    <MessagingModalContext.Provider value={contextValue}>
      {children}
    </MessagingModalContext.Provider>
  );
};

// Hook for using the messaging modal
export const useMessagingModal = (): MessagingModalContextType => {
  const context = useContext(MessagingModalContext);
  if (!context) {
    throw new Error('useMessagingModal must be used within a MessagingModalProvider');
  }
  return context;
};
