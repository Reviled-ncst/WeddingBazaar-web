import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/contexts/HybridAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // 🔒 CRITICAL FIX: Delay navigation after authentication to prevent modal destruction
  const [canNavigate, setCanNavigate] = React.useState(false);
  
  // 🔥 PERFORMANCE FIX: Memoize children to prevent unnecessary re-renders
  // Children should only re-render when auth state actually requires a navigation change
  const memoizedChildren = React.useMemo(() => children, [children]);
  
  React.useEffect(() => {
    if (isAuthenticated && !requireAuth) {
      // Don't navigate immediately - give modal time to handle errors/success
      setCanNavigate(false);
      
      const timer = setTimeout(() => {
        setCanNavigate(true);
      }, 1500); // 1.5 second delay
      
      return () => clearTimeout(timer);
    } else {
      setCanNavigate(true);
    }
  }, [isAuthenticated, requireAuth]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If route is public but user is authenticated, redirect to their landing page
  // BUT: Only navigate after delay period to protect login modal
  if (!requireAuth && isAuthenticated && canNavigate) {
    const userRedirect = redirectTo || getUserLandingPage(user?.role, user);
    return <Navigate to={userRedirect} replace />;
  }

  // 🔥 Return memoized children to prevent unnecessary re-renders
  return <>{memoizedChildren}</>;
};

// Helper function to get the appropriate landing page based on user role
const getUserLandingPage = (role?: string, user?: any): string => {
  // ROLE MAPPING FIX: Handle backend role inconsistencies
  let normalizedRole = role;
  
  // Enhanced vendor detection - ONLY use SOLID vendor indicators
  const hasBusinessName = !!user?.businessName;
  const hasVendorId = !!user?.vendorId;
  const hasVendorIdPattern = user?.id && user.id.startsWith('2-2025-');
  
  const isVendorByProperties = hasBusinessName || hasVendorId || hasVendorIdPattern;
  
  // If user has vendor-like properties, treat as vendor regardless of role
  if (isVendorByProperties) {
    normalizedRole = 'vendor';
  }
  
  // Handle potential backend role variations
  if (role === 'individual' && !user?.businessName) {
    normalizedRole = 'couple'; // individual users are couples in our system
  }
  
  switch (normalizedRole) {
    case 'couple':
    case 'individual': // Handle backend inconsistency
      return '/individual';
    case 'vendor':
      return '/vendor';
    case 'coordinator':
      return '/coordinator';
    case 'admin':
      return '/admin';
    default:
      return '/individual';
  }
};
