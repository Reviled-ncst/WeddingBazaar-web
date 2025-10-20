import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedMessaging } from '../../../../shared/contexts/UnifiedMessagingContext';
import { InstructionDialog, weddingPlanningInstructions, quickStartInstructions } from '../../../../shared/components/InstructionDialog';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { centralizedBookingAPI as bookingApiService } from '../../../../services/api/CentralizedBookingAPI';
import {
  Logo,
  Navigation,
  NotificationButton,
  ProfileButton,
  MobileControls,
  MobileMenu,
  ProfileDropdownModal
} from '../components/header';

export const CoupleHeader: React.FC = () => {
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [instructionType, setInstructionType] = useState<'full' | 'quick'>('full');
  const [notificationCount, setNotificationCount] = useState(0);

  // Hooks
  const { user } = useAuth();
  const { setFloatingChatOpen } = useUnifiedMessaging();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch pending bookings count for notification badge
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user?.id) {
        console.log('⚠️ [CoupleHeader] No authenticated user, notification count = 0');
        setNotificationCount(0);
        return;
      }

      try {
        console.log('🔔 [CoupleHeader] Fetching notification count for user:', user.id);
        
        // Fetch all bookings to count pending actions
        const response = await bookingApiService.getCoupleBookings(user.id, {
          page: 1,
          limit: 100,
          sortBy: 'created_at',
          sortOrder: 'desc'
        });

        if (response.bookings && response.bookings.length > 0) {
          // Count bookings that require action from the couple
          // Pending statuses: quote_sent (needs review), contract_sent (needs signing), etc.
          const pendingCount = response.bookings.filter((booking: any) => 
            booking.status === 'quote_sent' || 
            booking.status === 'contract_sent' ||
            booking.status === 'downpayment_requested' ||
            booking.status === 'final_payment_due'
          ).length;

          console.log('✅ [CoupleHeader] Notification count calculated:', {
            total: response.bookings.length,
            pending: pendingCount
          });

          setNotificationCount(pendingCount);
        } else {
          console.log('📭 [CoupleHeader] No bookings found');
          setNotificationCount(0);
        }
      } catch (error) {
        console.error('❌ [CoupleHeader] Error fetching notification count:', error);
        setNotificationCount(0);
      }
    };

    // Fetch immediately and then every 2 minutes
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [user?.id]);

  // Event handlers
  const handleInstructionOpen = (type: 'full' | 'quick') => {
    setInstructionType(type);
    setIsInstructionDialogOpen(true);
  };

  const handleProfileDropdownToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleProfileDropdownClose = () => {
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex-shrink-0 min-w-0">
              <Logo />
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex flex-1 justify-center">
              <Navigation onMessengerOpen={() => setFloatingChatOpen(true)} />
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
              <NotificationButton notificationCount={notificationCount} />
              
              <div className="relative" ref={dropdownRef}>
                <ProfileButton 
                  isDropdownOpen={isProfileDropdownOpen}
                  onToggleDropdown={handleProfileDropdownToggle}
                />
                
                <ProfileDropdownModal 
                  isOpen={isProfileDropdownOpen}
                  onClose={handleProfileDropdownClose}
                  onInstructionOpen={handleInstructionOpen}
                />
              </div>
            </div>

            {/* Mobile Controls */}
            <MobileControls 
              isMobileMenuOpen={isMobileMenuOpen}
              onToggleMobileMenu={handleMobileMenuToggle}
              notificationCount={notificationCount}
            />
          </div>

          {/* Mobile Menu */}
          <MobileMenu 
            isOpen={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            onMessengerOpen={() => setFloatingChatOpen(true)}
            onInstructionOpen={handleInstructionOpen}
          />
        </div>
      </header>

      {/* Instruction Dialog */}
      <InstructionDialog
        isOpen={isInstructionDialogOpen}
        onClose={() => setIsInstructionDialogOpen(false)}
        steps={instructionType === 'full' ? weddingPlanningInstructions : quickStartInstructions}
        title={instructionType === 'full' ? 'Wedding Planning Guide' : 'Quick Start Guide'}
        subtitle={instructionType === 'full' ? 'Everything you need to plan your perfect wedding' : 'Get started with Wedding Bazaar in just 3 steps'}
      />
    </>
  );
};
