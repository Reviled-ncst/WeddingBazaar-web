/**
 * Coordinator Milestones Management Routes
 * Handles wedding milestone CRUD operations and completion tracking
 */

const express = require('express');
const { sql } = require('../../config/database.cjs');
const { authenticateToken } = require('../../middleware/auth.cjs');

const router = express.Router();

/**
 * POST /api/coordinator/weddings/:weddingId/milestones
 * Create a new milestone for a wedding
 */
router.post('/weddings/:weddingId/milestones', authenticateToken, async (req, res) => {
  try {
    const { weddingId } = req.params;
    const coordinatorId = req.user.userId;
    const { title, description, due_date } = req.body;

    // Verify wedding belongs to coordinator
    const wedding = await sql`
      SELECT * FROM coordinator_weddings
      WHERE id = ${weddingId} AND coordinator_id = ${coordinatorId}
    `;

    if (wedding.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found or access denied' 
      });
    }

    // Create milestone
    const milestone = await sql`
      INSERT INTO wedding_milestones (
        wedding_id, title, description, due_date, completed
      ) VALUES (
        ${weddingId}, ${title}, ${description}, ${due_date}, false
      ) RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${weddingId}, 'milestone_added',
        'Added milestone: ' || ${title}
      )
    `;

    res.json({ 
      success: true, 
      milestone: milestone[0],
      message: 'Milestone created successfully' 
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/coordinator/weddings/:weddingId/milestones
 * Get all milestones for a wedding
 */
router.get('/weddings/:weddingId/milestones', authenticateToken, async (req, res) => {
  try {
    const { weddingId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify wedding belongs to coordinator
    const wedding = await sql`
      SELECT * FROM coordinator_weddings
      WHERE id = ${weddingId} AND coordinator_id = ${coordinatorId}
    `;

    if (wedding.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wedding not found or access denied' 
      });
    }

    // Get milestones with completion stats
    const milestones = await sql`
      SELECT * FROM wedding_milestones
      WHERE wedding_id = ${weddingId}
      ORDER BY due_date ASC, created_at ASC
    `;

    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed THEN 1 END) as completed_count,
        ROUND(COUNT(CASE WHEN completed THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 2) as completion_percentage
      FROM wedding_milestones
      WHERE wedding_id = ${weddingId}
    `;

    res.json({ 
      success: true, 
      milestones,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /api/coordinator/milestones/:milestoneId
 * Update milestone details
 */
router.put('/milestones/:milestoneId', authenticateToken, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const coordinatorId = req.user.userId;
    const { title, description, due_date } = req.body;

    // Verify milestone belongs to coordinator's wedding
    const milestone = await sql`
      SELECT wm.*, cw.coordinator_id
      FROM wedding_milestones wm
      JOIN coordinator_weddings cw ON wm.wedding_id = cw.id
      WHERE wm.id = ${milestoneId} AND cw.coordinator_id = ${coordinatorId}
    `;

    if (milestone.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Milestone not found or access denied' 
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (due_date !== undefined) updates.due_date = due_date;
    updates.updated_at = new Date();

    // Update milestone
    const updated = await sql`
      UPDATE wedding_milestones
      SET ${sql(updates)}
      WHERE id = ${milestoneId}
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${milestone[0].wedding_id}, 'milestone_updated',
        'Updated milestone: ' || ${title || milestone[0].title}
      )
    `;

    res.json({ 
      success: true, 
      milestone: updated[0],
      message: 'Milestone updated successfully' 
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /api/coordinator/milestones/:milestoneId/complete
 * Mark milestone as complete or incomplete
 */
router.put('/milestones/:milestoneId/complete', authenticateToken, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const coordinatorId = req.user.userId;
    const { completed } = req.body; // true or false

    // Verify milestone belongs to coordinator's wedding
    const milestone = await sql`
      SELECT wm.*, cw.coordinator_id
      FROM wedding_milestones wm
      JOIN coordinator_weddings cw ON wm.wedding_id = cw.id
      WHERE wm.id = ${milestoneId} AND cw.coordinator_id = ${coordinatorId}
    `;

    if (milestone.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Milestone not found or access denied' 
      });
    }

    // Update completion status
    const updated = await sql`
      UPDATE wedding_milestones
      SET 
        completed = ${completed},
        completed_at = ${completed ? new Date() : null},
        updated_at = NOW()
      WHERE id = ${milestoneId}
      RETURNING *
    `;

    // Update wedding progress
    const progress = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed THEN 1 END) as completed_count
      FROM wedding_milestones
      WHERE wedding_id = ${milestone[0].wedding_id}
    `;

    const progressPercent = Math.round(
      (progress[0].completed_count / progress[0].total) * 100
    );

    await sql`
      UPDATE coordinator_weddings
      SET progress = ${progressPercent}, updated_at = NOW()
      WHERE id = ${milestone[0].wedding_id}
    `;

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${milestone[0].wedding_id}, 
        ${completed ? 'milestone_completed' : 'milestone_reopened'},
        ${completed ? 'Completed' : 'Reopened'} || ' milestone: ' || ${milestone[0].title}
      )
    `;

    res.json({ 
      success: true, 
      milestone: updated[0],
      wedding_progress: progressPercent,
      message: `Milestone ${completed ? 'completed' : 'reopened'} successfully` 
    });
  } catch (error) {
    console.error('Error updating milestone completion:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /api/coordinator/milestones/:milestoneId
 * Delete a milestone
 */
router.delete('/milestones/:milestoneId', authenticateToken, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const coordinatorId = req.user.userId;

    // Verify milestone belongs to coordinator's wedding
    const milestone = await sql`
      SELECT wm.*, cw.coordinator_id
      FROM wedding_milestones wm
      JOIN coordinator_weddings cw ON wm.wedding_id = cw.id
      WHERE wm.id = ${milestoneId} AND cw.coordinator_id = ${coordinatorId}
    `;

    if (milestone.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Milestone not found or access denied' 
      });
    }

    // Delete milestone
    await sql`
      DELETE FROM wedding_milestones
      WHERE id = ${milestoneId}
    `;

    // Update wedding progress
    const progress = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN completed THEN 1 END) as completed_count
      FROM wedding_milestones
      WHERE wedding_id = ${milestone[0].wedding_id}
    `;

    if (progress[0].total > 0) {
      const progressPercent = Math.round(
        (progress[0].completed_count / progress[0].total) * 100
      );
      await sql`
        UPDATE coordinator_weddings
        SET progress = ${progressPercent}, updated_at = NOW()
        WHERE id = ${milestone[0].wedding_id}
      `;
    } else {
      await sql`
        UPDATE coordinator_weddings
        SET progress = 0, updated_at = NOW()
        WHERE id = ${milestone[0].wedding_id}
      `;
    }

    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id, wedding_id, activity_type, description
      ) VALUES (
        ${coordinatorId}, ${milestone[0].wedding_id}, 'milestone_deleted',
        'Deleted milestone: ' || ${milestone[0].title}
      )
    `;

    res.json({ 
      success: true, 
      message: 'Milestone deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
