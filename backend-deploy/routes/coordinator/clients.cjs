/**
 * Coordinator Clients Management Routes
 * Handles client profiles, preferences, and communication
 */

const express = require('express');
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

const router = express.Router();

/**
 * GET /api/coordinator/clients
 * Get all clients managed by coordinator
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const { status, search, limit = 50, offset = 0 } = req.query;

    // Build filters
    let filters = [`cw.coordinator_id = ${coordinatorId}`];
    
    if (status) {
      filters.push(`cw.status = '${status}'`);
    }

    if (search) {
      filters.push(`(cw.couple_names ILIKE '%${search}%' OR u.email ILIKE '%${search}%')`);
    }

    const whereClause = filters.join(' AND ');

    // Get clients with wedding details
    const clients = await sql.unsafe(`
      SELECT 
        u.id as user_id,
        u.email,
        u.full_name,
        u.phone,
        cw.id as wedding_id,
        cw.couple_names,
        cw.event_date,
        cw.venue,
        cw.guest_count,
        cw.budget,
        cw.status,
        cw.progress,
        cw.created_at,
        COUNT(DISTINCT wm.id) as total_milestones,
        COUNT(DISTINCT CASE WHEN wm.completed THEN wm.id END) as completed_milestones,
        COUNT(DISTINCT va.id) as assigned_vendors
      FROM coordinator_weddings cw
      JOIN users u ON cw.user_id = u.id
      LEFT JOIN wedding_milestones wm ON cw.id = wm.wedding_id
      LEFT JOIN vendor_assignments va ON cw.id = va.wedding_id
      WHERE ${whereClause}
      GROUP BY u.id, u.email, u.full_name, u.phone, cw.id, cw.couple_names, 
               cw.event_date, cw.venue, cw.guest_count, cw.budget, cw.status, 
               cw.progress, cw.created_at
      ORDER BY cw.event_date ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count
    const countResult = await sql.unsafe(`
      SELECT COUNT(DISTINCT cw.id) as total
      FROM coordinator_weddings cw
      JOIN users u ON cw.user_id = u.id
      WHERE ${whereClause}
    `);

    res.json({ 
      success: true, 
      clients,
      pagination: {
        total: parseInt(countResult[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/clients/:userId
 * Get detailed client profile
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const coordinatorId = req.user.userId;

    // Get client profile
    const client = await sql`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.profile_image_url,
        u.created_at
      FROM users u
      WHERE u.id = ${userId}
    `;

    if (client.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Client not found' 
      });
    }

    // Get client's weddings with coordinator
    const weddings = await sql`
      SELECT * FROM coordinator_weddings
      WHERE user_id = ${userId} AND coordinator_id = ${coordinatorId}
      ORDER BY event_date DESC
    `;

    if (weddings.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied - client not managed by this coordinator' 
      });
    }

    // Get activity history
    const activity = await sql`
      SELECT * FROM coordinator_activity_log
      WHERE coordinator_id = ${coordinatorId}
        AND wedding_id IN (
          SELECT id FROM coordinator_weddings
          WHERE user_id = ${userId}
        )
      ORDER BY created_at DESC
      LIMIT 20
    `;

    res.json({ 
      success: true, 
      client: {
        ...client[0],
        weddings,
        recent_activity: activity
      }
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/coordinator/clients
 * Create a new client (standalone client without wedding)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;
    const {
      couple_name,
      email,
      phone,
      wedding_date,
      venue,
      budget_range,
      preferred_style,
      guest_count,
      notes,
      status = 'lead'
    } = req.body;

    // Validate required fields
    if (!couple_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'couple_name and email are required'
      });
    }

    // Create client record in coordinator_clients table
    const client = await sql`
      INSERT INTO coordinator_clients (
        coordinator_id, couple_name, email, phone, 
        status, budget_range, preferred_style, notes,
        last_contact, created_at, updated_at
      ) VALUES (
        ${coordinatorId}, ${couple_name}, ${email}, ${phone},
        ${status}, ${budget_range}, ${preferred_style}, ${notes},
        NOW(), NOW(), NOW()
      ) RETURNING *
    `;

    // If wedding details provided, create wedding record
    if (wedding_date) {
      const wedding = await sql`
        INSERT INTO coordinator_weddings (
          coordinator_id, couple_name, couple_email, couple_phone,
          wedding_date, venue, budget, guest_count, 
          preferred_style, notes, status, progress,
          created_at, updated_at
        ) VALUES (
          ${coordinatorId}, ${couple_name}, ${email}, ${phone},
          ${wedding_date}, ${venue}, ${budget_range}, ${guest_count},
          ${preferred_style}, ${notes}, 'planning', 0,
          NOW(), NOW()
        ) RETURNING *
      `;

      // Link wedding to client
      await sql`
        UPDATE coordinator_clients
        SET wedding_id = ${wedding[0].id}
        WHERE id = ${client[0].id}
      `;
    }

    res.json({
      success: true,
      client: client[0],
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/coordinator/clients/:id
 * Update client information
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.userId;
    const updates = req.body;

    // Build dynamic update
    const allowedFields = [
      'couple_name', 'email', 'phone', 'status', 
      'budget_range', 'preferred_style', 'notes', 'last_contact'
    ];

    const updateFields = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields[key] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.updated_at = new Date();

    const client = await sql`
      UPDATE coordinator_clients
      SET ${sql(updateFields)}
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
      RETURNING *
    `;

    if (client.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found or access denied'
      });
    }

    res.json({
      success: true,
      client: client[0],
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/coordinator/clients/:id
 * Delete client (soft delete - archive)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coordinatorId = req.user.userId;

    // Soft delete - mark as inactive instead of deleting
    const client = await sql`
      UPDATE coordinator_clients
      SET status = 'inactive', updated_at = NOW()
      WHERE id = ${id} AND coordinator_id = ${coordinatorId}
      RETURNING *
    `;

    if (client.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found or access denied'
      });
    }

    res.json({
      success: true,
      message: `Client ${client[0].couple_name} archived successfully`
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/clients/:userId/notes
 * Add private note about client
 */
router.post('/:userId/notes', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const coordinatorId = req.user.userId;
    const { wedding_id, note_text } = req.body;

    // Verify wedding belongs to coordinator
    const wedding = await sql`
      SELECT * FROM coordinator_weddings
      WHERE id = ${wedding_id} 
        AND coordinator_id = ${coordinatorId}
        AND user_id = ${userId}
    `;

    if (wedding.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found or access denied' 
      });
    }

    // Add note to activity log
    const note = await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${wedding_id}, 'private_note', ${note_text}
      ) RETURNING *
    `;

    res.json({ 
      success: true, 
      note: note[0],
      message: 'Note added successfully' 
    });
  } catch (error) {
    console.error('Error adding client note:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/clients/:userId/communication
 * Get communication history with client
 */
router.get('/:userId/communication', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify client is managed by coordinator
    const wedding = await sql`
      SELECT * FROM coordinator_weddings
      WHERE user_id = ${userId} AND coordinator_id = ${coordinatorId}
      LIMIT 1
    `;

    if (wedding.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied - client not managed by this coordinator' 
      });
    }

    // Get communication history (activity log + messages)
    const activity = await sql`
      SELECT 
        id,
        wedding_id,
        activity_type,
        description,
        created_at,
        'activity' as source_type
      FROM coordinator_activity_log
      WHERE coordinator_id = ${coordinatorId}
        AND wedding_id IN (
          SELECT id FROM coordinator_weddings WHERE user_id = ${userId}
        )
        AND activity_type IN ('message_sent', 'email_sent', 'call_logged', 'meeting_scheduled')
      ORDER BY created_at DESC
      LIMIT 50
    `;

    res.json({ 
      success: true, 
      communications: activity
    });
  } catch (error) {
    console.error('Error fetching communication history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/clients/stats
 * Get client statistics for coordinator
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const coordinatorId = req.user.userId;

    const stats = await sql`
      SELECT 
        COUNT(DISTINCT cw.user_id) as total_clients,
        COUNT(DISTINCT cw.id) as total_weddings,
        COUNT(DISTINCT CASE WHEN cw.status = 'planning' THEN cw.id END) as active_weddings,
        COUNT(DISTINCT CASE WHEN cw.status = 'completed' THEN cw.id END) as completed_weddings,
        COUNT(DISTINCT CASE WHEN cw.event_date > CURRENT_DATE THEN cw.id END) as upcoming_weddings,
        AVG(cw.progress) as avg_progress
      FROM coordinator_weddings cw
      WHERE cw.coordinator_id = ${coordinatorId}
    `;

    res.json({ 
      success: true, 
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
