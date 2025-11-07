import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface Breadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm', className)}>
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.href || crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="text-slate-400 hover:text-pink-400 transition-colors font-medium"
                    aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-white font-semibold" aria-current="page">
                    {crumb.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-300 text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
