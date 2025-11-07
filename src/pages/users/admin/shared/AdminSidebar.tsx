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
  AlertTriangle,
  Database,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'success';
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'Main dashboard & analytics',
      },
      {
        label: 'System Status',
        href: '/admin/system-status',
        icon: Activity,
        description: 'System health monitoring',
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        label: 'Users',
        href: '/admin/users',
        icon: Users,
        description: 'Manage all users',
      },
      {
        label: 'Vendors',
        href: '/admin/vendors',
        icon: Store,
        description: 'Vendor management',
      },
      {
        label: 'Documents',
        href: '/admin/documents',
        icon: FileCheck,
        description: 'Verify vendor documents',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Bookings',
        href: '/admin/bookings',
        icon: Calendar,
        description: 'All booking management',
      },
      {
        label: 'Reports',
        href: '/admin/reports',
        icon: AlertTriangle,
        description: 'Issue reports & disputes',
      },
      {
        label: 'Messages',
        href: '/admin/messages',
        icon: MessageSquare,
        description: 'Platform messaging',
      },
    ],
  },
  {
    title: 'Analytics & Finance',
    items: [
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Platform analytics',
      },
      {
        label: 'Finances',
        href: '/admin/finances',
        icon: DollarSign,
        description: 'Financial overview',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        label: 'Security',
        href: '/admin/security',
        icon: Shield,
        description: 'Security & audit logs',
      },
      {
        label: 'Database',
        href: '/admin/database',
        icon: Database,
        description: 'Database management',
      },
      {
        label: 'Content',
        href: '/admin/content',
        icon: FileText,
        description: 'Content moderation',
      },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'System configuration',
      },
    ],
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

  const getBadgeVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 z-50 shadow-2xl',
          collapsed ? 'w-20' : 'w-72'
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                <p className="text-slate-400 text-xs">Wedding Bazaar</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-lg',
              collapsed && 'absolute -right-4 top-4'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden" aria-label="Admin navigation">
          {/* Main Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
            {navigationSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {/* Section Title */}
                {!collapsed && (
                  <h2 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h2>
                )}

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 relative overflow-hidden',
                          'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                          active
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white shadow-lg border border-pink-500/30'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent hover:border-slate-700',
                          collapsed && 'justify-center'
                        )}
                        aria-current={active ? 'page' : undefined}
                        title={collapsed ? item.label : item.description}
                      >
                        {/* Active Indicator */}
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-r-full" />
                        )}

                        {/* Icon with gradient on hover */}
                        <div className={cn(
                          'relative flex-shrink-0',
                          active && 'text-pink-400'
                        )}>
                          <Icon className={cn(
                            'transition-transform duration-200',
                            collapsed ? 'h-6 w-6' : 'h-5 w-5',
                            active && 'scale-110'
                          )} />
                          {active && (
                            <div className="absolute inset-0 blur-lg opacity-50 bg-pink-500/50" />
                          )}
                        </div>

                        {!collapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <span className="block truncate">{item.label}</span>
                              {item.description && (
                                <span className="block text-xs text-slate-400 truncate mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className={cn(
                                'flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full shadow-lg animate-pulse',
                                getBadgeVariantClasses(item.badgeVariant)
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}

                        {/* Badge indicator for collapsed state */}
                        {collapsed && item.badge !== undefined && item.badge > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
                            {item.badge}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Section */}
          {!collapsed && (
            <div className="px-3 py-3 border-t border-slate-700/50 bg-slate-900/50">
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-pink-400" />
                  <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Access frequently used admin tools
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/admin/emergency"
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs text-red-300 hover:text-red-200 transition-colors text-center"
                  >
                    Emergency
                  </Link>
                  <Link
                    to="/admin/content"
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs text-blue-300 hover:text-blue-200 transition-colors text-center"
                  >
                    Content
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
            <button
              onClick={handleLogoutClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 w-full group',
                'text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-transparent hover:border-red-500/30',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                collapsed && 'justify-center'
              )}
              aria-label="Sign out"
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut className={cn(
                'flex-shrink-0 transition-transform group-hover:scale-110',
                collapsed ? 'h-6 w-6' : 'h-5 w-5'
              )} />
              {!collapsed && <span className="flex-1 text-left">Sign Out</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn"
            onClick={handleCancelLogout}
          >
            <div
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-slate-700 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <LogOut className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Confirm Logout</h3>
                  <p className="text-sm text-slate-400">Admin Panel Access</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                <p className="text-slate-300">
                  Are you sure you want to sign out from the admin panel? You'll need to log in again to access admin features.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all border border-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
