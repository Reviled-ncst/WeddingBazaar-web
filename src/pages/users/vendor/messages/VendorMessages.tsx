import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Users, 
  Phone, 
  Video,
  MoreVertical,
  Star,
  Clock,
  CheckCheck,
  AlertCircle,
  Plus,
  Send,
  Paperclip,
  Smile,
  Image,
  Mic
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useMessagingData } from '../../../../hooks/useMessagingData';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { cn } from '../../../../utils/cn';

export const VendorMessages: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  
  // Use real messaging data - hardcoded vendor ID for now
  const vendorId = '2-2025-003'; // This should come from user.vendorId or similar
  const {
    conversations,
    messages,
    loading,
    error,
    refreshConversations,
    loadMessages,
    sendMessage,
    markAsRead
  } = useMessagingData(vendorId);

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants[0]?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && conv.unreadCount > 0) ||
                         (filter === 'starred' && false); // No starred logic yet
    return matchesSearch && matchesFilter;
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && selectedConversation) {
      // Scroll the container directly instead of using scrollIntoView
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, selectedConversation]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      // Mark as read when conversation is opened
      if (user?.id) {
        markAsRead(selectedConversation, user.id);
      }
    }
  }, [selectedConversation, loadMessages, markAsRead, user?.id]);

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await sendMessage(
        selectedConversation,
        newMessage.trim(),
        user.id,
        user.email || 'Vendor',
        'vendor'
      );
      setNewMessage('');
      setIsTyping(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    return d.toLocaleDateString();
  };

  // Show loading state
  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conversations...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <VendorHeader />
        <div className="flex-1 bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Messages</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refreshConversations}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden">
      <VendorHeader />
      
      <main className="pt-24 pb-12 h-screen overflow-y-auto overscroll-contain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header with Better Styling */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                  Messages
                </h1>
                <p className="text-gray-600 text-lg">Communicate with your clients and manage inquiries</p>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white rounded-2xl hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform"
              >
                <Plus className="w-6 h-6" />
                <span className="font-semibold">New Message</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Conversations List */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden max-h-[650px]">
                {/* Enhanced Search and Filter */}
                <div className="p-8 border-b border-gray-100/50">
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none bg-white/80 backdrop-blur-sm text-lg"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    {[
                      { key: 'all', label: 'All', icon: MessageSquare },
                      { key: 'unread', label: 'Unread', icon: AlertCircle },
                      { key: 'starred', label: 'Starred', icon: Star }
                    ].map((filterOption) => {
                      const Icon = filterOption.icon;
                      return (
                        <motion.button
                          key={filterOption.key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFilter(filterOption.key as any)}
                          className={cn(
                            "flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                            filter === filterOption.key
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                              : 'text-gray-600 hover:text-pink-700 hover:bg-pink-50 bg-white/60'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{filterOption.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Conversations */}
                <div 
                  className="max-h-[450px] overflow-y-scroll overscroll-contain"
                  onWheel={(e) => {
                    // Prevent wheel events from bubbling to parent
                    e.stopPropagation();
                  }}
                >
                  {filteredConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-6 border-b border-gray-100/50 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-rose-50/50 relative group",
                        selectedConversation === conversation.id ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200' : ''
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleConversationClick(conversation.id);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <img
                            src={conversation.participants[0].avatar}
                            alt={conversation.participants[0].name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-lg"
                          />
                          {conversation.participants[0].isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {conversation.participants[0].name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full px-3 py-1 min-w-[24px] text-center shadow-lg">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              <span className="text-sm text-gray-500 font-medium">
                                {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt || '')}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 truncate mb-3 text-base">
                            {conversation.lastMessage?.senderName === 'You' ? 'You: ' : ''}
                            {conversation.lastMessage?.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {conversation.lastMessage?.senderName === 'You' && (
                                <CheckCheck className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-2 hover:bg-white/80 rounded-xl transition-colors backdrop-blur-sm"
                                title="Call"
                              >
                                <Phone className="w-5 h-5 text-gray-500" />
                              </button>
                              <button 
                                className="p-2 hover:bg-white/80 rounded-xl transition-colors backdrop-blur-sm"
                                title="Video call"
                              >
                                <Video className="w-5 h-5 text-gray-500" />
                              </button>
                              <button 
                                className="p-2 hover:bg-white/80 rounded-xl transition-colors backdrop-blur-sm"
                                title="More options"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Message Area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {selectedConversation ? (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl h-[650px] flex flex-col overflow-hidden">
                  {/* Enhanced Chat Header */}
                  <div className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-pink-50/50 to-rose-50/50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={filteredConversations.find(c => c.id === selectedConversation)?.participants[0].avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {filteredConversations.find(c => c.id === selectedConversation)?.participants[0].name}
                          </h3>
                          <div className="text-green-600 font-semibold flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            {filteredConversations.find(c => c.id === selectedConversation)?.participants[0].isOnline ? 'Online now' : 'Offline'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 hover:bg-white/80 rounded-2xl transition-colors backdrop-blur-sm border border-white/20"
                          title="Call"
                        >
                          <Phone className="w-6 h-6 text-gray-600" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 hover:bg-white/80 rounded-2xl transition-colors backdrop-blur-sm border border-white/20"
                          title="Video call"
                        >
                          <Video className="w-6 h-6 text-gray-600" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 hover:bg-white/80 rounded-2xl transition-colors backdrop-blur-sm border border-white/20"
                          title="More options"
                        >
                          <MoreVertical className="w-6 h-6 text-gray-600" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Messages Area - Fixed Scrolling */}
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <div 
                      ref={messagesContainerRef}
                      className="flex-1 p-6 overflow-y-scroll overscroll-contain max-h-[400px] bg-gradient-to-b from-white/20 to-white/40"
                      style={{ 
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                      }}
                      onWheel={(e) => {
                        // Prevent wheel events from bubbling to parent
                        e.stopPropagation();
                      }}
                    >
                      {messages.length > 0 ? (
                        <div className="space-y-4 pb-4">
                          <AnimatePresence>
                            {messages.map((message, index) => {
                              const isVendor = message.senderRole === 'vendor' || message.senderId === user?.id;
                              const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                              
                              return (
                                <motion.div
                                  key={message.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.3 }}
                                  className={cn(
                                    "flex items-end space-x-3",
                                    isVendor ? "justify-end" : "justify-start"
                                  )}
                                >
                                  {!isVendor && showAvatar && (
                                    <img
                                      src={filteredConversations.find(c => c.id === selectedConversation)?.participants[0].avatar}
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full flex-shrink-0"
                                    />
                                  )}
                                  
                                  <div
                                    className={cn(
                                      "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative group",
                                      isVendor
                                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md"
                                        : "bg-white/80 backdrop-blur-sm text-gray-900 rounded-bl-md border border-gray-200"
                                    )}
                                  >
                                    <p className="text-sm break-words">{message.content}</p>
                                    
                                    <div
                                      className={cn(
                                        "flex items-center justify-between mt-2 text-xs opacity-70",
                                        isVendor ? "text-white" : "text-gray-500"
                                      )}
                                    >
                                      <span>{formatTime(message.timestamp)}</span>
                                      {isVendor && (
                                        <div className="flex items-center space-x-1">
                                          <CheckCheck className="w-3 h-3" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isVendor && showAvatar && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                      V
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-gray-600 flex items-center justify-center h-full"
                        >
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                            <MessageSquare className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm text-gray-500 mt-2">Start the conversation by sending a message below</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced Message Input - Fixed Position */}
                    <div className="flex-shrink-0 p-6 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
                      <div className="flex items-center space-x-4">
                        <button className="p-3 hover:bg-white/80 rounded-xl transition-colors flex-shrink-0">
                          <Paperclip className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none resize-none"
                          />
                          {isTyping && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button className="p-3 hover:bg-white/80 rounded-xl transition-colors">
                            <Smile className="w-5 h-5 text-gray-500" />
                          </button>
                          <button className="p-3 hover:bg-white/80 rounded-xl transition-colors">
                            <Image className="w-5 h-5 text-gray-500" />
                          </button>
                          <button className="p-3 hover:bg-white/80 rounded-xl transition-colors">
                            <Mic className="w-5 h-5 text-gray-500" />
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className={cn(
                              "p-3 rounded-xl transition-all duration-200",
                              newMessage.trim()
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                          >
                            <Send className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl h-[650px] flex items-center justify-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 mb-6">
                      <MessageSquare className="w-24 h-24 text-pink-400 mx-auto mb-4" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a conversation</h3>
                    <p className="text-gray-600 text-lg">Choose a conversation from the list to start messaging</p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>

        {/* Enhanced Quick Stats - Fixed Proportions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                label: 'Total Conversations',
                value: conversations.length.toString(),
                change: '+3 this week',
                icon: MessageSquare,
                color: 'pink'
              },
              {
                label: 'Unread Messages',
                value: conversations.reduce((acc, conv) => acc + conv.unreadCount, 0).toString(),
                change: '2 urgent',
                icon: AlertCircle,
                color: 'orange'
              },
              {
                label: 'Response Time',
                value: '2h avg',
                change: '15min faster',
                icon: Clock,
                color: 'green'
              },
              {
                label: 'Active Clients',
                value: conversations.filter(conv => conv.participants[0]?.isOnline).length.toString(),
                change: '+2 this month',
                icon: Users,
                color: 'blue'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 hover:shadow-xl transition-all duration-300 group h-[160px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
                      stat.color === 'pink' && 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600',
                      stat.color === 'orange' && 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600',
                      stat.color === 'green' && 'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
                      stat.color === 'blue' && 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-gray-600 text-sm font-medium mb-1 line-clamp-2">{stat.label}</p>
                    <p className="text-xs text-green-600 font-semibold">{stat.change}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
