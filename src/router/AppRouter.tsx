import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';

// Landing Pages
import { Homepage } from '../pages/homepage/Homepage';
import { IndividualLanding } from '../pages/users/individual/landing';
import { VendorLanding } from '../pages/users/vendor/landing';
import { AdminLanding } from '../pages/users/admin/landing';

// Shared Pages
import { ServicePreview } from '../pages/shared/service-preview';
import { ServiceHighlightDemo } from '../pages/shared/service-demo';

// Admin Pages  
import { AdminDashboard } from '../pages/users/admin/dashboard';
import { UserManagement } from '../pages/users/admin/users';
import { AdminBookings } from '../pages/users/admin/bookings';
import { AdminAnalytics } from '../pages/users/admin/analytics';
import { AdminDatabase } from '../pages/users/admin/database';
import { AdminFinances } from '../pages/users/admin/finances';
import { AdminSecurity } from '../pages/users/admin/security';
import { AdminContentModeration } from '../pages/users/admin/content';
import { AdminSettings } from '../pages/users/admin/settings';
import { AdminSystemStatus } from '../pages/users/admin/system-status';
import { AdminEmergency } from '../pages/users/admin/emergency';
import { VendorManagement } from '../pages/users/admin/vendors';
import { DocumentApproval } from '../pages/users/admin/documents';
import { AdminVerificationReview } from '../pages/users/admin/verifications';

// Individual Pages
import { Services } from '../pages/users/individual/services';
import { IndividualDashboard } from '../pages/users/individual/dashboard';
import { BudgetManagement } from '../pages/users/individual/budget';
import { GuestManagement } from '../pages/users/individual/guests';
import { IndividualBookings } from '../pages/users/individual/bookings';
import { ProfileSettings } from '../pages/users/individual/profile';
import { PremiumFeatures } from '../pages/users/individual/premium';
import { AccountSettings } from '../pages/users/individual/settings';
import { WeddingRegistry } from '../pages/users/individual/registry';
import { ReviewsRatings } from '../pages/users/individual/reviews';
import { HelpSupport } from '../pages/users/individual/help';
import { IndividualMessages } from '../pages/users/individual/messages/IndividualMessages';
import { WeddingTimeline } from '../pages/users/individual/timeline/WeddingTimeline';
import { ForYouPage } from '../pages/users/individual/foryou/ForYouPage';

// Vendor Pages
import { VendorDashboard } from '../pages/users/vendor/dashboard';
import { VendorDashboardEnhanced } from '../pages/users/vendor/dashboard/VendorDashboardEnhanced';
import { VendorBookingsSecure } from '../pages/users/vendor/bookings/VendorBookingsSecure';
import { VendorProfile } from '../pages/users/vendor/profile';
import { VendorServices } from '../pages/users/vendor/services';
import { VendorAnalytics } from '../pages/users/vendor/analytics';
import { VendorAvailability } from '../pages/users/vendor/availability';
import { VendorFinances } from '../pages/users/vendor/finances';
import { VendorMessages } from '../pages/users/vendor/messages';
import { VendorMarketInsights } from '../pages/users/vendor/market-insights';
import { VendorFeaturedListings } from '../pages/users/vendor/featured';
import { VendorSEO } from '../pages/users/vendor/seo';
import { VendorTeamManagement } from '../pages/users/vendor/team';
import { VendorReviews } from '../pages/users/vendor/reviews';
import { VendorAccountSettings } from '../pages/users/vendor/settings';
import { VendorSecurity } from '../pages/users/vendor/security';
import { VendorContact } from '../pages/users/vendor/contact';
import { VendorHelp } from '../pages/users/vendor/help';
import { VendorBilling } from '../pages/users/vendor/billing';
import { VendorPromotions } from '../pages/users/vendor/promotions';
import { VendorSubscriptionPage } from '../pages/users/vendor/subscription';

// Auth Context
import { AuthProvider } from '../shared/contexts/HybridAuthContext';
import { SubscriptionProvider } from '../shared/contexts/SubscriptionContext';

// Universal Messaging System
import { UnifiedMessagingProvider } from '../shared/contexts/UnifiedMessagingContext';
import { GlobalFloatingChatButton } from '../shared/components/messaging/GlobalFloatingChatButton';
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
            <Routes>
              {/* Public Homepage - redirect to user's landing page if authenticated */}
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
                <DocumentApproval />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/verifications" element={
              <ProtectedRoute requireAuth={true}>
                <AdminVerificationReview />
              </ProtectedRoute>
            } />
            
            {/* Legacy redirect routes */}
            <Route path="/couples" element={<Navigate to="/individual" replace />} />
            <Route path="/couples/services" element={<Navigate to="/individual/services" replace />} />
            <Route path="/vendors" element={<Navigate to="/vendor" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Unified Floating Chat Components - Single Source of Truth */}
          <GlobalFloatingChatButton />
        </div>
      </Router>
            </MessagingModalConnector>
          </UnifiedMessagingProvider>
        </NotificationProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};
