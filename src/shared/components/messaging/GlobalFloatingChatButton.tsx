import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useGlobalMessenger } from '../../contexts/GlobalMessengerContext';
import { useAuth } from '../../contexts/AuthContext';

export const GlobalFloatingChatButton: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { 
    showFloatingChat, 
    conversations, 
    totalUnreadCount,
    isMinimized,
    openFloatingChat,
    expandChat 
  } = useGlobalMessenger();

  // Don't show if user is not authenticated
  if (!isAuthenticated) return null;

  // Only show button if there are conversations AND chat is completely closed 
  // OR if chat exists but is minimized (show button below the minimized bubble)
  if (conversations.length === 0) return null;
  if (showFloatingChat && !isMinimized) return null; // Only hide if chat is open and NOT minimized

  // Debug logging for development only
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MESSENGER) {
    console.log('FloatingChatButton render:', { 
      conversations: conversations.length, 
      showFloatingChat, 
      isMinimized,
      shouldShow: conversations.length > 0 && (!showFloatingChat || isMinimized)
    });
  }

  const handleClick = () => {
    // If there's only one conversation, open it directly
    if (conversations.length === 1) {
      openFloatingChat(conversations[0].vendor);
    } else {
      // If multiple conversations, open the most recent one
      const mostRecentConversation = conversations.reduce((latest, current) => 
        current.lastActivity > latest.lastActivity ? current : latest
      );
      openFloatingChat(mostRecentConversation.vendor);
    }
    expandChat();
  };

  const buttonTitle = conversations.length === 1 
    ? `Continue chat with ${conversations[0].vendor.name}`
    : `Open chats (${conversations.length} conversations)`;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center z-[9999]",
        "focus:outline-none focus:ring-4 focus:ring-rose-300/50"
      )}
      title={buttonTitle}
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" />
      {/* Unread message indicator */}
      {totalUnreadCount > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-3 border-white flex items-center justify-center">
          <span className="text-xs text-white font-bold">{totalUnreadCount > 9 ? '9+' : totalUnreadCount}</span>
        </div>
      )}
    </button>
  );
};
