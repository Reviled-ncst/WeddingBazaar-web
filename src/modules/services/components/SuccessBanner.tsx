import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle } from 'lucide-react';

interface SuccessBannerProps {
  message: string;
  details?: {
    serviceName: string;
    eventDate: string;
    vendorName: string;
    bookingId: string;
  };
  onClose: () => void;
  duration?: number; // Auto-close duration in ms (default: 10000)
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ 
  message, 
  details,
  onClose,
  duration = 10000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for fade-out animation
  };

  if (!isVisible) return null;

  return createPortal(
    <div 
      className="fixed top-0 left-0 right-0 z-[10000] animate-in slide-in-from-top-5 duration-500"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle className="w-8 h-8 animate-in zoom-in duration-300" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold mb-1">
                ✅ {message}
              </p>
              
              {details && (
                <div className="text-sm text-green-50 space-y-1">
                  <p>
                    <strong>Service:</strong> {details.serviceName} • 
                    <strong className="ml-2">Date:</strong> {details.eventDate}
                  </p>
                  <p>
                    <strong>Vendor:</strong> {details.vendorName} • 
                    <strong className="ml-2">Booking ID:</strong> {details.bookingId}
                  </p>
                  <p className="text-xs mt-2 text-green-100">
                    📧 Check your email and bookings page for updates from the vendor.
                  </p>
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-white hover:text-green-100 transition-colors p-1 hover:bg-white/10 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

// Helper function to show success banner (can be called from anywhere)
export const showSuccessBanner = (
  message: string,
  details?: {
    serviceName: string;
    eventDate: string;
    vendorName: string;
    bookingId: string;
  }
) => {
  const container = document.createElement('div');
  container.id = 'success-banner-container';
  document.body.appendChild(container);

  const root = (window as any).ReactDOMClient?.createRoot?.(container);
  
  if (root) {
    root.render(
      <SuccessBanner
        message={message}
        details={details}
        onClose={() => {
          root.unmount();
          container.remove();
        }}
      />
    );
  }
};
