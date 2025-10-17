import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-100',
  loading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-lg', iconBg)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded',
              change.trend === 'up' && 'bg-green-100 text-green-700',
              change.trend === 'down' && 'bg-red-100 text-red-700',
              change.trend === 'neutral' && 'bg-slate-100 text-slate-700'
            )}
          >
            {change.trend === 'up' && '↑'}
            {change.trend === 'down' && '↓'}
            {change.trend === 'neutral' && '→'}
            {change.value}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
          <div className="text-sm text-slate-600 font-medium">{title}</div>
        </>
      )}
    </div>
  );
};
