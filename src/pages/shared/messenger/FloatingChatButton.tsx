import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnreadMessages?: boolean;
  isVisible?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  hasUnreadMessages = false,
  isVisible = true
}) => {
  // Debug logging for development only
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MESSENGER) {
    console.log('FloatingChatButton rendered with:', { isVisible, hasUnreadMessages });
  }
  
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center z-[9999]",
        "focus:outline-none focus:ring-4 focus:ring-rose-300/50",
        hasUnreadMessages && "animate-pulse"
      )}
      title="Open chat"
      aria-label="Open floating chat"
    >
      <MessageCircle className="h-6 w-6" />
      {hasUnreadMessages && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}
    </button>
  );
};
