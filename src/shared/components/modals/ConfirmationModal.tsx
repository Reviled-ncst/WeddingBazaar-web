import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Heart, AlertCircle, Info } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  icon?: 'heart' | 'check' | 'alert' | 'info';
  confirmText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  icon = 'check',
  confirmText = 'OK',
  onConfirm,
  showCancel = false,
  cancelText = 'Cancel'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (icon) {
      case 'heart':
        return <Heart size={48} className="text-rose-500 fill-rose-500" />;
      case 'check':
        return <CheckCircle2 size={48} className="text-green-500" />;
      case 'alert':
        return <AlertCircle size={48} className="text-amber-500" />;
      case 'info':
        return <Info size={48} className="text-blue-500" />;
      default:
        return <CheckCircle2 size={48} className="text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-50 to-emerald-50';
      case 'error':
        return 'from-red-50 to-rose-50';
      case 'warning':
        return 'from-amber-50 to-yellow-50';
      case 'info':
        return 'from-blue-50 to-cyan-50';
      default:
        return 'from-green-50 to-emerald-50';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';
      case 'error':
        return 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700';
      case 'warning':
        return 'from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700';
      case 'info':
        return 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700';
      default:
        return 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-md bg-gradient-to-br ${getBackgroundColor()} rounded-3xl shadow-2xl border-2 border-white/50 overflow-hidden`}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close confirmation modal"
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
              >
                <X size={20} className="text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  {getIcon()}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-700 mb-8 leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  {showCancel && (
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold border-2 border-gray-300 transition-all duration-200 hover:scale-105"
                    >
                      {cancelText}
                    </button>
                  )}
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r ${getButtonColor()} text-white rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105`}
                  >
                    {confirmText}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
