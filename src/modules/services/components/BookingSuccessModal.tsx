import React, { useEffect, useState } from 'react';
import { CheckCircle, Calendar, Clock, X, ExternalLink } from 'lucide-react';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string | number;
    serviceName: string;
    vendorName: string;
    eventDate: string;
    eventTime?: string;
    eventLocation?: string;
  };
  onViewBookings?: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onViewBookings
}) => {
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    if (isOpen && showCountdown) {
      setCountdown(10);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCountdown(false);
            setTimeout(() => {
              onClose();
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, showCountdown, onClose]);

  const handleStayOpen = () => {
    setShowCountdown(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
        
        {/* Success Header with Animation */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-2 left-4 w-2 h-2 bg-green-300 rounded-full animate-bounce animation-delay-0"></div>
            <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="absolute bottom-4 left-8 w-1 h-1 bg-green-400 rounded-full animate-bounce animation-delay-500"></div>
            <div className="absolute bottom-2 right-6 w-2 h-2 bg-emerald-300 rounded-full animate-bounce animation-delay-700"></div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-green-100 rounded-full shadow-sm animate-pulse">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-green-900 mb-2">
                    🎉 Booking Request Submitted!
                  </h3>
                  <p className="text-green-800 text-lg">
                    Your request has been sent to <span className="font-bold">{bookingData.vendorName}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {showCountdown && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-green-200">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">Auto-closing in {countdown}s</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-105"
                title="Close modal"
                aria-label="Close success modal"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-8">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50 mb-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Booking Details</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-600 font-medium">Service:</span>
                  <span className="font-semibold text-gray-900">{bookingData.serviceName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-600 font-medium">Vendor:</span>
                  <span className="font-semibold text-gray-900">{bookingData.vendorName}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-gray-600 font-medium">Event Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(bookingData.eventDate)}</span>
                </div>
                {bookingData.eventTime && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                    <span className="text-gray-600 font-medium">Time:</span>
                    <span className="font-semibold text-gray-900 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{bookingData.eventTime}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {bookingData.eventLocation && (
              <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-medium">Location:</span>
                  <span className="font-semibold text-gray-900 text-right max-w-xs">
                    {bookingData.eventLocation}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-2xl p-6 border border-blue-200/50 mb-6">
            <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center space-x-2">
              <div className="p-1 bg-blue-100 rounded-lg">
                <ExternalLink className="h-4 w-4 text-blue-600" />
              </div>
              <span>What Happens Next?</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                <span className="text-blue-800">The vendor will review your request within <strong>24 hours</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse animate-delay-100"></div>
                <span className="text-blue-800">You'll receive an <strong>email notification</strong> when they respond</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse animate-delay-200"></div>
                <span className="text-blue-800">The vendor will contact you via your <strong>preferred method</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse animate-delay-300"></div>
                <span className="text-blue-800">Track the status in your <strong>bookings dashboard</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {showCountdown && (
              <button
                onClick={handleStayOpen}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
              >
                <span>Stay Open</span>
              </button>
            )}
            
            <button
              onClick={onViewBookings}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <Calendar className="h-5 w-5" />
              <span>View All Bookings</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Done</span>
            </button>
          </div>

          {/* Booking Reference */}
          <div className="mt-6 text-center">
            <div className="bg-gray-100 rounded-lg p-3 inline-block">
              <span className="text-sm text-gray-600">Booking Reference: </span>
              <code className="text-sm font-mono font-bold text-gray-800">#{bookingData.id}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
