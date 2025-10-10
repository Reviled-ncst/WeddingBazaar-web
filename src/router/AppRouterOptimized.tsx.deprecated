import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { ProtectedRoute } from './ProtectedRoute';

// Core components (loaded immediately)
import { Homepage } from '../pages/homepage/Homepage';

// Loading components
const ModuleLoadingSpinner: React.FC<{ module: string }> = ({ module }) => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading {module} Module</h3>
      <p className="text-gray-600">Preparing your experience...</p>
    </div>
  </div>
);

// Lazy-loaded landing pages
const IndividualLanding = lazy(() => import('../pages/users/individual/landing').then(module => ({ 
  default: module.IndividualLanding 
})));
const VendorLanding = lazy(() => import('../pages/users/vendor/landing').then(module => ({ 
  default: module.VendorLanding 
})));
const AdminLanding = lazy(() => import('../pages/users/admin/landing').then(module => ({ 
  default: module.AdminLanding 
})));

// Lazy-loaded Individual pages
const IndividualDashboard = lazy(() => import('../pages/users/individual/dashboard').then(module => ({ 
  default: module.IndividualDashboard 
})));
const Services = lazy(() => import('../pages/users/individual/services').then(module => ({ 
  default: module.Services 
})));
const IndividualBookings = lazy(() => import('../pages/users/individual/bookings').then(module => ({ 
  default: module.IndividualBookings 
})));
const BudgetManagement = lazy(() => import('../pages/users/individual/budget').then(module => ({ 
  default: module.BudgetManagement 
})));
const GuestManagement = lazy(() => import('../pages/users/individual/guests').then(module => ({ 
  default: module.GuestManagement 
})));
const ProfileSettings = lazy(() => import('../pages/users/individual/profile').then(module => ({ 
  default: module.ProfileSettings 
})));
const PremiumFeatures = lazy(() => import('../pages/users/individual/premium').then(module => ({ 
  default: module.PremiumFeatures 
})));
const AccountSettings = lazy(() => import('../pages/users/individual/settings').then(module => ({ 
  default: module.AccountSettings 
})));
const WeddingRegistry = lazy(() => import('../pages/users/individual/registry').then(module => ({ 
  default: module.WeddingRegistry 
})));
const ReviewsRatings = lazy(() => import('../pages/users/individual/reviews').then(module => ({ 
  default: module.ReviewsRatings 
})));
const HelpSupport = lazy(() => import('../pages/users/individual/help').then(module => ({ 
  default: module.HelpSupport 
})));
const IndividualMessages = lazy(() => import('../pages/users/individual/messages/IndividualMessages').then(module => ({ 
  default: module.IndividualMessages 
})));
const WeddingTimeline = lazy(() => import('../pages/users/individual/timeline/WeddingTimeline').then(module => ({ 
  default: module.WeddingTimeline 
})));
const ForYouPage = lazy(() => import('../pages/users/individual/foryou/ForYouPage').then(module => ({ 
  default: module.ForYouPage 
})));

// Lazy-loaded Vendor pages
const VendorDashboard = lazy(() => import('../pages/users/vendor/dashboard').then(module => ({ 
  default: module.VendorDashboard 
})));
const VendorDashboardEnhanced = lazy(() => import('../pages/users/vendor/dashboard/VendorDashboardEnhanced').then(module => ({ 
  default: module.VendorDashboardEnhanced 
})));
const VendorBookings = lazy(() => import('../pages/users/vendor/bookings').then(module => ({ 
  default: module.VendorBookings 
})));
const VendorProfile = lazy(() => import('../pages/users/vendor/profile').then(module => ({ 
  default: module.VendorProfile 
})));
const VendorServices = lazy(() => import('../pages/users/vendor/services').then(module => ({ 
  default: module.VendorServices 
})));
const VendorAnalytics = lazy(() => import('../pages/users/vendor/analytics').then(module => ({ 
  default: module.VendorAnalytics 
})));
const VendorFinances = lazy(() => import('../pages/users/vendor/finances').then(module => ({ 
  default: module.VendorFinances 
})));
const VendorMessages = lazy(() => import('../pages/users/vendor/messages').then(module => ({ 
  default: module.VendorMessages 
})));

// Lazy-loaded Admin pages  
const AdminDashboard = lazy(() => import('../pages/users/admin/dashboard').then(module => ({ 
  default: module.AdminDashboard 
})));
const UserManagement = lazy(() => import('../pages/users/admin/users').then(module => ({ 
  default: module.UserManagement 
})));
const AdminBookings = lazy(() => import('../pages/users/admin/bookings').then(module => ({ 
  default: module.AdminBookings 
})));
const AdminAnalytics = lazy(() => import('../pages/users/admin/analytics').then(module => ({ 
  default: module.AdminAnalytics 
})));

// Context providers
import { AuthProvider } from '../shared/contexts/AuthContext';
import { SubscriptionProvider } from '../shared/contexts/SubscriptionContext';
import { UniversalMessagingProvider } from '../shared/contexts/UniversalMessagingContext';
import { NotificationProvider } from '../shared/components/notifications/NotificationProvider';

// Universal components
import { UniversalFloatingChat } from '../shared/components/messaging/UniversalFloatingChat';
import { UniversalFloatingChatButton } from '../shared/components/messaging/UniversalFloatingChatButton';
import { RoleDebugger } from '../components/RoleDebugger';

export const AppRouterOptimized: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <UniversalMessagingProvider>
            <Router>
              <div className="min-h-screen flex flex-col">
                <RoleDebugger />
                <Routes>
                  {/* Public Homepage - loaded immediately */}
                  <Route path="/" element={
                    <ProtectedRoute requireAuth={false}>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Homepage />
                        </main>
                        <Footer />
                      </>
                    </ProtectedRoute>
                  } />
                
                  {/* User Type Landing Pages - lazy loaded */}
                  <Route path="/individual" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Individual" />}>
                        <IndividualLanding />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Vendor" />}>
                        <VendorLanding />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Admin" />}>
                        <AdminLanding />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Individual/Couple specific pages - lazy loaded */}
                  <Route path="/individual/dashboard" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Dashboard" />}>
                        <IndividualDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/services" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Services" />}>
                        <Services />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/timeline" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Timeline" />}>
                        <WeddingTimeline />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/foryou" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="For You" />}>
                        <ForYouPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/budget" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Budget" />}>
                        <BudgetManagement />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/guests" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Guests" />}>
                        <GuestManagement />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/bookings" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Bookings" />}>
                        <IndividualBookings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/profile" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Profile" />}>
                        <ProfileSettings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/premium" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Premium" />}>
                        <PremiumFeatures />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/settings" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Settings" />}>
                        <AccountSettings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/registry" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Registry" />}>
                        <WeddingRegistry />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/reviews" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Reviews" />}>
                        <ReviewsRatings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/help" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Help" />}>
                        <HelpSupport />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/individual/messages" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Messages" />}>
                        <IndividualMessages />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Vendor specific pages - lazy loaded */}
                  <Route path="/vendor/dashboard" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Vendor Dashboard" />}>
                        <VendorDashboardEnhanced />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/dashboard-classic" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Vendor Dashboard" />}>
                        <VendorDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/bookings" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Vendor Bookings" />}>
                        <VendorBookings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/profile" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Vendor Profile" />}>
                        <VendorProfile />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/services" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Vendor Services" />}>
                        <VendorServices />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/analytics" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Analytics" />}>
                        <VendorAnalytics />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/finances" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Finances" />}>
                        <VendorFinances />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/vendor/messages" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Messages" />}>
                        <VendorMessages />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin specific pages - lazy loaded */}
                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Admin Dashboard" />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/users" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="User Management" />}>
                        <UserManagement />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/bookings" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Admin Bookings" />}>
                        <AdminBookings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute requireAuth={true}>
                      <Suspense fallback={<ModuleLoadingSpinner module="Admin Analytics" />}>
                        <AdminAnalytics />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={
                    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                        <button 
                          onClick={() => window.location.href = '/'}
                          className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
                  } />
                </Routes>
                
                {/* Universal floating chat */}
                <UniversalFloatingChatButton />
                <UniversalFloatingChat />
              </div>
            </Router>
          </UniversalMessagingProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};
