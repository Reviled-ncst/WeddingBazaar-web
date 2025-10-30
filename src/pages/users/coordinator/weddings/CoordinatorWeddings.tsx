import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, DollarSign, Users, Plus, 
  Search, Filter, Edit, Trash2, Eye, CheckCircle,
  Clock, AlertCircle, TrendingUp, Heart
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface Wedding {
  id: string;
  coupleName: string;
  coupleEmail: string;
  couplePhone: string;
  weddingDate: string;
  venue: string;
  venueAddress: string;
  status: 'planning' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  progress: number;
  budget: number;
  spent: number;
  vendorsBooked: number;
  totalVendors: number;
  guestCount: number;
  nextMilestone: string;
  daysUntilWedding: number;
  notes: string;
  createdAt: string;
}

export const CoordinatorWeddings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [filteredWeddings, setFilteredWeddings] = useState<Wedding[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'progress'>('date');

  useEffect(() => {
    loadWeddings();
  }, []);

  useEffect(() => {
    filterAndSortWeddings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weddings, searchQuery, statusFilter, sortBy]);

  const loadWeddings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/coordinator/weddings');
      // const data = await response.json();
      
      // Mock data for now
      const mockWeddings: Wedding[] = [
        {
          id: '1',
          coupleName: 'Sarah & Michael Rodriguez',
          coupleEmail: 'sarah.rodriguez@email.com',
          couplePhone: '+63 917 123 4567',
          weddingDate: '2025-12-15',
          venue: 'Grand Ballroom, Makati Shangri-La',
          venueAddress: 'Ayala Avenue, Makati City',
          status: 'in-progress',
          progress: 75,
          budget: 500000,
          spent: 375000,
          vendorsBooked: 6,
          totalVendors: 8,
          guestCount: 150,
          nextMilestone: 'Final venue walkthrough',
          daysUntilWedding: 45,
          notes: 'Couple prefers modern minimalist theme',
          createdAt: '2025-06-15'
        },
        {
          id: '2',
          coupleName: 'Jessica & David Chen',
          coupleEmail: 'jessica.chen@email.com',
          couplePhone: '+63 917 234 5678',
          weddingDate: '2026-01-20',
          venue: 'Taal Vista Hotel, Tagaytay',
          venueAddress: 'Tagaytay-Calamba Road, Tagaytay City',
          status: 'planning',
          progress: 45,
          budget: 750000,
          spent: 225000,
          vendorsBooked: 4,
          totalVendors: 10,
          guestCount: 200,
          nextMilestone: 'Photographer meeting',
          daysUntilWedding: 81,
          notes: 'Garden wedding with outdoor ceremony',
          createdAt: '2025-08-01'
        },
        {
          id: '3',
          coupleName: 'Maria & James Thompson',
          coupleEmail: 'maria.thompson@email.com',
          couplePhone: '+63 917 345 6789',
          weddingDate: '2025-11-30',
          venue: 'Manila Cathedral',
          venueAddress: 'Intramuros, Manila',
          status: 'confirmed',
          progress: 90,
          budget: 600000,
          spent: 540000,
          vendorsBooked: 8,
          totalVendors: 8,
          guestCount: 180,
          nextMilestone: 'Final rehearsal',
          daysUntilWedding: 30,
          notes: 'Traditional church wedding',
          createdAt: '2025-04-10'
        },
        {
          id: '4',
          coupleName: 'Anna & Robert Lee',
          coupleEmail: 'anna.lee@email.com',
          couplePhone: '+63 917 456 7890',
          weddingDate: '2025-11-05',
          venue: 'Fernwood Gardens, Quezon City',
          venueAddress: 'Commonwealth Avenue, QC',
          status: 'in-progress',
          progress: 60,
          budget: 450000,
          spent: 270000,
          vendorsBooked: 5,
          totalVendors: 7,
          guestCount: 120,
          nextMilestone: 'Menu tasting',
          daysUntilWedding: 5,
          notes: 'Intimate garden wedding',
          createdAt: '2025-05-20'
        },
        {
          id: '5',
          coupleName: 'Emily & Thomas Garcia',
          coupleEmail: 'emily.garcia@email.com',
          couplePhone: '+63 917 567 8901',
          weddingDate: '2026-02-14',
          venue: 'Shangri-La Boracay',
          venueAddress: 'Boracay Island',
          status: 'planning',
          progress: 30,
          budget: 900000,
          spent: 180000,
          vendorsBooked: 3,
          totalVendors: 9,
          guestCount: 100,
          nextMilestone: 'Venue site visit',
          daysUntilWedding: 106,
          notes: 'Destination beach wedding',
          createdAt: '2025-09-01'
        }
      ];

      setWeddings(mockWeddings);
    } catch (error) {
      console.error('Failed to load weddings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortWeddings = () => {
    let filtered = [...weddings];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(wedding =>
        wedding.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wedding.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wedding.venueAddress.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(wedding => wedding.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime();
        case 'budget':
          return b.budget - a.budget;
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    setFilteredWeddings(filtered);
  };

  const getStatusBadge = (status: Wedding['status']) => {
    const statusConfig = {
      planning: { label: 'Planning', color: 'bg-blue-100 text-blue-700', icon: Clock },
      confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: TrendingUp },
      completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700', icon: Heart },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getUrgencyColor = (days: number) => {
    if (days < 7) return 'text-red-600 font-bold';
    if (days < 30) return 'text-amber-600 font-semibold';
    if (days < 60) return 'text-blue-600';
    return 'text-gray-600';
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
      <CoordinatorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Wedding Management</h1>
              <p className="text-gray-600">Manage all your coordinated weddings in one place</p>
            </div>
            <button
              onClick={() => navigate('/coordinator/weddings/new')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Wedding
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Weddings</p>
                  <p className="text-2xl font-bold text-gray-900">{weddings.length}</p>
                </div>
                <Heart className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {weddings.filter(w => w.status === 'in-progress').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(weddings.reduce((sum, w) => sum + w.budget, 0))}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(weddings.reduce((sum, w) => sum + w.progress, 0) / weddings.length)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search couples or venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                  title="Filter by status"
                  aria-label="Filter weddings by status"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'budget' | 'progress')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Sort weddings by"
                aria-label="Sort weddings by"
              >
                <option value="date">Sort by Date</option>
                <option value="budget">Sort by Budget</option>
                <option value="progress">Sort by Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Weddings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading weddings...</p>
          </div>
        ) : filteredWeddings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No weddings found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first wedding'}
            </p>
            <button
              onClick={() => navigate('/coordinator/weddings/new')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Add Wedding
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredWeddings.map((wedding) => (
              <div
                key={wedding.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{wedding.coupleName}</h3>
                      {getStatusBadge(wedding.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(wedding.weddingDate)}</span>
                        <span className={`ml-2 ${getUrgencyColor(wedding.daysUntilWedding)}`}>
                          ({wedding.daysUntilWedding} days)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{wedding.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{wedding.guestCount} guests</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/coordinator/weddings/${wedding.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/coordinator/weddings/${wedding.id}/edit`)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-semibold text-gray-900">{wedding.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${wedding.progress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Budget Used</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round((wedding.spent / wedding.budget) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${(wedding.spent / wedding.budget) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(wedding.spent)} / {formatCurrency(wedding.budget)}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Vendors Booked</span>
                      <span className="font-semibold text-gray-900">
                        {wedding.vendorsBooked}/{wedding.totalVendors}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${(wedding.vendorsBooked / wedding.totalVendors) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="flex items-center gap-2 text-sm bg-amber-50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Next:</span> {wedding.nextMilestone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
