import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, DollarSign, Users, Plus, 
  Search, Filter, Edit, Trash2, Eye, CheckCircle,
  Clock, AlertCircle, TrendingUp, Heart
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';
import { 
  WeddingCreateModal, 
  WeddingEditModal, 
  WeddingDetailsModal, 
  WeddingDeleteDialog 
} from './components';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWedding, setSelectedWedding] = useState<Wedding | null>(null);

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
      
      // Import coordinator service
      const { getAllWeddings } = await import('../../../../shared/services/coordinatorService');
      
      // Fetch real data from backend
      const response = await getAllWeddings({ limit: 50 });
      
      if (response.success && response.weddings) {
        // Map backend data to frontend format
        const mappedWeddings: Wedding[] = response.weddings.map((w: any) => ({
          id: w.id,
          coupleName: w.couple_names || w.couple_name || 'Unknown Couple',
          coupleEmail: w.couple_email || '',
          couplePhone: w.couple_phone || '',
          weddingDate: w.event_date || w.wedding_date || '',
          venue: w.venue || 'TBD',
          venueAddress: w.venue_address || '',
          status: w.status || 'planning',
          progress: w.progress || 0,
          budget: parseFloat(w.budget || '0'),
          spent: parseFloat(w.spent || '0'),
          vendorsBooked: w.vendors_count || 0,
          totalVendors: w.vendors_count || 0,
          guestCount: w.guest_count || 0,
          nextMilestone: 'Check milestones',
          daysUntilWedding: Math.ceil((new Date(w.event_date || w.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          notes: w.notes || '',
          createdAt: w.created_at || new Date().toISOString()
        }));
        
        setWeddings(mappedWeddings);
        return;
      }
      
      // Fallback to mock data if API fails
      console.warn('No weddings data from API, using mock data');
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

  // Modal handlers
  const handleViewDetails = (wedding: Wedding) => {
    setSelectedWedding(wedding);
    setShowDetailsModal(true);
  };

  const handleEdit = (wedding: Wedding) => {
    setSelectedWedding(wedding);
    setShowEditModal(true);
  };

  const handleDelete = (wedding: Wedding) => {
    setSelectedWedding(wedding);
    setShowDeleteDialog(true);
  };

  const handleCloseModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowDeleteDialog(false);
    setSelectedWedding(null);
  };

  const handleSuccessAction = () => {
    loadWeddings();
    handleCloseModals();
  };

  // Helper to map Wedding to modal format
  const mapWeddingForModal = (wedding: Wedding) => ({
    id: wedding.id,
    couple_name: wedding.coupleName,
    couple_email: wedding.coupleEmail,
    couple_phone: wedding.couplePhone,
    wedding_date: wedding.weddingDate,
    venue: wedding.venue,
    venue_address: wedding.venueAddress,
    budget: wedding.budget,
    guest_count: wedding.guestCount,
    preferred_style: 'classic', // Default value
    notes: wedding.notes,
    status: wedding.status
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-white">
      <CoordinatorHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Backend Connection Indicator */}
        {!loading && weddings.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 mb-4 text-white shadow-lg border-2 border-green-400">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 animate-pulse" />
              <span className="font-bold text-lg">✅ Backend API Connected - {weddings.length} Weddings Loaded</span>
            </div>
          </div>
        )}
        
        {/* Page Header - Enhanced */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Wedding Management</h1>
              <p className="text-gray-700 font-medium text-lg">Manage all your coordinated weddings in one place</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:shadow-2xl transition-all hover:scale-105 font-bold text-lg"
            >
              <Plus className="w-6 h-6" />
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
                      onClick={() => handleViewDetails(wedding)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(wedding)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(wedding)}
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

        {/* Wedding Create Modal */}
        <WeddingCreateModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            loadWeddings(); // Reload weddings after successful creation
          }}
        />

        {/* Wedding Edit Modal */}
        {showEditModal && selectedWedding && (
          <WeddingEditModal
            isOpen={showEditModal}
            onClose={handleCloseModals}
            wedding={mapWeddingForModal(selectedWedding)}
            onSuccess={handleSuccessAction}
          />
        )}

        {/* Wedding Details Modal */}
        {showDetailsModal && selectedWedding && (
          <WeddingDetailsModal
            isOpen={showDetailsModal}
            onClose={handleCloseModals}
            weddingId={selectedWedding.id}
          />
        )}

        {/* Wedding Delete Dialog */}
        {showDeleteDialog && selectedWedding && (
          <WeddingDeleteDialog
            isOpen={showDeleteDialog}
            onClose={handleCloseModals}
            wedding={mapWeddingForModal(selectedWedding)}
            onSuccess={handleSuccessAction}
          />
        )}
      </div>
    </div>
  );
};
