/**
 * For You - Personalized Wedding Content Hub
 * AI-powered content recommendations and inspiration
 */

import React, { useState } from 'react';
import { Heart, Bookmark, TrendingUp, Sparkles, Filter, Calendar, User, Brain, Users, MapPin, Target } from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { cn } from '../../../../utils/cn';

export const ForYouPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'saved' | 'inspiration'>('feed');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const mockContent = [
    {
      id: '1',
      title: 'Bohemian Garden Wedding Ideas',
      description: 'Dreamy outdoor ceremony with natural elements',
      type: 'inspiration',
      imageUrl: '/api/placeholder/400/300',
      likes: 245,
      saves: 89,
      relevanceScore: 92
    },
    {
      id: '2',
      title: 'Budget-Friendly Centerpiece Ideas',
      description: 'Beautiful centerpieces that won\'t break the bank',
      type: 'tips',
      imageUrl: '/api/placeholder/400/300',
      likes: 156,
      saves: 67,
      relevanceScore: 88
    }
  ];

  const mockPreferences = {
    style: 'Bohemian',
    season: 'Spring',
    guestCount: 75,
    location: 'Garden',
    completeness: 68
  };

  const mockInsights = [
    { title: 'Your Style Match', description: 'Bohemian elements align with your preferences', confidence: 92 },
    { title: 'Seasonal Suggestions', description: 'Spring florals trending in your area', confidence: 85 },
    { title: 'Budget Optimization', description: 'DIY options can save 30% on decor', confidence: 78 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoupleHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl mr-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                For You
              </h1>
              <p className="text-gray-600 mt-2">
                Personalized content curated just for your wedding
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <div className="flex space-x-2">
              {[
                { id: 'feed', label: 'Your Feed', icon: Heart },
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'saved', label: 'Saved', icon: Bookmark },
                { id: 'inspiration', label: 'Inspiration', icon: Sparkles }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium",
                    activeTab === id
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Personalized for You</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Personalization Score */}
        <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 text-purple-500 mr-2" />
              Your Personal Wedding Profile
            </h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{mockPreferences.completeness}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-pink-50 rounded-xl">
              <div className="font-semibold text-pink-600 mb-1">{mockPreferences.style}</div>
              <div className="text-gray-600">Style</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="font-semibold text-green-600 mb-1">{mockPreferences.season}</div>
              <div className="text-gray-600">Season</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-blue-600 mb-1">{mockPreferences.guestCount}</div>
              <div className="text-gray-600">Guests</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-purple-600 mb-1">{mockPreferences.location}</div>
              <div className="text-gray-600">Venue Type</div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
            AI Insights & Recommendations
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {mockInsights.map((insight, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{insight.title}</h4>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    {insight.confidence}% match
                  </span>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockContent.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Heart className="w-4 h-4 text-gray-600" />
                </div>
                <div className="absolute bottom-3 left-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                  {item.relevanceScore}% match
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {item.likes}
                    </span>
                    <span className="flex items-center">
                      <Bookmark className="w-4 h-4 mr-1" />
                      {item.saves}
                    </span>
                  </div>
                  <button className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm hover:shadow-md transition-all duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-pink-500 mr-2" />
            Recommended Actions
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-pink-50 rounded-xl">
              <h4 className="font-medium text-pink-800 mb-2">Complete Your Profile</h4>
              <p className="text-sm text-pink-600 mb-3">Add more preferences to get better recommendations</p>
              <button className="text-sm text-pink-600 font-medium hover:text-pink-700">
                Update Preferences →
              </button>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-medium text-purple-800 mb-2">Explore Trending Ideas</h4>
              <p className="text-sm text-purple-600 mb-3">See what's popular with couples like you</p>
              <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
                View Trending →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForYouPage;
