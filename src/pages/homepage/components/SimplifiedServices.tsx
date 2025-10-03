import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, UtensilsCrossed, Music, Flower, ClipboardList } from 'lucide-react';

interface SimpleCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  examples: string[];
}

const SIMPLE_CATEGORIES: SimpleCategory[] = [
  {
    id: 'photography',
    name: 'Photography & Video',
    icon: <Camera className="h-8 w-8" />,
    description: 'Capture your special moments',
    color: 'from-blue-500 to-indigo-600',
    examples: ['Wedding Photography', 'Videography', 'Photo Booth']
  },
  {
    id: 'catering',
    name: 'Food & Catering',
    icon: <UtensilsCrossed className="h-8 w-8" />,
    description: 'Delicious food for your guests',
    color: 'from-orange-500 to-red-600',
    examples: ['Wedding Catering', 'Cake Design', 'Bar Service']
  },
  {
    id: 'entertainment',
    name: 'Music & Entertainment',
    icon: <Music className="h-8 w-8" />,
    description: 'Keep your party going',
    color: 'from-purple-500 to-pink-600',
    examples: ['DJ Services', 'Live Band', 'Sound System']
  },
  {
    id: 'decoration',
    name: 'Flowers & Decoration',
    icon: <Flower className="h-8 w-8" />,
    description: 'Beautiful decorations',
    color: 'from-green-500 to-emerald-600',
    examples: ['Bridal Bouquet', 'Centerpieces', 'Venue Decoration']
  },
  {
    id: 'planning',
    name: 'Planning & Coordination',
    icon: <ClipboardList className="h-8 w-8" />,
    description: 'We handle the details',
    color: 'from-gray-500 to-slate-600',
    examples: ['Wedding Planner', 'Day Coordinator', 'Timeline Management']
  }
];

export const SimplifiedServices: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/individual/services?category=${categoryId}`);
  };

  const handleViewAll = () => {
    navigate('/individual/services');
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Simple Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Do You Need for Your Wedding?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose what you need and we'll show you the best vendors in your area
          </p>
        </div>

        {/* Simple Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SIMPLE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-pink-200 p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {category.description}
              </p>

              {/* Examples */}
              <div className="space-y-1">
                {category.examples.slice(0, 3).map((example, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-2" />
                    {example}
                  </div>
                ))}
              </div>

              {/* Hover Arrow */}
              <div className="mt-4 flex items-center text-pink-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">Browse {category.name.toLowerCase()}</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}

          {/* "All Services" Card */}
          <div
            onClick={handleViewAll}
            className="group bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-white"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold mb-2">
              Browse All Services
            </h3>
            <p className="text-white/90 mb-4">
              See everything we offer
            </p>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-white/80">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full mr-2" />
                90+ Wedding Services
              </div>
              <div className="flex items-center text-sm text-white/80">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full mr-2" />
                Verified Vendors
              </div>
              <div className="flex items-center text-sm text-white/80">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full mr-2" />
                Best Prices
              </div>
            </div>

            <div className="mt-4 flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm">View all services</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Find All Wedding Vendors</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SimplifiedServices;
