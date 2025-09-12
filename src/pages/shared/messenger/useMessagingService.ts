import { useState, useCallback } from 'react';
import type { Message, Conversation } from './types';
import { MessagingApiService } from '../../../services/api/messagingApiService';

/**
 * @deprecated This hook is being migrated to use the GlobalMessengerContext.
 * Use useGlobalMessenger() from '../../../shared/contexts/GlobalMessengerContext' instead.
 * 
 * This hook now acts as a bridge to the backend API services.
 */

interface UseMessagingServiceReturn {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (conversationId: string, content: string, senderId: string) => Promise<Message | null>;
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (participants: string[], initiatorId: string) => Promise<Conversation | null>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
}

export const useMessagingService = (): UseMessagingServiceReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('API call failed:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = useCallback(async (userId: string): Promise<void> => {
    await handleApiCall(async () => {
      const data = await MessagingApiService.getConversations(userId);
      setConversations(data);
      return data;
    });
  }, []);

  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    await handleApiCall(async () => {
      const data = await MessagingApiService.getMessages(conversationId);
      setMessages(data);
      return data;
    });
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string, senderId: string): Promise<Message | null> => {
    return await handleApiCall(async () => {
      // For this legacy hook, we use default values for missing parameters
      const message = await MessagingApiService.sendMessage(
        conversationId,
        content,
        senderId,
        'User', // Default sender name
        'couple', // Default sender type for this legacy hook
        'text' // Default message type
      );
      
      // Update local messages state
      setMessages(prev => [...prev, message]);
      
      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: message, updatedAt: new Date() }
          : conv
      ));

      return message;
    });
  }, []);

  const createConversation = useCallback(async (_participants: string[], _initiatorId: string): Promise<Conversation | null> => {
    return await handleApiCall(async () => {
      // This legacy API doesn't map well to the new conversation creation flow
      // For now, we'll just return null and recommend using the GlobalMessengerContext
      console.warn('createConversation in useMessagingService is deprecated. Use GlobalMessengerContext instead.');
      
      // In a real implementation, you'd need to map participants to the new API format
      // which requires conversationId, vendorId, vendorName, serviceName, userId, userName, userType
      return null;
    });
  }, []);

  const markAsRead = useCallback(async (conversationId: string, userId: string): Promise<void> => {
    await handleApiCall(async () => {
      await MessagingApiService.markAsRead(conversationId, userId);

      // Update local conversation state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));

      return;
    });
  }, []);

  return {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    loadConversations,
    loadMessages,
    createConversation,
    markAsRead,
  };
};
