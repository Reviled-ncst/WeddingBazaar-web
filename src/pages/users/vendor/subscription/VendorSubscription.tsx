import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Crown,
  Check,
  ArrowRight,
  Star,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  Camera,
  Globe,
  Palette,
  TrendingUp,
  Lock,
  AlertTriangle,
  ArrowUp,
  Loader2
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { UpgradePrompt } from '../../../../shared/components/subscription/UpgradePrompt';
import { SUBSCRIPTION_PLANS } from '../../../../shared/types/subscription';
import { useSubscriptionAccess } from '../../../../shared/hooks/useSubscription';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';

export const VendorSubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const vendorId = user?.vendorId || '';
  
  // Use real subscription data from API
  const { subscription, loading, error, refreshSubscription } = useSubscriptionAccess(vendorId);
  
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [searchParams] = useSearchParams();

  // Auto-open upgrade prompt if 'upgrade=true' in URL
  useEffect(() => {
    if (searchParams.get('upgrade') === 'true') {
      setShowUpgradePrompt(true);
    }
  }, [searchParams]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="h-12 w-12 text-rose-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading subscription details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error || !subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-gray-900 font-semibold mb-2">Failed to load subscription</p>
              <p className="text-gray-600 mb-4">{error || 'Unable to fetch subscription data'}</p>
              <button
                onClick={() => refreshSubscription()}
                className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Convert SUBSCRIPTION_PLANS to format expected by UpgradePrompt
  const customPlans = SUBSCRIPTION_PLANS.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    features: plan.features.map(feature => feature.name),
    popular: plan.popular || false,
    current: subscription?.plan.id === plan.id,
    description: plan.description,
    billing_cycle: plan.billing_cycle
  }));

  // Feature usage components
  const FeatureUsageCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    usage: number;
    limit: number;
    description: string;
    unlimited?: boolean;
  }> = ({ title, icon, usage, limit, description, unlimited = false }) => {
    const percentage = unlimited ? 100 : (usage / limit) * 100;
    const isNearLimit = percentage >= 80;
    const isAtLimit = percentage >= 100;

    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <div className={`h-5 w-5 ${
                isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          
          {isAtLimit && (              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-200 text-sm"
                title="Upgrade to increase limits"
              >
                <ArrowUp size={14} />
                Upgrade
              </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Usage</span>
            <span className={`font-semibold ${
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {unlimited ? 'Unlimited' : `${usage.toLocaleString()} / ${limit === -1 ? 'Unlimited' : limit.toLocaleString()}`}
            </span>
          </div>
          
          {!unlimited && limit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                data-width={Math.min(percentage, 100)}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {isNearLimit && !unlimited && (
          <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 text-sm ${
            isAtLimit ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
          }`}>
            <AlertTriangle size={14} />
            {isAtLimit ? 'Limit reached' : 'Approaching limit'}
          </div>
        )}
      </div>
    );
  };

  const FeatureAccessCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    available: boolean;
    description: string;
    requiredTier?: string;
  }> = ({ title, icon, available, description, requiredTier }) => (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            available ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <div className={`h-5 w-5 ${
              available ? 'text-green-600' : 'text-gray-400'
            }`}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        {available ? (
          <div className="flex items-center gap-1 text-green-600">
            <Check size={16} />
            <span className="text-sm font-medium">Available</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-gray-400">
              <Lock size={16} />
              <span className="text-sm">Locked</span>
            </div>
            {requiredTier && (
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="text-xs px-2 py-1 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors"
              >
                {requiredTier}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <VendorHeader />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Subscription & Access</h1>
                <p className="text-gray-600 mt-2">Manage your subscription and see what features you have access to.</p>
              </div>
              
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Crown size={20} />
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Current Plan Overview */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">{subscription.plan.name} Plan</h2>
                  {subscription.plan.popular && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-rose-100 mb-4">{subscription.plan.description}</p>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-3xl font-bold">${subscription.plan.price}</span>
                    <span className="text-rose-200">/{subscription.plan.billing_cycle}</span>
                  </div>
                  <div className="text-sm text-rose-200">
                    <p>Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    <p className={`capitalize ${
                      subscription.status === 'active' ? 'text-green-200' : 'text-yellow-200'
                    }`}>
                      Status: {subscription.status}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm text-rose-100 mb-1">Member since</p>
                  <p className="font-semibold">{new Date(subscription.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Current Usage & Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureUsageCard
                title="Services"
                icon={<Camera />}
                usage={subscription.usage.services_count}
                limit={subscription.plan.limits.max_services}
                description="Active service listings"
                unlimited={subscription.plan.limits.max_services === -1}
              />
              
              <FeatureUsageCard
                title="Monthly Bookings"
                icon={<Calendar />}
                usage={subscription.usage.monthly_bookings_count}
                limit={subscription.plan.limits.max_monthly_bookings}
                description="Bookings this month"
                unlimited={subscription.plan.limits.max_monthly_bookings === -1}
              />
              
              <FeatureUsageCard
                title="Messages"
                icon={<MessageSquare />}
                usage={subscription.usage.monthly_messages_count}
                limit={subscription.plan.limits.max_monthly_messages}
                description="Messages sent this month"
                unlimited={subscription.plan.limits.max_monthly_messages === -1}
              />
              
              <FeatureUsageCard
                title="Portfolio Items"
                icon={<Camera />}
                usage={subscription.usage.portfolio_items_count}
                limit={subscription.plan.limits.max_portfolio_items}
                description="Portfolio gallery items"
                unlimited={subscription.plan.limits.max_portfolio_items === -1}
              />
              
              <FeatureUsageCard
                title="Team Members"
                icon={<Users />}
                usage={1}
                limit={subscription.plan.limits.team_members}
                description="Active team members"
                unlimited={subscription.plan.limits.team_members === -1}
              />
              
              <FeatureUsageCard
                title="API Calls"
                icon={<Globe />}
                usage={subscription.usage.api_calls_count}
                limit={subscription.plan.limits.api_calls_per_month}
                description="API calls this month"
                unlimited={subscription.plan.limits.api_calls_per_month === -1}
              />
            </div>
          </div>

          {/* Feature Access */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Feature Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureAccessCard
                title="Custom Branding"
                icon={<Palette />}
                available={subscription.plan.limits.custom_branding}
                description="Customize your profile colors and branding"
                requiredTier="Premium+"
              />
              
              <FeatureAccessCard
                title="SEO Tools"
                icon={<TrendingUp />}
                available={subscription.plan.limits.seo_tools}
                description="Optimize your listings for search engines"
                requiredTier="Premium+"
              />
              
              <FeatureAccessCard
                title="Advanced Analytics"
                icon={<BarChart3 />}
                available={subscription.plan.limits.advanced_reports}
                description="Detailed insights and custom reports"
                requiredTier="Premium+"
              />
              
              <FeatureAccessCard
                title="Multi-Location Support"
                icon={<Globe />}
                available={subscription.plan.limits.multi_location}
                description="Manage multiple business locations"
                requiredTier="Professional+"
              />
              
              <FeatureAccessCard
                title="Video Messaging"
                icon={<MessageSquare />}
                available={subscription.plan.limits.video_call_duration > 0}
                description="Video calls with clients"
                requiredTier="Premium+"
              />
              
              <FeatureAccessCard
                title="Featured Listings"
                icon={<Star />}
                available={subscription.plan.limits.featured_listing_days > 0}
                description="Boost visibility with featured placement"
                requiredTier="Premium+"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-200"
              >
                <Crown size={20} />
                <span>Upgrade Plan</span>
                <ArrowRight size={16} />
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <BarChart3 size={20} />
                <span>View Analytics</span>
                <ArrowRight size={16} />
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                <Shield size={20} />
                <span>Billing History</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title="Choose Your Vendor Plan"
        message="Select the plan that best fits your wedding business needs"
        requiredTier={subscription.plan.tier}
        customPlans={customPlans}
        currentPlanId={subscription.plan.id}
      />
    </div>
  );
};
