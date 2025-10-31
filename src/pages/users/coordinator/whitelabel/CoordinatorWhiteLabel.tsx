import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Globe, 
  Eye, 
  Save, 
  Upload,
  RefreshCw,
  Check,
  X,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface BrandingSettings {
  business_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  custom_domain: string;
  favicon_url: string;
  email: string;
  phone: string;
  address: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

interface ClientPortalSettings {
  portal_name: string;
  welcome_message: string;
  background_image_url: string;
  show_coordinator_branding: boolean;
  enable_client_messaging: boolean;
  enable_document_sharing: boolean;
  enable_payment_tracking: boolean;
}

export const CoordinatorWhiteLabel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branding' | 'portal' | 'domain'>('branding');
  const [branding, setBranding] = useState<BrandingSettings>({
    business_name: 'My Wedding Coordination',
    logo_url: '',
    primary_color: '#ec4899',
    secondary_color: '#8b5cf6',
    accent_color: '#f59e0b',
    font_family: 'Inter',
    custom_domain: '',
    favicon_url: '',
    email: '',
    phone: '',
    address: '',
    social_media: {}
  });

  const [portalSettings, setPortalSettings] = useState<ClientPortalSettings>({
    portal_name: 'Client Portal',
    welcome_message: 'Welcome to your wedding planning portal!',
    background_image_url: '',
    show_coordinator_branding: true,
    enable_client_messaging: true,
    enable_document_sharing: true,
    enable_payment_tracking: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load white-label settings
  useEffect(() => {
    loadWhiteLabelSettings();
  }, []);

  const loadWhiteLabelSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/whitelabel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.branding) setBranding(data.branding);
        if (data.portal) setPortalSettings(data.portal);
      }
    } catch (error) {
      console.error('Failed to load white-label settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/whitelabel/branding`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branding)
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePortal = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coordinator/whitelabel/portal`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(portalSettings)
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save portal settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon' | 'background') => {
    // Implement image upload logic
    console.log('Upload:', file, type);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading white-label settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          White-Label Options
        </h1>
        <p className="text-gray-600">Customize your brand and client portal</p>
      </motion.div>

      {/* Success Banner */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-green-100 border-2 border-green-300 rounded-xl p-4 flex items-center gap-3"
        >
          <Check className="w-6 h-6 text-green-600" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'branding'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Palette className="w-5 h-5 inline mr-2" />
          Branding
        </button>
        <button
          onClick={() => setActiveTab('portal')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'portal'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-5 h-5 inline mr-2" />
          Client Portal
        </button>
        <button
          onClick={() => setActiveTab('domain')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'domain'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Globe className="w-5 h-5 inline mr-2" />
          Custom Domain
        </button>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Business Name */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Business Name
              </label>
              <input
                type="text"
                value={branding.business_name}
                onChange={(e) => setBranding({ ...branding, business_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                placeholder="My Wedding Coordination"
              />
            </div>

            {/* Logo Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-2" />
                Logo
              </label>
              <div className="flex items-center gap-4">
                {branding.logo_url && (
                  <img src={branding.logo_url} alt="Logo" className="w-20 h-20 object-contain rounded-lg border-2 border-gray-200" />
                )}
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                <Palette className="w-4 h-4 inline mr-2" />
                Color Scheme
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.primary_color}
                      onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                      className="w-16 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primary_color}
                      onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.secondary_color}
                      onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                      className="w-16 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.secondary_color}
                      onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.accent_color}
                      onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                      className="w-16 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.accent_color}
                      onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Contact Information
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={branding.email}
                    onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={branding.address}
                    onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg"
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Branding
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
              <div 
                className="border-4 border-gray-200 rounded-xl p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${branding.primary_color}20, ${branding.secondary_color}20)`
                }}
              >
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt="Logo Preview" className="w-32 h-32 mx-auto mb-4 object-contain" />
                ) : (
                  <div 
                    className="w-32 h-32 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: branding.primary_color }}
                  >
                    <Type className="w-12 h-12 text-white" />
                  </div>
                )}
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: branding.primary_color }}
                >
                  {branding.business_name || 'Your Business Name'}
                </h2>
                <p className="text-gray-600 mb-4">Wedding Coordination Services</p>
                
                <div className="flex justify-center gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: branding.primary_color }}
                  />
                  <div 
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: branding.secondary_color }}
                  />
                  <div 
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: branding.accent_color }}
                  />
                </div>

                <button
                  className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.primary_color}, ${branding.secondary_color})`
                  }}
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portal Settings Tab */}
      {activeTab === 'portal' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Portal Name</label>
              <input
                type="text"
                value={portalSettings.portal_name}
                onChange={(e) => setPortalSettings({ ...portalSettings, portal_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Message</label>
              <textarea
                value={portalSettings.welcome_message}
                onChange={(e) => setPortalSettings({ ...portalSettings, welcome_message: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                rows={4}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Portal Features</label>
              <div className="space-y-3">
                {[
                  { key: 'show_coordinator_branding', label: 'Show Coordinator Branding' },
                  { key: 'enable_client_messaging', label: 'Enable Client Messaging' },
                  { key: 'enable_document_sharing', label: 'Enable Document Sharing' },
                  { key: 'enable_payment_tracking', label: 'Enable Payment Tracking' }
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalSettings[feature.key as keyof ClientPortalSettings] as boolean}
                      onChange={(e) => setPortalSettings({ 
                        ...portalSettings, 
                        [feature.key]: e.target.checked 
                      })}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                    <span className="text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleSavePortal}
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Portal Settings
                </>
              )}
            </button>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Portal Preview</h3>
              <div className="border-4 border-gray-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-pink-600 mb-2">{portalSettings.portal_name}</h2>
                <p className="text-gray-600 mb-6">{portalSettings.welcome_message}</p>
                
                <div className="space-y-3">
                  {portalSettings.enable_client_messaging && (
                    <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-800">Messaging Enabled</span>
                    </div>
                  )}
                  {portalSettings.enable_document_sharing && (
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center gap-2">
                      <Check className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800">Document Sharing Enabled</span>
                    </div>
                  )}
                  {portalSettings.enable_payment_tracking && (
                    <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center gap-2">
                      <Check className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-800">Payment Tracking Enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom Domain Tab */}
      {activeTab === 'domain' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Custom Domain</h2>
                <p className="text-gray-600">Use your own domain for the client portal</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Domain Name
              </label>
              <input
                type="text"
                value={branding.custom_domain}
                onChange={(e) => setBranding({ ...branding, custom_domain: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                placeholder="portal.yourweddings.com"
              />
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">DNS Configuration Instructions</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. Go to your domain registrar's DNS settings</li>
                <li>2. Add a CNAME record pointing to: <code className="bg-blue-100 px-2 py-1 rounded">portal.weddingbazaar.com</code></li>
                <li>3. Wait 24-48 hours for DNS propagation</li>
                <li>4. We'll verify your domain and issue an SSL certificate</li>
              </ol>
            </div>

            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Domain Settings
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
