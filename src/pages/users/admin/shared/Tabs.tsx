import React from 'react';
import { cn } from '../../../../utils/cn';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'default' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'default',
}) => {
  return (
    <div className={cn('border-b border-slate-200', className)}>
      <div className="flex gap-2 -mb-px" role="tablist" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && onChange(tab.key)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={isActive ? 'true' : 'false'}
              aria-controls={`tabpanel-${tab.key}`}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                variant === 'default' && [
                  'border-b-2 -mb-px',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
                ],
                variant === 'pills' && [
                  'rounded-lg',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ],
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.icon && (
                <span className="inline-flex items-center">{tab.icon}</span>
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
