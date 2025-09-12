import React from 'react';
import { 
  Calendar,
  Clock,
  CheckCircle,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../../../../utils/cn';
import type { UIBookingStats as BookingStats } from '../types/booking.types';

interface BookingStatsCardsProps {
  stats: BookingStats | null;
  loading?: boolean;
}

export const BookingStatsCards: React.FC<BookingStatsCardsProps> = ({ 
  stats, 
  loading = false 
}) => {
  // Helper function to format currency with fallback
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      title: 'Pending Review',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      title: 'Confirmed',
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      title: 'Completed',
      value: stats?.completedBookings || 0,
      icon: CheckCircle,
      color: 'text-pink-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      title: 'Total Spent',
      value: stats?.formatted?.totalSpent || formatCurrency(stats?.totalSpent),
      icon: TrendingUp,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      title: 'Amount Paid',
      value: stats?.formatted?.totalPaid || formatCurrency(stats?.totalPaid),
      icon: CreditCard,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border border-pink-200 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-pink-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-pink-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-pink-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statsCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={index}
            className={cn(
              "bg-white rounded-2xl p-6 shadow-lg border transition-all duration-200 hover:shadow-xl hover:scale-105",
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl",
                card.bgColor,
                card.borderColor,
                "border"
              )}>
                <IconComponent className={cn("w-6 h-6", card.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
