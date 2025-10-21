import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, DollarSign, Package } from 'lucide-react';

interface ServiceItem {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: {
    vendorName?: string;
    serviceType?: string;
    totalAmount?: number;
    eventDate?: string;
    eventLocation?: string | null;
    serviceItems?: ServiceItem[];
  } | null;
  type: 'accept' | 'reject' | 'modify';
}

export const QuoteConfirmationModal: React.FC<QuoteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  type
}) => {
  if (!isOpen || !booking) return null;

  const config = {
    accept: {
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100',
      title: 'Accept Quote?',
      message: 'Are you sure you want to accept this quote? Once accepted, you can proceed with payment.',
      confirmText: 'Yes, Accept Quote',
      confirmClass: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      cancelText: 'Cancel'
    },
    reject: {
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100',
      title: 'Reject Quote?',
      message: 'Are you sure you want to reject this quote? The vendor will be notified.',
      confirmText: 'Yes, Reject Quote',
      confirmClass: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
      cancelText: 'Cancel'
    },
    modify: {
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100',
      title: 'Request Modification?',
      message: 'Request changes to this quote? The vendor will be notified to send a revised quote.',
      confirmText: 'Yes, Request Changes',
      confirmClass: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      cancelText: 'Cancel'
    }
  }[type];

  const Icon = config.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateString;
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal - Grid Layout */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compact Header */}
              <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -translate-y-16 translate-x-16" />
                
                <div className="relative z-10 flex items-center gap-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className={`w-14 h-14 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-7 h-7 ${config.iconColor}`} />
                  </motion.div>

                  {/* Title & Message */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {config.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {config.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid Layout - No Scroll */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column - Itemized Bill */}
                  {booking.serviceItems && booking.serviceItems.length > 0 && (
                    <div className="bg-white border-2 border-pink-100 rounded-2xl p-4 overflow-hidden flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-semibold text-gray-700">Itemized Bill</span>
                      </div>
                      
                      {/* Scrollable Items with Increased Max Height */}
                      <div className="space-y-2 overflow-y-auto max-h-[340px] pr-2">
                        {booking.serviceItems.map((item, index) => (
                          <div key={item.id || index} className="pb-2 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 pr-2">
                                <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span>
                                {item.quantity} × {formatCurrency(item.unitPrice)}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(item.total)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Right Column - Summary & Details */}
                  <div className="space-y-4">
                    {/* Summary Section */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-semibold text-gray-700">Quote Summary</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vendor:</span>
                          <span className="font-semibold text-gray-900">{booking.vendorName || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-semibold text-gray-900">{booking.serviceType || 'Wedding Service'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Event Date:</span>
                          <span className="font-semibold text-gray-900 text-xs">{formatDate(booking.eventDate)}</span>
                        </div>
                        {booking.eventLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-semibold text-gray-900 text-xs truncate ml-2">{booking.eventLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Amount Section */}
                    {booking.totalAmount && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-white" />
                            <span className="text-white font-medium">Total Amount</span>
                          </div>
                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Full Width Below Grid */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    {config.cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-6 py-3 text-white rounded-xl font-semibold transition-all hover:shadow-lg ${config.confirmClass}`}
                  >
                    {config.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
