import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUniversalMessaging } from '../../contexts/UniversalMessagingContext';

export const UniversalFloatingChatButton: React.FC = () => {
  const { 
    currentUser,
    showFloatingChat, 
    conversations, 
    unreadCount,
    isMinimized,
    openConversation,
    expandChat 
  } = useUniversalMessaging();

  // Don't show if user is not authenticated
  if (!currentUser) {
    return null;
  }

  // Only show button if there are conversations AND chat is completely closed 
  // OR if chat exists but is minimized (show button below the minimized bubble)
  if (conversations.length === 0) {
    return null;
  }
  
  if (showFloatingChat && !isMinimized) {
    return null; // Only hide if chat is open and NOT minimized
  }

  const handleClick = () => {
    // If there's only one conversation, open it directly
    if (conversations.length === 1) {
      openConversation(conversations[0].id);
    } else {
      // Multiple conversations - expand the chat to show list
      expandChat();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-[9997] bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full p-4 shadow-2xl border-4 border-white transition-all duration-300 hover:scale-110 hover:shadow-3xl",
        showFloatingChat && isMinimized && "bottom-36" // Move higher when minimized chat is visible
      )}
      title={`${conversations.length} conversation${conversations.length === 1 ? '' : 's'} - ${unreadCount} unread`}
      data-testid="universal-floating-chat-button"
    >
      <div className="relative">
        <MessageCircle className="h-7 w-7" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* Role indicator badge */}
        <div className={cn(
          "absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white",
          currentUser.role === 'vendor' && "bg-blue-500",
          currentUser.role === 'couple' && "bg-green-500",
          currentUser.role === 'admin' && "bg-purple-500"
        )}>
          {currentUser.role === 'vendor' ? 'V' : currentUser.role === 'admin' ? 'A' : 'C'}
        </div>
        
        {/* Online pulse effect */}
        <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20"></div>
      </div>
    </button>
  );
};
