import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Download,
  Upload,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  side: 'bride' | 'groom';
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  dietaryRestrictions?: string;
  plusOne?: boolean;
  table?: number;
  notes?: string;
}

export const GuestManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSide, setSelectedSide] = useState('all');
  const [selectedRsvp, setSelectedRsvp] = useState('all');

  const [guests] = useState<Guest[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, City, State 12345',
      side: 'bride',
      rsvpStatus: 'confirmed',
      dietaryRestrictions: 'Vegetarian',
      plusOne: true,
      table: 1,
      notes: 'College friend'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 234-5678',
      side: 'groom',
      rsvpStatus: 'pending',
      plusOne: false,
      notes: 'Work colleague'
    }
  ]);

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSide = selectedSide === 'all' || guest.side === selectedSide;
    const matchesRsvp = selectedRsvp === 'all' || guest.rsvpStatus === selectedRsvp;
    
    return matchesSearch && matchesSide && matchesRsvp;
  });

  const guestStats = {
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    plusOnes: guests.filter(g => g.plusOne && g.rsvpStatus === 'confirmed').length
  };

  const getRsvpStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRsvpIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'declined': return <UserX className="h-4 w-4 text-red-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <CoupleHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Guest Management 👥
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage your wedding guest list and RSVPs
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-4">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Total Guests</p>
                    <p className="text-lg font-bold">{guestStats.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmed</h3>
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{guestStats.confirmed}</p>
              <p className="text-sm text-gray-600">guests attending</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{guestStats.pending}</p>
              <p className="text-sm text-gray-600">awaiting response</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Plus Ones</h3>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{guestStats.plusOnes}</p>
              <p className="text-sm text-gray-600">additional guests</p>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search guests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedSide}
                    onChange={(e) => setSelectedSide(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Filter by side"
                  >
                    <option value="all">All Sides</option>
                    <option value="bride">Bride's Side</option>
                    <option value="groom">Groom's Side</option>
                  </select>
                  <select
                    value={selectedRsvp}
                    onChange={(e) => setSelectedRsvp(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Filter by RSVP status"
                  >
                    <option value="all">All RSVPs</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
                    title="Add new guest"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Guest</span>
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
                    title="Import guest list"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Import</span>
                  </button>
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
                    title="Export guest list"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Guest List */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 border-b border-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guest</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Side</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">RSVP</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plus One</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-purple-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {guest.firstName} {guest.lastName}
                          </div>
                          {guest.notes && (
                            <div className="text-sm text-gray-500">{guest.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2" />
                            {guest.email}
                          </div>
                          {guest.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2" />
                              {guest.phone}
                            </div>
                          )}
                          {guest.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-3 w-3 mr-2" />
                              {guest.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          guest.side === 'bride' ? "bg-pink-100 text-pink-800" : "bg-blue-100 text-blue-800"
                        )}>
                          {guest.side === 'bride' ? "Bride's Side" : "Groom's Side"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getRsvpIcon(guest.rsvpStatus)}
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getRsvpStatusColor(guest.rsvpStatus)
                          )}>
                            {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          guest.plusOne ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        )}>
                          {guest.plusOne ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            title="Edit guest"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title="Delete guest"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
