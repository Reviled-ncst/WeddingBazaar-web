import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Bell, 
  User, 
  Menu, 
  X,
  Store,
  BarChart3,
  Calendar,
  MessageSquare,
  Wallet,
  Briefcase,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { VendorProfileDropdownModal } from '../../../pages/users/vendor/components/header/modals/VendorProfileDropdownModal';

export const VendorHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/vendor/dashboard', icon: BarChart3 },
    { name: 'Bookings', href: '/vendor/bookings', icon: Calendar },
    { name: 'Profile', href: '/vendor/profile', icon: Store },
    { name: 'Services', href: '/vendor/services', icon: Briefcase },
    { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
    { name: 'Finances', href: '/vendor/finances', icon: Wallet },
    { name: 'Messages', href: '/vendor/messages', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-200/50 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-50/80 via-pink-50/60 to-white/80"></div>
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/vendor/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-rose-700 to-gray-900 bg-clip-text text-transparent">
                Wedding Bazaar
              </span>
              <span className="text-sm text-rose-600 font-semibold -mt-1">Vendor Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "bg-white/80 text-rose-700 shadow-md border border-rose-200/50" 
                      : "text-gray-600 hover:text-rose-700 hover:bg-white/60 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 transition-all duration-300",
                    isActive ? "bg-gradient-to-r from-rose-50/50 to-pink-50/50" : "bg-transparent group-hover:bg-gradient-to-r group-hover:from-rose-50/30 group-hover:to-pink-50/30"
                  )}></div>
                  <IconComponent className={cn(
                    "h-4 w-4 relative z-10 transition-all duration-300",
                    isActive ? "text-rose-600" : "text-gray-500 group-hover:text-rose-600"
                  )} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notifications */}
            <button 
              className="relative group p-3 text-gray-600 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-sm border border-transparent hover:border-rose-200/50"
              title="Notifications"
              aria-label="View notifications"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Bell className="h-5 w-5 relative z-10" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-sm">
                <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="group flex items-center space-x-3 p-2 pr-4 text-gray-600 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-md border border-transparent hover:border-rose-200/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="relative z-10 text-left">
                  <div className="text-sm font-semibold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Vendor'}</div>
                  <div className="text-xs text-gray-600">{user?.email || 'vendor@example.com'}</div>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              <VendorProfileDropdownModal
                isOpen={isProfileDropdownOpen}
                onClose={() => setIsProfileDropdownOpen(false)}
                onSubscriptionOpen={() => {
                  setIsProfileDropdownOpen(false);
                  navigate('/vendor/subscription?upgrade=true');
                }}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden group p-3 text-gray-600 hover:text-rose-600 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-sm border border-transparent hover:border-rose-200/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isMobileMenuOpen ? 
              <X className="h-6 w-6 relative z-10" /> : 
              <Menu className="h-6 w-6 relative z-10" />
            }
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-rose-200/50 bg-white/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-white/50"></div>
            <div className="relative z-10 py-4">
              <nav className="space-y-2 px-4">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-white/80 text-rose-700 shadow-md border border-rose-200/50" 
                          : "text-gray-600 hover:text-rose-700 hover:bg-white/60"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={cn(
                        "absolute inset-0 transition-all duration-300",
                        isActive ? "bg-gradient-to-r from-rose-50/50 to-pink-50/50" : "bg-transparent group-hover:bg-gradient-to-r group-hover:from-rose-50/30 group-hover:to-pink-50/30"
                      )}></div>
                      <IconComponent className={cn(
                        "h-5 w-5 relative z-10 transition-colors",
                        isActive ? "text-rose-600" : "text-gray-500 group-hover:text-rose-600"
                      )} />
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              <div className="border-t border-rose-200/30 mt-4 pt-4 px-4">
                <Link
                  to="/vendor/profile"
                  className="group flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:text-rose-700 hover:bg-white/60 rounded-xl transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Settings className="h-5 w-5 text-gray-500 group-hover:text-rose-600 transition-colors relative z-10" />
                  <span className="relative z-10">Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="group flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-600 hover:text-rose-700 hover:bg-white/60 rounded-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/30 to-pink-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <LogOut className="h-5 w-5 text-gray-500 group-hover:text-rose-600 transition-colors relative z-10" />
                  <span className="relative z-10">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
