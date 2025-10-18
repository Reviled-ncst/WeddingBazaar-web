import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

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

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
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
      <nav className="p-4 space-y-1 overflow-y-auto h-full" aria-label="Admin navigation">
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
      </nav>
    </aside>
  );
};
