import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Users, 
  Phone, 
  Video,
  MoreVertical,
  Clock,
  CheckCheck,
  AlertCircle,
  Plus,
  Heart
} from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { Messenger, useMessenger } from '../../../shared/messenger';
import { cn } from '../../../../utils/cn';

export const IndividualMessages: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  const { 
    isMessengerOpen, 
    openMessenger, 
    closeMessenger,
    activeConversationId 
  } = useMessenger();

  // Mock conversations for couple/individual user (will be replaced with real data)
  const mockConversations = [
    {
      id: 'conv-vendor-1',
      participants: [
        {
          id: 'vendor-1',
          name: 'Elegant Photography Studio',
          role: 'vendor' as const,
          avatar: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
          isOnline: true
        }
      ],
      lastMessage: {
        id: 'msg-1',
        senderId: 'vendor-1',
        senderName: 'Sarah from Elegant Photography',
        senderRole: 'vendor' as const,
        content: 'Thank you for your inquiry! I\'d love to capture your special day. When would be a good time to chat?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text' as const
      },
      unreadCount: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      serviceInfo: {
        id: 'SRV-001',
        name: 'Wedding Photography Package',
        category: 'Photography',
        price: '$2,500',
        image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400'
      }
    },
    {
      id: 'conv-vendor-2',
      participants: [
        {
          id: 'vendor-2',
          name: 'Delicious Catering Co.',
          role: 'vendor' as const,
          avatar: 'https://images.unsplash.com/photo-1577303935007-0d306ee4f67b?w=400',
          isOnline: false
        }
      ],
      lastMessage: {
        id: 'msg-2',
        senderId: 'couple-1',
        senderName: 'You',
        senderRole: 'couple' as const,
        content: 'Could we schedule a tasting for next weekend?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        type: 'text' as const
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      serviceInfo: {
        id: 'SRV-002',
        name: 'Wedding Catering Service',
        category: 'Catering',
        price: '$85/person',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400'
      }
    },
    {
      id: 'conv-vendor-3',
      participants: [
        {
          id: 'vendor-3',
          name: 'Harmony Wedding Planners',
          role: 'vendor' as const,
          avatar: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400',
          isOnline: true
        }
      ],
      lastMessage: {
        id: 'msg-3',
        senderId: 'vendor-3',
        senderName: 'Emma from Harmony Planners',
        senderRole: 'vendor' as const,
        content: 'I\'ve prepared a detailed timeline for your wedding day. Let\'s review it together!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
        type: 'text' as const
      },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      serviceInfo: {
        id: 'SRV-003',
        name: 'Full Wedding Planning',
        category: 'Planning',
        price: '$3,800',
        image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
      }
    }
  ];

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.participants[0].name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && conv.unreadCount > 0) ||
                         (filter === 'starred' && false); // No starred logic yet
    return matchesSearch && matchesFilter;
  });

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    openMessenger(conversationId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <CoupleHeader />
      
      <main className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">Chat with your wedding vendors and get quick responses</p>
              </div>
              
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Plus className="w-5 h-5" />
                <span>Contact Vendor</span>
              </button>
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
                      placeholder="Search vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'All', icon: MessageSquare },
                      { key: 'unread', label: 'Unread', icon: AlertCircle },
                      { key: 'starred', label: 'Favorites', icon: Heart }
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
                  {filteredConversations.map((conversation) => (
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
                            src={conversation.participants[0].avatar}
                            alt={conversation.participants[0].name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {conversation.participants[0].isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {conversation.participants[0].name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {conversation.unreadCount > 0 && (
                                <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt || '')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Service Info */}
                          {conversation.serviceInfo && (
                            <div className="flex items-center space-x-2 mb-2">
                              <img
                                src={conversation.serviceInfo.image}
                                alt={conversation.serviceInfo.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                              <span className="text-xs text-pink-600 font-medium">
                                {conversation.serviceInfo.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                {conversation.serviceInfo.price}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.senderName === 'You' ? 'You: ' : ''}
                            {conversation.lastMessage?.content}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              {conversation.lastMessage?.senderName === 'You' && (
                                <CheckCheck className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                title="Call vendor"
                              >
                                <Phone className="w-4 h-4 text-gray-400" />
                              </button>
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                title="Video call"
                              >
                                <Video className="w-4 h-4 text-gray-400" />
                              </button>
                              <button 
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                title="More options"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredConversations.length === 0 && (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations found</p>
                      <p className="text-sm text-gray-400 mt-1">Start by contacting a vendor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={filteredConversations.find(c => c.id === selectedConversation)?.participants[0].avatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {filteredConversations.find(c => c.id === selectedConversation)?.participants[0].name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              {filteredConversations.find(c => c.id === selectedConversation)?.participants[0].isOnline ? 'Online' : 'Offline'}
                            </p>
                            {filteredConversations.find(c => c.id === selectedConversation)?.serviceInfo && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-pink-600">
                                  {filteredConversations.find(c => c.id === selectedConversation)?.serviceInfo?.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          title="Call vendor"
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
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages Area */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="text-center text-gray-500 mb-6">
                      <p>Click the message bubble to open the full messenger</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => openMessenger(selectedConversation)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Open Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a vendor conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Active Vendors',
                value: mockConversations.length.toString(),
                change: '+2 this week',
                icon: Users,
                color: 'pink'
              },
              {
                label: 'Unread Messages',
                value: mockConversations.reduce((acc, conv) => acc + conv.unreadCount, 0).toString(),
                change: '3 new today',
                icon: AlertCircle,
                color: 'orange'
              },
              {
                label: 'Avg Response Time',
                value: '45min',
                change: 'Very responsive',
                icon: Clock,
                color: 'green'
              },
              {
                label: 'Favorite Vendors',
                value: '0',
                change: 'Add favorites',
                icon: Heart,
                color: 'red'
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
                      stat.color === 'red' && 'bg-red-100 text-red-600'
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

      {/* Messenger Modal */}
      {isMessengerOpen && (
        <Messenger
          isOpen={isMessengerOpen}
          onClose={closeMessenger}
          conversationId={activeConversationId}
        />
      )}
    </div>
  );
};
