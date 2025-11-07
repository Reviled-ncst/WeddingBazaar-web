import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: NotificationType;
  confirmText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  showCancel = false,
  onConfirm
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50';
      case 'error':
        return 'border-red-300 bg-gradient-to-br from-red-50 to-rose-50';
      case 'warning':
        return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50';
      case 'info':
      default:
        return 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50';
    }
  };

  const getButtonClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl border-2 ${getColorClasses()} animate-scaleIn`}>
        {/* Close button */}
        <button
          onClick={onClose}
          title="Close"
          aria-label="Close notification"
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-50 transition-all"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-gray-800 text-center mb-3">
              {title}
            </h3>
          )}

          {/* Message */}
          <div className="text-gray-700 text-center mb-6 whitespace-pre-line">
            {message}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl ${getButtonClasses()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
