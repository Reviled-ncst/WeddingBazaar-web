import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <Link to="/individual/dashboard" className="flex items-center space-x-2 group">
      <div className="relative">
        <div className="p-1.5 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
          <Heart className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="hidden sm:block">
        <span className="text-lg font-semibold text-gray-900">
          Wedding Bazaar
        </span>
      </div>
    </Link>
  );
};
