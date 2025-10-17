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
    console.log('🔄 [UnifiedMessaging] =================== API CALL START ===================');
    try {
      if (loadingStateSetter) {
        console.log('⏳ [UnifiedMessaging] Setting loading state to true');
        loadingStateSetter(true);
      }
      setError(null);
      console.log('🔍 [UnifiedMessaging] Clearing previous errors');
      
      console.log('📡 [UnifiedMessaging] Executing API call...');
      const result = await apiCall();
      console.log('✅ [UnifiedMessaging] API call successful:', result);
      console.log('🎉 [UnifiedMessaging] =================== API CALL SUCCESS ===================');
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
      
      console.log('🔍 [UnifiedMessaging] Error classification:', {
        isServerError,
        hasFallbackData: fallbackData !== undefined,
        errorMessage
      });
      
      if (isServerError && fallbackData !== undefined) {
        console.log('🔄 [UnifiedMessaging] Using fallback data for offline mode');
        setError('Backend temporarily unavailable - using offline mode');
        return fallbackData;
      }
      
      console.log('📝 [UnifiedMessaging] Setting error state:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      if (loadingStateSetter) {
        console.log('⏳ [UnifiedMessaging] Setting loading state to false');
        loadingStateSetter(false);
      }
      console.log('🏁 [UnifiedMessaging] =================== API CALL END ===================');
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
    
    console.log('🔄 [UnifiedMessaging] Transformed conversation participants:', {
      id: apiConversation.id,
      participants,
      participantNames,
      participantTypes,
      conversationTitle
    });
    
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
    console.log('🔄 [UnifiedMessaging] Transforming API message:', apiMessage);
    
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
    messageType: 'text' | 'image' | 'file' = 'text',
    attachments?: Array<{url: string, fileName: string, fileType: string, fileSize: number}>
  ): Promise<void> => {
    console.log('💬 [UnifiedMessaging] =================== SEND MESSAGE START ===================');
    console.log('🎯 [UnifiedMessaging] sendMessage called with:', { conversationId, content: content.substring(0, 50) + '...', messageType });
    console.log('🔍 [UnifiedMessaging] User context:', { userId: user?.id, userEmail: user?.email, userRole: user?.role });
    
    if (!user?.id || (!content.trim() && (!attachments || attachments.length === 0))) {
      console.error('❌ [UnifiedMessaging] FATAL: Cannot send message');
      console.error('   User ID:', user?.id);
      console.error('   Content length:', content?.length);
      console.error('   Content trimmed length:', content?.trim()?.length);
      console.error('   Attachments:', attachments?.length || 0);
      return;
    }

    console.log('✅ [UnifiedMessaging] Validation passed, proceeding with message send');
    console.log('📤 [UnifiedMessaging] Message details:', { 
      conversationId, 
      contentPreview: content.substring(0, 50) + '...',
      fullContentLength: content.length,
      messageType,
      senderInfo: {
        id: user.id,
        name: user.businessName || user.email || 'Unknown User',
        type: (user.role === 'vendor' || user.businessName || user.vendorId || user.id.startsWith('2-2025-') ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple')
      }
    });
    
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

    console.log('📨 [UnifiedMessaging] Send message API response:', newMessage);

    // If API call failed, create a local message for immediate UI feedback
    let messageToAdd = newMessage;
    
    if (!newMessage) {
      console.log('🔄 [UnifiedMessaging] API message send failed, creating local message for UI');
      
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
      console.log('✅ [UnifiedMessaging] Message created, transforming and adding to UI');
      const unifiedMessage = transformToUnifiedMessage(messageToAdd);
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
      
      console.log('✅ [UnifiedMessaging] Message added successfully and conversations reordered', newMessage ? '(API)' : '(LOCAL)');
    } else {
      console.warn('⚠️ [UnifiedMessaging] Failed to send or create message');
    }
  }, [user?.id]);

  const createConversation = useCallback(async (
    targetUserId: string, 
    targetUserType: 'vendor' | 'couple',
    targetUserName?: string,
    serviceName?: string
  ): Promise<string | null> => {
    console.log('🚀 [UnifiedMessaging] =================== CREATE CONVERSATION START ===================');
    console.log('🔍 [UnifiedMessaging] Input parameters:', {
      targetUserId,
      targetUserType,
      targetUserName,
      currentUserId: user?.id,
      currentUserEmail: user?.email,
      currentUserRole: user?.role,
      currentUserBusinessName: user?.businessName
    });

    if (!user?.id) {
      console.error('❌ [UnifiedMessaging] FATAL: Cannot create conversation - no user ID');
      console.log('🔍 [UnifiedMessaging] User object:', user);
      return null;
    }

    console.log('✅ [UnifiedMessaging] User validation passed, proceeding with conversation creation');
    
    // First, check if a conversation already exists with this service-vendor-user combination
    console.log('🔍 [UnifiedMessaging] Checking for existing service-based conversation...');
    const normalizedServiceName = serviceName || 'General Inquiry';
    console.log('🎯 [UnifiedMessaging] Looking for service:', normalizedServiceName);
    
    const existingConversation = conversations.find(conv => {
      const participants = conv.participants || [];
      const participantsMatch = participants.includes(user.id) && participants.includes(targetUserId);
      const convServiceName = conv.serviceName || conv.service_name || 'General Inquiry';
      const serviceMatch = convServiceName === normalizedServiceName;
      
      console.log(`   Checking conversation ${conv.id}:`);
      console.log(`     participants=[${participants.join(', ')}], participantsMatch=${participantsMatch}`);
      console.log(`     service='${convServiceName}' vs '${normalizedServiceName}', serviceMatch=${serviceMatch}`);
      console.log(`     overall match=${participantsMatch && serviceMatch}`);
      
      return participantsMatch && serviceMatch;
    });
    
    if (existingConversation) {
      console.log('✅ [UnifiedMessaging] Found existing conversation:', existingConversation.id);
      console.log('🔄 [UnifiedMessaging] Loading messages for existing conversation...');
      
      // Set this as the active conversation and load its messages
      setActiveConversationState(existingConversation);
      loadMessages(existingConversation.id);
      
      console.log('🎉 [UnifiedMessaging] =================== USING EXISTING CONVERSATION ===================');
      return existingConversation.id;
    }
    
    console.log('🆕 [UnifiedMessaging] No existing conversation found, creating new one...');
    
    // Generate a unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🎯 [UnifiedMessaging] Generated conversation ID:', conversationId);
    
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
    
    console.log('📤 [UnifiedMessaging] Prepared API call data:', apiCallData);
    console.log('🔄 [UnifiedMessaging] Attempting API conversation creation...');
    
    // Try to create conversation via API, fall back to local creation
    const newConversation = await handleApiCall(
      () => {
        console.log('📡 [UnifiedMessaging] Calling MessagingApiService.createConversation...');
        return MessagingApiService.createConversation(apiCallData);
      },
      undefined, // No loading state for conversation creation
      null // No fallback data, we'll handle it below
    );

    console.log('📨 [UnifiedMessaging] API conversation creation result:', newConversation);

    // If API call failed, create a local conversation for immediate UI functionality
    let conversationToAdd = newConversation;
    
    if (!newConversation) {
      console.log('⚠️ [UnifiedMessaging] API conversation creation failed, creating local conversation for UI');
      console.log('🔧 [UnifiedMessaging] Building local conversation object...');
      
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
      
      console.log('✅ [UnifiedMessaging] Local conversation object created:', conversationToAdd);
    } else {
      console.log('✅ [UnifiedMessaging] API conversation creation successful, using API response');
    }

    if (conversationToAdd) {
      console.log('🔄 [UnifiedMessaging] Transforming conversation to unified format...');
      const unifiedConversation = transformToUnifiedConversation(conversationToAdd);
      console.log('✅ [UnifiedMessaging] Unified conversation created:', unifiedConversation);
      
      console.log('📋 [UnifiedMessaging] Current conversations before adding:', conversations.length);
      
      setConversations(prev => {
        console.log('🔍 [UnifiedMessaging] Checking for existing conversation with ID:', conversationId);
        
        // Check if conversation already exists to avoid duplicates
        const existingIndex = prev.findIndex(conv => conv.id === conversationId);
        console.log('🔍 [UnifiedMessaging] Existing conversation index:', existingIndex);
        
        let updatedConversations;
        if (existingIndex >= 0) {
          console.log('♻️ [UnifiedMessaging] Updating existing conversation at index:', existingIndex);
          // Update existing conversation
          updatedConversations = prev.map((conv, index) => 
            index === existingIndex ? unifiedConversation : conv
          );
        } else {
          console.log('➕ [UnifiedMessaging] Adding new conversation to top of list');
          // Add new conversation at the top
          updatedConversations = [unifiedConversation, ...prev];
        }
        
        console.log('📋 [UnifiedMessaging] Updated conversations count:', updatedConversations.length);
        
        // Sort conversations by updatedAt (most recent first)
        const sortedConversations = updatedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        console.log('📋 [UnifiedMessaging] Final sorted conversations count:', sortedConversations.length);
        return sortedConversations;
      });
      
      // Return the conversation ID for immediate use
      const actualConversationId = conversationToAdd.id || conversationId;
      console.log('🎉 [UnifiedMessaging] =================== CREATE CONVERSATION SUCCESS ===================');
      console.log('✅ [UnifiedMessaging] Conversation created/added to UI:', actualConversationId, newConversation ? '(API)' : '(LOCAL)');
      console.log('🎯 [UnifiedMessaging] Returning conversation ID for use:', actualConversationId);
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
    console.log('🏢 [UnifiedMessaging] =================== CREATE BUSINESS CONVERSATION START ===================');
    console.log('🔍 [UnifiedMessaging] Business conversation parameters:', {
      vendorId,
      bookingId,
      serviceType,
      vendorName,
      currentUserId: user?.id,
      currentUserRole: user?.role
    });
    
    console.log('🔄 [UnifiedMessaging] Calling createConversation with vendor details...');
    const conversationId = await createConversation(vendorId, 'vendor', vendorName, serviceType);
    console.log('📨 [UnifiedMessaging] createConversation result:', conversationId);
    
    if (conversationId && (bookingId || serviceType)) {
      console.log('🏷️ [UnifiedMessaging] Adding business context to conversation:', { bookingId, serviceType, vendorName });
      
      // Update conversation with business context
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id === conversationId) {
            console.log('✅ [UnifiedMessaging] Updated conversation with business context:', conv.id);
            return { ...conv, businessContext: { bookingId, serviceType, vendorBusinessName: vendorName || conv.participantNames[vendorId] } };
          }
          return conv;
        })
      );
    } else if (conversationId) {
      console.log('ℹ️ [UnifiedMessaging] Business conversation created without additional context');
    }
    
    console.log('🎉 [UnifiedMessaging] =================== CREATE BUSINESS CONVERSATION END ===================');
    console.log('📋 [UnifiedMessaging] Final business conversation ID:', conversationId);
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
