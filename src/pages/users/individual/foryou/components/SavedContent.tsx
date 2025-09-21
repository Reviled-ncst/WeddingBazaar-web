/**
 * Saved Content Component
 */

import React from 'react';
import { Bookmark } from 'lucide-react';
import { ContentCard } from './ContentCard';
import type { ForYouContent } from '../types/foryou.types';

interface SavedContentProps {
  content: ForYouContent[];
  onInteraction: (content: ForYouContent, action: 'view' | 'like' | 'save' | 'share') => void;
  onUnsave: (contentId: string) => void;
}

export const SavedContent: React.FC<SavedContentProps> = ({ content, onInteraction }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bookmark className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-900">Saved Content</h2>
      </div>
      
      {content.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved content yet</h3>
          <p className="text-gray-500">Save content to view it here later</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
