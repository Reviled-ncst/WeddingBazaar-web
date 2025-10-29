import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Calendar,
  FileCheck,
  Shield,
  Settings,
  BarChart3,
  MessageSquare,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Vendors',
    href: '/admin/vendors',
    icon: Store,
  },
  {
    label: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    label: 'Document Verification',
    href: '/admin/documents',
    icon: FileCheck,
    badge: 5,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Finances',
    href: '/admin/finances',
    icon: DollarSign,
  },
  {
    label: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    label: 'Security',
    href: '/admin/security',
    icon: Shield,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 bg-white border-r border-slate-200 transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="p-4 flex flex-col h-full overflow-hidden" aria-label="Admin navigation">
        {/* Main Navigation Items */}
        <div className="space-y-1 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  active
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  collapsed && 'justify-center'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('flex-shrink-0', collapsed ? 'h-6 w-6' : 'h-5 w-5')} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout Button - Bottom of Sidebar */}
        <div className="pt-4 mt-4 border-t border-slate-200">
          <button
            onClick={handleLogoutClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 w-full',
              'text-red-600 hover:bg-red-50 hover:text-red-700',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
              collapsed && 'justify-center'
            )}
            aria-label="Sign out"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className={cn('flex-shrink-0', collapsed ? 'h-6 w-6' : 'h-5 w-5')} />
            {!collapsed && <span className="flex-1 text-left">Sign Out</span>}
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal - Rendered as Portal */}
      {showLogoutConfirm &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            onClick={handleCancelLogout}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Confirm Logout</h3>
                  <p className="text-sm text-slate-500">Admin Panel</p>
                </div>
              </div>

              {/* Message */}
              <p className="text-slate-600 mb-6">
                Are you sure you want to sign out from the admin panel? You'll need to log in again to access admin features.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
};
