import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Universal message and conversation types
export interface UniversalMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'vendor' | 'couple' | 'admin';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  failed?: boolean;
}

export interface UniversalParticipant {
  id: string;
  name: string;
  role: 'vendor' | 'couple' | 'admin';
  avatar?: string;
  email?: string;
  isOnline?: boolean;
  businessName?: string; // For vendors
  serviceCategory?: string; // For vendors
}

export interface UniversalConversation {
  id: string;
  participants: UniversalParticipant[];
  messages: UniversalMessage[]; // Full message history
  lastMessage?: UniversalMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  title?: string; // Auto-generated or custom
  serviceInfo?: {
    id: string;
    name: string;
    category: string;
    description?: string;
  };
  metadata?: {
    vendorId?: string;
    coupleId?: string;
    serviceId?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'active' | 'archived' | 'resolved';
  };
}

export interface ChatUser {
  id: string;
  name: string;
  role: 'vendor' | 'couple' | 'admin';
  avatar?: string;
  businessName?: string;
  serviceCategory?: string;
}

interface UniversalMessagingContextType {
  // Core state
  conversations: UniversalConversation[];
  activeConversationId: string | null;
  currentUser: ChatUser | null;
  isLoading: boolean;
  error: string | null;
  
  // UI state
  showFloatingChat: boolean;
  isMinimized: boolean;
  unreadCount: number;
  
  // Core actions
  loadConversations: () => Promise<void>;
  loadMessagesForConversation: (conversationId: string) => Promise<void>;
  createConversation: (participants: UniversalParticipant[], serviceInfo?: any) => Promise<string>;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Navigation actions
  openConversation: (conversationId: string) => void;
  closeChat: () => void;
  minimizeChat: () => void;
  expandChat: () => void;
  
  // User interactions
  startConversationWith: (targetUser: ChatUser, serviceInfo?: any) => Promise<string>;
  searchConversations: (query: string) => UniversalConversation[];
  getConversationWithUser: (userId: string) => UniversalConversation | null;
  getMessages: (conversationId: string) => UniversalMessage[];
  
  // Utility
  getOtherParticipants: (conversationId: string) => UniversalParticipant[];
  getConversationTitle: (conversationId: string) => string;
  refresh: () => Promise<void>;
}

const UniversalMessagingContext = createContext<UniversalMessagingContextType | null>(null);

export const UniversalMessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Core state
  const [conversations, setConversations] = useState<UniversalConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  
  // UI state
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  
  // Computed values
  const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Initialize current user from auth context
  useEffect(() => {
    if (isAuthenticated && user) {
      const chatUser: ChatUser = {
        id: user.id,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim()
          : user.email || 'User',
        role: user.role || detectUserRole(),
        avatar: (user as any).avatar || generateAvatarUrl(user.email || user.id),
        businessName: (user as any).businessName,
        serviceCategory: (user as any).serviceCategory
      };
      setCurrentUser(chatUser);
      console.log('✅ [UniversalMessaging] Current user initialized:', chatUser);
    } else {
      // TEMPORARY: Create a test user for demo purposes based on current path
      const isVendorPath = window.location.pathname.includes('/vendor');
      const testUser: ChatUser = isVendorPath ? {
        id: '2-2025-003',
        name: 'Sarah Johnson Photography',
        role: 'vendor',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
        businessName: 'Sarah Johnson Photography',
        serviceCategory: 'Photography'
      } : {
        id: '1-2025-001',
        name: 'Demo User',
        role: 'couple',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        businessName: undefined,
        serviceCategory: undefined
      };
      setCurrentUser(testUser);
      console.log('🧪 [UniversalMessaging] Using test user for demo:', testUser);
    }
  }, [isAuthenticated, user]);

  // Detect user role from URL or context
  const detectUserRole = (): 'vendor' | 'couple' | 'admin' => {
    const path = window.location.pathname;
    if (path.includes('/vendor')) return 'vendor';
    if (path.includes('/admin')) return 'admin';
    return 'couple';
  };

  // Generate avatar URL from email/id
  const generateAvatarUrl = (identifier: string): string => {
    const hash = btoa(identifier).substring(0, 10);
    return `https://images.unsplash.com/photo-150${Math.abs(hash.charCodeAt(0) % 9)}108755-2616b612b786?w=100&h=100&fit=crop&crop=face`;
  };

  // Load conversations from API - memoized to prevent excessive reloads
  const loadConversations = useCallback(async () => {
    if (!currentUser) {
      console.log('⚠️ [UniversalMessaging] No current user, skipping conversation load');
      return;
    }

    // Prevent reload if we're already loading or creating a conversation
    if (isLoading || isCreatingConversation) {
      console.log('⚠️ [UniversalMessaging] Already loading or creating conversation, skipping reload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 [UniversalMessaging] Loading conversations for ${currentUser.role}: ${currentUser.name}`);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const endpoint = currentUser.role === 'vendor' 
        ? `${apiUrl}/api/conversations/conversations/${currentUser.id}`
        : `${apiUrl}/api/conversations/individual/${currentUser.id}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📦 [UniversalMessaging] Backend response:`, data);
      console.log(`📦 [UniversalMessaging] Success:`, data.success);
      console.log(`📦 [UniversalMessaging] Conversations count:`, data.conversations?.length);
      
      if (data.success && data.conversations) {
        const transformedConversations: UniversalConversation[] = data.conversations.map((conv: any) => ({
          id: conv.id,
          participants: transformParticipants(conv.participants || [], conv),
          messages: [], // Initialize empty messages array - will be loaded separately
          lastMessage: conv.lastMessage ? transformMessage(conv.lastMessage) : undefined,
          unreadCount: conv.unreadCount || 0,
          createdAt: new Date(conv.createdAt || Date.now()),
          updatedAt: new Date(conv.updatedAt || Date.now()),
          title: generateConversationTitle(conv),
          serviceInfo: conv.serviceInfo || conv.service,
          metadata: {
            vendorId: conv.vendorId || conv.vendor_id,
            coupleId: conv.coupleId || conv.couple_id,
            serviceId: conv.serviceId || conv.service_id,
            status: conv.status || 'active'
          }
        }));

        // Preserve locally created conversations that might not be synced yet
        console.log(`🔄 [UniversalMessaging] Transformed conversations:`, transformedConversations);
        
        setConversations(prev => {
          const localConversations = prev.filter(c => c.id.startsWith('conv_'));
          const backendConversations = transformedConversations.map(conv => ({
            ...conv,
            messages: conv.messages || [] // Ensure messages array exists
          }));
          
          // Combine: all backend conversations + any local conversations not in backend
          const backendIds = new Set(backendConversations.map(c => c.id));
          const uniqueLocalConversations = localConversations.filter(c => !backendIds.has(c.id))
            .map(conv => ({
              ...conv,
              messages: conv.messages || [] // Ensure messages array exists for local conversations too
            }));
          
          const finalConversations = [...backendConversations, ...uniqueLocalConversations];
          console.log(`✅ [UniversalMessaging] Loaded ${backendConversations.length} from backend + preserved ${uniqueLocalConversations.length} local = ${finalConversations.length} total`);
          console.log(`✅ [UniversalMessaging] Final conversations:`, finalConversations);
          return finalConversations;
        });
        
        // Auto-select first conversation if none selected
        if (!activeConversationId && transformedConversations.length > 0) {
          setActiveConversationId(transformedConversations[0].id);
        }
      } else {
        console.log('⚠️ [UniversalMessaging] No conversations found');
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ [UniversalMessaging] Failed to load conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
      
      // Provide demo conversations for development
      if (import.meta.env.DEV) {
        setConversations(generateDemoConversations());
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, currentUser?.role]); // Only reload when user ID/role changes

  // Auto-load conversations when user is available (defined after loadConversations to avoid hoisting issues)
  useEffect(() => {
    if (currentUser && currentUser.id) {
      loadConversations();
    }
  }, [currentUser?.id]); // Only trigger on ID change, loadConversations is stable

  // Transform API participants to universal format
  const transformParticipants = (participants: any[], conv: any): UniversalParticipant[] => {
    const transformed = participants.map((p: any) => {
      // Better name resolution: prioritize business names over generic participant names
      let participantName = p.name || p.participant_name || 'Unknown User';
      
      // If the name looks like a generic "Participant {ID}", try to use business name or vendor name
      if (participantName.startsWith('Participant ') && (p.business_name || p.businessName || conv.vendorName || conv.businessName)) {
        participantName = p.business_name || p.businessName || conv.vendorName || conv.businessName || participantName;
      }
      
      return {
        id: p.id || p.user_id || p.participant_id,
        name: participantName,
        role: p.role || p.participant_role || 'couple',
        avatar: p.avatar || p.profile_image,
        email: p.email,
        isOnline: p.is_online || false,
        businessName: p.business_name || p.businessName || conv.businessName,
        serviceCategory: p.service_category || p.serviceCategory || conv.serviceCategory
      };
    });

    // If no participants from API, create them from conversation data
    if (transformed.length === 0) {
      if (conv.vendorName && currentUser?.role !== 'vendor') {
        transformed.push({
          id: conv.vendorId || conv.participant_id || 'vendor-unknown',
          name: conv.vendorName,
          role: 'vendor',
          avatar: undefined,
          email: undefined,
          isOnline: false,
          businessName: conv.vendorName,
          serviceCategory: conv.serviceName || conv.serviceCategory
        });
      }
      if (conv.coupleName && currentUser?.role !== 'couple') {
        transformed.push({
          id: conv.coupleId || 'couple-unknown',
          name: conv.coupleName,
          role: 'couple',
          avatar: undefined,
          email: undefined,
          isOnline: false,
          businessName: undefined,
          serviceCategory: undefined
        });
      }
    }

    return transformed;
  };

  // Transform API message to universal format
  const transformMessage = (msg: any): UniversalMessage => ({
    id: msg.id || msg.message_id,
    conversationId: msg.conversation_id || msg.conversationId,
    senderId: msg.sender_id || msg.senderId,
    senderName: msg.sender_name || msg.senderName,
    senderRole: (msg.sender_type || msg.sender_role || msg.senderRole || 'couple') as 'vendor' | 'couple' | 'admin',
    content: msg.content || msg.text || msg.message,
    timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
    type: (msg.message_type || msg.messageType || msg.type || 'text') as 'text' | 'image' | 'file',
    isRead: msg.is_read || msg.isRead || false
  });

  // Generate conversation title based on service info and participants
  const generateConversationTitle = (conv: any): string => {
    if (conv.title) return conv.title;
    
    // Prioritize service information for context
    if (conv.serviceInfo?.name) {
      if (currentUser?.role === 'vendor') {
        // For vendors: "Customer Name - Service Name"
        const customerName = conv.coupleName || conv.customerName || 'Customer';
        return `${customerName} - ${conv.serviceInfo.name}`;
      } else {
        // For couples: "Service Name - Vendor Name"
        const vendorName = conv.vendorName || conv.businessName || 
                          conv.participants?.[0]?.name || conv.participants?.[0]?.businessName || 'Vendor';
        return `${conv.serviceInfo.name} - ${vendorName}`;
      }
    }
    
    // Fallback: Use participant or vendor information
    if (currentUser?.role === 'vendor') {
      return conv.coupleName || conv.customerName || 'Customer Inquiry';
    } else {
      // For couples, show vendor name (even if it's something like "asdlkjsalkdj")
      const vendorName = conv.vendorName || conv.businessName || 
                        conv.participants?.[0]?.name || conv.participants?.[0]?.businessName;
      
      if (vendorName) {
        // If there's a service category, include it
        const serviceCategory = conv.serviceName || conv.serviceCategory || 
                               conv.participants?.[0]?.serviceCategory;
        if (serviceCategory && serviceCategory !== 'other') {
          return `${vendorName} - ${serviceCategory}`;
        }
        return vendorName;
      }
      
      // Final fallback
      return 'Wedding Service';
    }
  };

  // Generate demo conversations for development
  const generateDemoConversations = (): UniversalConversation[] => {
    if (!currentUser) return [];

    const now = new Date();
    
    if (currentUser.role === 'vendor') {
      return [
        {
          id: 'demo-vendor-conv-1',
          participants: [
            {
              id: 'couple-demo-1',
              name: 'Sarah & Mike Johnson',
              role: 'couple',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
            }
          ],
          messages: [
            {
              id: 'demo-msg-1',
              conversationId: 'demo-vendor-conv-1',
              senderId: 'couple-demo-1',
              senderName: 'Sarah Johnson',
              senderRole: 'couple',
              content: 'Hi! We\'re interested in your photography services for our June wedding.',
              timestamp: new Date(now.getTime() - 30 * 60 * 1000),
              type: 'text',
              isRead: false
            }
          ],
          lastMessage: {
            id: 'demo-msg-1',
            conversationId: 'demo-vendor-conv-1',
            senderId: 'couple-demo-1',
            senderName: 'Sarah Johnson',
            senderRole: 'couple',
            content: 'Hi! We\'re interested in your photography services for our June wedding.',
            timestamp: new Date(now.getTime() - 30 * 60 * 1000),
            type: 'text',
            isRead: false
          },
          unreadCount: 1,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
          title: 'Sarah & Mike Johnson',
          serviceInfo: {
            id: 'photo-service-1',
            name: 'Wedding Photography',
            category: 'Photography'
          }
        }
      ];
    } else {
      return [
        {
          id: 'demo-couple-conv-1',
          participants: [
            {
              id: 'vendor-demo-1',
              name: 'Perfect Weddings Photography',
              role: 'vendor',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
              businessName: 'Perfect Weddings Photography',
              serviceCategory: 'Photography'
            }
          ],
          messages: [
            {
              id: 'demo-msg-2',
              conversationId: 'demo-couple-conv-1',
              senderId: 'vendor-demo-1',
              senderName: 'Perfect Weddings Photography',
              senderRole: 'vendor',
              content: 'Thank you for your interest! I\'d love to discuss your special day. When is your wedding date?',
              timestamp: new Date(now.getTime() - 15 * 60 * 1000),
              type: 'text',
              isRead: false
            }
          ],
          lastMessage: {
            id: 'demo-msg-2',
            conversationId: 'demo-couple-conv-1',
            senderId: 'vendor-demo-1',
            senderName: 'Perfect Weddings Photography',
            senderRole: 'vendor',
            content: 'Thank you for your interest! I\'d love to discuss your special day. When is your wedding date?',
            timestamp: new Date(now.getTime() - 15 * 60 * 1000),
            type: 'text',
            isRead: false
          },
          unreadCount: 1,
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 15 * 60 * 1000),
          title: 'Perfect Weddings Photography',
          serviceInfo: {
            id: 'photo-service-1',
            name: 'Wedding Photography',
            category: 'Photography'
          }
        }
      ];
    }
  };

  // Create new conversation
  const createConversation = async (participants: UniversalParticipant[], serviceInfo?: any): Promise<string> => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    setIsCreatingConversation(true); // Prevent conversation reloads during creation

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate meaningful conversation title based on service info
    let conversationTitle: string;
    if (serviceInfo?.name) {
      if (currentUser.role === 'vendor') {
        // For vendors: "Customer Name - Service Name"
        const customerName = participants.length > 0 ? participants[0].name : 'Customer';
        conversationTitle = `${customerName} - ${serviceInfo.name}`;
      } else {
        // For couples: "Service Name - Vendor Name"
        const vendorName = participants.length > 0 ? participants[0].name : 'Vendor';
        conversationTitle = `${serviceInfo.name} - ${vendorName}`;
      }
    } else {
      // Fallback to participant names if no service info
      conversationTitle = participants.map(p => p.name).join(', ');
    }
    
    const newConversation: UniversalConversation = {
      id: conversationId,
      participants,
      messages: [], // Initialize empty messages array
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: conversationTitle,
      serviceInfo,
      metadata: {
        status: 'active'
      }
    };

    // Add to local state immediately
    setConversations(prev => {
      const updated = [newConversation, ...prev];
      console.log(`✅ [UniversalMessaging] Created conversation locally: ${conversationId}, total conversations: ${updated.length}`);
      return updated;
    });
    setActiveConversationId(conversationId);

    try {
      // Send to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      await fetch(`${apiUrl}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          participants,
          serviceInfo,
          createdBy: currentUser.id
        })
      });
      
      console.log('✅ [UniversalMessaging] Conversation created:', conversationId);
    } catch (error) {
      console.error('❌ [UniversalMessaging] Failed to create conversation in backend:', error);
    } finally {
      setIsCreatingConversation(false); // Reset flag regardless of success/failure
    }

    return conversationId;
  };

  // Send message
  const sendMessage = async (conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<void> => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: UniversalMessage = {
      id: messageId,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      timestamp: new Date(),
      type,
      isRead: true // Own messages are always read
    };

    // Add to local state immediately
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...(conv.messages || []), message], // Safely handle messages array
            lastMessage: message,
            updatedAt: new Date()
          };
        }
        return conv;
      })
    );

    try {
      // Send to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      await fetch(`${apiUrl}/api/conversations/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderType: currentUser.role,
          content,
          messageType: type
        })
      });
      
      console.log('✅ [UniversalMessaging] Message sent:', messageId);
      
      // Simulate response for demo
      if (import.meta.env.DEV) {
        setTimeout(() => simulateResponse(conversationId), 1500);
      }
    } catch (error) {
      console.error('❌ [UniversalMessaging] Failed to send message:', error);
      // Mark message as failed in UI
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId && conv.lastMessage?.id === messageId) {
            const updatedMessages = (conv.messages || []).map(msg => 
              msg.id === messageId ? { ...msg, failed: true } : msg
            );
            return {
              ...conv,
              messages: updatedMessages,
              lastMessage: { ...conv.lastMessage, failed: true }
            };
          }
          return conv;
        })
      );
    }
  };

  // Simulate response for demo
  const simulateResponse = (conversationId: string) => {
    if (!currentUser) return;

    const responses = currentUser.role === 'vendor' 
      ? [
          "Thank you for reaching out! I'd love to help make your day special.",
          "That sounds wonderful! Let me check my availability for that date.",
          "I'd be happy to discuss package options with you.",
          "Great choice! I'll send you some portfolio examples."
        ]
      : [
          "Thank you for your interest! When is your wedding date?",
          "I'd love to learn more about your vision for the day.",
          "Let me send you our pricing information.",
          "That sounds perfect! I have availability for that date."
        ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const otherParticipant = getOtherParticipants(conversationId)[0];
    
    if (otherParticipant) {
      const responseMessage: UniversalMessage = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        senderId: otherParticipant.id,
        senderName: otherParticipant.name,
        senderRole: otherParticipant.role,
        content: randomResponse,
        timestamp: new Date(),
        type: 'text',
        isRead: false
      };

      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...(conv.messages || []), responseMessage], // Safely handle messages array
              lastMessage: responseMessage,
              unreadCount: conv.unreadCount + 1,
              updatedAt: new Date()
            };
          }
          return conv;
        })
      );
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string): Promise<void> => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      await fetch(`${apiUrl}/api/conversations/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id })
      });
    } catch (error) {
      console.error('❌ [UniversalMessaging] Failed to mark as read:', error);
    }
  };

  // Navigation actions
  const openConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowFloatingChat(true);
    setIsMinimized(false);
    markAsRead(conversationId);
    
    // Load messages for the conversation if not already loaded
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.messages.length === 0 && conversation.lastMessage) {
      // Only load if we have a lastMessage but no messages array (indicating messages not loaded from DB)
      loadMessagesForConversation(conversationId);
    }
    
    // Fix participant names if they're generic (like "Participant 2-2025-003")
    if (conversation) {
      fixConversationParticipantNames(conversationId);
    }
  };

  // Fix participant names by fetching real vendor information
  const fixConversationParticipantNames = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    // Check if any participant has a generic name like "Participant {ID}"
    const needsFixing = conversation.participants.some(p => 
      p.name.startsWith('Participant ') && p.role === 'vendor'
    );

    if (!needsFixing) return;

    try {
      // Fetch vendor information from the vendors API
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/vendors`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.vendors) {
          // Update conversation with correct vendor names
          setConversations(prev => 
            prev.map(conv => {
              if (conv.id === conversationId) {
                const updatedParticipants = conv.participants.map(participant => {
                  if (participant.role === 'vendor' && participant.name.startsWith('Participant ')) {
                    // Find matching vendor by ID
                    const matchingVendor = data.vendors.find((vendor: any) => 
                      vendor.id === participant.id || vendor.vendor_id === participant.id
                    );
                    
                    if (matchingVendor) {
                      return {
                        ...participant,
                        name: matchingVendor.business_name || matchingVendor.name || participant.name,
                        businessName: matchingVendor.business_name || matchingVendor.name,
                        serviceCategory: matchingVendor.category || matchingVendor.service_category
                      };
                    }
                  }
                  return participant;
                });

                // Also update the conversation title
                const updatedConv = { ...conv, participants: updatedParticipants };
                return {
                  ...updatedConv,
                  title: generateConversationTitle(updatedConv)
                };
              }
              return conv;
            })
          );
          
          console.log(`✅ [UniversalMessaging] Fixed participant names for conversation ${conversationId}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ [UniversalMessaging] Failed to fix participant names for ${conversationId}:`, error);
    }
  };

  const closeChat = () => {
    setShowFloatingChat(false);
    setActiveConversationId(null);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const expandChat = () => {
    setIsMinimized(false);
  };

  // Start conversation with specific user
  const startConversationWith = async (targetUser: ChatUser, serviceInfo?: any): Promise<string> => {
    // Check if conversation already exists
    const existing = getConversationWithUser(targetUser.id);
    if (existing) {
      openConversation(existing.id);
      return existing.id;
    }

    // Create new conversation
    return await createConversation([targetUser], serviceInfo);
  };

  // Search conversations
  const searchConversations = (query: string): UniversalConversation[] => {
    if (!query.trim()) return conversations;
    
    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title?.toLowerCase().includes(lowerQuery) ||
      conv.participants.some(p => p.name.toLowerCase().includes(lowerQuery)) ||
      conv.lastMessage?.content.toLowerCase().includes(lowerQuery)
    );
  };

  // Get conversation with specific user
  const getConversationWithUser = (userId: string): UniversalConversation | null => {
    return conversations.find(conv => 
      conv.participants.some(p => p.id === userId)
    ) || null;
  };

  // Load messages for a conversation
  const loadMessagesForConversation = async (conversationId: string): Promise<void> => {
    if (!currentUser) return;

    try {
      console.log(`🔄 [UniversalMessaging] Loading messages for conversation: ${conversationId}`);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const response = await fetch(`${apiUrl}/api/conversations/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        console.warn(`⚠️ [UniversalMessaging] Failed to load messages for ${conversationId}: ${response.status}`);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.messages) {
        const transformedMessages: UniversalMessage[] = data.messages.map((msg: any) => transformMessage(msg));
        
        // Update the conversation with loaded messages
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { 
                  ...conv, 
                  messages: transformedMessages,
                  lastMessage: transformedMessages.length > 0 ? transformedMessages[transformedMessages.length - 1] : conv.lastMessage
                }
              : conv
          )
        );
        
        console.log(`✅ [UniversalMessaging] Loaded ${transformedMessages.length} messages for conversation ${conversationId}`);
      }
    } catch (error) {
      console.error(`❌ [UniversalMessaging] Failed to load messages for ${conversationId}:`, error);
    }
  };

  // Get messages for conversation
  const getMessages = (conversationId: string): UniversalMessage[] => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation?.messages || [];
  };

  // Get other participants in conversation
  const getOtherParticipants = (conversationId: string): UniversalParticipant[] => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || !currentUser) return [];
    
    return conversation.participants.filter(p => p.id !== currentUser.id);
  };

  // Get conversation title with service context
  const getConversationTitle = (conversationId: string): string => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return 'Unknown Conversation';
    
    // Return stored title if available (should already include service info)
    if (conversation.title) return conversation.title;
    
    // Get the other participant (vendor or couple)
    const otherParticipants = getOtherParticipants(conversationId);
    const otherParticipant = otherParticipants.length > 0 ? otherParticipants[0] : null;
    
    // Generate title with service context if available
    if (conversation.serviceInfo?.name) {
      if (currentUser?.role === 'vendor') {
        // For vendors: "Customer Name - Service Name"
        const customerName = otherParticipant?.name || 'Customer';
        return `${customerName} - ${conversation.serviceInfo.name}`;
      } else {
        // For couples: "Service Name - Vendor Name"  
        const vendorName = otherParticipant?.name || otherParticipant?.businessName || 'Vendor';
        return `${conversation.serviceInfo.name} - ${vendorName}`;
      }
    }
    
    // Fallback: Use participant information
    if (otherParticipant) {
      // If it's a vendor, prioritize business name or service category
      if (otherParticipant.role === 'vendor') {
        if (otherParticipant.businessName && otherParticipant.businessName !== otherParticipant.name) {
          return otherParticipant.businessName;
        }
        if (otherParticipant.serviceCategory) {
          return `${otherParticipant.name} - ${otherParticipant.serviceCategory}`;
        }
      }
      // Return the participant name
      return otherParticipant.name;
    }
    
    // Final fallback
    return 'Conversation';
  };

  // Refresh conversations
  const refresh = async (): Promise<void> => {
    await loadConversations();
  };

  const value: UniversalMessagingContextType = {
    // Core state
    conversations,
    activeConversationId,
    currentUser,
    isLoading,
    error,
    
    // UI state
    showFloatingChat,
    isMinimized,
    unreadCount,
    
    // Core actions
    loadConversations,
    loadMessagesForConversation,
    createConversation,
    sendMessage,
    markAsRead,
    
    // Navigation actions
    openConversation,
    closeChat,
    minimizeChat,
    expandChat,
    
    // User interactions
    startConversationWith,
    searchConversations,
    getConversationWithUser,
    getMessages,
    
    // Utility
    getOtherParticipants,
    getConversationTitle,
    refresh
  };

  return (
    <UniversalMessagingContext.Provider value={value}>
      {children}
    </UniversalMessagingContext.Provider>
  );
};

export const useUniversalMessaging = (): UniversalMessagingContextType => {
  const context = useContext(UniversalMessagingContext);
  if (!context) {
    throw new Error('useUniversalMessaging must be used within a UniversalMessagingProvider');
  }
  return context;
};
