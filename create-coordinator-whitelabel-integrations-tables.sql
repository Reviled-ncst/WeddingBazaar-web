-- ============================================================================
-- COORDINATOR WHITE-LABEL AND INTEGRATIONS TABLES
-- Wedding Bazaar Platform
-- ============================================================================

-- White-Label Settings Table
CREATE TABLE IF NOT EXISTS coordinator_whitelabel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branding_settings JSONB DEFAULT '{
    "business_name": "",
    "logo_url": "",
    "primary_color": "#ec4899",
    "secondary_color": "#8b5cf6",
    "accent_color": "#f59e0b",
    "font_family": "Inter",
    "custom_domain": "",
    "favicon_url": "",
    "email": "",
    "phone": "",
    "address": "",
    "social_media": {}
  }'::jsonb,
  portal_settings JSONB DEFAULT '{
    "portal_name": "Client Portal",
    "welcome_message": "Welcome to your wedding planning portal!",
    "background_image_url": "",
    "show_coordinator_branding": true,
    "enable_client_messaging": true,
    "enable_document_sharing": true,
    "enable_payment_tracking": true
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coordinator_id)
);

-- Premium Integrations Table
CREATE TABLE IF NOT EXISTS coordinator_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'payment', 'email', 'accounting', 'storage', 'communication', 'crm'
  api_key TEXT,
  webhook_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  enabled BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_whitelabel_coordinator ON coordinator_whitelabel_settings(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_integrations_coordinator ON coordinator_integrations(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_integrations_category ON coordinator_integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON coordinator_integrations(status);

-- Comments
COMMENT ON TABLE coordinator_whitelabel_settings IS 'Stores white-label branding and portal customization settings for coordinators';
COMMENT ON TABLE coordinator_integrations IS 'Stores third-party integration configurations for coordinators';

COMMENT ON COLUMN coordinator_whitelabel_settings.branding_settings IS 'JSON object containing all branding customizations (colors, logo, fonts, etc.)';
COMMENT ON COLUMN coordinator_whitelabel_settings.portal_settings IS 'JSON object containing client portal configuration';
COMMENT ON COLUMN coordinator_integrations.category IS 'Integration category: payment, email, accounting, storage, communication, or crm';
COMMENT ON COLUMN coordinator_integrations.settings IS 'JSON object for integration-specific configuration';

-- Success Message
DO $$ 
BEGIN
  RAISE NOTICE 'White-Label and Integrations tables created successfully!';
END $$;
