import React from 'react';
import { Shield, BarChart3, Users, Settings, Database, FileText, TrendingUp, Activity, ArrowRight, CheckCircle, Store, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../../utils/cn';
import { AdminLayout, StatCard } from '../shared';

export const AdminLanding: React.FC = () => {
  return (
    <AdminLayout 
      title="Administration Console" 
      subtitle="Welcome! Centralized platform management and oversight"
    >
      <div className="container mx-auto px-4 max-w-7xl">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
              <div className="p-4 bg-blue-600 rounded-xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Administration</span>
            <span className="text-blue-400">
              {' '}Console
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Centralized platform management system. Monitor operations, manage users, and oversee business performance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/admin/dashboard"
              className={cn(
                "px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg",
                "hover:bg-blue-700 transform hover:scale-105 transition-all duration-200",
                "shadow-lg hover:shadow-xl"
              )}
            >
              Access Dashboard
            </Link>
            <Link 
              to="/admin/analytics"
              className={cn(
                "px-8 py-4 bg-slate-700 border border-slate-600 text-white font-semibold rounded-lg",
                "hover:bg-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              )}
            >
              View Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Platform Metrics
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Real-time platform performance and key business indicators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: "12,543", label: "Total Users", change: "+12.5%", color: "from-blue-500 to-cyan-500" },
              { icon: Activity, number: "1,845", label: "Active Vendors", change: "+8.2%", color: "from-green-500 to-emerald-500" },
              { icon: TrendingUp, number: "₱7.83M", label: "Monthly Revenue", change: "+15.7%", color: "from-purple-500 to-violet-500" },
              { icon: FileText, number: "3,291", label: "Total Bookings", change: "+22.1%", color: "from-rose-500 to-pink-500" }
            ].map((metric, index) => (
              <div key={index} className="group">
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-2.5 rounded-lg bg-gradient-to-br",
                      metric.color
                    )}>
                      <metric.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-green-700 text-xs font-semibold bg-green-100 px-2 py-1 rounded">{metric.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{metric.number}</div>
                  <div className="text-slate-600 text-sm font-medium">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Administrative Tools
            </h2>
            <p className="text-xl text-slate-600">
              Comprehensive platform management and control systems
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
                <div className="p-6 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
                  <div className={cn(
                    "w-12 h-12 mb-4 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    feature.color
                  )}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-3 flex items-center text-blue-600 font-medium text-sm">
                    <span>Access</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Quick Actions
            </h2>
            <p className="text-lg text-slate-600">
              Frequently accessed administrative tasks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Approve Vendors", description: "Review pending applications", count: "23 pending", color: "bg-blue-50 border-blue-200" },
              { title: "System Health", description: "Monitor performance", status: "All operational", color: "bg-green-50 border-green-200" },
              { title: "Revenue Reports", description: "Generate financials", action: "Export", color: "bg-purple-50 border-purple-200" },
              { title: "User Support", description: "Handle inquiries", count: "12 tickets", color: "bg-orange-50 border-orange-200" }
            ].map((action, index) => (
              <div key={index} className={cn(
                "p-5 rounded-lg border-2 cursor-pointer",
                "hover:shadow-md transition-all duration-200",
                action.color
              )}>
                <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{action.title}</h3>
                <p className="text-slate-600 text-xs mb-2">{action.description}</p>
                <div className="text-xs text-slate-700 font-semibold">
                  {action.count || action.status || action.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            System Status: Operational
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            All systems running normally. 99.9% uptime maintained.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/admin/system-status"
              className={cn(
                "px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg",
                "hover:bg-slate-100 transition-all duration-200 shadow-lg"
              )}
            >
              System Details
            </Link>
            <Link 
              to="/admin/emergency"
              className={cn(
                "px-6 py-3 bg-slate-800 border border-slate-700 text-white font-semibold rounded-lg",
                "hover:bg-slate-700 transition-all duration-200"
              )}
            >
              Emergency Tools
            </Link>
          </div>
        </div>
      </section>
      </div>
    </AdminLayout>
  );
};
