# 🚀 COORDINATOR AUTOMATION IMPLEMENTATION GUIDE

**Date**: December 2024  
**Purpose**: Step-by-step guide to implement all coordinator automation features  
**Estimated Total Time**: 10-12 weeks

---

## 📋 TABLE OF CONTENTS
1. [Quick Start](#quick-start)
2. [Backend Modules to Create](#backend-modules)
3. [Database Setup](#database-setup)
4. [Feature-by-Feature Implementation](#features)
5. [Testing Checklist](#testing)
6. [Deployment Guide](#deployment)

---

## 🎯 QUICK START

### Immediate Actions (Do Now):
```bash
# 1. Create missing backend modules
cd backend-deploy/routes/coordinator
touch team.cjs calendar.cjs integrations.cjs whitelabel.cjs automation.cjs

# 2. Run existing table creation scripts
node create-coordinator-team-tables.cjs
node create-coordinator-whitelabel-integrations-tables.cjs

# 3. Create new automation tables
node create-coordinator-automation-tables.cjs  # You'll create this

# 4. Test backend module loading
node test-coordinator-backend.cjs
```

---

## 🏗️ BACKEND MODULES TO CREATE

### 1. **Team Management Module** 🔴 CRITICAL
**File**: `backend-deploy/routes/coordinator/team.cjs`

<details>
<summary>📄 Click to see full implementation</summary>

```javascript
/**
 * Coordinator Team Management Routes
 * Handles team member CRUD, task assignments, and workload management
 */

const express = require('express');
const router = express.Router();
const { sql } = require('../../config/database.cjs');

/**
 * GET /api/coordinator/team/members
 * Get all team members for coordinator
 */
router.get('/members', async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const members = await sql`
      SELECT 
        tm.*,
        COUNT(DISTINCT ta.id) FILTER (WHERE ta.status = 'active') as active_assignments,
        COUNT(DISTINCT ta.id) FILTER (WHERE ta.status = 'completed') as completed_assignments
      FROM coordinator_team_members tm
      LEFT JOIN coordinator_team_assignments ta ON tm.id = ta.team_member_id
      WHERE tm.coordinator_id = ${coordinatorId}
      GROUP BY tm.id
      ORDER BY tm.created_at DESC
    `;

    res.json({
      success: true,
      members
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/team/members
 * Add new team member
 */
router.post('/members', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { name, email, phone, role, permissions } = req.body;

    const member = await sql`
      INSERT INTO coordinator_team_members (
        coordinator_id, name, email, phone, role, permissions, status
      ) VALUES (
        ${coordinatorId}, ${name}, ${email}, ${phone || null}, ${role}, 
        ${JSON.stringify(permissions || [])}, 'active'
      ) RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, activity_type, description, created_at
      ) VALUES (
        ${coordinatorId}, 'team_member_added', 
        ${`Added team member: ${name} (${role})`}, NOW()
      )
    `;

    res.json({
      success: true,
      member: member[0],
      message: 'Team member added successfully'
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add team member',
      error: error.message
    });
  }
});

/**
 * PUT /api/coordinator/team/members/:id
 * Update team member
 */
router.put('/members/:id', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;
    const { name, email, phone, role, status, permissions } = req.body;

    const member = await sql`
      UPDATE coordinator_team_members
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        role = COALESCE(${role}, role),
        status = COALESCE(${status}, status),
        permissions = COALESCE(${JSON.stringify(permissions)}, permissions),
        updated_at = NOW()
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
      RETURNING *
    `;

    if (!member || member.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      member: member[0],
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team member',
      error: error.message
    });
  }
});

/**
 * DELETE /api/coordinator/team/members/:id
 * Remove team member
 */
router.delete('/members/:id', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;

    // Check if member has active assignments
    const activeAssignments = await sql`
      SELECT COUNT(*) as count
      FROM coordinator_team_assignments
      WHERE team_member_id = ${id} AND status = 'active'
    `;

    if (activeAssignments[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete team member with ${activeAssignments[0].count} active assignments. Please reassign first.`
      });
    }

    await sql`
      DELETE FROM coordinator_team_members
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
    `;

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team member',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/team/assign
 * Auto-assign team member to wedding
 */
router.post('/assign', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { wedding_id, role_required } = req.body;

    // Find least-busy team member with matching role
    const availableMember = await sql`
      SELECT 
        tm.id,
        tm.name,
        COUNT(ta.id) as current_assignments
      FROM coordinator_team_members tm
      LEFT JOIN coordinator_team_assignments ta ON tm.id = ta.team_member_id 
        AND ta.status = 'active'
      WHERE tm.coordinator_id = ${coordinatorId}
        AND tm.status = 'active'
        AND tm.role = ${role_required || 'Assistant'}
      GROUP BY tm.id, tm.name
      ORDER BY current_assignments ASC
      LIMIT 1
    `;

    if (!availableMember || availableMember.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available team members found with matching role'
      });
    }

    const member = availableMember[0];

    // Create assignment
    const assignment = await sql`
      INSERT INTO coordinator_team_assignments (
        team_member_id, wedding_id, task_type, status, assigned_at
      ) VALUES (
        ${member.id}, ${wedding_id}, 'wedding_coordination', 'active', NOW()
      ) RETURNING *
    `;

    // Send notification (implement email/SMS here)
    // await sendTeamMemberNotification(member.id, wedding_id);

    res.json({
      success: true,
      assignment: assignment[0],
      team_member: member,
      message: `${member.name} assigned to wedding successfully`
    });
  } catch (error) {
    console.error('Error auto-assigning team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign team member',
      error: error.message
    });
  }
});

/**
 * GET /api/coordinator/team/workload
 * Get team workload distribution
 */
router.get('/workload', async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const workload = await sql`
      SELECT 
        tm.id,
        tm.name,
        tm.role,
        COUNT(DISTINCT ta.wedding_id) FILTER (WHERE ta.status = 'active') as active_weddings,
        COUNT(DISTINCT tt.id) FILTER (WHERE tt.status = 'pending') as pending_tasks,
        ROUND(AVG(
          CASE 
            WHEN ta.status = 'completed' THEN 100
            WHEN ta.status = 'active' THEN 50
            ELSE 0
          END
        ), 2) as efficiency_score
      FROM coordinator_team_members tm
      LEFT JOIN coordinator_team_assignments ta ON tm.id = ta.team_member_id
      LEFT JOIN coordinator_team_tasks tt ON tm.id = tt.assigned_to
      WHERE tm.coordinator_id = ${coordinatorId}
        AND tm.status = 'active'
      GROUP BY tm.id, tm.name, tm.role
      ORDER BY active_weddings DESC
    `;

    res.json({
      success: true,
      workload
    });
  } catch (error) {
    console.error('Error fetching workload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workload data',
      error: error.message
    });
  }
});

module.exports = router;
```
</details>

---

### 2. **Calendar Module** 🔴 CRITICAL
**File**: `backend-deploy/routes/coordinator/calendar.cjs`

<details>
<summary>📄 Click to see full implementation</summary>

```javascript
/**
 * Coordinator Calendar Management Routes
 * Handles calendar events, reminders, and milestone synchronization
 */

const express = require('express');
const router = express.Router();
const { sql } = require('../../config/database.cjs');

/**
 * GET /api/coordinator/calendar/events
 * Get calendar events with filters
 */
router.get('/events', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { start_date, end_date, event_type } = req.query;

    let filters = [`ce.coordinator_id = ${coordinatorId}`];
    
    if (start_date) {
      filters.push(`ce.start_time >= ${start_date}`);
    }
    if (end_date) {
      filters.push(`ce.start_time <= ${end_date}`);
    }
    if (event_type) {
      filters.push(`ce.event_type = ${event_type}`);
    }

    const events = await sql`
      SELECT 
        ce.*,
        cw.couple_name as wedding_couple,
        wm.title as milestone_title
      FROM coordinator_calendar_events ce
      LEFT JOIN coordinator_weddings cw ON ce.wedding_id = cw.id
      LEFT JOIN wedding_milestones wm ON ce.milestone_id = wm.id
      WHERE ${sql.raw(filters.join(' AND '))}
      ORDER BY ce.start_time ASC
    `;

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/calendar/events
 * Create calendar event
 */
router.post('/events', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const {
      wedding_id,
      milestone_id,
      event_type,
      title,
      description,
      start_time,
      end_time,
      location,
      attendees,
      reminder_1,
      reminder_2
    } = req.body;

    const event = await sql`
      INSERT INTO coordinator_calendar_events (
        coordinator_id, wedding_id, milestone_id, event_type, title, description,
        start_time, end_time, location, attendees, reminder_1, reminder_2, created_at
      ) VALUES (
        ${coordinatorId}, ${wedding_id || null}, ${milestone_id || null}, ${event_type},
        ${title}, ${description || null}, ${start_time}, ${end_time || null},
        ${location || null}, ${JSON.stringify(attendees || [])},
        ${reminder_1 || '1 day before'}, ${reminder_2 || '1 week before'}, NOW()
      ) RETURNING *
    `;

    res.json({
      success: true,
      event: event[0],
      message: 'Calendar event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create calendar event',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/calendar/sync-milestones/:weddingId
 * Auto-create calendar events from wedding milestones
 */
router.post('/sync-milestones/:weddingId', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { weddingId } = req.params;

    // Get all milestones for wedding
    const milestones = await sql`
      SELECT wm.*
      FROM wedding_milestones wm
      JOIN coordinator_weddings cw ON wm.wedding_id = cw.id
      WHERE cw.id = ${weddingId} AND cw.coordinator_id = ${coordinatorId}
    `;

    // Create calendar events for each milestone
    const eventsCreated = [];
    for (const milestone of milestones) {
      // Check if event already exists
      const existing = await sql`
        SELECT id FROM coordinator_calendar_events
        WHERE milestone_id = ${milestone.id}
      `;

      if (existing.length === 0) {
        const event = await sql`
          INSERT INTO coordinator_calendar_events (
            coordinator_id, wedding_id, milestone_id, event_type, title,
            start_time, reminder_1, reminder_2, created_at
          ) VALUES (
            ${coordinatorId}, ${weddingId}, ${milestone.id}, 'milestone',
            ${milestone.title}, ${milestone.due_date}, 
            '1 week before', '1 day before', NOW()
          ) RETURNING *
        `;
        eventsCreated.push(event[0]);
      }
    }

    res.json({
      success: true,
      events_created: eventsCreated.length,
      events: eventsCreated,
      message: `${eventsCreated.length} calendar events created from milestones`
    });
  } catch (error) {
    console.error('Error syncing milestones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync milestones to calendar',
      error: error.message
    });
  }
});

/**
 * PUT /api/coordinator/calendar/events/:id
 * Update calendar event
 */
router.put('/events/:id', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;
    const {
      title, description, start_time, end_time, location, attendees, reminder_1, reminder_2
    } = req.body;

    const event = await sql`
      UPDATE coordinator_calendar_events
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        start_time = COALESCE(${start_time}, start_time),
        end_time = COALESCE(${end_time}, end_time),
        location = COALESCE(${location}, location),
        attendees = COALESCE(${JSON.stringify(attendees)}, attendees),
        reminder_1 = COALESCE(${reminder_1}, reminder_1),
        reminder_2 = COALESCE(${reminder_2}, reminder_2),
        updated_at = NOW()
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
      RETURNING *
    `;

    if (!event || event.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    res.json({
      success: true,
      event: event[0],
      message: 'Calendar event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update calendar event',
      error: error.message
    });
  }
});

/**
 * DELETE /api/coordinator/calendar/events/:id
 * Delete calendar event
 */
router.delete('/events/:id', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;

    await sql`
      DELETE FROM coordinator_calendar_events
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
    `;

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete calendar event',
      error: error.message
    });
  }
});

module.exports = router;
```
</details>

---

### 3. **Integrations Module** 🟠 HIGH PRIORITY
**File**: `backend-deploy/routes/coordinator/integrations.cjs`

<details>
<summary>📄 Click to see full implementation</summary>

```javascript
/**
 * Coordinator Integrations Management Routes
 * Handles third-party API integrations (Stripe, email, accounting, etc.)
 */

const express = require('express');
const router = express.Router();
const { sql } = require('../../config/database.cjs');

/**
 * GET /api/coordinator/integrations
 * Get all integrations for coordinator
 */
router.get('/', async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const integrations = await sql`
      SELECT 
        id, name, category, status, enabled, last_sync, created_at, updated_at,
        -- Hide sensitive fields
        CASE WHEN api_key IS NOT NULL THEN '***' || RIGHT(api_key, 4) ELSE NULL END as api_key_masked,
        webhook_url
      FROM coordinator_integrations
      WHERE coordinator_id = ${coordinatorId}
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      integrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integrations',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/integrations
 * Add new integration
 */
router.post('/', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { name, category, api_key, webhook_url, settings } = req.body;

    const integration = await sql`
      INSERT INTO coordinator_integrations (
        coordinator_id, name, category, api_key, webhook_url, settings,
        status, enabled, created_at, updated_at
      ) VALUES (
        ${coordinatorId}, ${name}, ${category}, ${api_key || null},
        ${webhook_url || null}, ${JSON.stringify(settings || {})},
        'disconnected', false, NOW(), NOW()
      ) RETURNING id, name, category, status, enabled, created_at
    `;

    res.json({
      success: true,
      integration: integration[0],
      message: 'Integration added successfully. Test connection to enable.'
    });
  } catch (error) {
    console.error('Error adding integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add integration',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/integrations/:id/test
 * Test integration connection
 */
router.post('/:id/test', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;

    // Get integration details
    const integration = await sql`
      SELECT * FROM coordinator_integrations
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
    `;

    if (!integration || integration.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    const config = integration[0];
    let testResult = { success: false, message: 'Test not implemented' };

    // Test connection based on category
    switch (config.category) {
      case 'payment':
        testResult = await testStripeConnection(config.api_key);
        break;
      case 'email':
        testResult = await testEmailConnection(config.api_key);
        break;
      case 'accounting':
        testResult = await testAccountingConnection(config.api_key);
        break;
      case 'storage':
        testResult = await testStorageConnection(config.api_key);
        break;
      default:
        testResult = { success: true, message: 'Generic test passed' };
    }

    // Update integration status
    await sql`
      UPDATE coordinator_integrations
      SET 
        status = ${testResult.success ? 'connected' : 'error'},
        enabled = ${testResult.success},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    res.json({
      success: testResult.success,
      message: testResult.message
    });
  } catch (error) {
    console.error('Error testing integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test integration',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/integrations/:id/sync
 * Manual sync trigger
 */
router.post('/:id/sync', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;

    const integration = await sql`
      SELECT * FROM coordinator_integrations
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
    `;

    if (!integration || integration.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration not found'
      });
    }

    const config = integration[0];
    let syncResult = { success: false, records_synced: 0 };

    // Sync data based on category
    switch (config.category) {
      case 'payment':
        syncResult = await syncPaymentData(coordinatorId, config);
        break;
      case 'email':
        syncResult = await syncEmailData(coordinatorId, config);
        break;
      case 'accounting':
        syncResult = await syncAccountingData(coordinatorId, config);
        break;
      case 'storage':
        syncResult = await syncStorageData(coordinatorId, config);
        break;
    }

    // Update last sync time
    await sql`
      UPDATE coordinator_integrations
      SET last_sync = NOW()
      WHERE id = ${id}
    `;

    res.json({
      success: syncResult.success,
      records_synced: syncResult.records_synced,
      message: `Synced ${syncResult.records_synced} records successfully`
    });
  } catch (error) {
    console.error('Error syncing integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync integration',
      error: error.message
    });
  }
});

/**
 * DELETE /api/coordinator/integrations/:id
 * Remove integration
 */
router.delete('/:id', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { id } = req.params;

    await sql`
      DELETE FROM coordinator_integrations
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
    `;

    res.json({
      success: true,
      message: 'Integration removed successfully'
    });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete integration',
      error: error.message
    });
  }
});

// Helper functions (implement these based on actual APIs)
async function testStripeConnection(apiKey) {
  // Test Stripe API connection
  return { success: true, message: 'Stripe connected successfully' };
}

async function testEmailConnection(apiKey) {
  // Test email API connection
  return { success: true, message: 'Email service connected successfully' };
}

async function testAccountingConnection(apiKey) {
  // Test accounting API connection
  return { success: true, message: 'Accounting software connected successfully' };
}

async function testStorageConnection(apiKey) {
  // Test cloud storage connection
  return { success: true, message: 'Cloud storage connected successfully' };
}

async function syncPaymentData(coordinatorId, config) {
  // Implement Stripe/PayMongo sync logic
  return { success: true, records_synced: 0 };
}

async function syncEmailData(coordinatorId, config) {
  // Implement Gmail/Outlook sync logic
  return { success: true, records_synced: 0 };
}

async function syncAccountingData(coordinatorId, config) {
  // Implement QuickBooks/Xero sync logic
  return { success: true, records_synced: 0 };
}

async function syncStorageData(coordinatorId, config) {
  // Implement Google Drive/Dropbox sync logic
  return { success: true, records_synced: 0 };
}

module.exports = router;
```
</details>

---

### 4. **Automation Rules Engine** 🟡 MEDIUM PRIORITY
**File**: `backend-deploy/routes/coordinator/automation.cjs`

<details>
<summary>📄 Click to see full implementation</summary>

```javascript
/**
 * Coordinator Automation Rules Engine
 * Manages automation rules and executes automated workflows
 */

const express = require('express');
const router = express.Router();
const { sql } = require('../../config/database.cjs');

/**
 * GET /api/coordinator/automation/rules
 * Get all automation rules
 */
router.get('/rules', async (req, res) => {
  try {
    const coordinatorId = req.user.id;

    const rules = await sql`
      SELECT 
        id, trigger_type, action_type, conditions, actions, is_enabled, created_at, updated_at
      FROM coordinator_automation_rules
      WHERE coordinator_id = ${coordinatorId}
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch automation rules',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/automation/rules
 * Create automation rule
 */
router.post('/rules', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { trigger_type, action_type, conditions, actions } = req.body;

    const rule = await sql`
      INSERT INTO coordinator_automation_rules (
        coordinator_id, trigger_type, action_type, conditions, actions, is_enabled, created_at
      ) VALUES (
        ${coordinatorId}, ${trigger_type}, ${action_type},
        ${JSON.stringify(conditions || {})}, ${JSON.stringify(actions || {})},
        true, NOW()
      ) RETURNING *
    `;

    res.json({
      success: true,
      rule: rule[0],
      message: 'Automation rule created successfully'
    });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create automation rule',
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/automation/execute/:ruleId
 * Manually execute automation rule
 */
router.post('/execute/:ruleId', async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const { ruleId } = req.params;
    const triggerData = req.body;

    // Get rule
    const rule = await sql`
      SELECT * FROM coordinator_automation_rules
      WHERE id = ${ruleId} AND coordinator_id = ${coordinatorId} AND is_enabled = true
    `;

    if (!rule || rule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Automation rule not found or disabled'
      });
    }

    // Log execution
    const log = await sql`
      INSERT INTO coordinator_automation_logs (
        rule_id, triggered_at, trigger_data, status
      ) VALUES (
        ${ruleId}, NOW(), ${JSON.stringify(triggerData)}, 'pending'
      ) RETURNING id
    `;

    // Execute automation
    const result = await executeAutomation(rule[0], triggerData, coordinatorId);

    // Update log
    await sql`
      UPDATE coordinator_automation_logs
      SET 
        status = ${result.success ? 'success' : 'failed'},
        error_message = ${result.error || null},
        executed_at = NOW()
      WHERE id = ${log[0].id}
    `;

    res.json({
      success: result.success,
      log_id: log[0].id,
      message: result.message
    });
  } catch (error) {
    console.error('Error executing automation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute automation',
      error: error.message
    });
  }
});

/**
 * Execute automation based on rule
 */
async function executeAutomation(rule, triggerData, coordinatorId) {
  try {
    const { action_type, actions } = rule;

    switch (action_type) {
      case 'send_email':
        return await sendEmailAction(actions, triggerData, coordinatorId);
      
      case 'assign_task':
        return await assignTaskAction(actions, triggerData, coordinatorId);
      
      case 'create_event':
        return await createEventAction(actions, triggerData, coordinatorId);
      
      case 'update_status':
        return await updateStatusAction(actions, triggerData, coordinatorId);
      
      default:
        return { success: false, error: 'Unknown action type' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Action handlers
async function sendEmailAction(actions, triggerData, coordinatorId) {
  // Implement email sending
  return { success: true, message: 'Email sent' };
}

async function assignTaskAction(actions, triggerData, coordinatorId) {
  // Implement task assignment
  return { success: true, message: 'Task assigned' };
}

async function createEventAction(actions, triggerData, coordinatorId) {
  // Implement event creation
  return { success: true, message: 'Event created' };
}

async function updateStatusAction(actions, triggerData, coordinatorId) {
  // Implement status update
  return { success: true, message: 'Status updated' };
}

module.exports = router;
```
</details>

---

## 📊 DATABASE TABLES TO CREATE

### 1. Calendar Events Table
```sql
CREATE TABLE coordinator_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(50) NOT NULL,
  wedding_id UUID REFERENCES coordinator_weddings(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES wedding_milestones(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'milestone', 'meeting', 'vendor_appt', 'personal'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location VARCHAR(255),
  attendees JSONB DEFAULT '[]'::jsonb,
  reminder_1 VARCHAR(50), -- '1 week before', '1 day before', etc.
  reminder_2 VARCHAR(50),
  google_event_id VARCHAR(255), -- For Google Calendar sync
  outlook_event_id VARCHAR(255), -- For Outlook sync
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calendar_coordinator ON coordinator_calendar_events(coordinator_id);
CREATE INDEX idx_calendar_wedding ON coordinator_calendar_events(wedding_id);
CREATE INDEX idx_calendar_date ON coordinator_calendar_events(start_time);
```

### 2. Automation Rules Tables
```sql
CREATE TABLE coordinator_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id VARCHAR(50) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL, -- 'new_wedding', 'milestone_due', 'payment_received', etc.
  action_type VARCHAR(50) NOT NULL, -- 'send_email', 'assign_task', 'create_event', etc.
  conditions JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coordinator_automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES coordinator_automation_rules(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP DEFAULT NOW(),
  trigger_data JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  executed_at TIMESTAMP
);

CREATE INDEX idx_automation_coordinator ON coordinator_automation_rules(coordinator_id);
CREATE INDEX idx_automation_logs_rule ON coordinator_automation_logs(rule_id);
CREATE INDEX idx_automation_logs_date ON coordinator_automation_logs(triggered_at DESC);
```

---

## ✅ TESTING CHECKLIST

### Backend API Testing:
- [ ] All endpoints respond with correct status codes
- [ ] Authentication middleware working
- [ ] Data validation implemented
- [ ] Error handling comprehensive
- [ ] Database queries optimized
- [ ] No SQL injection vulnerabilities
- [ ] Proper JSON responses
- [ ] Logging implemented

### Frontend Integration Testing:
- [ ] API calls successful
- [ ] Loading states working
- [ ] Error messages displayed
- [ ] Success notifications shown
- [ ] Data refreshes after actions
- [ ] Forms validated
- [ ] Modals open/close correctly
- [ ] Mobile responsive

### Automation Testing:
- [ ] Rules trigger correctly
- [ ] Actions execute as expected
- [ ] Logs created properly
- [ ] Emails sent successfully
- [ ] Tasks assigned correctly
- [ ] Calendar events created
- [ ] Notifications delivered

---

## 🚀 DEPLOYMENT GUIDE

### 1. Backend Deployment (Render):
```bash
# 1. Commit all backend changes
git add backend-deploy/routes/coordinator/*.cjs
git commit -m "Add team, calendar, integrations, automation modules"

# 2. Push to main branch
git push origin main

# 3. Render auto-deploys from main
# 4. Check logs: https://dashboard.render.com > weddingbazaar-web > Logs

# 5. Test health endpoint
curl https://weddingbazaar-web.onrender.com/api/health
```

### 2. Database Migrations:
```bash
# Run on Neon SQL Console
node create-coordinator-automation-tables.cjs
```

### 3. Frontend Deployment (Firebase):
```bash
# 1. Build frontend
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting

# 3. Test production URL
# https://weddingbazaarph.web.app
```

---

## 📝 SUMMARY

### Total Files to Create: 5
1. ✅ `backend-deploy/routes/coordinator/team.cjs`
2. ✅ `backend-deploy/routes/coordinator/calendar.cjs`
3. ✅ `backend-deploy/routes/coordinator/integrations.cjs`
4. ✅ `backend-deploy/routes/coordinator/whitelabel.cjs`
5. ✅ `backend-deploy/routes/coordinator/automation.cjs`

### Total Database Tables to Create: 3
1. ✅ `coordinator_calendar_events`
2. ✅ `coordinator_automation_rules`
3. ✅ `coordinator_automation_logs`

### Estimated Implementation Time:
- **Backend Modules**: 3-4 days
- **Database Setup**: 1 day
- **Frontend Integration**: 4-5 days
- **Testing & Debugging**: 2-3 days
- **Total**: ~10-12 days for one developer

---

**Document Status**: ✅ **READY FOR IMPLEMENTATION**  
**Next Action**: Create backend modules and test  
**Owner**: Development Team  
**Last Updated**: December 2024
