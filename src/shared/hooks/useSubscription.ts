import { useState, useEffect } from 'react';
import { SubscriptionAccess } from '../types/subscription';
import type { VendorSubscription } from '../types/subscription';

// Hook to check subscription access
export const useSubscriptionAccess = (vendorId: string) => {
  const [subscription, setSubscription] = useState<VendorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
    
    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      fetchSubscription();
    };
    
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate);
    };
  }, [vendorId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // Use the correct subscription API endpoint
      const response = await fetch(`/api/subscriptions/vendor/${vendorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  // Access control methods
  const canCreateService = () => {
    if (!subscription) return false;
    return SubscriptionAccess.canCreateService(subscription);
  };

  const canUploadImages = (currentImages: number) => {
    if (!subscription) return false;
    return SubscriptionAccess.canUploadImages(subscription, currentImages);
  };

  const canAcceptBooking = () => {
    if (!subscription) return false;
    return SubscriptionAccess.canAcceptBooking(subscription);
  };

  const canSendMessage = () => {
    if (!subscription) return false;
    return SubscriptionAccess.canSendMessage(subscription);
  };

  const canUseFeature = (featureId: string) => {
    if (!subscription) return false;
    return SubscriptionAccess.canUseFeature(subscription, featureId);
  };

  const getFeatureLimitMessage = (feature: string) => {
    if (!subscription) return '';
    return SubscriptionAccess.getFeatureLimitMessage(subscription, feature);
  };

  const isNearLimit = (feature: string) => {
    if (!subscription) return false;
    return SubscriptionAccess.isNearLimit(subscription, feature);
  };

  return {
    subscription,
    loading,
    error,
    canCreateService,
    canUploadImages,
    canAcceptBooking,
    canSendMessage,
    canUseFeature,
    getFeatureLimitMessage,
    isNearLimit,
    refreshSubscription: fetchSubscription
  };
};

// Hook for subscription warnings and upgrade prompts
export const useSubscriptionWarnings = (subscription: VendorSubscription | null) => {
  const [warnings, setWarnings] = useState<Array<{
    type: 'warning' | 'limit' | 'upgrade';
    feature: string;
    message: string;
    action?: string;
  }>>([]);

  useEffect(() => {
    if (!subscription) return;

    const newWarnings = [];

    // Check for near limits
    if (SubscriptionAccess.isNearLimit(subscription, 'services')) {
      newWarnings.push({
        type: 'warning' as const,
        feature: 'services',
        message: 'You\'re approaching your service limit',
        action: 'Upgrade to add more services'
      });
    }

    if (SubscriptionAccess.isNearLimit(subscription, 'bookings')) {
      newWarnings.push({
        type: 'warning' as const,
        feature: 'bookings',
        message: 'You\'re approaching your monthly booking limit',
        action: 'Upgrade for unlimited bookings'
      });
    }

    if (SubscriptionAccess.isNearLimit(subscription, 'messages')) {
      newWarnings.push({
        type: 'warning' as const,
        feature: 'messages',
        message: 'You\'re approaching your monthly message limit',
        action: 'Upgrade for more messages'
      });
    }

    // Check for reached limits
    if (!SubscriptionAccess.canCreateService(subscription)) {
      newWarnings.push({
        type: 'limit' as const,
        feature: 'services',
        message: 'You\'ve reached your service limit',
        action: 'Upgrade to add more services'
      });
    }

    if (!SubscriptionAccess.canAcceptBooking(subscription)) {
      newWarnings.push({
        type: 'limit' as const,
        feature: 'bookings',
        message: 'You\'ve reached your monthly booking limit',
        action: 'Upgrade for unlimited bookings'
      });
    }

    if (!SubscriptionAccess.canSendMessage(subscription)) {
      newWarnings.push({
        type: 'limit' as const,
        feature: 'messages',
        message: 'You\'ve reached your monthly message limit',
        action: 'Upgrade for more messages'
      });
    }

    setWarnings(newWarnings);
  }, [subscription]);

  return warnings;
};

// Hook for upgrade suggestions based on usage patterns
export const useUpgradeSuggestions = (subscription: VendorSubscription | null) => {
  const [suggestions, setSuggestions] = useState<Array<{
    reason: string;
    benefit: string;
    feature: string;
    urgency: 'low' | 'medium' | 'high';
  }>>([]);

  useEffect(() => {
    if (!subscription) return;

    const newSuggestions = [];

    // Analyze usage patterns and suggest upgrades
    if (subscription.plan.tier === 'basic') {
      if (subscription.usage.services_count >= 3) {
        newSuggestions.push({
          reason: 'You\'re actively using most of your service slots',
          benefit: 'Upgrade to Premium for unlimited services',
          feature: 'services',
          urgency: 'medium' as const
        });
      }

      if (subscription.usage.monthly_bookings_count >= 15) {
        newSuggestions.push({
          reason: 'You\'re getting lots of bookings',
          benefit: 'Upgrade for advanced booking management and unlimited monthly bookings',
          feature: 'bookings',
          urgency: 'high' as const
        });
      }

      if (!subscription.plan.limits.featured_listing_days) {
        newSuggestions.push({
          reason: 'Increase your visibility',
          benefit: 'Featured listings can increase bookings by up to 40%',
          feature: 'marketing',
          urgency: 'low' as const
        });
      }
    }

    if (subscription.plan.tier === 'premium') {
      if (subscription.usage.monthly_bookings_count >= 80) {
        newSuggestions.push({
          reason: 'Your business is growing rapidly',
          benefit: 'Professional plan offers team management and multi-location support',
          feature: 'business',
          urgency: 'medium' as const
        });
      }
    }

    setSuggestions(newSuggestions);
  }, [subscription]);

  return suggestions;
};
