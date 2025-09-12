import React from 'react';
import { VendorHeader } from '../../../../shared/components/layout/VendorHeader';
import { HelpCircle, MessageCircle, Book, Video, Search, Phone, Mail, ExternalLink } from 'lucide-react';

export const VendorHelp: React.FC = () => {
  const helpTopics = [
    { title: 'Getting Started', description: 'Learn the basics of using the platform', icon: Book },
    { title: 'Managing Bookings', description: 'How to handle client bookings effectively', icon: MessageCircle },
    { title: 'Profile Optimization', description: 'Tips to improve your business profile', icon: ExternalLink },
    { title: 'Pricing & Payments', description: 'Setting up pricing and payment methods', icon: Book },
    { title: 'Client Communication', description: 'Best practices for client interactions', icon: MessageCircle },
    { title: 'Analytics & Reports', description: 'Understanding your business metrics', icon: Book }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <VendorHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Help & Support
              </h1>
              <p className="text-gray-600">Find answers and get assistance</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              placeholder="Search help articles..."
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 text-left">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Call Support</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Get immediate assistance from our team</p>
            <p className="text-green-600 font-medium">1-800-WEDDING</p>
          </button>

          <button className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 text-left">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Chat with our support team</p>
            <p className="text-blue-600 font-medium">Start Chat</p>
          </button>

          <button className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 text-left">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Send us a detailed message</p>
            <p className="text-purple-600 font-medium">support@weddingbazaar.com</p>
          </button>
        </div>

        {/* Help Topics */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpTopics.map((topic, index) => (
              <button
                key={index}
                className="text-left p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <topic.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{topic.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Video className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Video Tutorials</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="aspect-video bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Setting Up Your Profile</h3>
              <p className="text-gray-600 text-sm">Learn how to create an attractive business profile</p>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="aspect-video bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
                <Video className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Managing Your Bookings</h3>
              <p className="text-gray-600 text-sm">Tips for efficient booking management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
