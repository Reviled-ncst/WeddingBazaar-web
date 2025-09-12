import React, { useState } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { 
  Globe, 
  Search, 
  TrendingUp, 
  Eye, 
  Target, 
  Star,
  ExternalLink,
  CheckCircle,
  BarChart3,
  Users,
  Clock,
  Award,
  RefreshCw
} from 'lucide-react';

interface SEOMetrics {
  searchVisibility: number;
  onlineRating: number;
  profileViews: number;
  searchRanking: number;
  socialPresence: number;
  reviewCount: number;
}

interface SEORecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  impact: string;
}

export const VendorSEO: React.FC = () => {
  const [seoMetrics, setSeoMetrics] = useState<SEOMetrics>({
    searchVisibility: 78,
    onlineRating: 4.6,
    profileViews: 2847,
    searchRanking: 3,
    socialPresence: 65,
    reviewCount: 124
  });

  const [recommendations, setRecommendations] = useState<SEORecommendation[]>([
    {
      id: '1',
      title: 'Optimize Business Description',
      description: 'Add industry keywords to your business description to improve search ranking',
      priority: 'high',
      completed: false,
      impact: '+15% visibility'
    },
    {
      id: '2',
      title: 'Upload Professional Photos',
      description: 'Add high-quality portfolio images to increase profile engagement',
      priority: 'high',
      completed: true,
      impact: '+25% profile views'
    },
    {
      id: '3',
      title: 'Complete Social Media Links',
      description: 'Add Instagram, Facebook, and website links to boost online presence',
      priority: 'medium',
      completed: false,
      impact: '+10% social traffic'
    },
    {
      id: '4',
      title: 'Respond to Reviews',
      description: 'Reply to recent customer reviews to improve engagement and SEO',
      priority: 'medium',
      completed: false,
      impact: '+8% rating boost'
    },
    {
      id: '5',
      title: 'Update Business Hours',
      description: 'Ensure your availability and contact information is current',
      priority: 'low',
      completed: true,
      impact: '+5% local search'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update metrics with slight variations
    setSeoMetrics(prev => ({
      ...prev,
      searchVisibility: Math.min(100, prev.searchVisibility + Math.floor(Math.random() * 5)),
      profileViews: prev.profileViews + Math.floor(Math.random() * 50),
      socialPresence: Math.min(100, prev.socialPresence + Math.floor(Math.random() * 3))
    }));
    
    setIsRefreshing(false);
  };

  const toggleRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: !rec.completed } : rec
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completedCount = recommendations.filter(rec => rec.completed).length;
  const completionPercentage = Math.round((completedCount / recommendations.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    SEO & Online Presence
                  </h1>
                  <p className="text-gray-600">Optimize your visibility and attract more clients</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleRefreshMetrics}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
            </button>
          </div>
        </div>

        {/* SEO Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{seoMetrics.searchVisibility}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Search Visibility</h3>
            <p className="text-sm text-gray-600">How often you appear in searches</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-yellow-600">{seoMetrics.onlineRating}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Online Rating</h3>
            <p className="text-sm text-gray-600">Average across all platforms</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{seoMetrics.profileViews.toLocaleString()}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Profile Views</h3>
            <p className="text-sm text-gray-600">This month</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">#{seoMetrics.searchRanking}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Search Ranking</h3>
            <p className="text-sm text-gray-600">In your category locally</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">{seoMetrics.socialPresence}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Social Presence</h3>
            <p className="text-sm text-gray-600">Engagement score</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Award className="h-6 w-6 text-rose-600" />
              </div>
              <span className="text-2xl font-bold text-rose-600">{seoMetrics.reviewCount}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Total Reviews</h3>
            <p className="text-sm text-gray-600">Across all platforms</p>
          </div>
        </div>

        {/* SEO Recommendations */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO Recommendations</h2>
              <p className="text-gray-600">Complete these tasks to improve your online presence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{completionPercentage}%</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completedCount} of {recommendations.length} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
                  recommendation.completed 
                    ? 'border-green-200 bg-green-50/50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => toggleRecommendation(recommendation.id)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        recommendation.completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {recommendation.completed && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`font-semibold ${
                          recommendation.completed ? 'text-green-700 line-through' : 'text-gray-900'
                        }`}>
                          {recommendation.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${
                        recommendation.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {recommendation.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-blue-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">{recommendation.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {recommendation.completed ? (
                      <div className="p-2 bg-green-100 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-yellow-100 rounded-xl">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200">
                <Globe className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Update Website</div>
                  <div className="text-sm text-blue-600">Edit your business website</div>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-200">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-purple-900">View Analytics</div>
                  <div className="text-sm text-purple-600">Detailed SEO insights</div>
                </div>
              </button>
              
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-200">
                <ExternalLink className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-green-900">Social Links</div>
                  <div className="text-sm text-green-600">Manage your profiles</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
