import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Crown, 
  Heart, 
  Search, 
  DollarSign, 
  Users, 
  Calendar, 
  MessageCircle, 
  Lightbulb, 
  LogOut,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../../../shared/contexts/HybridAuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMessengerOpen: () => void;
  onInstructionOpen: (type: 'full' | 'quick') => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  onClose, 
  onMessengerOpen,
  onInstructionOpen
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/individual/dashboard', 
      icon: Heart,
      description: 'Your wedding overview'
    },
    { 
      name: 'Find Services', 
      href: '/individual/services', 
      icon: Search,
      description: 'Browse wedding vendors'
    },
    { 
      name: 'Timeline', 
      href: '/individual/timeline', 
      icon: Clock,
      description: 'Wedding planning timeline'
    },
    { 
      name: 'For You', 
      href: '/individual/foryou', 
      icon: Sparkles,
      description: 'Personalized content'
    },
    { 
      name: 'Budget Manager', 
      href: '/individual/budget', 
      icon: DollarSign,
      description: 'Track expenses'
    },
    { 
      name: 'Guest List', 
      href: '/individual/guests', 
      icon: Users,
      description: 'Manage RSVPs'
    },
    { 
      name: 'My Bookings', 
      href: '/individual/bookings', 
      icon: Calendar,
      description: 'View appointments'
    },
  ];

  const profileMenuItems = [
    {
      icon: User,
      label: 'Profile Settings',
      href: '/individual/profile'
    },
    {
      icon: Crown,
      label: 'Premium Features',
      href: '/individual/premium',
      isPremium: true
    },
    {
      icon: Lightbulb,
      label: 'Wedding Guide',
      onClick: () => {
        onInstructionOpen('full');
        onClose();
      },
      isAction: true
    }
  ];

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl">
      {/* User Profile Section */}
      <div className="px-4 py-3 border-b border-gray-100 mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="flex items-center space-x-1">
              <Crown className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">Premium Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1 px-2 mb-4">
        {navigation.map((item) => {
          const isActive = isActivePage(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 shadow-sm' 
                  : 'text-gray-700 hover:bg-rose-50/50 hover:text-rose-600 active:bg-rose-100'
                }
              `}
              onClick={() => {
                // Ensure the link navigation happens
                console.log('🔗 Mobile nav clicked:', item.href);
                // Close menu after short delay to ensure navigation completes
                setTimeout(() => onClose(), 100);
              }}
            >
              <div className={`p-2 rounded-lg ${isActive ? 'bg-rose-100' : 'bg-gray-100 group-hover:bg-rose-100'} transition-all duration-200`}>
                <item.icon className={`h-4 w-4 ${isActive ? 'text-rose-600' : 'text-gray-600 group-hover:text-rose-600'}`} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              )}
            </Link>
          );
        })}
        
        {/* Messages - Navigate to Messages Page */}
        <Link
          to="/individual/messages"
          onClick={() => {
            console.log('🔗 Mobile nav clicked: /individual/messages');
            setTimeout(() => onClose(), 100);
          }}
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-rose-50/50 hover:text-rose-600 rounded-xl transition-all duration-200 w-full group active:bg-rose-100"
        >
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-rose-100 transition-all duration-200">
            <div className="relative">
              <MessageCircle className="h-4 w-4 text-gray-600 group-hover:text-rose-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Messages</div>
            <div className="text-sm text-gray-500">Chat with vendors</div>
          </div>
        </Link>
      </div>

      {/* Quick Profile Actions */}
      <div className="space-y-1 px-2 mb-4 border-t border-gray-100 pt-4">
        {profileMenuItems.map((item, index) => {
          if (item.isAction) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-rose-50/50 hover:text-rose-600 rounded-lg transition-all duration-200 group w-full text-left"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 group-hover:bg-rose-100 transition-all duration-200">
                  <item.icon className="h-3 w-3 text-blue-600 group-hover:text-rose-600" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-1.5 py-0.5 rounded-full font-medium">
                  NEW
                </span>
              </button>
            );
          }
          
          return (
            <Link
              key={index}
              to={item.href!}
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-rose-50/50 hover:text-rose-600 rounded-lg transition-all duration-200 group active:bg-rose-100"
              onClick={() => {
                console.log('🔗 Mobile nav clicked:', item.href);
                setTimeout(() => onClose(), 100);
              }}
            >
              <div className={`p-1.5 rounded-lg ${item.isPremium ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gray-100 group-hover:bg-rose-100'} transition-all duration-200`}>
                <item.icon className={`h-3 w-3 ${item.isPremium ? 'text-yellow-600' : 'text-gray-600 group-hover:text-rose-600'}`} />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
              {item.isPremium && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-1.5 py-0.5 rounded-full font-medium">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-2 border-t border-gray-100 pt-3">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 w-full group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
            <LogOut className="h-3 w-3 text-gray-600 group-hover:text-red-600" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
