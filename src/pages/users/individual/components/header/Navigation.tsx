import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  DollarSign, 
  Users, 
  Calendar,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface NavigationProps {
  onMessengerOpen: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onMessengerOpen }) => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/individual/dashboard', 
      icon: Heart,
      description: 'Your wedding overview'
    },
    { 
      name: 'Services', 
      href: '/individual/services', 
      icon: Search,
      description: 'Browse wedding vendors'
    },
    { 
      name: 'Timeline', 
      href: '/individual/timeline', 
      icon: Clock,
      description: 'Wedding planning timeline'
    },
    { 
      name: 'For You', 
      href: '/individual/foryou', 
      icon: Sparkles,
      description: 'Personalized content'
    },
    { 
      name: 'Budget', 
      href: '/individual/budget', 
      icon: DollarSign,
      description: 'Track expenses'
    },
    { 
      name: 'Guests', 
      href: '/individual/guests', 
      icon: Users,
      description: 'Manage RSVPs'
    },
    { 
      name: 'Bookings', 
      href: '/individual/bookings', 
      icon: Calendar,
      description: 'View appointments'
    },
  ];

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav className="hidden lg:flex items-center space-x-6">
      {navigation.map((item) => {
        const isActive = isActivePage(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${isActive 
                ? 'bg-rose-100 text-rose-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
            title={item.description}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
      
      {/* Messages Button - Navigate to Messages Page */}
      <Link
        to="/individual/messages"
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
        title="View messages"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Messages</span>
      </Link>
    </nav>
  );
};
