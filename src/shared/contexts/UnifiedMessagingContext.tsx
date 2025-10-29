import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './HybridAuthContext';
import { MessagingApiService } from '../../services/api/messagingApiService';

// Unified types for all messaging components
export interface MessageAttachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface UnifiedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'vendor' | 'couple' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  attachments?: MessageAttachment[];
}

export interface UnifiedConversation {
  id: string;
  participants: string[];
  participantNames: { [userId: string]: string };
  participantTypes: { [userId: string]: 'vendor' | 'couple' | 'admin' };
  lastMessage?: UnifiedMessage;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
  businessContext?: {
    bookingId?: string;
    serviceType?: string;
    vendorBusinessName?: string;
  };
  // Service information for conversation uniqueness
  serviceName?: string;
  service_name?: string;
  serviceCategory?: string;
  service_category?: string;
  // Display title combining service + vendor name
  conversationTitle?: string;
  conversation_title?: string;
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
  sendMessage: (conversationId: string, content: string, messageType?: 'text' | 'image' | 'file', attachments?: Array<{url: string, fileName: string, fileType: string, fileSize: number}>) => Promise<void>;
  createConversation: (targetUserId: string, targetUserType: 'vendor' | 'couple', targetUserName?: string, serviceName?: string) => Promise<string | null>;
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
      if (loadingStateSetter) {
        loadingStateSetter(true);
      }
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('💥 [UnifiedMessaging] =================== API CALL FAILED ===================');
      console.error('❌ [UnifiedMessaging] API call failed with error:', err);
      console.error('❌ [UnifiedMessaging] Error message:', errorMessage);
      console.error('❌ [UnifiedMessaging] Error type:', typeof err);
      console.error('❌ [UnifiedMessaging] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      
      // Check if this is a network/server error (500, timeout, etc.)
      const isServerError = errorMessage.includes('500') || 
                           errorMessage.includes('timeout') || 
                           errorMessage.includes('network') ||
                           errorMessage.includes('connect');
      if (isServerError && fallbackData !== undefined) {
        setError('Backend temporarily unavailable - using offline mode');
        return fallbackData;
      }
      setError(errorMessage);
      return null;
    } finally {
      if (loadingStateSetter) {
        loadingStateSetter(false);
      }
    }
  };

  // Transform API data to unified format - PRESERVE ALL BACKEND FIELDS
  const transformToUnifiedConversation = (apiConversation: any): UnifiedConversation => {
    // Construct participants array from creator_id and participant_id
    const participants = apiConversation.participants || [
      apiConversation.creator_id,
      apiConversation.participant_id
    ].filter(Boolean);
    
    // Build participant names and types
    const participantNames = apiConversation.participantNames || {};
    const participantTypes = apiConversation.participantTypes || {};
    
    // Add creator info if available
    if (apiConversation.creator_id && !participantNames[apiConversation.creator_id]) {
      participantNames[apiConversation.creator_id] = apiConversation.creator_name || 'Creator';
      participantTypes[apiConversation.creator_id] = apiConversation.creator_type || 'couple';
    }
    
    // Add participant info if available
    if (apiConversation.participant_id && !participantNames[apiConversation.participant_id]) {
      participantNames[apiConversation.participant_id] = apiConversation.participant_name || 'Participant';
      participantTypes[apiConversation.participant_id] = apiConversation.participant_type || 'vendor';
    }

    // Generate conversation title: Service + Vendor Name
    const serviceName = apiConversation.service_name || apiConversation.serviceName || 'General Inquiry';
    const vendorName = apiConversation.participant_name || 
                      apiConversation.vendor_business_name || 
                      apiConversation.business_name ||
                      'Vendor';
    const conversationTitle = `${serviceName} - ${vendorName}`;
    return {
      // Core unified fields
      id: apiConversation.id,
      participants,
      participantNames,
      participantTypes,
      lastMessage: apiConversation.lastMessage ? transformToUnifiedMessage(apiConversation.lastMessage) : undefined,
      unreadCount: apiConversation.unread_count || apiConversation.unreadCount || 0,
      updatedAt: apiConversation.updatedAt || apiConversation.updated_at,
      createdAt: apiConversation.createdAt || apiConversation.created_at,
      businessContext: apiConversation.businessContext,
      
      // Generated conversation title
      conversationTitle,
      conversation_title: conversationTitle,
      
      // PRESERVE ALL BACKEND FIELDS for rich UI display
      ...apiConversation  // Spread all original fields including participant_name, service_name, etc.
    } as UnifiedConversation;
  };

  const transformToUnifiedMessage = (apiMessage: any): UnifiedMessage => {
    // Transform attachments from string array to proper objects
    let attachments: MessageAttachment[] | undefined;
    if (apiMessage.attachments && Array.isArray(apiMessage.attachments)) {
      attachments = apiMessage.attachments.map((att: any) => {
        if (typeof att === 'string') {
          // Legacy format - just URLs
          return {
            url: att,
            fileName: att.split('/').pop() || 'Unknown file',
            fileType: 'application/octet-stream',
            fileSize: 0
          };
        } else {
          // New format - full object
          return {
            url: att.url || att,
            fileName: att.fileName || att.filename || 'Unknown file',
            fileType: att.fileType || att.type || 'application/octet-stream',
            fileSize: att.fileSize || att.size || 0
          };
        }
      });
    }
    
    const transformed = {
      id: apiMessage.id,
      conversationId: apiMessage.conversationId || apiMessage.conversation_id,
      senderId: apiMessage.senderId || apiMessage.sender_id,
      senderName: apiMessage.senderName || apiMessage.sender_name || 'Unknown',
      senderType: apiMessage.senderType || apiMessage.sender_type || 'couple',
      content: apiMessage.content,
      timestamp: apiMessage.timestamp || apiMessage.created_at,
      isRead: apiMessage.isRead || false,
      messageType: apiMessage.messageType || apiMessage.message_type || 'text',
      attachments
    };
    return transformed;
  };

  // CORE ACTIONS - Single source of truth using MessagingApiService
  const loadConversations = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }
    // VENDOR FIX: Use vendor-specific conversation loading for vendors
    // Robust vendor detection: check role, business properties, and ID pattern
    const isVendor = user.role === 'vendor' || 
                    user.businessName || 
                    user.vendorId || 
                    user.id.startsWith('2-2025-');
    const apiConversations = await handleApiCall(
      () => isVendor 
        ? MessagingApiService.getVendorConversations(user.id)
        : MessagingApiService.getConversations(user.id),
      setLoading,
      [] // Empty array fallback for offline mode
    );

    if (apiConversations !== null) {
      const unifiedConversations = (apiConversations || []).map(transformToUnifiedConversation);
      // Sort conversations by updatedAt (most recent first)
      const sortedConversations = unifiedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setConversations(sortedConversations);
      
      // Calculate total unread count
      const totalUnread = sortedConversations.reduce((sum: number, conv: UnifiedConversation) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
    }
  }, [user?.id, user?.role]);

  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    const apiMessages = await handleApiCall(
      () => MessagingApiService.getMessages(conversationId),
      setLoading
    );

    if (apiMessages) {
      const unifiedMessages = apiMessages.map(transformToUnifiedMessage);
      // Sort messages by timestamp (oldest first for chat display)
      const sortedMessages = unifiedMessages.sort((a: UnifiedMessage, b: UnifiedMessage) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      setMessages(sortedMessages);
    }
  }, []);

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'file' = 'text',
    attachments?: Array<{url: string, fileName: string, fileType: string, fileSize: number}>
  ): Promise<void> => {
    if (!user?.id || (!content.trim() && (!attachments || attachments.length === 0))) {
      console.error('❌ [UnifiedMessaging] FATAL: Cannot send message');
      console.error('   User ID:', user?.id);
      console.error('   Content length:', content?.length);
      console.error('   Content trimmed length:', content?.trim()?.length);
      console.error('   Attachments:', attachments?.length || 0);
      return;
    }
    // Try to send via API first
    const newMessage = await handleApiCall(
      () => MessagingApiService.sendMessage(
        conversationId, 
        content, 
        user.id, 
        user.businessName || user.email || 'Unknown User',
        (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple') as 'couple' | 'vendor' | 'admin',
        messageType,
        attachments
      ),
      setSending,
      null // No fallback data, we'll handle it below
    );
    // If API call failed, create a local message for immediate UI feedback
    let messageToAdd = newMessage;
    
    if (!newMessage) {
      // Create a local message object
      const messageId = `msg_local_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      messageToAdd = {
        id: messageId,
        conversationId: conversationId,
        senderId: user.id,
        senderName: user.businessName || user.email || 'You',
        senderRole: (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple'),
        content: content,
        timestamp: new Date().toISOString(),
        type: messageType,
        isRead: false,
        is_local: true // Mark as local message
      };
    }

    if (messageToAdd) {
      const unifiedMessage = transformToUnifiedMessage(messageToAdd);
      setMessages(prev => {
        const updated = [...prev, unifiedMessage];
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
    } else {
    }
  }, [user?.id]);

  const createConversation = useCallback(async (
    targetUserId: string, 
    targetUserType: 'vendor' | 'couple',
    targetUserName?: string,
    serviceName?: string
  ): Promise<string | null> => {
    if (!user?.id) {
      console.error('❌ [UnifiedMessaging] FATAL: Cannot create conversation - no user ID');
      return null;
    }
    // First, check if a conversation already exists with this service-vendor-user combination
    const normalizedServiceName = serviceName || 'General Inquiry';
    const existingConversation = conversations.find(conv => {
      const participants = conv.participants || [];
      const participantsMatch = participants.includes(user.id) && participants.includes(targetUserId);
      const convServiceName = conv.serviceName || conv.service_name || 'General Inquiry';
      const serviceMatch = convServiceName === normalizedServiceName;
      return participantsMatch && serviceMatch;
    });
    
    if (existingConversation) {
      // Set this as the active conversation and load its messages
      setActiveConversationState(existingConversation);
      loadMessages(existingConversation.id);
      return existingConversation.id;
    }
    // Generate a unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Prepare API call data
    const apiCallData = {
      conversationId,
      vendorId: targetUserType === 'vendor' ? targetUserId : user.id,
      vendorName: targetUserType === 'vendor' ? (targetUserName || 'Vendor Name') : (user.businessName || user.email || 'Unknown'),
      serviceName: normalizedServiceName,
      userId: targetUserType === 'vendor' ? user.id : targetUserId,
      userName: targetUserType === 'vendor' ? (user.businessName || user.email || 'Unknown') : (targetUserName || 'Client Name'),
      userType: (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple') as 'couple' | 'vendor' | 'admin'
    };
    // Try to create conversation via API, fall back to local creation
    const newConversation = await handleApiCall(
      () => {
        return MessagingApiService.createConversation(apiCallData);
      },
      undefined, // No loading state for conversation creation
      null // No fallback data, we'll handle it below
    );
    // If API call failed, create a local conversation for immediate UI functionality
    let conversationToAdd = newConversation;
    
    if (!newConversation) {
      // Create a local conversation object that matches the expected format
      conversationToAdd = {
        id: conversationId,
        participant_id: targetUserType === 'vendor' ? targetUserId : user.id,
        participant_name: targetUserType === 'vendor' ? (targetUserName || 'Vendor Name') : (user.businessName || user.email || 'Unknown'),
        participant_type: targetUserType,
        participant_avatar: null,
        creator_id: targetUserType === 'vendor' ? user.id : targetUserId,
        creator_name: targetUserType === 'vendor' ? (user.businessName || user.email || 'Unknown') : (targetUserName || 'Client Name'),
        creator_type: (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple'),
        conversation_type: 'couple',
        last_message: null,
        last_message_time: new Date().toISOString(),
        unread_count: 0,
        is_online: false,
        status: 'active',
        service_name: normalizedServiceName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add participants array for proper filtering
        participants: [user.id, targetUserId],
        participantNames: {
          [user.id]: user.businessName || user.email || 'You',
          [targetUserId]: targetUserName || 'User'
        },
        participantTypes: {
          [user.id]: (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple'),
          [targetUserId]: targetUserType
        },
        // Generate conversation title for local conversations
        conversation_title: `${normalizedServiceName} - ${targetUserType === 'vendor' ? (targetUserName || 'Vendor Name') : (user.businessName || user.email || 'Unknown')}`,
        is_local: true // Mark as local conversation
      };
    } else {
    }

    if (conversationToAdd) {
      const unifiedConversation = transformToUnifiedConversation(conversationToAdd);
      setConversations(prev => {
        // Check if conversation already exists to avoid duplicates
        const existingIndex = prev.findIndex(conv => conv.id === conversationId);
        let updatedConversations;
        if (existingIndex >= 0) {
          // Update existing conversation
          updatedConversations = prev.map((conv, index) => 
            index === existingIndex ? unifiedConversation : conv
          );
        } else {
          // Add new conversation at the top
          updatedConversations = [unifiedConversation, ...prev];
        }
        // Sort conversations by updatedAt (most recent first)
        const sortedConversations = updatedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return sortedConversations;
      });
      
      // Return the conversation ID for immediate use
      const actualConversationId = conversationToAdd.id || conversationId;
      return actualConversationId;
    }

    console.error('❌ [UnifiedMessaging] =================== CREATE CONVERSATION FAILED ===================');
    console.error('❌ [UnifiedMessaging] Failed to create conversation - no conversation object created');
    return null;
  }, [user?.id, user?.role, user?.businessName, user?.email, conversations, loadMessages]);

  const createBusinessConversation = useCallback(async (
    vendorId: string,
    bookingId?: string,
    serviceType?: string,
    vendorName?: string
  ): Promise<string | null> => {
    const conversationId = await createConversation(vendorId, 'vendor', vendorName, serviceType);
    if (conversationId && (bookingId || serviceType)) {
      // Update conversation with business context
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId) {
            return { ...conv, businessContext: { bookingId, serviceType, vendorBusinessName: vendorName || conv.participantNames[vendorId] } };
          }
          return conv;
        })
      );
    } else if (conversationId) {
    }
    return conversationId;
  }, [createConversation]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    if (!conversationId) {
      setActiveConversationState(null);
      return;
    }

    // Use functional state update to avoid dependency on conversations array
    setConversations(currentConversations => {
      const conversation = currentConversations.find(c => c.id === conversationId);
      
      if (conversation) {
        setActiveConversationState(conversation);
        loadMessages(conversation.id);
      } else {
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
      {/* OLD MODAL DISABLED - Now using new MessagingModal from MessagingModalConnector */}
      {/* {isModalOpen && (
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
      )} */}
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
