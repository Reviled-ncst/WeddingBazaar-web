import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, ArrowRight, Zap } from 'lucide-react';
import { PayMongoPaymentModal } from '../PayMongoPaymentModal';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/HybridAuthContext';

interface CustomPlan {
  id: string;
  name: string;
  price: number;
  displayPrice?: string;
  features: string[];
  highlight?: boolean;
  current?: boolean;
  popular?: boolean;
  isDefault?: boolean;
  description?: string;
  billing_cycle?: string;
}

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  requiredTier?: string;
  customPlans?: CustomPlan[];
  currentPlanId?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  title = "Upgrade Required",
  message = "This feature requires a premium subscription",
  requiredTier = "premium",
  customPlans,
  currentPlanId
}) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [currency, setCurrency] = useState({ code: 'PHP', symbol: '₱', rate: 1 });
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState('');

  // Access subscription context to ensure upgrade prompt is properly closed
  const { hideUpgradePrompt } = useSubscription();
  
  // Get logged-in user for vendor ID
  const { user } = useAuth();

  // Comprehensive close handler that ensures prompt is hidden in all cases
  const handleClose = () => {

    // ⚠️ CRITICAL: Don't close if payment modal is open
    if (paymentModalOpen) {

      return;
    }
    
    // Call both methods to ensure the prompt is properly closed
    hideUpgradePrompt();
    onClose();
  };

  // Removed repetitive render logs - keeping only user action logs

  // Currency detection and conversion
  useEffect(() => {
    const detectCurrencyFromLocation = async () => {
      try {
        // Try multiple IP geolocation services
        let locationData;
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            locationData = await response.json();
          } else {
            throw new Error(`Primary IP service failed: ${response.status}`);
          }
        } catch (error) {

          try {
            const response = await fetch('https://ip-api.com/json/');
            if (response.ok) {
              locationData = await response.json();
              // ip-api.com uses different field names
              locationData.country_code = locationData.countryCode;
            } else {
              throw new Error(`Backup IP service failed: ${response.status}`);
            }
          } catch (backupError) {

            locationData = { country_code: 'US' }; // Default to US
          }
        }

        const currencyMap: { [key: string]: { code: string; symbol: string } } = {
          'US': { code: 'USD', symbol: '$' },
          'PH': { code: 'PHP', symbol: '₱' },
          'GB': { code: 'GBP', symbol: '£' },
          'EU': { code: 'EUR', symbol: '€' },
          'CA': { code: 'CAD', symbol: 'C$' },
          'AU': { code: 'AUD', symbol: 'A$' },
          'JP': { code: 'JPY', symbol: '¥' },
          'IN': { code: 'INR', symbol: '₹' },
          'SG': { code: 'SGD', symbol: 'S$' },
          'MY': { code: 'MYR', symbol: 'RM' },
        };

        const countryCode = locationData.country_code;

        const detectedCurrency = currencyMap[countryCode] || { code: 'PHP', symbol: '₱' };

        if (detectedCurrency.code !== 'PHP') {
          // Get exchange rate from PHP to detected currency
          const exchangeResponse = await fetch(
            `https://api.exchangerate-api.com/v4/latest/PHP`
          );
          const exchangeData = await exchangeResponse.json();
          const rate = exchangeData.rates[detectedCurrency.code] || 1;

          setCurrency({
            code: detectedCurrency.code,
            symbol: detectedCurrency.symbol,
            rate: rate
          });

        } else {
          setCurrency({ code: 'PHP', symbol: '₱', rate: 1 });

        }
      } catch (error) {
        console.error('Failed to detect currency:', error);
        // Default to PHP if detection fails
        setCurrency({ code: 'PHP', symbol: '₱', rate: 1 });

      } finally {
        setIsLoadingCurrency(false);
      }
    };

    detectCurrencyFromLocation();
  }, []);

  const plans = useMemo(() => {

    const formatPriceForPlan = (phpPrice: number) => {
      if (isLoadingCurrency) return '$...';
      
      const convertedPrice = phpPrice * currency.rate;

      // Format based on currency
      if (currency.code === 'JPY') {
        return `${currency.symbol}${Math.round(convertedPrice).toLocaleString()}`;
      } else {
        return `${currency.symbol}${convertedPrice.toFixed(2)}`;
      }
    };

    // Use custom plans if provided
    if (customPlans) {
      return customPlans.map(plan => ({
        ...plan,
        displayPrice: plan.displayPrice || formatPriceForPlan(plan.price),
        current: currentPlanId ? plan.id === currentPlanId : plan.current,
        highlight: plan.highlight !== undefined ? plan.highlight : requiredTier === plan.id
      }));
    }

    // Default plans for general use
    return [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      displayPrice: 'Free',
      features: [
        'Basic vendor search',
        'Up to 5 vendor contacts',
        'Basic planning tools',
        'Community support'
      ],
      highlight: false,
      current: true,
      popular: false,
      isDefault: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 5,
      displayPrice: formatPriceForPlan(5),
      features: [
        'Unlimited vendor contacts',
        'Advanced search filters',
        'Priority customer support',
        'Wedding timeline tools',
        'Budget tracking',
        'Guest list management'
      ],
      highlight: requiredTier === 'premium',
      current: false,
      popular: true,
      isDefault: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 15,
      displayPrice: formatPriceForPlan(15),
      features: [
        'Everything in Premium',
        'Direct vendor messaging',
        'Vendor portfolio access',
        'Contract management',
        'Payment tracking',
        'Advanced analytics',
        'Custom vendor requests'
      ],
      highlight: requiredTier === 'pro',
      current: false,
      popular: false,
      isDefault: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29,
      displayPrice: formatPriceForPlan(29),
      features: [
        'Everything in Pro',
        'Multiple wedding management',
        'Team collaboration',
        'White-label options',
        'API access',
        'Dedicated account manager',
        'Custom integrations'
      ],
      highlight: requiredTier === 'enterprise',
      current: false,
      popular: false,
      isDefault: false
    }
    ];
  }, [currency, isLoadingCurrency, requiredTier, customPlans, currentPlanId]);

  // Payment handlers
  const handleUpgradeClick = (plan: any) => {
    console.log('🎯 [Subscription] Upgrade clicked:', plan.name, `(${currency.symbol}${plan.price})`);

    if (isProcessing) {
      console.warn('⚠️ [Subscription] Already processing, ignoring duplicate click');
      return;
    }

    setIsProcessing(true);
    
    if (plan.price === 0) {
      console.log('💰 [Subscription] Free plan - processing directly');
      handleFreeUpgrade(plan);
    } else {
      console.log('💳 [Subscription] Paid plan - opening payment modal');
      setSelectedPlan(plan);
      setPaymentModalOpen(true);
      
      // Reset processing state after a delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleFreeUpgrade = async (plan: any) => {
    try {
      // Get vendor ID from authenticated user
      const vendorId = user?.vendorId || user?.id;
      if (!vendorId) {
        throw new Error('Vendor ID not found. Please log in again.');
      }
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // API call to upgrade to free plan (no payment required)
      // ✅ FIXED: Using correct endpoint with authentication
      const backendUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const upgradeUrl = `${backendUrl}/api/subscriptions/upgrade`;
      
      const response = await fetch(upgradeUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Include JWT token
        },
        body: JSON.stringify({ 
          vendor_id: vendorId, // ✅ Use actual logged-in vendor ID
          new_plan: plan.id // Use plan ID: 'basic', 'premium', 'pro', 'enterprise'
        })
      });
      
      if (response.ok) {
        const result = await response.json();

        // Log success
        console.log('✅ Free upgrade successful:', result);

        // Show success message
        setSuccessPlanName(plan.name);
        setShowSuccessMessage(true);
        
        // Trigger a custom event to refresh subscription status
        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));
        
        // Close the upgrade prompt after showing success message
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Call the subscription context's hide function directly
          hideUpgradePrompt();
          
          // Also call the prop onClose for backward compatibility
          onClose();
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Free upgrade error response:', errorData);
        throw new Error(errorData.error || 'Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Free upgrade error:', error);
      alert('Failed to upgrade. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {

    try {
      // Step 1: Validate selectedPlan exists
      if (!selectedPlan) {
        console.error('❌ CRITICAL: selectedPlan is null/undefined!');
        throw new Error('No plan selected. Please try again.');
      }

      // Step 2: Calculate converted amount
      const convertedAmount = selectedPlan.price * currency.rate;

      // Step 3: Get vendor ID from authenticated user
      const vendorId = user?.vendorId || user?.id;

      if (!vendorId) {
        console.error('❌ CRITICAL: No vendor ID found!');
        console.error('❌ User object:', user);
        throw new Error('Vendor ID not found. Please log in again.');
      }

    // Step 4: Build upgrade payload (NO JWT REQUIRED - backend validates vendor_id)

    const upgradePayload = {
      vendor_id: vendorId,
      new_plan: selectedPlan.id,
      payment_method_details: {
        payment_method: 'paymongo',
        amount: convertedAmount,
        currency: currency.code,
        original_amount_php: selectedPlan.price,
        payment_reference: paymentData.id,
        ...paymentData
      }
    };

      // Step 5: Make API call (NO JWT REQUIRED - backend validates vendor_id)
      const backendUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
      const fullApiUrl = `${backendUrl}/api/subscriptions/upgrade`;

      let response;
      try {
        response = await fetch(fullApiUrl, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(upgradePayload)
        });

      } catch (fetchError) {
        console.error('❌❌❌ Step 5: Fetch threw an error!', fetchError);
        console.error('❌ Fetch error stack:', fetchError instanceof Error ? fetchError.stack : 'No stack');
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
      
      // Step 6: Check response

      if (response.ok) {

        // Check if body is already used
        if (response.bodyUsed) {
          console.error('❌❌❌ CRITICAL: Response body already consumed!');
          throw new Error('Response body was already read');
        }
        
        let result;
        try {

          // Try to clone the response to read it as text first for debugging
          const responseClone = response.clone();
          let responseText = '';
          try {
            responseText = await responseClone.text();
            console.log('📄 Step 7: Response body as text:', responseText.substring(0, 500)); // First 500 chars

          } catch (textError) {
            console.error('❌ Failed to read response as text:', textError);
          }
          
          // Race between JSON parsing and timeout
          const jsonPromise = response.json();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('JSON parsing timed out after 10 seconds')), 10000);
          });
          
          result = await Promise.race([jsonPromise, timeoutPromise]);

        } catch (jsonError) {
          console.error('❌❌❌ Step 7: JSON parsing FAILED!');
          console.error('❌ JSON error type:', jsonError?.constructor?.name);
          console.error('❌ JSON error message:', jsonError instanceof Error ? jsonError.message : String(jsonError));
          console.error('❌ JSON error stack:', jsonError instanceof Error ? jsonError.stack : 'No stack');
          
          // If it's a timeout, log special message
          if (jsonError instanceof Error && jsonError.message.includes('timed out')) {
            console.error('⏰⏰⏰ TIMEOUT DETECTED: response.json() never completed!');
            console.error('⏰ This suggests the response body is malformed or empty');
          }
          
          throw new Error('Invalid response from server');
        }
        
        // Step 8: Handle success
        console.log('✅✅✅ Step 8: Subscription upgrade successful!', result);

        // Close payment modal first
        setPaymentModalOpen(false);

        // Show success message
        setSuccessPlanName(selectedPlan.name);
        setShowSuccessMessage(true);

        // Trigger a custom event to refresh subscription status
        console.log('🔄 Dispatching subscriptionUpdated event');
        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));

        // Close the upgrade prompt after showing success message
        setTimeout(() => {
          console.log('🚪 Closing upgrade prompt after success delay');
          setShowSuccessMessage(false);
          hideUpgradePrompt();
          onClose();

        }, 3000);
      } else {
        console.error('❌❌❌ Step 7: Response is NOT OK');
        console.error('❌ Status code:', response.status);
        console.error('❌ Status text:', response.statusText);
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Error response body:', errorData);
        } catch (jsonError) {
          console.error('❌ Failed to parse error response:', jsonError);
          errorData = { error: 'Unknown server error' };
        }
        
        throw new Error(errorData.error || 'Failed to complete subscription upgrade');
      }
    } catch (error) {
      console.error('🚨🚨🚨 [UPGRADE] Subscription upgrade EXCEPTION:', error);
      console.error('🚨 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('🚨 Error type:', typeof error);
      console.error('🚨 Error constructor:', error?.constructor?.name);
      alert('Payment successful but subscription upgrade failed. Please contact support.');
      throw error; // Re-throw to propagate to payment modal
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] overflow-auto">
          {/* Perfect Center Container */}
          <div className="min-h-screen flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Success Message Overlay */}
            <AnimatePresence>
              {showSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Upgrade Successful!
                    </h3>
                    <p className="text-base text-gray-600 mb-1">
                      You are now on the <span className="font-bold text-pink-600">{successPlanName}</span> plan
                    </p>
                    <p className="text-sm text-gray-500">
                      Your subscription has been activated.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden z-10"
            >
              {/* Minimalist Header */}
              <div className="relative p-8 border-b border-gray-100">
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 z-20 group"
                  aria-label="Close upgrade prompt"
                  title="Close"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
                
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-sm">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm ml-[60px]">{message}</p>
                  
                  {isLoadingCurrency && (
                    <div className="mt-3 ml-[60px] flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
                      <span>Detecting your currency...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Plans */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-280px)]">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
                  <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-4">
                    Start with our free Basic plan or upgrade for more powerful features
                  </p>
                  
                  {/* Currency Switcher for Testing */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <label htmlFor="currency-selector" className="text-sm text-gray-600">Currency:</label>
                    <select 
                      id="currency-selector"
                      value={currency.code}
                      onChange={(e) => {
                        const rates = {
                          'PHP': { code: 'PHP', symbol: '₱', rate: 1 },
                          'USD': { code: 'USD', symbol: '$', rate: 56.5 },
                          'EUR': { code: 'EUR', symbol: '€', rate: 0.85 },
                          'GBP': { code: 'GBP', symbol: '£', rate: 0.75 },
                          'CAD': { code: 'CAD', symbol: 'C$', rate: 1.25 },
                          'AUD': { code: 'AUD', symbol: 'A$', rate: 1.35 },
                          'JPY': { code: 'JPY', symbol: '¥', rate: 110 },
                          'SGD': { code: 'SGD', symbol: 'S$', rate: 1.30 }
                        };
                        const selected = rates[e.target.value as keyof typeof rates];
                        setCurrency(selected);
                        setIsLoadingCurrency(false);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      aria-label="Select currency"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="PHP">PHP (₱)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 max-w-7xl mx-auto">
                  {plans.map((plan, index) => {
                    const isRequired = plan.name.toLowerCase() === requiredTier.toLowerCase();
                    const isPopular = plan.popular;
                    const isDefault = plan.isDefault;
                    
                    return (
                      <motion.div
                        key={`plan-${plan.id || index}-${plan.name || index}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        className={`relative p-5 rounded-2xl border transition-all duration-300 h-full flex flex-col ${
                          isRequired
                            ? 'border-pink-300 bg-pink-50/30 shadow-md'
                            : isDefault
                            ? 'border-green-300 bg-green-50/30 shadow-sm'
                            : isPopular
                            ? 'border-purple-300 bg-purple-50/30 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        {isRequired && (
                          <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                              Required
                            </span>
                          </div>
                        )}
                        
                        {isDefault && !isRequired && (
                          <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                              Current Plan
                            </span>
                          </div>
                        )}
                        
                        {isPopular && !isRequired && !isDefault && (
                          <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                              Popular
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-4 pt-2">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                          <div className="mb-3">
                            {plan.price === 0 ? (
                              <div>
                                <span className="text-3xl font-bold text-gray-900">Free</span>
                                <p className="text-xs text-gray-500 mt-1">Forever</p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-3xl font-bold text-gray-900">{plan.displayPrice}</span>
                                <span className="text-gray-500 text-sm">/mo</span>
                                <p className="text-xs text-gray-500 mt-1">Billed monthly</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-2 mb-5 flex-grow">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={`${plan.id || index}-feature-${featureIndex}`} className="flex items-start">
                              <Check className="h-3.5 w-3.5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-xs leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleUpgradeClick(plan)}
                          disabled={isProcessing}
                          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center mt-auto ${
                            isProcessing
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isRequired
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-sm hover:shadow-md'
                              : isDefault
                              ? 'bg-gray-100 text-gray-600 cursor-default'
                              : isPopular
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-sm hover:shadow-md'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          {plan.price === 0 ? 'Current Plan' : `Upgrade to ${plan.name}`}
                          {plan.price > 0 && <ArrowRight className="h-3.5 w-3.5 ml-2" />}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Benefits section */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                    Why Upgrade?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">More Services</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Create unlimited service listings to showcase your expertise.</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">Advanced Analytics</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Track performance with detailed insights and reporting tools.</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-3 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">Priority Support</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">Get faster responses and dedicated assistance from our team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* PayMongo Payment Modal - SIMPLEST APPROACH: Direct render */}
      {selectedPlan && paymentModalOpen && (
        <PayMongoPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPlan(null);
            setIsProcessing(false);
          }}
          booking={{
            id: `subscription-${Date.now()}`,
            vendorName: 'Wedding Bazaar',
            serviceType: `${selectedPlan.name} Subscription`,
            eventDate: new Date().toISOString(),
            bookingReference: `SUB-${selectedPlan.name.toUpperCase()}-${Date.now()}`
          }}
          paymentType="full_payment"
          amount={selectedPlan.price * currency.rate}
          currency={currency.code}
          currencySymbol={currency.symbol}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </AnimatePresence>
  );
};

interface UpgradePromptBannerProps {
  message: string;
  onUpgrade: () => void;
  onDismiss: () => void;
  className?: string;
}

export const UpgradePromptBanner: React.FC<UpgradePromptBannerProps> = ({
  message,
  onUpgrade,
  onDismiss,
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-lg shadow-lg ${className}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Crown size={20} />
        <span className="font-medium">{message}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onUpgrade}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-sm font-medium transition-colors"
        >
          Upgrade
        </button>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded-md transition-colors"
          aria-label="Dismiss upgrade prompt"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);
