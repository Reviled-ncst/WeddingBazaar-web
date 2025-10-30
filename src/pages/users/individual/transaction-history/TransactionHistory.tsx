import React, { useState, useEffect } from 'react';
import { CoupleHeader } from '../landing/CoupleHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  CreditCard,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Building2,
  Star,
  MapPin,
  AlertCircle,
  RefreshCw,
  FileText,
  Wallet,
} from 'lucide-react';

import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import {
  getUserTransactionHistory,
  formatAmount,
  formatDate,
  getPaymentMethodLabel,
  getPaymentTypeBadgeColor,
  getBookingStatusBadgeColor,
  groupReceiptsByMonth,
  sortReceipts,
  type TransactionReceipt,
  type TransactionStatistics,
} from '../../../../shared/services/transactionHistoryService';

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<TransactionReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<TransactionReceipt[]>([]);
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterPaymentType, setFilterPaymentType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Expanded receipt state
  const [expandedReceipts, setExpandedReceipts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      loadTransactionHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipts, searchTerm, filterPaymentMethod, filterPaymentType, sortBy, sortOrder]);

  const loadTransactionHistory = async () => {
    if (!user?.id) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Loading transaction history for user:', user.id);
      const response = await getUserTransactionHistory(user.id);
      
      if (response.success) {
        setReceipts(response.receipts);
        setStatistics(response.statistics);
        console.log('✅ Loaded', response.receipts.length, 'transactions');
      } else {
        setError(response.message || 'Failed to load transaction history');
      }
    } catch (err) {
      console.error('❌ Error loading transaction history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...receipts];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply payment method filter
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter((r) => r.paymentMethod === filterPaymentMethod);
    }

    // Apply payment type filter
    if (filterPaymentType !== 'all') {
      filtered = filtered.filter((r) => r.paymentType === filterPaymentType);
    }

    // Apply sorting
    filtered = sortReceipts(filtered, sortBy, sortOrder);

    setFilteredReceipts(filtered);
  };

  const toggleExpanded = (receiptId: string) => {
    const newExpanded = new Set(expandedReceipts);
    if (newExpanded.has(receiptId)) {
      newExpanded.delete(receiptId);
    } else {
      newExpanded.add(receiptId);
    }
    setExpandedReceipts(newExpanded);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const groupedReceipts = groupReceiptsByMonth(filteredReceipts);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <CoupleHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading transaction history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <CoupleHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Transaction History
            </h1>
          </div>
          <p className="text-gray-600 ml-16">View all your payment receipts and transaction details</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error loading transaction history</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={loadTransactionHistory}
                className="mt-2 text-red-700 font-medium text-sm hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Wallet className="w-6 h-6" />}
              title="Total Spent"
              value={statistics.totalSpentFormatted}
              gradient="from-green-500 to-emerald-500"
              delay={0.1}
            />
            <StatCard
              icon={<Receipt className="w-6 h-6" />}
              title="Total Payments"
              value={statistics.totalPayments.toString()}
              gradient="from-blue-500 to-cyan-500"
              delay={0.2}
            />
            <StatCard
              icon={<FileText className="w-6 h-6" />}
              title="Bookings"
              value={statistics.uniqueBookings.toString()}
              gradient="from-purple-500 to-pink-500"
              delay={0.3}
            />
            <StatCard
              icon={<Building2 className="w-6 h-6" />}
              title="Vendors"
              value={statistics.uniqueVendors.toString()}
              gradient="from-orange-500 to-red-500"
              delay={0.4}
            />
          </div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-6 border border-white/50"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by vendor, service, or receipt number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors font-medium"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-payment-method">
                    Payment Method
                  </label>
                  <select
                    id="filter-payment-method"
                    value={filterPaymentMethod}
                    onChange={(e) => setFilterPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Methods</option>
                    <option value="card">Card</option>
                    <option value="gcash">GCash</option>
                    <option value="paymaya">PayMaya</option>
                    <option value="grab_pay">GrabPay</option>
                  </select>
                </div>

                {/* Payment Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-payment-type">
                    Payment Type
                  </label>
                  <select
                    id="filter-payment-type"
                    value={filterPaymentType}
                    onChange={(e) => setFilterPaymentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="balance">Balance</option>
                    <option value="full">Full Payment</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-sort-by">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="filter-sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'vendor')}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="vendor">Vendor</option>
                    </select>
                    <button
                      onClick={toggleSortOrder}
                      className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Transaction List */}
        {filteredReceipts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-12 text-center border border-white/50"
          >
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transactions Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterPaymentMethod !== 'all' || filterPaymentType !== 'all'
                ? 'Try adjusting your filters'
                : 'You haven\'t made any payments yet'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Array.from(groupedReceipts.entries()).map(([month, monthReceipts], index) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-pink-500" />
                  {month}
                </h2>
                <div className="space-y-4">
                  {monthReceipts.map((receipt) => (
                    <TransactionCard
                      key={receipt.id}
                      receipt={receipt}
                      expanded={expandedReceipts.has(receipt.id)}
                      onToggle={() => toggleExpanded(receipt.id)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  gradient: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-shadow"
  >
    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
      <div className="text-white">{icon}</div>
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

// Transaction Card Component
interface TransactionCardProps {
  receipt: TransactionReceipt;
  expanded: boolean;
  onToggle: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ receipt, expanded, onToggle }) => (
  <motion.div
    layout
    className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-shadow"
  >
    <div
      className="p-6 cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Side - Vendor Info */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{receipt.vendorName}</h3>
              <p className="text-gray-600 text-sm">{receipt.serviceType}</p>
              <div className="flex items-center gap-2 mt-1">
                {receipt.vendorRating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{receipt.vendorRating.toFixed(1)}</span>
                  </div>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPaymentTypeBadgeColor(receipt.paymentType)}`}>
                  {receipt.paymentType.toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBookingStatusBadgeColor(receipt.bookingStatus)}`}>
                  {receipt.bookingStatus.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Amount and Date */}
        <div className="text-right">
          <p className="text-2xl font-bold text-pink-600">{formatAmount(receipt.amount)}</p>
          <p className="text-sm text-gray-500 mt-1">{formatDate(receipt.createdAt)}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
            <CreditCard className="w-3 h-3" />
            {getPaymentMethodLabel(receipt.paymentMethod)}
          </p>
          <button className="mt-2 text-pink-600 hover:text-pink-700 text-sm font-medium">
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>
    </div>

    {/* Expanded Details */}
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-200"
        >
          <div className="p-6 bg-gray-50/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem icon={<FileText />} label="Receipt Number" value={receipt.receiptNumber} />
              <DetailItem icon={<Calendar />} label="Event Date" value={new Date(receipt.eventDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} />
              {receipt.eventLocation && (
                <DetailItem icon={<MapPin />} label="Location" value={receipt.eventLocation} />
              )}
              <DetailItem icon={<DollarSign />} label="Total Paid" value={formatAmount(receipt.totalPaid)} />
              {receipt.remainingBalance > 0 && (
                <DetailItem icon={<AlertCircle />} label="Remaining Balance" value={formatAmount(receipt.remainingBalance)} />
              )}
            </div>
            {receipt.notes && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {receipt.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// Detail Item Component
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-pink-500 mt-0.5 w-4 h-4">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default TransactionHistory;
