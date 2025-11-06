/**
 * Package Details Modal - Micro Frontend Component
 * Shows detailed service information for DSS package recommendations
 * Handles multi-vendor, multi-service interactions
 */

import { useState } from 'react';
import { 
  X, 
  Store, 
  DollarSign, 
  Star, 
  MessageCircle, 
  Calendar,
  CheckCircle,
  Info,
  Users,
  Package as PackageIcon,
  Award,
  Sparkles
} from 'lucide-react';

// Types
interface Service {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: string;
  basePrice?: number;
  minimumPrice?: number;
  rating: number;
  vendorName?: string;
  image?: string;
  reviewCount?: number;
}

interface PackageService {
  service: Service;
  category: string;
  matchScore: number;
  matchReasons: string[];
}

interface WeddingPackage {
  id: string;
  tier: 'essential' | 'deluxe' | 'premium';
  name: string;
  tagline: string;
  description: string;
  services: PackageService[];
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  discountPercentage: number;
  matchScore: number;
  matchPercentage: number;
  reasons: string[];
  highlights: string[];
}

interface VendorGroup {
  vendorId: string;
  vendorName: string;
  services: PackageService[];
  totalPrice: number;
  serviceCount: number;
}

interface PackageDetailsModalProps {
  package: WeddingPackage;
  isOpen: boolean;
  onClose: () => void;
  onBookPackage: (packageId: string, serviceIds: string[]) => void;
  onCreateGroupChat: (vendorIds: string[], packageId: string) => void;
  onMessageVendor: (serviceId: string) => void;
}

export function PackageDetailsModal({
  package: pkg,
  isOpen,
  onClose,
  onBookPackage,
  onCreateGroupChat,
  onMessageVendor
}: PackageDetailsModalProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(pkg.services.map(s => s.service.id))
  );
  const [activeTab, setActiveTab] = useState<'services' | 'vendors' | 'pricing'>('services');

  if (!isOpen) return null;

  // Group services by vendor
  const vendorGroups = pkg.services.reduce<Map<string, VendorGroup>>((acc, pkgService) => {
    const vendorId = pkgService.service.vendorId;
    const vendorName = pkgService.service.vendorName || 'Unknown Vendor';
    
    if (!acc.has(vendorId)) {
      acc.set(vendorId, {
        vendorId,
        vendorName,
        services: [],
        totalPrice: 0,
        serviceCount: 0
      });
    }
    
    const group = acc.get(vendorId)!;
    group.services.push(pkgService);
    group.totalPrice += pkgService.service.basePrice || pkgService.service.minimumPrice || 0;
    group.serviceCount++;
    
    return acc;
  }, new Map());

  const vendorGroupsArray = Array.from(vendorGroups.values());

  // Calculate selected total
  const selectedTotal = pkg.services
    .filter(s => selectedServices.has(s.service.id))
    .reduce((sum, s) => sum + (s.service.basePrice || s.service.minimumPrice || 0), 0);

  const selectedDiscount = selectedTotal * (pkg.discountPercentage / 100);
  const selectedFinalPrice = selectedTotal - selectedDiscount;

  const toggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleBookPackage = () => {
    const serviceIds = Array.from(selectedServices);
    onBookPackage(pkg.id, serviceIds);
  };

  const handleCreateGroupChat = () => {
    const vendorIds = vendorGroupsArray.map(v => v.vendorId);
    onCreateGroupChat(vendorIds, pkg.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <PackageIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{pkg.name}</h2>
              <p className="text-pink-100 text-lg mb-4">{pkg.tagline}</p>
              
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  ⭐ {pkg.matchPercentage}% Match
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {pkg.services.length} Services
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {vendorGroupsArray.length} Vendors
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {pkg.discountPercentage}% Off
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-1 p-2">
            {[
              { id: 'services', label: 'Services', icon: PackageIcon },
              { id: 'vendors', label: 'Vendors', icon: Store },
              { id: 'pricing', label: 'Pricing', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'services' | 'vendors' | 'pricing')}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-pink-600 shadow-md'
                    : 'text-gray-600 hover:bg-white/50'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Package Services ({pkg.services.length})
                </h3>
                <div className="text-sm text-gray-600">
                  {selectedServices.size} of {pkg.services.length} selected
                </div>
              </div>

              {pkg.services.map((pkgService, index) => {
                const service = pkgService.service;
                const isSelected = selectedServices.has(service.id);
                
                return (
                  <div
                    key={service.id}
                    className={`
                      relative p-6 rounded-2xl border-2 transition-all
                      ${isSelected
                        ? 'border-pink-500 bg-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleService(service.id)}
                        title={isSelected ? 'Deselect service' : 'Select service'}
                        aria-label={isSelected ? 'Deselect service' : 'Select service'}
                        className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${isSelected
                            ? 'border-pink-500 bg-pink-500'
                            : 'border-gray-300 hover:border-pink-400'
                          }
                        `}
                      >
                        {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                      </button>
                    </div>

                    <div className="flex gap-4 pr-12">
                      {/* Service Image */}
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}

                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                            #{index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        {/* Vendor & Category */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Store className="w-4 h-4" />
                            <span className="font-medium">{service.vendorName}</span>
                          </div>
                          <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                            {service.category}
                          </div>
                          {service.rating > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{service.rating.toFixed(1)}</span>
                              {service.reviewCount && (
                                <span className="text-gray-500">({service.reviewCount})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Match Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-pink-500" />
                          <span className="text-sm font-semibold text-pink-600">
                            {pkgService.matchScore}% Match
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-600">
                            {pkgService.matchReasons[0]}
                          </span>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-gray-900">
                            ₱{(service.basePrice || service.minimumPrice || 0).toLocaleString()}
                          </div>
                          <button
                            onClick={() => onMessageVendor(service.id)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message Vendor
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Vendors Included ({vendorGroupsArray.length})
                </h3>
                <button
                  onClick={handleCreateGroupChat}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                >
                  <Users className="w-5 h-5" />
                  Create Group Chat
                </button>
              </div>

              {vendorGroupsArray.map((vendor, index) => (
                <div
                  key={vendor.vendorId}
                  className="p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-pink-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
                      <Store className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                          Vendor #{index + 1}
                        </span>
                        <h4 className="text-xl font-bold text-gray-900">
                          {vendor.vendorName}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <PackageIcon className="w-4 h-4" />
                          {vendor.serviceCount} services
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ₱{vendor.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Vendor's Services */}
                      <div className="space-y-2">
                        {vendor.services.map((pkgService, idx) => (
                          <div
                            key={pkgService.service.id}
                            className="p-3 bg-gray-50 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                {idx + 1}. {pkgService.service.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {pkgService.service.category} • {pkgService.matchScore}% match
                              </div>
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              ₱{(pkgService.service.basePrice || pkgService.service.minimumPrice || 0).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => onMessageVendor(vendor.services[0].service.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message Vendor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Package Pricing Breakdown
              </h3>

              {/* Selected Services Summary */}
              <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Selected Services</h4>
                  <span className="text-sm text-gray-600">
                    {selectedServices.size} of {pkg.services.length} services
                  </span>
                </div>

                <div className="space-y-3">
                  {pkg.services
                    .filter(s => selectedServices.has(s.service.id))
                    .map(pkgService => (
                      <div
                        key={pkgService.service.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {pkgService.service.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            by {pkgService.service.vendorName}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          ₱{(pkgService.service.basePrice || pkgService.service.minimumPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-6 bg-white rounded-2xl border-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Price Breakdown</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Subtotal ({selectedServices.size} services)</span>
                    <span className="font-semibold text-gray-900">
                      ₱{selectedTotal.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 text-green-600">
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Package Discount ({pkg.discountPercentage}%)
                    </span>
                    <span className="font-semibold">
                      -₱{selectedDiscount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-pink-600">
                          ₱{selectedFinalPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600 font-semibold">
                          You save ₱{selectedDiscount.toLocaleString()}!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="p-6 bg-white rounded-2xl border-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-pink-500" />
                  Why This Package Matches
                </h4>
                
                <div className="space-y-2">
                  {pkg.reasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">
                {selectedServices.size} services selected
              </div>
              <div className="text-3xl font-bold text-pink-600">
                ₱{selectedFinalPrice.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 font-semibold">
                Save ₱{selectedDiscount.toLocaleString()} with this package!
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateGroupChat}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              >
                <Users className="w-5 h-5" />
                Group Chat
              </button>
              
              <button
                onClick={handleBookPackage}
                disabled={selectedServices.size === 0}
                className={`
                  px-8 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-2
                  ${selectedServices.size > 0
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <Calendar className="w-5 h-5" />
                Book Selected Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PackageDetailsModal;
