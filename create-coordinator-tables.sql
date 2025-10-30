-- ============================================================================
-- Wedding Coordinator Database Schema
-- ============================================================================
-- This script creates all necessary tables for the Wedding Coordinator features
-- Execute this in Neon SQL Console
-- ============================================================================

-- 1. COORDINATOR WEDDINGS TABLE
-- Stores all weddings managed by coordinators
CREATE TABLE IF NOT EXISTS coordinator_weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  couple_name VARCHAR(255) NOT NULL,
  couple_email VARCHAR(255),
  couple_phone VARCHAR(50),
  wedding_date DATE NOT NULL,
  venue VARCHAR(255),
  venue_address TEXT,
  status VARCHAR(50) DEFAULT 'planning',
  -- Status options: 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled'
  progress INTEGER DEFAULT 0,
  -- Progress percentage (0-100)
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  guest_count INTEGER,
  preferred_style VARCHAR(100),
  -- Style options: 'classic', 'modern', 'rustic', 'bohemian', 'minimalist', 'luxury'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. WEDDING VENDORS TABLE
-- Tracks vendors assigned to each wedding
CREATE TABLE IF NOT EXISTS wedding_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE CASCADE,
  vendor_id VARCHAR(20) REFERENCES vendors(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  -- Status options: 'pending', 'confirmed', 'completed', 'cancelled'
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wedding_id, vendor_id)
);

-- 3. WEDDING MILESTONES TABLE
-- Tracks progress milestones for each wedding
CREATE TABLE IF NOT EXISTS wedding_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. COORDINATOR VENDORS TABLE
-- Stores coordinator's preferred vendor network
CREATE TABLE IF NOT EXISTS coordinator_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  vendor_id VARCHAR(20) REFERENCES vendors(id) ON DELETE CASCADE,
  is_preferred BOOLEAN DEFAULT FALSE,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  last_worked_with DATE,
  notes TEXT,
  tags TEXT[], -- Array of tags for categorization
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coordinator_id, vendor_id)
);

-- 5. COORDINATOR CLIENTS TABLE
-- Stores client information for coordinators
CREATE TABLE IF NOT EXISTS coordinator_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  couple_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  -- Status options: 'lead', 'active', 'completed', 'inactive'
  last_contact DATE,
  preferred_style VARCHAR(100),
  budget_range VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. COORDINATOR COMMISSIONS TABLE
-- Tracks commission/earnings from weddings
CREATE TABLE IF NOT EXISTS coordinator_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  commission_type VARCHAR(50) DEFAULT 'percentage',
  -- Type options: 'percentage', 'flat_fee', 'hourly'
  commission_rate DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending',
  -- Status options: 'pending', 'paid', 'cancelled'
  paid_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. COORDINATOR ACTIVITY LOG TABLE
-- Tracks all coordinator activities for audit trail
CREATE TABLE IF NOT EXISTS coordinator_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,
  -- Types: 'wedding_created', 'wedding_updated', 'vendor_booked', 'milestone_completed', etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Coordinator weddings indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_weddings_coordinator 
  ON coordinator_weddings(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_weddings_date 
  ON coordinator_weddings(wedding_date);
CREATE INDEX IF NOT EXISTS idx_coordinator_weddings_status 
  ON coordinator_weddings(status);

-- Wedding vendors indexes
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_wedding 
  ON wedding_vendors(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_vendors_vendor 
  ON wedding_vendors(vendor_id);

-- Wedding milestones indexes
CREATE INDEX IF NOT EXISTS idx_wedding_milestones_wedding 
  ON wedding_milestones(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_milestones_due_date 
  ON wedding_milestones(due_date);

-- Coordinator vendors indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_vendors_coordinator 
  ON coordinator_vendors(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_vendors_vendor 
  ON coordinator_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_vendors_preferred 
  ON coordinator_vendors(is_preferred) WHERE is_preferred = true;

-- Coordinator clients indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_clients_coordinator 
  ON coordinator_clients(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_clients_wedding 
  ON coordinator_clients(wedding_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_clients_status 
  ON coordinator_clients(status);

-- Coordinator commissions indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_commissions_coordinator 
  ON coordinator_commissions(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_commissions_wedding 
  ON coordinator_commissions(wedding_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_commissions_status 
  ON coordinator_commissions(status);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_coordinator_activity_coordinator 
  ON coordinator_activity_log(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_activity_wedding 
  ON coordinator_activity_log(wedding_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_activity_type 
  ON coordinator_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_coordinator_activity_created 
  ON coordinator_activity_log(created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_coordinator_weddings_updated_at
  BEFORE UPDATE ON coordinator_weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_vendors_updated_at
  BEFORE UPDATE ON wedding_vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_milestones_updated_at
  BEFORE UPDATE ON wedding_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coordinator_vendors_updated_at
  BEFORE UPDATE ON coordinator_vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coordinator_clients_updated_at
  BEFORE UPDATE ON coordinator_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coordinator_commissions_updated_at
  BEFORE UPDATE ON coordinator_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Coordinator dashboard stats view
CREATE OR REPLACE VIEW coordinator_dashboard_stats AS
SELECT 
  cw.coordinator_id,
  COUNT(DISTINCT cw.id) as total_weddings,
  COUNT(DISTINCT CASE WHEN cw.status = 'planning' THEN cw.id END) as planning_count,
  COUNT(DISTINCT CASE WHEN cw.status = 'in_progress' THEN cw.id END) as in_progress_count,
  COUNT(DISTINCT CASE WHEN cw.status = 'completed' THEN cw.id END) as completed_count,
  COUNT(DISTINCT cc.id) as total_clients,
  COUNT(DISTINCT cv.vendor_id) as total_vendors,
  SUM(cw.budget) as total_budget,
  SUM(cw.spent) as total_spent,
  SUM(ccom.amount) as total_commissions,
  AVG(cw.progress) as average_progress
FROM users u
LEFT JOIN coordinator_weddings cw ON u.id = cw.coordinator_id
LEFT JOIN coordinator_clients cc ON u.id = cc.coordinator_id
LEFT JOIN coordinator_vendors cv ON u.id = cv.coordinator_id
LEFT JOIN coordinator_commissions ccom ON u.id = ccom.coordinator_id AND ccom.status = 'paid'
WHERE u.role = 'coordinator'
GROUP BY cw.coordinator_id;

-- Wedding details view
CREATE OR REPLACE VIEW wedding_details_view AS
SELECT 
  w.*,
  COUNT(DISTINCT wv.id) as vendors_count,
  COUNT(DISTINCT wm.id) as milestones_total,
  COUNT(DISTINCT CASE WHEN wm.completed = true THEN wm.id END) as milestones_completed,
  COALESCE(SUM(wv.amount), 0) as total_vendor_cost
FROM coordinator_weddings w
LEFT JOIN wedding_vendors wv ON w.id = wv.wedding_id
LEFT JOIN wedding_milestones wm ON w.id = wm.wedding_id
GROUP BY w.id;

-- ============================================================================
-- GRANT PERMISSIONS (Optional - adjust as needed)
-- ============================================================================

-- Grant necessary permissions to your application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Wedding Coordinator database schema created successfully!';
  RAISE NOTICE 'Tables created: coordinator_weddings, wedding_vendors, wedding_milestones, coordinator_vendors, coordinator_clients, coordinator_commissions, coordinator_activity_log';
  RAISE NOTICE 'Indexes created for optimal query performance';
  RAISE NOTICE 'Triggers set up for automatic timestamp updates';
  RAISE NOTICE 'Views created for reporting and analytics';
END $$;
