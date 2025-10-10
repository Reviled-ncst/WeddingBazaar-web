import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minus,
  Phone,
  Video,
  Users,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { useAuth } from '../../contexts/AuthContext';

export const GlobalFloatingChat: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { 
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isFloatingChatOpen,
    setFloatingChatOpen,
    sendMessage,
    markAsRead,
    setActiveConversation,
    loadMessages
  } = useUnifiedMessaging();
  
  const [message, setMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = getActiveConversation();
  const isVendorTyping = activeConversation?.isTyping || false;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversationId) return;

    try {
      await addMessage(activeConversationId, {
        text: message,
        sender: 'user',
        timestamp: new Date()
      });

      setMessage('');

      // Show typing indicator
      setTypingStatus(activeConversationId, true);

      // Simulate vendor response
      setTimeout(async () => {
        setTypingStatus(activeConversationId, false);
        
        const responses = [
          "That's a great question! Let me get back to you with those details.",
          "I'd be happy to help with that. When are you planning your event?",
          "Absolutely! I can provide more information about that service.",
          "Thank you for reaching out. I'll send you a detailed proposal soon."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        try {
          await addMessage(activeConversationId, {
            text: randomResponse,
            sender: 'vendor',
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Failed to send vendor response:', error);
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show an error message to the user here
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
    if (conversations.length === 0) {
      return { name: 'No Conversations', status: 'Start a chat' };
    }
    
    if (conversations.length === 1) {
      const conv = conversations[0];
      return { 
        name: conv.vendor.service, // Show service name instead of vendor name
        status: isVendorTyping ? 'Typing...' : `with ${conv.vendor.name}` // Show vendor name in status
      };
    }
    
    if (activeConversation) {
      return { 
        name: activeConversation.vendor.service, // Show service name instead of vendor name
        status: isVendorTyping ? 'Typing...' : `with ${activeConversation.vendor.name}` // Show vendor name in status
      };
    }
    
    return { 
      name: `${conversations.length} Conversations`, 
      status: totalUnreadCount > 0 ? `${totalUnreadCount} unread` : 'All read' 
    };
  };

  const handleConversationSelect = (conversationId: string) => {
    switchConversation(conversationId);
    setShowConversationList(false);
  };

  // Debug logging for development only
  React.useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MESSENGER) {
      console.log('GlobalFloatingChat render state:', {
        showFloatingChat,
        conversations: conversations.length,
        activeConversationId,
        isMinimized,
        activeConversation: activeConversation ? activeConversation.vendor.name : 'none'
      });
    }
  }, [showFloatingChat, conversations.length, activeConversationId, isMinimized, activeConversation]);

  // Don't show if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (!showFloatingChat) {
    return null;
  }

  const displayInfo = getDisplayInfo();

  return (
    <div className={cn(
      "fixed right-6 z-[9998]",
      isMinimized ? "bottom-32" : "bottom-6" // Moved minimized chat bubble higher
    )}>
      {/* Chat Head - compact bubble when minimized, expanded info when chat is open */}
      {isMinimized ? (
        // Minimized: Just a compact chat head bubble
        <div 
          className={cn(
            "relative bg-white rounded-full p-1 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:scale-105",
            isVendorTyping ? "border-green-400 animate-pulse" : "border-rose-500"
          )}
          onClick={() => {
            expandChat();
            if (activeConversationId) markAsRead(activeConversationId);
          }}
          title={`Chat with ${displayInfo.name}`}
        >
          <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          {/* Status indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white transition-colors",
            isVendorTyping ? "bg-yellow-400 animate-bounce" : "bg-green-400"
          )}></div>
          {/* Unread indicator */}
          {totalUnreadCount > 0 && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-bold text-white">{totalUnreadCount > 9 ? '9+' : totalUnreadCount}</span>
            </div>
          )}
        </div>
      ) : (
        // Expanded: Chat head with vendor info above chat window
        <div className="mb-4 flex justify-end">
          <div className={cn(
            "bg-white rounded-full p-2 shadow-lg border-2 flex items-center space-x-3 transition-all duration-300 cursor-pointer max-w-xs",
            isVendorTyping ? "border-green-400 animate-pulse" : "border-rose-500"
          )}
          onClick={minimizeChat}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-colors",
                isVendorTyping ? "bg-yellow-400 animate-bounce" : "bg-green-400"
              )}></div>
            </div>
            <div className="pr-2">
              <p className="text-sm font-semibold text-gray-900">{displayInfo.name}</p>
              <p className={cn(
                "text-xs transition-colors",
                isVendorTyping ? "text-green-600 font-medium" : "text-gray-500"
              )}>
                {displayInfo.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window - only show when not minimized */}
      {!isMinimized && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 overflow-hidden w-96 h-[500px]">
          {/* Show conversation list if multiple conversations and list is toggled */}
          {showConversationList && conversations.length > 1 ? (
            <div className="h-full flex flex-col">
              {/* Conversation List Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowConversationList(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    title="Back to chat"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h4 className="font-semibold text-sm">Your Conversations</h4>
                    <p className="text-xs text-rose-100">{conversations.length} active chats</p>
                  </div>
                </div>
                <button
                  onClick={closeFloatingChat}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={cn(
                      "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                      conversation.id === activeConversationId && "bg-rose-50 border-rose-200"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        {conversation.isTyping && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-bounce"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">{conversation.vendor.service}</p>
                          {conversation.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{conversation.unreadCount}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">with {conversation.vendor.name}</p>
                        {conversation.messages.length > 0 && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {conversation.messages[conversation.messages.length - 1].text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Regular chat view
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{displayInfo.name}</h4>
                    <p className="text-xs text-rose-100">{displayInfo.status}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {conversations.length > 1 && (
                    <button
                      onClick={() => setShowConversationList(true)}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                      title="Show all conversations"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={minimizeChat}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Minimize chat"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={closeFloatingChat}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {!activeConversation || activeConversation.messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm mt-16">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">Start a conversation</p>
                    <p className="text-xs">with {displayInfo.name}</p>
                  </div>
                ) : (
                  activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm",
                          msg.sender === 'user'
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                            : "bg-white text-gray-900 border border-gray-200"
                        )}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          msg.sender === 'user' ? "text-rose-100" : "text-gray-500"
                        )}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Typing indicator */}
                {isVendorTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 border border-gray-200 rounded-xl px-4 py-2 text-sm shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t border-gray-200 bg-white">
                <div className="flex space-x-2 mb-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Make a call">
                    <Phone className="h-3 w-3" />
                    <span>Call</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Start video call">
                    <Video className="h-3 w-3" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
