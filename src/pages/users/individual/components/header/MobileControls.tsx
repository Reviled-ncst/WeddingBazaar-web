import React from 'react';
import { Menu, X } from 'lucide-react';
import { NotificationButton } from './NotificationButton';

interface MobileControlsProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  notificationCount?: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ 
  isMobileMenuOpen, 
  onToggleMobileMenu,
  notificationCount = 0
}) => {
  return (
    <div className="flex items-center space-x-3 md:hidden">
      {/* Mobile notifications with enhanced effects */}
      <NotificationButton 
        notificationCount={notificationCount}
        className="p-3 h-auto w-auto rounded-2xl hover:scale-110 hover:rotate-6"
      />

      {/* Mobile menu toggle with enhanced effects */}
      <button
        className="p-3 text-gray-600 hover:text-white bg-gradient-to-br from-gray-50/60 via-white/80 to-gray-50/60 hover:bg-gradient-to-br hover:from-rose-500 hover:via-pink-500 hover:to-purple-500 rounded-2xl transition-all duration-500 group hover:shadow-xl hover:shadow-rose-500/30 hover:scale-110 hover:rotate-6 border border-gray-200/40 backdrop-blur-xl transform-gpu"
        onClick={onToggleMobileMenu}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90 relative z-10" />
        ) : (
          <Menu className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 relative z-10" />
        )}
        {/* Glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out rounded-2xl"></div>
      </button>
    </div>
  );
};
