import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../../../utils/cn';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<AlertType, {
  icon: React.ComponentType<{ className?: string }>;
  styles: string;
}> = {
  info: {
    icon: Info,
    styles: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  success: {
    icon: CheckCircle,
    styles: 'bg-green-50 border-green-200 text-green-800',
  },
  warning: {
    icon: AlertCircle,
    styles: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
  error: {
    icon: XCircle,
    styles: 'bg-red-50 border-red-200 text-red-800',
  },
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const { icon: Icon, styles } = alertConfig[type];

  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex items-start gap-3',
        styles,
        className
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="font-semibold mb-1">{title}</h3>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
