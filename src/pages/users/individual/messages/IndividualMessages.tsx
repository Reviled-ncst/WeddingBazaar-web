import React, { useState, useEffect } from 'react';
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
// import { Messenger, useMessenger } from '../../../shared/messenger'; // Disabled in demo mode
import { cn } from '../../../../utils/cn';

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    isOnline: boolean;
  }>;
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    timestamp: string | Date;
    type: string;
  };
  unreadCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  serviceInfo?: {
    id: string;
    name: string;
    category: string;
    price: string;
    image: string;
    description?: string;
  };
}

export const IndividualMessages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
  
  // Note: Messenger hooks disabled in demo mode to prevent API calls
  // const { isMessengerOpen, closeMessenger, activeConversationId } = useMessenger();

  // Fetch real conversations from database
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const user = { id: '1-2025-001' }; // Test user with real conversations
      
      console.log('🔍 Fetching conversations from:', `${apiUrl}/api/conversations/individual/${user.id}`);
      
      const response = await fetch(`${apiUrl}/api/conversations/individual/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real conversations from API:', data);
        
        if (data.conversations && data.conversations.length > 0) {
          setConversations(data.conversations);
          console.log(`✅ ${data.conversations.length} real conversations loaded`);
        } else {
          console.log('📋 No conversations found');
          setConversations([]);
          setError('No conversations found');
        }
      } else {
        console.error('❌ API error:', response.status);
        setError(`API error: ${response.status}`);
        setConversations([]);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setError('Connection error');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants[0].name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && conv.unreadCount > 0) ||
                         (filter === 'starred' && false); // No starred logic yet
    return matchesSearch && matchesFilter;
  });

  // Debug: Log to check if conversations are being filtered properly
  console.log('Conversations:', conversations.length);
  console.log('FilteredConversations:', filteredConversations.length);
  console.log('SearchTerm:', searchTerm);
  console.log('Filter:', filter);

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Note: Opening messenger is disabled in demo mode to prevent API calls
    // openMessenger(conversationId);
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
                <p className="text-sm text-blue-600 mt-1">
                  Debug: {conversations.length} total conversations, {filteredConversations.length} filtered
                </p>
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  <div className="p-4 text-sm text-gray-600">
                    Total conversations: {conversations.length} | Filtered: {filteredConversations.length}
                  </div>
                  
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
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
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Search query: "{searchTerm}" | Filter: {filter}
                      </p>
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
                      <p>💬 Demo Messaging Interface</p>
                      <p className="text-sm mt-2">This is a preview of the messaging system. Real-time messaging will be available when the backend API is implemented.</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          alert('🚧 Demo Mode\n\nThis messaging system is currently in demo mode. The full real-time messaging functionality will be available once the backend messaging API is implemented.\n\nFor now, you can:\n✅ Browse mock conversations\n✅ See the UI design\n✅ Test the interface\n\n🔜 Coming soon: Real-time messaging with vendors!');
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Demo Chat (API Coming Soon)</span>
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
                value: conversations.length.toString(),
                change: '+2 this week',
                icon: Users,
                color: 'pink'
              },
              {
                label: 'Unread Messages',
                value: conversations.reduce((acc, conv) => acc + conv.unreadCount, 0).toString(),
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

      {/* Note: Messenger component disabled in demo mode to prevent API calls */}
      {/* {isMessengerOpen && (
        <Messenger
          isOpen={isMessengerOpen}
          onClose={closeMessenger}
          conversationId={activeConversationId}
        />
      )} */}
    </div>
  );
};
