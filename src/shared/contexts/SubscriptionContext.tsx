import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './HybridAuthContext';
import type { VendorSubscription } from '../types/subscription';
import { SubscriptionAccess, SUBSCRIPTION_PLANS } from '../types/subscription';

interface SubscriptionContextType {
  subscription: VendorSubscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  
  // Access control methods
  hasAccess: (feature: string) => boolean;
  canCreateService: () => boolean;
  canUploadImages: (currentImages: number) => boolean;
  canAcceptBooking: () => boolean;
  canSendMessage: () => boolean;
  canUseFeature: (featureId: string) => boolean;
  getFeatureLimitMessage: (feature: string) => string;
  isNearLimit: (feature: string, threshold?: number) => boolean;
  
  // UI helpers
  showUpgradePrompt: (message: string, requiredTier?: string) => void;
  hideUpgradePrompt: () => void;
  upgradePrompt: {
    show: boolean;
    message: string;
    requiredTier: string;
  };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<VendorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState({
    show: false,
    message: '',
    requiredTier: ''
  });

  useEffect(() => {
    if (user?.role === 'vendor' && user?.id) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for subscription update events (after payment success)
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      fetchSubscription();
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [user?.vendorId]);

  const fetchSubscription = async () => {
    if (!user?.vendorId) return;
    
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/subscriptions/vendor/${user.vendorId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch subscription`);
      }
      
      const data = await response.json();
      
      if (data.success && data.subscription) {
        // ✅ CRITICAL FIX: Prioritize API response limits over hardcoded predefined limits
        const apiPlanData = data.subscription.plan; // From backend API
        const predefinedPlan = SUBSCRIPTION_PLANS.find(p => p.id === data.subscription.plan_name);
        
        // Use API limits as PRIMARY source, predefined as FALLBACK
        const planLimits = apiPlanData?.limits || predefinedPlan?.limits || SUBSCRIPTION_PLANS[0].limits;
        const planFeatures = apiPlanData?.features || predefinedPlan?.features || [];
        const mappedSubscription: VendorSubscription = {
          id: data.subscription.id,
          vendor_id: data.subscription.vendor_id,
          plan_id: data.subscription.plan_name, // Use plan_name from DB (basic, premium, pro, enterprise)
          status: data.subscription.status,
          current_period_start: data.subscription.current_period_start || data.subscription.start_date,
          current_period_end: data.subscription.current_period_end || data.subscription.end_date,
          trial_end: data.subscription.trial_end || data.subscription.trial_end_date,
          stripe_subscription_id: data.subscription.stripe_subscription_id,
          created_at: data.subscription.created_at,
          updated_at: data.subscription.updated_at,
          usage: {
            services_count: data.subscription.services_count || 0,
            portfolio_items_count: data.subscription.portfolio_items_count || 0,
            monthly_bookings_count: data.subscription.monthly_bookings_count || 0,
            current_bookings_count: data.subscription.current_bookings_count || 0,
            monthly_messages_count: data.subscription.monthly_messages_count || 0,
            video_call_minutes_used: data.subscription.video_call_minutes_used || 0,
            featured_listing_active: data.subscription.featured_listing_active || false,
            social_integrations_count: data.subscription.social_integrations_count || 0,
            api_calls_count: data.subscription.api_calls_count || 0,
            webhook_calls_count: data.subscription.webhook_calls_count || 0,
            last_updated: data.subscription.last_updated || new Date().toISOString()
          },
          plan: {
            id: data.subscription.plan_name,
            name: apiPlanData?.name || predefinedPlan?.name || data.subscription.plan_name,
            description: predefinedPlan?.description || '',
            price: apiPlanData?.price ?? predefinedPlan?.price ?? 0,
            billing_cycle: data.subscription.billing_cycle || 'monthly',
            tier: data.subscription.plan_name as 'basic' | 'premium' | 'pro' | 'enterprise',
            features: planFeatures,
            // ✅ USE DYNAMIC LIMITS FROM API (NOT HARDCODED)
            // The planLimits variable now prioritizes API limits over predefined limits
            limits: {
              max_services: planLimits.max_services,
              max_service_images: planLimits.max_service_images,
              max_portfolio_items: planLimits.max_portfolio_items,
              max_monthly_bookings: planLimits.max_monthly_bookings,
              max_concurrent_bookings: planLimits.max_concurrent_bookings,
              booking_advance_days: planLimits.booking_advance_days,
              max_monthly_messages: planLimits.max_monthly_messages,
              max_message_attachments: planLimits.max_message_attachments,
              video_call_duration: planLimits.video_call_duration,
              featured_listing_days: planLimits.featured_listing_days,
              max_social_media_integrations: planLimits.max_social_media_integrations,
              custom_branding: planLimits.custom_branding,
              seo_tools: planLimits.seo_tools,
              analytics_history_days: planLimits.analytics_history_days,
              export_data: planLimits.export_data,
              advanced_reports: planLimits.advanced_reports,
              multi_location: planLimits.multi_location,
              team_members: planLimits.team_members,
              custom_contracts: planLimits.custom_contracts,
              payment_processing: planLimits.payment_processing,
              api_calls_per_month: planLimits.api_calls_per_month,
              webhook_endpoints: planLimits.webhook_endpoints,
              third_party_integrations: planLimits.third_party_integrations
            }
          }
        };
        
        setSubscription(mappedSubscription);
        
        // ❌ REMOVED: Do not auto-hide upgrade prompt when subscription loads
        // The upgrade prompt should only be hidden by user action (close button/backdrop)
        // or after successful upgrade (handled in upgrade success callback)
      } else {
        // Provide a FREE TIER fallback subscription (basic plan with 5 services limit)
        const fallbackSubscription: VendorSubscription = {
          id: 'dev-fallback',
          vendor_id: user?.id || 'dev-vendor',
          plan_id: 'basic',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: undefined,
          stripe_subscription_id: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage: {
            services_count: 0,
            portfolio_items_count: 0,
            monthly_bookings_count: 0,
            current_bookings_count: 0,
            monthly_messages_count: 0,
            video_call_minutes_used: 0,
            featured_listing_active: false,
            social_integrations_count: 0,
            api_calls_count: 0,
            webhook_calls_count: 0,
            last_updated: new Date().toISOString()
          },
          plan: SUBSCRIPTION_PLANS.find(p => p.id === 'basic') || SUBSCRIPTION_PLANS[0]
        };
        setSubscription(fallbackSubscription);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
      console.error('❌ [SubscriptionContext] Error:', errorMessage);
      // Provide FREE TIER fallback on error (basic plan with 5 services limit)
      const fallbackSubscription: VendorSubscription = {
        id: 'dev-fallback-error',
        vendor_id: user?.id || 'dev-vendor',
        plan_id: 'basic',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_end: undefined,
        stripe_subscription_id: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage: {
          services_count: 0,
          portfolio_items_count: 0,
          monthly_bookings_count: 0,
          current_bookings_count: 0,
          monthly_messages_count: 0,
          video_call_minutes_used: 0,
          featured_listing_active: false,
          social_integrations_count: 0,
          api_calls_count: 0,
          webhook_calls_count: 0,
          last_updated: new Date().toISOString()
        },
        plan: SUBSCRIPTION_PLANS.find(p => p.id === 'basic') || SUBSCRIPTION_PLANS[0]
      };
      setSubscription(fallbackSubscription);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Access control methods
  const hasAccess = (feature: string): boolean => {
    if (!subscription) return false;
    
    // Enterprise plan has access to everything
    if (subscription.plan.id === 'enterprise') {
      return true;
    }
    
    // Check specific feature access for other plans
    const hasFeatureAccess = SubscriptionAccess.canUseFeature(subscription, feature);
    return hasFeatureAccess;
  };

  const canCreateService = (): boolean => {
    // For development: allow service creation even without subscription
    if (!subscription) {
      return true;
    }
    return SubscriptionAccess.canCreateService(subscription);
  };

  const canUploadImages = (currentImages: number): boolean => {
    // For development: allow image uploads even without subscription
    if (!subscription) {
      return true;
    }
    return SubscriptionAccess.canUploadImages(subscription, currentImages);
  };

  const canAcceptBooking = (): boolean => {
    // For development: allow bookings even without subscription
    if (!subscription) {
      return true;
    }
    return SubscriptionAccess.canAcceptBooking(subscription);
  };

  const canSendMessage = (): boolean => {
    // For development: allow messaging even without subscription
    if (!subscription) {
      return true;
    }
    return SubscriptionAccess.canSendMessage(subscription);
  };

  const canUseFeature = (featureId: string): boolean => {
    // For development: allow all features even without subscription
    if (!subscription) {
      return true;
    }
    return SubscriptionAccess.canUseFeature(subscription, featureId);
  };

  const getFeatureLimitMessage = (feature: string): string => {
    if (!subscription) return '';
    return SubscriptionAccess.getFeatureLimitMessage(subscription, feature);
  };

  const isNearLimit = (feature: string, threshold = 0.8): boolean => {
    if (!subscription) return false;
    return SubscriptionAccess.isNearLimit(subscription, feature, threshold);
  };

  // UI helpers
  const showUpgradePrompt = (message: string, requiredTier = 'premium') => {
    console.log('🔔 [SubscriptionContext] showUpgradePrompt called:', {
      message,
      requiredTier,
      currentSubscription: subscription?.plan_id,
      timestamp: new Date().toISOString()
    });
    
    setUpgradePrompt({
      show: true,
      message,
      requiredTier
    });
    
    console.log('✅ [SubscriptionContext] Upgrade prompt state updated to SHOW');
  };

  const hideUpgradePrompt = () => {
    console.log('❌ [SubscriptionContext] hideUpgradePrompt called');
    
    setUpgradePrompt({
      show: false,
      message: '',
      requiredTier: ''
    });
    
    console.log('✅ [SubscriptionContext] Upgrade prompt state updated to HIDE');
  };

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    hasAccess,
    canCreateService,
    canUploadImages,
    canAcceptBooking,
    canSendMessage,
    canUseFeature,
    getFeatureLimitMessage,
    isNearLimit,
    showUpgradePrompt,
    hideUpgradePrompt,
    upgradePrompt
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// HOC for subscription-gated components
export const withSubscriptionGate = <P extends object>(
  Component: React.ComponentType<P>,
  requiredTier: 'basic' | 'premium' | 'pro' | 'enterprise' = 'basic'
) => {
  return (props: P) => {
    const { subscription, loading } = useSubscription();
    
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      );
    }
    
    if (!subscription) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription Required</h2>
          <p className="text-gray-600">Please subscribe to access this feature.</p>
        </div>
      );
    }
    
    const tierLevels = {
      basic: 1,
      premium: 2,
      pro: 3,
      enterprise: 4
    };
    
    const userTierLevel = tierLevels[subscription.plan.tier];
    const requiredTierLevel = tierLevels[requiredTier];
    
    if (userTierLevel < requiredTierLevel) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Upgrade Required</h2>
          <p className="text-gray-600">
            This feature requires a {requiredTier} subscription or higher.
          </p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
