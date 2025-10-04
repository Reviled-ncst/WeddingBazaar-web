// Subscription system types and access control
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  tier: 'basic' | 'premium' | 'pro' | 'enterprise';
  popular?: boolean;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'marketing' | 'analytics' | 'communication' | 'advanced';
  enabled: boolean;
}

export interface SubscriptionLimits {
  // Service Limits
  max_services: number;
  max_service_images: number;
  max_portfolio_items: number;
  
  // Booking Limits
  max_monthly_bookings: number;
  max_concurrent_bookings: number;
  booking_advance_days: number;
  
  // Communication Limits  
  video_call_duration: number; // minutes
  
  // Marketing Features
  featured_listing_days: number;
  max_social_media_integrations: number;
  custom_branding: boolean;
  seo_tools: boolean;
  
  // Analytics & Reporting
  analytics_history_days: number;
  export_data: boolean;
  advanced_reports: boolean;
  
  // Business Features
  multi_location: boolean;
  team_members: number;
  custom_contracts: boolean;
  payment_processing: boolean;
  
  // API & Integration
  api_calls_per_month: number;
  webhook_endpoints: number;
  third_party_integrations: number;
}

export interface VendorSubscription {
  id: string;
  vendor_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'trial' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
  
  // Current usage tracking
  usage: SubscriptionUsage;
  plan: SubscriptionPlan;
}

export interface SubscriptionUsage {
  // Service Usage
  services_count: number;
  portfolio_items_count: number;
  
  // Booking Usage (current month)
  monthly_bookings_count: number;
  current_bookings_count: number;
  
  // Communication Usage (current month)
  video_call_minutes_used: number;
  
  // Marketing Usage
  featured_listing_active: boolean;
  social_integrations_count: number;
  
  // API Usage (current month)
  api_calls_count: number;
  webhook_calls_count: number;
  
  last_updated: string;
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for new vendors getting started',
    price: 0,
    billing_cycle: 'monthly',
    tier: 'basic',
    features: [
      { id: 'basic_profile', name: 'Basic Profile', description: 'Create and manage your business profile', category: 'core', enabled: true },
      { id: 'service_listings', name: 'Service Listings', description: 'List your services and packages', category: 'core', enabled: true },
      { id: 'booking_management', name: 'Basic Booking Management', description: 'Manage customer bookings', category: 'core', enabled: true },
      { id: 'customer_messaging', name: 'Customer Messaging', description: 'Communicate with potential clients', category: 'communication', enabled: true },
      { id: 'basic_analytics', name: 'Basic Analytics', description: 'View basic performance metrics', category: 'analytics', enabled: true },
    ],
    limits: {
      max_services: 5,
      max_service_images: 3,
      max_portfolio_items: 10,
      max_monthly_bookings: 20,
      max_concurrent_bookings: 5,
      booking_advance_days: 90,
      video_call_duration: 0,
      featured_listing_days: 0,
      max_social_media_integrations: 1,
      custom_branding: false,
      seo_tools: false,
      analytics_history_days: 30,
      export_data: false,
      advanced_reports: false,
      multi_location: false,
      team_members: 1,
      custom_contracts: false,
      payment_processing: true,
      api_calls_per_month: 1000,
      webhook_endpoints: 1,
      third_party_integrations: 2
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Great for growing wedding businesses',
    price: 275,
    billing_cycle: 'monthly',
    tier: 'premium',
    popular: true,
    features: [
      { id: 'enhanced_profile', name: 'Enhanced Profile', description: 'Rich media profile with custom branding', category: 'core', enabled: true },
      { id: 'unlimited_services', name: 'Unlimited Services', description: 'List unlimited services and packages', category: 'core', enabled: true },
      { id: 'advanced_booking', name: 'Advanced Booking System', description: 'Calendar integration, deposits, contracts', category: 'core', enabled: true },
      { id: 'video_messaging', name: 'Video Messaging', description: 'Video calls with clients', category: 'communication', enabled: true },
      { id: 'featured_listings', name: 'Featured Listings', description: 'Boost visibility with featured placement', category: 'marketing', enabled: true },
      { id: 'social_integrations', name: 'Social Media Integration', description: 'Connect Instagram, Facebook, and more', category: 'marketing', enabled: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Detailed insights and reports', category: 'analytics', enabled: true },
      { id: 'seo_tools', name: 'SEO Tools', description: 'Optimize your listing for search engines', category: 'marketing', enabled: true },
    ],
    limits: {
      max_services: -1, // unlimited
      max_service_images: 10,
      max_portfolio_items: 50,
      max_monthly_bookings: 100,
      max_concurrent_bookings: 20,
      booking_advance_days: 365,
      video_call_duration: 60,
      featured_listing_days: 7,
      max_social_media_integrations: 5,
      custom_branding: true,
      seo_tools: true,
      analytics_history_days: 90,
      export_data: true,
      advanced_reports: true,
      multi_location: false,
      team_members: 3,
      custom_contracts: true,
      payment_processing: true,
      api_calls_per_month: 5000,
      webhook_endpoints: 3,
      third_party_integrations: 10
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For established wedding professionals',
    price: 825,
    billing_cycle: 'monthly',
    tier: 'pro',
    features: [
      { id: 'white_label', name: 'White Label Solution', description: 'Custom branding and domain', category: 'advanced', enabled: true },
      { id: 'team_management', name: 'Team Management', description: 'Add team members and manage permissions', category: 'core', enabled: true },
      { id: 'multi_location', name: 'Multi-Location Support', description: 'Manage multiple business locations', category: 'core', enabled: true },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 priority customer support', category: 'core', enabled: true },
      { id: 'custom_integrations', name: 'Custom Integrations', description: 'API access and custom integrations', category: 'advanced', enabled: true },
      { id: 'advanced_automation', name: 'Advanced Automation', description: 'Automated workflows and triggers', category: 'advanced', enabled: true },
      { id: 'competitor_insights', name: 'Competitor Insights', description: 'Market analysis and competitor tracking', category: 'analytics', enabled: true },
    ],
    limits: {
      max_services: -1,
      max_service_images: 25,
      max_portfolio_items: 200,
      max_monthly_bookings: 500,
      max_concurrent_bookings: 50,
      booking_advance_days: 730,
      video_call_duration: 180,
      featured_listing_days: 30,
      max_social_media_integrations: 15,
      custom_branding: true,
      seo_tools: true,
      analytics_history_days: 365,
      export_data: true,
      advanced_reports: true,
      multi_location: true,
      team_members: 10,
      custom_contracts: true,
      payment_processing: true,
      api_calls_per_month: 25000,
      webhook_endpoints: 10,
      third_party_integrations: 25
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large wedding businesses and agencies',
    price: 1595,
    billing_cycle: 'monthly',
    tier: 'enterprise',
    features: [
      { id: 'dedicated_support', name: 'Dedicated Account Manager', description: 'Personal account manager and support', category: 'core', enabled: true },
      { id: 'custom_development', name: 'Custom Development', description: 'Custom features and integrations', category: 'advanced', enabled: true },
      { id: 'advanced_security', name: 'Advanced Security', description: 'SSO, advanced permissions, audit logs', category: 'advanced', enabled: true },
      { id: 'white_label_platform', name: 'White Label Platform', description: 'Fully branded platform for your clients', category: 'advanced', enabled: true },
      { id: 'unlimited_everything', name: 'Unlimited Everything', description: 'No limits on any features', category: 'core', enabled: true },
    ],
    limits: {
      max_services: -1,
      max_service_images: -1,
      max_portfolio_items: -1,
      max_monthly_bookings: -1,
      max_concurrent_bookings: -1,
      booking_advance_days: -1,
      video_call_duration: -1,
      featured_listing_days: -1,
      max_social_media_integrations: -1,
      custom_branding: true,
      seo_tools: true,
      analytics_history_days: -1,
      export_data: true,
      advanced_reports: true,
      multi_location: true,
      team_members: -1,
      custom_contracts: true,
      payment_processing: true,
      api_calls_per_month: -1,
      webhook_endpoints: -1,
      third_party_integrations: -1
    }
  }
];

// Access control helper functions
export class SubscriptionAccess {
  static canCreateService(subscription: VendorSubscription): boolean {
    if (subscription.plan.limits.max_services === -1) return true;
    return subscription.usage.services_count < subscription.plan.limits.max_services;
  }

  static canUploadImages(subscription: VendorSubscription, currentImages: number): boolean {
    if (subscription.plan.limits.max_service_images === -1) return true;
    return currentImages < subscription.plan.limits.max_service_images;
  }

  static canAcceptBooking(subscription: VendorSubscription): boolean {
    if (subscription.plan.limits.max_monthly_bookings === -1) return true;
    return subscription.usage.monthly_bookings_count < subscription.plan.limits.max_monthly_bookings;
  }



  static canUseFeature(subscription: VendorSubscription, featureId: string): boolean {
    // Enterprise plan has access to all features
    if (subscription.plan.id === 'enterprise') {
      return true;
    }
    
    // Pro plan has access to most features
    if (subscription.plan.id === 'pro') {
      // Pro has access to basic and premium features, plus some advanced ones
      const proFeatures = ['basic_features', 'premium_features', 'advanced_analytics', 'direct_messaging', 'vendor_portfolio'];
      if (proFeatures.includes(featureId)) return true;
    }
    
    // Premium plan has access to basic and premium features
    if (subscription.plan.id === 'premium') {
      const premiumFeatures = ['basic_features', 'premium_features', 'advanced_search', 'priority_support'];
      if (premiumFeatures.includes(featureId)) return true;
    }
    
    // Basic plan access
    if (subscription.plan.id === 'basic') {
      const basicFeatures = ['basic_features'];
      if (basicFeatures.includes(featureId)) return true;
    }
    
    // Check if feature is explicitly defined in the plan
    const hasExplicitFeature = subscription.plan.features.some(f => f.id === featureId && f.enabled);
    
    console.log(`🔍 [SubscriptionAccess] Feature check: ${featureId}, Plan: ${subscription.plan.id}, Has explicit: ${hasExplicitFeature}`);
    
    return hasExplicitFeature;
  }

  static getFeatureLimitMessage(subscription: VendorSubscription, feature: string): string {
    const limits = subscription.plan.limits;
    const usage = subscription.usage;

    switch (feature) {
      case 'services':
        if (limits.max_services === -1) return '';
        return `${usage.services_count}/${limits.max_services} services used`;
      
      case 'bookings':
        if (limits.max_monthly_bookings === -1) return '';
        return `${usage.monthly_bookings_count}/${limits.max_monthly_bookings} monthly bookings`;
      

      
      default:
        return '';
    }
  }

  static isNearLimit(subscription: VendorSubscription, feature: string, threshold = 0.8): boolean {
    const limits = subscription.plan.limits;
    const usage = subscription.usage;

    switch (feature) {
      case 'services':
        if (limits.max_services === -1) return false;
        return usage.services_count / limits.max_services >= threshold;
      
      case 'bookings':
        if (limits.max_monthly_bookings === -1) return false;
        return usage.monthly_bookings_count / limits.max_monthly_bookings >= threshold;
      

      
      default:
        return false;
    }
  }
}
