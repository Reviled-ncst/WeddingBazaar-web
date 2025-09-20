import React from 'react';
import { Shield, BarChart3, Users, Settings, Database, FileText, TrendingUp, Activity, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../utils/cn';
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';
import { Footer } from '../../../../shared/components/layout/Footer';

export const AdminLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1">
        <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-pink-50/20 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-rose-50/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-rose-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Admin</span>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 bg-clip-text text-transparent">
              {' '}Dashboard
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Comprehensive platform management and analytics for Wedding Bazaar. 
            Monitor platform health, manage users, and drive business growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/admin/dashboard"
              className={cn(
                "px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl",
                "hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300",
                "shadow-xl hover:shadow-2xl border border-white/20"
              )}
            >
              Access Dashboard
            </Link>
            <Link 
              to="/admin/analytics"
              className={cn(
                "px-8 py-4 bg-white/90 backdrop-blur-xl border-2 border-blue-200 text-blue-700 font-semibold rounded-2xl",
                "hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              )}
            >
              View Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Platform Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time insights into Wedding Bazaar platform performance and user engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "12,543", label: "Total Users", change: "+12.5%", color: "from-blue-500 to-cyan-500" },
              { icon: Activity, number: "1,845", label: "Active Vendors", change: "+8.2%", color: "from-green-500 to-emerald-500" },
              { icon: TrendingUp, number: "$145K", label: "Monthly Revenue", change: "+15.7%", color: "from-purple-500 to-violet-500" },
              { icon: FileText, number: "3,291", label: "Total Bookings", change: "+22.1%", color: "from-rose-500 to-pink-500" }
            ].map((metric, index) => (
              <div key={index} className="group">
                <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "p-3 rounded-2xl bg-gradient-to-r",
                      metric.color,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">{metric.change}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metric.number}</div>
                  <div className="text-gray-600 font-medium">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-rose-50/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
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
                color: "from-blue-500 to-cyan-500",
                link: "/admin/users"
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Comprehensive platform analytics, revenue reports, and business insights",
                color: "from-green-500 to-emerald-500",
                link: "/admin/analytics"
              },
              {
                icon: Database,
                title: "Data Management",
                description: "Database administration, backups, and data integrity monitoring",
                color: "from-purple-500 to-violet-500",
                link: "/admin/database"
              },
              {
                icon: Settings,
                title: "Platform Configuration",
                description: "System settings, feature flags, and platform-wide configurations",
                color: "from-orange-500 to-red-500",
                link: "/admin/settings"
              },
              {
                icon: Shield,
                title: "Security & Compliance",
                description: "Security monitoring, compliance tracking, and risk management",
                color: "from-red-500 to-pink-500",
                link: "/admin/security"
              },
              {
                icon: FileText,
                title: "Content Moderation",
                description: "Review and moderate vendor content, listings, and user-generated content",
                color: "from-yellow-500 to-orange-500",
                link: "/admin/content"
              }
            ].map((feature, index) => (
              <Link key={index} to={feature.link} className="group">
                <div className="p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className={cn(
                    "w-14 h-14 mb-6 rounded-2xl bg-gradient-to-r flex items-center justify-center",
                    feature.color,
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Manage</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:30px_30px]"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            System Status: All Systems Operational
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Platform is running smoothly with 99.9% uptime. All services are operational and performing optimally.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/admin/system-status"
              className={cn(
                "px-8 py-4 bg-white/90 backdrop-blur-xl text-blue-700 font-semibold rounded-2xl",
                "hover:bg-white transform hover:scale-105 transition-all duration-300",
                "shadow-xl hover:shadow-2xl border border-white/20"
              )}
            >
              View Detailed Status
            </Link>
            <Link 
              to="/admin/emergency"
              className={cn(
                "px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-semibold rounded-2xl",
                "hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl"
              )}
            >
              Emergency Procedures
            </Link>
          </div>
        </div>
      </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
