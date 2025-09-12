import React from 'react';
import { Crown, Star, Lock, AlertTriangle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface SubscriptionGateProps {
  children: React.ReactNode;
  feature: string;
  requiredTier?: 'basic' | 'premium' | 'pro' | 'enterprise';
  showUpgrade?: boolean;
  fallback?: React.ReactNode;
  featureId?: string; // For backward compatibility
  className?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  feature,
  requiredTier = 'premium',
  showUpgrade = true,
  fallback,
  featureId, // Backward compatibility
  className = ''
}) => {
  const { hasAccess, showUpgradePrompt } = useSubscription();

  // Use featureId if provided for backward compatibility, otherwise use feature
  const featureToCheck = featureId || feature;
  const hasFeatureAccess = hasAccess(featureToCheck);

  const handleUpgradeClick = () => {
    showUpgradePrompt(`Upgrade to ${requiredTier} to access this feature`, requiredTier);
  };

  if (hasFeatureAccess) {
    return <div className={className}>{children}</div>;
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <div className={className}>
      <div 
        onClick={handleUpgradeClick}
        className="relative cursor-pointer group"
      >
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-pink-200/50 shadow-2xl p-8 max-w-md mx-auto text-center">
            <Crown className="h-16 w-16 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Premium Feature</h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">Upgrade to {requiredTier} to unlock this feature and enhance your business capabilities</p>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105 w-full">
              Upgrade Now
            </button>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
};

interface UsageLimitProps {
  current: number;
  limit: number;
  label: string;
  description?: string;
  unlimited?: boolean;
  className?: string;
}

export const UsageLimit: React.FC<UsageLimitProps> = ({
  current,
  limit,
  label,
  description,
  unlimited = false,
  className = ''
}) => {
  const percentage = unlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <span className="text-sm text-gray-600">
          {unlimited ? 'Unlimited' : `${current}/${limit}`}
        </span>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      
      {!unlimited && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit
                  ? 'bg-red-500'
                  : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {(isNearLimit || isAtLimit) && (
            <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 text-sm ${
              isAtLimit ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <AlertTriangle size={14} />
              {isAtLimit ? 'Limit reached' : 'Approaching limit'}
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface FeatureAccessCardProps {
  title: string;
  icon: React.ReactNode;
  available: boolean;
  description: string;
  requiredTier?: string;
  className?: string;
}

export const FeatureAccessCard: React.FC<FeatureAccessCardProps> = ({
  title,
  icon,
  available,
  description,
  requiredTier,
  className = ''
}) => (
  <div className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {icon}
        </div>
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      
      {available ? (
        <div className="flex items-center gap-1 text-green-600">
          <Star size={16} />
          <span className="text-sm font-medium">Available</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-gray-400">
          <Lock size={16} />
          <span className="text-sm font-medium">Locked</span>
        </div>
      )}
    </div>
    
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    
    {!available && requiredTier && (
      <p className="text-xs text-rose-600 font-medium">
        Requires {requiredTier} subscription
      </p>
    )}
  </div>
);
