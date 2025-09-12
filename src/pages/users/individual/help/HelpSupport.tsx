import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search,
  ChevronDown,
  ChevronRight,
  Book,
  Video,
  FileText
} from 'lucide-react';
import { CoupleHeader } from '../landing/CoupleHeader';

export const HelpSupport: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book a vendor through Wedding Bazaar?",
      answer: "Browse our vendor directory, view their profiles and portfolios, then click 'Contact Vendor' to send a message. You can also request quotes and check availability directly through their profile."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Premium subscriptions can be paid monthly or annually with additional discounts for annual plans."
    },
    {
      question: "How do I manage my wedding budget?",
      answer: "Use our budget management tool in your dashboard to set category budgets, track expenses, and monitor your spending. You can also receive alerts when approaching budget limits."
    },
    {
      question: "Can I change my wedding date after creating my profile?",
      answer: "Yes, you can update your wedding date anytime in your profile settings. This will help vendors provide more accurate availability and pricing information."
    },
    {
      question: "How do I invite my partner to manage our wedding together?",
      answer: "Go to Profile Settings and use the 'Invite Partner' feature to send an invitation email. Your partner can then create their account and join your wedding planning."
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Start Chat",
      color: "blue",
      availability: "Available 9 AM - 6 PM EST"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      color: "green",
      availability: "Response within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      color: "purple",
      availability: "Premium members only"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "Wedding Planning Guide",
      description: "Complete guide to planning your perfect wedding",
      color: "rose"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides for using our platform",
      color: "indigo"
    },
    {
      icon: FileText,
      title: "Wedding Checklists",
      description: "Downloadable checklists for every stage of planning",
      color: "emerald"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <CoupleHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-blue-500 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Help & Support
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the help you need to plan your perfect wedding
          </p>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-lg rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Support Channels */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {supportChannels.map((channel, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${channel.color}-100 to-${channel.color}-200 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <channel.icon className={`h-8 w-8 text-${channel.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{channel.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
                  <p className="text-xs text-gray-500 mb-4">{channel.availability}</p>
                  <button className={`w-full px-4 py-2 bg-gradient-to-r from-${channel.color}-500 to-${channel.color}-600 text-white rounded-xl hover:from-${channel.color}-600 hover:to-${channel.color}-700 transition-all duration-300 font-semibold`}>
                    {channel.action}
                  </button>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-all duration-300"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Helpful Resources</h2>
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${resource.color}-100 to-${resource.color}-200 rounded-xl flex items-center justify-center mb-4`}>
                    <resource.icon className={`h-6 w-6 text-${resource.color}-600`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <button className={`text-sm text-${resource.color}-600 hover:text-${resource.color}-700 font-semibold`}>
                    Learn More →
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-blue-700 hover:text-blue-800 transition-colors duration-300">
                  → Account Settings
                </a>
                <a href="#" className="block text-sm text-blue-700 hover:text-blue-800 transition-colors duration-300">
                  → Privacy Policy
                </a>
                <a href="#" className="block text-sm text-blue-700 hover:text-blue-800 transition-colors duration-300">
                  → Terms of Service
                </a>
                <a href="#" className="block text-sm text-blue-700 hover:text-blue-800 transition-colors duration-300">
                  → Vendor Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
