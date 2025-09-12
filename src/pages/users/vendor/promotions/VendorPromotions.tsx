import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { Gift, Star, Clock, Zap, Crown, Percent } from 'lucide-react';

export const VendorPromotions: React.FC = () => {
  const currentPromotions = [
    {
      id: '1',
      title: 'Early Bird Special',
      description: '20% off for bookings made 6+ months in advance',
      discount: '20%',
      validUntil: '2024-03-31',
      active: true,
      bookings: 12
    },
    {
      id: '2',
      title: 'Weekend Package',
      description: 'Special pricing for Saturday/Sunday events',
      discount: '15%',
      validUntil: '2024-12-31',
      active: true,
      bookings: 8
    }
  ];

  const availablePromotions = [
    {
      title: 'Last-Minute Deals',
      description: 'Offer discounts for bookings within 30 days',
      suggestedDiscount: '30%',
      icon: Clock
    },
    {
      title: 'Package Deals',
      description: 'Bundle multiple services for better value',
      suggestedDiscount: '25%',
      icon: Star
    },
    {
      title: 'Loyalty Rewards',
      description: 'Special rates for returning clients',
      suggestedDiscount: '15%',
      icon: Crown
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Promotions & Special Offers
              </h1>
              <p className="text-gray-600">Create and manage special deals to attract more clients</p>
            </div>
          </div>
        </div>

        {/* Current Promotions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Active Promotions</h2>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Create New Promotion
            </button>
          </div>

          <div className="grid gap-6">
            {currentPromotions.map((promo) => (
              <div
                key={promo.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{promo.title}</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{promo.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Percent className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-700">Discount: <strong>{promo.discount}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Valid until: <strong>{promo.validUntil}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Bookings: <strong>{promo.bookings}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      Pause
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Promotions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Suggested Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePromotions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <suggestion.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-4">{suggestion.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Suggested: <span className="font-medium text-orange-600">{suggestion.suggestedDiscount}</span>
                  </div>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                    Create
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
