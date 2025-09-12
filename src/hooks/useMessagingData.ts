import { useState, useEffect, useCallback } from 'react';
import { MessagingApiService } from '../services/api/messagingApiService';
import type { Conversation, Message } from '../pages/shared/messenger/types';

export interface UseMessagingDataReturn {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  loadConversations: (vendorId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    senderId: string,
    senderName: string,
    senderType: 'couple' | 'vendor' | 'admin'
  ) => Promise<void>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export const useMessagingData = (vendorId?: string): UseMessagingDataReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVendorId, setCurrentVendorId] = useState<string | undefined>(vendorId);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();

  const loadConversations = useCallback(async (vendorId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentVendorId(vendorId);
      
      const conversationsData = await MessagingApiService.getConversations(vendorId);
      setConversations(conversationsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentConversationId(conversationId);
      
      const messagesData = await MessagingApiService.getMessages(conversationId);
      setMessages(messagesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    senderId: string,
    senderName: string,
    senderType: 'couple' | 'vendor' | 'admin'
  ) => {
    try {
      setError(null);
      
      const newMessage = await MessagingApiService.sendMessage(
        conversationId,
        content,
        senderId,
        senderName,
        senderType
      );
      
      // Add the new message to the current messages if we're viewing this conversation
      if (currentConversationId === conversationId) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      // Update the conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessage: {
                id: newMessage.id,
                senderId: newMessage.senderId,
                senderName: newMessage.senderName,
                senderRole: newMessage.senderRole,
                content: newMessage.content,
                timestamp: newMessage.timestamp,
                type: newMessage.type
              },
              updatedAt: new Date().toISOString()
            }
          : conv
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      throw err;
    }
  }, [currentConversationId]);

  const markAsRead = useCallback(async (conversationId: string, userId: string) => {
    try {
      setError(null);
      
      await MessagingApiService.markAsRead(conversationId, userId);
      
      // Update the conversation's unread count
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      
      // Mark messages as read in current conversation
      if (currentConversationId === conversationId) {
        setMessages(prev => prev.map(msg => 
          msg.senderId !== userId 
            ? { ...msg, isRead: true }
            : msg
        ));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark messages as read';
      setError(errorMessage);
      console.error('Error marking messages as read:', err);
    }
  }, [currentConversationId]);

  const refreshConversations = useCallback(async () => {
    if (currentVendorId) {
      await loadConversations(currentVendorId);
    }
  }, [currentVendorId, loadConversations]);

  const refreshMessages = useCallback(async () => {
    if (currentConversationId) {
      await loadMessages(currentConversationId);
    }
  }, [currentConversationId, loadMessages]);

  // Auto-load conversations on mount if vendorId is provided
  useEffect(() => {
    if (vendorId) {
      loadConversations(vendorId);
    }
  }, [vendorId, loadConversations]);

  return {
    conversations,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    refreshConversations,
    refreshMessages
  };
};
