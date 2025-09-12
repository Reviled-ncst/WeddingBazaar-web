import React, { useState, useCallback } from 'react';
import { cn } from '../../../../../utils/cn';

interface ServiceImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  rounded?: boolean;
  serviceType?: string; // For better fallback images
}

export const ServiceImage: React.FC<ServiceImageProps> = ({
  src,
  alt,
  className,
  size = 'md',
  rounded = true,
  serviceType = 'wedding'
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
    full: 'text-xl'
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

  // Generate service-specific fallback image URL
  const getFallbackImageUrl = (serviceType: string) => {
    // Map service types to appropriate Unsplash images
    const serviceImageMap: Record<string, string> = {
      photography: 'photo-1519741497674-611481863552', // Wedding photography
      catering: 'photo-1555244162-803834f70033', // Food/catering
      venue: 'photo-1464366400600-7168b8af9bc3', // Venue/reception
      music: 'photo-1470225620780-dba8ba36b745', // Music/DJ
      planning: 'photo-1478147427282-58c9c2c8a631', // Wedding planning
      flowers: 'photo-1522337360788-8b13dee7a37e', // Flowers/decoration
      decoration: 'photo-1522337360788-8b13dee7a37e', // Decoration
      transport: 'photo-1449824913935-59a10b8d2000', // Transportation
      beauty: 'photo-1487412947147-5cebf100ffc2', // Beauty/makeup
      cake: 'photo-1578985545062-69928b1d9587' // Wedding cake
    };

    const serviceKey = serviceType.toLowerCase();
    const imageId = serviceImageMap[serviceKey] || serviceImageMap.photography;
    
    return `https://images.unsplash.com/photo-${imageId}?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3`;
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
    
    // If it looks like a filename without path, assume it's broken
    return null;
  };

  const cleanSrc = getCleanImageUrl(src);
  const shouldShowImage = cleanSrc && !imageError;
  const fallbackUrl = getFallbackImageUrl(serviceType);

  // Show text fallback if both image and fallback service fail
  if ((imageError && fallbackError) || (!cleanSrc && fallbackError)) {
    return (
      <div className={cn(
        'relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold',
        sizeClasses[size],
        textSizes[size],
        rounded ? 'rounded-xl' : 'rounded-none',
        className
      )}>
        <div className="text-center">
          <div className="text-3xl mb-1">🎉</div>
          <div className="text-xs opacity-90">Service</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500',
      sizeClasses[size],
      rounded ? 'rounded-xl' : 'rounded-none',
      className
    )}>
      {shouldShowImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
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
        // Fallback: Try Unsplash service-specific image first, then text fallback
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
