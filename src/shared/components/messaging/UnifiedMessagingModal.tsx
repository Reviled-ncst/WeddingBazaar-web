import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
// import { UniversalMessagesPage } from './UniversalMessagesPage'; // Temporarily disabled

export const UnifiedMessagingModal: React.FC = () => {
  const { isModalOpen, setModalOpen } = useUnifiedMessaging();

  if (!isModalOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] max-h-[600px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close messages"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Content */}
          <div className="h-full overflow-hidden">
            <div className="p-4 text-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Messaging Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Your conversation has been created successfully. <br/>
                The messaging interface is being prepared for you.
              </p>
              <p className="text-sm text-gray-500">
                You can access your messages from the Messages page in the navigation menu.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedMessagingModal;
