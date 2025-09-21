/**
 * Enhanced For You - Personalized Wedding Content Hub
 * AI-powered content recommendations and inspiration with advanced features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Bookmark, 
  TrendingUp, 
  Sparkles, 
  Filter, 
  Brain, 
  Users, 
  MapPin, 
  Target,
  Search,
  Share2,
  Eye,
  Clock,
  Star,
  ChevronDown,
  RefreshCw,
  Camera,
  Calendar,
  DollarSign,
  ArrowRight,
  Play,
  Download,
  MessageCircle,
  Grid,
  List,
  MoreHorizontal,
  ExternalLink,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { cn } from '../../../../utils/cn';

export const ForYouPageEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'saved' | 'inspiration'>('feed');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced mock data with more detailed content
  const mockContent = [
    {
      id: '1',
      title: 'Bohemian Garden Wedding Ideas',
      description: 'Dreamy outdoor ceremony with natural elements and flowing fabrics that create magical moments',
      type: 'inspiration',
      category: 'decoration',
      imageUrl: '/api/placeholder/400/300',
      videoUrl: '/api/placeholder/video/wedding-bohemian.mp4',
      likes: 245,
      saves: 89,
      views: 1250,
      shares: 34,
      relevanceScore: 92,
      author: 'Wedding Dreams Studio',
      authorAvatar: '/api/placeholder/40/40',
      tags: ['bohemian', 'outdoor', 'natural', 'flowers'],
      timeToRead: '3 min read',
      publishedAt: new Date('2024-01-15'),
      budget: { min: 5000, max: 15000 },
      difficulty: 'medium',
      hasVideo: true,
      featured: true
    },
    {
      id: '2',
      title: 'Budget-Friendly Centerpiece Ideas',
      description: 'Beautiful centerpieces that won\'t break the bank - DIY tutorials included with step-by-step guides',
      type: 'tips',
      category: 'diy',
      imageUrl: '/api/placeholder/400/300',
      likes: 156,
      saves: 67,
      views: 890,
      shares: 23,
      relevanceScore: 88,
      author: 'DIY Wedding Queen',
      authorAvatar: '/api/placeholder/40/40',
      tags: ['budget', 'centerpieces', 'diy', 'flowers'],
      timeToRead: '5 min read',
      publishedAt: new Date('2024-01-12'),
      budget: { min: 200, max: 800 },
      difficulty: 'easy',
      hasVideo: false
    },
    {
      id: '3',
      title: 'Spring Wedding Color Palettes',
      description: 'Fresh and romantic color combinations perfect for spring celebrations with expert styling tips',
      type: 'inspiration',
      category: 'colors',
      imageUrl: '/api/placeholder/400/300',
      likes: 298,
      saves: 125,
      views: 1800,
      shares: 45,
      relevanceScore: 94,
      author: 'Color Theory Weddings',
      authorAvatar: '/api/placeholder/40/40',
      tags: ['spring', 'colors', 'palette', 'romantic'],
      timeToRead: '4 min read',
      publishedAt: new Date('2024-01-18'),
      difficulty: 'easy',
      hasVideo: false
    },
    {
      id: '4',
      title: 'Micro Wedding Venues That Pack a Punch',
      description: 'Intimate spaces that create unforgettable memories for small celebrations',
      type: 'venue',
      category: 'venues',
      imageUrl: '/api/placeholder/400/300',
      likes: 342,
      saves: 156,
      views: 2100,
      shares: 67,
      relevanceScore: 89,
      author: 'Venue Finder Pro',
      authorAvatar: '/api/placeholder/40/40',
      tags: ['micro-wedding', 'intimate', 'venues'],
      timeToRead: '6 min read',
      publishedAt: new Date('2024-01-20'),
      trending: true,
      hasVideo: true,
      difficulty: 'medium'
    }
  ];

  const mockPreferences = {
    style: 'Bohemian',
    season: 'Spring',
    guestCount: 75,
    location: 'Garden',
    budget: { min: 15000, max: 30000 },
    completeness: 68,
    interests: ['outdoor', 'natural', 'diy', 'photography'],
    preferredVendors: ['photographer', 'florist', 'venue']
  };

  const mockInsights = [
    { 
      title: 'Your Style Match', 
      description: 'Bohemian elements align with your preferences', 
      confidence: 92,
      actionable: true,
      action: 'Explore more bohemian vendors',
      icon: Target
    },
    { 
      title: 'Seasonal Suggestions', 
      description: 'Spring florals trending in your area', 
      confidence: 85,
      actionable: true,
      action: 'Browse spring flower arrangements',
      icon: Sparkles
    },
    { 
      title: 'Budget Optimization', 
      description: 'DIY options can save 30% on decor', 
      confidence: 78,
      actionable: true,
      action: 'View DIY tutorials',
      icon: DollarSign
    }
  ];

  // Content categories for filtering
  const categories = [
    { id: 'all', label: 'All Content', icon: Target },
    { id: 'decoration', label: 'Decoration', icon: Sparkles },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'diy', label: 'DIY & Tips', icon: Brain },
    { id: 'colors', label: 'Colors', icon: Eye },
    { id: 'budget', label: 'Budget', icon: DollarSign }
  ];

  // Handle content interactions
  const handleLike = async (contentId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const handleSave = async (contentId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const handleShare = async (contentId: string) => {
    // Mock share functionality
    if (navigator.share) {
      await navigator.share({
        title: 'Wedding Inspiration',
        url: `${window.location.origin}/content/${contentId}`
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/content/${contentId}`);
      // Show success message
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Filter content based on selected category and search
  const getFilteredContent = () => {
    let filtered = mockContent;
    
    if (activeTab === 'trending') {
      filtered = filtered.filter(item => (item as any).trending);
    } else if (activeTab === 'saved') {
      filtered = filtered.filter(item => savedItems.has(item.id));
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoupleHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            For <span className="text-pink-600">You</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Personalized wedding inspiration tailored to your style and preferences
          </p>
          
          {/* AI Insights Banner */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 mr-2" />
              <h2 className="text-xl font-semibold">AI Insights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    <insight.icon className="h-5 w-5 mr-2" />
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <p className="text-sm text-white/80 mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{insight.confidence}% match</span>
                    {insight.actionable && (
                      <button className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors">
                        {insight.action}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'feed', label: 'For You', icon: Target },
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'saved', label: 'Saved', icon: Bookmark },
                { id: 'inspiration', label: 'Inspiration', icon: Sparkles }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-white text-pink-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {tab.id === 'saved' && savedItems.size > 0 && (
                    <span className="ml-2 bg-pink-500 text-white text-xs rounded-full px-2 py-0.5">
                      {savedItems.size}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search and Controls */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded text-sm transition-colors',
                    viewMode === 'grid' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded text-sm transition-colors',
                    viewMode === 'list' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-600'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-pink-600 transition-colors disabled:opacity-50"
                title="Refresh content"
              >
                <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${selectedCategory}-${searchQuery}`}
            className={cn(
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {getFilteredContent().map((item, index) => (
              <motion.div
                key={item.id}
                className={cn(
                  'bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group',
                  viewMode === 'list' && 'flex'
                )}
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                {/* Image/Video */}
                <div className={cn(
                  'relative overflow-hidden',
                  viewMode === 'grid' ? 'aspect-video' : 'w-64 h-48 flex-shrink-0'
                )}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.hasVideo && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {(item as any).trending && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Trending
                    </div>
                  )}
                  {(item as any).featured && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    {item.timeToRead}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {item.relevanceScore}% match
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Author info */}
                  <div className="flex items-center mb-4">
                    <img
                      src={(item as any).authorAvatar}
                      alt={item.author}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{item.author}</span>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{item.publishedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget and difficulty */}
                  {item.budget && (
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${item.budget.min.toLocaleString()} - ${item.budget.max.toLocaleString()}</span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        item.difficulty === 'easy' && "bg-green-100 text-green-600",
                        item.difficulty === 'medium' && "bg-yellow-100 text-yellow-600",
                        item.difficulty === 'hard' && "bg-red-100 text-red-600"
                      )}>
                        {item.difficulty}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-pink-100 text-pink-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {item.views.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {item.likes}
                      </div>
                      <div className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-1" />
                        {item.saves}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLike(item.id)}
                        className={cn(
                          "p-2 transition-colors",
                          likedItems.has(item.id) 
                            ? "text-pink-500" 
                            : "text-gray-400 hover:text-pink-500"
                        )}
                      >
                        <Heart className={cn("h-5 w-5", likedItems.has(item.id) && "fill-current")} />
                      </button>
                      <button
                        onClick={() => handleSave(item.id)}
                        className={cn(
                          "p-2 transition-colors",
                          savedItems.has(item.id) 
                            ? "text-pink-500" 
                            : "text-gray-400 hover:text-pink-500"
                        )}
                      >
                        <Bookmark className={cn("h-5 w-5", savedItems.has(item.id) && "fill-current")} />
                      </button>
                      <button
                        onClick={() => handleShare(item.id)}
                        className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {getFilteredContent().length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Preferences Summary */}
        <motion.div 
          className="mt-12 bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="h-6 w-6 mr-2 text-pink-600" />
            Your Wedding Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="font-medium">{mockPreferences.style}</div>
              <div className="text-sm text-gray-600">Style</div>
            </div>
            <div className="text-center">
              <Calendar className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="font-medium">{mockPreferences.season}</div>
              <div className="text-sm text-gray-600">Season</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="font-medium">{mockPreferences.guestCount}</div>
              <div className="text-sm text-gray-600">Guests</div>
            </div>
            <div className="text-center">
              <MapPin className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <div className="font-medium">{mockPreferences.location}</div>
              <div className="text-sm text-gray-600">Venue Type</div>
            </div>
          </div>
          
          {/* Profile Completeness */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm text-gray-600">{mockPreferences.completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mockPreferences.completeness}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Complete your profile to get better recommendations
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForYouPageEnhanced;
