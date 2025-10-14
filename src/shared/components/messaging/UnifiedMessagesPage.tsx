import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Users, 
  Phone,
  Send,
  AlertCircle,
  Settings,
  Palette,
  Smile,
  FileText,
  Image,
  Link,
  Shield,
  ChevronDown,
  ChevronUp,
  Paperclip,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { useAuth } from '../../contexts/HybridAuthContext';
import { cloudinaryService } from '../../../services/cloudinaryService';

interface UnifiedMessagesPageProps {
  userType: 'vendor' | 'couple' | 'admin';
  title?: string;
  subtitle?: string;
  headerComponent?: React.ReactNode;
}

// Helper functions
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const getConversationTitle = (conv: any, currentUserId: string) => {
  // Use participant_name from backend (the other person's name)
  if (conv.participant_name && conv.participant_name !== 'Unknown') {
    return conv.participant_name;
  }
  
  // Use service_name if available
  if (conv.service_name) {
    return conv.service_name;
  }
  
  // Fallback to participants array (for legacy format)
  if (conv.participants && conv.participantNames) {
    const otherParticipants = conv.participants
      .filter((id: string) => id !== currentUserId)
      .map((id: string) => conv.participantNames[id] || 'Unknown')
      .join(', ');
    
    if (otherParticipants && otherParticipants !== 'Unknown') {
      return otherParticipants;
    }
  }
  
  return 'Conversation';
};

// Helper function to get preview text for conversation list
const getMessagePreview = (message: any) => {
  if (!message?.content) return 'No messages yet';
  
  const isCloudinaryUrl = (url: string) => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || 
           (isCloudinaryUrl(url) && !url.includes('/raw/upload/'));
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = message.content.match(urlRegex);
  
  if (urls && urls.length > 0) {
    const url = urls[0];
    const textParts = message.content.split(url);
    const textBefore = textParts[0]?.trim();
    
    if (isImageUrl(url)) {
      return textBefore ? `${textBefore} 📷 Photo` : '📷 Photo';
    } else {
      return textBefore ? `${textBefore} 📎 File` : '📎 File';
    }
  }
  
  // Regular text message - truncate if too long
  return message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content;
};

export const UnifiedMessagesPage: React.FC<UnifiedMessagesPageProps> = ({
  userType
}) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    setActiveConversation,
    loadMessages,
    loadConversations
  } = useUnifiedMessaging();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justSentMessage, setJustSentMessage] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    url: string;
    type: 'image' | 'video';
    title?: string;
  }>({
    isOpen: false,
    url: '',
    type: 'image'
  });


  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      setActiveConversation(selectedConversation);
    }
  }, [selectedConversation, loadMessages, setActiveConversation]);

  // Cleanup object URLs when attachment preview changes
  useEffect(() => {
    return () => {
      if (attachmentPreview && attachmentPreview.type.startsWith('image/')) {
        URL.revokeObjectURL(URL.createObjectURL(attachmentPreview));
      }
    };
  }, [attachmentPreview]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    const title = getConversationTitle(conv, user?.id || '');
    const lastMessageContent = conv.lastMessage?.content || '';
    
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessageContent.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !attachmentPreview) || !selectedConversation) return;

    setIsUploading(true);
    setUploadError(null);
    
    try {
      let messageContent = messageText.trim();
      let messageType: 'text' | 'image' | 'file' = 'text';

      // If there's an attachment, upload it to Cloudinary first
      if (attachmentPreview) {
        console.log('📎 Uploading attachment to Cloudinary...', attachmentPreview.name);
        
        const uploadResponse = await cloudinaryService.uploadFile(
          attachmentPreview, 
          'message-attachments'
        );
        
        console.log('✅ Attachment uploaded successfully:', uploadResponse.secure_url);
        
        // Set message content to the Cloudinary URL
        messageContent = uploadResponse.secure_url;
        
        // Determine message type based on file type
        messageType = attachmentPreview.type.startsWith('image/') ? 'image' : 'file';
        
        // If there's text along with the attachment, combine them
        if (messageText.trim()) {
          messageContent = `${messageText.trim()}\n${uploadResponse.secure_url}`;
        }
      }

      // Send the message through the unified messaging system
      await sendMessage(selectedConversation, messageContent, messageType);
      
      // Clear the input and attachment
      setMessageText('');
      setAttachmentPreview(null);
      
      // Trigger success animation
      setJustSentMessage(true);
      setTimeout(() => setJustSentMessage(false), 1000);
      
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageAttachment = () => {
    if (isUploading) return; // Prevent multiple uploads
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError('Image size must be less than 10MB');
          return;
        }
        
        setAttachmentPreview(file);
        setUploadError(null);
        console.log('📷 Image selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    };
    input.click();
  };

  const handleFileAttachment = () => {
    if (isUploading) return; // Prevent multiple uploads
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.zip,.rar,.xlsx,.pptx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError('File size must be less than 10MB');
          return;
        }
        
        setAttachmentPreview(file);
        setUploadError(null);
        console.log('📎 File selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    };
    input.click();
  };

  // Media viewer functions
  const openMediaViewer = (url: string, type: 'image' | 'video', title?: string) => {
    console.log('🖼️ Opening media viewer:', { url, type, title });
    setMediaViewer({ isOpen: true, url, type, title });
  };

  const closeMediaViewer = () => {
    console.log('❌ Closing media viewer');
    setMediaViewer({ isOpen: false, url: '', type: 'image' });
  };

  // Handle keyboard events for media viewer
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (mediaViewer.isOpen && e.key === 'Escape') {
        closeMediaViewer();
      }
    };

    if (mediaViewer.isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [mediaViewer.isOpen]);

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = mediaViewer.url;
    link.download = mediaViewer.title || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to render message content based on message type
  const renderMessageContent = (message: any) => {
    const isCloudinaryUrl = (url: string) => {
      return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
    };

    const isImageUrl = (url: string) => {
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || 
             (isCloudinaryUrl(url) && !url.includes('/raw/upload/'));
    };

    const isVideoUrl = (url: string) => {
      return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url) ||
             (isCloudinaryUrl(url) && url.includes('/video/upload/'));
    };

    // Check if message contains a URL (could be Cloudinary or other)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);
    
    if (urls && urls.length > 0) {
      const url = urls[0];
      const textParts = message.content.split(url);
      const textBefore = textParts[0]?.trim();
      const textAfter = textParts[1]?.trim();
      
      if (isImageUrl(url)) {
        // Render image with modal viewer
        return (
          <div className="space-y-2">
            {textBefore && (
              <p className="text-sm break-words leading-relaxed">{textBefore}</p>
            )}
            <div 
              className="rounded-lg overflow-hidden max-w-xs relative group cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Image clicked, opening viewer for:', url);
                openMediaViewer(url, 'image', 'Shared Image');
              }}
            >
              <img 
                src={url} 
                alt="Shared image" 
                className="w-full h-auto max-h-64 object-cover hover:opacity-90 transition-opacity"
                onError={(e) => {
                  // Fallback to showing URL if image fails to load
                  console.log('❌ Image failed to load:', url);
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<p class="text-sm text-blue-500 underline cursor-pointer">${url}</p>`;
                    parent.onclick = () => window.open(url, '_blank');
                  }
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
            {textAfter && (
              <p className="text-sm break-words leading-relaxed">{textAfter}</p>
            )}
          </div>
        );
      } else if (isVideoUrl(url)) {
        // Render video with modal viewer
        return (
          <div className="space-y-2">
            {textBefore && (
              <p className="text-sm break-words leading-relaxed">{textBefore}</p>
            )}
            <div 
              className="rounded-lg overflow-hidden max-w-xs relative group cursor-pointer" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎥 Video clicked, opening viewer for:', url);
                openMediaViewer(url, 'video', 'Shared Video');
              }}
            >
              <video 
                src={url} 
                className="w-full h-auto max-h-64 object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-none">
                <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover:bg-opacity-100 transition-all duration-200">
                  <Play className="w-6 h-6 text-gray-800" />
                </div>
              </div>
            </div>
            {textAfter && (
              <p className="text-sm break-words leading-relaxed">{textAfter}</p>
            )}
          </div>
        );
      } else {
        // Render file/document link
        return (
          <div className="space-y-2">
            {textBefore && (
              <p className="text-sm break-words leading-relaxed">{textBefore}</p>
            )}
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700 underline truncate max-w-xs"
              >
                {url.split('/').pop()?.split('?')[0] || 'Download File'}
              </a>
            </div>
            {textAfter && (
              <p className="text-sm break-words leading-relaxed">{textAfter}</p>
            )}
          </div>
        );
      }
    }
    
    // Regular text message
    return <p className="text-sm break-words leading-relaxed">{message.content}</p>;
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="flex h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-160px)] bg-white relative overflow-hidden rounded-lg shadow-lg">
      {/* Mobile overlay when user info is open */}
      {showUserInfo && (
        <div 
          className="sm:hidden absolute inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowUserInfo(false)}
        />
      )}
      {/* Conversations List */}
      <div className={cn(
        "bg-white border-r border-gray-200 relative z-10 flex-shrink-0",
        "w-full sm:w-80 md:w-96 lg:w-80 xl:w-96",
        showUserInfo ? "hidden sm:block sm:w-60 md:w-72 lg:w-60 xl:w-72" : "sm:w-80 md:w-96 lg:w-80 xl:w-96"
      )}>
        {/* Header */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Chats</h1>
          
          {/* Search */}
          <div className="relative mt-1 sm:mt-2">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search Messenger"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-100">
          {loading && conversations.length === 0 ? (
            <div className="space-y-2 p-2 sm:p-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24 sm:w-32"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 w-full">
                <div className="flex items-center text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="font-medium text-sm sm:text-base">Error</span>
                </div>
                <p className="text-xs sm:text-sm text-red-500">{error}</p>
                <button 
                  onClick={loadConversations}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-gray-500">
              <div className="bg-gray-50 rounded-full p-3 mb-3">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-sm text-gray-700 mb-1">No conversations</h3>
              <p className="text-xs text-center">
                {searchTerm ? 'No conversations match your search' : 'Start messaging with vendors and couples'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  layoutId={`conversation-${conversation.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 1
                  }}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    "px-2 sm:px-3 lg:px-4 py-2 sm:py-3 cursor-pointer transition-colors relative",
                    selectedConversation === conversation.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-100"
                  )}
                >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      "bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold",
                      "w-10 h-10 text-sm sm:w-12 sm:h-12 sm:text-base lg:w-14 lg:h-14 lg:text-lg"
                    )}>
                      {getConversationTitle(conversation, user?.id || '').charAt(0).toUpperCase()}
                    </div>
                    {/* Online status indicator */}
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"
                    ></motion.div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {getConversationTitle(conversation, user?.id || '')}
                      </h3>
                      <span className="text-xs text-gray-500 ml-1 sm:ml-2 flex-shrink-0">
                        {((conversation as any).last_message_time || conversation.lastMessage?.timestamp) && 
                          formatTime((conversation as any).last_message_time || conversation.lastMessage?.timestamp)
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate pr-1 sm:pr-2">
                        {conversation.lastMessage?.senderType === userType.toLowerCase() ? 'You: ' : ''}
                        {getMessagePreview(conversation.lastMessage || { content: (conversation as any).last_message })}
                      </p>
                      {((conversation as any).unread_count || conversation.unreadCount) > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="bg-pink-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium flex-shrink-0 animate-pulse"
                        >
                          {(conversation as any).unread_count || conversation.unreadCount}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {selectedConv ? (
            <motion.div
              key={selectedConv.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col h-full"
            >
            {/* Chat Header */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                      {getConversationTitle(selectedConv, user?.id || '').charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                      {getConversationTitle(selectedConv, user?.id || '')}
                    </h2>
                    <p className="text-xs sm:text-sm text-green-600">Active now</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button 
                    title="Start voice call"
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </button>
                  <button 
                    title="View conversation details"
                    onClick={() => setShowUserInfo(!showUserInfo)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-3 bg-white"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center px-4">
                    <div className="bg-blue-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-700 mb-2">Send a message to start the conversation</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Select a conversation to view messages</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 25,
                      delay: index < 10 ? index * 0.05 : 0 // Stagger only first 10 messages
                    }}
                    layout
                    className={cn(
                      "flex mb-2 sm:mb-3",
                      message.senderId === user?.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex items-end space-x-1.5 sm:space-x-2 max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg">
                      {message.senderId !== user?.id && (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {message.senderName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div
                        className={cn(
                          "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl max-w-full",
                          message.senderId === user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Message Input */}
            <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white border-t border-gray-200">
              {/* Attachment Preview */}
              {attachmentPreview && (
                <div className="mb-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {attachmentPreview.type.startsWith('image/') ? (
                        // Show image preview for images
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(attachmentPreview)}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                            <Image className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      ) : (
                        // Show icon for non-images
                        <div className="p-2 rounded-full bg-gray-100">
                          <Paperclip className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                          {attachmentPreview.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachmentPreview.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAttachmentPreview(null)}
                      disabled={isUploading}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                  {isUploading && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading to Cloudinary...</span>
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-2 flex items-center space-x-2 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                {/* Attachment Buttons */}
                <div className="flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImageAttachment}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200"
                    title="Attach Image"
                  >
                    <Image className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFileAttachment}
                    className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-full transition-all duration-200"
                    title="Attach File"
                  >
                    <Paperclip className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Aa"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full px-3 sm:px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: isUploading ? 1 : 1.05 }}
                  whileTap={{ scale: isUploading ? 1 : 0.95 }}
                  animate={{ 
                    scale: justSentMessage ? [1, 1.2, 1] : 1,
                    backgroundColor: justSentMessage ? "#10b981" : undefined
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={handleSendMessage}
                  disabled={(!messageText.trim() && !attachmentPreview) || isUploading}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200 flex-shrink-0 relative",
                    justSentMessage
                      ? "bg-green-500 text-white"
                      : (messageText.trim() || attachmentPreview) && !isUploading
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
            </motion.div>
          ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center px-4">
              <div className="bg-blue-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Your Messages</h3>
              <p className="text-xs sm:text-sm text-gray-500">Send private messages to your friends</p>
            </div>
          </div>
        )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar - User Info Panel */}
      {showUserInfo && selectedConv && (
        <div className={cn(
          "bg-gray-900 text-white border-l border-gray-700 overflow-y-auto flex-shrink-0",
          "w-full sm:w-80 md:w-96 lg:w-80 xl:w-96",
          "absolute sm:relative top-0 left-0 right-0 bottom-0 sm:top-auto sm:left-auto sm:right-auto sm:bottom-auto z-50 sm:z-auto"
        )}>
          {/* Close button for mobile */}
          <div className="sm:hidden flex justify-end p-4">
            <button 
              onClick={() => setShowUserInfo(false)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Close user info"
              aria-label="Close user info panel"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 sm:p-6 text-center border-b border-gray-700">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl mx-auto mb-3">
              {getConversationTitle(selectedConv, user?.id || '').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-1">
              {getConversationTitle(selectedConv, user?.id || '')}
            </h2>
            <p className="text-green-400 text-sm mb-4">Active 32m ago</p>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-2 sm:space-x-4">
              <button className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs">Profile</span>
              </button>
              <button className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs">Mute</span>
              </button>
              <button className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-xs">Search</span>
              </button>
            </div>
          </div>

          {/* Chat Info Section */}
          <div className="border-b border-gray-700">
            <button className="w-full p-4 text-left hover:bg-gray-800 transition-colors flex items-center justify-between">
              <span className="font-medium">Chat info</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Customize Chat Section */}
          <div className="border-b border-gray-700">
            <button className="w-full p-4 text-left hover:bg-gray-800 transition-colors flex items-center justify-between">
              <span className="font-medium">Customize chat</span>
              <ChevronUp className="w-4 h-4" />
            </button>
            
            {/* Expanded Customize Options */}
            <div className="bg-gray-800">
              <button className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center">
                <Palette className="w-5 h-5 mr-3 text-pink-400" />
                <span>Change theme</span>
              </button>
              <button className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center">
                <Smile className="w-5 h-5 mr-3 text-yellow-400" />
                <span>Change emoji</span>
              </button>
              <button className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center">
                <FileText className="w-5 h-5 mr-3 text-blue-400" />
                <span>Edit nicknames</span>
              </button>
            </div>
          </div>

          {/* Media, Files and Links Section */}
          <div className="border-b border-gray-700">
            <button className="w-full p-4 text-left hover:bg-gray-800 transition-colors flex items-center justify-between">
              <span className="font-medium">Media, files and links</span>
              <ChevronUp className="w-4 h-4" />
            </button>
            
            {/* Expanded Media Options */}
            <div className="bg-gray-800">
              <button className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center">
                <Image className="w-5 h-5 mr-3 text-green-400" />
                <span>Media</span>
              </button>
              <button className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center">
                <FileText className="w-5 h-5 mr-3 text-orange-400" />
                <span>Files</span>
              </button>
              <button className="w-full p-4 text-left hover:bg-gray-700 transition-colors flex items-center">
                <Link className="w-5 h-5 mr-3 text-purple-400" />
                <span>Links</span>
              </button>
            </div>
          </div>

          {/* Privacy & Support Section */}
          <div>
            <button className="w-full p-4 text-left hover:bg-gray-800 transition-colors flex items-center justify-between">
              <span className="font-medium">Privacy & support</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Media Viewer Modal */}
      {mediaViewer.isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-full max-h-full p-4">
            {/* Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeMediaViewer}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
                <h3 className="text-white font-medium">{mediaViewer.title}</h3>
              </div>
              

              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={downloadMedia}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              >
                <Download className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Media Content */}
            <div className="flex items-center justify-center min-h-[80vh]">
              {mediaViewer.type === 'image' ? (
                <img
                  src={mediaViewer.url}
                  alt={mediaViewer.title}
                  className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                />
              ) : (
                <video
                  src={mediaViewer.url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeMediaViewer}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedMessagesPage;
