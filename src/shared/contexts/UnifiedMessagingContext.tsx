import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './HybridAuthContext';
import { MessagingApiService } from '../../services/api/messagingApiService';
import { ConnectedChatModal } from '../components/messaging/ConnectedChatModal';

// Unified types for all messaging components
export interface UnifiedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'vendor' | 'individual' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  attachments?: string[];
}

export interface UnifiedConversation {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  participantTypes: { [userId: string]: 'vendor' | 'individual' | 'admin' };
  lastMessage?: UnifiedMessage;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  businessContext?: {
    bookingId?: string;
    serviceType?: string;
    vendorBusinessName?: string;
  };
}

interface UnifiedMessagingContextType {
  // Data
  conversations: UnifiedConversation[];
  activeConversation: UnifiedConversation | null;
  messages: UnifiedMessage[];
  unreadCount: number;
  
  // Loading states
  loading: boolean;
  sending: boolean;
  error: string | null;
  
  // Core actions - SINGLE SOURCE OF TRUTH
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, messageType?: 'text' | 'image' | 'file') => Promise<void>;
  createConversation: (targetUserId: string, targetUserType: 'vendor' | 'individual', initialMessage?: string, targetUserName?: string) => Promise<string | null>;
  setActiveConversation: (conversationId: string | null) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // UI states for all components
  isFloatingChatOpen: boolean;
  isModalOpen: boolean;
  setFloatingChatOpen: (open: boolean) => void;
  setModalOpen: (open: boolean) => void;
  
  // Business context helpers
  createBusinessConversation: (vendorId: string, bookingId?: string, serviceType?: string, vendorName?: string) => Promise<string | null>;
}

const UnifiedMessagingContext = createContext<UnifiedMessagingContextType | null>(null);

interface UnifiedMessagingProviderProps {
  children: ReactNode;
}

export const UnifiedMessagingProvider: React.FC<UnifiedMessagingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Data state
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [isFloatingChatOpen, setFloatingChatOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  // Helper function to handle API calls with unified error handling and offline fallback
  const handleApiCall = async (
    apiCall: () => Promise<any>,
    loadingStateSetter?: (loading: boolean) => void,
    fallbackData?: any
  ): Promise<any> => {
    try {
      if (loadingStateSetter) loadingStateSetter(true);
      setError(null);
      
      const result = await apiCall();
      console.log('✅ [UnifiedMessaging] API call successful:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('💥 [UnifiedMessaging] API call failed:', err);
      
      // Check if this is a network/server error (500, timeout, etc.)
      const isServerError = errorMessage.includes('500') || 
                           errorMessage.includes('timeout') || 
                           errorMessage.includes('network') ||
                           errorMessage.includes('connect');
      
      if (isServerError && fallbackData !== undefined) {
        console.log('� [UnifiedMessaging] Using fallback data for offline mode');
        setError('Backend temporarily unavailable - using offline mode');
        return fallbackData;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      if (loadingStateSetter) loadingStateSetter(false);
    }
  };

  // Transform API data to unified format - PRESERVE ALL BACKEND FIELDS
  const transformToUnifiedConversation = (apiConversation: any): UnifiedConversation => {
    return {
      // Core unified fields
      id: apiConversation.id,
      participants: apiConversation.participants || [],
      participantNames: apiConversation.participantNames || {},
      participantTypes: apiConversation.participantTypes || {},
      lastMessage: apiConversation.lastMessage ? transformToUnifiedMessage(apiConversation.lastMessage) : undefined,
      unreadCount: apiConversation.unread_count || apiConversation.unreadCount || 0,
      updatedAt: apiConversation.updatedAt || apiConversation.updated_at,
      createdAt: apiConversation.createdAt || apiConversation.created_at,
      businessContext: apiConversation.businessContext,
      
      // PRESERVE ALL BACKEND FIELDS for rich UI display
      ...apiConversation  // Spread all original fields including participant_name, service_name, etc.
    } as UnifiedConversation;
  };

  const transformToUnifiedMessage = (apiMessage: any): UnifiedMessage => {
    console.log('🔄 [UnifiedMessaging] Transforming API message:', apiMessage);
    const transformed = {
      id: apiMessage.id,
      conversationId: apiMessage.conversationId || apiMessage.conversation_id,
      senderId: apiMessage.senderId || apiMessage.sender_id,
      senderName: apiMessage.senderName || apiMessage.sender_name || 'Unknown',
      senderType: apiMessage.senderType || apiMessage.sender_type || 'individual',
      content: apiMessage.content,
      timestamp: apiMessage.timestamp || apiMessage.created_at,
      isRead: apiMessage.isRead || false,
      messageType: apiMessage.messageType || apiMessage.message_type || 'text',
      attachments: apiMessage.attachments
    };
    console.log('✅ [UnifiedMessaging] Transformed to unified message:', transformed);
    return transformed;
  };

  // CORE ACTIONS - Single source of truth using MessagingApiService
  const loadConversations = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.warn('⚠️ [UnifiedMessaging] No user ID available for loading conversations');
      return;
    }

    console.log('📥 [UnifiedMessaging] Loading conversations for user:', user.id, 'Role:', user.role);
    
    // VENDOR FIX: Use vendor-specific conversation loading for vendors
    // Robust vendor detection: check role, business properties, and ID pattern
    const isVendor = user.role === 'vendor' || 
                    user.businessName || 
                    user.vendorId || 
                    user.id.startsWith('2-2025-');
    
    console.log('🔍 [UnifiedMessaging] Vendor detection:', {
      role: user.role,
      hasBusinessName: !!user.businessName,
      hasVendorId: !!user.vendorId,
      idPattern: user.id.startsWith('2-2025-'),
      finalIsVendor: isVendor
    });
    
    const apiConversations = await handleApiCall(
      () => isVendor 
        ? MessagingApiService.getVendorConversations(user.id)
        : MessagingApiService.getConversations(user.id),
      setLoading,
      [] // Empty array fallback for offline mode
    );

    if (apiConversations !== null) {
      const unifiedConversations = (apiConversations || []).map(transformToUnifiedConversation);
      
      console.log('� [UnifiedMessaging] Using ONLY API conversations:', unifiedConversations.length, '(Mock data disabled)');
      
      // Sort conversations by updatedAt (most recent first)
      const sortedConversations = unifiedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setConversations(sortedConversations);
      
      // Calculate total unread count
      const totalUnread = sortedConversations.reduce((sum: number, conv: UnifiedConversation) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
      
      console.log('✅ [UnifiedMessaging] Loaded conversations:', sortedConversations.length, 'Total unread:', totalUnread, `(${isVendor ? 'VENDOR' : 'COUPLE'} mode)`);
    }
  }, [user?.id, user?.role]);

  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    console.log('📥 [UnifiedMessaging] Loading messages for conversation:', conversationId);
    
    const apiMessages = await handleApiCall(
      () => MessagingApiService.getMessages(conversationId),
      setLoading
    );

    if (apiMessages) {
      const unifiedMessages = apiMessages.map(transformToUnifiedMessage);
      
      console.log('📂 [UnifiedMessaging] Using ONLY API messages:', unifiedMessages.length, '(Mock data disabled)');
      
      // Sort messages by timestamp (oldest first for chat display)
      const sortedMessages = unifiedMessages.sort((a: UnifiedMessage, b: UnifiedMessage) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      setMessages(sortedMessages);
      console.log('✅ [UnifiedMessaging] Loaded messages:', sortedMessages.length);
    }
  }, []);

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<void> => {
    console.log('🎯 [UnifiedMessaging] sendMessage called with:', { conversationId, content, messageType });
    console.log('🔍 [UnifiedMessaging] User context:', { userId: user?.id, userEmail: user?.email, userRole: user?.role });
    
    if (!user?.id || !content.trim()) {
      console.warn('⚠️ [UnifiedMessaging] Cannot send message: missing user ID or content');
      console.warn('   User ID:', user?.id);
      console.warn('   Content:', content);
      return;
    }

    console.log('📤 [UnifiedMessaging] Sending message:', { conversationId, content: content.substring(0, 50) + '...' });
    
    const newMessage = await handleApiCall(
      () => MessagingApiService.sendMessage(
        conversationId, 
        content, 
        user.id, 
        user.businessName || user.email || 'Unknown User',
        (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple') as 'couple' | 'vendor' | 'admin',
        messageType
      ),
      setSending
    );

    console.log('📨 [UnifiedMessaging] Send message API response:', newMessage);

    if (newMessage) {
      console.log('✅ [UnifiedMessaging] Message sent, transforming and adding to UI');
      const unifiedMessage = transformToUnifiedMessage(newMessage);
      console.log('🔄 [UnifiedMessaging] Transformed message:', unifiedMessage);
      
      setMessages(prev => {
        const updated = [...prev, unifiedMessage];
        console.log('📝 [UnifiedMessaging] Updated messages array length:', updated.length);
        return updated;
      });
      
      // Update conversation's last message AND reorder conversations list
      setConversations(prev => {
        const updatedConversations = prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: unifiedMessage, updatedAt: unifiedMessage.timestamp }
            : conv
        );
        
        // Sort conversations by updatedAt (most recent first)
        return updatedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      
      console.log('✅ [UnifiedMessaging] Message sent successfully and conversations reordered');
    }
  }, [user?.id]);

  const createConversation = useCallback(async (
    targetUserId: string, 
    targetUserType: 'vendor' | 'individual',
    initialMessage?: string,
    targetUserName?: string
  ): Promise<string | null> => {
    if (!user?.id) {
      console.warn('⚠️ [UnifiedMessaging] Cannot create conversation: no user ID');
      return null;
    }

    console.log('🆕 [UnifiedMessaging] Creating conversation with:', { targetUserId, targetUserType });
    
    // Generate a unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newConversation = await handleApiCall(() =>
      MessagingApiService.createConversation({
        conversationId,
        vendorId: targetUserType === 'vendor' ? targetUserId : user.id,
        vendorName: targetUserType === 'vendor' ? (targetUserName || 'Vendor Name') : (user.businessName || user.email || 'Unknown'),
        serviceName: 'General Inquiry',
        userId: targetUserType === 'vendor' ? user.id : targetUserId,
        userName: targetUserType === 'vendor' ? (user.businessName || user.email || 'Unknown') : (targetUserName || 'Client Name'),
        userType: (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple') as 'couple' | 'vendor' | 'admin'
      })
    );

    if (newConversation) {
      const unifiedConversation = transformToUnifiedConversation(newConversation);
      
      setConversations(prev => {
        const updatedConversations = [unifiedConversation, ...prev];
        // Sort conversations by updatedAt (most recent first)
        return updatedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      // CRITICAL FIX: Return the ACTUAL conversation ID from backend, not the generated one
      const actualConversationId = newConversation.id || conversationId;
      console.log('✅ [UnifiedMessaging] Conversation created and added to top:', actualConversationId);
      return actualConversationId;
    }

    return null;
  }, [user?.id, user?.role, user?.businessName, user?.email]);

  const createBusinessConversation = useCallback(async (
    vendorId: string,
    bookingId?: string,
    serviceType?: string,
    vendorName?: string
  ): Promise<string | null> => {
    const conversationId = await createConversation(vendorId, 'vendor', undefined, vendorName);
    
    if (conversationId && (bookingId || serviceType)) {
      // Update conversation with business context
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, businessContext: { bookingId, serviceType, vendorBusinessName: vendorName || conv.participantNames[vendorId] } }
            : conv
        )
      );
    }
    
    return conversationId;
  }, [createConversation]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    console.log('🎯 [UnifiedMessaging] setActiveConversation called with:', conversationId);
    
    if (!conversationId) {
      setActiveConversationState(null);
      return;
    }

    // Use functional state update to avoid dependency on conversations array
    setConversations(currentConversations => {
      console.log('🔍 [UnifiedMessaging] Available conversations:', currentConversations.map(c => c.id));
      
      const conversation = currentConversations.find(c => c.id === conversationId);
      
      if (conversation) {
        console.log('✅ [UnifiedMessaging] Found conversation, setting as active:', conversation.id);
        setActiveConversationState(conversation);
        loadMessages(conversation.id);
      } else {
        console.warn('⚠️ [UnifiedMessaging] Conversation not found in array, creating minimal conversation object');
        // Create a minimal conversation object for immediate use
        const minimalConversation: UnifiedConversation = {
          id: conversationId,
          participants: [],
          participantNames: {},
          participantTypes: {},
          lastMessage: undefined,
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessContext: undefined
        };
        setActiveConversationState(minimalConversation);
        
        // Try to load messages anyway - this might help populate the conversation
        loadMessages(conversationId);
      }
      
      // Return the conversations unchanged
      return currentConversations;
    });
  }, [loadMessages]);

  const markAsRead = useCallback(async (conversationId: string): Promise<void> => {
    if (!user?.id) return;

    console.log('👁️ [UnifiedMessaging] Marking conversation as read:', conversationId);
    
    await handleApiCall(() =>
      MessagingApiService.markAsRead(conversationId, user.id)
    );

    // Update local state and calculate unread count reduction
    let unreadReduction = 0;
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === conversationId) {
          unreadReduction = conv.unreadCount;
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
      return updated;
    });

    // Recalculate total unread count
    setUnreadCount(prev => prev - unreadReduction);
  }, [user?.id]);

  // Auto-load conversations when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 [UnifiedMessaging] User changed, loading conversations for:', user.id);
      loadConversations();
    } else {
      // Clear data when user logs out
      setConversations([]);
      setMessages([]);
      setActiveConversationState(null);
      setUnreadCount(0);
    }
  }, [user?.id]); // Remove loadConversations dependency to prevent loop

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      console.log('🔄 [UnifiedMessaging] Auto-refreshing conversations...');
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]); // Remove loadConversations dependency

  const contextValue: UnifiedMessagingContextType = {
    // Data
    conversations,
    activeConversation,
    messages,
    unreadCount,
    
    // Loading states
    loading,
    sending,
    error,
    
    // Core actions
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    setActiveConversation,
    markAsRead,
    
    // UI states
    isFloatingChatOpen,
    isModalOpen,
    setFloatingChatOpen,
    setModalOpen,
    
    // Business context helpers
    createBusinessConversation
  };

  return (
    <UnifiedMessagingContext.Provider value={contextValue}>
      {children}
      {/* Unified Messaging Modal - Connected to Centralized System */}
      {isModalOpen && (
        <ConnectedChatModal
          conversations={conversations}
          activeConversation={activeConversation}
          messages={messages}
          loading={loading}
          sending={sending}
          loadMessages={loadMessages}
          sendMessage={sendMessage}
          setModalOpen={setModalOpen}
          user={user}
        />
      )}
    </UnifiedMessagingContext.Provider>
  );
};

// Single hook for ALL messaging components to use
export const useUnifiedMessaging = (): UnifiedMessagingContextType => {
  const context = useContext(UnifiedMessagingContext);
  if (!context) {
    throw new Error('useUnifiedMessaging must be used within a UnifiedMessagingProvider');
  }
  return context;
};

export default UnifiedMessagingProvider;
