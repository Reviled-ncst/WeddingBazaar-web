import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Calendar, DollarSign, Briefcase, Heart } from 'lucide-react';

interface MarkCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: {
    coupleName: string;
    serviceType: string;
    eventDate: string;
    totalAmount: number;
    amount?: number; // Fallback field
  };
}

export const MarkCompleteModal: React.FC<MarkCompleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking
}) => {
  if (!isOpen) return null;

  // Format customer name (extract from email if needed)
  let customerName = booking.coupleName || 'the customer';
  if (customerName.includes('@')) {
    const emailName = customerName.split('@')[0];
    customerName = emailName
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  // Format event date
  const eventDate = new Date(booking.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format amount - check multiple possible fields
  const amountValue = booking.totalAmount || booking.amount || 0;
  const amount = amountValue > 0 ? `₱${amountValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₱0.00';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-2xl shadow-2xl overflow-hidden border border-pink-200/50"
          >
            {/* Decorative Header Background */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-pink-400/30 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="relative p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-full p-4 shadow-lg">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Mark Booking Complete
              </h2>

              {/* Subtitle */}
              <p className="text-center text-gray-600 mb-6 text-sm">
                Confirm that this booking has been successfully completed
              </p>

              {/* Booking Details Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-pink-200/60 shadow-md mb-6"
>
                {/* Client */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1 p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg">
                    <Heart className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Client</p>
                    <p className="text-sm font-semibold text-gray-800">{customerName}</p>
                  </div>
                </div>

                {/* Service */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1 p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Service</p>
                    <p className="text-sm font-semibold text-gray-800">{booking.serviceType}</p>
                  </div>
                </div>

                {/* Event Date */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="mt-1 p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Event Date</p>
                    <p className="text-sm font-semibold text-gray-800">{eventDate}</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Amount</p>
                    <p className="text-sm font-semibold text-gray-800">{amount}</p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Important:</span> The booking will only be fully completed when <span className="font-semibold">both you and the couple</span> confirm completion.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
