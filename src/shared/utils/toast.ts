// Simple custom toast notification system
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
}

const createToast = (message: string, type: ToastType, options?: ToastOptions) => {
  const duration = options?.duration || 4000;
  
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  const styles = {
    success: {
      bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: '✅',
      shadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
    },
    error: {
      bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      icon: '❌',
      shadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
    },
    warning: {
      bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: '⚠️',
      shadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
    },
    info: {
      bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      icon: 'ℹ️',
      shadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
    }
  };

  const style = styles[type];
  
  toast.style.cssText = `
    background: ${style.bg};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    box-shadow: ${style.shadow};
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    min-width: 300px;
    max-width: 400px;
  `;

  toast.innerHTML = `
    <span style="font-size: 20px;">${style.icon}</span>
    <span style="flex: 1;">${message}</span>
  `;

  // Add animation keyframes if not already added
  if (!document.getElementById('toast-animations')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'toast-animations';
    styleSheet.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    createToast(message, 'success', options);
  },

  error: (message: string, options?: ToastOptions) => {
    createToast(message, 'error', options);
  },

  warning: (message: string, options?: ToastOptions) => {
    createToast(message, 'warning', options);
  },

  info: (message: string, options?: ToastOptions) => {
    createToast(message, 'info', options);
  },
};
