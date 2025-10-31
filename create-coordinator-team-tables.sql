-- ================================================================
-- COORDINATOR TEAM MANAGEMENT TABLES
-- ================================================================
-- Purpose: Support team collaboration features for wedding coordinators
-- Created: October 31, 2025
-- ================================================================

-- 1. Team Members Table
CREATE TABLE IF NOT EXISTS coordinator_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(50) NOT NULL, -- The coordinator who owns this team
  user_id VARCHAR(50), -- Optional: Link to users table if team member has account
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(100) NOT NULL, -- 'Lead Coordinator', 'Assistant', 'Vendor Manager', 'Client Relations', 'Operations'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'on-leave'
  assigned_weddings INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  permissions TEXT[], -- Array of permission strings
  avatar_url TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Team Activity Log Table
CREATE TABLE IF NOT EXISTS coordinator_team_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(50) NOT NULL,
  team_member_id UUID REFERENCES coordinator_team_members(id) ON DELETE CASCADE,
  member_name VARCHAR(255) NOT NULL,
  action TEXT NOT NULL,
  wedding_id UUID, -- Optional: Reference to specific wedding
  wedding_name VARCHAR(255),
  activity_type VARCHAR(50) NOT NULL, -- 'task', 'wedding', 'client', 'vendor', 'document'
  metadata JSONB, -- Additional context (task_id, vendor_id, etc.)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Team Permissions Table (for granular permissions)
CREATE TABLE IF NOT EXISTS team_member_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES coordinator_team_members(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL, -- 'view', 'edit_tasks', 'manage_vendors', etc.
  permission_value BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_member_id, permission_key)
);

-- 4. Team Task Assignments Table
CREATE TABLE IF NOT EXISTS team_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL, -- Reference to wedding_tasks or other task tables
  team_member_id UUID REFERENCES coordinator_team_members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES coordinator_team_members(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'assigned', -- 'assigned', 'in-progress', 'completed', 'overdue'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_team_members_coordinator ON coordinator_team_members(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON coordinator_team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON coordinator_team_members(role);

CREATE INDEX IF NOT EXISTS idx_team_activity_coordinator ON coordinator_team_activity(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_member ON coordinator_team_activity(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_type ON coordinator_team_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_team_activity_date ON coordinator_team_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_permissions_member ON team_member_permissions(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_permissions_key ON team_member_permissions(permission_key);

CREATE INDEX IF NOT EXISTS idx_task_assignments_member ON team_task_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON team_task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON team_task_assignments(status);

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================

-- Uncomment to insert sample data
/*
INSERT INTO coordinator_team_members (coordinator_id, name, email, phone, role, status, assigned_weddings, completed_tasks, pending_tasks, permissions, joined_date)
VALUES
  ('coordinator-1', 'Sarah Martinez', 'sarah.m@weddingbazaar.com', '+1 (555) 123-4567', 'Lead Coordinator', 'active', 8, 234, 12, ARRAY['all'], '2024-01-15'),
  ('coordinator-1', 'Michael Chen', 'michael.c@weddingbazaar.com', '+1 (555) 234-5678', 'Assistant', 'active', 5, 189, 8, ARRAY['view', 'edit_tasks', 'contact_vendors'], '2024-03-20'),
  ('coordinator-1', 'Emily Rodriguez', 'emily.r@weddingbazaar.com', '+1 (555) 345-6789', 'Vendor Manager', 'active', 6, 156, 15, ARRAY['view', 'manage_vendors', 'create_contracts'], '2024-02-10'),
  ('coordinator-1', 'James Wilson', 'james.w@weddingbazaar.com', '+1 (555) 456-7890', 'Client Relations', 'active', 7, 198, 9, ARRAY['view', 'manage_clients', 'send_emails'], '2024-01-28'),
  ('coordinator-1', 'Sophia Lee', 'sophia.l@weddingbazaar.com', '+1 (555) 567-8901', 'Operations', 'on-leave', 3, 145, 4, ARRAY['view', 'manage_logistics', 'track_budgets'], '2024-04-05');

INSERT INTO coordinator_team_activity (coordinator_id, team_member_id, member_name, action, wedding_name, activity_type, created_at)
SELECT
  'coordinator-1',
  id,
  name,
  'Joined the team',
  NULL,
  'team',
  joined_date
FROM coordinator_team_members
WHERE coordinator_id = 'coordinator-1';
*/

-- ================================================================
-- END OF SCHEMA
-- ================================================================
