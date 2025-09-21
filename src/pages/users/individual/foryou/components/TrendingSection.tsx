/**
 * Trending Section Component
 */

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ContentCard } from './ContentCard';
import type { ForYouContent } from '../types/foryou.types';

interface TrendingSectionProps {
  content: ForYouContent[];
  onInteraction: (content: ForYouContent, action: 'view' | 'like' | 'save' | 'share') => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ content, onInteraction }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-900">Trending Now</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            onInteraction={onInteraction}
            relevanceScore={item.personalization.relevanceScore}
          />
        ))}
      </div>
    </div>
  );
};
