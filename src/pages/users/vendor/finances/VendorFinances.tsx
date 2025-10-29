import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  RefreshCw,
  Banknote
} from 'lucide-react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { useAuth } from '../../../../shared/contexts/HybridAuthContext';
import { getVendorWallet, getWalletTransactions, requestWithdrawal, downloadTransactionsCSV } from '../../../../shared/services/walletService';
import type { VendorWallet, WalletTransaction, WalletSummary, EarningsBreakdown } from '../../../../shared/types/wallet.types';
import { formatCentavos } from '../../../../shared/types/wallet.types';

export const VendorFinances: React.FC = () => {
  const { user } = useAuth();
  const vendorId = user?.vendorId || user?.id || '';

  // State Management
  const [wallet, setWallet] = useState<VendorWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [breakdown, setBreakdown] = useState<EarningsBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Withdrawal Form State
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank_transfer' | 'gcash' | 'paymaya'>('gcash');
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  const [ewalletDetails, setEwalletDetails] = useState({
    number: '',
    name: ''
  });
  const [withdrawalNotes, setWithdrawalNotes] = useState('');

  // Filter State
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load wallet data
  useEffect(() => {
    loadWalletData();
  }, [vendorId]);

  const loadWalletData = async () => {
    if (!vendorId) return;

    setIsLoading(true);
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        getVendorWallet(vendorId),
        getWalletTransactions(vendorId)
      ]);

      if (walletResponse.success && walletResponse.wallet) {
        setWallet(walletResponse.wallet);
        if (walletResponse.summary) setSummary(walletResponse.summary);
        if (walletResponse.breakdown) setBreakdown(walletResponse.breakdown);
      }

      if (transactionsResponse.success && transactionsResponse.transactions) {
        setTransactions(transactionsResponse.transactions);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWalletData();
    setIsRefreshing(false);
  };

  const handleWithdrawal = async () => {
    if (!vendorId || !withdrawalAmount) return;

    const amountInCentavos = Math.round(parseFloat(withdrawalAmount) * 100);

    const withdrawalData: any = {
      amount: amountInCentavos,
      withdrawal_method: withdrawalMethod,
      notes: withdrawalNotes
    };

    if (withdrawalMethod === 'bank_transfer') {
      withdrawalData.bank_name = bankDetails.bank_name;
      withdrawalData.account_number = bankDetails.account_number;
      withdrawalData.account_name = bankDetails.account_name;
    } else {
      withdrawalData.ewallet_number = ewalletDetails.number;
      withdrawalData.ewallet_name = ewalletDetails.name;
    }

    try {
      const response = await requestWithdrawal(vendorId, withdrawalData);
      if (response.success) {
        alert('Withdrawal request submitted successfully!');
        setShowWithdrawModal(false);
        resetWithdrawalForm();
        await loadWalletData();
      } else {
        alert(response.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      alert('Error submitting withdrawal request');
    }
  };

  const resetWithdrawalForm = () => {
    setWithdrawalAmount('');
    setWithdrawalMethod('gcash');
    setBankDetails({ bank_name: '', account_number: '', account_name: '' });
    setEwalletDetails({ number: '', name: '' });
    setWithdrawalNotes('');
  };

  const handleExport = async () => {
    if (!vendorId) return;
    
    const success = await downloadTransactionsCSV(vendorId, {
      start_date: dateRange.start || undefined,
      end_date: dateRange.end || undefined
    });

    if (success) {
      alert('Transactions exported successfully!');
    } else {
      alert('Failed to export transactions');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <VendorHeader />
        <main className="pt-4 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading wallet data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <VendorHeader />
      
      <main className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Wallet className="w-8 h-8 text-pink-600" />
                Finances & Wallet
              </h1>
              <p className="text-gray-600 mt-2">Track your earnings from completed bookings</p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Earnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-75" />
              </div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Total Earnings</h3>
              <p className="text-3xl font-bold">
                {wallet ? formatCentavos(wallet.total_earnings, wallet.currency) : '₱0.00'}
              </p>
              <p className="text-xs opacity-75 mt-2">All-time revenue</p>
            </motion.div>

            {/* Available Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wallet className="w-6 h-6" />
                </div>
                <CheckCircle className="w-5 h-5 opacity-75" />
              </div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Available Balance</h3>
              <p className="text-3xl font-bold">
                {wallet ? formatCentavos(wallet.available_balance, wallet.currency) : '₱0.00'}
              </p>
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
              >
                Withdraw Funds
              </button>
            </motion.div>

            {/* Pending Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <AlertCircle className="w-5 h-5 opacity-75" />
              </div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Pending</h3>
              <p className="text-3xl font-bold">
                {wallet ? formatCentavos(wallet.pending_balance, wallet.currency) : '₱0.00'}
              </p>
              <p className="text-xs opacity-75 mt-2">Awaiting confirmation</p>
            </motion.div>

            {/* Withdrawn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <ArrowDownLeft className="w-6 h-6" />
                </div>
                <Banknote className="w-5 h-5 opacity-75" />
              </div>
              <h3 className="text-sm font-medium opacity-90 mb-1">Withdrawn</h3>
              <p className="text-3xl font-bold">
                {wallet ? formatCentavos(wallet.withdrawn_amount, wallet.currency) : '₱0.00'}
              </p>
              <p className="text-xs opacity-75 mt-2">Total payouts</p>
            </motion.div>
          </div>

          {/* Statistics Row */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* This Month */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Earnings</span>
                    <span className="font-bold text-lg">{formatCentavos(summary.current_month_earnings)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bookings</span>
                    <span className="font-bold text-lg">{summary.current_month_bookings}</span>
                  </div>
                  {summary.earnings_growth_percentage !== 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      {summary.earnings_growth_percentage > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            +{summary.earnings_growth_percentage.toFixed(1)}% from last month
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-red-600 font-medium">
                            {summary.earnings_growth_percentage.toFixed(1)}% from last month
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Average Transaction */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-4">Average Transaction</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCentavos(summary.average_transaction_amount)}
                </p>
                <p className="text-sm text-gray-500">Per completed booking</p>
              </div>

              {/* Top Category */}
              {summary.top_category && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Top Category</h3>
                  <p className="text-lg font-bold text-gray-900 mb-1">{summary.top_category}</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {formatCentavos(summary.top_category_earnings)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Earnings Breakdown */}
          {breakdown && breakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Earnings by Category</h3>
              <div className="space-y-4">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCentavos(item.earnings)} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 min-w-[60px] text-right">
                      {item.transactions} {item.transactions === 1 ? 'booking' : 'bookings'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-100 overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No transactions yet. Completed bookings will appear here.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.booking_reference}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.couple_name || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.service_name}</p>
                            <p className="text-xs text-gray-500">{transaction.service_category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 capitalize">
                              {transaction.payment_method.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                            {transaction.status === 'pending' && <Clock className="w-3 h-3" />}
                            {transaction.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCentavos(transaction.amount, transaction.currency)}
                            </span>
                            {transaction.receipt_number && (
                              <Receipt className="w-4 h-4 text-pink-600" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Withdraw Funds</h2>
              
              <div className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {wallet ? formatCentavos(wallet.available_balance) : '₱0.00'}
                  </p>
                </div>

                {/* Withdrawal Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['gcash', 'paymaya', 'bank_transfer'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setWithdrawalMethod(method as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          withdrawalMethod === method
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {method === 'bank_transfer' ? 'Bank' : method.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method-specific Fields */}
                {withdrawalMethod === 'bank_transfer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={bankDetails.bank_name}
                        onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={bankDetails.account_number}
                        onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={bankDetails.account_name}
                        onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {withdrawalMethod.toUpperCase()} Number
                      </label>
                      <input
                        type="text"
                        value={ewalletDetails.number}
                        onChange={(e) => setEwalletDetails({ ...ewalletDetails, number: e.target.value })}
                        placeholder="09XX XXX XXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={ewalletDetails.name}
                        onChange={(e) => setEwalletDetails({ ...ewalletDetails, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={withdrawalNotes}
                    onChange={(e) => setWithdrawalNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawal}
                  disabled={!withdrawalAmount}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
