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
      console.log('🔄 [SubscriptionContext] Received subscriptionUpdated event, refetching...');
      fetchSubscription();
    };

    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [user?.id]);

  const fetchSubscription = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔔 [SubscriptionContext] Fetching subscription for vendor:', user.id);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/subscriptions/vendor/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch subscription`);
      }
      
      const data = await response.json();
      
      if (data.success && data.subscription) {
        console.log('✅ [SubscriptionContext] Subscription loaded:', data.subscription.plan_name);
        
        // Find the predefined plan to get the correct features
        const predefinedPlan = SUBSCRIPTION_PLANS.find(p => p.id === data.subscription.plan_id);
        const planFeatures = predefinedPlan ? predefinedPlan.features : JSON.parse(data.subscription.plan_features || '[]');
        
        console.log('🔧 [SubscriptionContext] Using features from predefined plan:', predefinedPlan?.name, 'Features count:', planFeatures.length);
        
        // Map backend response to frontend interface
        const mappedSubscription: VendorSubscription = {
          id: data.subscription.id,
          vendor_id: data.subscription.vendor_id,
          plan_id: data.subscription.plan_id,
          status: data.subscription.status,
          current_period_start: data.subscription.current_period_start,
          current_period_end: data.subscription.current_period_end,
          trial_end: data.subscription.trial_end,
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
            id: data.subscription.plan_id,
            name: data.subscription.plan_name,
            description: data.subscription.plan_description,
            price: 0, // Will be populated from SUBSCRIPTION_PLANS
            billing_cycle: 'monthly',
            tier: data.subscription.plan_id as 'basic' | 'premium' | 'pro' | 'enterprise',
            features: planFeatures,
            limits: {
              max_services: data.subscription.max_services || 5,
              max_service_images: data.subscription.max_images_per_service || 3,
              max_portfolio_items: data.subscription.max_gallery_images || 10,
              max_monthly_bookings: data.subscription.max_bookings_per_month || 20,
              max_concurrent_bookings: 5,
              booking_advance_days: 90,
              max_monthly_messages: 100,
              max_message_attachments: 1,
              video_call_duration: 0,
              featured_listing_days: data.subscription.includes_featured_listing ? 7 : 0,
              max_social_media_integrations: 1,
              custom_branding: data.subscription.includes_custom_branding || false,
              seo_tools: false,
              analytics_history_days: 30,
              export_data: false,
              advanced_reports: data.subscription.includes_analytics || false,
              multi_location: false,
              team_members: 1,
              custom_contracts: false,
              payment_processing: data.subscription.includes_payment_processing || true,
              api_calls_per_month: 1000,
              webhook_endpoints: 1,
              third_party_integrations: 2
            }
          }
        };
        
        setSubscription(mappedSubscription);
        
        // If subscription is successfully updated and an upgrade prompt is showing, hide it
        if (upgradePrompt.show) {
          console.log('🔄 [SubscriptionContext] Subscription updated, hiding upgrade prompt');
          setUpgradePrompt({
            show: false,
            message: '',
            requiredTier: ''
          });
        }
      } else {
        console.log('⚠️ [SubscriptionContext] No subscription found, providing development fallback');
        // Provide a development fallback subscription
        const fallbackSubscription: VendorSubscription = {
          id: 'dev-fallback',
          vendor_id: user?.id || 'dev-vendor',
          plan_id: 'enterprise',
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
          plan: SUBSCRIPTION_PLANS.find(p => p.id === 'enterprise') || SUBSCRIPTION_PLANS[0]
        };
        setSubscription(fallbackSubscription);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription';
      console.error('❌ [SubscriptionContext] Error:', errorMessage);
      console.log('🔧 [SubscriptionContext] Providing development fallback due to error');
      
      // Provide development fallback on error too
      const fallbackSubscription: VendorSubscription = {
        id: 'dev-fallback-error',
        vendor_id: user?.id || 'dev-vendor',
        plan_id: 'enterprise',
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
        plan: SUBSCRIPTION_PLANS.find(p => p.id === 'enterprise') || SUBSCRIPTION_PLANS[0]
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
      console.log(`✅ [SubscriptionContext] Enterprise plan has access to feature: ${feature}`);
      return true;
    }
    
    // Check specific feature access for other plans
    const hasFeatureAccess = SubscriptionAccess.canUseFeature(subscription, feature);
    console.log(`🔍 [SubscriptionContext] Feature access check for ${feature}: ${hasFeatureAccess} (Plan: ${subscription.plan.id})`);
    
    return hasFeatureAccess;
  };

  const canCreateService = (): boolean => {
    // For development: allow service creation even without subscription
    if (!subscription) {
      console.log('⚠️ [SubscriptionContext] No subscription loaded, allowing service creation for development');
      return true;
    }
    return SubscriptionAccess.canCreateService(subscription);
  };

  const canUploadImages = (currentImages: number): boolean => {
    // For development: allow image uploads even without subscription
    if (!subscription) {
      console.log('⚠️ [SubscriptionContext] No subscription loaded, allowing image uploads for development');
      return true;
    }
    return SubscriptionAccess.canUploadImages(subscription, currentImages);
  };

  const canAcceptBooking = (): boolean => {
    // For development: allow bookings even without subscription
    if (!subscription) {
      console.log('⚠️ [SubscriptionContext] No subscription loaded, allowing booking acceptance for development');
      return true;
    }
    return SubscriptionAccess.canAcceptBooking(subscription);
  };

  const canSendMessage = (): boolean => {
    // For development: allow messaging even without subscription
    if (!subscription) {
      console.log('⚠️ [SubscriptionContext] No subscription loaded, allowing messaging for development');
      return true;
    }
    return SubscriptionAccess.canSendMessage(subscription);
  };

  const canUseFeature = (featureId: string): boolean => {
    // For development: allow all features even without subscription
    if (!subscription) {
      console.log('⚠️ [SubscriptionContext] No subscription loaded, allowing feature access for development');
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
    setUpgradePrompt({
      show: true,
      message,
      requiredTier
    });
  };

  const hideUpgradePrompt = () => {
    setUpgradePrompt({
      show: false,
      message: '',
      requiredTier: ''
    });
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
