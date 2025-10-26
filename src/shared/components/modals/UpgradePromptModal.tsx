import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  currentCount: number;
  limit: number;
  message?: string;
  recommendedPlan?: string;
  availablePlans?: string[];
  onUpgrade?: (planId: string) => void;
}

const PLAN_DETAILS: Record<string, Plan> = {
  basic: {
    id: 'basic',
    name: 'Free Tier',
    price: 'Free',
    features: ['Up to 5 services', '10 portfolio images', 'Standard support']
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: '₱999/month',
    features: [
      '✨ Unlimited services',
      '50 portfolio images',
      'Priority support',
      'Featured listings (7 days/month)',
      'Advanced analytics',
      'Email marketing tools'
    ],
    highlighted: true
  },
  pro: {
    id: 'pro',
    name: 'Professional Plan',
    price: '₱1,999/month',
    features: [
      '⭐ Everything in Premium',
      'Unlimited portfolio images',
      'Custom branding & domain',
      'Advanced SEO tools',
      'Multi-location support',
      'Team collaboration (3 members)',
      'Payment processing integration'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: '₱4,999/month',
    features: [
      '👑 Everything in Professional',
      'White-label solution',
      'API access & webhooks',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited team members',
      'Priority feature requests'
    ]
  }
};

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  currentCount,
  limit,
  message,
  recommendedPlan = 'premium',
  availablePlans = ['premium', 'pro', 'enterprise'],
  onUpgrade
}) => {
  if (!isOpen) return null;

  const currentPlanDetails = PLAN_DETAILS[currentPlan];
  const plans = availablePlans.map(id => PLAN_DETAILS[id]).filter(Boolean);

  const handleUpgradeClick = (planId: string) => {
    if (onUpgrade) {
      onUpgrade(planId);
    } else {
      // Default: Navigate to subscription page
      window.location.href = `/vendor/subscription?upgrade=${planId}`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Service Limit Reached</h2>
                <p className="text-white/90 text-sm">
                  Upgrade your plan to add more services
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Current Status */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="bg-rose-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-rose-900 mb-2">
                    You've reached your {currentPlanDetails?.name || currentPlan} limit
                  </h3>
                  <p className="text-rose-700 mb-3">
                    {message || `You currently have ${currentCount} active services out of ${limit} allowed. To add more services, please upgrade to a higher plan.`}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 font-semibold">Current Services:</span>
                      <span className="bg-rose-200 text-rose-900 px-3 py-1 rounded-full font-bold">
                        {currentCount} / {limit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 font-semibold">Current Plan:</span>
                      <span className="bg-rose-200 text-rose-900 px-3 py-1 rounded-full font-bold capitalize">
                        {currentPlan}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Plans */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Choose Your Upgrade Plan
              </h3>
              <p className="text-gray-600 mb-6">
                Select a plan that fits your business needs. All plans include unlimited services and much more!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      plan.id === recommendedPlan
                        ? 'border-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-rose-300 hover:shadow-md'
                    }`}
                    onClick={() => handleUpgradeClick(plan.id)}
                  >
                    {plan.id === recommendedPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                          ⭐ RECOMMENDED
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-1">
                        {plan.name}
                      </h4>
                      <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        {plan.price}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Billed monthly
                      </p>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgradeClick(plan.id)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        plan.id === recommendedPlan
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Upgrade to {plan.name}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Benefits Highlight */}
            <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-200 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Why Upgrade?
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited service listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>More portfolio images</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Featured listings & visibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Grow your wedding business faster</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Questions? <a href="/help" className="text-rose-600 hover:text-rose-700 font-semibold">Contact Support</a>
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradePromptModal;
