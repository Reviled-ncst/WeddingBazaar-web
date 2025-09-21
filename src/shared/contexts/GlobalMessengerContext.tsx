import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { MessagingApiService } from '../../services/api/messagingApiService';

// Helper function to convert vendor ID to a realistic business name
const getVendorDisplayName = (vendorName: string, serviceName: string): string => {
  // If the vendor name is just "Vendor X-YYYY-ZZZ", generate a more realistic name
  if (vendorName.startsWith('Vendor ') && vendorName.match(/\d+-\d+-\d+/)) {
    // Extract the ID number for consistency
    const idMatch = vendorName.match(/(\d+)-(\d+)-(\d+)/);
    if (idMatch) {
      const [, , , sequence] = idMatch;
      
      // Create realistic business names based on service category
      const businessNames = {
        // Photography & Videography
        'photography': [`Aperture Studios`, `Golden Hour Photography`, `Moment Makers Photography`, `Shutter & Light Studios`, `Picture Perfect Photography`],
        'videography': [`Cinematic Weddings`, `Love Story Films`, `Dream Day Videos`, `Forever Films`, `Romantic Reels`],
        
        // Event Planning
        'planning': [`Elegant Events Co.`, `Dream Day Planners`, `Perfect Moments Planning`, `Blissful Celebrations`, `Enchanted Events`],
        'coordination': [`Seamless Events`, `Day-of Coordination Co.`, `Flawless Celebrations`, `Perfect Timing Events`, `Smooth Sailing Weddings`],
        
        // Catering & Food
        'catering': [`Gourmet Catering Co.`, `Culinary Delights`, `Feast & Celebration`, `Elegant Eats`, `Wedding Table Catering`],
        'food': [`Artisan Kitchen`, `Wedding Feast Co.`, `Delicious Moments`, `Celebration Cuisine`, `Memorable Meals`],
        
        // Flowers & Decor
        'floral': [`Bloom & Blossom`, `Garden of Eden Florals`, `Petal Perfect`, `Rose Garden Designs`, `Enchanted Florals`],
        'flowers': [`Bridal Bouquets Co.`, `Flower Power Weddings`, `Romantic Roses`, `Botanical Beauty`, `Wedding Blooms`],
        'decor': [`Elegant Designs Co.`, `Wedding Decor Dreams`, `Celebration Styling`, `Beautiful Beginnings Decor`, `Enchanted Occasions`],
        
        // Music & Entertainment
        'music': [`Harmony Wedding Music`, `Melodic Moments`, `Wedding Song Co.`, `Perfect Pitch Entertainment`, `Romantic Rhythms`],
        'dj': [`Beat Drop Entertainment`, `Wedding Vibes DJ`, `Dance Floor Magic`, `Celebration Sounds`, `Party Perfect DJ`],
        'band': [`Wedding Harmony Band`, `Celebration Musicians`, `Love Song Collective`, `Wedding Night Band`, `Romantic Melodies`],
        
        // Venues & Locations
        'venue': [`Elegant Manor`, `Garden Estate Weddings`, `Celebration Hall`, `Romantic Gardens`, `Wedding Haven`],
        'location': [`Scenic Wedding Spots`, `Beautiful Venues Co.`, `Dream Location Rentals`, `Perfect Places`, `Wedding Destinations`],
        
        // Transportation
        'transportation': [`Luxury Wedding Transport`, `Elegant Rides`, `Wedding Day Limos`, `Celebration Carriages`, `Romantic Rides`],
        'limo': [`Elite Wedding Limos`, `Luxury Car Service`, `Wedding Day Transport`, `Elegant Vehicles`, `Bridal Ride Co.`],
        
        // Beauty & Wellness
        'makeup': [`Bridal Beauty Co.`, `Wedding Glow Makeup`, `Perfect Look Studios`, `Radiant Bride Beauty`, `Elegant Makeup Artistry`],
        'hair': [`Bridal Hair Boutique`, `Wedding Day Styling`, `Perfect Tresses`, `Elegant Updos`, `Romantic Hair Design`],
        'beauty': [`Bridal Beauty Lounge`, `Wedding Day Spa`, `Radiance Beauty Co.`, `Elegant Bride Services`, `Perfect Day Beauty`],
        
        // Specialty Services
        'security': [`Elite Event Security`, `Wedding Protection Services`, `Safe Celebrations Co.`, `Guardian Events`, `Secure Weddings`],
        'guest': [`VIP Guest Services`, `Elite Wedding Concierge`, `Guest Experience Co.`, `Premium Event Services`, `Luxury Wedding Care`],
        'management': [`Event Management Pros`, `Wedding Coordination Experts`, `Celebration Managers`, `Perfect Day Management`, `Elite Event Services`],
        'rental': [`Elegant Rentals Co.`, `Wedding Essentials Rental`, `Celebration Equipment`, `Perfect Party Rentals`, `Event Rental Specialists`],
        'bar': [`Wedding Bar Services`, `Celebration Cocktails`, `Perfect Pour Co.`, `Elite Bar Setup`, `Wedding Mixology`],
        'setup': [`Event Setup Specialists`, `Wedding Installation Co.`, `Perfect Setup Services`, `Celebration Staging`, `Event Design & Setup`]
      };
      
      // Find the most relevant business name based on service
      const serviceKey = serviceName.toLowerCase();
      let categoryNames: string[] = [];
      
      for (const [key, names] of Object.entries(businessNames)) {
        if (serviceKey.includes(key)) {
          categoryNames = names;
          break;
        }
      }
      
      // Fallback to general wedding services if no specific match
      if (categoryNames.length === 0) {
        categoryNames = [`Wedding Experts Co.`, `Celebration Specialists`, `Perfect Day Services`, `Elite Wedding Co.`, `Dream Wedding Services`];
      }
      
      // Use the sequence number to pick a consistent name
      const nameIndex = parseInt(sequence) % categoryNames.length;
      return categoryNames[nameIndex];
    }
  }
  
  // Return the original name if it doesn't match the generated pattern
  return vendorName;
};

interface ChatVendor {
  name: string;
  service: string;
  vendorId?: string;
  rating?: number;
  verified?: boolean;
  image?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'vendor';
  timestamp: Date;
}

interface Conversation {
  id: string;
  vendor: ChatVendor;
  messages: Message[];
  unreadCount: number;
  lastActivity: Date;
  isTyping?: boolean;
}

interface GlobalMessengerContextType {
  showFloatingChat: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;
  isMinimized: boolean;
  totalUnreadCount: number;
  openFloatingChat: (vendor: ChatVendor) => Promise<void>;
  closeFloatingChat: () => void;
  minimizeChat: () => void;
  expandChat: () => void;
  markAsRead: (conversationId?: string) => void;
  switchConversation: (conversationId: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id'>) => Promise<void>;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  getActiveConversation: () => Conversation | null;
  clearConversations: () => void;
}

const GlobalMessengerContext = createContext<GlobalMessengerContextType | undefined>(undefined);

interface GlobalMessengerProviderProps {
  children: ReactNode;
}

export const GlobalMessengerProvider: React.FC<GlobalMessengerProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Initialize state from localStorage if available
  const [showFloatingChat, setShowFloatingChat] = useState(() => {
    try {
      const saved = localStorage.getItem('wedding-bazaar-chat-visible');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('wedding-bazaar-conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((conv: any) => ({
          ...conv,
          lastActivity: new Date(conv.lastActivity),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
      return [];
    } catch {
      return [];
    }
  });
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('wedding-bazaar-active-conversation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      const saved = localStorage.getItem('wedding-bazaar-chat-minimized');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Clear conversations when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setActiveConversationId(null);
      setShowFloatingChat(false);
      setIsMinimized(false);
      
      // Clear localStorage
      localStorage.removeItem('wedding-bazaar-conversations');
      localStorage.removeItem('wedding-bazaar-active-conversation');
      localStorage.removeItem('wedding-bazaar-chat-visible');
      localStorage.removeItem('wedding-bazaar-chat-minimized');
    }
  }, [isAuthenticated]);

  // Load conversations automatically when user is authenticated OR in development mode
  React.useEffect(() => {
    const loadUserConversations = async () => {
      // In development mode, always try to load conversations even without authentication
      const shouldLoad = isAuthenticated && user?.id;
      const shouldLoadDev = import.meta.env.DEV && !shouldLoad;
      
      if (!shouldLoad && !shouldLoadDev) {
        console.log('🔍 [GlobalMessenger] Skipping conversation load - no auth and not dev mode');
        return;
      }
      
      const currentUserId = user?.id || 'dev-user-vendor';
      const currentUserRole = user?.role || 'vendor';
      
      console.log('🔄 [GlobalMessenger] Loading conversations:', {
        isAuthenticated,
        hasUser: !!user,
        userId: currentUserId,
        userRole: currentUserRole,
        isDev: import.meta.env.DEV
      });
      
      try {
        // If user is a vendor (or in dev mode), load their vendor conversations
        if (currentUserRole === 'vendor') {
          const conversationsData = await MessagingApiService.getConversations(currentUserId);
          
          if (conversationsData && conversationsData.length > 0) {
            console.log('✅ [GlobalMessenger] Found vendor conversations:', conversationsData.length);
            
            // Convert API conversations to GlobalMessenger format
            const safeUser = user || { id: currentUserId, firstName: 'Test', lastName: 'Vendor', email: 'test@example.com' };
            const globalConversations: Conversation[] = conversationsData.map(conv => ({
              id: conv.id,
              vendor: {
                vendorId: safeUser.id,
                name: safeUser.firstName ? `${safeUser.firstName} ${safeUser.lastName}` : safeUser.email,
                service: 'Wedding Services',
                rating: 4.5,
                verified: true,
                image: (safeUser as any).profileImage || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400`
              },
              lastActivity: new Date(conv.updatedAt || conv.createdAt || Date.now()),
              unreadCount: conv.unreadCount || 0,
              messages: conv.lastMessage ? [{
                id: conv.lastMessage.id,
                text: conv.lastMessage.content,
                sender: conv.lastMessage.senderRole === 'vendor' ? 'vendor' : 'user',
                timestamp: new Date(conv.lastMessage.timestamp)
              }] : []
            }));
            
            setConversations(globalConversations);
            
            // If no active conversation but conversations exist, set the first one as active
            if (!activeConversationId && globalConversations.length > 0) {
              setActiveConversationId(globalConversations[0].id);
            }
          }
        }
        // TODO: Add similar logic for couple/admin roles if needed
        
      } catch (error) {
        console.error('💥 [GlobalMessenger] Failed to load conversations:', error);
        
        // Check if this is a 404 error (backend endpoint not found)
        const is404Error = error instanceof Error && (
          error.message.includes('404') || 
          error.message.includes('endpoint not found') ||
          error.message.includes('Messaging API endpoint not available')
        );
        
        console.log('🔍 [GlobalMessenger] Error analysis:', {
          is404Error,
          isDev: import.meta.env.DEV,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          willShowFallback: is404Error && import.meta.env.DEV
        });
        
        // Provide fallback conversations for development/testing when backend endpoints don't exist
        if (is404Error && import.meta.env.DEV) {
          console.log('🔧 [GlobalMessenger] Backend messaging endpoints not available, providing development conversations');
          
          // Create development conversations with safe user handling
          const safeUser = user || { id: 'dev-user', role: 'vendor', firstName: 'Test', lastName: 'Vendor' };
          
          const developmentConversations: Conversation[] = [
            {
              id: 'dev-conversation-1',
              vendor: {
                vendorId: safeUser.role === 'vendor' ? safeUser.id : '2-2025-003',
                name: safeUser.role === 'vendor' ? `${safeUser.firstName || 'Test'} ${safeUser.lastName || 'Vendor'}` : 'Perfect Weddings Co.',
                service: 'Wedding Photography',
                rating: 4.8,
                verified: true,
                image: `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400`
              },
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              unreadCount: 2,
              messages: [
                {
                  id: 'dev-msg-1',
                  text: 'Hi! I\'m interested in your wedding photography services for my June wedding.',
                  sender: safeUser.role === 'vendor' ? 'user' : 'vendor',
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
                },
                {
                  id: 'dev-msg-2',
                  text: 'Hello! I\'d be happy to help with your special day. What date are you planning?',
                  sender: safeUser.role === 'vendor' ? 'vendor' : 'user',
                  timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
                },
                {
                  id: 'dev-msg-3',
                  text: 'We\'re planning for June 15th at Garden Manor. Do you have availability?',
                  sender: safeUser.role === 'vendor' ? 'user' : 'vendor',
                  timestamp: new Date(Date.now() - 30 * 60 * 1000)
                }
              ]
            },
            {
              id: 'dev-conversation-2',
              vendor: {
                vendorId: safeUser.role === 'vendor' ? safeUser.id : '2-2025-004',
                name: safeUser.role === 'vendor' ? `${safeUser.firstName || 'Test'} ${safeUser.lastName || 'Vendor'}` : 'Elegant Events Co.',
                service: 'Wedding Planning',
                rating: 4.6,
                verified: true,
                image: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400`
              },
              lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
              unreadCount: 0,
              messages: [
                {
                  id: 'dev-msg-4',
                  text: 'Thank you for the beautiful wedding planning service! Everything was perfect.',
                  sender: safeUser.role === 'vendor' ? 'user' : 'vendor',
                  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
                },
                {
                  id: 'dev-msg-5',
                  text: 'It was our pleasure! Wishing you both a lifetime of happiness. 💕',
                  sender: safeUser.role === 'vendor' ? 'vendor' : 'user',
                  timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000)
                }
              ]
            }
          ];
          
          setConversations(developmentConversations);
          
          // Set the first conversation as active if none is selected
          if (!activeConversationId && developmentConversations.length > 0) {
            setActiveConversationId(developmentConversations[0].id);
          }
        } else {
          // In production or when it's not a 404, don't add fallback conversations
          setConversations([]);
        }
      }
    };
    
    // Load conversations when conditions are met
    loadUserConversations();
  }, [isAuthenticated, user?.id, user?.role]);

  // Persist state to localStorage
  React.useEffect(() => {
    localStorage.setItem('wedding-bazaar-chat-visible', JSON.stringify(showFloatingChat));
  }, [showFloatingChat]);

  React.useEffect(() => {
    localStorage.setItem('wedding-bazaar-conversations', JSON.stringify(conversations));
  }, [conversations]);

  React.useEffect(() => {
    localStorage.setItem('wedding-bazaar-active-conversation', JSON.stringify(activeConversationId));
  }, [activeConversationId]);

  React.useEffect(() => {
    localStorage.setItem('wedding-bazaar-chat-minimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  // Debug logging for development only
  React.useEffect(() => {
    // Only log in development mode
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MESSENGER) {
      console.log('GlobalMessenger State:', {
        showFloatingChat,
        conversationsCount: conversations.length,
        activeConversationId,
        isMinimized,
        totalUnreadCount
      });
    }
  }, [showFloatingChat, conversations.length, activeConversationId, isMinimized, totalUnreadCount]);

  // Auto-restore chat visibility if there are conversations but chat is not visible
  React.useEffect(() => {
    if (conversations.length > 0 && !showFloatingChat && activeConversationId) {
      setShowFloatingChat(true);
    }
  }, [conversations.length, showFloatingChat, activeConversationId]);

  // Ensure active conversation exists in conversations list
  React.useEffect(() => {      if (activeConversationId && !conversations.find(conv => conv.id === activeConversationId)) {
        setActiveConversationId(null);
      }
  }, [activeConversationId, conversations]);

  const generateConversationId = (vendor: ChatVendor): string => {
    // Use service name and vendor ID to create unique conversation ID
    const serviceKey = vendor.service.replace(/\s+/g, '_').toLowerCase();
    const vendorKey = vendor.vendorId || vendor.name.replace(/\s+/g, '_');
    return `${vendorKey}_${serviceKey}_${Date.now()}`;
  };

  const openFloatingChat = async (vendor: ChatVendor) => {
    // Check if conversation already exists for this vendor and service combination
    const existingConversation = conversations.find(
      conv => conv.vendor.vendorId === vendor.vendorId && conv.vendor.service === vendor.service
    );

    if (existingConversation) {
      // Switch to existing conversation
      setActiveConversationId(existingConversation.id);
      setShowFloatingChat(true);
      setIsMinimized(false);
    } else {
      // Create new conversation with enhanced vendor name
      const conversationId = generateConversationId(vendor);
      const enhancedVendor = {
        ...vendor,
        name: getVendorDisplayName(vendor.name, vendor.service) // Use realistic business name
      };
      
      const newConversation: Conversation = {
        id: conversationId,
        vendor: enhancedVendor,
        messages: [{
          id: `${conversationId}_initial`,
          text: `Hi! I'm interested in your "${vendor.service}" service. Could you provide more details about pricing, availability, and what's included?`,
          sender: 'user',
          timestamp: new Date()
        }],
        unreadCount: 0,
        lastActivity: new Date(),
        isTyping: false
      };

      setConversations(prev => {
        const updated = [...prev, newConversation];
        console.log('Updated conversations:', updated);
        return updated;
      });
      setActiveConversationId(conversationId);
      setShowFloatingChat(true);
      setIsMinimized(false);

      // Create conversation in database if user is authenticated
      if (user?.id) {
        try {
          await MessagingApiService.createConversation({
            conversationId,
            vendorId: vendor.vendorId || 'unknown',
            vendorName: enhancedVendor.name, // Use the enhanced name for database
            serviceName: vendor.service,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`.trim() || user.email || 'User',
            userType: 'couple'
          });
          console.log('Conversation created in database successfully');
        } catch (error) {
          console.error('Failed to create conversation in database:', error);
          // Continue with local conversation even if database creation fails
        }
      }

      // Simulate vendor response
      setTimeout(() => {
        addMessage(conversationId, {
          text: `Hello! Thank you for your interest in our "${vendor.service}" service. I'd be happy to discuss the details with you. We offer comprehensive packages that can be customized to your needs. What specific information would you like to know about our ${vendor.service.toLowerCase()} services?`,
          sender: 'vendor',
          timestamp: new Date()
        });
      }, 2000);
    }
  };

  const closeFloatingChat = () => {
    setShowFloatingChat(false);
    setActiveConversationId(null); // Clear active conversation to prevent auto-restore
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
    // Keep showFloatingChat true so the minimized bubble shows
  };

  const expandChat = () => {
    setIsMinimized(false);
    setShowFloatingChat(true); // Ensure it's visible when expanding
    // Mark active conversation as read when expanding
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  };

  const markAsRead = (conversationId?: string) => {
    const targetId = conversationId || activeConversationId;
    if (!targetId) return;

    setConversations(prev => 
      prev.map(conv => 
        conv.id === targetId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const switchConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    markAsRead(conversationId);
  };

  const addMessage = async (conversationId: string, message: Omit<Message, 'id'>) => {
    const messageWithId: Message = {
      ...message,
      id: `${conversationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Update local state immediately for responsive UI
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            messages: [...conv.messages, messageWithId],
            lastActivity: new Date(),
            isTyping: false
          };

          // Increment unread count if message is from vendor and chat is minimized or not active
          if (message.sender === 'vendor' && (isMinimized || activeConversationId !== conversationId)) {
            updatedConv.unreadCount += 1;
          }

          return updatedConv;
        }
        return conv;
      })
    );

    // Send to database if user is sending the message
    if (message.sender === 'user' && user?.id) {
      try {
        // First, check if conversation exists in database, if not create it
        const activeConv = conversations.find(conv => conv.id === conversationId);
        if (activeConv) {
          // Try to create conversation in database first (in case it doesn't exist)
          try {
            await MessagingApiService.createConversation({
              conversationId,
              vendorId: activeConv.vendor.vendorId || 'unknown',
              vendorName: activeConv.vendor.name,
              serviceName: activeConv.vendor.service,
              userId: user.id,
              userName: `${user.firstName} ${user.lastName}`.trim() || user.email || 'User',
              userType: 'couple'
            });
          } catch (createError) {
            // Conversation might already exist, which is fine
            console.log('Conversation creation skipped (may already exist):', createError);
          }
        }

        // Now send the message
        await MessagingApiService.sendMessage(
          conversationId,
          message.text,
          user.id,
          `${user.firstName} ${user.lastName}`.trim() || user.email || 'User',
          'couple'
        );
        console.log('Message sent to database successfully');
      } catch (error) {
        console.error('Failed to send message to database:', error);
        // In a production app, you might want to show an error message or retry
      }
    }
  };

  const setTypingStatus = (conversationId: string, isTyping: boolean) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, isTyping }
          : conv
      )
    );
  };

  const getActiveConversation = (): Conversation | null => {
    if (!activeConversationId) return null;
    return conversations.find(conv => conv.id === activeConversationId) || null;
  };

  const clearConversations = () => {
    setConversations([]);
    setActiveConversationId(null);
    setShowFloatingChat(false);
    setIsMinimized(false);
    
    // Clear localStorage
    localStorage.removeItem('wedding-bazaar-conversations');
    localStorage.removeItem('wedding-bazaar-active-conversation');
    localStorage.removeItem('wedding-bazaar-chat-visible');
    localStorage.removeItem('wedding-bazaar-chat-minimized');
    
    console.log('GlobalMessengerContext: Conversations cleared on logout');
  };

  const value: GlobalMessengerContextType = {
    showFloatingChat,
    conversations,
    activeConversationId,
    isMinimized,
    totalUnreadCount,
    openFloatingChat,
    closeFloatingChat,
    minimizeChat,
    expandChat,
    markAsRead,
    switchConversation,
    addMessage,
    setTypingStatus,
    getActiveConversation,
    clearConversations
  };

  return (
    <GlobalMessengerContext.Provider value={value}>
      {children}
    </GlobalMessengerContext.Provider>
  );
};

export const useGlobalMessenger = (): GlobalMessengerContextType => {
  const context = useContext(GlobalMessengerContext);
  if (!context) {
    throw new Error('useGlobalMessenger must be used within a GlobalMessengerProvider');
  }
  return context;
};
