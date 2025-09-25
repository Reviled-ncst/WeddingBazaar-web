import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Users, 
  Phone, 
  Video,
  Plus,
  Filter,
  Star,
  Archive,
  MoreHorizontal,
  Clock,
  CheckCheck,
  AlertCircle,
  Send
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUniversalMessaging } from '../../contexts/UniversalMessagingContext';

interface UniversalMessagesPageProps {
  userType: 'vendor' | 'couple' | 'admin';
  title?: string;
  subtitle?: string;
  headerComponent?: React.ReactNode;
}

export const UniversalMessagesPage: React.FC<UniversalMessagesPageProps> = ({
  userType,
  title,
  subtitle,
  headerComponent
}) => {
  const {
    conversations,
    currentUser,
    isLoading,
    error,
    openConversation,
    getOtherParticipants,
    sendMessage,
    unreadCount,
    getMessages
  } = useUniversalMessaging();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Filter conversations based on current filter
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && conv.unreadCount > 0) ||
                         (filter === 'archived' && conv.metadata?.status === 'archived');
    
    return matchesSearch && matchesFilter;
  });

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    openConversation(conversationId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    return date.toLocaleDateString();
  };

  const getPageTitle = () => {
    if (title) return title;
    switch (userType) {
      case 'vendor': return 'Customer Messages';
      case 'couple': return 'Messages'; // ✅ Fixed: More intuitive title for couples
      case 'admin': return 'Platform Messages';
      default: return 'Messages';
    }
  };

  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    switch (userType) {
      case 'vendor': return 'Manage conversations with your customers';
      case 'couple': return 'Chat with your wedding vendors';
      case 'admin': return 'Monitor platform communications';
      default: return 'Your conversations';
    }
  };

  const getEmptyStateMessage = () => {
    switch (userType) {
      case 'vendor': return 'No customer inquiries yet. Customers will appear here when they contact you about your services.';
      case 'couple': return 'No vendor conversations yet. Start chatting with vendors from their service pages.';
      case 'admin': return 'No platform conversations to monitor.';
      default: return 'No conversations found.';
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const otherParticipants = selectedConv ? getOtherParticipants(selectedConv.id) : [];
  const messages = selectedConv ? getMessages(selectedConv.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {headerComponent}
      
      <main className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="text-gray-600 mt-2">{getPageSubtitle()}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {userType === 'couple' && (
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Plus className="w-5 h-5" />
                    <span>Find Vendors</span>
                  </button>
                )}
                
                {userType === 'admin' && (
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <Filter className="w-5 h-5" />
                    <span>Filter</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 overflow-hidden">
                {/* Search and Filter */}
                <div className="p-6 border-b border-gray-100">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${userType === 'vendor' ? 'customers' : 'vendors'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'All', icon: MessageSquare },
                      { key: 'unread', label: 'Unread', icon: AlertCircle },
                      { key: 'archived', label: 'Archived', icon: Archive }
                    ].map((filterOption) => {
                      const Icon = filterOption.icon;
                      return (
                        <button
                          key={filterOption.key}
                          onClick={() => setFilter(filterOption.key as any)}
                          className={cn(
                            "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                            filter === filterOption.key
                              ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border border-pink-200'
                              : 'text-gray-600 hover:text-pink-700 hover:bg-pink-50'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{filterOption.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conversations */}
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading conversations...</p>
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600">{error}</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => {
                      const otherParticipants = getOtherParticipants(conversation.id);
                      const participant = otherParticipants[0];
                      
                      return (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 hover:bg-gray-50",
                            selectedConversation === conversation.id ? 'bg-pink-50 border-pink-200' : ''
                          )}
                          onClick={() => handleConversationClick(conversation.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <img
                                src={participant?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'}
                                alt={participant?.name || 'User'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              {participant?.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                              {/* Role indicator */}
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
                                    <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Service Info */}
                              {conversation.serviceInfo && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                                    {conversation.serviceInfo.category}
                                  </span>
                                </div>
                              )}
                              
                              {conversation.lastMessage && (
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.lastMessage.senderRole === currentUser?.role ? 'You: ' : ''}
                                  {conversation.lastMessage.content}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  {conversation.lastMessage?.senderRole === currentUser?.role && (
                                    <CheckCheck className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <button 
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    title="Actions"
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No conversations found</p>
                      <p className="text-sm text-gray-400">{getEmptyStateMessage()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="lg:col-span-2">
              {selectedConv && otherParticipants.length > 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={otherParticipants[0].avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {otherParticipants[0].name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              {otherParticipants[0].isOnline ? 'Online' : 'Offline'}
                            </p>
                            {selectedConv.serviceInfo && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-pink-600">
                                  {selectedConv.serviceInfo.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Call"
                        >
                          <Phone className="w-5 h-5 text-gray-600" />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Video call"
                        >
                          <Video className="w-5 h-5 text-gray-600" />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages Area */}
                  <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
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
                                      <CheckCheck className="h-3 w-3 text-rose-200" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your conversation</h3>
                        <p className="text-gray-600">Send a message to begin chatting</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-gray-50 focus:bg-white transition-colors"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        title="Send message"
                        className={cn(
                          "p-2 rounded-full transition-all duration-200",
                          messageText.trim()
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600 mb-4">{getEmptyStateMessage()}</p>
                    {userType === 'couple' && (
                      <button className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300">
                        Browse Vendors
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: userType === 'vendor' ? 'Active Customers' : 'Active Vendors',
                value: conversations.length.toString(),
                change: conversations.length > 0 ? `${conversations.length} total` : 'None yet',
                icon: Users,
                color: 'pink'
              },
              {
                label: 'Unread Messages',
                value: unreadCount.toString(),
                change: unreadCount > 0 ? 'Needs attention' : 'All caught up',
                icon: AlertCircle,
                color: 'orange'
              },
              {
                label: 'Response Time',
                value: '< 1h',
                change: 'Very responsive',
                icon: Clock,
                color: 'green'
              },
              {
                label: 'Satisfaction',
                value: '4.8★',
                change: 'Excellent rating',
                icon: Star,
                color: 'yellow'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      stat.color === 'pink' && 'bg-pink-100 text-pink-600',
                      stat.color === 'orange' && 'bg-orange-100 text-orange-600',
                      stat.color === 'green' && 'bg-green-100 text-green-600',
                      stat.color === 'yellow' && 'bg-yellow-100 text-yellow-600'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
