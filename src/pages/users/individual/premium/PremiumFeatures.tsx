import React from 'react';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Camera,
  Calendar,
  MessageCircle,
  Users,
  ArrowLeft
} from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { useSubscription } from '../../../../shared/contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

export const PremiumFeatures: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();

  // If user is a vendor, redirect them to vendor subscription page
  if (user?.role === 'vendor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CoupleHeader />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/50">
              <Crown className="h-16 w-16 text-blue-500 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Vendor Dashboard</h1>
              <p className="text-lg text-gray-600 mb-8">
                You're logged in as a vendor. Access your subscription management through the vendor dashboard.
              </p>
              <Link 
                to="/vendor/subscription" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go to Vendor Subscription
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Get current plan information
  const currentPlan = subscription?.plan || { name: 'Free', id: 'free', tier: 'free' };
  const isEnterprise = currentPlan.tier === 'enterprise';
  const isPremium = ['premium', 'pro', 'enterprise'].includes(currentPlan.tier || 'free');
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <CoupleHeader />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscription information...</p>
          </div>
        </main>
      </div>
    );
  }
  const features = [
    {
      icon: Crown,
      title: 'Priority Vendor Access',
      description: 'Get first access to top-rated vendors and exclusive discounts',
      included: isPremium
    },
    {
      icon: Camera,
      title: 'Unlimited Photo Storage',
      description: 'Store unlimited wedding photos and videos in the cloud',
      included: isPremium
    },
    {
      icon: Calendar,
      title: 'Advanced Planning Tools',
      description: 'Access premium timeline templates and planning workflows',
      included: isPremium
    },
    {
      icon: MessageCircle,
      title: 'Priority Support',
      description: '24/7 premium support from wedding planning experts',
      included: isPremium
    },
    {
      icon: Users,
      title: 'Vendor Matching AI',
      description: 'AI-powered vendor recommendations based on your preferences',
      included: isEnterprise,
      comingSoon: !isEnterprise
    },
    {
      icon: Shield,
      title: 'Wedding Insurance',
      description: 'Complimentary wedding insurance up to ₱500,000 coverage',
      included: isEnterprise,
      comingSoon: !isEnterprise
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <CoupleHeader />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-500 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Premium Features
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock exclusive features and premium support to make your wedding planning journey extraordinary
          </p>
        </div>

        {/* Current Plan */}
        <div className={`${
          isEnterprise 
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200' 
            : isPremium 
              ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200'
              : 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200'
        } rounded-3xl p-8 mb-12 border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${
                isEnterprise 
                  ? 'bg-gradient-to-br from-purple-400 to-blue-400' 
                  : isPremium 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                    : 'bg-gradient-to-br from-gray-400 to-slate-400'
              }`}>
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {currentPlan.name} Plan
                  {isEnterprise && <span className="ml-3 text-purple-600 text-lg">✨ Enterprise</span>}
                  {subscription?.status === 'active' && (
                    <span className="ml-3 text-green-600 text-lg">● Active</span>
                  )}
                </h3>
                <p className="text-gray-600">
                  {isEnterprise 
                    ? 'You have full access to all premium features'
                    : isPremium 
                      ? `You're currently on our ${currentPlan.name.toLowerCase()} plan`
                      : 'Upgrade to unlock premium features'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {isEnterprise ? 'Unlimited' : isPremium ? '₱1,499' : 'Free'}
              </div>
              {!isEnterprise && (
                <div className="text-gray-600">
                  {isPremium ? 'per month' : 'plan'}
                </div>
              )}
            </div>
          </div>
          
          {isEnterprise && (
            <div className="mt-6 p-4 bg-white/60 rounded-xl">
              <div className="flex items-center space-x-2 text-purple-700">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Enterprise Benefits Active</span>
              </div>
              <p className="text-purple-600 mt-2">
                Unlimited access to all features, priority support, and advanced tools.
              </p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 relative overflow-hidden ${
              feature.comingSoon ? 'opacity-75' : ''
            }`}>
              {feature.comingSoon && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  Coming Soon
                </div>
              )}
              
              <div className={`p-4 rounded-2xl mb-4 w-fit ${
                feature.included 
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                <feature.icon className={`h-8 w-8 ${
                  feature.included ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              
              <div className="flex items-center space-x-2">
                {feature.included ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-semibold">Included</span>
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-yellow-600 font-semibold">
                      {feature.comingSoon ? 'Coming Soon' : 'Premium Only'}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Stats */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Zap className="h-7 w-7 text-yellow-500 mr-3" />
            Your Premium Usage
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">247</div>
              <div className="text-gray-600">Photos Stored</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full w-1/4"></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">Unlimited</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">12</div>
              <div className="text-gray-600">Vendor Connections</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full w-3/5"></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">20 included</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-gray-600">Priority Support Used</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2 rounded-full w-1/3"></div>
              </div>
              <div className="text-sm text-gray-500 mt-1">10 included</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-semibold">
            Manage Subscription
          </button>
          <button className="px-8 py-4 bg-white text-gray-700 rounded-2xl border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-300 font-semibold">
            Billing History
          </button>
        </div>
      </main>
    </div>
  );
};
