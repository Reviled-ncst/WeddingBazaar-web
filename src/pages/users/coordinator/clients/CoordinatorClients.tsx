import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Filter, Phone, Mail, 
  Calendar, Heart, Eye, MessageCircle, Star,
  TrendingUp, DollarSign, MapPin, Clock
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface Client {
  id: string;
  coupleName: string;
  email: string;
  phone: string;
  weddingDate: string;
  venue: string;
  budget: number;
  status: 'active' | 'completed' | 'cancelled';
  daysUntilWedding: number;
  progress: number;
  vendorsBooked: number;
  totalVendors: number;
  lastContact: string;
  notes: string;
  preferredStyle: string;
  guestCount: number;
}

export const CoordinatorClients: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'progress'>('date');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterAndSortClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, searchQuery, statusFilter, sortBy]);

  const loadClients = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockClients: Client[] = [
        {
          id: '1',
          coupleName: 'Sarah & Michael Rodriguez',
          email: 'sarah.rodriguez@email.com',
          phone: '+63 917 123 4567',
          weddingDate: '2025-12-15',
          venue: 'Grand Ballroom, Makati Shangri-La',
          budget: 500000,
          status: 'active',
          daysUntilWedding: 45,
          progress: 75,
          vendorsBooked: 6,
          totalVendors: 8,
          lastContact: '2025-10-28',
          notes: 'Couple prefers modern minimalist theme with gold accents',
          preferredStyle: 'Modern',
          guestCount: 150
        },
        {
          id: '2',
          coupleName: 'Jessica & David Chen',
          email: 'jessica.chen@email.com',
          phone: '+63 917 234 5678',
          weddingDate: '2026-01-20',
          venue: 'Taal Vista Hotel, Tagaytay',
          budget: 750000,
          status: 'active',
          daysUntilWedding: 81,
          progress: 45,
          vendorsBooked: 4,
          totalVendors: 10,
          lastContact: '2025-10-25',
          notes: 'Garden wedding with outdoor ceremony, loves flowers',
          preferredStyle: 'Garden',
          guestCount: 200
        },
        {
          id: '3',
          coupleName: 'Maria & James Thompson',
          email: 'maria.thompson@email.com',
          phone: '+63 917 345 6789',
          weddingDate: '2025-11-30',
          venue: 'Manila Cathedral',
          budget: 600000,
          status: 'active',
          daysUntilWedding: 30,
          progress: 90,
          vendorsBooked: 8,
          totalVendors: 8,
          lastContact: '2025-10-30',
          notes: 'Traditional church wedding, very detail-oriented',
          preferredStyle: 'Traditional',
          guestCount: 180
        },
        {
          id: '4',
          coupleName: 'Emily & Robert Lee',
          email: 'emily.lee@email.com',
          phone: '+63 917 456 7890',
          weddingDate: '2025-09-15',
          venue: 'Sofitel Manila',
          budget: 800000,
          status: 'completed',
          daysUntilWedding: -46,
          progress: 100,
          vendorsBooked: 9,
          totalVendors: 9,
          lastContact: '2025-09-20',
          notes: 'Elegant ballroom wedding, very satisfied with service',
          preferredStyle: 'Elegant',
          guestCount: 220
        },
        {
          id: '5',
          coupleName: 'Anna & Thomas Garcia',
          email: 'anna.garcia@email.com',
          phone: '+63 917 567 8901',
          weddingDate: '2026-02-14',
          venue: 'Shangri-La Boracay',
          budget: 900000,
          status: 'active',
          daysUntilWedding: 106,
          progress: 30,
          vendorsBooked: 3,
          totalVendors: 9,
          lastContact: '2025-10-20',
          notes: 'Destination beach wedding, Valentine\'s Day theme',
          preferredStyle: 'Beach',
          guestCount: 100
        }
      ];

      setClients(mockClients);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClients = () => {
    let filtered = [...clients];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.venue.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.daysUntilWedding - b.daysUntilWedding;
        case 'budget':
          return b.budget - a.budget;
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  };

  const getStatusBadge = (status: Client['status']) => {
    const config = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
    };

    const { label, color } = config[status];

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        {label}
      </span>
    );
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-gray-600';
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Management</h1>
              <p className="text-gray-600">Track and manage all your wedding clients</p>
            </div>
            <button
              onClick={() => navigate('/coordinator/clients/add')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Client
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
                <Users className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clients.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Budget</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(Math.round(clients.reduce((sum, c) => sum + c.budget, 0) / clients.length))}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(clients.reduce((sum, c) => sum + c.progress, 0) / clients.length)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
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
                  placeholder="Search clients..."
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
                  aria-label="Filter clients by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'budget' | 'progress')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                title="Sort clients by"
                aria-label="Sort clients by"
              >
                <option value="date">Sort by Date</option>
                <option value="budget">Sort by Budget</option>
                <option value="progress">Sort by Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first client'}
            </p>
            <button
              onClick={() => navigate('/coordinator/clients/add')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Add Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{client.coupleName}</h3>
                      {getStatusBadge(client.status)}
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {client.preferredStyle}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(client.weddingDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{client.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{client.guestCount} guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{formatCurrency(client.budget)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/coordinator/clients/${client.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                      aria-label="View client details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/coordinator/messages?client=${client.id}`)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Send Message"
                      aria-label="Send message to client"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{client.email}</span>
                  </div>
                </div>

                {/* Progress & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Planning Progress</span>
                      <span className="font-semibold text-gray-900">{client.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Vendors Booked</span>
                      <span className="font-semibold text-gray-900">
                        {client.vendorsBooked}/{client.totalVendors}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${(client.vendorsBooked / client.totalVendors) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Notes & Timeline */}
                <div className="flex items-start justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={getUrgencyColor(client.daysUntilWedding)}>
                      {client.daysUntilWedding < 0 
                        ? `${Math.abs(client.daysUntilWedding)} days ago` 
                        : `${client.daysUntilWedding} days`}
                    </span>
                  </div>
                </div>

                {/* Last Contact */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Last contact: {formatDate(client.lastContact)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
