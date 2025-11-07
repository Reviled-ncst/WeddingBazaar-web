import React from 'react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { PageHeader } from './PageHeader';
import { cn } from '../../../../utils/cn';

interface Breadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  showHeader?: boolean;
  showSidebar?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
  showHeader = true,
  showSidebar = true,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // If sidebar is shown, don't show header (sidebar handles navigation)
  const shouldShowHeader = showHeader && !showSidebar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Admin Header - Only show if no sidebar */}
      {shouldShowHeader && <AdminHeader />}

      {/* Admin Sidebar */}
      {showSidebar && (
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          'transition-all duration-300',
          shouldShowHeader && 'pt-16',
          showSidebar && (sidebarCollapsed ? 'ml-20' : 'ml-72')
        )}
      >
        {/* Page Header */}
        {(title || breadcrumbs) && (
          <PageHeader
            title={title || ''}
            subtitle={subtitle}
            breadcrumbs={breadcrumbs}
            actions={actions}
          />
        )}

        {/* Page Content */}
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
