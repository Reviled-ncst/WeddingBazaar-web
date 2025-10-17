import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { useMessagingModal } from '../integration/MessagingModalProvider';
import { useUnifiedMessaging } from '../../../contexts/UnifiedMessagingContext';
import { QUICK_START_MESSAGES } from '../../../types/messaging-modal.types';
import type { QuickStartMessage } from '../../../types/messaging-modal.types';

export const MessagingModal: React.FC = () => {
  const {
    isOpen,
    loading,
    error,
    vendorInfo,
    serviceInfo,
    messages: modalMessages,
    sending,
    closeModal,
    sendMessage,
    clearError
  } = useMessagingModal();

  // Get unified messages as fallback
  const { messages: unifiedMessages } = useUnifiedMessaging();
  
  // Use unified messages if modal messages are empty
  const messages = (modalMessages && modalMessages.length > 0) ? modalMessages : unifiedMessages;
  
  // Debug logging
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 [MessagingModal] Modal opened with:');
      console.log('   Modal messages:', modalMessages?.length || 0);
      console.log('   Unified messages:', unifiedMessages?.length || 0);
      console.log('   Final messages:', messages?.length || 0);
    }
  }, [isOpen, modalMessages, unifiedMessages, messages]);

  const [newMessage, setNewMessage] = React.useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickMessage = async (quickMessage: QuickStartMessage) => {
    try {
      await sendMessage(quickMessage.text);
    } catch (error) {
      console.error('Error sending quick message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-pink-100 bg-gradient-to-r from-pink-50 via-white to-rose-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div 
                className="absolute top-4 right-20 text-pink-300"
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-4 w-4" />
              </motion.div>
              <motion.div 
                className="absolute bottom-2 left-8 text-rose-300"
                animate={{ 
                  y: [0, -3, 0],
                  scale: [1, 1.1, 1] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Sparkles className="h-3 w-3" />
              </motion.div>
            </div>

            <div className="flex items-center space-x-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {vendorInfo?.name ? vendorInfo.name.charAt(0).toUpperCase() : 'V'}
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-pink-800 bg-clip-text text-transparent">
                  {vendorInfo?.name || 'Wedding Vendor'}
                </h2>
                <p className="text-sm text-pink-600 font-medium">
                  {serviceInfo ? `${serviceInfo.name} Discussion` : 'Wedding Service Conversation'}
                </p>
                {serviceInfo?.category && (
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    {serviceInfo.category}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={closeModal}
              className="p-2 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group relative z-10"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-pink-500 group-hover:text-pink-600" />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
            >
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={clearError}
                className="text-red-400 hover:text-red-600 ml-2"
                aria-label="Clear error message"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-pink-50/30 via-white to-rose-50/30">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative mx-auto mb-4 w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
                    <Heart className="absolute inset-0 m-auto h-5 w-5 text-pink-500 animate-pulse" />
                  </div>
                  <p className="text-pink-600 font-medium">Loading conversation...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <motion.div 
                    className="text-6xl mb-6"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0] 
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    💬
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Start Your Conversation
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Chat with <span className="font-semibold text-pink-600">{vendorInfo?.name}</span> about your 
                    {serviceInfo ? ` ${serviceInfo.name}` : ' wedding service'} needs!
                  </p>
                  
                  {/* Quick Start Messages */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">Quick start messages:</p>
                    <div className="grid gap-2">
                      {QUICK_START_MESSAGES.slice(0, 4).map((quickMessage) => (
                        <motion.button
                          key={quickMessage.id}
                          onClick={() => handleQuickMessage(quickMessage)}
                          disabled={sending}
                          className="text-left p-3 bg-white/80 backdrop-blur-sm border border-pink-100 rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-gray-700 group-hover:text-pink-700">
                            {quickMessage.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages with proper alignment */}
                {messages.map((message, index) => {
                  const isUser = message.senderType === 'couple' || message.senderId === 'demo-user-001'; // User messages go on right
                  
                  return (
                    <div 
                      key={message.id || index} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                        <div 
                          className={`p-4 rounded-2xl shadow-sm ${
                            isUser 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white ml-auto'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            isUser ? 'text-pink-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {!isUser && (
                          <p className="text-xs text-gray-500 mt-1 px-1">
                            {vendorInfo?.name || 'Vendor'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-pink-100 bg-gradient-to-r from-white/95 via-pink-50/50 to-rose-50/30 backdrop-blur-sm">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${vendorInfo?.name || 'vendor'} about your wedding...`}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-pink-100 rounded-2xl focus:ring-4 focus:ring-pink-200/60 focus:border-pink-400 transition-all duration-300 resize-none text-gray-700 placeholder-pink-400 min-h-[50px] max-h-[120px]"
                  rows={1}
                  disabled={sending}
                />
              </div>
              
              <motion.button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${
                  newMessage.trim() && !sending
                    ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white hover:from-pink-600 hover:via-pink-700 hover:to-rose-600 hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
              >
                {sending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
