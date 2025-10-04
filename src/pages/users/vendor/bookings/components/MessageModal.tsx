import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Mail, MessageSquare, User, Calendar, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageModalProps {
  booking: {
    id: string;
    coupleName: string;
    contactEmail: string;
    contactPhone?: string;
    serviceType: string;
    eventDate: string;
    eventLocation?: string;
    preferredContactMethod: string;
    status: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (messageData: MessageData) => Promise<void>;
}

export interface MessageData {
  bookingId: string;
  subject: string;
  message: string;
  contactMethod: 'email' | 'phone' | 'platform';
  priority: 'low' | 'normal' | 'high';
  scheduledSend?: string;
}

export const MessageModal: React.FC<MessageModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSendMessage
}) => {
  const [messageData, setMessageData] = useState<MessageData>({
    bookingId: '',
    subject: '',
    message: '',
    contactMethod: 'email',
    priority: 'normal',
    scheduledSend: ''
  });

  const [loading, setLoading] = useState(false);
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickTemplates = [
    {
      label: 'Quote Follow-up',
      subject: 'Following up on your wedding quote',
      message: `Hi {coupleName},\n\nI hope this message finds you well! I wanted to follow up on the quote I sent for your {serviceType} services for your wedding on {eventDate}.\n\nIf you have any questions about the proposal or would like to discuss any modifications, I'm here to help. I'm excited about the possibility of being part of your special day!\n\nBest regards,\n[Your Name]`
    },
    {
      label: 'Booking Confirmation',
      subject: 'Wedding booking confirmation - {eventDate}',
      message: `Dear {coupleName},\n\nThank you for choosing our {serviceType} services for your wedding! I'm thrilled to confirm your booking for {eventDate}.\n\nNext steps:\n• I'll send you a detailed contract within 24 hours\n• Please review and sign at your earliest convenience\n• Feel free to reach out with any questions\n\nLooking forward to making your day perfect!\n\nWarm regards,\n[Your Name]`
    },
    {
      label: 'Pre-Event Check-in',
      subject: 'Final preparations for your wedding',
      message: `Hi {coupleName},\n\nAs your wedding date approaches, I wanted to reach out for a final check-in. With just a few days to go, I'm making sure everything is perfectly prepared for your {serviceType} services.\n\nLet me know if there are any last-minute changes or special requests. I'm here to ensure everything goes smoothly on your big day!\n\nExcited to be part of your celebration!\n\nBest,\n[Your Name]`
    },
    {
      label: 'Thank You & Follow-up',
      subject: 'Thank you for choosing our services!',
      message: `Dear {coupleName},\n\nThank you so much for allowing me to be part of your beautiful wedding! It was an absolute pleasure providing {serviceType} services for your special day.\n\nI hope you're enjoying married life! If you have a moment, I would be grateful for a review of our services. It would mean the world to me and help other couples discover our work.\n\nWishing you a lifetime of happiness together!\n\nWith warm regards,\n[Your Name]`
    }
  ];

  useEffect(() => {
    if (booking && isOpen) {
      setMessageData({
        bookingId: booking.id,
        subject: '',
        message: '',
        contactMethod: booking.preferredContactMethod as 'email' | 'phone' | 'platform' || 'email',
        priority: 'normal',
        scheduledSend: ''
      });
    }
  }, [booking, isOpen]);

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    if (!booking) return;

    const replacedSubject = template.subject
      .replace('{coupleName}', booking.coupleName)
      .replace('{serviceType}', booking.serviceType)
      .replace('{eventDate}', new Date(booking.eventDate).toLocaleDateString());

    const replacedMessage = template.message
      .replace(/{coupleName}/g, booking.coupleName)
      .replace(/{serviceType}/g, booking.serviceType)
      .replace(/{eventDate}/g, new Date(booking.eventDate).toLocaleDateString());

    setMessageData({
      ...messageData,
      subject: replacedSubject,
      message: replacedMessage
    });

    setShowQuickTemplates(false);
    
    // Focus textarea after template is applied
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageData.subject.trim() || !messageData.message.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSendMessage(messageData);
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return Phone;
      case 'email': return Mail;
      default: return MessageSquare;
    }
  };

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case 'phone': return 'Phone Call';
      case 'email': return 'Email';
      default: return 'Platform Message';
    }
  };

  if (!booking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                    <MessageSquare className="w-7 h-7" />
                    Contact Client
                  </h2>
                  <p className="text-blue-100">
                    Send a message to {booking.coupleName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Close message modal"
                  aria-label="Close message modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="p-8">
                {/* Client Info */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="font-medium">{booking.contactEmail}</span>
                      </div>
                      {booking.contactPhone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="font-medium">{booking.contactPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Preferred:</span>
                        <span className="font-medium capitalize">{booking.preferredContactMethod}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span className="text-sm text-gray-600">Event Date:</span>
                        <span className="font-medium">{new Date(booking.eventDate).toLocaleDateString()}</span>
                      </div>
                      {booking.eventLocation && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-600">Location:</span>
                          <span className="font-medium">{booking.eventLocation}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm text-gray-600">Service:</span>
                        <span className="font-medium">{booking.serviceType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Method Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                      Contact Method
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['email', 'phone', 'platform'].map((method) => {
                        const Icon = getContactMethodIcon(method);
                        const isAvailable = method === 'email' || 
                          (method === 'phone' && booking.contactPhone) || 
                          method === 'platform';
                        
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setMessageData({ ...messageData, contactMethod: method as any })}
                            disabled={!isAvailable}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                              messageData.contactMethod === method
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : isAvailable
                                ? 'border-gray-200 hover:border-gray-300 text-gray-700'
                                : 'border-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{getContactMethodLabel(method)}</span>
                            {!isAvailable && method === 'phone' && (
                              <span className="text-xs text-gray-400">No phone number</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-900">
                        Quick Templates
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowQuickTemplates(!showQuickTemplates)}
                        className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
                      >
                        {showQuickTemplates ? 'Hide Templates' : 'Show Templates'}
                      </button>
                    </div>
                    
                    {showQuickTemplates && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {quickTemplates.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            className="p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                          >
                            <h4 className="font-medium text-gray-900 group-hover:text-blue-700 mb-1">
                              {template.label}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {template.subject}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={messageData.subject}
                      onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter message subject..."
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                      Message
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={messageData.message}
                      onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={8}
                      placeholder="Type your message here..."
                      required
                    />
                    <p className="text-sm text-gray-500">
                      {messageData.message.length} characters
                    </p>
                  </div>

                  {/* Priority and Scheduling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-900">
                        Priority
                      </label>
                      <select
                        value={messageData.priority}
                        onChange={(e) => setMessageData({ ...messageData, priority: e.target.value as any })}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select message priority level"
                        aria-label="Message priority"
                      >
                        <option value="low">Low Priority</option>
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-900">
                        Schedule Send (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={messageData.scheduledSend}
                        onChange={(e) => setMessageData({ ...messageData, scheduledSend: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().slice(0, 16)}
                        title="Schedule message for later delivery"
                        placeholder="Select date and time"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-4 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !messageData.subject.trim() || !messageData.message.trim()}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {loading ? 'Sending...' : (messageData.scheduledSend ? 'Schedule Message' : 'Send Message')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
