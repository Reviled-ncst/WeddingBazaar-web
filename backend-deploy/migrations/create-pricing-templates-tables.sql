-- =====================================================
-- PRICING TEMPLATES DATABASE SCHEMA
-- Wedding Bazaar: Dynamic Pricing System
-- =====================================================

-- Enable UUID extension (required for Neon/PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRICING TEMPLATES TABLE
-- Stores package tiers (Bronze, Silver, Gold, Platinum) for each category
CREATE TABLE IF NOT EXISTS pricing_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  tier_name VARCHAR(50) NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum'
  tier_label VARCHAR(100) NOT NULL, -- 'Bronze Package', 'Silver Package', etc.
  base_price DECIMAL(12,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique tier per category
  UNIQUE(category_id, tier_name)
);

-- 2. PACKAGE INCLUSIONS TABLE
-- Stores itemized inclusions for each pricing template
CREATE TABLE IF NOT EXISTS package_inclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES pricing_templates(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit VARCHAR(50), -- 'hours', 'pax', 'pieces', 'sets', 'items', 'sessions', etc.
  description TEXT,
  is_highlighted BOOLEAN DEFAULT FALSE, -- For featured items
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. CATEGORY PRICING METADATA TABLE
-- Stores category-specific pricing configurations
CREATE TABLE IF NOT EXISTS category_pricing_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID UNIQUE REFERENCES categories(id) ON DELETE CASCADE,
  base_unit VARCHAR(50), -- 'per hour', 'per pax', 'per event', etc.
  min_price DECIMAL(12,2),
  max_price DECIMAL(12,2),
  typical_price_range VARCHAR(100), -- '₱50,000 - ₱200,000'
  pricing_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. TEMPLATE CUSTOMIZATION OPTIONS TABLE
-- Stores add-ons and optional upgrades for each template
CREATE TABLE IF NOT EXISTS template_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES pricing_templates(id) ON DELETE CASCADE,
  option_name VARCHAR(255) NOT NULL,
  option_type VARCHAR(50), -- 'addon', 'upgrade', 'substitution'
  additional_price DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_pricing_templates_category ON pricing_templates(category_id);
CREATE INDEX idx_pricing_templates_tier ON pricing_templates(tier_name);
CREATE INDEX idx_pricing_templates_active ON pricing_templates(is_active);

CREATE INDEX idx_package_inclusions_template ON package_inclusions(template_id);
CREATE INDEX idx_package_inclusions_highlighted ON package_inclusions(is_highlighted);

CREATE INDEX idx_template_customizations_template ON template_customizations(template_id);
CREATE INDEX idx_template_customizations_active ON template_customizations(is_active);

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- View: Complete pricing template with all inclusions
CREATE OR REPLACE VIEW vw_complete_pricing_templates AS
SELECT 
  pt.id as template_id,
  pt.tier_name,
  pt.tier_label,
  pt.base_price,
  pt.description as template_description,
  c.id as category_id,
  c.name as category_name,
  c.display_name as category_display_name,
  json_agg(
    json_build_object(
      'id', pi.id,
      'item_name', pi.item_name,
      'quantity', pi.quantity,
      'unit', pi.unit,
      'description', pi.description,
      'is_highlighted', pi.is_highlighted
    ) ORDER BY pi.sort_order
  ) as inclusions,
  pt.sort_order,
  pt.is_active
FROM pricing_templates pt
LEFT JOIN categories c ON pt.category_id = c.id
LEFT JOIN package_inclusions pi ON pt.id = pi.template_id
GROUP BY pt.id, c.id, pt.tier_name, pt.tier_label, pt.base_price, 
         pt.description, pt.sort_order, pt.is_active, c.name, c.display_name;

-- View: Category pricing summary
CREATE OR REPLACE VIEW vw_category_pricing_summary AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.display_name as category_display_name,
  COUNT(pt.id) as template_count,
  MIN(pt.base_price) as min_price,
  MAX(pt.base_price) as max_price,
  AVG(pt.base_price) as avg_price,
  cpm.base_unit,
  cpm.typical_price_range
FROM categories c
LEFT JOIN pricing_templates pt ON c.id = pt.category_id AND pt.is_active = TRUE
LEFT JOIN category_pricing_metadata cpm ON c.id = cpm.category_id
GROUP BY c.id, c.name, c.display_name, cpm.base_unit, cpm.typical_price_range;

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed)
-- =====================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON pricing_templates TO wedding_bazaar_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON package_inclusions TO wedding_bazaar_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON category_pricing_metadata TO wedding_bazaar_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON template_customizations TO wedding_bazaar_app;
-- GRANT SELECT ON vw_complete_pricing_templates TO wedding_bazaar_app;
-- GRANT SELECT ON vw_category_pricing_summary TO wedding_bazaar_app;

-- =====================================================
-- AUDIT TRIGGERS (optional, for tracking changes)
-- =====================================================

-- Update timestamp on UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pricing_templates_updated_at BEFORE UPDATE ON pricing_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_inclusions_updated_at BEFORE UPDATE ON package_inclusions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_pricing_metadata_updated_at BEFORE UPDATE ON category_pricing_metadata
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_customizations_updated_at BEFORE UPDATE ON template_customizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE pricing_templates IS 'Pricing tiers (Bronze, Silver, Gold, Platinum) for each wedding service category';
COMMENT ON TABLE package_inclusions IS 'Itemized list of what is included in each pricing package';
COMMENT ON TABLE category_pricing_metadata IS 'Category-specific pricing configuration and notes';
COMMENT ON TABLE template_customizations IS 'Optional add-ons and upgrades for pricing templates';

COMMENT ON COLUMN pricing_templates.tier_name IS 'Lowercase tier identifier: bronze, silver, gold, platinum';
COMMENT ON COLUMN pricing_templates.tier_label IS 'Display label for frontend: Bronze Package, Silver Package, etc.';
COMMENT ON COLUMN package_inclusions.unit IS 'Unit of measurement: hours, pax, pieces, sets, sessions, etc.';
COMMENT ON COLUMN package_inclusions.is_highlighted IS 'Flag to highlight special or premium inclusions';
COMMENT ON COLUMN template_customizations.option_type IS 'Type: addon (extra item), upgrade (better version), substitution (replacement)';

-- =====================================================
-- SAMPLE DATA INSERTION (for testing)
-- =====================================================

-- Example: Photography Bronze Package
-- INSERT INTO pricing_templates (category_id, tier_name, tier_label, base_price, description)
-- SELECT id, 'bronze', 'Bronze Package', 35000.00, 'Essential photography coverage for intimate weddings'
-- FROM categories WHERE name = 'photography' LIMIT 1;

-- Example: Photography inclusions
-- INSERT INTO package_inclusions (template_id, item_name, quantity, unit, description, sort_order)
-- SELECT 
--   pt.id,
--   'Full-day coverage',
--   8,
--   'hours',
--   'Wedding day photography coverage',
--   1
-- FROM pricing_templates pt
-- JOIN categories c ON pt.category_id = c.id
-- WHERE c.name = 'photography' AND pt.tier_name = 'bronze';
