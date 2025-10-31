const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createCoordinatorTeamTables() {
  try {
    console.log('🚀 Starting Coordinator Team Tables Creation...\n');

    console.log('📝 Creating coordinator_team_members table...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        assigned_weddings INTEGER DEFAULT 0,
        completed_tasks INTEGER DEFAULT 0,
        pending_tasks INTEGER DEFAULT 0,
        permissions TEXT[],
        avatar_url TEXT,
        joined_date DATE DEFAULT CURRENT_DATE,
        last_active TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_team_members table created\n');

    console.log('📝 Creating coordinator_team_activity table...');
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_team_activity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coordinator_id VARCHAR(50) NOT NULL,
        team_member_id UUID REFERENCES coordinator_team_members(id) ON DELETE CASCADE,
        member_name VARCHAR(255) NOT NULL,
        action TEXT NOT NULL,
        wedding_id UUID,
        wedding_name VARCHAR(255),
        activity_type VARCHAR(50) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ coordinator_team_activity table created\n');

    console.log('� Creating team_member_permissions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS team_member_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_member_id UUID REFERENCES coordinator_team_members(id) ON DELETE CASCADE,
        permission_key VARCHAR(100) NOT NULL,
        permission_value BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(team_member_id, permission_key)
      )
    `;
    console.log('✅ team_member_permissions table created\n');

    console.log('📝 Creating team_task_assignments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS team_task_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL,
        team_member_id UUID REFERENCES coordinator_team_members(id) ON DELETE CASCADE,
        assigned_by UUID REFERENCES coordinator_team_members(id),
        assigned_at TIMESTAMP DEFAULT NOW(),
        due_date DATE,
        status VARCHAR(50) DEFAULT 'assigned',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ team_task_assignments table created\n');

    console.log('📝 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_coordinator ON coordinator_team_members(coordinator_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_status ON coordinator_team_members(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_members_role ON coordinator_team_members(role)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_activity_coordinator ON coordinator_team_activity(coordinator_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_activity_member ON coordinator_team_activity(team_member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_activity_type ON coordinator_team_activity(activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_activity_date ON coordinator_team_activity(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_permissions_member ON team_member_permissions(team_member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_team_permissions_key ON team_member_permissions(permission_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_assignments_member ON team_task_assignments(team_member_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON team_task_assignments(task_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON team_task_assignments(status)`;
    console.log('✅ All indexes created\n');

    console.log('\n' + '='.repeat(60));
    console.log('📊 EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All tables and indexes created successfully!');
    console.log('='.repeat(60) + '\n');

    console.log('\n' + '='.repeat(60));
    console.log('📊 EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All tables and indexes created successfully!');
    console.log('='.repeat(60) + '\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const tables = [
      'coordinator_team_members',
      'coordinator_team_activity',
      'team_member_permissions',
      'team_task_assignments'
    ];

    for (const table of tables) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = ${table}
        `;
        
        if (parseInt(result[0].count) > 0) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' does NOT exist`);
        }
      } catch (error) {
        console.error(`❌ Error checking table '${table}':`, error.message);
      }
    }

    console.log('\n✨ Coordinator Team tables setup complete!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
createCoordinatorTeamTables();
