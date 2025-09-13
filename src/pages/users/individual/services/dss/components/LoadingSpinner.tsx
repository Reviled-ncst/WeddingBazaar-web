import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Analyzing services with AI...",
  subMessage = "Finding your perfect matches"
}) => (
  <div className="flex items-center justify-center py-12 sm:py-16">
    <div className="text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm sm:text-base">{message}</p>
      {subMessage && <p className="text-gray-500 text-xs sm:text-sm mt-1">{subMessage}</p>}
    </div>
  </div>
);
