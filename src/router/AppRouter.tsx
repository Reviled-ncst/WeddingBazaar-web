import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { ProtectedRoute } from './ProtectedRoute';

// Landing Pages
import { Homepage } from '../pages/homepage/Homepage';
import { IndividualLanding } from '../pages/users/individual/landing';
import { AdminLanding } from '../pages/users/admin/landing';

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
import { VendorBookings } from '../pages/users/vendor/bookings';
import { VendorProfile } from '../pages/users/vendor/profile';
import { VendorServices } from '../pages/users/vendor/services';
import { VendorAnalytics } from '../pages/users/vendor/analytics';
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
import { AuthProvider } from '../shared/contexts/AuthContext';
import { SubscriptionProvider } from '../shared/contexts/SubscriptionContext';

// Global Messenger
import { GlobalMessengerProvider } from '../shared/contexts/GlobalMessengerContext';
import { GlobalFloatingChat } from '../shared/components/messaging/GlobalFloatingChat';
import { GlobalFloatingChatButton } from '../shared/components/messaging/GlobalFloatingChatButton';

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <GlobalMessengerProvider>
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
            
            {/* User Type Landing Pages - require authentication */}
            <Route path="/individual" element={
              <ProtectedRoute requireAuth={true}>
                <IndividualLanding />
              </ProtectedRoute>
            } />
            <Route path="/vendor" element={
              <ProtectedRoute requireAuth={true}>
                <Navigate to="/vendor/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAuth={true}>
                <AdminLanding />
              </ProtectedRoute>
            } />
            
            {/* Individual/Couple specific pages */}
            <Route path="/individual/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <IndividualDashboard />
              </ProtectedRoute>
            } />
            <Route path="/individual/services" element={
              <ProtectedRoute requireAuth={true}>
                <Services />
              </ProtectedRoute>
            } />
            <Route path="/individual/timeline" element={
              <ProtectedRoute requireAuth={true}>
                <WeddingTimeline weddingDate={new Date('2025-12-31')} userId="current-user" />
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
              <ProtectedRoute requireAuth={true}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/profile" element={
              <ProtectedRoute requireAuth={true}>
                <VendorProfile />
              </ProtectedRoute>
            } />
            <Route path="/vendor/services" element={
              <ProtectedRoute requireAuth={true}>
                <VendorServices />
              </ProtectedRoute>
            } />
            <Route path="/vendor/bookings" element={
              <ProtectedRoute requireAuth={true}>
                <VendorBookings />
              </ProtectedRoute>
            } />
            <Route path="/vendor/analytics" element={
              <ProtectedRoute requireAuth={true}>
                <VendorAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/vendor/finances" element={
              <ProtectedRoute requireAuth={true}>
                <VendorFinances />
              </ProtectedRoute>
            } />
            <Route path="/vendor/messages" element={
              <ProtectedRoute requireAuth={true}>
                <VendorMessages />
              </ProtectedRoute>
            } />
            <Route path="/vendor/market-insights" element={
              <ProtectedRoute requireAuth={true}>
                <VendorMarketInsights />
              </ProtectedRoute>
            } />
            <Route path="/vendor/featured" element={
              <ProtectedRoute requireAuth={true}>
                <VendorFeaturedListings />
              </ProtectedRoute>
            } />
            <Route path="/vendor/seo" element={
              <ProtectedRoute requireAuth={true}>
                <VendorSEO />
              </ProtectedRoute>
            } />
            <Route path="/vendor/team" element={
              <ProtectedRoute requireAuth={true}>
                <VendorTeamManagement />
              </ProtectedRoute>
            } />
            <Route path="/vendor/reviews" element={
              <ProtectedRoute requireAuth={true}>
                <VendorReviews />
              </ProtectedRoute>
            } />
            <Route path="/vendor/settings" element={
              <ProtectedRoute requireAuth={true}>
                <VendorAccountSettings />
              </ProtectedRoute>
            } />
            <Route path="/vendor/security" element={
              <ProtectedRoute requireAuth={true}>
                <VendorSecurity />
              </ProtectedRoute>
            } />
            <Route path="/vendor/contact" element={
              <ProtectedRoute requireAuth={true}>
                <VendorContact />
              </ProtectedRoute>
            } />
            <Route path="/vendor/help" element={
              <ProtectedRoute requireAuth={true}>
                <VendorHelp />
              </ProtectedRoute>
            } />
            <Route path="/vendor/billing" element={
              <ProtectedRoute requireAuth={true}>
                <VendorBilling />
              </ProtectedRoute>
            } />
            <Route path="/vendor/promotions" element={
              <ProtectedRoute requireAuth={true}>
                <VendorPromotions />
              </ProtectedRoute>
            } />
            <Route path="/vendor/subscription" element={
              <ProtectedRoute requireAuth={true}>
                <VendorSubscriptionPage />
              </ProtectedRoute>
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
            
            {/* Legacy redirect routes */}
            <Route path="/couples" element={<Navigate to="/individual" replace />} />
            <Route path="/couples/services" element={<Navigate to="/individual/services" replace />} />
            <Route path="/vendors" element={<Navigate to="/vendor" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Global Floating Chat Components */}
          <GlobalFloatingChatButton />
          <GlobalFloatingChat />
        </div>
      </Router>
    </GlobalMessengerProvider>
    </SubscriptionProvider>
    </AuthProvider>
  );
};
