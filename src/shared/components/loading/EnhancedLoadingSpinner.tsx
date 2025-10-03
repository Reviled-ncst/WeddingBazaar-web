import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

interface EnhancedLoadingSpinnerProps {
  module?: string;
  message?: string;
  variant?: 'default' | 'wedding' | 'vendor' | 'admin';
}

export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({ 
  module = "Module", 
  message = "Preparing your experience...",
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'wedding':
        return {
          gradient: 'from-rose-50 via-pink-50 to-purple-50',
          iconColor: 'text-rose-500',
          accent: 'border-rose-600',
          bgAccent: 'border-rose-200'
        };
      case 'vendor':
        return {
          gradient: 'from-blue-50 via-indigo-50 to-purple-50',
          iconColor: 'text-blue-500',
          accent: 'border-blue-600',
          bgAccent: 'border-blue-200'
        };
      case 'admin':
        return {
          gradient: 'from-gray-50 via-slate-50 to-zinc-50',
          iconColor: 'text-gray-600',
          accent: 'border-gray-600', 
          bgAccent: 'border-gray-300'
        };
      default:
        return {
          gradient: 'from-rose-50 via-white to-pink-50',
          iconColor: 'text-rose-500',
          accent: 'border-rose-600',
          bgAccent: 'border-rose-200'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} flex items-center justify-center`}>
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated Icons */}
        <div className="relative mb-8">
          {/* Main Spinner */}
          <div className={`w-20 h-20 border-4 ${styles.bgAccent} ${styles.accent} border-t-4 rounded-full animate-spin mx-auto`}></div>
          
          {/* Floating Hearts/Sparkles Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Heart className={`w-6 h-6 ${styles.iconColor} animate-pulse`} fill="currentColor" />
              <Sparkles className={`w-4 h-4 ${styles.iconColor} absolute -top-2 -right-2 animate-bounce`} />
            </div>
          </div>
          
          {/* Secondary Ring */}
          <div className={`absolute inset-2 w-16 h-16 border-2 ${styles.bgAccent} rounded-full animate-pulse`}></div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Loading {module}
          </h3>
          <p className="text-gray-600 text-lg">
            {message}
          </p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className={`w-2 h-2 ${styles.iconColor.replace('text-', 'bg-')} rounded-full animate-bounce`}></div>
            <div className={`w-2 h-2 ${styles.iconColor.replace('text-', 'bg-')} rounded-full animate-bounce delay-150`}></div>
            <div className={`w-2 h-2 ${styles.iconColor.replace('text-', 'bg-')} rounded-full animate-bounce delay-300`}></div>
          </div>
        </div>

        {/* Decorative Elements */}  
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-32 h-32 ${styles.iconColor.replace('text-', 'bg-')} opacity-5 rounded-full animate-pulse`}></div>  
          <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 ${styles.iconColor.replace('text-', 'bg-')} opacity-5 rounded-full animate-pulse delay-1000`}></div>
        </div>
      </div>
    </div>
  );
};

// Specialized loading components for different modules
export const WeddingLoadingSpinner: React.FC<{ module?: string }> = ({ module = "Wedding Module" }) => (
  <EnhancedLoadingSpinner 
    module={module} 
    message="Creating your perfect wedding experience..."
    variant="wedding"
  />
);

export const VendorLoadingSpinner: React.FC<{ module?: string }> = ({ module = "Vendor Module" }) => (
  <EnhancedLoadingSpinner 
    module={module}
    message="Setting up your business dashboard..."
    variant="vendor"
  />
);

export const AdminLoadingSpinner: React.FC<{ module?: string }> = ({ module = "Admin Module" }) => (
  <EnhancedLoadingSpinner 
    module={module}
    message="Loading platform management tools..."
    variant="admin"
  />
);

// Skeleton Loading Component for lists and cards
export const SkeletonLoader: React.FC<{ 
  type?: 'card' | 'list' | 'profile' | 'stats';
  count?: number;
}> = ({ type = 'card', count = 3 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded-lg w-20"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 animate-pulse">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        );
      case 'stats':
        return (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
