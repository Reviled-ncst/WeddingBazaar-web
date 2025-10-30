import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, CheckCircle, Clock, DollarSign, 
  TrendingUp, Bell, Star, Heart, Briefcase,
  CalendarDays, AlertCircle, ArrowRight, PartyPopper
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface Wedding {
  id: string;
  coupleName: string;
  weddingDate: string;
  venue: string;
  status: 'planning' | 'confirmed' | 'in-progress' | 'completed';
  progress: number;
  budget: number;
  spent: number;
  vendorsBooked: number;
  totalVendors: number;
  nextMilestone: string;
  daysUntilWedding: number;
}

interface Stats {
  activeWeddings: number;
  upcomingEvents: number;
  totalRevenue: number;
  averageRating: number;
  completedWeddings: number;
  activeVendors: number;
}

export const CoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    activeWeddings: 0,
    upcomingEvents: 0,
    totalRevenue: 0,
    averageRating: 0,
    completedWeddings: 0,
    activeVendors: 0
  });
  const [weddings, setWeddings] = useState<Wedding[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // Simulated data for now
      setStats({
        activeWeddings: 8,
        upcomingEvents: 3,
        totalRevenue: 125000,
        averageRating: 4.8,
        completedWeddings: 42,
        activeVendors: 15
      });

      setWeddings([
        {
          id: '1',
          coupleName: 'Sarah & Michael',
          weddingDate: '2025-12-15',
          venue: 'Grand Ballroom, Makati',
          status: 'in-progress',
          progress: 75,
          budget: 500000,
          spent: 375000,
          vendorsBooked: 6,
          totalVendors: 8,
          nextMilestone: 'Final venue walkthrough',
          daysUntilWedding: 45
        },
        {
          id: '2',
          coupleName: 'Jessica & David',
          weddingDate: '2026-01-20',
          venue: 'Beach Resort, Batangas',
          status: 'planning',
          progress: 45,
          budget: 750000,
          spent: 225000,
          vendorsBooked: 4,
          totalVendors: 10,
          nextMilestone: 'Photographer meeting',
          daysUntilWedding: 81
        },
        {
          id: '3',
          coupleName: 'Maria & James',
          weddingDate: '2025-11-30',
          venue: 'Garden Venue, Tagaytay',
          status: 'confirmed',
          progress: 90,
          budget: 650000,
          spent: 585000,
          vendorsBooked: 8,
          totalVendors: 8,
          nextMilestone: 'Rehearsal dinner',
          daysUntilWedding: 30
        }
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Wedding['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: Wedding['status']) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'confirmed': return 'Confirmed';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 30) return 'text-red-600 bg-red-50';
    if (days <= 60) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
        <CoordinatorHeader />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-gray-200 rounded-3xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
                <div className="h-40 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
      <CoordinatorHeader />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl p-8 mb-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <PartyPopper className="h-10 w-10" />
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-amber-100 text-lg">
                  You're coordinating {stats.activeWeddings} weddings this season
                </p>
              </div>
              <button
                onClick={() => navigate('/coordinator/weddings/new')}
                className="bg-white text-amber-600 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Calendar className="h-5 w-5" />
                Add New Wedding
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                  <Heart className="h-6 w-6 text-amber-600" />
                </div>
                <span className="text-2xl">💍</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Active Weddings</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.activeWeddings}</p>
              <p className="text-sm text-green-600 mt-2">+2 this month</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Upcoming Events</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              <p className="text-sm text-amber-600 mt-2">Next in {weddings[0]?.daysUntilWedding || 0} days</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">₱{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-2">+15% from last quarter</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Average Rating</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-500 mt-2">From {stats.completedWeddings} weddings</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Completed</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.completedWeddings}</p>
              <p className="text-sm text-gray-500 mt-2">All-time total</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">Active Vendors</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.activeVendors}</p>
              <p className="text-sm text-gray-500 mt-2">In your network</p>
            </div>
          </div>

          {/* Active Weddings Overview */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-amber-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarDays className="h-7 w-7 text-amber-600" />
                Active Weddings
              </h2>
              <button
                onClick={() => navigate('/coordinator/weddings')}
                className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {weddings.map((wedding) => (
                <div
                  key={wedding.id}
                  onClick={() => navigate(`/coordinator/weddings/${wedding.id}`)}
                  className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{wedding.coupleName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(wedding.status)}`}>
                          {getStatusLabel(wedding.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(wedding.weddingDate).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {wedding.venue}
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getUrgencyColor(wedding.daysUntilWedding)}`}>
                          <Clock className="h-4 w-4" />
                          {wedding.daysUntilWedding} days away
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-sm font-bold text-gray-900">{wedding.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${wedding.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Budget Used</span>
                        <span className="text-sm font-bold text-gray-900">
                          ₱{wedding.spent.toLocaleString()} / ₱{wedding.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(wedding.spent / wedding.budget) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Vendors Booked</span>
                        <span className="text-sm font-bold text-gray-900">
                          {wedding.vendorsBooked} / {wedding.totalVendors}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(wedding.vendorsBooked / wedding.totalVendors) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>Next: {wedding.nextMilestone}</span>
                    </div>
                    <button className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-2">
                      Manage
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/coordinator/calendar')}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-200 text-left"
            >
              <Calendar className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Calendar View</h3>
              <p className="text-sm text-gray-600">See all events and milestones</p>
            </button>

            <button
              onClick={() => navigate('/coordinator/vendors')}
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-200 text-left"
            >
              <Users className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Vendor Network</h3>
              <p className="text-sm text-gray-600">Manage your vendor relationships</p>
            </button>

            <button
              onClick={() => navigate('/coordinator/analytics')}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-200 text-left"
            >
              <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Track performance and revenue</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
