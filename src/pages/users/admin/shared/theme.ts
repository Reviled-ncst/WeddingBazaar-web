// Admin Theme Configuration
export const adminTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      light: '#10b981',
      DEFAULT: '#059669',
      dark: '#047857',
    },
    danger: {
      light: '#ef4444',
      DEFAULT: '#dc2626',
      dark: '#b91c1c',
    },
    warning: {
      light: '#f59e0b',
      DEFAULT: '#d97706',
      dark: '#b45309',
    },
    info: {
      light: '#3b82f6',
      DEFAULT: '#2563eb',
      dark: '#1d4ed8',
    },
  },
  
  sidebar: {
    width: {
      expanded: '280px',
      collapsed: '80px',
    },
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    itemHeight: '48px',
  },
  
  header: {
    height: '64px',
    background: 'white',
    borderColor: '#e2e8f0',
  },
  
  layout: {
    maxWidth: '1920px',
    contentPadding: '24px',
  },
  
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    hoverShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
};

// Status colors for various admin contexts
export const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  active: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  suspended: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  failed: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

// Chart color schemes
export const chartColors = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  multi: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
};
