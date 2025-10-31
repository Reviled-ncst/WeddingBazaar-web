import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plug, 
  CreditCard, 
  Mail, 
  Calculator, 
  Cloud, 
  MessageSquare, 
  Users,
  Plus,
  Check,
  X,
  RefreshCw,
  Trash2,
  TestTube,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { CoordinatorHeader } from '../layout/CoordinatorHeader';

interface Integration {
  id?: string;
  name: string;
  category: 'payment' | 'email' | 'accounting' | 'storage' | 'communication' | 'crm';
  api_key?: string;
  webhook_url?: string;
  settings?: Record<string, unknown>;
  status?: 'connected' | 'disconnected' | 'error';
  enabled?: boolean;
  last_sync?: string;
  created_at?: string;
}

interface AvailableIntegration {
  name: string;
  category: Integration['category'];
  description: string;
  icon: React.ReactNode;
  requiresApiKey: boolean;
  requiresWebhook: boolean;
  setupInstructions: string;
}

const availableIntegrations: AvailableIntegration[] = [
  {
    name: 'Stripe',
    category: 'payment',
    description: 'Accept payments and manage subscriptions',
    icon: <CreditCard className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: true,
    setupInstructions: 'Get your API key from Stripe Dashboard → Developers → API Keys'
  },
  {
    name: 'PayPal',
    category: 'payment',
    description: 'Alternative payment processing',
    icon: <CreditCard className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Create API credentials in PayPal Developer Dashboard'
  },
  {
    name: 'Mailchimp',
    category: 'email',
    description: 'Email marketing and automation',
    icon: <Mail className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Generate API key in Mailchimp Account → Extras → API Keys'
  },
  {
    name: 'SendGrid',
    category: 'email',
    description: 'Transactional email service',
    icon: <Mail className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Create API key in SendGrid Settings → API Keys'
  },
  {
    name: 'QuickBooks',
    category: 'accounting',
    description: 'Accounting and invoicing',
    icon: <Calculator className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Connect via OAuth in QuickBooks Developer Portal'
  },
  {
    name: 'Xero',
    category: 'accounting',
    description: 'Cloud accounting software',
    icon: <Calculator className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Create OAuth app in Xero Developer Portal'
  },
  {
    name: 'Google Drive',
    category: 'storage',
    description: 'Cloud file storage and sharing',
    icon: <Cloud className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Enable Google Drive API in Google Cloud Console'
  },
  {
    name: 'Dropbox',
    category: 'storage',
    description: 'File hosting service',
    icon: <Cloud className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Create app in Dropbox App Console'
  },
  {
    name: 'Slack',
    category: 'communication',
    description: 'Team communication and notifications',
    icon: <MessageSquare className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: true,
    setupInstructions: 'Create Slack app and install to workspace'
  },
  {
    name: 'Twilio',
    category: 'communication',
    description: 'SMS and voice communication',
    icon: <MessageSquare className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Get credentials from Twilio Console'
  },
  {
    name: 'HubSpot',
    category: 'crm',
    description: 'Customer relationship management',
    icon: <Users className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Generate API key in HubSpot Settings → Integrations'
  },
  {
    name: 'Salesforce',
    category: 'crm',
    description: 'Enterprise CRM platform',
    icon: <Users className="w-8 h-8" />,
    requiresApiKey: true,
    requiresWebhook: false,
    setupInstructions: 'Create Connected App in Salesforce Setup'
  }
];

export const CoordinatorIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AvailableIntegration | null>(null);
  const [activeFilter, setActiveFilter] = useState<Integration['category'] | 'all'>('all');

  // Form state for adding integration
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    if (!selectedIntegration) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/integrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: selectedIntegration.name,
          category: selectedIntegration.category,
          api_key: apiKey,
          webhook_url: webhookUrl,
          settings: {}
        })
      });

      if (response.ok) {
        await loadIntegrations();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to add integration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestIntegration = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/integrations/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTestResult('success');
        await loadIntegrations();
      } else {
        setTestResult('error');
      }

      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('Failed to test integration:', error);
      setTestResult('error');
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleToggleIntegration = async (id: string, enabled: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/integrations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: !enabled })
      });

      await loadIntegrations();
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to remove this integration?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/integrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      await loadIntegrations();
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  const resetForm = () => {
    setSelectedIntegration(null);
    setApiKey('');
    setWebhookUrl('');
  };

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'accounting': return <Calculator className="w-5 h-5" />;
      case 'storage': return <Cloud className="w-5 h-5" />;
      case 'communication': return <MessageSquare className="w-5 h-5" />;
      case 'crm': return <Users className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Disconnected
          </span>
        );
    }
  };

  const filteredIntegrations = activeFilter === 'all'
    ? integrations
    : integrations.filter(i => i.category === activeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <CoordinatorHeader />
        <div className="pt-24 pb-16 px-8 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <CoordinatorHeader />
      
      <div className="pt-24 pb-16 px-8">
        {/* Header */}
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-start"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Premium Integrations
          </h1>
          <p className="text-gray-600">Connect your favorite tools and services</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Integration
        </button>
      </motion.div>

      {/* Test Result Banner */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              testResult === 'success'
                ? 'bg-green-100 border-2 border-green-300 text-green-800'
                : 'bg-red-100 border-2 border-red-300 text-red-800'
            }`}
          >
            {testResult === 'success' ? (
              <>
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Integration test successful!</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6" />
                <span className="font-medium">Integration test failed. Please check your credentials.</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'payment', 'email', 'accounting', 'storage', 'communication', 'crm'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === category
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {category === 'all' ? (
              'All'
            ) : (
              <span className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      {filteredIntegrations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Plug className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Integrations Yet</h3>
          <p className="text-gray-600 mb-6">Connect your tools to streamline your workflow</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Add Your First Integration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                    {getCategoryIcon(integration.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{integration.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{integration.category}</p>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>

              {integration.last_sync && (
                <p className="text-xs text-gray-500 mb-4">
                  Last synced: {new Date(integration.last_sync).toLocaleString()}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleTestIntegration(integration.id!)}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <TestTube className="w-4 h-4" />
                  Test
                </button>
                <button
                  onClick={() => handleToggleIntegration(integration.id!, integration.enabled!)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                    integration.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {integration.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {integration.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleDeleteIntegration(integration.id!)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Delete integration"
                  aria-label="Delete integration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Integration Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Add Integration</h2>

                {!selectedIntegration ? (
                  // Integration Selection
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableIntegrations.map((integration) => (
                      <button
                        key={integration.name}
                        onClick={() => setSelectedIntegration(integration)}
                        className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-pink-300"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
                            {integration.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{integration.name}</h3>
                            <p className="text-xs text-gray-500 capitalize">{integration.category}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Integration Configuration
                  <div>
                    <button
                      onClick={() => resetForm()}
                      className="mb-4 text-pink-600 hover:text-pink-700 flex items-center gap-2"
                    >
                      ← Back to selection
                    </button>

                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white">
                          {selectedIntegration.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{selectedIntegration.name}</h3>
                          <p className="text-gray-600">{selectedIntegration.description}</p>
                        </div>
                      </div>
                      <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 mt-4">
                        <p className="text-sm text-blue-900">
                          <strong>Setup:</strong> {selectedIntegration.setupInstructions}
                        </p>
                      </div>
                    </div>

                    {selectedIntegration.requiresApiKey && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          API Key *
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                          placeholder="Enter your API key"
                        />
                      </div>
                    )}

                    {selectedIntegration.requiresWebhook && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                          placeholder="https://your-webhook-url.com"
                        />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setShowAddModal(false);
                          resetForm();
                        }}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddIntegration}
                        disabled={isSaving || (selectedIntegration.requiresApiKey && !apiKey)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Connect Integration
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
