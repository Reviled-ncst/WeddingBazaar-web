import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Settings, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Wallet,
  Camera,
  HelpCircle, 
  Lightbulb, 
  Shield,
  Star,
  Users,
  Globe,
  CreditCard,
  Award,
  TrendingUp,
  LogOut,
  Building,
  Phone,
  Gift
} from 'lucide-react';
import { useAuth } from '../../../../../../shared/contexts/HybridAuthContext';

interface VendorProfileDropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionOpen?: () => void;
}

export const VendorProfileDropdownModal: React.FC<VendorProfileDropdownModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionOpen
}) => {
  const { user, logout } = useAuth();

  // Mock subscription data - replace with actual subscription context
  const currentPlan = {
    name: 'Premium',
    tier: 'premium',
    features: ['Unlimited Services', 'Featured Listings', 'Advanced Analytics'],
    daysUntilRenewal: 12
  };

  const profileMenuItems = [
    {
      category: 'Business Management',
      items: [
        {
          icon: Building,
          label: 'Business Profile',
          href: '/vendor/profile',
          description: 'Edit your business information',
          highlight: false
        },
        {
          icon: Camera,
          label: 'Services & Portfolio',
          href: '/vendor/services',
          description: 'Manage your service offerings',
          highlight: false
        },
        {
          icon: Calendar,
          label: 'Booking Management',
          href: '/vendor/bookings',
          description: 'View and manage bookings',
          highlight: false
        },
        {
          icon: MessageSquare,
          label: 'Client Communications',
          href: '/vendor/messages',
          description: 'Chat with potential clients',
          highlight: false
        }
      ]
    },
    {
      category: 'Business Insights',
      items: [
        {
          icon: BarChart3,
          label: 'Analytics Dashboard',
          href: '/vendor/analytics',
          description: 'Performance metrics & insights',
          highlight: false
        },
        {
          icon: Wallet,
          label: 'Financial Management',
          href: '/vendor/finances',
          description: 'Earnings, payments & invoices',
          highlight: false
        },
        {
          icon: TrendingUp,
          label: 'Market Insights',
          href: '/vendor/market-insights',
          description: 'Industry trends & competitor analysis',
          highlight: true,
          badge: 'PRO'
        }
      ]
    },
    {
      category: 'Growth & Marketing',
      items: [
        {
          icon: Star,
          label: 'Featured Listings',
          href: '/vendor/featured',
          description: 'Boost your visibility',
          highlight: true,
          badge: 'PREMIUM'
        },
        {
          icon: Globe,
          label: 'SEO & Online Presence',
          href: '/vendor/seo',
          description: 'Optimize your online visibility',
          highlight: true,
          badge: 'PREMIUM'
        },
        {
          icon: Users,
          label: 'Team Management',
          href: '/vendor/team',
          description: 'Manage your team members',
          highlight: true,
          badge: 'PRO'
        },
        {
          icon: Award,
          label: 'Reviews & Reputation',
          href: '/vendor/reviews',
          description: 'Manage customer reviews',
          highlight: false
        }
      ]
    },
    {
      category: 'Account & Settings',
      items: [
        {
          icon: Settings,
          label: 'Account Settings',
          href: '/vendor/settings',
          description: 'Privacy & notification preferences',
          highlight: false
        },
        {
          icon: Shield,
          label: 'Security & Privacy',
          href: '/vendor/security',
          description: 'Password & security settings',
          highlight: false
        },
        {
          icon: Phone,
          label: 'Contact Information',
          href: '/vendor/contact',
          description: 'Update your contact details',
          highlight: false
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          href: '/vendor/help',
          description: 'Get assistance & tutorials',
          highlight: false
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in slide-in-from-top-2 duration-300 max-h-[85vh] overflow-y-auto">
      {/* Vendor Info Header */}
      <div className="px-4 py-4 border-b border-gray-100/50 bg-gradient-to-r from-rose-50/50 to-pink-50/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 via-pink-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building className="h-7 w-7 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-400 border-2 border-white rounded-full shadow-sm">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg text-gray-900 truncate">
              {`${user?.firstName}'s Business` || 'Your Business'}
            </div>
            <div className="text-sm text-gray-600 truncate mb-2">{user?.email}</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                <Crown className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-700 font-bold">{currentPlan.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {currentPlan.daysUntilRenewal} days left
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management Section */}
      <div className="px-4 py-3 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">Subscription Management</h3>
          <button
            onClick={() => {
              onSubscriptionOpen?.();
              onClose();
            }}
            className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-bold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
          >
            Manage
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onSubscriptionOpen?.();
              onClose();
            }}
            className="flex items-center space-x-2 p-2 bg-white/60 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-yellow-200"
          >
            <Crown className="h-4 w-4 text-yellow-600 group-hover:text-yellow-700" />
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-900">Upgrade Plan</div>
              <div className="text-xs text-gray-500">Get more features</div>
            </div>
          </button>
          <Link
            to="/vendor/billing"
            onClick={onClose}
            className="flex items-center space-x-2 p-2 bg-white/60 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-green-200"
          >
            <CreditCard className="h-4 w-4 text-green-600 group-hover:text-green-700" />
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-900">Billing</div>
              <div className="text-xs text-gray-500">Payment history</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="py-2 px-1">
        {profileMenuItems.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-4 last:mb-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {category.category}
              </h3>
            </div>
            <div className="space-y-1">
              {category.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r rounded-xl transition-all duration-300 group mb-1 border border-transparent ${
                    item.highlight 
                      ? 'hover:from-yellow-50 hover:to-orange-50 hover:text-yellow-700 hover:border-yellow-200/50' 
                      : 'hover:from-rose-50 hover:to-pink-50 hover:text-rose-700 hover:border-rose-200/50'
                  }`}
                  onClick={onClose}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    item.highlight 
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-rose-100 group-hover:to-pink-100'
                  }`}>
                    <item.icon className={`h-4 w-4 transition-all duration-300 ${
                      item.highlight 
                        ? 'text-yellow-600 group-hover:text-yellow-700' 
                        : 'text-gray-600 group-hover:text-rose-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="font-semibold text-sm truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          item.badge === 'PRO' 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                            : item.badge === 'PREMIUM'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs transition-colors duration-300 truncate ${
                      item.highlight 
                        ? 'text-gray-500 group-hover:text-yellow-600' 
                        : 'text-gray-500 group-hover:text-rose-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-slate-50/50">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => {
              // Handle quick tutorial
              onClose();
            }}
            className="flex items-center space-x-2 p-2 bg-white/60 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200"
          >
            <Lightbulb className="h-4 w-4 text-blue-600 group-hover:text-blue-700" />
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-900">Quick Tutorial</div>
              <div className="text-xs text-gray-500">Get started tips</div>
            </div>
          </button>
          <Link
            to="/vendor/promotions"
            onClick={onClose}
            className="flex items-center space-x-2 p-2 bg-white/60 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-purple-200"
          >
            <Gift className="h-4 w-4 text-purple-600 group-hover:text-purple-700" />
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-900">Promotions</div>
              <div className="text-xs text-gray-500">Special offers</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 pt-1">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full group rounded-xl"
        >
          <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
            <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-semibold text-sm">Sign Out</div>
            <div className="text-xs text-gray-500 truncate">Secure logout from your business account</div>
          </div>
        </button>
      </div>
    </div>
  );
};
