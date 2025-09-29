import React from 'react';
import { Calendar, CheckCircle, DollarSign, MessageSquare, Star } from 'lucide-react';

interface BookingNotification {
  id: string;
  type: 'booking_inquiry' | 'message_received' | 'payment_received' | 'booking_confirmed' | 'quote_accepted' | 'quote_rejected' | 'booking_cancelled' | 'review_received';
  title: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  bookingId?: string;
  coupleId?: string;
  read: boolean;
  actionRequired?: boolean;
}

interface NotificationDebugPanelProps {
  notifications: BookingNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDebugPanel: React.FC<NotificationDebugPanelProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <h3 className="font-semibold text-yellow-800 mb-3">🔧 Notification Debug Panel</h3>
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <strong>Total Notifications:</strong> {notifications.length}
        </div>
        <div>
          <strong>Unread Count:</strong> {unreadCount}
        </div>
        <div>
          <strong>Last Update:</strong> {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-yellow-700">No notifications found</p>
        ) : (
          notifications.slice(0, 3).map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg border ${
                !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${
                  notification.type === 'booking_inquiry' ? 'bg-blue-100 text-blue-600' :
                  notification.type === 'quote_accepted' ? 'bg-green-100 text-green-600' :
                  notification.type === 'payment_received' ? 'bg-purple-100 text-purple-600' :
                  notification.type === 'message_received' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notification.type === 'booking_inquiry' && <Calendar className="h-3 w-3" />}
                  {notification.type === 'quote_accepted' && <CheckCircle className="h-3 w-3" />}
                  {notification.type === 'payment_received' && <DollarSign className="h-3 w-3" />}
                  {notification.type === 'message_received' && <MessageSquare className="h-3 w-3" />}
                  {notification.type === 'review_received' && <Star className="h-3 w-3" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-xs">{notification.title}</p>
                    {!notification.read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 3 && (
        <p className="text-xs text-yellow-700 mt-2">
          ... and {notifications.length - 3} more notifications
        </p>
      )}
      
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="mt-3 px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700"
        >
          Mark All {unreadCount} As Read
        </button>
      )}
    </div>
  );
};
