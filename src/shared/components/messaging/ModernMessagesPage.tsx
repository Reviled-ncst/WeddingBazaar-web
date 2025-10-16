import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Send,
  User,
  Heart,
  Sparkles,
  Clock,
  CheckCheck,
  Phone,
  Video,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { useAuth } from '../../contexts/HybridAuthContext';

interface ModernMessagesPageProps {
  userType: 'vendor' | 'couple' | 'admin';
}

export const ModernMessagesPage: React.FC<ModernMessagesPageProps> = ({ userType }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    loadConversations,
    loadMessages,
    sendMessage,
    setActiveConversation,
    markAsRead,
    unreadCount
  } = useUnifiedMessaging();

  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [visibleMessageCount, setVisibleMessageCount] = useState(50); // Limit visible messages
  const [showLoadMore, setShowLoadMore] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    console.log('🎯 [ModernMessagesPage] Component mounted, loading conversations...');
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);
      markAsRead(activeConversation.id);
      setVisibleMessageCount(50); // Reset visible count for new conversation
    }
  }, [activeConversation?.id, loadMessages, markAsRead]);

  // Check if we need to show "Load More" button
  useEffect(() => {
    if (messages && messages.length > visibleMessageCount) {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }
  }, [messages, visibleMessageCount]);

  // Filter conversations based on search
  const filteredConversations = (conversations || []).filter(conv => {
    if (!searchTerm) return true;
    
    // Search in participant names
    const participantNames = Object.values(conv.participantNames || {}).join(' ').toLowerCase();
    return participantNames.includes(searchTerm.toLowerCase());
  });

  const handleConversationClick = (conversationId: string) => {
    // Reset message count to ensure proper scroll behavior for new conversation
    previousMessageCountRef.current = 0;
    setActiveConversation(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation?.id || sending) return;

    await sendMessage(activeConversation.id, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadMoreMessages = () => {
    setVisibleMessageCount(prev => prev + 30); // Load 30 more messages
  };

  // Get visible messages (slice to limit rendering)
  const getVisibleMessages = () => {
    if (!messages || messages.length <= visibleMessageCount) {
      return messages || [];
    }
    // Show the most recent messages up to the visible count
    return messages.slice(-visibleMessageCount);
  };

  const visibleMessages = getVisibleMessages();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Memoized function to prevent excessive re-renders
  const getOtherParticipantName = useMemo(() => {
    const nameCache = new Map<string, string>();
    
    return (conv: any): string => {
      if (!conv || !conv.id) return 'Unknown';
      
      // Use cache to prevent excessive logging and computation
      if (nameCache.has(conv.id)) {
        return nameCache.get(conv.id)!;
      }
      
      let participantName = 'Unknown';
      
      // For vendors: Show client name (the individual/couple)
      if (userType === 'vendor') {
        console.log('🔍 [VENDOR DEBUG] Conversation data for client name resolution:', {
          conversationId: conv.id,
          creatorId: conv.creator_id,
          currentUserId: user?.id,
          creatorName: conv.creator_name,
          creatorFirstName: conv.creator_first_name,
          creatorLastName: conv.creator_last_name,
          creatorEmail: conv.creator_email,
          participantId: conv.participant_id,
          participantName: conv.participant_name,
          participantType: conv.participant_type,
          serviceName: conv.service_name,
          fullObject: conv
        });
        
        // For backend data, the conversation structure is:
        // - creator_id: the client (couple/individual)
        // - participant_id: the vendor
        // Since this is a vendor view, we want to show the client name
        
        let clientName = '';
        let clientEmail = '';
        let clientId = '';
        
        // In the current backend structure, the vendor is always the participant
        // and the client is always the creator
        if (conv.creator_id && conv.creator_id !== user?.id) {
          // The creator is the client
          clientId = conv.creator_id;
          
          // Try to get client name from enhanced fields (if backend provides them)
          if (conv.creator_name) {
            clientName = conv.creator_name;
          } else if (conv.creator_first_name && conv.creator_last_name) {
            clientName = `${conv.creator_first_name} ${conv.creator_last_name}`;
          } else if (conv.creator_email) {
            clientEmail = conv.creator_email;
          }
          
          // TEMPORARY: Use known user data for the existing conversation
          // TODO: Replace with proper user lookup API call
          if (clientId === '1-2025-001') {
            clientName = 'couple1 one'; // Known from database
            clientEmail = 'couple1@gmail.com';
          }
        }
        
        // Use the best available client identifier
        if (clientName && clientName.trim() && clientName !== 'undefined' && clientName !== 'null') {
          participantName = clientName.trim();
        } else if (clientEmail && clientEmail.trim() && clientEmail !== 'undefined' && clientEmail !== 'null') {
          // Extract name from email if possible
          const emailName = clientEmail.split('@')[0];
          if (emailName.includes('.')) {
            const nameParts = emailName.split('.');
            participantName = nameParts.map(part => 
              part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            ).join(' ');
          } else {
            participantName = emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
          }
        } else if (clientId) {
          // Create meaningful name from client ID
          const idParts = clientId.split('-');
          let idSuffix = '';
          
          if (idParts.length >= 3) {
            // Format: "1-2025-001" -> "Wedding Client 001 (2025)"
            idSuffix = `${idParts[2]} (${idParts[1]})`;
          } else {
            // Fallback: use last 3 characters
            idSuffix = clientId.slice(-3).padStart(3, '0');
          }
          
          if (conv.service_name && conv.service_name !== 'General Inquiry') {
            participantName = `${conv.service_name} Client ${idSuffix}`;
          } else {
            participantName = `Wedding Client ${idSuffix}`;
          }
        } else {
          // Ultimate fallback
          participantName = 'Wedding Client';
        }
        
        console.log('✅ [VENDOR DEBUG] Resolved client name:', participantName);
      }
      
      // For individuals/couples: Show vendor business name
      else if (userType === 'couple') {
        // Backend API format: participant_name contains the vendor business name
        if (conv.participant_name && conv.participant_type === 'vendor') {
          participantName = conv.participant_name;
        } else if (conv.creator_name && conv.creator_type === 'vendor') {
          participantName = conv.creator_name;
        } else if (conv.vendor_business_name) {
          participantName = conv.vendor_business_name;
        } else if (conv.businessContext?.vendorBusinessName) {
          participantName = conv.businessContext.vendorBusinessName;
        }
        
        // Fallback for couples
        if (participantName === 'Unknown') {
          participantName = 'Wedding Vendor';
        }
      }
      
      // Admin or fallback
      else {
        if (conv.participant_name) {
          participantName = conv.participant_name;
        } else if (conv.creator_name) {
          participantName = conv.creator_name;
        } else if (conv.service_name) {
          participantName = conv.service_name;
        } else {
          participantName = 'Conversation';
        }
      }
      
      // Cache the result
      nameCache.set(conv.id, participantName);
      return participantName;
    };
  }, [userType, user?.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);

  // Smart auto-scroll: only scroll within messages container, not the whole page
  useEffect(() => {
    if (!messagesEndRef.current || !messagesContainerRef.current || !visibleMessages) return;

    const currentMessageCount = visibleMessages.length;
    const previousMessageCount = previousMessageCountRef.current;
    const totalMessages = messages?.length || 0;

    // Only auto-scroll if:
    // 1. Messages were just loaded for the first time (go to bottom immediately)
    // 2. New messages were added (currentCount > previousCount)
    // 3. We're showing the most recent messages (not browsing history)
    const isShowingLatest = !messages || visibleMessageCount >= totalMessages;
    
    if ((previousMessageCount === 0 || currentMessageCount > previousMessageCount) && isShowingLatest) {
      // Use timeout to ensure DOM has updated
      setTimeout(() => {
        if (messagesContainerRef.current && messagesEndRef.current) {
          // Scroll within the messages container, not the whole page
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [visibleMessages, visibleMessageCount, messages]);

  const getDateSeparator = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-rose-50 via-white to-pink-50 relative overflow-hidden h-full w-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-rose-200/20 to-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-100/10 to-rose-100/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Conversations Sidebar */}
      <div className="w-1/3 backdrop-blur-xl bg-white/85 border-r border-pink-100/60 flex flex-col shadow-2xl relative z-10 h-full">
        {/* Header */}
        <div className="p-6 border-b border-pink-100/50 bg-gradient-to-r from-pink-50/60 to-rose-50/60 backdrop-blur-sm relative overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute top-4 right-4 text-pink-300"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-4 w-4" />
            </motion.div>
            <motion.div 
              className="absolute bottom-2 left-8 text-rose-300"
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -10, 10, 0],
                scale: [1, 0.9, 1] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Sparkles className="h-3 w-3" />
            </motion.div>
          </div>
          
          <motion.div 
            className="flex items-center justify-between mb-6 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-pink-800 bg-clip-text text-transparent flex items-center">
              <div className="relative mr-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageSquare className="h-7 w-7 text-pink-500" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-3 w-3 text-pink-400" />
                </motion.div>
              </div>
              Messages
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span 
                    className="ml-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-xs px-3 py-1 rounded-full shadow-lg border border-pink-200"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </h1>
          </motion.div>
          
          {/* Search */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-pink-100 rounded-2xl focus:ring-4 focus:ring-pink-200/50 focus:border-pink-300 transition-all duration-300 text-gray-700 placeholder-pink-300"
            />
          </motion.div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <motion.div 
              className="p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative mx-auto mb-4 w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
                <Heart className="absolute inset-0 m-auto h-5 w-5 text-pink-500 animate-pulse" />
              </div>
              <p className="text-pink-600 font-medium">Loading your conversations...</p>
            </motion.div>
          ) : filteredConversations.length === 0 ? (
            <motion.div 
              className="p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-pink-400" />
                <Sparkles className="h-4 w-4 text-pink-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {loading ? 'Loading conversations...' : 'No conversations yet'}
              </h3>
              <p className="text-pink-500 text-sm">
                {loading 
                  ? 'Please wait while we connect to the messaging server...' 
                  : 'Start your wedding planning journey by messaging vendors from the Services page!'
                }
              </p>
              {!loading && (
                <motion.button
                  onClick={() => window.location.href = '/individual/services'}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Wedding Services
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="p-2">
              <AnimatePresence>
                {filteredConversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className={`m-2 p-4 rounded-3xl cursor-pointer transition-all duration-300 group relative overflow-hidden ${
                      activeConversation?.id === conversation.id 
                        ? 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 shadow-xl border-2 border-pink-300 ring-4 ring-pink-200/30' 
                        : 'bg-white/70 backdrop-blur-md hover:bg-white/90 hover:shadow-lg border border-pink-100 hover:border-pink-200'
                    }`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      scale: 1.03,
                      y: -2,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Gradient overlay for active conversation */}
                    {activeConversation?.id === conversation.id && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-pink-200/20 to-rose-200/20 rounded-3xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    {/* Floating sparkle for active conversation */}
                    {activeConversation?.id === conversation.id && (
                      <motion.div 
                        className="absolute top-2 right-2 text-pink-400"
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.2, 1] 
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    )}
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className="relative">
                        <motion.div 
                          className="w-16 h-16 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/50"
                          whileHover={{ 
                            scale: 1.1,
                            rotate: 5,
                            boxShadow: "0 10px 25px -3px rgba(236, 72, 153, 0.3)"
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {getOtherParticipantName(conversation).charAt(0).toUpperCase()}
                          
                          {/* Inner glow effect */}
                          <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                        </motion.div>
                        
                        {conversation.unreadCount > 0 && (
                          <motion.div 
                            className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.2 }}
                          >
                            <span className="text-white text-xs font-bold">{conversation.unreadCount}</span>
                          </motion.div>
                        )}
                        
                        {/* Online indicator */}
                        <motion.div 
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <motion.h3 
                            className="font-bold text-gray-800 truncate group-hover:text-pink-600 transition-colors text-lg"
                            whileHover={{ x: 2 }}
                          >
                            {getOtherParticipantName(conversation)}
                          </motion.h3>
                          {conversation.lastMessage && (
                            <div className="flex items-center space-x-1 text-xs text-pink-500 bg-pink-50 px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">{formatTime(conversation.lastMessage.timestamp)}</span>
                            </div>
                          )}
                        </div>
                        
                        {conversation.lastMessage ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate flex-1 leading-relaxed">
                              {conversation.lastMessage.content}
                            </p>
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CheckCheck className="h-4 w-4 text-pink-400 ml-2" />
                            </motion.div>
                          </div>
                        ) : (
                          <motion.p 
                            className="text-sm text-pink-500 italic flex items-center font-medium"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Heart className="h-3 w-3 mr-1 animate-pulse" />
                            Start your wedding conversation
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {activeConversation ? (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <motion.div 
              className="p-4 border-b border-pink-100/50 bg-gradient-to-r from-white/90 to-pink-50/90 backdrop-blur-lg shadow-sm flex-shrink-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                    {getOtherParticipantName(activeConversation).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-800 truncate">
                      {getOtherParticipantName(activeConversation)}
                    </h2>
                    <div className="flex items-center space-x-2 text-xs text-pink-600">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        {userType === 'vendor' 
                          ? `Wedding Client ${activeConversation?.businessContext?.serviceType ? `• ${activeConversation.businessContext.serviceType}` : ''}`
                          : `Wedding Service ${messages?.length ? `• ${messages.length} messages` : ''}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <motion.button 
                    aria-label="View conversation details"
                    className="p-2 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="h-4 w-4 text-pink-500 group-hover:text-pink-600" />
                  </motion.button>
                  <motion.button 
                    aria-label="Search messages"
                    className="p-2 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="h-4 w-4 text-pink-500 group-hover:text-pink-600" />
                  </motion.button>
                  <motion.button 
                    aria-label="More options"
                    className="p-2 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MoreHorizontal className="h-4 w-4 text-pink-500 group-hover:text-pink-600" />
                  </motion.button>
                </div>
              </div>
              
              {/* Service Info Bar (for individuals) */}
              {(userType === 'couple') && activeConversation?.businessContext?.serviceType && (
                <motion.div 
                  className="mt-3 p-2 bg-pink-50/80 rounded-lg border border-pink-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-pink-500" />
                      <span className="font-medium text-pink-700">
                        Service: {activeConversation.businessContext.serviceType}
                      </span>
                    </div>
                    {activeConversation.businessContext.vendorBusinessName && (
                      <span className="text-pink-600 font-medium">
                        by {activeConversation.businessContext.vendorBusinessName}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Client Info Bar (for vendors) */}
              {userType === 'vendor' && (
                <motion.div 
                  className="mt-3 p-2 bg-pink-50/80 rounded-lg border border-pink-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span className="font-medium text-pink-700">
                        Wedding Planning Conversation
                      </span>
                    </div>
                    <span className="text-pink-600 font-medium">
                      Started {activeConversation?.createdAt ? new Date(activeConversation.createdAt).toLocaleDateString() : 'recently'}
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef} 
              className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-white/20 to-pink-50/20 min-h-0 scroll-smooth overscroll-contain scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-100 hover:scrollbar-thumb-pink-400"
            >
              {!messages || messages.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-pink-400" />
                    <Heart className="h-6 w-6 text-pink-300 absolute -top-2 -right-2 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to start planning?</h3>
                  <p className="text-pink-500">Send your first message to begin this wonderful conversation!</p>
                </motion.div>
              ) : (
                <div className="space-y-6 pb-4">
                  {/* Load More Button */}
                  {showLoadMore && (
                    <motion.div 
                      className="text-center py-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={handleLoadMoreMessages}
                        className="px-6 py-3 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-600 font-medium rounded-full border border-pink-200 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        Load Previous Messages ({messages?.length - visibleMessageCount} more)
                      </button>
                    </motion.div>
                  )}
                  
                  {visibleMessages.map((message, index) => {
                    const isFromCurrentUser = message.senderId === user?.id;
                    const showDateSeparator = index === 0 || 
                      getDateSeparator(message.timestamp) !== getDateSeparator(visibleMessages[index - 1]?.timestamp);
                    
                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <motion.div 
                            className="flex items-center justify-center my-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-100 shadow-sm">
                              <span className="text-xs font-medium text-pink-600">
                                {getDateSeparator(message.timestamp)}
                              </span>
                            </div>
                          </motion.div>
                        )}
                        
                        <motion.div
                          className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <div className={`flex items-end max-w-xs lg:max-w-md ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isFromCurrentUser && (
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full flex items-center justify-center mr-3 mb-1 shadow-sm">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                            
                            <motion.div
                              className={`px-6 py-3 rounded-3xl shadow-lg backdrop-blur-sm ${
                                isFromCurrentUser
                                  ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white ml-3'
                                  : 'bg-white/80 text-gray-800 border border-pink-100'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {message.content}
                              </p>
                              <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                isFromCurrentUser ? 'text-pink-100' : 'text-pink-400'
                              }`}>
                                <Clock className="h-3 w-3" />
                                <span className="text-xs font-medium">
                                  {formatTime(message.timestamp)}
                                </span>
                                {isFromCurrentUser && <CheckCheck className="h-3 w-3" />}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <motion.div 
              className="p-6 border-t border-pink-100/60 bg-gradient-to-r from-white/95 via-pink-50/50 to-rose-50/30 backdrop-blur-xl relative overflow-hidden flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Floating decoration */}
              <motion.div 
                className="absolute top-2 right-4 text-pink-300"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-3 w-3" />
              </motion.div>
              <div className="flex items-end space-x-4">
                <button 
                  aria-label="Attach file"
                  className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                >
                  <Paperclip className="h-5 w-5 text-pink-500 group-hover:text-pink-600" />
                </button>
                
                <button 
                  aria-label="Attach image"
                  className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                >
                  <ImageIcon className="h-5 w-5 text-pink-500 group-hover:text-pink-600" />
                </button>
                
                <div className="flex-1 relative">
                  <motion.textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Share your wedding dreams with ${getOtherParticipantName(activeConversation)}...`}
                    className="w-full px-6 py-4 bg-white/80 backdrop-blur-md border-2 border-pink-100 rounded-3xl focus:ring-4 focus:ring-pink-200/60 focus:border-pink-400 transition-all duration-300 resize-none text-gray-700 placeholder-pink-400 font-medium shadow-inner"
                    rows={1}
                    disabled={sending}
                    whileFocus={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 25px -3px rgba(236, 72, 153, 0.2)"
                    }}
                  />
                  
                  {/* Typing indicator glow */}
                  {newMessage && (
                    <motion.div 
                      className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-200/30 to-rose-200/30 -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
                
                <button 
                  aria-label="Add emoji"
                  className="p-3 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
                >
                  <Smile className="h-5 w-5 text-pink-500 group-hover:text-pink-600" />
                </button>
                
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                    newMessage.trim() && !sending
                      ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white hover:from-pink-600 hover:via-pink-700 hover:to-rose-600 hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {sending ? (
                    <div className="w-6 h-6 relative">
                      <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <motion.div 
              className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-50/30 to-rose-50/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
            <div className="text-center">
              <div className="relative mx-auto mb-8 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center shadow-lg">
                <MessageSquare className="h-16 w-16 text-pink-400" />
                <Heart className="h-8 w-8 text-pink-300 absolute -top-2 -right-2 animate-pulse" />
                <Sparkles className="h-6 w-6 text-pink-300 absolute -bottom-2 -left-2 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Your Wedding Conversations</h3>
              <p className="text-pink-500 text-lg max-w-md mx-auto">
                Select a conversation to continue planning your perfect wedding day! 💕
              </p>
            </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMessagesPage;
