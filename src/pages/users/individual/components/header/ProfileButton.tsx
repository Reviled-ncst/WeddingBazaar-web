import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../../../shared/contexts/AuthContext';

interface ProfileButtonProps {
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ 
  isDropdownOpen, 
  onToggleDropdown 
}) => {
  const { user } = useAuth();

  return (
    <button
      onClick={onToggleDropdown}
      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
        <div className="text-left hidden xl:block">
          <div className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-gray-500">
            Premium Couple
          </div>
        </div>
      </div>
      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};
