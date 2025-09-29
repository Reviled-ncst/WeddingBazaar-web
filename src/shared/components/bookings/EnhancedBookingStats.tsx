// Enhanced Booking Statistics Dashboard
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  pendingQuotes: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  monthlyGrowth: number;
  revenueGrowth: number;
  upcomingEvents: number;
  overduePayments?: number;
  totalClients?: number;
}

interface EnhancedBookingStatsProps {
  stats: BookingStats;
  userType: 'individual' | 'vendor' | 'admin';
  loading?: boolean;
  className?: string;
}

export const EnhancedBookingStats: React.FC<EnhancedBookingStatsProps> = ({
  stats,
  userType,
  loading = false,
  className
}) => {
  const statCards = React.useMemo(() => {
    const baseCards = [
      {
        id: 'total-bookings',
        title: 'Total Bookings',
        value: stats.totalBookings,
        format: 'number',
        icon: Calendar,
        color: 'blue',
        trend: stats.monthlyGrowth,
        description: 'All time bookings'
      },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: stats.totalRevenue,
        format: 'currency',
        icon: DollarSign,
        color: 'green',
        trend: stats.revenueGrowth,
        description: 'Total earnings'
      },
      {
        id: 'confirmed',
        title: 'Confirmed',
        value: stats.confirmedBookings,
        format: 'number',
        icon: CheckCircle,
        color: 'emerald',
        description: 'Ready for service'
      },
      {
        id: 'pending',
        title: 'Pending Quotes',
        value: stats.pendingQuotes,
        format: 'number',
        icon: Clock,
        color: 'yellow',
        description: 'Awaiting response'
      }
    ];

    // Add user-type specific cards
    if (userType === 'vendor') {
      baseCards.push(
        {
          id: 'clients',
          title: 'Total Clients',
          value: stats.totalClients || 0,
          format: 'number',
          icon: Users,
          color: 'purple',
          description: 'Unique clients served'
        },
        {
          id: 'average-value',
          title: 'Avg. Booking Value',
          value: stats.averageBookingValue,
          format: 'currency',
          icon: TrendingUp,
          color: 'indigo',
          description: 'Per booking average'
        }
      );
    } else if (userType === 'individual') {
      baseCards.push(
        {
          id: 'upcoming',
          title: 'Upcoming Events',
          value: stats.upcomingEvents,
          format: 'number',
          icon: Calendar,
          color: 'pink',
          description: 'Events this month'
        },
        {
          id: 'completed',
          title: 'Completed',
          value: stats.completedBookings,
          format: 'number',
          icon: CheckCircle,
          color: 'green',
          description: 'Successfully finished'
        }
      );
    } else if (userType === 'admin') {
      baseCards.push(
        {
          id: 'overdue',
          title: 'Overdue Payments',
          value: stats.overduePayments || 0,
          format: 'number',
          icon: AlertCircle,
          color: 'red',
          description: 'Require attention'
        },
        {
          id: 'cancelled',
          title: 'Cancelled',
          value: stats.cancelledBookings,
          format: 'number',
          icon: AlertCircle,
          color: 'gray',
          description: 'Cancelled bookings'
        }
      );
    }

    return baseCards;
  }, [stats, userType]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `₱${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900' },
      green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', text: 'text-green-900' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', text: 'text-emerald-900' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', text: 'text-yellow-900' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', text: 'text-purple-900' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', text: 'text-indigo-900' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600', text: 'text-pink-900' },
      red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-900' },
      gray: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600', text: 'text-gray-900' }
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="w-16 h-6 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="w-20 h-8 bg-gray-200 rounded" />
              <div className="w-32 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {statCards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const IconComponent = card.icon;
        
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
              "bg-white rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transition-all duration-300",
              colors.bg,
              colors.border
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-white shadow-md"
              )}>
                <IconComponent className={cn("h-6 w-6", colors.icon)} />
              </div>
              
              {/* Trend Indicator */}
              {card.trend !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                  card.trend >= 0 
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                )}>
                  {card.trend >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(card.trend)}%</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <div className={cn("text-2xl font-bold", colors.text)}>
                {formatValue(card.value, card.format)}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {card.title}
              </div>
              <div className="text-xs text-gray-500">
                {card.description}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
