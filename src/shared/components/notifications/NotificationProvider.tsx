import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from './Toast';
import type { ToastProps } from './Toast';

interface NotificationContextType {
  showNotification: (notification: Omit<ToastProps, 'id' | 'onClose'>) => string;
  showSuccess: (title: string, message?: string, action?: ToastProps['action']) => string;
  showError: (title: string, message?: string, action?: ToastProps['action']) => string;
  showWarning: (title: string, message?: string, action?: ToastProps['action']) => string;
  showInfo: (title: string, message?: string, action?: ToastProps['action']) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  position = 'top-right'
}) => {
  const [notifications, setNotifications] = useState<ToastProps[]>([]);

  const showNotification = useCallback((notification: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newNotification: ToastProps = {
      ...notification,
      id,
      onClose: removeNotification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit the number of notifications
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return showNotification({ type: 'success', title, message, action });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return showNotification({ type: 'error', title, message, action });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return showNotification({ type: 'warning', title, message, action });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return showNotification({ type: 'info', title, message, action });
  }, [showNotification]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
        clearAllNotifications
      }}
    >
      {children}
      
      {/* Toast Container */}
      <div className={`fixed ${getPositionClasses()} z-50 space-y-2 pointer-events-none`}>
        <AnimatePresence>
          {notifications.map(notification => (
            <Toast key={notification.id} {...notification} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
