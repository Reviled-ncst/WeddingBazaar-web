import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../shared';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lock,
  Key,
  Eye,
  Activity,
  Server,
  Users,
  Download,
  RefreshCcw,
  Settings,
  FileText
} from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface SecurityMetric {
  title: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  icon: any;
  description: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high';
  user: string;
  details: string;
}

export const AdminSecurity: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'logs' | 'settings' | 'compliance'>('overview');
  const [loading, setLoading] = useState(true);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      console.log('🔒 [AdminSecurity] Fetching security data from API');
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch metrics, logs, and sessions in parallel
      const [metricsRes, logsRes, sessionsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/security/metrics`, { headers }),
        fetch(`${apiUrl}/api/admin/security/logs`, { headers }),
        fetch(`${apiUrl}/api/admin/security/sessions`, { headers })
      ]);
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        console.log('✅ [AdminSecurity] Metrics loaded:', metricsData.data);
        
        // Transform API data to SecurityMetric format
        const metrics: SecurityMetric[] = [
          {
            title: 'System Security Score',
            value: `${metricsData.data.securityScore}/100`,
            status: metricsData.data.status,
            icon: Shield,
            description: 'Overall security health assessment'
          },
          {
            title: 'Active Sessions',
            value: metricsData.data.activeSessions.toLocaleString(),
            status: 'good',
            icon: Users,
            description: 'Currently authenticated user sessions'
          },
          {
            title: 'Failed Login Attempts',
            value: metricsData.data.failedLoginAttempts.toString(),
            status: metricsData.data.failedLoginAttempts > 10 ? 'warning' : 'good',
            icon: Lock,
            description: 'Failed authentication attempts (last 24h)'
          },
          {
            title: 'Security Alerts',
            value: metricsData.data.securityAlerts.toString(),
            status: metricsData.data.securityAlerts > 0 ? 'warning' : 'good',
            icon: AlertTriangle,
            description: 'Active security incidents requiring attention'
          }
        ];
        setSecurityMetrics(metrics);
      }
      
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        console.log('✅ [AdminSecurity] Logs loaded:', logsData.data?.length || 0);
        setSecurityLogs(logsData.data || []);
      }
      
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        console.log('✅ [AdminSecurity] Sessions loaded:', sessionsData.data?.length || 0);
        setActiveSessions(sessionsData.data || []);
      }
      
    } catch (error) {
      console.error('❌ [AdminSecurity] Error loading security data:', error);
      // Set default fallback data
      setSecurityMetrics([
        {
          title: 'System Security Score',
          value: 'N/A',
          status: 'warning',
          icon: Shield,
          description: 'Unable to fetch security data'
        },
        {
          title: 'Active Sessions',
          value: 'N/A',
          status: 'warning',
          icon: Users,
          description: 'Data unavailable'
        },
        {
          title: 'Failed Login Attempts',
          value: 'N/A',
          status: 'warning',
          icon: Lock,
          description: 'Data unavailable'
        },
        {
          title: 'Security Alerts',
          value: 'N/A',
          status: 'warning',
          icon: AlertTriangle,
          description: 'Data unavailable'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good': return 'from-green-500 to-emerald-500';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'critical': return 'from-red-500 to-pink-500';
    }
  };

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
    }
  };

  const getSeverityColor = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <AdminLayout title="Security & Compliance" subtitle="Monitor security events and system integrity">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header - Wedding Theme */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Security & Compliance
              </h1>
              <p className="text-gray-600 text-lg">
                Monitor platform security, manage access controls, and ensure compliance standards
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/90 backdrop-blur-xl border-2 border-pink-200/50 rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 text-gray-700">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl transition-all hover:scale-105 hover:shadow-lg flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Metrics - Wedding Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {securityMetrics.map((metric, index) => {
            const StatusIcon = getStatusIcon(metric.status);
            return (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative p-6 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-r shadow-lg",
                      getStatusColor(metric.status)
                    )}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <StatusIcon className={cn(
                      "h-5 w-5",
                      metric.status === 'good' ? 'text-green-500' : 
                      metric.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    )} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">{metric.title}</div>
                  <div className="text-xs text-gray-600">{metric.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation - Wedding Theme */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/90 backdrop-blur-xl rounded-2xl p-1 border border-white/60 shadow-lg">
            {[
              { id: 'overview', label: 'Security Overview', icon: Shield },
              { id: 'logs', label: 'Security Logs', icon: Activity },
              { id: 'settings', label: 'Security Settings', icon: Settings },
              { id: 'compliance', label: 'Compliance', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200",
                  selectedTab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Status */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Security Status Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Authentication Security</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Two-Factor Authentication</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Password Policies</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Session Management</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Data Protection</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data Encryption</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Backup Security</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Access Controls</span>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Network Security</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">SSL/TLS Certificates</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Firewall Protection</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">DDoS Protection</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'logs' && (
          <div className="space-y-6">
            {/* Security Logs */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Security Events
                </h3>
                <div className="flex gap-2">
                  <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                    <option>All Events</option>
                    <option>Authentication</option>
                    <option>Authorization</option>
                    <option>Data Access</option>
                  </select>
                  <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getSeverityColor(log.severity)
                      )}>
                        {log.severity.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{log.event}</h4>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                      <p className="text-xs text-gray-500">User: {log.user}</p>
                    </div>
                    <button className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="space-y-6">
            {/* Security Settings */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Security Configuration
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Password Policies</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Minimum password length</span>
                        <input type="number" value="8" className="w-16 px-2 py-1 border border-gray-200 rounded text-sm" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Require special characters</span>
                        <input type="checkbox" checked className="rounded" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Password expiry (days)</span>
                        <input type="number" value="90" className="w-16 px-2 py-1 border border-gray-200 rounded text-sm" />
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Session Management</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Session timeout (minutes)</span>
                        <input type="number" value="30" className="w-16 px-2 py-1 border border-gray-200 rounded text-sm" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Remember me duration (days)</span>
                        <input type="number" value="30" className="w-16 px-2 py-1 border border-gray-200 rounded text-sm" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Force logout on password change</span>
                        <input type="checkbox" checked className="rounded" />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                    Save Security Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'compliance' && (
          <div className="space-y-6">
            {/* Compliance Overview */}
            <div className="p-8 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Compliance Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'GDPR Compliance', status: 'Compliant', color: 'green' },
                  { title: 'CCPA Compliance', status: 'Compliant', color: 'green' },
                  { title: 'PCI DSS', status: 'Review Required', color: 'yellow' },
                  { title: 'SOC 2 Type II', status: 'In Progress', color: 'blue' },
                  { title: 'HIPAA', status: 'Not Applicable', color: 'gray' },
                  { title: 'ISO 27001', status: 'Planning', color: 'blue' }
                ].map((compliance, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{compliance.title}</h4>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        compliance.color === 'green' ? 'bg-green-100 text-green-800' :
                        compliance.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        compliance.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {compliance.status}
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
