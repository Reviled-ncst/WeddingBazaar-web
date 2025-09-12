import React, { useState, useCallback } from 'react';
import { cn } from '../../../../../utils/cn';

interface VendorImageProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  rounded?: boolean;
}

export const VendorImage: React.FC<VendorImageProps> = ({
  src,
  alt,
  fallbackText,
  className,
  size = 'md',
  rounded = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fallbackError, setFallbackError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
    full: 'w-full h-full'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    full: 'text-2xl'
  };

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  const handleFallbackError = useCallback(() => {
    setFallbackError(true);
  }, []);

  // Generate a more reliable fallback image URL
  const getFallbackImageUrl = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Vendor';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=f43f5e&color=ffffff&size=200&rounded=true`;
  };

  // Clean and validate the source URL
  const getCleanImageUrl = (url?: string | null): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // Remove any extra whitespace
    const cleanUrl = url.trim();
    
    // Check if it's a valid URL format
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('/')) {
      return cleanUrl;
    }
    
    // If it looks like a filename without path, prepend with a base URL
    if (cleanUrl.includes('.jpg') || cleanUrl.includes('.jpeg') || cleanUrl.includes('.png') || cleanUrl.includes('.webp')) {
      return `https://via.placeholder.com/200x200/f43f5e/ffffff?text=${encodeURIComponent(alt)}`;
    }
    
    return null;
  };

  const cleanSrc = getCleanImageUrl(src);
  const shouldShowImage = cleanSrc && !imageError;
  const displayName = fallbackText || alt;
  const fallbackUrl = getFallbackImageUrl(displayName);

  // Show text fallback if both image and fallback service fail
  if ((imageError && fallbackError) || (!cleanSrc && fallbackError)) {
    return (
      <div className={cn(
        'relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-500 text-white font-semibold',
        sizeClasses[size],
        textSizes[size],
        rounded ? 'rounded-xl' : 'rounded-none',
        className
      )}>
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn(
      'relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-500',
      sizeClasses[size],
      rounded ? 'rounded-xl' : 'rounded-none',
      className
    )}>
      {shouldShowImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={cleanSrc}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              'w-full h-full object-cover object-center transition-opacity duration-300',
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
          />
        </>
      ) : (
        // Fallback: Try UI Avatars service first, then text fallback
        <img
          src={fallbackUrl}
          alt={alt}
          onError={handleFallbackError}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};
