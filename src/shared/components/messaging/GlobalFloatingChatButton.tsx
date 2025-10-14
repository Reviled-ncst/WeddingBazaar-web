import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { useAuth } from '../../contexts/HybridAuthContext';

export const GlobalFloatingChatButton: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    unreadCount,
    setModalOpen
  } = useUnifiedMessaging();

  // Only show for authenticated users and not on the messages page itself
  const shouldShow = user && !window.location.pathname.includes('/messages');

  const handleOpenChat = () => {
    console.log('🗨️ [GlobalFloatingChatButton] Opening chat modal');
    setModalOpen(true);
  };

  if (!shouldShow) return null;

  const hasUnreadMessages = unreadCount > 0;

  return (
    <button
      onClick={handleOpenChat}
      className={cn(
        "fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center",
        "focus:outline-none focus:ring-4 focus:ring-rose-300/50",
        hasUnreadMessages && "animate-pulse",
        // Ensure we're on top of everything
        "z-[9999]"
      )}
      title={`Open chat${hasUnreadMessages ? ` (${unreadCount} unread)` : ''}`}
      aria-label={`Open floating chat${hasUnreadMessages ? ` with ${unreadCount} unread messages` : ''}`}
    >
      <MessageCircle className="h-6 w-6" />
      {hasUnreadMessages && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
        </div>
      )}
    </button>
  );
};
