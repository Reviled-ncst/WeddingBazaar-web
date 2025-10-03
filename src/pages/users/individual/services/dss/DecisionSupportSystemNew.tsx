import React, { useState } from 'react';
import { X, Check, Star, MapPin } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice?: number;
  priceRange?: string;
  image: string;
  rating: number;
  reviewCount: number;
  vendorName: string;
  location?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

interface DSSProps {
  services: Service[];
  budget?: number;
  location?: string;
  weddingDate?: Date;
  guestCount?: number;
  priorities?: string[];
  isOpen: boolean;
  onClose: () => void;
  onServiceRecommend: (serviceId: string) => void;
}

export const DecisionSupportSystem: React.FC<DSSProps> = ({
  services = [],
  isOpen,
  onClose,
  onServiceRecommend
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);

  // Get top 4 recommended services based on rating and relevance
  const getRecommendedServices = (): Service[] => {
    const filtered = services
      .filter(service => service.rating >= 4.0) // High-rated services
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    
    return filtered.length > 0 ? filtered : services.slice(0, 4);
  };

  const recommendedServices = getRecommendedServices();

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContactAllVendors = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service to contact vendors.');
      return;
    }
    setShowContactForm(true);
  };

  const handleBookService = (serviceId: string) => {
    onServiceRecommend(serviceId);
    // You can add booking logic here
    alert(`Booking request sent for this service! We'll connect you with the vendor.`);
  };

  const formatPrice = (service: Service): string => {
    if (service.priceRange) return service.priceRange;
    if (service.basePrice) return `₱${service.basePrice.toLocaleString()}`;
    return 'Contact for pricing';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Perfect Wedding Services for You
              </h2>
              <p className="text-gray-600 mt-1">
                We've handpicked these amazing services just for your special day!
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">How it works:</h3>
              <p className="text-blue-700 text-sm mt-1">
                1. Check the boxes next to services you like ✓<br/>
                2. Click "Contact All Selected" to reach multiple vendors at once<br/>
                3. Or click "Book This Service" for individual bookings
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {recommendedServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No services available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedServices.map((service) => (
                <div
                  key={service.id}
                  className={`border-2 rounded-2xl p-4 transition-all hover:shadow-lg ${
                    selectedServices.includes(service.id)
                      ? 'border-pink-300 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-start justify-between mb-3">
                    <button
                      onClick={() => handleServiceToggle(service.id)}
                      className={`flex items-center space-x-2 font-medium ${
                        selectedServices.includes(service.id)
                          ? 'text-pink-600'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedServices.includes(service.id)
                          ? 'bg-pink-500 border-pink-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedServices.includes(service.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span>Select this service</span>
                    </button>
                  </div>

                  {/* Service Image */}
                  <div className="relative mb-3">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                  </div>

                  {/* Service Info */}
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-pink-600 font-medium mb-2">
                    by {service.vendorName}
                  </p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Price and Location */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(service)}
                    </span>
                    {service.location && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {service.location}
                      </div>
                    )}
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => handleBookService(service.id)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105"
                  >
                    📅 Book This Service
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleContactAllVendors}
              disabled={selectedServices.length === 0}
              className={`flex-1 font-medium py-3 px-6 rounded-lg transition-all ${
                selectedServices.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              💬 Contact All Selected Vendors ({selectedServices.length})
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
          {selectedServices.length > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              You've selected {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}. 
              We'll help you connect with all these vendors at once! 🎉
            </p>
          )}
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">🎉 Great Choice!</h3>
              <p className="text-gray-600 mb-4">
                We'll connect you with {selectedServices.length} vendor{selectedServices.length !== 1 ? 's' : ''} 
                and help coordinate your perfect wedding services.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowContactForm(false);
                    onClose();
                    alert('Contact requests sent! Vendors will reach out to you soon.');
                  }}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Send Requests
                </button>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionSupportSystem;
