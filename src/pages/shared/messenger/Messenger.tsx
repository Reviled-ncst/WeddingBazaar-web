import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical, 
  X,
  Search,
  Plus,
  Check,
  CheckCheck,
  Clock,
  Image,
  FileText,
  Mic,
  Settings,
  Pin,
  Star
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useMessagingService } from './useMessagingService';
import type { Conversation } from './types';

interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
}

export const Messenger: React.FC<MessengerProps> = ({ isOpen, onClose, conversationId }) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    loadConversations,
    loadMessages
  } = useMessagingService();
  
  const [activeConversation, setActiveConversation] = useState<string | null>(conversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations when component opens - DISABLED to prevent API calls to non-existent backend
  useEffect(() => {
    // TODO: Re-enable when backend messaging API is implemented
    // if (isOpen && user?.id) {
    //   loadConversations(user.id);
    // }
    console.log('🔄 Messenger opened - API calls disabled until backend is ready');
  }, [isOpen, user?.id, loadConversations]);

  // Set active conversation from prop
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }
  }, [conversationId]);

  // Load messages when active conversation changes - DISABLED to prevent API calls
  useEffect(() => {
    // TODO: Re-enable when backend messaging API is implemented
    // if (activeConversation) {
    //   loadMessages(activeConversation);
    // }
    console.log('🔄 Active conversation changed - API calls disabled until backend is ready');
  }, [activeConversation, loadMessages]);
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    try {
      setIsTyping(false);
      await sendMessage(activeConversation, newMessage.trim(), user.id);
      setNewMessage('');
      setShowEmojiPicker(false);
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

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const getMessageStatus = (message: any) => {
    // Mock message status - in real app, this would come from the message data
    if (message.senderId === user?.id) {
      return Math.random() > 0.5 ? 'read' : 'delivered';
    }
    return null;
  };

  const renderMessageStatus = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatTime = (timestamp: string | Date) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error, 'Timestamp:', timestamp);
      return 'Invalid time';
    }
  };

  const formatConversationTime = (timestamp: string | Date) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '';
      }
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `${days}d ago`;
      } else if (hours > 0) {
        return `${hours}h ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      console.error('Error formatting conversation time:', error);
      return '';
    }
  };

  const getOtherParticipant = (conversation: Conversation | undefined) => {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.id !== user?.id);
  };

  const getRoleColor = (role: 'couple' | 'vendor' | 'admin') => {
    switch (role) {
      case 'couple': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'vendor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'admin': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  if (loading && conversations.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading messages</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[700px] flex overflow-hidden border border-gray-200">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gradient-to-b from-rose-50 to-pink-50">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Messages</h2>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="New conversation"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Close messenger"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-white text-white placeholder-white placeholder-opacity-70 text-sm"
              />
            </div>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No conversations yet</h3>
                <p className="text-gray-600 text-sm">Start a conversation with vendors or couples</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isActive = conversation.id === activeConversation;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => setActiveConversation(conversation.id)}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-b border-rose-100",
                      isActive 
                        ? "bg-gradient-to-r from-rose-100 to-pink-100 border-rose-200 shadow-sm" 
                        : "hover:bg-gradient-to-r hover:from-white hover:to-rose-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shadow-md",
                          otherParticipant?.role === 'vendor' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                          otherParticipant?.role === 'admin' ? 'bg-gradient-to-br from-gray-500 to-gray-600' : 'bg-gradient-to-br from-rose-500 to-pink-600'
                        )}>
                          <span className="text-sm">
                            {otherParticipant?.name.charAt(0)}
                          </span>
                        </div>
                        {otherParticipant?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-xs text-white font-bold">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {otherParticipant?.name}
                          </p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 font-medium">
                              {formatConversationTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full border",
                            getRoleColor(otherParticipant?.role || 'couple')
                          )}>
                            {otherParticipant?.role}
                          </span>
                          {otherParticipant?.isOnline && (
                            <span className="text-xs text-green-600 font-bold flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Online
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-700 truncate font-medium">
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const currentConversation = conversations.find(c => c.id === activeConversation);
                      const otherParticipant = getOtherParticipant(currentConversation);
                      
                      if (!otherParticipant) {
                        return (
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                              ?
                            </div>
                            <div>
                              <p className="font-bold text-lg text-white">Unknown User</p>
                              <span className="text-sm text-white text-opacity-70">Offline</span>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          <div className="relative">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white border-opacity-50",
                              otherParticipant.role === 'vendor' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                              otherParticipant.role === 'admin' ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-rose-400 to-pink-600'
                            )}>
                              <span className="text-lg">
                                {otherParticipant.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            {otherParticipant.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-white">
                              {otherParticipant.name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-white text-opacity-90 bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                {otherParticipant.role}
                              </span>
                              <span className={cn(
                                "text-sm font-medium",
                                otherParticipant.isOnline ? 'text-green-200' : 'text-white text-opacity-70'
                              )}>
                                {otherParticipant.isOnline ? '● Online' : 'Last seen recently'}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                      title="Start voice call"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                      title="Start video call"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                      title="Pin conversation"
                    >
                      <Pin className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2.5 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-rose-50 to-pink-50">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Send className="h-10 w-10 text-rose-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Start the conversation</h3>
                      <p className="text-gray-600">Send a message to get started</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === user?.id;
                      const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                      const messageStatus = getMessageStatus(message);
                      
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex items-end space-x-3",
                            isOwn ? "justify-end" : "justify-start"
                          )}
                        >
                          {!isOwn && showAvatar && (
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg border-2 border-white",
                              message.senderRole === 'vendor' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                              message.senderRole === 'admin' ? 'bg-gradient-to-br from-gray-500 to-gray-600' : 'bg-gradient-to-br from-rose-500 to-pink-600'
                            )}>
                              {message.senderName.charAt(0)}
                            </div>
                          )}
                          {!isOwn && !showAvatar && <div className="w-10" />}
                          
                          <div
                            className={cn(
                              "max-w-xs lg:max-w-md px-5 py-3 rounded-3xl relative group shadow-md",
                              isOwn
                                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-lg"
                                : "bg-white text-gray-900 border border-gray-100 rounded-bl-lg"
                            )}
                          >
                            {!isOwn && showAvatar && (
                              <p className="text-xs font-bold mb-2 text-gray-600">
                                {message.senderName}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
                            <div className={cn(
                              "flex items-center justify-between mt-2",
                              isOwn ? "text-white text-opacity-70" : "text-gray-500"
                            )}>
                              <span className="text-xs font-medium">
                                {formatTime(message.timestamp)}
                              </span>
                              {isOwn && (
                                <div className="ml-2">
                                  {renderMessageStatus(messageStatus)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-xs font-bold text-gray-600">...</span>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-3xl rounded-bl-lg shadow-md border border-gray-100">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-500 border-t border-rose-400">
                {/* Attachments Menu */}
                {showAttachments && (
                  <div className="mb-4 p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-white border-opacity-30 shadow-lg">
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={handleFileAttachment}
                        className="flex flex-col items-center p-4 rounded-xl hover:bg-rose-50 transition-colors group"
                      >
                        <Image className="h-7 w-7 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-700 font-medium">Photo</span>
                      </button>
                      <button
                        onClick={handleFileAttachment}
                        className="flex flex-col items-center p-4 rounded-xl hover:bg-rose-50 transition-colors group"
                      >
                        <FileText className="h-7 w-7 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-700 font-medium">Document</span>
                      </button>
                      <button className="flex flex-col items-center p-4 rounded-xl hover:bg-rose-50 transition-colors group">
                        <Mic className="h-7 w-7 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-700 font-medium">Voice</span>
                      </button>
                      <button className="flex flex-col items-center p-4 rounded-xl hover:bg-rose-50 transition-colors group">
                        <Star className="h-7 w-7 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-gray-700 font-medium">Poll</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mb-4 p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl border border-white border-opacity-30 shadow-lg">
                    <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                      {['😀', '😂', '😍', '🥰', '😊', '😉', '😋', '😎', '🤔', '😮', '😢', '😭', '😡', '🥺', '👍', '👎', '❤️', '💕', '🎉', '🎊', '👏', '🙌', '💯', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="p-3 hover:bg-rose-100 rounded-xl transition-colors text-lg hover:scale-110 transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end space-x-3">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowAttachments(!showAttachments)}
                      className={cn(
                        "p-3 rounded-xl transition-all duration-200 transform",
                        showAttachments 
                          ? "bg-white bg-opacity-30 text-white scale-105 shadow-lg" 
                          : "text-white hover:bg-white hover:bg-opacity-20 hover:scale-105"
                      )}
                      title="Attach file"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full px-5 py-4 bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-30 rounded-3xl focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-white pr-14 resize-none text-gray-800 placeholder-gray-600 shadow-lg font-medium"
                    />
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn(
                        "absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all duration-200",
                        showEmojiPicker 
                          ? "bg-rose-100 text-rose-600 scale-105" 
                          : "text-gray-500 hover:bg-gray-100 hover:scale-105"
                      )}
                      title="Add emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={cn(
                      "p-4 rounded-full transition-all duration-300 transform shadow-lg",
                      newMessage.trim() 
                        ? "bg-white text-rose-600 hover:bg-opacity-90 scale-100 hover:scale-110 shadow-xl" 
                        : "bg-white bg-opacity-50 text-gray-400 scale-95 cursor-not-allowed"
                    )}
                    title="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                  aria-label="File attachment"
                  onChange={(e) => {
                    // Handle file upload here
                    const file = e.target.files?.[0];
                    if (file && import.meta.env.DEV) {
                      console.log('File selected:', file);
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-32 h-32 bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                  <Send className="h-16 w-16 text-rose-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Wedding Bazaar Messages</h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  Connect with vendors, couples, and wedding professionals. Select a conversation from the left to start messaging or create a new conversation.
                </p>
                <div className="space-y-4">
                  <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                    Start New Conversation
                  </button>
                  <button className="w-full border-2 border-rose-300 text-rose-700 px-8 py-4 rounded-2xl hover:bg-rose-50 transition-all duration-200 font-semibold">
                    Browse Vendors
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
