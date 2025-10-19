/**
 * Wedding Bazaar - Group Chat Routes
 * Multi-participant conversation support
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create group conversation
router.post('/conversations/group', async (req, res) => {
  try {
    const {
      creator_id,
      group_name,
      group_description,
      booking_id,
      participants = []
    } = req.body;

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create conversation
    const convResult = await pool.query(`
      INSERT INTO conversations (
        id, creator_id, conversation_type, group_name,
        group_description, booking_id, created_at, updated_at
      ) VALUES ($1, $2, 'group', $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [conversationId, creator_id, group_name, group_description, booking_id]);

    // Add participants
    for (const participant of participants) {
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await pool.query(`
        INSERT INTO conversation_participants (
          id, conversation_id, user_id, user_name,
          user_type, user_avatar, role, is_active,
          notification_enabled, joined_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, NOW())
      `, [
        participantId,
        conversationId,
        participant.user_id,
        participant.user_name,
        participant.user_type,
        participant.user_avatar || null,
        participant.role || 'member'
      ]);
    }

    res.json({ success: true, conversation: convResult.rows[0] });
  } catch (error) {
    console.error('Error creating group conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add participant to conversation
router.post('/conversations/:conversationId/participants', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const {
      user_id,
      user_name,
      user_type,
      user_avatar,
      role = 'member'
    } = req.body;

    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(`
      INSERT INTO conversation_participants (
        id, conversation_id, user_id, user_name,
        user_type, user_avatar, role, is_active,
        notification_enabled, joined_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, NOW())
      RETURNING *
    `, [
      participantId, conversationId, user_id, user_name,
      user_type, user_avatar, role
    ]);

    res.json({ success: true, participant: result.rows[0] });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get conversation participants
router.get('/conversations/:conversationId/participants', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const result = await pool.query(`
      SELECT * FROM conversation_participants
      WHERE conversation_id = $1 AND is_active = true
      ORDER BY joined_at ASC
    `, [conversationId]);

    res.json({ success: true, participants: result.rows });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove participant from conversation
router.delete('/conversations/:conversationId/participants/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;

    await pool.query(`
      UPDATE conversation_participants
      SET is_active = false
      WHERE id = $1
    `, [participantId]);

    res.json({ success: true, message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update participant role
router.put('/conversations/:conversationId/participants/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const { role, notification_enabled } = req.body;

    const result = await pool.query(`
      UPDATE conversation_participants
      SET 
        role = COALESCE($1, role),
        notification_enabled = COALESCE($2, notification_enabled)
      WHERE id = $3
      RETURNING *
    `, [role, notification_enabled, participantId]);

    res.json({ success: true, participant: result.rows[0] });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
