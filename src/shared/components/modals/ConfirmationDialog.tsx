import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  loading = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    success: {
      gradient: 'from-green-500 to-emerald-500',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      buttonGradient: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
    },
    warning: {
      gradient: 'from-yellow-500 to-orange-500',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      buttonGradient: 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
    },
    danger: {
      gradient: 'from-red-500 to-pink-500',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      buttonGradient: 'from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
    },
    info: {
      gradient: 'from-blue-500 to-purple-500',
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      buttonGradient: 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
    }
  };

  const style = typeStyles[type];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${style.gradient} p-6`}>
          <div className="flex items-center justify-between text-white">
            <h3 className="text-2xl font-bold">{title}</h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-colors disabled:opacity-50"
              title="Close dialog"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${style.iconColor}`}>
              <Icon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-lg leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 bg-gradient-to-r ${style.buttonGradient} text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
