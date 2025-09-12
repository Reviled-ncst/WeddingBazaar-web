import React from 'react';
import { Shield, BarChart3, Users, Settings, Database, FileText, TrendingUp, Activity } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { AdminHeader } from './AdminHeader';
import { Footer } from '../../../../shared/components/layout/Footer';

export const AdminLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-slate-700 to-gray-700 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Admin
            <span className="bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
              {' '}Dashboard
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Comprehensive platform management and analytics for Wedding Bazaar. 
            Monitor platform health, manage users, and drive business growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={cn(
              "px-8 py-4 bg-gradient-to-r from-slate-700 to-gray-700 text-white font-semibold rounded-full",
              "hover:from-slate-800 hover:to-gray-800 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              Access Dashboard
            </button>
            <button className={cn(
              "px-8 py-4 border-2 border-slate-700 text-slate-700 font-semibold rounded-full",
              "hover:bg-slate-700 hover:text-white transition-all duration-200"
            )}>
              View Reports
            </button>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time insights into Wedding Bazaar platform performance and user engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "12,543", label: "Total Users", change: "+12.5%" },
              { icon: Activity, number: "1,845", label: "Active Vendors", change: "+8.2%" },
              { icon: TrendingUp, number: "$145K", label: "Monthly Revenue", change: "+15.7%" },
              { icon: FileText, number: "3,291", label: "Total Bookings", change: "+22.1%" }
            ].map((metric, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gradient-to-r from-slate-700 to-gray-700 rounded-lg">
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-green-600 text-sm font-semibold">{metric.change}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.number}</div>
                <div className="text-gray-600 text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Administrative Control Center
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools for platform management and business operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "User Management",
                description: "Manage couples, vendors, and admin accounts with full access controls",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Comprehensive platform analytics, revenue reports, and business insights",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Database,
                title: "Data Management",
                description: "Database administration, backups, and data integrity monitoring",
                color: "from-purple-500 to-violet-500"
              },
              {
                icon: Settings,
                title: "Platform Configuration",
                description: "System settings, feature flags, and platform-wide configurations",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Shield,
                title: "Security & Compliance",
                description: "Security monitoring, compliance tracking, and risk management",
                color: "from-red-500 to-pink-500"
              },
              {
                icon: FileText,
                title: "Content Moderation",
                description: "Review and moderate vendor content, listings, and user-generated content",
                color: "from-yellow-500 to-orange-500"
              }
            ].map((feature, index) => (
              <div key={index} className="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className={cn(
                  "w-12 h-12 mb-6 rounded-lg bg-gradient-to-r flex items-center justify-center",
                  feature.color
                )}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quick Administrative Actions
            </h2>
            <p className="text-xl text-gray-600">
              Common administrative tasks and system operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Approve Vendors", description: "Review pending vendor applications", count: "23 pending" },
              { title: "System Health", description: "Monitor platform performance", status: "All systems operational" },
              { title: "Revenue Reports", description: "Generate financial reports", action: "Export data" },
              { title: "User Support", description: "Handle customer inquiries", count: "12 open tickets" }
            ].map((action, index) => (
              <div key={index} className={cn(
                "p-6 bg-gray-50 rounded-xl border border-gray-200",
                "hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
              )}>
                <h3 className="font-bold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                <div className="text-xs text-slate-600 font-semibold">
                  {action.count || action.status || action.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-gray-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            System Status: All Systems Operational
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Platform is running smoothly with 99.9% uptime. All services are operational and performing optimally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={cn(
              "px-8 py-4 bg-white text-slate-700 font-semibold rounded-full",
              "hover:bg-gray-50 transform hover:scale-105 transition-all duration-200",
              "shadow-lg hover:shadow-xl"
            )}>
              View Detailed Status
            </button>
            <button className={cn(
              "px-8 py-4 border-2 border-white text-white font-semibold rounded-full",
              "hover:bg-white hover:text-slate-700 transition-all duration-200"
            )}>
              Emergency Procedures
            </button>
          </div>
        </div>
      </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
