import React from 'react';
import { X, Calendar, MapPin, Phone, User, Heart, Sparkles } from 'lucide-react';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  bookingDetails: {
    serviceName: string;
    vendorName: string;
    eventDate: string;
    eventLocation: string;
    contactPhone: string;
    contactEmail: string;
    eventType: string;
    guestCount: string;
    additionalRequests?: string;
  };
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  bookingDetails
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-3xl opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
                <p className="text-gray-600 mt-1">Review your details before sending</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close confirmation modal"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Service Details */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Service:</span>
                <p className="text-gray-900 font-semibold">{bookingDetails.serviceName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Vendor:</span>
                <p className="text-gray-900 font-semibold">{bookingDetails.vendorName}</p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-pink-600" />
              <span>Event Information</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Date</span>
                </div>
                <p className="text-gray-900 font-semibold">{bookingDetails.eventDate}</p>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Location</span>
                </div>
                <p className="text-gray-900 font-semibold">{bookingDetails.eventLocation}</p>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Event Type</span>
                </div>
                <p className="text-gray-900 font-semibold">{bookingDetails.eventType}</p>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Guests</span>
                </div>
                <p className="text-gray-900 font-semibold">{bookingDetails.guestCount}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-pink-600" />
              <span>Contact Information</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Phone</span>
                </div>
                <p className="text-gray-900 font-semibold">{bookingDetails.contactPhone}</p>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Email</span>
                </div>
                <p className="text-gray-900 font-semibold">{bookingDetails.contactEmail}</p>
              </div>
            </div>
          </div>

          {/* Additional Requests */}
          {bookingDetails.additionalRequests && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Additional Requests</h3>
              <div className="bg-white/80 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-900">{bookingDetails.additionalRequests}</p>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Heart className="w-6 h-6" fill="currentColor" />
              <h3 className="text-lg font-bold">Ready to Make Your Dream Wedding Come True?</h3>
            </div>
            <p className="text-pink-100">
              Your booking request will be sent directly to the vendor. They'll contact you soon to discuss details and confirm availability!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            >
              Review Again
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Send Booking Request 💝
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
