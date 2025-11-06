import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  notificationCount?: number;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({ 
  notificationCount = 0, 
  className = '',
  onClick,
  isOpen = false
}) => {
  return (
    <button 
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
        isOpen ? 'bg-gray-100 text-gray-900' : ''
      } ${className}`}
      title="Notifications"
    >
      <Bell className="h-5 w-5" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  );
};
