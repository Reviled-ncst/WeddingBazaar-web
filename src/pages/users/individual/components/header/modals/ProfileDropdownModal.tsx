import React from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  User, 
  Crown, 
  Settings, 
  Gift, 
  Star, 
  HelpCircle, 
  Lightbulb, 
  Play, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../../../../../shared/contexts/HybridAuthContext';

interface ProfileDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructionOpen: (type: 'full' | 'quick') => void;
  onPreventClose?: (prevent: boolean) => void;
}

export const ProfileDropdownModal: React.FC<ProfileDropdownModalProps> = ({
  isOpen,
  onClose,
  onInstructionOpen,
  onPreventClose
}) => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const confirmModalRef = React.useRef<HTMLDivElement>(null);

  // Notify parent when logout confirmation is shown/hidden
  React.useEffect(() => {
    if (onPreventClose) {
      onPreventClose(showLogoutConfirm);
    }
  }, [showLogoutConfirm, onPreventClose]);

  // Prevent dropdown from closing when confirmation modal is open
  React.useEffect(() => {
    if (showLogoutConfirm) {
      const handleClickOutside = (event: MouseEvent) => {
        // If clicking inside the confirmation modal, don't close anything
        if (confirmModalRef.current && confirmModalRef.current.contains(event.target as Node)) {
          event.stopPropagation();
        }
      };

      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [showLogoutConfirm]);

  const profileMenuItems = [
    {
      icon: User,
      label: 'Profile Settings',
      href: '/individual/profile',
      description: 'Edit your profile information'
    },
    {
      icon: Crown,
      label: 'Premium Features',
      href: '/individual/premium',
      description: 'Upgrade your experience',
      isPremium: true
    },
    {
      icon: Settings,
      label: 'Account Settings',
      href: '/individual/settings',
      description: 'Privacy & notifications'
    },
    {
      icon: Gift,
      label: 'Wedding Registry',
      href: '/individual/registry',
      description: 'Manage your registry'
    },
    {
      icon: Star,
      label: 'Reviews & Ratings',
      href: '/individual/reviews',
      description: 'Your vendor reviews'
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/individual/help',
      description: 'Get assistance'
    },
    {
      icon: Lightbulb,
      label: 'Wedding Guide',
      onClick: () => {
        onInstructionOpen('full');
        onClose();
      },
      description: 'Complete wedding planning tutorial',
      isAction: true
    },
    {
      icon: Play,
      label: 'Quick Start',
      onClick: () => {
        onInstructionOpen('quick');
        onClose();
      },
      description: 'Get started in 3 steps',
      isAction: true
    }
  ] as Array<{
    icon: React.ComponentType<any>;
    label: string;
    href?: string;
    onClick?: () => void;
    description: string;
    isPremium?: boolean;
    isAction?: boolean;
  }>;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
    onClose();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-300">
      {/* User Info Header - Compact */}
      <div className="px-4 py-3 border-b border-gray-100/50 bg-gradient-to-r from-rose-50/50 to-pink-50/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-400 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-600 truncate mb-1">{user?.email}</div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-2 py-0.5 rounded-full w-fit">
              <Crown className="h-3 w-3 text-yellow-600" />
              <span className="text-xs text-yellow-700 font-bold">Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items - Compact */}
      <div className="py-2 px-1 max-h-96 overflow-y-auto">
        {profileMenuItems.map((item, index) => {
          if (item.isAction) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-xl transition-all duration-300 group w-full text-left mb-1 border border-transparent hover:border-blue-200/50"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">
                  <item.icon className="h-4 w-4 text-blue-600 group-hover:text-blue-700 transition-all duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="font-semibold text-sm truncate">{item.label}</span>
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
                      NEW
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors duration-300 truncate">{item.description}</div>
                </div>
              </button>
            );
          }
          
          return (
            <Link
              key={index}
              to={item.href!}
              className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-700 rounded-xl transition-all duration-300 group mb-1 border border-transparent hover:border-rose-200/50"
              onClick={onClose}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                item.isPremium 
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-rose-100 group-hover:to-pink-100'
              }`}>
                <item.icon className={`h-4 w-4 transition-all duration-300 ${
                  item.isPremium 
                    ? 'text-yellow-600 group-hover:text-yellow-700' 
                    : 'text-gray-600 group-hover:text-rose-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="font-semibold text-sm truncate">{item.label}</span>
                  {item.isPremium && (
                    <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                      PRO
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-rose-600 transition-colors duration-300 truncate">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Logout - Compact */}
      <div className="border-t border-gray-100 pt-1 mt-1">
        <button
          onClick={handleLogoutClick}
          className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full group rounded-xl"
          aria-label="Logout from your account"
        >
          <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
            <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold text-sm">Sign Out</div>
            <div className="text-xs text-gray-500 truncate">Secure logout from account</div>
          </div>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            // Don't close when clicking the backdrop
            e.stopPropagation();
          }}
        >
          <div 
            ref={confirmModalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
