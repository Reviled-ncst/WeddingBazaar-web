import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minus,
  Phone,
  Video,
  Search,
  Users,
  ArrowLeft,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUniversalMessaging } from '../../contexts/UniversalMessagingContext';

export const UniversalFloatingChat: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    currentUser,
    showFloatingChat,
    isMinimized,
    unreadCount,
    sendMessage,
    openConversation,
    closeChat,
    minimizeChat,
    expandChat,
    getOtherParticipants,
    getConversationTitle,
    getMessages
  } = useUniversalMessaging();

  const [message, setMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? getMessages(activeConversation.id) : [];
  const filteredConversations = conversations.filter(conv =>
    searchTerm === '' || 
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]); // Changed from activeConversation?.lastMessage to messages.length

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversationId) return;

    try {
      await sendMessage(activeConversationId, message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDisplayInfo = () => {
    if (!currentUser) return { name: 'Not authenticated', status: 'Please log in' };
    
    if (conversations.length === 0) {
      return { 
        name: 'No Conversations', 
        status: currentUser.role === 'vendor' ? 'Waiting for inquiries' : 'Start a conversation' 
      };
    }
    
    if (activeConversation) {
      const otherParticipants = getOtherParticipants(activeConversation.id);
      const displayName = otherParticipants.length > 0 
        ? otherParticipants[0].name 
        : activeConversation.title || 'Conversation';
      
      return { 
        name: displayName,
        status: otherParticipants.length > 0 && otherParticipants[0].isOnline ? 'Online' : 'Offline'
      };
    }
    
    return { 
      name: `${conversations.length} Conversations`, 
      status: unreadCount > 0 ? `${unreadCount} unread` : 'All read' 
    };
  };

  if (!currentUser || !showFloatingChat) {
    return null;
  }

  const displayInfo = getDisplayInfo();

  return (
    <div className={cn(
      "fixed right-6 z-[9998]",
      isMinimized ? "bottom-32" : "bottom-6"
    )}>
      <AnimatePresence>
        {isMinimized ? (
          // Minimized chat bubble
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "relative bg-white rounded-full p-1 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105",
              "border-rose-500"
            )}
            onClick={expandChat}
            title={`Chat - ${displayInfo.name}`}
          >
            <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            
            {/* Unread indicator */}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}

            {/* Role indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500">
              {currentUser.role === 'vendor' ? 'V' : currentUser.role === 'admin' ? 'A' : 'C'}
            </div>
          </motion.div>
        ) : (
          // Expanded chat window
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{ width: '400px', height: '600px' }}
          >
            {showConversationList ? (
              // Conversation list view
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Messages</h3>
                      <p className="text-xs text-rose-100">
                        {currentUser.role === 'vendor' ? 'Customer Inquiries' : 'Vendor Conversations'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={minimizeChat}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Minimize"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={closeChat}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {currentUser.role === 'vendor' 
                          ? 'Customers will appear here when they contact you'
                          : 'Start a conversation with vendors from their service pages'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherParticipants = getOtherParticipants(conversation.id);
                      const participant = otherParticipants[0];
                      
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => {
                            openConversation(conversation.id);
                            setShowConversationList(false);
                          }}
                          className={cn(
                            "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                            conversation.id === activeConversationId && "bg-rose-50 border-rose-200"
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <img
                                src={participant?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'}
                                alt={participant?.name || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {participant?.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                              {/* Role badge */}
                              <div className={cn(
                                "absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold text-white flex items-center justify-center",
                                participant?.role === 'vendor' && "bg-blue-500",
                                participant?.role === 'couple' && "bg-green-500",
                                participant?.role === 'admin' && "bg-purple-500"
                              )}>
                                {participant?.role === 'vendor' ? 'V' : participant?.role === 'admin' ? 'A' : 'C'}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {conversation.title || 'Conversation'}
                                </h3>
                                <div className="flex items-center space-x-1">
                                  {conversation.unreadCount > 0 && (
                                    <span className="bg-rose-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Service info for vendors */}
                              {conversation.serviceInfo && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                    {conversation.serviceInfo.category}
                                  </span>
                                </div>
                              )}
                              
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.lastMessage.senderRole === currentUser.role ? 'You: ' : ''}
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : activeConversation ? (
              // Single conversation view
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowConversationList(true)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Back to conversations"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="relative">
                      {getOtherParticipants(activeConversation.id)[0]?.avatar && (
                        <img
                          src={getOtherParticipants(activeConversation.id)[0].avatar}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm">
                        {getConversationTitle(activeConversation.id)}
                      </h3>
                      <p className="text-xs text-rose-100">
                        {displayInfo.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Video call"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                    <button
                      onClick={minimizeChat}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Minimize"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={closeChat}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.senderRole === currentUser?.role ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm",
                            message.senderRole === currentUser?.role
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          )}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={cn(
                              "text-xs",
                              message.senderRole === currentUser?.role ? "text-rose-100" : "text-gray-500"
                            )}>
                              {formatTime(message.timestamp)}
                            </p>
                            {message.senderRole === currentUser?.role && (
                              <div className="ml-2">
                                {message.failed ? (
                                  <AlertCircle className="h-3 w-3 text-red-200" />
                                ) : message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-rose-200" />
                                ) : (
                                  <Check className="h-3 w-3 text-rose-200" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Start your conversation</p>
                      <p className="text-sm text-gray-400 mt-1">Send a message to begin</p>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-gray-50 focus:bg-white transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      title="Send message"
                      className={cn(
                        "p-2 rounded-full transition-all duration-200",
                        message.trim()
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-lg"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // No conversation selected - show list
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Messages</h3>
                      <p className="text-xs text-rose-100">{displayInfo.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={minimizeChat}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Minimize"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={closeChat}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600 mb-4">
                      {conversations.length > 0 
                        ? 'Choose a conversation to start messaging'
                        : currentUser.role === 'vendor'
                        ? 'Customers will appear here when they contact you'
                        : 'Start conversations with vendors from their service pages'
                      }
                    </p>
                    {conversations.length > 0 && (
                      <button
                        onClick={() => setShowConversationList(true)}
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
                      >
                        View Conversations
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
