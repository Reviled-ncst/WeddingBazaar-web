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

  // Debug: Monitor payment modal state changes
  useEffect(() => {
    console.log('🔄 [UpgradePrompt] Payment Modal State Changed:', {
      paymentModalOpen,
      hasSelectedPlan: !!selectedPlan,
      selectedPlanName: selectedPlan?.name,
      selectedPlanPrice: selectedPlan?.price
    });
  }, [paymentModalOpen, selectedPlan]);

  // Debug: Monitor isOpen prop changes
  useEffect(() => {
    console.log('🔄 [UpgradePrompt] isOpen prop changed:', {
      isOpen,
      timestamp: new Date().toISOString()
    });
  }, [isOpen]);

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

  // State for preventing double clicks
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment handlers
  const handleUpgradeClick = (plan: any) => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 [UpgradePrompt] UPGRADE BUTTON CLICKED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Plan Details:', {
      planId: plan.id,
      planName: plan.name, 
      planPrice: plan.price,
      planDisplayPrice: plan.displayPrice,
      planFeatures: plan.features?.length || 0,
      isHighlighted: plan.highlight,
      isCurrent: plan.current,
      isPopular: plan.popular
    });
    console.log('🔒 State Before Processing:', {
      isProcessing,
      paymentModalOpen,
      hasSelectedPlan: !!selectedPlan,
      selectedPlanName: selectedPlan?.name || 'none',
      currency: currency.code,
      currencyRate: currency.rate
    });

    if (isProcessing) {
      console.warn('⚠️ [UpgradePrompt] Already processing, ignoring click');
      console.warn('⏳ This prevents double-clicks while processing previous request');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      return;
    }

    console.log('✅ Proceeding with upgrade process...');
    setIsProcessing(true);
    console.log('🔐 isProcessing set to TRUE to prevent double-clicks');
    
    if (plan.price === 0) {
      console.log('');
      console.log('💰 FREE PLAN DETECTED');
      console.log('📞 Calling handleFreeUpgrade()...');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      // Handle free plan upgrade directly
      handleFreeUpgrade(plan);
    } else {
      console.log('');
      console.log('💳 PAID PLAN DETECTED - OPENING PAYMENT MODAL');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Open PayMongo payment modal for paid plans
      const convertedAmount = plan.price * currency.rate;
      console.log('� Price Conversion:', {
        originalPricePHP: plan.price,
        targetCurrency: currency.code,
        exchangeRate: currency.rate,
        convertedAmount: convertedAmount.toFixed(2),
        displayPrice: `${currency.symbol}${convertedAmount.toFixed(2)}`
      });

      // CRITICAL FIX: Set state synchronously first
      console.log('');
      console.log('📝 SETTING MODAL STATE (CRITICAL STEP)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📝 Selected Plan Object to be stored:', {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        displayPrice: plan.displayPrice,
        fullPlanObject: plan
      });
      
      console.log('🔧 Calling setSelectedPlan()...');
      setSelectedPlan(plan);
      console.log('✅ setSelectedPlan() called - plan will be available on next render');
      
      console.log('🔧 Calling setPaymentModalOpen(true)...');
      setPaymentModalOpen(true);
      console.log('✅ setPaymentModalOpen(true) called - modal will open on next render');
      
      console.log('');
      console.log('⏳ STATE UPDATE QUEUED (React will re-render component):');
      console.log('   • selectedPlan: will be', plan.name);
      console.log('   • paymentModalOpen: will be TRUE');
      console.log('   • PayMongoPaymentModal: will render via createPortal');
      console.log('');
      console.log('🎬 NEXT: Component will re-render and show payment modal');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      
      // Reset processing state after a delay
      setTimeout(() => {
        console.log('🔓 [UpgradePrompt] Resetting isProcessing to FALSE (1 second delay)');
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

        // Trigger a custom event to refresh subscription status
        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));
        
        // Close the upgrade prompt using both methods to ensure it's properly closed
        setTimeout(() => {
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
      const fullApiUrl = `${backendUrl}/api/subscriptions/payment/upgrade`;

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

        setPaymentModalOpen(false);

        // Trigger a custom event to refresh subscription status

        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));

        // Close the upgrade prompt using both methods to ensure it's properly closed
        setTimeout(() => {

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
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-10 text-white relative overflow-hidden">
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-full transition-all duration-200 z-20 backdrop-blur-sm"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Crown className="h-12 w-12" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold mb-2">{title}</h2>
                      <p className="text-xl text-pink-100">{message}</p>
                      {isLoadingCurrency && (
                        <p className="text-sm text-pink-200 mt-2">
                          Detecting your currency...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-pink-100">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      <span>Instant Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      <span>Cancel Anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      <span>Premium Features</span>
                    </div>
                  </div>
                </div>
                
                {/* Animated background elements */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full animate-pulse" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
              </div>

              {/* Plans */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-280px)]">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Choose Your Plan</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                    Start with our free Basic plan or upgrade for more powerful features
                  </p>
                  
                  {/* Currency Switcher for Testing */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-sm text-gray-600">Currency:</span>
                    <select 
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto">
                  {plans.map((plan, index) => {
                    const isRequired = plan.name.toLowerCase() === requiredTier.toLowerCase();
                    const isPopular = plan.popular;
                    const isDefault = plan.isDefault;
                    
                    return (
                      <motion.div
                        key={`plan-${plan.id || index}-${plan.name || index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 h-full flex flex-col ${
                          isRequired
                            ? 'border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 ring-2 ring-pink-200 scale-[1.02] shadow-xl'
                            : isDefault
                            ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                            : isPopular
                            ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        {isRequired && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg">
                              ✨ Required
                            </span>
                          </div>
                        )}
                        
                        {isDefault && !isRequired && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              🆓 Default Plan
                            </span>
                          </div>
                        )}
                        
                        {isPopular && !isRequired && !isDefault && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              🔥 Popular
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-6 pt-2">
                          <h3 className="text-xl font-bold text-gray-800 mb-3">{plan.name}</h3>
                          <div className="mb-4">
                            {plan.price === 0 ? (
                              <div>
                                <span className="text-4xl font-bold text-green-600">Free</span>
                                <p className="text-sm text-gray-500 mt-1">Forever</p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-4xl font-bold text-gray-900">{plan.displayPrice}</span>
                                <span className="text-gray-500 text-base">/month</span>
                                <p className="text-sm text-gray-500 mt-1">Billed monthly</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-3 mb-6 flex-grow">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={`${plan.id || index}-feature-${featureIndex}`} className="flex items-start">
                              <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleUpgradeClick(plan)}
                          disabled={isProcessing}
                          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center mt-auto ${
                            isProcessing
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : isRequired
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                              : isDefault
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                              : isPopular
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                          }`}
                        >
                          {plan.price === 0 ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Benefits section */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10">
                  <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Why Upgrade Today?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-8 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Crown className="h-12 w-12 text-pink-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-4">More Services</h4>
                      <p className="text-gray-600 leading-relaxed">Create unlimited service listings to showcase your expertise and attract more clients to your wedding business.</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-8 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Zap className="h-12 w-12 text-purple-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-4">Advanced Analytics</h4>
                      <p className="text-gray-600 leading-relaxed">Track your business performance with detailed insights, revenue analytics, and professional reporting tools.</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-8 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Check className="h-12 w-12 text-indigo-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-4">Priority Support</h4>
                      <p className="text-gray-600 leading-relaxed">Get faster responses, phone support, and dedicated assistance from our expert customer success team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* PayMongo Payment Modal - Rendered as Portal to avoid nesting issues */}
      {(() => {
        const hasSelectedPlan = !!selectedPlan;
        const willRender = hasSelectedPlan && paymentModalOpen;
        
        console.log('');
        console.log('🎭 ═══════════════════════════════════════════════════════');
        console.log('🔍 [UpgradePrompt] PAYMENT MODAL RENDER EVALUATION');
        console.log('🎭 ═══════════════════════════════════════════════════════');
        console.log('📊 State Check:', { 
          hasSelectedPlan, 
          selectedPlanName: selectedPlan?.name || 'NONE',
          selectedPlanId: selectedPlan?.id || 'NONE',
          selectedPlanPrice: selectedPlan?.price || 'NONE',
          paymentModalOpen,
          willRender,
          timestamp: new Date().toISOString()
        });
        
        if (willRender) {
          console.log('');
          console.log('✅ ✅ ✅ WILL RENDER PayMongoPaymentModal ✅ ✅ ✅');
          console.log('🚀 Creating portal to document.body with PayMongoPaymentModal');
          console.log('💳 Modal Props:');
          console.log('   • isOpen:', paymentModalOpen);
          console.log('   • booking.serviceType:', `${selectedPlan.name} Subscription`);
          console.log('   • amount:', selectedPlan.price * currency.rate);
          console.log('   • currency:', currency.code);
          console.log('   • currencySymbol:', currency.symbol);
          console.log('🎭 ═══════════════════════════════════════════════════════');
          console.log('');
        } else {
          console.log('');
          console.log('❌ ❌ ❌ WILL NOT RENDER PayMongoPaymentModal ❌ ❌ ❌');
          console.log('🚫 Reason:', {
            hasSelectedPlan: hasSelectedPlan ? '✅ YES' : '❌ NO (this is the problem!)',
            paymentModalOpen: paymentModalOpen ? '✅ YES' : '❌ NO (this is the problem!)',
            bothRequired: 'Both must be TRUE to render'
          });
          console.log('🔍 Debug Info:', {
            selectedPlanObject: selectedPlan || 'NULL/UNDEFINED',
            paymentModalOpenValue: paymentModalOpen,
            typeOfSelectedPlan: typeof selectedPlan,
            booleanCheckSelectedPlan: !!selectedPlan
          });
          console.log('🎭 ═══════════════════════════════════════════════════════');
          console.log('');
        }
        
        return null;
      })()}
      {selectedPlan && paymentModalOpen && createPortal(
        <PayMongoPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            console.log('🚪 [PayMongoPaymentModal] onClose called');
            setPaymentModalOpen(false);
            setSelectedPlan(null); // Clear selected plan
            setIsProcessing(false); // Reset processing state
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
        />,
        document.body
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
        >
          <X size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);
