import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Phone, User, Heart, Sparkles, Banknote, Users } from 'lucide-react';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  bookingDetails: {
    serviceName: string;
    vendorName: string;
    eventDate: string;
    eventTime?: string;
    eventEndTime?: string;
    eventLocation: string;
    venueDetails?: string;
    contactPerson?: string;
    contactPhone: string;
    contactEmail: string;
    eventType: string;
    guestCount: string;
    budgetRange?: string;
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

  const modalContent = (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black/90 via-purple-900/40 to-pink-900/40 backdrop-blur-lg flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300" 
      style={{ zIndex: 9999 }}
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-8 duration-500 border border-pink-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden rounded-t-3xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 opacity-100"></div>
          
          {/* Overlay pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative p-8 pb-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* Animated Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-2xl animate-pulse"></div>
                  <div className="relative p-4 bg-white rounded-2xl shadow-xl">
                    <Heart className="w-8 h-8 text-pink-500 animate-pulse" fill="currentColor" />
                  </div>
                  {/* Sparkle effects */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    Confirm Your Booking
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                  </h2>
                  <p className="text-pink-100 text-sm">Review your details before sending your request</p>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group backdrop-blur-sm border border-white/30"
                aria-label="Close confirmation modal"
                title="Close"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Stats Bar */}
            <div className="flex gap-3 mt-6">
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Event Date</span>
                </div>
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Guests</span>
                </div>
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs font-medium">Budget</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Service Details - Enhanced Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-pink-100 shadow-sm">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Service Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-pink-100/50">
                  <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-2 block">Service Name</span>
                  <p className="text-gray-900 font-bold text-lg">{bookingDetails.serviceName}</p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 block">Vendor</span>
                  <p className="text-gray-900 font-bold text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    {bookingDetails.vendorName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Information - Enhanced Grid */}
          <div className="space-y-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Event Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Event Date & Time</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{bookingDetails.eventDate}</p>
                  {bookingDetails.eventTime && (
                    <p className="text-gray-600 font-semibold text-sm mt-2">
                      {bookingDetails.eventTime}
                      {bookingDetails.eventEndTime && ` - ${bookingDetails.eventEndTime}`}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Location Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-gray-900 font-bold text-sm leading-snug">{bookingDetails.eventLocation}</p>
                  {bookingDetails.venueDetails && (
                    <p className="text-gray-600 text-xs mt-2 leading-relaxed">{bookingDetails.venueDetails}</p>
                  )}
                </div>
              </div>
              
              {/* Event Type Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Heart className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Event Type</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{bookingDetails.eventType}</p>
                </div>
              </div>
              
              {/* Guests Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Guests</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{bookingDetails.guestCount} people</p>
                </div>
              </div>
              
              {/* Budget Range Card - Full Width */}
              {bookingDetails.budgetRange && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-2xl p-5 border border-pink-100 sm:col-span-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-md">
                        <Banknote className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-pink-600 uppercase tracking-wider">Budget Range</span>
                    </div>
                    <p className="text-gray-900 font-bold text-2xl">{bookingDetails.budgetRange}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information - Enhanced */}
          <div className="space-y-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-md">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bookingDetails.contactPerson && (
                <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-violet-200/30 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-2 bg-violet-500 rounded-lg">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Contact Person</span>
                    </div>
                    <p className="text-gray-900 font-bold text-lg">{bookingDetails.contactPerson}</p>
                  </div>
                </div>
              )}
              
              <div className="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-200/30 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Phone Number</span>
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{bookingDetails.contactPhone}</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/30 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Email Address</span>
                  </div>
                  <p className="text-gray-900 font-bold text-sm break-all">{bookingDetails.contactEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Requests */}
          {bookingDetails.additionalRequests && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Special Requests</h3>
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl"></div>
                <p className="relative text-gray-700 leading-relaxed">{bookingDetails.additionalRequests}</p>
              </div>
            </div>
          )}

          {/* Confirmation Message - Enhanced CTA */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white mb-6 shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-3 h-3 bg-pink-300 rounded-full animate-bounce"></div>
            <div className="absolute top-12 right-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <Heart className="w-8 h-8 text-white animate-pulse" fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Ready to Make Your Dream Wedding Come True?</h3>
                  <p className="text-pink-100 text-sm">✨ You're one step away from booking the perfect service!</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mt-4">
                <p className="text-white/90 leading-relaxed">
                  Your booking request will be sent directly to <span className="font-bold text-white">{bookingDetails.vendorName}</span>. 
                  They'll contact you soon via phone or email to discuss details and confirm availability for your special day! 💝
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Enhanced */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Review Button */}
            <button
              onClick={onCancel}
              className="group relative flex-1 px-8 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Review Details Again
              </span>
            </button>
            
            {/* Confirm Button */}
            <button
              onClick={onConfirm}
              className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-3xl active:scale-[0.98] overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Button content */}
              <span className="relative flex items-center justify-center gap-3">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform animate-pulse" fill="currentColor" />
                <span>Send Booking Request</span>
                <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </span>
              
              {/* Floating particles */}
              <div className="absolute top-2 right-4 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute bottom-3 left-6 w-1 h-1 bg-pink-300 rounded-full animate-bounce"></div>
            </button>
          </div>
          
          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Your information is secure and will only be shared with the selected vendor
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root level, escaping parent z-index stacking context
  return createPortal(modalContent, document.body);
};

export default BookingConfirmationModal;
