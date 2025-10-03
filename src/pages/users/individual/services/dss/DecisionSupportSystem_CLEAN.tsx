import React, { useState } from 'react';
import { X, Check, Star, MapPin, Package, Sparkles, Heart, Users } from 'lucide-react';

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

interface WeddingPackage {
  id: string;
  name: string;
  description: string;
  services: Service[];
  totalCost: number;
  savings: number;
  category: 'Essential' | 'Complete' | 'Premium' | 'Luxury';
  recommended: boolean;
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
  budget = 50000,
  isOpen,
  onClose,
  onServiceRecommend
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeView, setActiveView] = useState<'services' | 'packages'>('packages'); // Start with packages promoted
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    show: boolean;
  }>({ type: 'info', title: '', message: '', show: false });

  // Helper function to show notifications
  const showNotification = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    setNotification({ type, title, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Get recommended services - if services are selected (from package), show those; otherwise show top 4
  const getRecommendedServices = (): Service[] => {
    if (selectedServices.length > 0) {
      const selectedServiceObjects = services.filter(service => 
        selectedServices.includes(service.id)
      );
      
      const remainingSlots = Math.max(0, 8 - selectedServiceObjects.length);
      const otherServices = services
        .filter(service => !selectedServices.includes(service.id) && service.rating >= 4.0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, remainingSlots);
      
      return [...selectedServiceObjects, ...otherServices];
    }
    
    const filtered = services
      .filter(service => service.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    
    return filtered.length > 0 ? filtered : services.slice(0, 4);
  };

  const recommendedServices = getRecommendedServices();

  // Get smart package recommendations
  const getPackageRecommendations = (): WeddingPackage[] => {
    const categories = [...new Set(services.map(s => s.category))];
    const packages: WeddingPackage[] = [];

    const getBestFromCategory = (category: string, criteria: 'budget' | 'balanced' | 'premium') => {
      const categoryServices = services.filter(s => s.category === category);
      if (categoryServices.length === 0) return null;

      switch (criteria) {
        case 'budget':
          return categoryServices
            .filter(s => s.rating >= 3.5)
            .sort((a, b) => (a.basePrice || 1000) - (b.basePrice || 1000))[0];
        case 'balanced':
          return categoryServices
            .sort((a, b) => (b.rating * 10) - ((a.basePrice || 1000) / 1000))[0];
        case 'premium':
          return categoryServices
            .sort((a, b) => b.rating - a.rating)[0];
        default:
          return categoryServices[0];
      }
    };

    // Essential Package
    const essentialServices = categories
      .slice(0, 5)
      .map(cat => getBestFromCategory(cat, 'budget'))
      .filter((s): s is Service => s !== null);

    if (essentialServices.length >= 3) {
      const totalCost = essentialServices.reduce((sum, s) => sum + (s.basePrice || 2000), 0);
      packages.push({
        id: 'essential',
        name: 'Essential Wedding Package',
        description: 'Budget-friendly package covering the most important services',
        services: essentialServices,
        totalCost,
        savings: totalCost * 0.15,
        category: 'Essential',
        recommended: totalCost <= budget * 0.7
      });
    }

    // Complete Package
    const completeServices = categories
      .slice(0, 7)
      .map(cat => getBestFromCategory(cat, 'balanced'))
      .filter((s): s is Service => s !== null);

    if (completeServices.length >= 5) {
      const totalCost = completeServices.reduce((sum, s) => sum + (s.basePrice || 3000), 0);
      packages.push({
        id: 'complete',
        name: 'Complete Wedding Package',
        description: 'Perfect balance of quality and value for your special day',
        services: completeServices,
        totalCost,
        savings: totalCost * 0.12,
        category: 'Complete',
        recommended: totalCost <= budget * 1.1
      });
    }

    // Premium Package
    const premiumServices = categories
      .map(cat => getBestFromCategory(cat, 'premium'))
      .filter((s): s is Service => s !== null);

    if (premiumServices.length >= 6) {
      const totalCost = premiumServices.reduce((sum, s) => sum + (s.basePrice || 5000), 0);
      packages.push({
        id: 'premium',
        name: 'Premium Wedding Experience',
        description: 'High-quality services for an unforgettable celebration',
        services: premiumServices,
        totalCost,
        savings: totalCost * 0.10,
        category: 'Premium',
        recommended: budget >= 75000
      });
    }

    return packages.sort((a, b) => a.totalCost - b.totalCost);
  };

  const packageRecommendations = getPackageRecommendations();

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectPackage = (pkg: WeddingPackage) => {
    const serviceIds = pkg.services.map(service => service.id);
    setSelectedServices(serviceIds);
    setActiveView('services');
    showNotification(
      'success',
      `🎉 Selected ${pkg.name}!`,
      `Package includes ${pkg.services.length} services. You can now contact all vendors or book individual services.`
    );
  };

  const handleContactAllVendors = () => {
    if (selectedServices.length === 0) {
      showNotification('warning', 'No Services Selected', 'Please select at least one service to contact vendors.');
      return;
    }
    setShowContactForm(true);
  };

  const handleBookService = (serviceId: string) => {
    onServiceRecommend(serviceId);
    const service = services.find(s => s.id === serviceId);
    showNotification(
      'success', 
      '📅 Booking Request Sent!', 
      `We'll connect you with ${service?.vendorName || 'the vendor'} for ${service?.name || 'this service'}.`
    );
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Wedding Decision Support System
              </h2>
              <p className="text-gray-600 mt-1">
                Smart recommendations for your perfect wedding day!
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

          {/* Tab Navigation - Smart Packages First (Promoted) */}
          <div className="flex space-x-1 bg-white/60 rounded-xl p-1">
            <button
              onClick={() => setActiveView('packages')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all ${
                activeView === 'packages'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>🌟 Smart Packages</span>
            </button>
            <button
              onClick={() => setActiveView('services')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-all ${
                activeView === 'services'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Individual Services</span>
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
              <h3 className="font-semibold text-blue-900">
                {activeView === 'packages' ? '🌟 Smart Packages (Recommended!):' : 'Individual Services:'}
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                {activeView === 'packages' ? (
                  <>
                    1. Browse our AI-curated wedding packages 📦<br/>
                    2. Each package is optimized for budget and quality<br/>
                    3. Click "Select Package" to book all services at once with savings!
                  </>
                ) : (
                  <>
                    1. Check the boxes next to services you like ✓<br/>
                    2. Click "Contact All Selected" to reach multiple vendors at once<br/>
                    3. Or click "Book This Service" for individual bookings
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeView === 'packages' ? (
            /* Smart Packages View */
            packageRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No packages available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {packageRecommendations.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                      pkg.recommended
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    {/* Package Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          pkg.category === 'Essential' ? 'bg-blue-100 text-blue-600' :
                          pkg.category === 'Complete' ? 'bg-purple-100 text-purple-600' :
                          pkg.category === 'Premium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-pink-100 text-pink-600'
                        }`}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                            <span>{pkg.name}</span>
                            {pkg.recommended && (
                              <span className="text-green-600 text-sm">
                                <Heart className="w-4 h-4 inline mr-1" />
                                Recommended
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600 text-sm">{pkg.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₱{(pkg.totalCost - pkg.savings).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₱{pkg.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Save ₱{pkg.savings.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Package Services */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Included Services ({pkg.services.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {pkg.services.map((service) => (
                          <div key={service.id} className="bg-white rounded-lg p-2 text-sm">
                            <div className="font-medium text-gray-800">{service.name}</div>
                            <div className="text-gray-500 text-xs">{service.vendorName}</div>
                            <div className="flex items-center text-xs text-yellow-600">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              {service.rating}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Package Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSelectPackage(pkg)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                      >
                        📦 Select This Package
                      </button>
                      <button
                        onClick={() => {
                          pkg.services.forEach(service => handleServiceToggle(service.id));
                          setActiveView('services');
                        }}
                        className="px-4 py-3 border-2 border-purple-300 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all"
                      >
                        Customize
                      </button>
                    </div>

                    {/* Budget Indicator */}
                    {budget && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Budget Usage:</span>
                          <span className={`font-medium ${
                            (pkg.totalCost - pkg.savings) <= budget ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(((pkg.totalCost - pkg.savings) / budget) * 100).toFixed(0)}% of ₱{budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              (pkg.totalCost - pkg.savings) <= budget 
                                ? Math.min(((pkg.totalCost - pkg.savings) / budget) * 100, 100) <= 25 ? 'bg-green-500 w-1/4' :
                                  Math.min(((pkg.totalCost - pkg.savings) / budget) * 100, 100) <= 50 ? 'bg-green-500 w-1/2' :
                                  Math.min(((pkg.totalCost - pkg.savings) / budget) * 100, 100) <= 75 ? 'bg-yellow-500 w-3/4' :
                                  'bg-green-500 w-full'
                                : 'bg-red-500 w-full'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Individual Services View */
            recommendedServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No services available at the moment.</p>
              </div>
            ) : (
              <>
                {selectedServices.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Package Services Selected</h3>
                    </div>
                    <p className="text-purple-700 text-sm">
                      You have {selectedServices.length} services selected from a package. 
                      You can modify your selection below or contact all vendors at once.
                    </p>
                  </div>
                )}
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
              </>
            )
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {activeView === 'services' ? (
            /* Services Actions */
            <>
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
                  onClick={() => setActiveView('packages')}
                  className="flex-1 sm:flex-none bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all"
                >
                  📦 See Smart Packages
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
            </>
          ) : (
            /* Packages Actions */
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveView('services')}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all"
              >
                ✨ Browse Individual Services
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
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
                    showNotification('success', '💬 Contact Requests Sent!', `Vendors will reach out to you soon for ${selectedServices.length} services.`);
                    setTimeout(() => onClose(), 2000);
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

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-[60] max-w-sm">
            <div className={`rounded-xl shadow-lg p-4 border-l-4 transition-all duration-300 transform ${
              notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
              notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
              'bg-blue-50 border-blue-500 text-blue-800'
            } animate-in slide-in-from-right-2 fade-in`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === 'success' && <span className="text-2xl">✅</span>}
                  {notification.type === 'warning' && <span className="text-2xl">⚠️</span>}
                  {notification.type === 'error' && <span className="text-2xl">❌</span>}
                  {notification.type === 'info' && <span className="text-2xl">ℹ️</span>}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                </div>
                <button
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close notification"
                  title="Close"
                >
                  <X className="w-4 h-4" />
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
