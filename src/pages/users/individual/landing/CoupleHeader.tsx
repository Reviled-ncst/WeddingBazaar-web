import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedMessaging } from '../../../../shared/contexts/UnifiedMessagingContext';
import { InstructionDialog, weddingPlanningInstructions, quickStartInstructions } from '../../../../shared/components/InstructionDialog';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import {
  Logo,
  Navigation,
  NotificationButton,
  NotificationDropdown,
  ProfileButton,
  MobileControls,
  MobileMenu,
  ProfileDropdownModal
} from '../components/header';

export const CoupleHeader: React.FC = () => {
  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isInstructionDialogOpen, setIsInstructionDialogOpen] = useState(false);
  const [instructionType, setInstructionType] = useState<'full' | 'quick'>('full');
  const [notificationCount, setNotificationCount] = useState(0);
  const [preventDropdownClose, setPreventDropdownClose] = useState(false);

  // Hooks
  const { user } = useAuth();
  const { setFloatingChatOpen } = useUnifiedMessaging();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if we're preventing closure (e.g., logout confirmation is open)
      if (preventDropdownClose) {
        return;
      }
      
      // Check if the click is inside a confirmation modal (z-index 9999)
      const target = event.target as HTMLElement;
      const isInsideConfirmModal = target.closest('[class*="z-[9999]"]') || 
                                    target.closest('[style*="z-index: 9999"]');
      
      // Don't close dropdown if clicking inside a confirmation modal
      if (isInsideConfirmModal) {
        return;
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [preventDropdownClose]);

  // Fetch unread notifications count for notification badge
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user?.id) {
        setNotificationCount(0);
        return;
      }

      try {
        // Fetch unread notifications from the notifications API
        const apiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
        const response = await fetch(`${apiUrl}/api/notifications/user/${user.id}?unreadOnly=true`);
        
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.unreadCount || 0);
        } else {
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
              {/* Notification Button with Dropdown */}
              <div className="relative">
                <NotificationButton 
                  notificationCount={notificationCount}
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  isOpen={isNotificationDropdownOpen}
                />
                
                {user?.id && (
                  <NotificationDropdown
                    userId={user.id}
                    isOpen={isNotificationDropdownOpen}
                    onClose={() => setIsNotificationDropdownOpen(false)}
                    onNotificationCountChange={setNotificationCount}
                  />
                )}
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <ProfileButton 
                  isDropdownOpen={isProfileDropdownOpen}
                  onToggleDropdown={handleProfileDropdownToggle}
                />
                
                <ProfileDropdownModal 
                  isOpen={isProfileDropdownOpen}
                  onClose={handleProfileDropdownClose}
                  onInstructionOpen={handleInstructionOpen}
                  onPreventClose={setPreventDropdownClose}
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
