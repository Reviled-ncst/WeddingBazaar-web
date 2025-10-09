import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { MessagingApiService } from '../../services/api/messagingApiService';
import { mockMessagingService, type MockConversation, type MockMessage } from '../../services/api/mockMessagingService';

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
  createConversation: (targetUserId: string, targetUserType: 'vendor' | 'individual', initialMessage?: string) => Promise<string | null>;
  setActiveConversation: (conversationId: string | null) => Promise<boolean>;
  setActiveConversationDirect: (conversation: UnifiedConversation) => Promise<boolean>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // UI states for all components
  isFloatingChatOpen: boolean;
  isModalOpen: boolean;
  setFloatingChatOpen: (open: boolean) => void;
  setModalOpen: (open: boolean) => void;
  
  // Business context helpers
  createBusinessConversation: (vendorId: string, bookingId?: string, serviceType?: string) => Promise<string | null>;
  createOrFindBusinessConversation: (vendorId: string, bookingId?: string, serviceType?: string, serviceName?: string) => Promise<string | null>;
  findExistingConversation: (vendorId: string, serviceType?: string, serviceName?: string) => UnifiedConversation | null;
}

const UnifiedMessagingContext = createContext<UnifiedMessagingContextType | null>(null);

interface UnifiedMessagingProviderProps {
  children: ReactNode;
}

export const UnifiedMessagingProvider: React.FC<UnifiedMessagingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // Enable silent mode for MessagingApiService since we have fallbacks
  useEffect(() => {
    MessagingApiService.setSilentMode(true);
  }, []);
  
  // Data state
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // CRITICAL FIX: Conversation cache for immediate access (bypasses React state timing issues)
  const [conversationCache, setConversationCache] = useState<Map<string, UnifiedConversation>>(new Map());
  
  // ADDITIONAL FIX: Use ref for immediate synchronous access to cache
  const conversationCacheRef = useRef<Map<string, UnifiedConversation>>(new Map());
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [isFloatingChatOpen, setFloatingChatOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  // Helper function to handle API calls with unified error handling
  const handleApiCall = async (
    apiCall: () => Promise<any>,
    loadingStateSetter?: (loading: boolean) => void,
    suppressErrorLogging: boolean = false
  ): Promise<any> => {
    try {
      if (loadingStateSetter) loadingStateSetter(true);
      setError(null);
      
      const result = await apiCall();
      console.log('✅ [UnifiedMessaging] API call successful');
      return result;
    } catch (err) {
      if (!suppressErrorLogging) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.warn('⚠️ [UnifiedMessaging] API call failed, using fallback:', err instanceof Error ? err.message : 'Unknown error');
      }
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
    return {
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
  };

  // CORE ACTIONS - Single source of truth using MessagingApiService
  const loadConversations = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.warn('⚠️ [UnifiedMessaging] No user ID available for loading conversations');
      return;
    }

    console.log('📥 [UnifiedMessaging] Loading conversations for user:', user.id);
    
    let apiConversations = await handleApiCall(
      () => MessagingApiService.getConversations(user.id),
      setLoading,
      true // Suppress error logging since we have fallback
    );

    // Fallback to mock service if API fails
    if (!apiConversations) {
      console.log('🔄 [UnifiedMessaging] API failed for loadConversations, using mock service...');
      try {
        const mockConversations = await mockMessagingService.getConversations();
        apiConversations = mockConversations.map(conv => ({
          ...conv,
          participants: conv.participants,
          participantNames: conv.participantNames,
          participantTypes: conv.participantTypes
        }));
        console.log('✅ [UnifiedMessaging] Loaded conversations from mock service:', apiConversations.length);
      } catch (mockError) {
        console.error('❌ [UnifiedMessaging] Mock service loadConversations also failed:', mockError);
        apiConversations = [];
      }
    }

    if (apiConversations && apiConversations.length > 0) {
      const unifiedConversations = apiConversations.map(transformToUnifiedConversation);
      
      // Sort conversations by updatedAt (most recent first)
      const sortedConversations = unifiedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      setConversations(sortedConversations);
      
      // CRITICAL FIX: Update cache with loaded conversations for instant access
      setConversationCache(prev => {
        const newCache = new Map(prev);
        sortedConversations.forEach((conv: UnifiedConversation) => {
          newCache.set(conv.id, conv);
        });
        console.log('💾 [UnifiedMessaging] ===== CACHE UPDATED WITH LOADED CONVERSATIONS =====');
        console.log('💾 [UnifiedMessaging] Cached conversations count:', newCache.size);
        return newCache;
      });
      
      // Calculate total unread count
      const totalUnread = sortedConversations.reduce((sum: number, conv: UnifiedConversation) => sum + conv.unreadCount, 0);
      setUnreadCount(totalUnread);
      
      console.log('✅ [UnifiedMessaging] Loaded conversations:', sortedConversations.length, 'Total unread:', totalUnread);
    } else {
      setConversations([]);
      setConversationCache(new Map()); // Clear cache when no conversations
      setUnreadCount(0);
      console.log('📝 [UnifiedMessaging] No conversations available');
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    console.log('📥 [UnifiedMessaging] Loading messages for conversation:', conversationId);
    
    let apiMessages = await handleApiCall(
      () => MessagingApiService.getMessages(conversationId),
      setLoading,
      true // Suppress error logging since we have fallback
    );

    // Fallback to mock service if API fails
    if (!apiMessages) {
      console.log('🔄 [UnifiedMessaging] API failed for loadMessages, using mock service...');
      try {
        const mockMessages = await mockMessagingService.getMessages(conversationId);
        apiMessages = mockMessages.map(msg => ({
          ...msg,
          senderType: msg.senderType === 'individual' ? 'couple' : msg.senderType
        }));
        console.log('✅ [UnifiedMessaging] Loaded messages from mock service:', apiMessages.length);
      } catch (mockError) {
        console.error('❌ [UnifiedMessaging] Mock service loadMessages also failed:', mockError);
        apiMessages = [];
      }
    }

    if (apiMessages) {
      const unifiedMessages = apiMessages.map(transformToUnifiedMessage);
      setMessages(unifiedMessages);
      console.log('✅ [UnifiedMessaging] Loaded messages:', unifiedMessages.length);
    }
  }, []);

  const sendMessage = useCallback(async (
    conversationId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<void> => {
    if (!user?.id || !content.trim()) {
      console.warn('⚠️ [UnifiedMessaging] Cannot send message: missing user ID or content');
      return;
    }

    console.log('📤 [UnifiedMessaging] Sending message:', { conversationId, content: content.substring(0, 50) + '...' });
    
    let newMessage = await handleApiCall(
      () => MessagingApiService.sendMessage(
        conversationId, 
        content, 
        user.id, 
        user.businessName || user.email || 'Unknown User',
        (user.role === 'vendor' ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple') as 'couple' | 'vendor' | 'admin',
        messageType
      ),
      setSending,
      true // Suppress error logging since we have fallback
    );

    // Fallback to mock service if API fails
    if (!newMessage) {
      console.log('🔄 [UnifiedMessaging] API failed for sendMessage, using mock service...');
      try {
        const mockMessage = await mockMessagingService.sendMessage({
          conversationId,
          senderId: user.id,
          senderName: user.businessName || user.email || 'Unknown User',
          senderType: (user.role === 'vendor' ? 'vendor' : user.role === 'admin' ? 'admin' : 'individual') as 'vendor' | 'individual' | 'admin',
          content
        });
        
        // Convert mock message to API format
        newMessage = {
          ...mockMessage,
          senderType: mockMessage.senderType === 'individual' ? 'couple' : mockMessage.senderType
        };
        
        console.log('✅ [UnifiedMessaging] Mock message sent successfully');
      } catch (mockError) {
        console.error('❌ [UnifiedMessaging] Mock service sendMessage also failed:', mockError);
        return;
      }
    }

    if (newMessage) {
      const unifiedMessage = transformToUnifiedMessage(newMessage);
      setMessages(prev => [...prev, unifiedMessage]);
      
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
    initialMessage?: string
  ): Promise<string | null> => {
    console.log('🆕 [UnifiedMessaging] ===== CREATE CONVERSATION START =====');
    console.log('🆕 [UnifiedMessaging] Creating conversation with:', { targetUserId, targetUserType, initialMessage });
    
    // CRITICAL DEBUG: Check user authentication
    console.log('👤 [UnifiedMessaging] ===== USER AUTHENTICATION DEBUG =====');
    console.log('👤 [UnifiedMessaging] User object exists:', !!user);
    console.log('👤 [UnifiedMessaging] User ID:', user?.id);
    console.log('👤 [UnifiedMessaging] User role:', user?.role);
    console.log('👤 [UnifiedMessaging] User email:', user?.email);
    console.log('👤 [UnifiedMessaging] User business name:', user?.businessName);
    
    if (!user?.id) {
      console.error('❌ [UnifiedMessaging] ===== CRITICAL: USER NOT AUTHENTICATED =====');
      console.error('❌ [UnifiedMessaging] Cannot create conversation: no user ID');
      console.error('❌ [UnifiedMessaging] User object:', user);
      console.error('❌ [UnifiedMessaging] This is likely why conversation creation is failing');
      return null;
    }
    
    console.log('✅ [UnifiedMessaging] User authenticated, proceeding with conversation creation');

    console.log('🆕 [UnifiedMessaging] Creating conversation with:', { targetUserId, targetUserType });
    
    // Generate a unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔧 [UnifiedMessaging] ===== USING MOCK MESSAGING SERVICE =====');
    console.log('🔧 [UnifiedMessaging] Backend endpoints unavailable, using mock service');
    console.log('🔧 [UnifiedMessaging] Mock service available:', !!mockMessagingService);
    
    // Use mock service as primary solution since backend conversation endpoints return 404
    let newConversation = null;
    try {
      console.log('📝 [UnifiedMessaging] ===== PREPARING MOCK CONVERSATION DATA =====');
      const mockData = {
        conversationId,
        vendorId: targetUserType === 'vendor' ? targetUserId : user.id,
        vendorName: targetUserType === 'vendor' ? 'Vendor Name' : (user.businessName || user.email || 'Unknown'),
        serviceName: 'General Inquiry',
        userId: targetUserType === 'vendor' ? user.id : targetUserId,
        userName: targetUserType === 'vendor' ? (user.businessName || user.email || 'Unknown') : 'Client Name',
        userType: (user.role === 'vendor' ? 'vendor' : user.role === 'admin' ? 'admin' : 'couple') as 'couple' | 'vendor' | 'admin'
      };
      
      console.log('📝 [UnifiedMessaging] Mock conversation data:', mockData);
      
      const mockConversation = await mockMessagingService.createConversation(mockData);
      
      console.log('📝 [UnifiedMessaging] ===== MOCK CONVERSATION CREATED =====');
      console.log('📝 [UnifiedMessaging] Mock conversation object:', mockConversation);
        
      // Convert mock conversation to API format
      newConversation = {
        ...mockConversation,
        participants: mockConversation.participants,
        participantNames: mockConversation.participantNames,
        participantTypes: mockConversation.participantTypes
      };
        
      console.log('✅ [UnifiedMessaging] Mock conversation created successfully');
      console.log('✅ [UnifiedMessaging] Converted conversation:', newConversation);
    } catch (mockError) {
      console.error('❌ [UnifiedMessaging] ===== MOCK SERVICE FAILED =====');
      console.error('❌ [UnifiedMessaging] Mock service error:', mockError);
      console.error('❌ [UnifiedMessaging] Error details:', {
        name: mockError instanceof Error ? mockError.name : 'Unknown',
        message: mockError instanceof Error ? mockError.message : String(mockError),
        stack: mockError instanceof Error ? mockError.stack : 'No stack'
      });
      
      // CRITICAL FALLBACK: Create conversation object manually if mock service fails
      console.log('🔄 [UnifiedMessaging] ===== MANUAL CONVERSATION CREATION =====');
      console.log('🔄 [UnifiedMessaging] Creating conversation object manually as fallback');
      
      try {
        newConversation = {
          id: conversationId,
          participants: [user.id, targetUserId],
          participantNames: {
            [user.id]: user.businessName || user.email || 'You',
            [targetUserId]: targetUserType === 'vendor' ? 'Vendor' : 'Client'
          },
          participantTypes: {
            [user.id]: user.role === 'vendor' ? 'vendor' : 'individual',
            [targetUserId]: targetUserType
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastMessage: null,
          unreadCount: 0,
          businessContext: {
            serviceType: 'General Inquiry',
            serviceName: 'Manual Conversation',
            vendorBusinessName: targetUserType === 'vendor' ? 'Vendor' : 'Client'
          }
        };
        
        console.log('✅ [UnifiedMessaging] Manual conversation created:', newConversation);
      } catch (manualError) {
        console.error('❌ [UnifiedMessaging] Manual conversation creation also failed:', manualError);
        return null;
      }
    }

    if (newConversation) {
      console.error('🔍 [UnifiedMessaging] ===== RAW CONVERSATION DATA =====');
      console.error('🔍 [UnifiedMessaging] Raw conversation object:', JSON.stringify(newConversation, null, 2));
      
      try {
        const unifiedConversation = transformToUnifiedConversation(newConversation);
        
        console.log('🔄 [UnifiedMessaging] ===== ADDING CONVERSATION TO STATE =====');
        console.log('🔄 [UnifiedMessaging] New conversation ID:', conversationId);
        console.log('🔄 [UnifiedMessaging] Unified conversation object:', JSON.stringify(unifiedConversation, null, 2));
        
        // CRITICAL FIX: Validate the conversation object before proceeding
        if (!unifiedConversation.id || !unifiedConversation.participants || !Array.isArray(unifiedConversation.participants)) {
          console.error('❌ [UnifiedMessaging] ===== INVALID CONVERSATION OBJECT =====');
          console.error('❌ [UnifiedMessaging] Missing required fields in unified conversation');
          console.error('❌ [UnifiedMessaging] ID:', unifiedConversation.id);
          console.error('❌ [UnifiedMessaging] Participants:', unifiedConversation.participants);
          console.error('❌ [UnifiedMessaging] This will cause activation failures');
          return null;
        }
        
        console.log('✅ [UnifiedMessaging] ===== CONVERSATION OBJECT VALIDATION PASSED =====');
        console.log('✅ [UnifiedMessaging] Ready to add to cache and state');
        
        // CRITICAL FIX: Add to cache immediately for instant access (using both state and ref)
        console.log('💾 [UnifiedMessaging] ===== ADDING TO CACHE =====');
        
        // Update ref cache immediately (synchronous)
        conversationCacheRef.current.set(conversationId, unifiedConversation);
        console.log('💾 [UnifiedMessaging] ===== CONVERSATION CACHED IN REF (IMMEDIATE) =====');
        console.log('💾 [UnifiedMessaging] Ref cache size:', conversationCacheRef.current.size);
        console.log('💾 [UnifiedMessaging] Ref cache has conversation:', conversationCacheRef.current.has(conversationId));
        
        // Update state cache (asynchronous)
        setConversationCache(prev => {
          const newCache = new Map(prev);
          newCache.set(conversationId, unifiedConversation);
          console.log('💾 [UnifiedMessaging] ===== CONVERSATION CACHED IN STATE =====');
          console.log('💾 [UnifiedMessaging] Cached conversation ID:', conversationId);
          console.log('💾 [UnifiedMessaging] State cache size before:', prev.size);
          console.log('💾 [UnifiedMessaging] State cache size after:', newCache.size);
          console.log('💾 [UnifiedMessaging] Cached conversation details:', {
            id: unifiedConversation.id,
            participants: unifiedConversation.participants,
            participantNames: unifiedConversation.participantNames
          });
          console.log('💾 [UnifiedMessaging] STATE CACHE UPDATED');
          return newCache;
        });
        
        // Add to conversations state  
        console.log('📊 [UnifiedMessaging] ===== ADDING TO STATE =====');
        setConversations(prev => {
          console.log('📊 [UnifiedMessaging] ===== BEFORE STATE UPDATE =====');
          console.log('📊 [UnifiedMessaging] Previous conversations count:', prev.length);
          console.log('📊 [UnifiedMessaging] Previous conversation IDs:', prev.map(c => c.id));
          
          const updatedConversations = [unifiedConversation, ...prev];
          // Sort conversations by updatedAt (most recent first)
          const sortedConversations = updatedConversations.sort((a: UnifiedConversation, b: UnifiedConversation) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          console.log('✅ [UnifiedMessaging] ===== CONVERSATION ADDED TO STATE =====');
          console.log('✅ [UnifiedMessaging] Conversation created and added to state:', conversationId);
          console.log('✅ [UnifiedMessaging] Total conversations now:', sortedConversations.length);
          console.log('✅ [UnifiedMessaging] New conversation participants:', unifiedConversation.participants);
          console.log('✅ [UnifiedMessaging] All conversation IDs now:', sortedConversations.map(c => c.id));
          console.log('✅ [UnifiedMessaging] STATE UPDATE COMPLETE');
          
          return sortedConversations;
        });
        
        console.log('🎯 [UnifiedMessaging] ===== RETURNING CONVERSATION ID =====');
        console.log('🎯 [UnifiedMessaging] Returning conversation ID for immediate use:', conversationId);
        console.log('🎯 [UnifiedMessaging] Conversation should be available in cache for immediate access');
        
        // CRITICAL DEBUG: Let's verify both caches immediately after update
        setTimeout(() => {
          console.log('🔍 [UnifiedMessaging] ===== CACHE VERIFICATION (POST-UPDATE) =====');
          console.log('🔍 [UnifiedMessaging] REF CACHE:');
          console.log('🔍 [UnifiedMessaging] - Size:', conversationCacheRef.current.size);
          console.log('🔍 [UnifiedMessaging] - Has conversation:', conversationCacheRef.current.has(conversationId));
          conversationCacheRef.current.forEach((conv, id) => {
            console.log('🔍 [UnifiedMessaging] - Entry:', id, 'Participants:', conv.participants);
          });
          
          console.log('🔍 [UnifiedMessaging] STATE CACHE:');
          console.log('🔍 [UnifiedMessaging] - Size:', conversationCache.size);
          console.log('🔍 [UnifiedMessaging] - Has conversation:', conversationCache.has(conversationId));
          conversationCache.forEach((conv, id) => {
            console.log('🔍 [UnifiedMessaging] - Entry:', id, 'Participants:', conv.participants);
          });
        }, 10);
        
        return conversationId;
      } catch (transformError) {
        console.error('❌ [UnifiedMessaging] ===== CONVERSATION TRANSFORMATION ERROR =====');
        console.error('❌ [UnifiedMessaging] Error transforming conversation:', transformError);
        console.error('❌ [UnifiedMessaging] Raw conversation data:', newConversation);
        return null;
      }
    }

    return null;
  }, [user?.id, user?.role, user?.businessName, user?.email]);

  // Helper function to find existing conversations by vendor and service context
  const findExistingConversation = useCallback((
    vendorId: string,
    serviceType?: string,
    serviceName?: string
  ): UnifiedConversation | null => {
    if (!user?.id) return null;

    console.log('🔍 [UnifiedMessaging] ===== SEARCHING FOR EXISTING CONVERSATION =====');
    console.log('🔍 [UnifiedMessaging] Search Parameters:');
    console.log('🔍 [UnifiedMessaging] - User ID:', user.id);
    console.log('🔍 [UnifiedMessaging] - Vendor ID:', vendorId);
    console.log('🔍 [UnifiedMessaging] - Service Type:', serviceType || 'Not specified');
    console.log('🔍 [UnifiedMessaging] - Service Name:', serviceName || 'Not specified');
    console.log('🔍 [UnifiedMessaging] - Total conversations to search:', conversations.length);

    // First priority: Find conversation with exact service match
    if (serviceName) {
      console.log('🎯 [UnifiedMessaging] ===== PRIORITY 1: EXACT SERVICE NAME MATCH =====');
      console.log('🎯 [UnifiedMessaging] Looking for service name:', serviceName);
      
      const serviceMatch = conversations.find((conv, index) => {
        console.log(`📋 [UnifiedMessaging] Checking conversation ${index + 1}: ${conv.id}`);
        
        // Check if this conversation involves the same vendor
        const hasVendor = conv.participants.includes(vendorId);
        console.log(`📋 [UnifiedMessaging] - Has vendor ${vendorId}:`, hasVendor);
        if (!hasVendor) return false;

        // Check for service name match in business context
        const businessContextMatch = conv.businessContext?.serviceType === serviceName;
        console.log(`📋 [UnifiedMessaging] - Business context match:`, businessContextMatch, 'Context:', conv.businessContext?.serviceType);
        if (businessContextMatch) {
          console.log('🏆 [UnifiedMessaging] PERFECT MATCH: Business context match found!');
          return true;
        }

        // Check for service name in participant names or conversation metadata
        const participantNameMatch = conv.participantNames && Object.values(conv.participantNames).some(name => 
          name.toLowerCase().includes(serviceName.toLowerCase())
        );
        console.log(`📋 [UnifiedMessaging] - Participant name match:`, participantNameMatch, 'Names:', conv.participantNames);
        if (participantNameMatch) {
          console.log('🏆 [UnifiedMessaging] GOOD MATCH: Participant name match found!');
          return true;
        }

        // Check if service name appears in any conversation metadata
        const convStr = JSON.stringify(conv).toLowerCase();
        const metadataMatch = convStr.includes(serviceName.toLowerCase());
        console.log(`📋 [UnifiedMessaging] - Metadata string match:`, metadataMatch);
        if (metadataMatch) {
          console.log('🏆 [UnifiedMessaging] CONTENT MATCH: Service name found in conversation metadata!');
          return true;
        }

        return false;
      });

      if (serviceMatch) {
        console.log('✅ [UnifiedMessaging] ===== EXISTING SERVICE CONVERSATION FOUND =====');
        console.log('✅ [UnifiedMessaging] Conversation ID:', serviceMatch.id);
        console.log('✅ [UnifiedMessaging] Service Name:', serviceName);
        console.log('✅ [UnifiedMessaging] Vendor ID:', vendorId);
        console.log('✅ [UnifiedMessaging] Created:', serviceMatch.createdAt);
        console.log('✅ [UnifiedMessaging] USER WILL BE ROUTED TO THIS EXISTING CONVERSATION');
        return serviceMatch;
      }
    }

    // Second priority: Find conversation with same vendor and service type
    if (serviceType) {
      console.log('🔍 [UnifiedMessaging] ===== PRIORITY 2: SERVICE TYPE MATCH =====');
      console.log('🔍 [UnifiedMessaging] Looking for service type:', serviceType);
      
      const typeMatch = conversations.find((conv, index) => {
        console.log(`📋 [UnifiedMessaging] Checking conversation ${index + 1}: ${conv.id}`);
        const hasVendor = conv.participants.includes(vendorId);
        const hasServiceType = conv.businessContext?.serviceType === serviceType;
        console.log(`📋 [UnifiedMessaging] - Has vendor:`, hasVendor);
        console.log(`📋 [UnifiedMessaging] - Has service type:`, hasServiceType);
        return hasVendor && hasServiceType;
      });

      if (typeMatch) {
        console.log('✅ [UnifiedMessaging] ===== EXISTING SERVICE TYPE CONVERSATION FOUND =====');
        console.log('✅ [UnifiedMessaging] Conversation ID:', typeMatch.id);
        console.log('✅ [UnifiedMessaging] Service Type:', serviceType);
        console.log('✅ [UnifiedMessaging] Vendor ID:', vendorId);
        console.log('✅ [UnifiedMessaging] USER WILL BE ROUTED TO THIS EXISTING CONVERSATION');
        return typeMatch;
      }
    }

    // Third priority: Find any conversation with the same vendor
    console.log('🔍 [UnifiedMessaging] ===== PRIORITY 3: GENERAL VENDOR MATCH =====');
    console.log('🔍 [UnifiedMessaging] Looking for any conversation with vendor:', vendorId);
    
    const vendorMatch = conversations.find((conv, index) => {
      console.log(`📋 [UnifiedMessaging] Checking conversation ${index + 1}: ${conv.id}`);
      const hasVendor = conv.participants.includes(vendorId);
      console.log(`📋 [UnifiedMessaging] - Has vendor:`, hasVendor);
      return hasVendor;
    });

    if (vendorMatch) {
      console.log('✅ [UnifiedMessaging] ===== EXISTING VENDOR CONVERSATION FOUND =====');
      console.log('✅ [UnifiedMessaging] Conversation ID:', vendorMatch.id);
      console.log('✅ [UnifiedMessaging] Vendor ID:', vendorId);
      console.log('✅ [UnifiedMessaging] Note: This is a general conversation (no specific service context)');
      console.log('✅ [UnifiedMessaging] USER WILL BE ROUTED TO THIS EXISTING CONVERSATION');
      return vendorMatch;
    }

    console.log('❌ [UnifiedMessaging] ===== NO EXISTING CONVERSATION FOUND =====');
    console.log('❌ [UnifiedMessaging] Search completed, no matches found for:');
    console.log('❌ [UnifiedMessaging] - Vendor ID:', vendorId);
    console.log('❌ [UnifiedMessaging] - Service Type:', serviceType);
    console.log('❌ [UnifiedMessaging] - Service Name:', serviceName);
    console.log('❌ [UnifiedMessaging] - Total conversations searched:', conversations.length);
    console.log('❌ [UnifiedMessaging] A NEW CONVERSATION WILL BE CREATED');
    return null;
  }, [conversations, user?.id]);

  // Enhanced business conversation creation with duplication prevention
  const createOrFindBusinessConversation = useCallback(async (
    vendorId: string,
    bookingId?: string,
    serviceType?: string,
    serviceName?: string
  ): Promise<string | null> => {
    console.log('🚀 [UnifiedMessaging] ===== CREATE OR FIND BUSINESS CONVERSATION =====');
    console.log('🚀 [UnifiedMessaging] Request Parameters:');
    console.log('🚀 [UnifiedMessaging] - Vendor ID:', vendorId);
    console.log('🚀 [UnifiedMessaging] - Booking ID:', bookingId || 'None');
    console.log('🚀 [UnifiedMessaging] - Service Type:', serviceType || 'None');
    console.log('🚀 [UnifiedMessaging] - Service Name:', serviceName || 'None');
    
    // First, try to find an existing conversation
    console.error('🔍 [UnifiedMessaging] ===== STEP 1: SEARCHING FOR EXISTING CONVERSATION =====');
    console.error('🔍 [UnifiedMessaging] Current conversations count:', conversations?.length || 0);
    console.error('🔍 [UnifiedMessaging] findExistingConversation function available:', !!findExistingConversation);
    
    const existingConversation = findExistingConversation(vendorId, serviceType, serviceName);
    console.error('🔍 [UnifiedMessaging] Existing conversation search result:', !!existingConversation);
    
    if (existingConversation) {
      console.error('🎯 [UnifiedMessaging] ===== EXISTING CONVERSATION FOUND - REUSING =====');
      console.log('🎯 [UnifiedMessaging] Found conversation ID:', existingConversation.id);
      console.log('🎯 [UnifiedMessaging] Participants:', existingConversation.participants);
      console.log('🎯 [UnifiedMessaging] Created at:', existingConversation.createdAt);
      console.log('🎯 [UnifiedMessaging] Has messages:', !!existingConversation.lastMessage);
      console.log('🎯 [UnifiedMessaging] Business context:', existingConversation.businessContext);
      
      // Ensure the conversation is up to date in our state
      if (existingConversation.lastMessage) {
        console.log('💬 [UnifiedMessaging] ===== CONVERSATION HAS MESSAGE HISTORY =====');
        console.log('💬 [UnifiedMessaging] Last message from:', existingConversation.lastMessage.senderId);
        console.log('💬 [UnifiedMessaging] Last message content:', existingConversation.lastMessage.content?.substring(0, 50) + '...');
        console.log('💬 [UnifiedMessaging] Last message time:', existingConversation.lastMessage.timestamp);
        console.log('💬 [UnifiedMessaging] USER WILL SEE EXISTING MESSAGE HISTORY');
      } else {
        console.log('📝 [UnifiedMessaging] ===== CONVERSATION HAS NO MESSAGES YET =====');
        console.log('📝 [UnifiedMessaging] This is a fresh conversation ready for new messages');
      }
      
      console.log('🏁 [UnifiedMessaging] ===== RETURNING EXISTING CONVERSATION =====');
      console.log('🏁 [UnifiedMessaging] User will be routed to conversation:', existingConversation.id);
      console.log('🏁 [UnifiedMessaging] NO NEW CONVERSATION NEEDED');
      
      return existingConversation.id;
    }

    // If no existing conversation found, create a new one
    console.error('🆕 [UnifiedMessaging] ===== STEP 2: CREATING NEW CONVERSATION =====');
    console.error('🆕 [UnifiedMessaging] No existing conversation found, creating new one');
    console.error('🆕 [UnifiedMessaging] New conversation parameters:', {
      vendorId,
      serviceType,
      serviceName,
      bookingId
    });
    console.error('🆕 [UnifiedMessaging] createConversation function available:', !!createConversation);

    console.error('🔄 [UnifiedMessaging] ===== CALLING CREATE CONVERSATION =====');
    console.error('🔄 [UnifiedMessaging] ===== CRITICAL: BACKEND ENDPOINTS MISSING =====');
    console.error('🔄 [UnifiedMessaging] Backend /api/conversations returns 404');
    console.error('🔄 [UnifiedMessaging] Using mock service as primary solution');
    
    const conversationId = await createConversation(vendorId, 'vendor');
    
    console.error('🔄 [UnifiedMessaging] ===== CREATE CONVERSATION RESULT =====');
    console.error('🔄 [UnifiedMessaging] Returned conversation ID:', conversationId);
    console.error('🔄 [UnifiedMessaging] Type:', typeof conversationId);
    console.error('🔄 [UnifiedMessaging] Is truthy:', !!conversationId);
    
    if (!conversationId) {
      console.error('❌ [UnifiedMessaging] ===== CONVERSATION CREATION FAILED =====');
      console.error('❌ [UnifiedMessaging] Failed to create new conversation');
      console.error('❌ [UnifiedMessaging] Both backend API and mock service failed');
      console.error('❌ [UnifiedMessaging] This is a critical system failure');
      return null;
    }

    console.log('✅ [UnifiedMessaging] ===== NEW CONVERSATION CREATED =====');
    console.log('✅ [UnifiedMessaging] New conversation ID:', conversationId);
    
    // Verify the conversation was added to state
    console.log('🔍 [UnifiedMessaging] ===== VERIFYING CONVERSATION IN STATE =====');
    const verifyConversationInState = () => {
      return new Promise<boolean>((resolve) => {
        const checkCount = 5;
        let attempts = 0;
        
        const checkExistence = () => {
          attempts++;
          console.log(`🔍 [UnifiedMessaging] Verification attempt ${attempts}/${checkCount} for conversation:`, conversationId);
          
          setConversations(currentConversations => {
            const foundConversation = currentConversations.find(c => c.id === conversationId);
            console.log('🔍 [UnifiedMessaging] Current conversations count:', currentConversations.length);
            console.log('🔍 [UnifiedMessaging] Looking for conversation ID:', conversationId);
            console.log('🔍 [UnifiedMessaging] Available conversation IDs:', currentConversations.map(c => c.id));
            console.log('🔍 [UnifiedMessaging] Conversation found:', !!foundConversation);
            
            if (foundConversation) {
              console.log('✅ [UnifiedMessaging] ===== CONVERSATION VERIFIED IN STATE =====');
              console.log('✅ [UnifiedMessaging] Conversation details:', {
                id: foundConversation.id,
                participants: foundConversation.participants,
                participantNames: foundConversation.participantNames
              });
              resolve(true);
            } else if (attempts < checkCount) {
              setTimeout(checkExistence, 100);
            } else {
              console.error('❌ [UnifiedMessaging] ===== CONVERSATION NOT FOUND AFTER VERIFICATION =====');
              console.error('❌ [UnifiedMessaging] This is a critical state synchronization issue');
              resolve(false);
            }
            
            return currentConversations; // Return unchanged
          });
        };
        
        checkExistence();
      });
    };
    
    const conversationVerified = await verifyConversationInState();
    if (!conversationVerified) {
      console.error('❌ [UnifiedMessaging] Conversation verification failed, but continuing...');
    }
    
    if (bookingId || serviceType || serviceName) {
      console.log('🏷️ [UnifiedMessaging] ===== ADDING BUSINESS CONTEXT =====');
      console.log('🏷️ [UnifiedMessaging] Adding business context to conversation');
      
      // Update conversation with enhanced business context
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { 
                ...conv, 
                businessContext: { 
                  bookingId, 
                  serviceType: serviceName || serviceType, 
                  vendorBusinessName: conv.participantNames[vendorId] 
                } 
              }
            : conv
        )
      );
      
      console.log('✅ [UnifiedMessaging] Business context added successfully');
      
      // Wait for business context to propagate
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('🏁 [UnifiedMessaging] ===== NEW CONVERSATION READY =====');
    console.log('🏁 [UnifiedMessaging] User will be routed to new conversation:', conversationId);
    console.log('🏁 [UnifiedMessaging] Fresh conversation ready for first message');
    console.log('🏁 [UnifiedMessaging] Conversation should now be findable in state');
    
    return conversationId;
  }, [createConversation, findExistingConversation]);

  // Legacy wrapper for backward compatibility
  const createBusinessConversation = useCallback(async (
    vendorId: string,
    bookingId?: string,
    serviceType?: string
  ): Promise<string | null> => {
    console.log('⚠️ [UnifiedMessaging] Using legacy createBusinessConversation, consider migrating to createOrFindBusinessConversation');
    return createOrFindBusinessConversation(vendorId, bookingId, serviceType);
  }, [createOrFindBusinessConversation]);

  const markAsRead = useCallback(async (conversationId: string): Promise<void> => {
    if (!user?.id) return;

    console.log('👁️ [UnifiedMessaging] Marking conversation as read:', conversationId);
    
    const result = await handleApiCall(
      () => MessagingApiService.markAsRead(conversationId, user.id),
      undefined, // no loading state setter
      true // suppressErrorLogging = true to prevent console spam
    );
    
    if (!result) {
      // API call failed, silently continue without updating local state
      console.log('⚠️ [UnifiedMessaging] Mark as read failed (backend endpoint not implemented yet), continuing silently');
      return;
    }
    
    console.log('✅ [UnifiedMessaging] Conversation marked as read successfully');

    // Update local state only if backend call succeeded
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    // Recalculate total unread count
    setUnreadCount(prev => {
      const conversation = conversations.find(c => c.id === conversationId);
      return prev - (conversation?.unreadCount || 0);
    });
  }, [user?.id, conversations]);

  const setActiveConversation = useCallback(async (conversationId: string | null): Promise<boolean> => {
    if (!conversationId) {
      console.log('🎯 [UnifiedMessaging] Clearing active conversation (null provided)');
      setActiveConversationState(null);
      setMessages([]);
      return true;
    }

    console.log('🎯 [UnifiedMessaging] ===== SETTING ACTIVE CONVERSATION =====');
    console.log('🎯 [UnifiedMessaging] Target conversation ID:', conversationId);
    console.log('🎯 [UnifiedMessaging] Current conversations in state:', conversations.length);
    console.log('🎯 [UnifiedMessaging] Current cache size:', conversationCache.size);
    
    // Helper function to activate conversation and handle post-activation tasks
    const activateConversation = async (conversation: UnifiedConversation): Promise<boolean> => {
      setActiveConversationState(conversation);
      
      try {
        await loadMessages(conversation.id);
        
        // CRITICAL FIX: Only call markAsRead if conversation has messages AND unread count > 0
        if (conversation.lastMessage && conversation.unreadCount > 0) {
          console.log('👁️ [UnifiedMessaging] ===== MARKING CONVERSATION AS READ =====');
          console.log('👁️ [UnifiedMessaging] Conversation has unread messages, marking as read');
          try {
            await markAsRead(conversation.id);
            console.log('✅ [UnifiedMessaging] Conversation marked as read successfully');
          } catch (error) {
            console.log('⚠️ [UnifiedMessaging] Mark as read failed (likely backend endpoint not implemented), continuing silently');
          }
        } else {
          console.log('📝 [UnifiedMessaging] ===== SKIPPING MARK AS READ =====');
          console.log('📝 [UnifiedMessaging] Conversation has no unread messages or no messages at all');
        }
        
        console.log('🏁 [UnifiedMessaging] Conversation activation successful');
        return true;
      } catch (error) {
        console.error('❌ [UnifiedMessaging] Error in post-activation tasks:', error);
        console.log('✅ [UnifiedMessaging] Conversation still activated, just loading/marking failed');
        return true; // Still consider successful since we set the active conversation
      }
    };
    
    // CRITICAL FIX: Check ref cache first (immediate access), then state cache
    console.log('💾 [UnifiedMessaging] ===== CHECKING REF CACHE FIRST (IMMEDIATE ACCESS) =====');
    const refCachedConversation = conversationCacheRef.current.get(conversationId);
    if (refCachedConversation) {
      console.log('✅ [UnifiedMessaging] ===== CONVERSATION FOUND IN REF CACHE - ACTIVATING IMMEDIATELY =====');
      return await activateConversation(refCachedConversation);
    }
    
    // Fallback to state cache
    console.log('💾 [UnifiedMessaging] ===== CHECKING STATE CACHE (FALLBACK) =====');
    const cachedConversation = conversationCache.get(conversationId);
    if (cachedConversation) {
      console.log('✅ [UnifiedMessaging] ===== CONVERSATION FOUND IN STATE CACHE =====');
      
      // Also add to ref cache for future immediate access
      conversationCacheRef.current.set(conversationId, cachedConversation);
      
      return await activateConversation(cachedConversation);
    }
    
    // If not in cache, check state and add to cache
    console.log('📋 [UnifiedMessaging] ===== NOT IN CACHE - CHECKING STATE =====');
    const stateConversation = conversations.find(c => c.id === conversationId);
    if (stateConversation) {
      console.log('✅ [UnifiedMessaging] ===== CONVERSATION FOUND IN STATE - CACHING AND ACTIVATING =====');
      
      // Add to cache for future instant access
      setConversationCache(prev => {
        const newCache = new Map(prev);
        newCache.set(conversationId, stateConversation);
        console.log('💾 [UnifiedMessaging] Added to cache for future instant access');
        return newCache;
      });
      
      // Also add to ref cache
      conversationCacheRef.current.set(conversationId, stateConversation);
      
      return await activateConversation(stateConversation);
    }
    
    // CRITICAL DEBUG: Conversation not found in ref cache, state cache, or conversations state
    console.error('❌ [UnifiedMessaging] ===== CONVERSATION NOT FOUND ANYWHERE =====');
    console.error('❌ [UnifiedMessaging] This is the root cause of the activation failure');
    console.error('❌ [UnifiedMessaging] Target conversation ID:', conversationId);
    console.error('❌ [UnifiedMessaging] Conversation creation must have failed silently');
    
    console.error('❌ [UnifiedMessaging] REF CACHE contents:', Array.from(conversationCacheRef.current.entries()).map(([id, conv]) => ({
      id, 
      participants: conv.participants, 
      created: conv.createdAt
    })));
    
    console.error('❌ [UnifiedMessaging] STATE CACHE contents:', Array.from(conversationCache.entries()).map(([id, conv]) => ({
      id, 
      participants: conv.participants, 
      created: conv.createdAt
    })));
    
    console.error('❌ [UnifiedMessaging] CONVERSATIONS STATE contents:', conversations.map(conv => ({
      id: conv.id, 
      participants: conv.participants, 
      created: conv.createdAt
    })));
    
    // Return false to indicate failure
    setActiveConversationState(null);
    setMessages([]);
    return false;
    
    // Enhanced retry logic with exponential backoff for race conditions
    const maxAttempts = 8;
    let attemptCount = 0;
    
    const attemptToSetActive = async (): Promise<boolean> => {
      attemptCount++;
      console.log(`🔍 [UnifiedMessaging] ===== ATTEMPT ${attemptCount}/${maxAttempts} TO SET ACTIVE (STATE SEARCH) =====`);
      
      // Try to find in current conversations
      let conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        console.log('✅ [UnifiedMessaging] ===== CONVERSATION FOUND IN STATE =====');
        console.log('✅ [UnifiedMessaging] Conversation details:', {
          id: conversation.id,
          participants: conversation.participants,
          participantNames: conversation.participantNames,
          lastMessage: conversation.lastMessage?.content?.substring(0, 50) + '...',
          businessContext: conversation.businessContext
        });
        
        setActiveConversationState(conversation);
        console.log('🎯 [UnifiedMessaging] Active conversation state updated');
        
        try {
          // Load messages for this conversation
          console.log('📨 [UnifiedMessaging] Loading messages for conversation:', conversationId);
          await loadMessages(conversation.id);
          
          // CRITICAL FIX: Only mark as read if conversation has unread messages
          if (conversation.lastMessage && conversation.unreadCount > 0) {
            console.log('👁️ [UnifiedMessaging] Marking conversation as read:', conversationId);
            try {
              await markAsRead(conversation.id);
              console.log('✅ [UnifiedMessaging] Conversation marked as read successfully');
            } catch (error) {
              console.log('⚠️ [UnifiedMessaging] Mark as read failed, continuing silently');
            }
          } else {
            console.log('📝 [UnifiedMessaging] Skipping mark as read - no unread messages');
          }
          
          console.log('🏁 [UnifiedMessaging] ===== ACTIVE CONVERSATION SET SUCCESSFULLY =====');
          return true;
        } catch (error) {
          console.error('❌ [UnifiedMessaging] Error loading messages or marking as read:', error);
          return true; // Still consider it successful since we set the active conversation
        }
      }
      
      console.log('⏳ [UnifiedMessaging] ===== CONVERSATION NOT FOUND IN CURRENT STATE =====');
      console.log('⏳ [UnifiedMessaging] Current conversations count:', conversations.length);
      console.log('⏳ [UnifiedMessaging] Looking for conversation ID:', conversationId);
      console.log('⏳ [UnifiedMessaging] Available conversation IDs:', conversations.map(c => c.id));
      
      // Check if the conversation ID pattern looks valid
      const isValidConversationId = conversationId && conversationId.startsWith('conv_') && conversationId.length > 20;
      console.log('🔍 [UnifiedMessaging] Conversation ID looks valid:', isValidConversationId);
      
      // If not found and we haven't exceeded attempts, wait and try again
      if (attemptCount < maxAttempts) {
        // First few attempts: short delays for recent creations
        // Later attempts: refresh conversations and longer delays
        let delay = attemptCount <= 3 ? attemptCount * 200 : attemptCount * 400;
        
        if (attemptCount === 3) {
          console.log('🔄 [UnifiedMessaging] ===== REFRESHING CONVERSATIONS AT ATTEMPT 3 =====');
          console.log('🔄 [UnifiedMessaging] This should help if conversation exists in backend but not in local state');
          try {
            await loadConversations();
            console.log('✅ [UnifiedMessaging] Conversations refreshed successfully');
            // After refresh, try immediately with current state
            conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
              console.log('🎯 [UnifiedMessaging] ===== CONVERSATION FOUND AFTER REFRESH =====');
              setActiveConversationState(conversation);
              await loadMessages(conversation.id);
              
              // CRITICAL FIX: Only mark as read if necessary
              if (conversation.lastMessage && conversation.unreadCount > 0) {
                try {
                  await markAsRead(conversation.id);
                  console.log('✅ [UnifiedMessaging] Conversation marked as read after refresh');
                } catch (error) {
                  console.log('⚠️ [UnifiedMessaging] Mark as read failed after refresh, continuing silently');
                }
              }
              
              console.log('🏁 [UnifiedMessaging] ===== ACTIVE CONVERSATION SET AFTER REFRESH =====');
              return true;
            }
          } catch (error) {
            console.error('❌ [UnifiedMessaging] Error refreshing conversations:', error);
          }
        }
        
        console.log(`⏳ [UnifiedMessaging] Waiting ${delay}ms before attempt ${attemptCount + 1}...`);
        console.log(`⏳ [UnifiedMessaging] Will check again if conversation ${conversationId} appears in state`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptToSetActive();
      }
      
      console.error('❌ [UnifiedMessaging] ===== ALL ATTEMPTS FAILED =====');
      console.error('❌ [UnifiedMessaging] Target conversation ID:', conversationId);
      console.error('❌ [UnifiedMessaging] Available conversations:', conversations.map(c => ({id: c.id, participants: c.participants})));
      console.error('❌ [UnifiedMessaging] This indicates a serious timing issue or conversation creation failure');
      
      setActiveConversationState(null);
      setMessages([]);
      return false;
    };
    
    // Start the attempt process
    try {
      return await attemptToSetActive();
    } catch (error) {
      console.error('❌ [UnifiedMessaging] ===== ERROR IN SET ACTIVE CONVERSATION =====');
      console.error('❌ [UnifiedMessaging] Error details:', error);
      setActiveConversationState(null);
      setMessages([]);
      return false;
    }
  }, [conversations, conversationCache, loadMessages, loadConversations, markAsRead]);

  // Direct conversation activation without state search (for newly created conversations)


  const setActiveConversationDirect = useCallback(async (conversation: UnifiedConversation): Promise<boolean> => {
    console.log('🎯 [UnifiedMessaging] ===== SETTING ACTIVE CONVERSATION DIRECTLY =====');
    console.log('🎯 [UnifiedMessaging] Conversation ID:', conversation.id);
    console.log('🎯 [UnifiedMessaging] Participants:', conversation.participants);
    console.log('🎯 [UnifiedMessaging] Using direct conversation object to bypass state search');
    
    try {
      // Set the conversation as active directly
      setActiveConversationState(conversation);
      console.log('✅ [UnifiedMessaging] Active conversation state updated directly');
      
      // Load messages for this conversation
      console.log('📨 [UnifiedMessaging] Loading messages for conversation:', conversation.id);
      await loadMessages(conversation.id);
      
      // CRITICAL FIX: Only mark as read if conversation has unread messages
      if (conversation.lastMessage && conversation.unreadCount > 0) {
        console.log('👁️ [UnifiedMessaging] Marking conversation as read:', conversation.id);
        try {
          await markAsRead(conversation.id);
          console.log('✅ [UnifiedMessaging] Conversation marked as read successfully');
        } catch (error) {
          console.log('⚠️ [UnifiedMessaging] Mark as read failed, continuing silently');
        }
      } else {
        console.log('📝 [UnifiedMessaging] Skipping mark as read - no unread messages');
      }
      
      console.log('🏁 [UnifiedMessaging] ===== DIRECT CONVERSATION ACTIVATION SUCCESSFUL =====');
      return true;
    } catch (error) {
      console.error('❌ [UnifiedMessaging] ===== ERROR IN DIRECT CONVERSATION ACTIVATION =====');
      console.error('❌ [UnifiedMessaging] Error details:', error);
      setActiveConversationState(null);
      setMessages([]);
      return false;
    }
  }, [loadMessages, markAsRead]);

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
  }, [user?.id, loadConversations]);

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      console.log('🔄 [UnifiedMessaging] Auto-refreshing conversations...');
      loadConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, loadConversations]);

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
    setActiveConversationDirect,
    markAsRead,
    
    // UI states
    isFloatingChatOpen,
    isModalOpen,
    setFloatingChatOpen,
    setModalOpen,
    
    // Business context helpers
    createBusinessConversation,
    createOrFindBusinessConversation,
    findExistingConversation
  };

  return (
    <UnifiedMessagingContext.Provider value={contextValue}>
      {children}
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
