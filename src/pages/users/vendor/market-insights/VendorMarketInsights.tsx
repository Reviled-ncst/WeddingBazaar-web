import React, { useState, useEffect } from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MarketData {
  metric: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface CompetitorData {
  id: string;
  name: string;
  category: string;
  rating: number;
  priceRange: string;
  bookingsThisMonth: number;
  marketShare: number;
}

interface TrendData {
  period: string;
  bookings: number;
  revenue: number;
  avgPrice: number;
}

export const VendorMarketInsights: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('photography');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketInsights();
  }, [selectedCategory]);

  const fetchMarketInsights = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, fetch from API
      setMarketData([
        {
          metric: 'Market Demand',
          value: '87%',
          change: 12,
          trend: 'up',
          description: 'Increase in booking requests for your category'
        },
        {
          metric: 'Average Price',
          value: '₱45,000',
          change: 8,
          trend: 'up',
          description: 'Average price in your area and category'
        },
        {
          metric: 'Competition Level',
          value: 'Moderate',
          change: -3,
          trend: 'down',
          description: 'Number of active competitors in your area'
        },
        {
          metric: 'Best Booking Days',
          value: 'Sat-Sun',
          change: 0,
          trend: 'stable',
          description: 'Peak demand days for your services'
        }
      ]);

      setCompetitors([
        {
          id: '1',
          name: 'Elite Photography Studio',
          category: 'Photography',
          rating: 4.8,
          priceRange: '₱40,000 - ₱60,000',
          bookingsThisMonth: 15,
          marketShare: 12.5
        },
        {
          id: '2',
          name: 'Dream Wedding Photos',
          category: 'Photography',
          rating: 4.6,
          priceRange: '₱35,000 - ₱50,000',
          bookingsThisMonth: 12,
          marketShare: 10.2
        },
        {
          id: '3',
          name: 'Perfect Moments Studio',
          category: 'Photography',
          rating: 4.7,
          priceRange: '₱45,000 - ₱70,000',
          bookingsThisMonth: 10,
          marketShare: 8.7
        }
      ]);

      setTrends([
        { period: 'Jan 2024', bookings: 8, revenue: 320000, avgPrice: 40000 },
        { period: 'Feb 2024', bookings: 12, revenue: 480000, avgPrice: 40000 },
        { period: 'Mar 2024', bookings: 15, revenue: 675000, avgPrice: 45000 },
        { period: 'Apr 2024', bookings: 18, revenue: 810000, avgPrice: 45000 },
        { period: 'May 2024', bookings: 22, revenue: 1100000, avgPrice: 50000 },
        { period: 'Jun 2024', bookings: 20, revenue: 1000000, avgPrice: 50000 }
      ]);

    } catch (error) {
      console.error('Error fetching market insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable') return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
        <VendorHeader />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <VendorHeader />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Insights</h1>
            <p className="text-gray-600">Understand your market position and identify growth opportunities</p>
          </div>

          {/* Category Selector */}
          <div className="mb-8">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              title="Select service category"
              aria-label="Select service category"
            >
              <option value="photography">Photography</option>
              <option value="catering">Catering</option>
              <option value="venues">Venues</option>
              <option value="music">Music & Entertainment</option>
              <option value="planning">Wedding Planning</option>
            </select>
          </div>

          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {marketData.map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{item.metric}</h3>
                  {getTrendIcon(item.trend)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                <div className={`text-sm ${getTrendColor(item.trend, item.change)}`}>
                  {item.change !== 0 && `${item.change > 0 ? '+' : ''}${item.change}%`}
                  {item.change === 0 && 'No change'}
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Market Trends Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">6-Month Trends</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bookings Trend */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Bookings</h3>
                <div className="space-y-2">
                  {trends.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{item.period}</span>
                      <span className="text-sm font-medium">{item.bookings}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Trend */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Revenue</h3>
                <div className="space-y-2">
                  {trends.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{item.period}</span>
                      <span className="text-sm font-medium">₱{item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average Price Trend */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Avg. Price</h3>
                <div className="space-y-2">
                  {trends.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{item.period}</span>
                      <span className="text-sm font-medium">₱{item.avgPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Competitor Analysis</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Business</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price Range</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Monthly Bookings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Market Share</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((competitor) => (
                    <tr key={competitor.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{competitor.name}</div>
                          <div className="text-sm text-gray-500">{competitor.category}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{competitor.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{competitor.priceRange}</td>
                      <td className="py-3 px-4 text-sm font-medium">{competitor.bookingsThisMonth}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{competitor.marketShare}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorMarketInsights;
