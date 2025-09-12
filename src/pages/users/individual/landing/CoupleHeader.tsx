import React, { useState, useRef, useEffect } from 'react';
import { useMessenger } from '../../../shared/messenger';
import { Messenger } from '../../../shared/messenger';
import { InstructionDialog, weddingPlanningInstructions, quickStartInstructions } from '../../../../shared/components/InstructionDialog';
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
  const [notificationCount] = useState(3);

  // Hooks
  const { isMessengerOpen, openMessenger, closeMessenger } = useMessenger();
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
              <Navigation onMessengerOpen={openMessenger} />
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
            onMessengerOpen={openMessenger}
            onInstructionOpen={handleInstructionOpen}
          />
        </div>
      </header>
      
      {/* Messenger Modal */}
      <Messenger 
        isOpen={isMessengerOpen} 
        onClose={closeMessenger} 
      />

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
