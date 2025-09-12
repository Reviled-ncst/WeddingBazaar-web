import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  notificationCount?: number;
  className?: string;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({ 
  notificationCount = 0, 
  className = '' 
}) => {
  return (
    <button 
      className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${className}`}
      title="Notifications"
    >
      <Bell className="h-5 w-5" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {notificationCount}
        </span>
      )}
    </button>
  );
};
