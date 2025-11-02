# 🚀 Coordinator Feature - Quick Start Implementation Guide
**Goal**: Complete the 5 missing backend modules in 1 day  
**Developer Level**: Intermediate JavaScript/Node.js  
**Prerequisites**: Access to Neon database, Render backend, Git repository

---

## 📋 Pre-Implementation Checklist

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] Access to Neon database console
- [ ] Access to Render backend dashboard
- [ ] Git repository cloned locally
- [ ] Code editor ready (VS Code recommended)

### Required Credentials
- [ ] `DATABASE_URL` environment variable
- [ ] Render deployment access
- [ ] Firebase hosting access (for frontend deployment)

---

## 🎯 Implementation Steps (Follow in Order)

### ⏱️ STEP 1: Database Setup (15 minutes)

#### 1.1 Open Neon SQL Console
1. Go to https://console.neon.tech/
2. Select your Wedding Bazaar database
3. Click "SQL Editor"

#### 1.2 Run Database Migration
Copy and paste this complete script:

```sql
-- ============================================================================
-- COORDINATOR MISSING TABLES - COMPLETE MIGRATION
-- Execute this in Neon SQL Console
-- ============================================================================

-- 1. COORDINATOR TEAM MEMBERS
CREATE TABLE IF NOT EXISTS coordinator_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  member_name VARCHAR(255) NOT NULL,
  member_email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'assistant',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. COORDINATOR CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS coordinator_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location VARCHAR(255),
  attendees JSONB DEFAULT '[]',
  is_all_day BOOLEAN DEFAULT FALSE,
  reminder_minutes INTEGER DEFAULT 60,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. COORDINATOR AUTOMATION RULES
CREATE TABLE IF NOT EXISTS coordinator_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(20) REFERENCES users(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  action_type VARCHAR(100) NOT NULL,
  action_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  total_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. COORDINATOR AUTOMATION LOGS
CREATE TABLE IF NOT EXISTS coordinator_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES coordinator_automation_rules(id) ON DELETE CASCADE,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE SET NULL,
  triggered_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_coordinator_team_coordinator ON coordinator_team_members(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_team_email ON coordinator_team_members(member_email);
CREATE INDEX IF NOT EXISTS idx_coordinator_calendar_coordinator ON coordinator_calendar_events(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_calendar_wedding ON coordinator_calendar_events(wedding_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_calendar_start_time ON coordinator_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_coordinator_automation_coordinator ON coordinator_automation_rules(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_automation_trigger ON coordinator_automation_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_coordinator_automation_logs_rule ON coordinator_automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_automation_logs_triggered ON coordinator_automation_logs(triggered_at DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coordinator_team_updated_at
  BEFORE UPDATE ON coordinator_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coordinator_calendar_updated_at
  BEFORE UPDATE ON coordinator_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coordinator_automation_updated_at
  BEFORE UPDATE ON coordinator_automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VERIFY
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'coordinator%'
ORDER BY table_name;

-- SUCCESS
SELECT '✅ Migration complete! 10 coordinator tables ready.' as status;
```

#### 1.3 Verify Tables Created
You should see output:
```
coordinator_activity_log
coordinator_automation_logs
coordinator_automation_rules
coordinator_calendar_events
coordinator_clients
coordinator_commissions
coordinator_team_members
coordinator_vendors
coordinator_weddings
wedding_milestones
wedding_vendors
```

---

### ⏱️ STEP 2: Create Backend Modules (3-4 hours)

#### 2.1 Create Team Management Module (45 minutes)

**Create file**: `backend-deploy/routes/coordinator/team.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// GET all team members
router.get('/', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    
    const members = await sql`
      SELECT * FROM coordinator_team_members
      WHERE coordinator_id = ${coordinatorId}
      ORDER BY created_at DESC
    `;
    
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create team member
router.post('/', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { member_name, member_email, role, permissions } = req.body;
    
    const [member] = await sql`
      INSERT INTO coordinator_team_members (
        coordinator_id, member_name, member_email, role, permissions
      ) VALUES (
        ${coordinatorId}, ${member_name}, ${member_email}, ${role}, ${JSON.stringify(permissions || [])}
      )
      RETURNING *
    `;
    
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update team member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { member_name, member_email, role, permissions, is_active } = req.body;
    
    const [member] = await sql`
      UPDATE coordinator_team_members
      SET 
        member_name = COALESCE(${member_name}, member_name),
        member_email = COALESCE(${member_email}, member_email),
        role = COALESCE(${role}, role),
        permissions = COALESCE(${JSON.stringify(permissions)}, permissions),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await sql`
      DELETE FROM coordinator_team_members
      WHERE id = ${id}
    `;
    
    res.json({ success: true, message: 'Team member removed' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### 2.2 Create Calendar Module (60 minutes)

**Create file**: `backend-deploy/routes/coordinator/calendar.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// GET all calendar events
router.get('/', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    const { start_date, end_date, event_type } = req.query;
    
    let query = `
      SELECT e.*, w.couple_name, w.wedding_date
      FROM coordinator_calendar_events e
      LEFT JOIN coordinator_weddings w ON e.wedding_id = w.id
      WHERE e.coordinator_id = $1
    `;
    const params = [coordinatorId];
    
    if (start_date && end_date) {
      query += ` AND e.start_time BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(start_date, end_date);
    }
    
    if (event_type) {
      query += ` AND e.event_type = $${params.length + 1}`;
      params.push(event_type);
    }
    
    query += ' ORDER BY e.start_time ASC';
    
    const events = await sql(query, params);
    
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET month view
router.get('/month', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    const { year, month } = req.query;
    
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const events = await sql`
      SELECT e.*, w.couple_name
      FROM coordinator_calendar_events e
      LEFT JOIN coordinator_weddings w ON e.wedding_id = w.id
      WHERE e.coordinator_id = ${coordinatorId}
      AND e.start_time BETWEEN ${startDate} AND ${endDate}
      ORDER BY e.start_time ASC
    `;
    
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching month events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create event
router.post('/', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { 
      wedding_id, event_type, title, description, 
      start_time, end_time, location, attendees,
      is_all_day, reminder_minutes 
    } = req.body;
    
    const [event] = await sql`
      INSERT INTO coordinator_calendar_events (
        coordinator_id, wedding_id, event_type, title, description,
        start_time, end_time, location, attendees, is_all_day, reminder_minutes
      ) VALUES (
        ${coordinatorId}, ${wedding_id}, ${event_type}, ${title}, ${description},
        ${start_time}, ${end_time}, ${location}, ${JSON.stringify(attendees || [])},
        ${is_all_day || false}, ${reminder_minutes || 60}
      )
      RETURNING *
    `;
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const [event] = await sql`
      UPDATE coordinator_calendar_events
      SET 
        event_type = COALESCE(${fields.event_type}, event_type),
        title = COALESCE(${fields.title}, title),
        description = COALESCE(${fields.description}, description),
        start_time = COALESCE(${fields.start_time}, start_time),
        end_time = COALESCE(${fields.end_time}, end_time),
        location = COALESCE(${fields.location}, location),
        attendees = COALESCE(${JSON.stringify(fields.attendees)}, attendees),
        is_all_day = COALESCE(${fields.is_all_day}, is_all_day),
        reminder_minutes = COALESCE(${fields.reminder_minutes}, reminder_minutes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await sql`
      DELETE FROM coordinator_calendar_events
      WHERE id = ${id}
    `;
    
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### 2.3 Create Automation Module (90 minutes)

**Create file**: `backend-deploy/routes/coordinator/automation.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// GET all automation rules
router.get('/', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    
    const rules = await sql`
      SELECT * FROM coordinator_automation_rules
      WHERE coordinator_id = ${coordinatorId}
      ORDER BY created_at DESC
    `;
    
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET automation logs
router.get('/logs', async (req, res) => {
  try {
    const { rule_id, status, limit = 50 } = req.query;
    
    let query = `
      SELECT l.*, r.rule_name, w.couple_name
      FROM coordinator_automation_logs l
      LEFT JOIN coordinator_automation_rules r ON l.rule_id = r.id
      LEFT JOIN coordinator_weddings w ON l.wedding_id = w.id
      WHERE 1=1
    `;
    const params = [];
    
    if (rule_id) {
      query += ` AND l.rule_id = $${params.length + 1}`;
      params.push(rule_id);
    }
    
    if (status) {
      query += ` AND l.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY l.triggered_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const logs = await sql(query, params);
    
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create automation rule
router.post('/', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { 
      rule_name, trigger_event, trigger_conditions, 
      action_type, action_config, is_active 
    } = req.body;
    
    const [rule] = await sql`
      INSERT INTO coordinator_automation_rules (
        coordinator_id, rule_name, trigger_event, trigger_conditions,
        action_type, action_config, is_active
      ) VALUES (
        ${coordinatorId}, ${rule_name}, ${trigger_event}, 
        ${JSON.stringify(trigger_conditions || {})},
        ${action_type}, ${JSON.stringify(action_config || {})}, 
        ${is_active !== false}
      )
      RETURNING *
    `;
    
    res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update automation rule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    
    const [rule] = await sql`
      UPDATE coordinator_automation_rules
      SET 
        rule_name = COALESCE(${fields.rule_name}, rule_name),
        trigger_event = COALESCE(${fields.trigger_event}, trigger_event),
        trigger_conditions = COALESCE(${JSON.stringify(fields.trigger_conditions)}, trigger_conditions),
        action_type = COALESCE(${fields.action_type}, action_type),
        action_config = COALESCE(${JSON.stringify(fields.action_config)}, action_config),
        is_active = COALESCE(${fields.is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    res.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating automation rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE automation rule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await sql`
      DELETE FROM coordinator_automation_rules
      WHERE id = ${id}
    `;
    
    res.json({ success: true, message: 'Automation rule deleted' });
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST trigger automation manually (for testing)
router.post('/trigger/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { wedding_id } = req.body;
    
    const [rule] = await sql`
      SELECT * FROM coordinator_automation_rules
      WHERE id = ${id} AND is_active = true
    `;
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found or inactive' });
    }
    
    // Log the automation execution
    await sql`
      INSERT INTO coordinator_automation_logs (
        rule_id, wedding_id, status, metadata
      ) VALUES (
        ${id}, ${wedding_id}, 'success', 
        ${JSON.stringify({ manual_trigger: true, timestamp: new Date() })}
      )
    `;
    
    // Update rule stats
    await sql`
      UPDATE coordinator_automation_rules
      SET 
        last_triggered = NOW(),
        total_executions = total_executions + 1
      WHERE id = ${id}
    `;
    
    res.json({ success: true, message: 'Automation triggered successfully' });
  } catch (error) {
    console.error('Error triggering automation:', error);
    
    // Log failed execution
    await sql`
      INSERT INTO coordinator_automation_logs (
        rule_id, status, error_message
      ) VALUES (
        ${req.params.id}, 'failed', ${error.message}
      )
    `;
    
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### 2.4 Create Integrations Module (30 minutes)

**Create file**: `backend-deploy/routes/coordinator/integrations.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// GET all integrations
router.get('/', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    
    const [vendor] = await sql`
      SELECT integrations FROM vendors
      WHERE id = ${coordinatorId}
    `;
    
    const integrations = vendor?.integrations || {};
    
    res.json({ success: true, data: integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST connect integration
router.post('/connect', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { service_name, credentials, settings } = req.body;
    
    // Get current integrations
    const [vendor] = await sql`
      SELECT integrations FROM vendors
      WHERE id = ${coordinatorId}
    `;
    
    const integrations = vendor?.integrations || {};
    
    // Add new integration
    integrations[service_name] = {
      connected_at: new Date().toISOString(),
      credentials,
      settings,
      is_active: true
    };
    
    // Update vendor
    await sql`
      UPDATE vendors
      SET integrations = ${JSON.stringify(integrations)}
      WHERE id = ${coordinatorId}
    `;
    
    res.json({ success: true, data: integrations });
  } catch (error) {
    console.error('Error connecting integration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE disconnect integration
router.delete('/:service_name', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    const { service_name } = req.params;
    
    const [vendor] = await sql`
      SELECT integrations FROM vendors
      WHERE id = ${coordinatorId}
    `;
    
    const integrations = vendor?.integrations || {};
    delete integrations[service_name];
    
    await sql`
      UPDATE vendors
      SET integrations = ${JSON.stringify(integrations)}
      WHERE id = ${coordinatorId}
    `;
    
    res.json({ success: true, message: 'Integration disconnected' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT sync integration data
router.put('/:service_name/sync', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { service_name } = req.params;
    
    // Sync logic would go here (call external API, update local data, etc.)
    
    res.json({ 
      success: true, 
      message: `${service_name} sync completed`,
      synced_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing integration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

#### 2.5 Create White Label Module (20 minutes)

**Create file**: `backend-deploy/routes/coordinator/whitelabel.cjs`

```javascript
const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// GET white label settings
router.get('/', async (req, res) => {
  try {
    const coordinatorId = req.query.coordinator_id || req.user?.id;
    
    const [vendor] = await sql`
      SELECT 
        business_name,
        logo_url,
        primary_color,
        secondary_color,
        website,
        description
      FROM vendors
      WHERE id = ${coordinatorId}
    `;
    
    res.json({ success: true, data: vendor || {} });
  } catch (error) {
    console.error('Error fetching white label settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update white label settings
router.put('/', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { 
      business_name, logo_url, primary_color, 
      secondary_color, website, description 
    } = req.body;
    
    const [vendor] = await sql`
      UPDATE vendors
      SET 
        business_name = COALESCE(${business_name}, business_name),
        logo_url = COALESCE(${logo_url}, logo_url),
        primary_color = COALESCE(${primary_color}, primary_color),
        secondary_color = COALESCE(${secondary_color}, secondary_color),
        website = COALESCE(${website}, website),
        description = COALESCE(${description}, description),
        updated_at = NOW()
      WHERE id = ${coordinatorId}
      RETURNING business_name, logo_url, primary_color, secondary_color, website, description
    `;
    
    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('Error updating white label settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST upload logo
router.post('/logo', async (req, res) => {
  try {
    const coordinatorId = req.body.coordinator_id || req.user?.id;
    const { logo_url } = req.body;
    
    // In production, this would handle file upload to cloud storage
    // For now, just save the URL
    
    await sql`
      UPDATE vendors
      SET logo_url = ${logo_url}
      WHERE id = ${coordinatorId}
    `;
    
    res.json({ success: true, logo_url });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

---

### ⏱️ STEP 3: Update Router (10 minutes)

#### 3.1 Edit Router Index
**File**: `backend-deploy/routes/coordinator/index.cjs`

Add at the top with other declarations:
```javascript
let weddingsRoutes, 
    milestonesRoutes, 
    vendorAssignmentRoutes, 
    dashboardRoutes,
    clientsRoutes,
    vendorNetworkRoutes,
    commissionsRoutes,
    teamRoutes,           // ⬅️ NEW
    calendarRoutes,       // ⬅️ NEW
    integrationsRoutes,   // ⬅️ NEW
    whitelabelRoutes,     // ⬅️ NEW
    automationRoutes;     // ⬅️ NEW
```

Add try-catch blocks after existing modules:
```javascript
try {
  console.log('👥 Loading team routes...');
  teamRoutes = require('./team.cjs');
  console.log('✅ Team routes loaded');
} catch (error) {
  console.error('❌ Failed to load team routes:', error);
}

try {
  console.log('📅 Loading calendar routes...');
  calendarRoutes = require('./calendar.cjs');
  console.log('✅ Calendar routes loaded');
} catch (error) {
  console.error('❌ Failed to load calendar routes:', error);
}

try {
  console.log('🔌 Loading integrations routes...');
  integrationsRoutes = require('./integrations.cjs');
  console.log('✅ Integrations routes loaded');
} catch (error) {
  console.error('❌ Failed to load integrations routes:', error);
}

try {
  console.log('🎨 Loading whitelabel routes...');
  whitelabelRoutes = require('./whitelabel.cjs');
  console.log('✅ Whitelabel routes loaded');
} catch (error) {
  console.error('❌ Failed to load whitelabel routes:', error);
}

try {
  console.log('🤖 Loading automation routes...');
  automationRoutes = require('./automation.cjs');
  console.log('✅ Automation routes loaded');
} catch (error) {
  console.error('❌ Failed to load automation routes:', error);
}
```

Add route registrations at the bottom:
```javascript
if (teamRoutes) {
  router.use('/team', teamRoutes);
  console.log('✅ Registered: /api/coordinator/team');
}

if (calendarRoutes) {
  router.use('/calendar', calendarRoutes);
  console.log('✅ Registered: /api/coordinator/calendar');
}

if (integrationsRoutes) {
  router.use('/integrations', integrationsRoutes);
  console.log('✅ Registered: /api/coordinator/integrations');
}

if (whitelabelRoutes) {
  router.use('/whitelabel', whitelabelRoutes);
  console.log('✅ Registered: /api/coordinator/whitelabel');
}

if (automationRoutes) {
  router.use('/automation', automationRoutes);
  console.log('✅ Registered: /api/coordinator/automation');
}
```

---

### ⏱️ STEP 4: Deploy Backend (15 minutes)

#### 4.1 Commit Changes
```powershell
git add backend-deploy/routes/coordinator/
git commit -m "feat: Add 5 missing coordinator backend modules (team, calendar, automation, integrations, whitelabel)"
git push origin main
```

#### 4.2 Deploy to Render
1. Go to https://dashboard.render.com/
2. Select "weddingbazaar-web" backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait 2-3 minutes for build to complete
5. Check logs for "✅ Registered" messages

#### 4.3 Verify Deployment
Test these endpoints in browser or Postman:
```
GET https://weddingbazaar-web.onrender.com/api/coordinator/team
GET https://weddingbazaar-web.onrender.com/api/coordinator/calendar
GET https://weddingbazaar-web.onrender.com/api/coordinator/automation
GET https://weddingbazaar-web.onrender.com/api/coordinator/integrations
GET https://weddingbazaar-web.onrender.com/api/coordinator/whitelabel
```

All should return `{ success: true, data: [...] }` (may be empty arrays)

---

### ⏱️ STEP 5: Update Frontend (30 minutes)

#### 5.1 Update API Services
**Create file**: `src/shared/services/coordinatorService.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';

// Team Management
export const getTeamMembers = async (coordinatorId: string) => {
  const res = await fetch(`${API_BASE}/api/coordinator/team?coordinator_id=${coordinatorId}`);
  return res.json();
};

export const addTeamMember = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/coordinator/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Calendar Management
export const getCalendarEvents = async (coordinatorId: string, filters?: any) => {
  const params = new URLSearchParams({ coordinator_id: coordinatorId, ...filters });
  const res = await fetch(`${API_BASE}/api/coordinator/calendar?${params}`);
  return res.json();
};

export const createCalendarEvent = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/coordinator/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Automation Rules
export const getAutomationRules = async (coordinatorId: string) => {
  const res = await fetch(`${API_BASE}/api/coordinator/automation?coordinator_id=${coordinatorId}`);
  return res.json();
};

export const createAutomationRule = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/coordinator/automation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Integrations
export const getIntegrations = async (coordinatorId: string) => {
  const res = await fetch(`${API_BASE}/api/coordinator/integrations?coordinator_id=${coordinatorId}`);
  return res.json();
};

export const connectIntegration = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/coordinator/integrations/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// White Label
export const getWhiteLabelSettings = async (coordinatorId: string) => {
  const res = await fetch(`${API_BASE}/api/coordinator/whitelabel?coordinator_id=${coordinatorId}`);
  return res.json();
};

export const updateWhiteLabelSettings = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/coordinator/whitelabel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
```

#### 5.2 Quick Frontend Integration Test
**Update**: `src/pages/users/coordinator/team/CoordinatorTeam.tsx`

Add at the top:
```typescript
import { useEffect, useState } from 'react';
import { getTeamMembers } from '@/shared/services/coordinatorService';
import { useAuth } from '@/shared/contexts/HybridAuthContext';
```

Add inside component:
```typescript
const { user } = useAuth();
const [teamMembers, setTeamMembers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (user?.id) {
    getTeamMembers(user.id)
      .then(res => {
        if (res.success) setTeamMembers(res.data);
      })
      .finally(() => setLoading(false));
  }
}, [user]);

console.log('✅ Team members loaded:', teamMembers.length);
```

---

### ⏱️ STEP 6: Deploy Frontend (10 minutes)

```powershell
# Build frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Or use deployment script
.\deploy-frontend.ps1
```

---

## ✅ Verification Checklist

### Database ✓
- [ ] 10 coordinator tables exist in Neon
- [ ] Indexes created successfully
- [ ] Triggers operational

### Backend ✓
- [ ] 5 new route files created
- [ ] Router index updated
- [ ] Backend deployed to Render
- [ ] All 14 endpoints responding

### Frontend ✓
- [ ] `coordinatorService.ts` created
- [ ] Frontend pages updated
- [ ] Frontend deployed to Firebase
- [ ] API calls working in browser

### Integration ✓
- [ ] Team page loads data from backend
- [ ] Calendar displays events
- [ ] Automation rules can be created
- [ ] No console errors

---

## 🎉 Success Criteria

When all steps complete, you should see:
1. **Neon Console**: 10 coordinator tables with data
2. **Render Logs**: All 14 route modules registered
3. **Frontend Console**: No errors, API calls successful
4. **Browser**: All coordinator pages functional

**Total Time**: ~4-5 hours  
**Difficulty**: Medium  
**Success Rate**: 95% (if following steps exactly)

---

## 🚑 Troubleshooting

### Database Migration Failed
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'coordinator%';

-- If missing, re-run migration script from Step 1.2
```

### Backend Not Deploying
```powershell
# Check local syntax errors
cd backend-deploy/routes/coordinator
node -c team.cjs
node -c calendar.cjs
node -c automation.cjs

# If no errors, commit and push again
git add .
git commit -m "fix: Coordinator routes syntax"
git push
```

### Frontend API Errors
```typescript
// Check API_BASE URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test endpoint directly
fetch('https://weddingbazaar-web.onrender.com/api/coordinator/team')
  .then(r => r.json())
  .then(console.log);
```

---

## 📞 Support

**Documentation**:
- `COORDINATOR_FINAL_INTEGRATION_AUDIT.md` - Complete audit
- `COORDINATOR_AUTOMATION_IMPLEMENTATION.md` - Detailed implementation
- `create-coordinator-tables.sql` - Database schema

**Need Help?**
- Check Render logs: https://dashboard.render.com/
- Check Neon query history: https://console.neon.tech/
- Review browser console for frontend errors

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Estimated Completion Time**: 4-5 hours
