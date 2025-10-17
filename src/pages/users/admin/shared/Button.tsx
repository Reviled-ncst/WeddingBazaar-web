import React from 'react';
import { cn } from '../../../../utils/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning'
  | 'ghost'
  | 'outline';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-sm',
  secondary: 'bg-slate-600 text-white hover:bg-slate-700 border-slate-600 shadow-sm',
  success: 'bg-green-600 text-white hover:bg-green-700 border-green-600 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-sm',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600 shadow-sm',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border-transparent',
  outline: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        icon && <span className="inline-flex items-center">{icon}</span>
      )}
      {children}
    </button>
  );
};
