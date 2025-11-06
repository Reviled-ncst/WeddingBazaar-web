import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Package, MessageSquare, Info } from 'lucide-react';

export type PricingModeValue = 'simple' | 'itemized' | 'custom';

interface PricingMode {
  value: PricingModeValue;
  label: string;
  description: string;
  icon: React.ReactNode;
  recommended: string[];
  benefits: string[];
}

const PRICING_MODES: PricingMode[] = [
  {
    value: 'simple',
    label: 'Simple Pricing',
    description: 'Single price or price range for your entire service',
    icon: <DollarSign className="w-6 h-6" />,
    recommended: ['Photography', 'Music', 'Beauty', 'DJ'],
    benefits: [
      'Quick and easy to set up',
      'Clear pricing for customers',
      'Best for single-service offerings',
      'No package management needed'
    ]
  },
  {
    value: 'itemized',
    label: 'Itemized Pricing',
    description: 'Create packages, set per-guest pricing, and offer add-ons',
    icon: <Package className="w-6 h-6" />,
    recommended: ['Catering', 'Venue', 'Florist', 'Rentals', 'Planning'],
    benefits: [
      'Offer multiple package tiers',
      'Set per-person pricing',
      'Upsell with add-ons',
      'Flexible pricing options',
      'Higher average booking value'
    ]
  },
  {
    value: 'custom',
    label: 'Custom Quote',
    description: 'Customers contact you for personalized pricing',
    icon: <MessageSquare className="w-6 h-6" />,
    recommended: ['Planning', 'Custom Services', 'High-end Venues'],
    benefits: [
      'Tailored pricing per project',
      'Direct customer communication',
      'Handle complex requirements',
      'Premium positioning'
    ]
  }
];

interface PricingModeSelectorProps {
  value: PricingModeValue;
  onChange: (mode: PricingModeValue) => void;
  category?: string;
}

export const PricingModeSelector: React.FC<PricingModeSelectorProps> = ({
  value,
  onChange,
  category
}) => {
  const getRecommendedMode = (): PricingModeValue | null => {
    if (!category) return null;
    
    for (const mode of PRICING_MODES) {
      if (mode.recommended.includes(category)) {
        return mode.value;
      }
    }
    return null;
  };

  const recommendedMode = getRecommendedMode();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Pricing Structure
        </h3>
        <p className="text-sm text-gray-600">
          Select how you want to present your pricing to customers
        </p>
      </div>

      {/* Pricing Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRICING_MODES.map((mode) => {
          const isSelected = value === mode.value;
          const isRecommended = mode.value === recommendedMode;

          return (
            <motion.div
              key={mode.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Recommended
                  </div>
                </div>
              )}

              {/* Mode Card */}
              <button
                type="button"
                onClick={() => onChange(mode.value)}
                className={`
                  w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left
                  ${isSelected
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
                  }
                `}
              >
                {/* Icon and Label */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`
                      p-3 rounded-xl transition-colors
                      ${isSelected
                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">
                      {mode.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-2 mt-4">
                  {mode.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <div
                        className={`
                          w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                          ${isSelected ? 'bg-pink-500' : 'bg-gray-400'}
                        `}
                      />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 flex items-center justify-center gap-2 text-pink-600 font-semibold"
                  >
                    <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    Selected
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Category-Specific Recommendation */}
      {category && recommendedMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Recommendation for {category}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {PRICING_MODES.find(m => m.value === recommendedMode)?.label} is commonly used
              by {category} vendors and provides the best customer experience for your service type.
            </p>
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> You can change your pricing structure anytime. 
          Itemized pricing typically results in 30% higher average booking values due to package upsells and add-ons.
        </p>
      </div>
    </div>
  );
};
