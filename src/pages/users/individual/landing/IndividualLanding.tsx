import React, { useState } from 'react';
import { Heart, Search, Calendar, MessageCircle, Star, Camera, Music, Utensils, Users, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../utils/cn';
import { CoupleHeader } from './CoupleHeader';
import { Footer } from '../../../../shared/components/layout/Footer';

export const IndividualLanding: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  return (
    <div className="min-h-screen flex flex-col">
      <CoupleHeader />
      <main className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mr-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-rose-600 uppercase tracking-wide">Welcome back!</h2>
                  <p className="text-gray-600">Let's continue planning your dream wedding</p>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Wedding
                <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  {' '}Journey
                </span>
                <br />Continues
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Track your progress, connect with vendors, and bring your vision to life. 
                Your perfect day is closer than you think.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className={cn(
                  "px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-full",
                  "hover:from-rose-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200",
                  "shadow-lg hover:shadow-xl"
                )}>
                  Continue Planning
                </button>
                <button className={cn(
                  "px-6 py-3 border-2 border-rose-500 text-rose-500 font-semibold rounded-full",
                  "hover:bg-rose-500 hover:text-white transition-all duration-200"
                )}>
                  Browse New Vendors
                </button>
              </div>
            </div>

            {/* Right Column - Quick Stats Dashboard */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Wedding Dashboard</h3>
              
              {/* Progress Overview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-rose-600">68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full w-[68%]"></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-rose-50 rounded-xl">
                  <div className="text-2xl font-bold text-rose-600">12</div>
                  <div className="text-sm text-gray-600">Vendors Booked</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-600">Days to Go</div>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Upcoming Tasks</h4>
                <div className="space-y-2">
                  {[
                    { task: "Final cake tasting", due: "Tomorrow", urgent: true },
                    { task: "Confirm guest count", due: "This week", urgent: false },
                    { task: "Pick up wedding rings", due: "Next week", urgent: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", item.urgent ? "bg-red-500" : "bg-yellow-500")}></div>
                        <span className="text-sm text-gray-700">{item.task}</span>
                      </div>
                      <span className={cn("text-xs font-medium", item.urgent ? "text-red-600" : "text-gray-500")}>
                        {item.due}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <p className="text-lg text-gray-600">
              Jump right into what you need to do today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Grid,
                title: "Find Services",
                description: "Browse all wedding services",
                color: "from-rose-500 to-pink-500",
                action: "Explore Services",
                link: "/individual/services"
              },
              {
                icon: Search,
                title: "Wedding Planning",
                description: "Manage your planning checklist",
                color: "from-blue-500 to-purple-500",
                action: "View Planning",
                link: "/individual/planning"
              },
              {
                icon: Calendar,
                title: "Budget Manager",
                description: "Track wedding expenses",
                color: "from-green-500 to-teal-500",
                action: "Manage Budget",
                link: "/individual/budget"
              },
              {
                icon: MessageCircle,
                title: "Guest Management",
                description: "Manage your guest list",
                color: "from-orange-500 to-red-500",
                action: "Manage Guests",
                link: "/individual/guests"
              }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={cn(
                  "bg-white rounded-xl border border-gray-200 p-6 text-center group block",
                  "hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-r flex items-center justify-center",
                  "group-hover:scale-110 transition-transform duration-200",
                  action.color
                )}>
                  <action.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{action.description}</p>
                <span className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors">
                  {action.action} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Your Perfect Day
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform connects you with the best wedding professionals and tools to make your special day unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Search,
                title: "Find Perfect Vendors",
                description: "Browse hundreds of verified wedding professionals in your area",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: Calendar,
                title: "Plan & Coordinate",
                description: "Manage timelines, appointments, and wedding day logistics",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: MessageCircle,
                title: "Direct Communication",
                description: "Chat directly with vendors and coordinate seamlessly",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Star,
                title: "Reviews & Ratings",
                description: "Make informed decisions with authentic couple reviews",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={cn(
                  "w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r flex items-center justify-center",
                  "group-hover:scale-110 transition-transform duration-200",
                  feature.color
                )}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Popular Wedding Services
              </h2>
              <p className="text-lg text-gray-600">
                Discover the most sought-after wedding professionals
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'grid' ? "bg-rose-100 text-rose-600" : "text-gray-400 hover:text-gray-600"
                )}
                title="Grid view"
                aria-label="Switch to grid view"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === 'list' ? "bg-rose-100 text-rose-600" : "text-gray-400 hover:text-gray-600"
                )}
                title="List view"
                aria-label="Switch to list view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {['all', 'photography', 'catering', 'venues', 'music', 'planning'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  activeCategory === category
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
          )}>
            {[
              { icon: Camera, name: "Photography", count: "150+ vendors", price: "From $1,200", rating: 4.8 },
              { icon: Music, name: "Entertainment", count: "80+ vendors", price: "From $800", rating: 4.7 },
              { icon: Utensils, name: "Catering", count: "120+ vendors", price: "From $45/person", rating: 4.9 },
              { icon: Users, name: "Planning", count: "50+ vendors", price: "From $2,000", rating: 4.8 }
            ].map((category, index) => (
              <div key={index} className={cn(
                "bg-white rounded-xl border border-gray-200 p-6",
                "hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer",
                viewMode === 'list' && "flex items-center space-x-4"
              )}>
                <div className={cn(
                  "flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 mb-4",
                  viewMode === 'grid' ? "w-12 h-12" : "w-16 h-16 mb-0"
                )}>
                  <category.icon className={cn(viewMode === 'grid' ? "h-6 w-6" : "h-8 w-8")} />
                </div>
                <div className={cn(viewMode === 'list' && "flex-1")}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-600">{category.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{category.count}</p>
                  <p className="text-sm font-semibold text-rose-600">{category.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Your Recent Activity
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {[
                  {
                    type: "booking",
                    title: "Confirmed booking with Sarah's Photography",
                    time: "2 hours ago",
                    icon: Camera,
                    color: "text-green-600 bg-green-50"
                  },
                  {
                    type: "message",
                    title: "New message from DJ Mike about music selection",
                    time: "5 hours ago",
                    icon: MessageCircle,
                    color: "text-blue-600 bg-blue-50"
                  },
                  {
                    type: "review",
                    title: "Left a review for Bella's Catering Services",
                    time: "1 day ago",
                    icon: Star,
                    color: "text-yellow-600 bg-yellow-50"
                  },
                  {
                    type: "calendar",
                    title: "Scheduled venue walkthrough for next weekend",
                    time: "2 days ago",
                    icon: Calendar,
                    color: "text-purple-600 bg-purple-50"
                  }
                ].map((activity, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", activity.color)}>
                        <activity.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <button className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Wedding Journey?
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Join thousands of couples who've planned their dream weddings with Wedding Bazaar
          </p>
          <button className={cn(
            "px-8 py-4 bg-white text-rose-500 font-semibold rounded-full",
            "hover:bg-gray-50 transform hover:scale-105 transition-all duration-200",
            "shadow-lg hover:shadow-xl"
          )}>
            Get Started Today
          </button>
        </div>
      </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
