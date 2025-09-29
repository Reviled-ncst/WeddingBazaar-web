import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Video,
  MoreVertical,
  CheckCheck,
  AlertCircle,
  Plus,
  Heart
} from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { cn } from '../../../../utils/cn';

// Simple mock conversations - ALWAYS visible
const SIMPLE_MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    participants: [
      {
        id: 'vendor-1',
        name: 'Elegant Photography Studio',
        role: 'vendor',
        avatar: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
        isOnline: true
      }
    ],
    lastMessage: {
      id: 'msg-1',
      senderId: 'vendor-1',
      senderName: 'Sarah from Elegant Photography',
      senderRole: 'vendor',
      content: 'Thank you for your inquiry! I\'d love to capture your special day.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'text'
    },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    serviceInfo: {
      id: 'SRV-001',
      name: 'Wedding Photography Package',
      category: 'Photography',
      price: '₱125,000',
      image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400'
    }
  },
  {
    id: 'conv-2',
    participants: [
      {
        id: 'vendor-2',
        name: 'Delicious Catering Co.',
        role: 'vendor',
        avatar: 'https://images.unsplash.com/photo-1577303935007-0d306ee4f67b?w=400',
        isOnline: false
      }
    ],
    lastMessage: {
      id: 'msg-2',
      senderId: 'user-1',
      senderName: 'You',
      senderRole: 'couple',
      content: 'Could we schedule a tasting for next weekend?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'text'
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    serviceInfo: {
      id: 'SRV-002',
      name: 'Wedding Catering Service',
      category: 'Catering',
      price: '₱4,250/person',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400'
    }
  },
  {
    id: 'conv-3',
    participants: [
      {
        id: 'vendor-3',
        name: 'Harmony Wedding Planners',
        role: 'vendor',
        avatar: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400',
        isOnline: true
      }
    ],
    lastMessage: {
      id: 'msg-3',
      senderId: 'vendor-3',
      senderName: 'Emma from Harmony Planners',
      senderRole: 'vendor',
      content: 'I\'ve prepared a detailed timeline for your wedding day. Let\'s review it!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      type: 'text'
    },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    serviceInfo: {
      id: 'SRV-003',
      name: 'Full Wedding Planning',
      category: 'Planning',
      price: '₱190,000',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400'
    }
  }
];

export const SimpleIndividualMessages: React.FC = () => {
  console.log('🚀 SimpleIndividualMessages - ALWAYS shows conversations');
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const conversations = SIMPLE_MOCK_CONVERSATIONS; // Static assignment

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    return d.toLocaleDateString();
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    console.log('🔄 Conversation selected:', conversationId);
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
                <p className="text-sm text-green-600 mt-1">
                  ✅ {conversations.length} conversations loaded (TEST MODE)
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
                {/* Search */}
                <div className="p-6 border-b border-gray-100">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="max-h-96 overflow-y-auto">
                  {conversations.map((conversation) => (
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
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 h-[600px] flex flex-col">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={conversations.find(c => c.id === selectedConversation)?.participants[0].avatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {conversations.find(c => c.id === selectedConversation)?.participants[0].name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {conversations.find(c => c.id === selectedConversation)?.participants[0].isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="text-center text-gray-500 mb-6">
                      <p>💬 Test Mode - Conversations Working!</p>
                      <p className="text-sm mt-2">This proves the conversations display correctly.</p>
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
        </div>
      </main>
    </div>
  );
};
