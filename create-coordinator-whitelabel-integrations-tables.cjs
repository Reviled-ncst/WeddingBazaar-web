// ============================================================================
// CREATE COORDINATOR WHITE-LABEL AND INTEGRATIONS TABLES
// Node.js Script for Neon PostgreSQL Database
// ============================================================================

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function createWhiteLabelAndIntegrationsTables() {
  console.log('🚀 Starting White-Label and Integrations tables creation...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable not found!');
    console.log('Please ensure .env file exists with DATABASE_URL=<your-neon-connection-string>');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('📦 Creating coordinator_whitelabel_settings table...');
    
    // Create White-Label Settings Table
    await sql`
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
      )
    `;
    console.log('✅ coordinator_whitelabel_settings table created');

    console.log('\n📦 Creating coordinator_integrations table...');
    
    // Create Premium Integrations Table
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        api_key TEXT,
        webhook_url TEXT,
        settings JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'disconnected',
        enabled BOOLEAN DEFAULT true,
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_integrations table created');

    console.log('\n📊 Creating indexes...');

    // Create Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_whitelabel_coordinator ON coordinator_whitelabel_settings(coordinator_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_integrations_coordinator ON coordinator_integrations(coordinator_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_integrations_category ON coordinator_integrations(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_integrations_status ON coordinator_integrations(status)`;
    
    console.log('✅ All indexes created');

    console.log('\n📋 Adding table comments...');

    // Add Comments
    await sql`COMMENT ON TABLE coordinator_whitelabel_settings IS 'Stores white-label branding and portal customization settings for coordinators'`;
    await sql`COMMENT ON TABLE coordinator_integrations IS 'Stores third-party integration configurations for coordinators'`;
    
    console.log('✅ Comments added');

    console.log('\n✨ SUCCESS! All White-Label and Integrations tables created successfully!');
    console.log('\n📊 Summary:');
    console.log('  - coordinator_whitelabel_settings: ✅ Created');
    console.log('  - coordinator_integrations: ✅ Created');
    console.log('  - Indexes: ✅ 4 indexes created');
    console.log('  - Comments: ✅ Added');

  } catch (error) {
    console.error('\n❌ ERROR creating tables:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the script
createWhiteLabelAndIntegrationsTables()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
