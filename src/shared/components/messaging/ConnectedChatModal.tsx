import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, AlertCircle, Wifi, Shield } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { NotificationModal } from '../modals';

interface ConnectedChatModalProps {
  conversations: any[];
  activeConversation: any;
  messages: any[];
  loading: boolean;
  sending: boolean;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  setModalOpen: (open: boolean) => void;
  user: any;
}

export const ConnectedChatModal: React.FC<ConnectedChatModalProps> = ({
  conversations,
  activeConversation,
  messages,
  loading,
  sending,
  loadMessages,
  sendMessage,
  setModalOpen,
  user
}) => {
  const { notification, showNotification, hideNotification } = useNotification();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load messages for active conversation (only when conversation changes)
  useEffect(() => {
    if (activeConversation?.id) {
      console.log('🔄 [ConnectedChatModal] Loading messages for conversation:', {
        conversationId: activeConversation.id,
        conversationData: activeConversation,
        loadMessagesFunction: typeof loadMessages
      });
      
      // Ensure we have a valid loadMessages function
      if (typeof loadMessages === 'function') {
        loadMessages(activeConversation.id).catch(error => {
          console.error('❌ [ConnectedChatModal] Failed to load messages:', error);
        });
      } else {
        console.error('❌ [ConnectedChatModal] loadMessages is not a function:', loadMessages);
      }
    } else {
      console.log('⚠️ [ConnectedChatModal] No active conversation to load messages for');
    }
  }, [activeConversation?.id, loadMessages]);

  const handleSendMessage = async () => {
    console.log('🔘 [ConnectedChatModal] Send button clicked!');
    console.log('🔍 [ConnectedChatModal] Current state:', {
      hasMessage: !!newMessage.trim(),
      messageContent: newMessage,
      hasConversation: !!activeConversation?.id,
      conversationId: activeConversation?.id,
      notSending: !sending,
      sendingState: sending,
      userId: user?.id,
      userEmail: user?.email,
      activeConversation: activeConversation
    });

    if (!newMessage.trim()) {
      console.warn('⚠️ [ConnectedChatModal] No message content');
      return;
    }

    if (!activeConversation?.id) {
      console.error('❌ [ConnectedChatModal] No active conversation ID');
      showNotification({
        title: 'No Conversation Selected',
        message: 'Please select a conversation to send messages.',
        type: 'warning',
        customIcon: AlertCircle
      });
      return;
    }

    if (sending) {
      console.warn('⚠️ [ConnectedChatModal] Already sending a message');
      return;
    }

    if (!user?.id) {
      console.error('❌ [ConnectedChatModal] No user ID found');
      showNotification({
        title: 'Not Authenticated',
        message: 'Please log in again to send messages.',
        type: 'error',
        customIcon: Shield
      });
      return;
    }

    console.log('📤 [ConnectedChatModal] Attempting to send message:', {
      conversationId: activeConversation.id,
      message: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
      sendMessageFunction: typeof sendMessage
    });
    
    try {
      await sendMessage(activeConversation.id, newMessage.trim());
      setNewMessage('');
      console.log('✅ [ConnectedChatModal] Message sent successfully, input cleared');
    } catch (error) {
      console.error('❌ [ConnectedChatModal] Error sending message:', error);
      
      // Provide more specific error messages with appropriate modals
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          showNotification({
            title: 'Service Unavailable',
            message: 'Messaging service not available. Please try again later.',
            type: 'error',
            customIcon: AlertCircle
          });
        } else if (error.message.includes('Failed to fetch')) {
          showNotification({
            title: 'Connection Error',
            message: 'Please check your internet connection and try again.',
            type: 'error',
            customIcon: Wifi
          });
        } else if (error.message.includes('403') || error.message.includes('401')) {
          showNotification({
            title: 'Authentication Error',
            message: 'Please log in again to continue.',
            type: 'error',
            customIcon: Shield
          });
        } else {
          showNotification({
            title: 'Message Failed',
            message: `Failed to send message: ${error.message}`,
            type: 'error',
            customIcon: AlertCircle
          });
        }
      } else {
        showNotification({
          title: 'Message Failed',
          message: 'Failed to send message. Please try again.',
          type: 'error',
          customIcon: AlertCircle
        });
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get vendor name from active conversation
  const getVendorName = (): string => {
    if (activeConversation) {
      console.log('🔍 [ConnectedChatModal] Getting vendor name from conversation:', {
        conversationId: activeConversation.id,
        participantName: activeConversation.participant_name,
        participantNames: activeConversation.participantNames,
        creatorName: activeConversation.creator_name,
        vendorBusinessName: activeConversation.vendor_business_name,
        businessContext: activeConversation.businessContext,
        currentUserId: user?.id,
        currentUserName: user?.name,
        currentUserEmail: user?.email
      });

      // Priority 1: Use participant_name from backend (most reliable)
      if (activeConversation.participant_name && activeConversation.participant_name !== 'undefined') {
        console.log('✅ [ConnectedChatModal] Using participant_name:', activeConversation.participant_name);
        return activeConversation.participant_name;
      }

      // Priority 2: Use business context vendor name
      if (activeConversation.businessContext?.vendorBusinessName) {
        console.log('✅ [ConnectedChatModal] Using businessContext vendor name:', activeConversation.businessContext.vendorBusinessName);
        return activeConversation.businessContext.vendorBusinessName;
      }

      // Priority 3: Use creator_name if it's not the current user
      if (activeConversation.creator_name && activeConversation.creator_id !== user?.id) {
        console.log('✅ [ConnectedChatModal] Using creator_name:', activeConversation.creator_name);
        return activeConversation.creator_name;
      }

      // Priority 4: Try participantNames object (fallback)
      if (activeConversation.participantNames) {
        const participantNames = Object.values(activeConversation.participantNames) as string[];
        const otherParticipant = participantNames.find(name => 
          name !== user?.name && 
          name !== user?.email && 
          name !== 'undefined' && 
          name && 
          name.trim()
        );
        if (otherParticipant) {
          console.log('✅ [ConnectedChatModal] Using participantNames:', otherParticipant);
          return otherParticipant;
        }
      }

      // Priority 5: Use service-based name
      if (activeConversation.service_name) {
        const serviceName = `${activeConversation.service_name} Provider`;
        console.log('✅ [ConnectedChatModal] Using service-based name:', serviceName);
        return serviceName;
      }

      console.log('⚠️ [ConnectedChatModal] No specific vendor name found, using default');
    }
    return 'Wedding Vendor';
  };

  const getVendorInitial = (): string => {
    const name = getVendorName();
    return typeof name === 'string' ? name.charAt(0).toUpperCase() : 'V';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getVendorInitial()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getVendorName()}</h2>
              <p className="text-sm text-gray-500">Wedding Service Discussion</p>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 mx-auto mb-4 border-4 border-pink-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Conversation</h3>
              <p className="text-gray-600 mb-4">
                Your conversation with {getVendorName()} has been created. <br/>
                Send your first message about your wedding service needs!
              </p>
              {/* Debug info for development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs text-gray-400">
                  <summary>Debug Info</summary>
                  <pre className="mt-2 text-left">
                    {JSON.stringify({
                      conversationId: activeConversation?.id,
                      messagesLength: messages?.length,
                      loading,
                      vendorName: getVendorName(),
                      userId: user?.id
                    }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isFromCurrentUser = message.senderId === user?.id;
                const messageTime = new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });

                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end max-w-xs lg:max-w-md">
                      {!isFromCurrentUser && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2 mb-1">
                          <User className="h-3 w-3 text-gray-600" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isFromCurrentUser
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-white text-gray-900 shadow-sm border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${isFromCurrentUser ? 'text-pink-100' : 'text-gray-500'}`}>
                          {messageTime}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${getVendorName()}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                rows={1}
                disabled={sending}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-xl transition-colors ${
                newMessage.trim() && !sending
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {sending ? (
                <div className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          {activeConversation && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Continue in Messages page for full features
            </p>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        confirmText={notification.confirmText}
        showCancel={notification.showCancel}
        onConfirm={notification.onConfirm}
        customIcon={notification.customIcon}
        iconColor={notification.iconColor}
        size={notification.size}
      />
    </div>
  );
};

export default ConnectedChatModal;
