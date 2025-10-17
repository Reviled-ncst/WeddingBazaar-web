import React from 'react';
import { AdminLayout } from '../shared';
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Database,
  Server,
  Globe,
  Zap,
  Clock,
  XCircle,
  RefreshCcw,
  Shield
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime: string;
  uptime: string;
  lastChecked: string;
}

export const AdminSystemStatus: React.FC = () => {
  const services: SystemService[] = [
    {
      name: 'Web Application',
      status: 'operational',
      responseTime: '245ms',
      uptime: '99.9%',
      lastChecked: '2 minutes ago'
    },
    {
      name: 'Database',
      status: 'operational',
      responseTime: '12ms',
      uptime: '99.8%',
      lastChecked: '1 minute ago'
    },
    {
      name: 'API Services',
      status: 'operational',
      responseTime: '180ms',
      uptime: '99.7%',
      lastChecked: '3 minutes ago'
    },
    {
      name: 'File Storage',
      status: 'degraded',
      responseTime: '890ms',
      uptime: '98.5%',
      lastChecked: '5 minutes ago'
    },
    {
      name: 'Email Service',
      status: 'operational',
      responseTime: '320ms',
      uptime: '99.6%',
      lastChecked: '2 minutes ago'
    },
    {
      name: 'Payment Gateway',
      status: 'operational',
      responseTime: '450ms',
      uptime: '99.9%',
      lastChecked: '4 minutes ago'
    }
  ];

  const getStatusIcon = (status: SystemService['status']) => {
    switch (status) {
      case 'operational': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'outage': return XCircle;
    }
  };

  const getStatusColor = (status: SystemService['status']) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'outage': return 'text-red-600 bg-red-100';
    }
  };

  return (
    <AdminLayout title="System Status" subtitle="Monitor system health and performance">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                System Status
              </h1>
              <p className="text-gray-600 text-lg">
                Real-time monitoring of all platform services and infrastructure
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mb-8 p-8 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-100 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Systems Operational</h2>
                <p className="text-gray-600">Platform is running smoothly with minimal degradation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">99.7%</div>
              <div className="text-gray-600">Overall Uptime</div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {services.map((service, index) => {
            const StatusIcon = getStatusIcon(service.status);
            return (
              <div key={index} className="p-6 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn(
                      "h-6 w-6",
                      service.status === 'operational' ? 'text-green-600' :
                      service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    )} />
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    getStatusColor(service.status)
                  )}>
                    {service.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Response Time</div>
                    <div className="font-semibold text-gray-900">{service.responseTime}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Uptime</div>
                    <div className="font-semibold text-gray-900">{service.uptime}</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Last checked: {service.lastChecked}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Server Load', value: '23%', icon: Activity, color: 'from-blue-500 to-cyan-500' },
            { title: 'Database Performance', value: '98%', icon: Database, color: 'from-green-500 to-emerald-500' },
            { title: 'Network Latency', value: '12ms', icon: Globe, color: 'from-purple-500 to-violet-500' },
            { title: 'Security Score', value: '94/100', icon: Shield, color: 'from-orange-500 to-red-500' }
          ].map((metric, index) => (
            <div key={index} className="p-6 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-r",
                  metric.color
                )}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm font-semibold text-gray-900">{metric.title}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
