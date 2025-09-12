import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
  Target,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from '../landing/CoupleHeader';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  vendor: string;
  category: string;
  amount: number;
  type: 'expense' | 'payment';
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
}

export const BudgetManagement: React.FC = () => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Venue',
      budgeted: 15000,
      spent: 12000,
      icon: ({ className }: { className?: string }) => (
        <div className={cn('w-6 h-6 rounded bg-purple-500 flex items-center justify-center', className)}>
          <span className="text-xs text-white">🏛️</span>
        </div>
      ),
      color: 'purple'
    },
    {
      id: '2',
      name: 'Photography',
      budgeted: 3500,
      spent: 3500,
      icon: ({ className }: { className?: string }) => (
        <div className={cn('w-6 h-6 rounded bg-blue-500 flex items-center justify-center', className)}>
          <span className="text-xs text-white">📸</span>
        </div>
      ),
      color: 'blue'
    },
    {
      id: '3',
      name: 'Catering',
      budgeted: 8000,
      spent: 6500,
      icon: ({ className }: { className?: string }) => (
        <div className={cn('w-6 h-6 rounded bg-green-500 flex items-center justify-center', className)}>
          <span className="text-xs text-white">🍽️</span>
        </div>
      ),
      color: 'green'
    },
    {
      id: '4',
      name: 'Flowers',
      budgeted: 2000,
      spent: 1200,
      icon: ({ className }: { className?: string }) => (
        <div className={cn('w-6 h-6 rounded bg-pink-500 flex items-center justify-center', className)}>
          <span className="text-xs text-white">🌸</span>
        </div>
      ),
      color: 'pink'
    },
    {
      id: '5',
      name: 'Music/DJ',
      budgeted: 2500,
      spent: 2500,
      icon: ({ className }: { className?: string }) => (
        <div className={cn('w-6 h-6 rounded bg-indigo-500 flex items-center justify-center', className)}>
          <span className="text-xs text-white">🎵</span>
        </div>
      ),
      color: 'indigo'
    },
    {
      id: '6',
      name: 'Attire',
      budgeted: 3000,
      spent: 1800,
      icon: ({ className }: { className?: string }) => (
        <div className={cn('w-6 h-6 rounded bg-yellow-500 flex items-center justify-center', className)}>
          <span className="text-xs text-white">👗</span>
        </div>
      ),
      color: 'yellow'
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-03-10',
      vendor: 'Sunset Garden Venue',
      category: 'Venue',
      amount: 12000,
      type: 'payment',
      status: 'paid',
      description: 'Venue booking deposit and final payment'
    },
    {
      id: '2',
      date: '2024-03-08',
      vendor: 'Jessica Williams Photography',
      category: 'Photography',
      amount: 3500,
      type: 'payment',
      status: 'paid',
      description: 'Full photography package'
    },
    {
      id: '3',
      date: '2024-03-05',
      vendor: 'Gourmet Catering Co.',
      category: 'Catering',
      amount: 6500,
      type: 'payment',
      status: 'paid',
      description: 'Catering deposit (50%)'
    },
    {
      id: '4',
      date: '2024-03-15',
      vendor: 'Bella Flora',
      category: 'Flowers',
      amount: 1200,
      type: 'expense',
      status: 'pending',
      description: 'Bridal bouquet and centerpieces'
    },
    {
      id: '5',
      date: '2024-03-12',
      vendor: 'DJ Mike Entertainment',
      category: 'Music/DJ',
      amount: 2500,
      type: 'payment',
      status: 'paid',
      description: 'DJ services and sound system'
    }
  ]);

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const budgetProgress = (totalSpent / totalBudgeted) * 100;

  const getCategoryProgress = (category: BudgetCategory) => {
    return (category.spent / category.budgeted) * 100;
  };

  const getCategoryStatus = (category: BudgetCategory) => {
    const progress = getCategoryProgress(category);
    if (progress > 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (progress > 90) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (progress === 100) return { status: 'complete', color: 'text-green-600', bgColor: 'bg-green-100' };
    return { status: 'on-track', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  };

  const updateCategoryBudget = (categoryId: string, newBudget: number) => {
    setBudgetCategories(categories =>
      categories.map(cat =>
        cat.id === categoryId ? { ...cat, budgeted: newBudget } : cat
      )
    );
    setEditingCategory(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <CoupleHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Wedding Budget 💰
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Track your expenses and stay within budget
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-4">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Total Budget</p>
                    <p className="text-lg font-bold">${totalBudgeted.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  ${totalSpent.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      budgetProgress > 100 ? "bg-red-500" : budgetProgress > 90 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {budgetProgress.toFixed(1)}% of budget used
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Remaining</h3>
                {remainingBudget >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="space-y-2">
                <p className={cn(
                  "text-2xl font-bold",
                  remainingBudget >= 0 ? "text-blue-600" : "text-red-600"
                )}>
                  ${Math.abs(remainingBudget).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {remainingBudget >= 0 ? 'Available to spend' : 'Over budget'}
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {budgetCategories.length}
                </p>
                <p className="text-sm text-gray-600">Budget categories</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.length}
                </p>
                <p className="text-sm text-gray-600">Total transactions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Budget Categories */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Budget Categories</h2>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200">
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-4">
                {budgetCategories.map((category) => {
                  const progress = getCategoryProgress(category);
                  const status = getCategoryStatus(category);
                  const isEditing = editingCategory === category.id;

                  return (
                    <div key={category.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <category.icon className="text-white" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", status.bgColor, status.color)}>
                              {status.status === 'over' && 'Over Budget'}
                              {status.status === 'warning' && 'Near Limit'}
                              {status.status === 'complete' && 'Fully Spent'}
                              {status.status === 'on-track' && 'On Track'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {progress > 100 && <AlertCircle className="h-5 w-5 text-red-500" />}
                          {progress === 100 && <CheckCircle className="h-5 w-5 text-green-500" />}
                          <button
                            onClick={() => setEditingCategory(isEditing ? null : category.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Spent:</span>
                          <span className="font-semibold text-gray-900">
                            ${category.spent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Budget:</span>
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                defaultValue={category.budgeted}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newBudget = parseInt((e.target as HTMLInputElement).value);
                                    updateCategoryBudget(category.id, newBudget);
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const input = document.querySelector(`input[defaultValue="${category.budgeted}"]`) as HTMLInputElement;
                                  const newBudget = parseInt(input.value);
                                  updateCategoryBudget(category.id, newBudget);
                                }}
                                className="p-1 text-green-600 hover:text-green-700"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              ${category.budgeted.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={cn(
                              "h-3 rounded-full transition-all duration-300",
                              progress > 100 ? "bg-red-500" : progress > 90 ? "bg-yellow-500" : "bg-green-500"
                            )}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            {progress.toFixed(1)}% used
                          </span>
                          <span className={cn(
                            "font-medium",
                            category.budgeted - category.spent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ${Math.abs(category.budgeted - category.spent).toLocaleString()} {category.budgeted - category.spent >= 0 ? 'remaining' : 'over'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                <button 
                  onClick={() => {/* TODO: Add transaction modal */}}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{transaction.vendor}</h4>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              transaction.status === 'paid' ? "bg-green-100 text-green-800" :
                              transaction.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            )}>
                              {transaction.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{transaction.category}</p>
                          <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                          {transaction.description && (
                            <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-semibold",
                            transaction.type === 'expense' ? "text-red-600" : "text-green-600"
                          )}>
                            {transaction.type === 'expense' ? '-' : ''}${transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Alerts */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span>Budget Alerts</span>
                </h3>
                <div className="space-y-3">
                  {budgetCategories.filter(cat => getCategoryProgress(cat) > 90).map(cat => (
                    <div key={cat.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <cat.icon className="text-white" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-600">
                          {getCategoryProgress(cat) > 100 ? 'Over budget' : 'Near budget limit'}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-yellow-600">
                        {getCategoryProgress(cat).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                  {budgetCategories.filter(cat => getCategoryProgress(cat) <= 90).length === budgetCategories.length && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      All categories are within budget! 🎉
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
};
