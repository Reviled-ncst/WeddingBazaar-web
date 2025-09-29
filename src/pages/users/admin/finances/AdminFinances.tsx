import React, { useState } from 'react';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface FinancialMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

interface Transaction {
  id: string;
  type: 'payment' | 'payout' | 'refund' | 'fee';
  amount: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const AdminFinances: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'payment' | 'payout' | 'refund'>('all');

  const financialMetrics: FinancialMetric[] = [
    {
      title: 'Total Revenue',
      value: '₱12,394,500',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Vendor Payouts',
      value: '₱9,915,600',
      change: '+12.8%',
      trend: 'up',
      icon: Banknote,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Platform Fees',
      value: '₱2,478,900',
      change: '+18.2%',
      trend: 'up',
      icon: CreditCard,
      color: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Net Profit',
      value: '₱1,856,200',
      change: '+22.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-rose-500 to-pink-500'
    },
    {
      title: 'Refunds Issued',
      value: '₱622,800',
      change: '-8.4%',
      trend: 'down',
      icon: TrendingDown,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Avg. Transaction',
      value: '₱62,350',
      change: '+5.7%',
      trend: 'up',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: 'TXN001',
      type: 'payment',
      amount: '₱122,500',
      description: 'Wedding photography booking - Elite Studios',
      date: '2024-01-15 14:32',
      status: 'completed'
    },
    {
      id: 'TXN002',
      type: 'payout',
      amount: '₱105,840',
      description: 'Vendor payout - Elite Studios (80%)',
      date: '2024-01-15 14:35',
      status: 'completed'
    },
    {
      id: 'TXN003',
      type: 'payment',
      amount: '₱172,800',
      description: 'Venue booking - Grand Ballroom',
      date: '2024-01-15 11:28',
      status: 'pending'
    },
    {
      id: 'TXN004',
      type: 'refund',
      amount: '₱45,900',
      description: 'Cancelled catering service - Refund issued',
      date: '2024-01-14 16:45',
      status: 'completed'
    },
    {
      id: 'TXN005',
      type: 'fee',
      amount: '₱26,460',
      description: 'Platform commission - Photography booking',
      date: '2024-01-14 14:32',
      status: 'completed'
    }
  ];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-700';
      case 'payout':
        return 'bg-blue-100 text-blue-700';
      case 'refund':
        return 'bg-orange-100 text-orange-700';
      case 'fee':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const filteredTransactions = recentTransactions.filter(
    transaction => transactionFilter === 'all' || transaction.type === transactionFilter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-white">
      <AdminHeader />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-gray-900 bg-clip-text text-transparent mb-2">
                  Financial Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Monitor revenue, manage payouts, and track financial performance
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 rounded-xl bg-white/90 backdrop-blur-xl"
                  aria-label="Time Range"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {financialMetrics.map((metric, index) => {
              const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              const Icon = metric.icon;
              
              return (
                <div key={index} className="group">
                  <div className="p-6 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl bg-gradient-to-r",
                        metric.color,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-semibold",
                        metric.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      )}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{metric.change}</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-gray-600 font-medium">{metric.title}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Revenue Overview</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    Revenue
                  </button>
                  <button className="px-3 py-1 text-gray-600 hover:text-green-600 rounded-lg text-sm font-medium">
                    Payouts
                  </button>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-600">Revenue Chart Visualization</p>
                  <p className="text-sm text-gray-500">Chart integration coming soon</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Gross Revenue</span>
                    <span className="font-semibold text-green-600">₱13,386,060</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Vendor Payouts</span>
                    <span className="font-semibold text-blue-600">₱10,708,848</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-[80%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Platform Fees</span>
                    <span className="font-semibold text-purple-600">₱2,677,212</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full w-[20%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Processing Fees</span>
                    <span className="font-semibold text-orange-600">₱664,956</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full w-[5%]"></div>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Net Profit</span>
                  <span className="font-bold text-green-600 text-lg">₱2,004,696</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
              
              <div className="flex items-center space-x-4">
                <select 
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                  aria-label="Transaction Type Filter"
                >
                  <option value="all">All Types</option>
                  <option value="payment">Payments</option>
                  <option value="payout">Payouts</option>
                  <option value="refund">Refunds</option>
                </select>
                
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white transition-colors border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
                      getTransactionColor(transaction.type)
                    )}>
                      {transaction.type}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <p className="text-sm text-gray-500">{transaction.date} • {transaction.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">{transaction.amount}</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(transaction.status)
                    )}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found for the selected filter.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
