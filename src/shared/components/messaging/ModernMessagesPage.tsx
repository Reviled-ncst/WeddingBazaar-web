import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send,
  User,
  Clock,
  CheckCheck,
  Phone,
  Video,
  MoreHorizontal,
  Smile,
  Paperclip,
  Image,
  Users,
  Zap
} from 'lucide-react';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { useAuth } from '../../contexts/HybridAuthContext';
import { MessageAttachments } from './MessageAttachments';
import { useFileUpload } from '../../../hooks/useFileUpload';
import './MessagingAnimations.css';

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
  const [pendingAttachments, setPendingAttachments] = useState<Array<{url: string, fileName: string, fileType: string, fileSize: number}>>([]);
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploadProgress } = useFileUpload();

  // Handle file upload
  const handleFileSelect = async (files: FileList, isImage: boolean = false) => {
    for (const file of Array.from(files)) {
      try {
        // Create immediate preview with blob URL
        const previewUrl = URL.createObjectURL(file);
        const tempAttachment = {
          url: previewUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        };
        
        // Add to pending attachments with preview
        setPendingAttachments(prev => [...prev, tempAttachment]);
        
        // Upload to Cloudinary in background
        const folder = isImage ? 'messages/images' : 'messages/files';
        const result = await uploadFile(file, folder);
        
        // Update the attachment with real Cloudinary URL
        setPendingAttachments(prev => 
          prev.map(att => 
            att.url === previewUrl 
              ? { ...att, url: result.url, fileName: result.fileName }
              : att
          )
        );
        
        // Clean up blob URL
        URL.revokeObjectURL(previewUrl);
        
      } catch (error) {
        console.error('File upload failed:', error);
        // Remove failed upload from pending attachments
        setPendingAttachments(prev => 
          prev.filter(att => att.fileName !== file.name)
        );
      }
    }
  };

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
    if ((!newMessage.trim() && pendingAttachments.length === 0) || !activeConversation?.id || sending) return;

    const messageType = pendingAttachments.length > 0 ? 
      (pendingAttachments.some(a => a.fileType.startsWith('image/')) ? 'image' : 'file') : 'text';

    // Send empty string for attachment-only messages to avoid displaying "Attachment" text
    const messageContent = newMessage.trim() || '';
    await sendMessage(activeConversation.id, messageContent, messageType, pendingAttachments);
    setNewMessage('');
    setPendingAttachments([]);
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

  // Get display name for conversation
  const getConversationDisplayName = useMemo(() => {
    const nameCache = new Map<string, string>();
    
    return (conv: any): string => {
      if (!conv || !conv.id) return 'Unknown';
      
      if (nameCache.has(conv.id)) {
        return nameCache.get(conv.id)!;
      }
      
      let displayName = 'Unknown';
      
      // Use conversation title if available (Service - Vendor format)
      if (conv.conversationTitle && conv.conversationTitle !== 'General Inquiry') {
        displayName = conv.conversationTitle;
      }
      // For vendors: Show client name
      else if (userType === 'vendor') {
        if (conv.creator_name) {
          displayName = conv.creator_name;
        } else if (conv.creator_first_name && conv.creator_last_name) {
          displayName = `${conv.creator_first_name} ${conv.creator_last_name}`;
        } else if (conv.creator_email) {
          const emailName = conv.creator_email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        } else {
          displayName = 'Wedding Client';
        }
      }
      // For couples: Show vendor name
      else if (userType === 'couple') {
        if (conv.participant_name) {
          displayName = conv.participant_name;
        } else if (conv.service_name) {
          displayName = conv.service_name;
        } else {
          displayName = 'Wedding Vendor';
        }
      }
      // Admin or fallback
      else {
        displayName = conv.participant_name || conv.creator_name || conv.service_name || 'Conversation';
      }
      
      nameCache.set(conv.id, displayName);
      return displayName;
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
    <div className="flex h-full bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Conversations Sidebar */}
      <div className="w-80 backdrop-blur-xl bg-white/80 border-r border-white/20 shadow-xl flex flex-col relative z-10">
        {/* Header with Glassmorphism */}
        <div className="p-6 border-b border-white/20 backdrop-blur-sm bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl mr-3 shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              Messages
              {unreadCount > 0 && (
                <span className="ml-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-bounce">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          
          {/* Modern Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-gray-700 placeholder-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
          {loading ? (
            <div className="p-6 text-center">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto animation-delay-150"></div>
              </div>
              <p className="text-gray-600 text-sm mt-4 font-medium">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mx-4 mb-4">
                <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h3>
                <p className="text-sm text-gray-500">
                  Start messaging vendors from the Services page!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`group p-4 mb-2 mx-2 rounded-2xl cursor-pointer transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-xl animate-slideInLeft ${
                    activeConversation?.id === conversation.id 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl scale-[1.02]' 
                      : 'bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 shadow-lg'
                  }`}
                  data-animation-delay={index * 50}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      activeConversation?.id === conversation.id 
                        ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                        : 'bg-gradient-to-br from-purple-400 to-pink-400 group-hover:scale-110'
                    }`}>
                      <span className={`text-lg font-bold ${
                        activeConversation?.id === conversation.id ? 'text-white' : 'text-white'
                      }`}>
                        {getConversationDisplayName(conversation).charAt(0).toUpperCase()}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{conversation.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-base font-semibold truncate ${
                          activeConversation?.id === conversation.id ? 'text-white' : 'text-gray-800'
                        }`}>
                          {getConversationDisplayName(conversation)}
                        </h3>
                        {conversation.lastMessage && (
                          <span className={`text-xs font-medium ${
                            activeConversation?.id === conversation.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.lastMessage ? (
                        <p className={`text-sm truncate ${
                          activeConversation?.id === conversation.id ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className={`text-sm italic ${
                          activeConversation?.id === conversation.id ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          No messages yet
                        </p>
                      )}
                      
                      {conversation.unreadCount > 0 && activeConversation?.id !== conversation.id && (
                        <div className="mt-2">
                          <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium shadow-lg">
                            {conversation.unreadCount} new
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {activeConversation ? (
          <>
            {/* Chat Header with Glassmorphism */}
            <div className="p-6 border-b border-white/20 backdrop-blur-xl bg-white/80 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {getConversationDisplayName(activeConversation).charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {getConversationDisplayName(activeConversation)}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span>{userType === 'vendor' ? 'Wedding Client' : 'Wedding Service'}</span>
                      </div>
                      {messages?.length && (
                        <>
                          <span>•</span>
                          <span>{messages.length} messages</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    className="p-3 text-purple-500 hover:text-purple-600 rounded-2xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-lg group"
                    aria-label="Make phone call"
                  >
                    <Phone className="h-5 w-5 group-hover:animate-pulse" />
                  </button>
                  <button 
                    className="p-3 text-purple-500 hover:text-purple-600 rounded-2xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-lg group"
                    aria-label="Start video call"
                  >
                    <Video className="h-5 w-5 group-hover:animate-pulse" />
                  </button>
                  <button 
                    className="p-3 text-purple-500 hover:text-purple-600 rounded-2xl hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef} 
              className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-purple-50/30 to-pink-50/30 backdrop-blur-sm scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent"
            >
              {!messages || messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                      <MessageSquare className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl mx-auto animate-ping opacity-20"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Start the conversation</h3>
                  <p className="text-gray-500 text-lg">Send your first message below!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Load More Button */}
                  {showLoadMore && (
                    <div className="text-center py-4">
                      <button
                        onClick={handleLoadMoreMessages}
                        className="px-6 py-3 bg-white/80 backdrop-blur-sm text-purple-600 text-sm font-medium rounded-2xl border border-purple-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Load Previous Messages ({messages?.length - visibleMessageCount} more)
                      </button>
                    </div>
                  )}
                  
                  {visibleMessages.map((message, index) => {
                    const isFromCurrentUser = message.senderId === user?.id;
                    const showDateSeparator = index === 0 || 
                      getDateSeparator(message.timestamp) !== getDateSeparator(visibleMessages[index - 1]?.timestamp);
                    
                    return (
                      <div 
                        key={message.id}
                        className="animate-fadeInUp message-bubble-enter"
                        data-animation-delay={index * 50}
                      >
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-8">
                            <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-2xl border border-purple-200 shadow-lg">
                              <span className="text-sm text-purple-600 font-medium">
                                {getDateSeparator(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`flex items-end max-w-xs lg:max-w-md group ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isFromCurrentUser && (
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mr-3 mb-1 shadow-lg">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                            
                            <div
                              className={`relative px-6 py-4 rounded-3xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02] ${
                                isFromCurrentUser
                                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white ml-3'
                                  : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-white/50'
                              }`}
                            >
                              {/* Message bubble tail */}
                              <div className={`absolute bottom-0 ${
                                isFromCurrentUser 
                                  ? '-right-2 border-l-8 border-l-pink-500 border-t-8 border-t-transparent border-b-8 border-b-transparent' 
                                  : '-left-2 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
                              }`}></div>
                              
                              {/* Display message text content only if it exists */}
                              {message.content && message.content.trim() && (
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {message.content}
                                </p>
                              )}
                              
                              {/* Display attachments if any */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className={message.content && message.content.trim() ? "mt-2" : ""}>
                                  <MessageAttachments attachments={message.attachments} />
                                </div>
                              )}
                              
                              <div className={`flex items-center justify-end mt-2 space-x-2 ${
                                isFromCurrentUser ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                <Clock className="h-3 w-3" />
                                <span className="text-xs font-medium">
                                  {formatTime(message.timestamp)}
                                </span>
                                {isFromCurrentUser && (
                                  <CheckCheck className="h-3 w-3 text-white/90" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/20 backdrop-blur-xl bg-white/80">
              {/* Pending Attachments Preview */}
              {pendingAttachments.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg">
                  <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attachments:
                    {uploadProgress.isUploading && (
                      <span className="ml-2 text-xs text-purple-600 animate-pulse">
                        Uploading...
                      </span>
                    )}
                  </h4>
                  <MessageAttachments attachments={pendingAttachments} />
                  <button
                    onClick={() => setPendingAttachments([])}
                    className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium hover:underline transition-colors duration-200"
                  >
                    Clear all attachments
                  </button>
                </div>
              )}
              
              <div className="flex items-end space-x-4 relative">
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files, false);
                        }
                      }}
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      aria-label="Select files to attach"
                    />
                    
                    <input
                      ref={imageInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files, true);
                        }
                      }}
                      accept="image/*"
                      aria-label="Select images to attach"
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="p-3 text-purple-400 hover:text-purple-600 rounded-2xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                      aria-label="Attach file"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={sending}
                      className="p-3 text-purple-400 hover:text-purple-600 rounded-2xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                      aria-label="Attach image"
                    >
                      <Image className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${getConversationDisplayName(activeConversation)}...`}
                    className="w-full px-6 py-4 pr-16 bg-white/90 backdrop-blur-sm border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none text-gray-700 placeholder-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[3.5rem]"
                    rows={1}
                    disabled={sending}
                  />
                  
                  <button 
                    aria-label="Add emoji"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-purple-400 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-110"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex-shrink-0">
                  <button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sending}
                    className={`p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                      (newMessage.trim() || pendingAttachments.length > 0) && !sending
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-110 hover:rotate-12'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {sending ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm relative">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <MessageSquare className="h-12 w-12 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl mx-auto animate-ping opacity-20"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Select a conversation
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                Choose a conversation from the sidebar to start messaging with vendors and clients
              </p>
              <div className="mt-8">
                <div className="flex justify-center space-x-4">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce animation-delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMessagesPage;
