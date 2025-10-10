import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';

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
      console.log('🔄 [ConnectedChatModal] Loading messages for conversation:', activeConversation.id);
      loadMessages(activeConversation.id);
    }
  }, [activeConversation?.id, loadMessages]); // Include loadMessages dependency

  const handleSendMessage = async () => {
    console.log('🔘 [ConnectedChatModal] Send button clicked!');
    console.log('🔍 [ConnectedChatModal] Validation checks:', {
      hasMessage: !!newMessage.trim(),
      hasConversation: !!activeConversation?.id,
      notSending: !sending,
      conversationId: activeConversation?.id
    });

    if (!newMessage.trim() || !activeConversation?.id || sending) {
      console.warn('⚠️ [ConnectedChatModal] Send blocked by validation');
      return;
    }

    console.log('📤 [ConnectedChatModal] Attempting to send message:', newMessage);
    console.log('🎛️ [ConnectedChatModal] sendMessage function:', typeof sendMessage);
    
    try {
      await sendMessage(activeConversation.id, newMessage.trim());
      setNewMessage('');
      console.log('✅ [ConnectedChatModal] Message sent successfully, input cleared');
    } catch (error) {
      console.error('❌ [ConnectedChatModal] Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
      // Get participant names from the conversation
      const participantNames = Object.values(activeConversation.participantNames || {}) as string[];
      // Find the name that's not the current user
      return participantNames.find(name => name !== user?.name) || 'Vendor';
    }
    return 'Vendor';
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
    </div>
  );
};

export default ConnectedChatModal;
