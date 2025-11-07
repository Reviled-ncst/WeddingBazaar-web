import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// ✅ EAGER LOAD: Critical pages (homepage only)
import { Homepage } from '../pages/homepage/Homepage';

// 🚀 LAZY LOAD: All other pages (code splitting)
// Landing Pages
const IndividualLanding = lazy(() => import('../pages/users/individual/landing').then(m => ({ default: m.IndividualLanding })));
const VendorLanding = lazy(() => import('../pages/users/vendor/landing').then(m => ({ default: m.VendorLanding })));
const AdminLanding = lazy(() => import('../pages/users/admin/landing').then(m => ({ default: m.AdminLanding })));

// Shared Pages
const ServicePreview = lazy(() => import('../pages/shared/service-preview').then(m => ({ default: m.ServicePreview })));
const ServiceHighlightDemo = lazy(() => import('../pages/shared/service-demo').then(m => ({ default: m.ServiceHighlightDemo })));

// Admin Pages  
const AdminDashboard = lazy(() => import('../pages/users/admin/dashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('../pages/users/admin/users').then(m => ({ default: m.UserManagement })));
const AdminBookings = lazy(() => import('../pages/users/admin/bookings').then(m => ({ default: m.AdminBookings })));
const AdminReports = lazy(() => import('../pages/users/admin/reports').then(m => ({ default: m.AdminReports })));
const AdminAnalytics = lazy(() => import('../pages/users/admin/analytics').then(m => ({ default: m.AdminAnalytics })));
const AdminDatabase = lazy(() => import('../pages/users/admin/database').then(m => ({ default: m.AdminDatabase })));
const AdminFinances = lazy(() => import('../pages/users/admin/finances').then(m => ({ default: m.AdminFinances })));
const AdminSecurity = lazy(() => import('../pages/users/admin/security').then(m => ({ default: m.AdminSecurity })));
const AdminContentModeration = lazy(() => import('../pages/users/admin/content').then(m => ({ default: m.AdminContentModeration })));
const AdminSettings = lazy(() => import('../pages/users/admin/settings').then(m => ({ default: m.AdminSettings })));
const AdminSystemStatus = lazy(() => import('../pages/users/admin/system-status').then(m => ({ default: m.AdminSystemStatus })));
const AdminEmergency = lazy(() => import('../pages/users/admin/emergency').then(m => ({ default: m.AdminEmergency })));
const VendorManagement = lazy(() => import('../pages/users/admin/vendors').then(m => ({ default: m.VendorManagement })));
const DocumentVerification = lazy(() => import('../pages/users/admin/documents').then(m => ({ default: m.DocumentVerification })));
const AdminMessages = lazy(() => import('../pages/users/admin/messages').then(m => ({ default: m.AdminMessages })));

// Individual Pages
const Services = lazy(() => import('../pages/users/individual/services').then(m => ({ default: m.Services })));
const IndividualDashboard = lazy(() => import('../pages/users/individual/dashboard').then(m => ({ default: m.IndividualDashboard })));
const BudgetManagement = lazy(() => import('../pages/users/individual/budget').then(m => ({ default: m.BudgetManagement })));
const GuestManagement = lazy(() => import('../pages/users/individual/guests').then(m => ({ default: m.GuestManagement })));
const IndividualBookings = lazy(() => import('../pages/users/individual/bookings').then(m => ({ default: m.IndividualBookings })));
const TransactionHistory = lazy(() => import('../pages/users/individual/transaction-history').then(m => ({ default: m.TransactionHistory })));
const ProfileSettings = lazy(() => import('../pages/users/individual/profile').then(m => ({ default: m.ProfileSettings })));
const PremiumFeatures = lazy(() => import('../pages/users/individual/premium').then(m => ({ default: m.PremiumFeatures })));
const AccountSettings = lazy(() => import('../pages/users/individual/settings').then(m => ({ default: m.AccountSettings })));
const WeddingRegistry = lazy(() => import('../pages/users/individual/registry').then(m => ({ default: m.WeddingRegistry })));
const ReviewsRatings = lazy(() => import('../pages/users/individual/reviews').then(m => ({ default: m.ReviewsRatings })));
const HelpSupport = lazy(() => import('../pages/users/individual/help').then(m => ({ default: m.HelpSupport })));
const IndividualMessages = lazy(() => import('../pages/users/individual/messages/IndividualMessages').then(m => ({ default: m.IndividualMessages })));
const WeddingTimeline = lazy(() => import('../pages/users/individual/timeline/WeddingTimeline').then(m => ({ default: m.WeddingTimeline })));
const ForYouPage = lazy(() => import('../pages/users/individual/foryou/ForYouPage').then(m => ({ default: m.ForYouPage })));

// Vendor Pages
const VendorDashboard = lazy(() => import('../pages/users/vendor/dashboard').then(m => ({ default: m.VendorDashboard })));
const VendorDashboardEnhanced = lazy(() => import('../pages/users/vendor/dashboard/VendorDashboardEnhanced').then(m => ({ default: m.VendorDashboardEnhanced })));
const VendorBookingsSecure = lazy(() => import('../pages/users/vendor/bookings/VendorBookingsSecure').then(m => ({ default: m.VendorBookingsSecure })));
const VendorProfile = lazy(() => import('../pages/users/vendor/profile').then(m => ({ default: m.VendorProfile })));
const VendorServices = lazy(() => import('../pages/users/vendor/services').then(m => ({ default: m.VendorServices })));
const VendorAnalytics = lazy(() => import('../pages/users/vendor/analytics').then(m => ({ default: m.VendorAnalytics })));
const VendorAvailability = lazy(() => import('../pages/users/vendor/availability').then(m => ({ default: m.VendorAvailability })));
const VendorMessages = lazy(() => import('../pages/users/vendor/messages').then(m => ({ default: m.VendorMessages })));
const VendorMarketInsights = lazy(() => import('../pages/users/vendor/market-insights').then(m => ({ default: m.VendorMarketInsights })));
const VendorFeaturedListings = lazy(() => import('../pages/users/vendor/featured').then(m => ({ default: m.VendorFeaturedListings })));
const VendorSEO = lazy(() => import('../pages/users/vendor/seo').then(m => ({ default: m.VendorSEO })));
const VendorTeamManagement = lazy(() => import('../pages/users/vendor/team').then(m => ({ default: m.VendorTeamManagement })));
const VendorReviews = lazy(() => import('../pages/users/vendor/reviews').then(m => ({ default: m.VendorReviews })));
const VendorAccountSettings = lazy(() => import('../pages/users/vendor/settings').then(m => ({ default: m.VendorAccountSettings })));
const VendorSecurity = lazy(() => import('../pages/users/vendor/security').then(m => ({ default: m.VendorSecurity })));
const VendorContact = lazy(() => import('../pages/users/vendor/contact').then(m => ({ default: m.VendorContact })));
const VendorHelp = lazy(() => import('../pages/users/vendor/help').then(m => ({ default: m.VendorHelp })));
const VendorBilling = lazy(() => import('../pages/users/vendor/billing').then(m => ({ default: m.VendorBilling })));
const VendorPromotions = lazy(() => import('../pages/users/vendor/promotions').then(m => ({ default: m.VendorPromotions })));
const VendorSubscriptionPage = lazy(() => import('../pages/users/vendor/subscription').then(m => ({ default: m.VendorSubscriptionPage })));
const VendorFinances = lazy(() => import('../pages/users/vendor/finances/VendorFinances').then(m => ({ default: m.VendorFinances })));

// Coordinator Pages
const CoordinatorDashboard = lazy(() => import('../pages/users/coordinator/dashboard').then(m => ({ default: m.CoordinatorDashboard })));
const CoordinatorWeddings = lazy(() => import('../pages/users/coordinator/weddings').then(m => ({ default: m.CoordinatorWeddings })));
const CoordinatorVendors = lazy(() => import('../pages/users/coordinator/vendors').then(m => ({ default: m.CoordinatorVendors })));
const CoordinatorClients = lazy(() => import('../pages/users/coordinator/clients').then(m => ({ default: m.CoordinatorClients })));
const CoordinatorAnalytics = lazy(() => import('../pages/users/coordinator/analytics').then(m => ({ default: m.CoordinatorAnalytics })));
const CoordinatorCalendar = lazy(() => import('../pages/users/coordinator/calendar/CoordinatorCalendar'));
const CoordinatorTeam = lazy(() => import('../pages/users/coordinator/team').then(m => ({ default: m.CoordinatorTeam })));
const CoordinatorWhiteLabel = lazy(() => import('../pages/users/coordinator/whitelabel').then(m => ({ default: m.CoordinatorWhiteLabel })));
const CoordinatorIntegrations = lazy(() => import('../pages/users/coordinator/integrations').then(m => ({ default: m.CoordinatorIntegrations })));
const CoordinatorRegistrationForm = lazy(() => import('../pages/users/coordinator/registration').then(m => ({ default: m.CoordinatorRegistrationForm })));

// Auth Context
import { AuthProvider } from '../shared/contexts/HybridAuthContext';
import { SubscriptionProvider } from '../shared/contexts/SubscriptionContext';

// Universal Messaging System
import { UnifiedMessagingProvider } from '../shared/contexts/UnifiedMessagingContext';
import { MessagingModalConnector } from '../shared/components/messaging';

// Notification System
import { NotificationProvider } from '../shared/components/notifications/NotificationProvider';
// import { GlobalFloatingChat } from '../shared/components/messaging/GlobalFloatingChat'; // Temporarily disabled



export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <NotificationProvider>
          <UnifiedMessagingProvider>
            <MessagingModalConnector>
              <Router>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Homepage - NO AUTH CHECK to prevent re-renders */}
              {/* Auto-redirect removed to fix Services refetch bug on login failure */}
              <Route path="/" element={
                <>
                  <Header />
                  <main className="flex-1">
                    <Homepage />
                  </main>
                  <Footer />
                </>
              } />

              {/* Public Service Preview - accessible to everyone */}
              <Route path="/service/:serviceId" element={
                <ProtectedRoute requireAuth={false}>
                  <ServicePreview />
                </ProtectedRoute>
              } />

              {/* Service Highlight Demo - accessible to everyone */}
              <Route path="/demo/services" element={
                <ProtectedRoute requireAuth={false}>
                  <ServiceHighlightDemo />
                </ProtectedRoute>
              } />
              <Route path="/demo/services/:serviceId" element={
                <ProtectedRoute requireAuth={false}>
                  <ServiceHighlightDemo />
                </ProtectedRoute>
              } />

              {/* Coordinator Registration - Public route */}
              <Route path="/coordinator/register" element={
                <CoordinatorRegistrationForm />
              } />
            
            {/* User Type Landing Pages - require authentication and role-based access */}
            <Route path="/individual" element={
              <RoleProtectedRoute allowedRoles={['couple', 'individual']} requireAuth={true}>
                <IndividualLanding />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorLanding />
              </RoleProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAuth={true}>
                <AdminLanding />
              </ProtectedRoute>
            } />
            
            {/* Individual/Couple specific pages */}
            <Route path="/individual/dashboard" element={
              <RoleProtectedRoute allowedRoles={['couple', 'individual']} requireAuth={true}>
                <IndividualDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/individual/services" element={
              <RoleProtectedRoute allowedRoles={['couple', 'individual']} requireAuth={true}>
                <Services />
              </RoleProtectedRoute>
            } />
            <Route path="/individual/timeline" element={
              <ProtectedRoute requireAuth={true}>
                <WeddingTimeline />
              </ProtectedRoute>
            } />
            <Route path="/individual/foryou" element={
              <ProtectedRoute requireAuth={true}>
                <ForYouPage />
              </ProtectedRoute>
            } />
            <Route path="/individual/budget" element={
              <ProtectedRoute requireAuth={true}>
                <BudgetManagement />
              </ProtectedRoute>
            } />
            <Route path="/individual/guests" element={
              <ProtectedRoute requireAuth={true}>
                <GuestManagement />
              </ProtectedRoute>
            } />
            <Route path="/individual/bookings" element={
              <ProtectedRoute requireAuth={true}>
                <IndividualBookings />
              </ProtectedRoute>
            } />
            <Route path="/individual/transactions" element={
              <ProtectedRoute requireAuth={true}>
                <TransactionHistory />
              </ProtectedRoute>
            } />
            <Route path="/individual/profile" element={
              <ProtectedRoute requireAuth={true}>
                <ProfileSettings />
              </ProtectedRoute>
            } />
            <Route path="/individual/premium" element={
              <ProtectedRoute requireAuth={true}>
                <PremiumFeatures />
              </ProtectedRoute>
            } />
            <Route path="/individual/settings" element={
              <ProtectedRoute requireAuth={true}>
                <AccountSettings />
              </ProtectedRoute>
            } />
            <Route path="/individual/registry" element={
              <ProtectedRoute requireAuth={true}>
                <WeddingRegistry />
              </ProtectedRoute>
            } />
            <Route path="/individual/reviews" element={
              <ProtectedRoute requireAuth={true}>
                <ReviewsRatings />
              </ProtectedRoute>
            } />
            <Route path="/individual/help" element={
              <ProtectedRoute requireAuth={true}>
                <HelpSupport />
              </ProtectedRoute>
            } />
            <Route path="/individual/messages" element={
              <ProtectedRoute requireAuth={true}>
                <IndividualMessages />
              </ProtectedRoute>
            } />
            
            {/* Vendor specific pages */}
            <Route path="/vendor/dashboard" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorDashboardEnhanced />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/dashboard-classic" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/profile" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorProfile />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/services" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorServices />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/bookings" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorBookingsSecure />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/availability" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorAvailability />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/analytics" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorAnalytics />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/finances" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorFinances />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/messages" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorMessages />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/market-insights" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorMarketInsights />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/featured" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorFeaturedListings />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/seo" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorSEO />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/team" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorTeamManagement />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/reviews" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorReviews />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/settings" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorAccountSettings />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/security" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorSecurity />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/contact" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorContact />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/help" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorHelp />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/billing" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorBilling />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/promotions" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorPromotions />
              </RoleProtectedRoute>
            } />
            <Route path="/vendor/subscription" element={
              <RoleProtectedRoute allowedRoles={['vendor']} requireAuth={true}>
                <VendorSubscriptionPage />
              </RoleProtectedRoute>
            } />
            
            {/* Coordinator specific pages */}
            <Route path="/coordinator" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/dashboard" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/weddings" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorWeddings />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/vendors" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorVendors />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/clients" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorClients />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/analytics" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorAnalytics />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/calendar" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorCalendar />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/team" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorTeam />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/whitelabel" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorWhiteLabel />
              </RoleProtectedRoute>
            } />
            <Route path="/coordinator/integrations" element={
              <RoleProtectedRoute allowedRoles={['coordinator']} requireAuth={true}>
                <CoordinatorIntegrations />
              </RoleProtectedRoute>
            } />
            
            {/* Admin specific pages */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute requireAuth={true}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/bookings" element={
              <ProtectedRoute requireAuth={true}>
                <AdminBookings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reports" element={
              <ProtectedRoute requireAuth={true}>
                <AdminReports />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/analytics" element={
              <ProtectedRoute requireAuth={true}>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/database" element={
              <ProtectedRoute requireAuth={true}>
                <AdminDatabase />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/finances" element={
              <ProtectedRoute requireAuth={true}>
                <AdminFinances />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/security" element={
              <ProtectedRoute requireAuth={true}>
                <AdminSecurity />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/content" element={
              <ProtectedRoute requireAuth={true}>
                <AdminContentModeration />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAuth={true}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/system-status" element={
              <ProtectedRoute requireAuth={true}>
                <AdminSystemStatus />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/emergency" element={
              <ProtectedRoute requireAuth={true}>
                <AdminEmergency />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/vendors" element={
              <ProtectedRoute requireAuth={true}>
                <VendorManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/documents" element={
              <ProtectedRoute requireAuth={true}>
                <DocumentVerification />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/messages" element={
              <ProtectedRoute requireAuth={true}>
                <AdminMessages />
              </ProtectedRoute>
            } />
            
            {/* Redirect old verifications route to documents */}
            <Route path="/admin/verifications" element={<Navigate to="/admin/documents" replace />} />
            
            {/* Legacy redirect routes */}
            <Route path="/couples" element={<Navigate to="/individual" replace />} />
            <Route path="/couples/services" element={<Navigate to="/individual/services" replace />} />
            <Route path="/vendors" element={<Navigate to="/vendor" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </div>
      </Router>
            </MessagingModalConnector>
          </UnifiedMessagingProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};
