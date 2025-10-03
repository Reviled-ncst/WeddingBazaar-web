import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface SimpleDSSProps {
  className?: string;
}

export const SimplifiedDSS: React.FC<SimpleDSSProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('');
  const [guestCount, setGuestCount] = useState('');

  const handleGetPlan = () => {
    navigate(`/individual/services/dss?budget=${budget}&guests=${guestCount}`);
  };

  const handleBrowseAll = () => {
    navigate('/individual/services');
  };

  return (
    <section className={`py-16 bg-gradient-to-br from-pink-50 to-white ${className}`}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        {/* Simple Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Get Your Wedding Plan
          </h2>
          <p className="text-gray-600">
            Tell us your budget and guest count, we'll find your perfect vendors
          </p>
        </div>

        {/* Simple Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Budget Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Your Budget</label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                aria-label="Select your wedding budget"
              >
                <option value="">Select budget</option>
                <option value="under-50k">Under ₱50,000</option>
                <option value="50k-150k">₱50,000 - ₱150,000</option>
                <option value="150k-300k">₱150,000 - ₱300,000</option>
                <option value="over-300k">Over ₱300,000</option>
              </select>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Number of Guests</label>
              <select 
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                aria-label="Select number of wedding guests"
              >
                <option value="">Select guest count</option>
                <option value="under-50">Under 50 guests</option>
                <option value="50-100">50-100 guests</option>
                <option value="100-200">100-200 guests</option>
                <option value="over-200">Over 200 guests</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGetPlan}
              disabled={!budget || !guestCount}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Get My Wedding Plan
            </button>
            
            <button
              onClick={handleBrowseAll}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Or Browse All Vendors
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Free to use</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Verified vendors</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Best prices</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimplifiedDSS;
