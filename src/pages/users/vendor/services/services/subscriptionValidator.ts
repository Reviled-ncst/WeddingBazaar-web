/**
 * 💳 Subscription Validation Service
 * 
 * Handles subscription tier validation and service limit checks
 */

export interface SubscriptionLimits {
  max_services: number;
  max_images_per_service: number;
  can_feature_services: boolean;
  advanced_analytics: boolean;
}

export interface SubscriptionPlan {
  name: string;
  tier: 'basic' | 'premium' | 'pro' | 'enterprise';
  limits: SubscriptionLimits;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
}

export interface ServiceLimitCheck {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  isUnlimited: boolean;
  message?: string;
  suggestedPlan?: string;
}

/**
 * Check if vendor can add more services
 */
export function checkServiceLimit(
  subscription: Subscription | null,
  currentServicesCount: number,
  isEditing: boolean = false
): ServiceLimitCheck {
  // Always allow editing existing services
  if (isEditing) {
    return {
      allowed: true,
      currentCount: currentServicesCount,
      maxAllowed: -1,
      isUnlimited: true
    };
  }

  // Default limits for basic/no subscription
  const maxServices = subscription?.plan?.limits?.max_services || 5;
  const isUnlimited = maxServices === -1;
  const planName = subscription?.plan?.name || 'Basic';
  
  // Check if limit exceeded
  const allowed = isUnlimited || currentServicesCount < maxServices;
  
  const result: ServiceLimitCheck = {
    allowed,
    currentCount: currentServicesCount,
    maxAllowed: maxServices,
    isUnlimited
  };

  if (!allowed) {
    const nextPlan = subscription?.plan?.tier === 'basic' ? 'premium' : 'pro';
    result.message = `You've reached the maximum of ${maxServices} services for your ${planName} plan. Upgrade to unlock more!`;
    result.suggestedPlan = nextPlan;
  }

  return result;
}

/**
 * Check if vendor can feature a service
 */
export function canFeatureService(subscription: Subscription | null): boolean {
  return subscription?.plan?.limits?.can_feature_services || false;
}

/**
 * Get upgrade message for service limits
 */
export function getUpgradeMessage(
  currentTier: 'basic' | 'premium' | 'pro',
  feature: 'services' | 'images' | 'featured' | 'analytics'
): { message: string; suggestedPlan: string } {
  const messages = {
    services: {
      basic: {
        message: 'Upgrade to Premium for up to 15 services, or Pro for unlimited!',
        suggestedPlan: 'premium'
      },
      premium: {
        message: 'Upgrade to Pro for unlimited services!',
        suggestedPlan: 'pro'
      },
      pro: {
        message: 'You already have unlimited services!',
        suggestedPlan: 'pro'
      }
    },
    images: {
      basic: {
        message: 'Upgrade to Premium for up to 10 images per service!',
        suggestedPlan: 'premium'
      },
      premium: {
        message: 'Upgrade to Pro for unlimited images!',
        suggestedPlan: 'pro'
      },
      pro: {
        message: 'You already have unlimited images!',
        suggestedPlan: 'pro'
      }
    },
    featured: {
      basic: {
        message: 'Upgrade to Premium to feature your services and get 3x more visibility!',
        suggestedPlan: 'premium'
      },
      premium: {
        message: 'You can already feature services!',
        suggestedPlan: 'premium'
      },
      pro: {
        message: 'You can already feature services!',
        suggestedPlan: 'pro'
      }
    },
    analytics: {
      basic: {
        message: 'Upgrade to Premium for advanced analytics and insights!',
        suggestedPlan: 'premium'
      },
      premium: {
        message: 'You already have advanced analytics!',
        suggestedPlan: 'premium'
      },
      pro: {
        message: 'You already have advanced analytics!',
        suggestedPlan: 'pro'
      }
    }
  };

  return messages[feature][currentTier];
}

/**
 * Validate if vendor profile exists before creating services
 */
export async function ensureVendorProfile(
  vendorId: string | null,
  userId: string | null
): Promise<{ exists: boolean; error?: string }> {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
  
  try {
    const targetVendorId = vendorId || userId;
    if (!targetVendorId) {
      return { exists: false, error: 'No vendor ID available' };
    }

    // Try vendor profile API first (new system)
    const checkResponse = await fetch(`${apiUrl}/api/vendor-profile/${targetVendorId}`);
    
    if (checkResponse.ok) {
      return { exists: true };
    }
    
    if (checkResponse.status === 404) {
      // Try looking up by user ID as fallback
      const userIdCheck = await fetch(`${apiUrl}/api/vendor-profile/user/${userId}`);
      if (userIdCheck.ok) {
        return { exists: true };
      }
      
      return { 
        exists: false, 
        error: 'Vendor profile required. Please complete your business profile first.' 
      };
    }
    
    return { 
      exists: false, 
      error: 'Unable to verify vendor profile. Please check your connection.' 
    };
    
  } catch (error) {
    console.error('❌ [subscriptionValidator] Error checking vendor profile:', error);
    return { 
      exists: false, 
      error: 'Unable to verify vendor profile. Please check your connection.' 
    };
  }
}
