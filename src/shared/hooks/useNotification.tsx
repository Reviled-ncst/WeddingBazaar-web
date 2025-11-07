import { useState, useCallback } from 'react';
import type { NotificationType } from '../components/modals/NotificationModal';

interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  confirmText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

interface NotificationState extends NotificationOptions {
  isOpen: boolean;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((options: NotificationOptions) => {
    setNotification({
      ...options,
      isOpen: true
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'success' });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'error' });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'warning' });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({ message, title, type: 'info' });
  }, [showNotification]);

  const showConfirm = useCallback((message: string, onConfirm: () => void, title?: string) => {
    showNotification({
      message,
      title,
      type: 'warning',
      showCancel: true,
      onConfirm
    });
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideNotification
  };
};
