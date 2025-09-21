/**
 * Content Card Component
 * Displays individual content items with engagement features
 */

import React from 'react';
import { Heart, Bookmark, Share2, Eye, Star } from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { ForYouContent } from '../types/foryou.types';

interface ContentCardProps {
  content: ForYouContent;
  onInteraction: (content: ForYouContent, action: 'view' | 'like' | 'save' | 'share') => void;
  relevanceScore: number;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onInteraction,
  relevanceScore,
  className
}) => {
  const handleClick = () => {
    onInteraction(content, 'view');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction(content, 'like');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction(content, 'save');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction(content, 'share');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inspiration': return 'bg-pink-100 text-pink-700';
      case 'tip': return 'bg-blue-100 text-blue-700';
      case 'vendor-spotlight': return 'bg-purple-100 text-purple-700';
      case 'trend': return 'bg-green-100 text-green-700';
      case 'planning-advice': return 'bg-yellow-100 text-yellow-700';
      case 'real-wedding': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer",
        "hover:shadow-lg transition-all duration-300 group",
        className
      )}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={content.media.thumbnailUrl}
          alt={content.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Relevance Score Badge */}
        <div className="absolute top-3 left-3">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1",
            getRelevanceColor(relevanceScore)
          )}>
            <Star className="w-3 h-3" />
            <span>{relevanceScore}%</span>
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium capitalize",
            getTypeColor(content.type)
          )}>
            {content.type.replace('-', ' ')}
          </span>
        </div>

        {/* Engagement Overlay */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white text-sm">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{content.engagement.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{content.engagement.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bookmark className="w-4 h-4" />
                <span>{content.engagement.saves}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {content.title}
          </h3>
          {content.subtitle && (
            <p className="text-sm text-gray-600 line-clamp-1">
              {content.subtitle}
            </p>
          )}
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {content.content}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{content.metadata.readTime} min read</span>
          <span className="capitalize">{content.metadata.difficulty}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {content.metadata.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Personalization Reasons */}
        {content.personalization.reasons.length > 0 && (
          <div className="mb-4 p-2 bg-pink-50 rounded-lg">
            <p className="text-xs text-pink-700 font-medium mb-1">Why this is for you:</p>
            <p className="text-xs text-pink-600">
              {content.personalization.reasons[0]}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">{content.engagement.likes}</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">{content.engagement.saves}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{content.engagement.shares}</span>
            </button>
          </div>

          {content.actionable.ctaText && (
            <button className="px-3 py-1 bg-pink-500 text-white rounded-lg text-xs hover:bg-pink-600 transition-colors">
              {content.actionable.ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
