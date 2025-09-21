/**
 * Inspiration Gallery Component
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface InspirationGalleryProps {
  onInteraction: (content: any, action: string) => void;
  preferences: any;
}

export const InspirationGallery: React.FC<InspirationGalleryProps> = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-900">Inspiration Gallery</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};
