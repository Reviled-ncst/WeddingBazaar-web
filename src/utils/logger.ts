/**
 * Simple logger utility for production builds
 */

export const silent = {
  info: (...args: any[]) => {
    // Silent in production
    if (process.env.NODE_ENV === 'development') {
      
    }
  },
  warn: (...args: any[]) => {
    // Silent in production
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  log: (...args: any[]) => {
    // Silent in production
    if (process.env.NODE_ENV === 'development') {
      
    }
  }
};

export default silent;
