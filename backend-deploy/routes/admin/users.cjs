/**
 * Admin Users API Module
 * Handles user management endpoints for admin panel
 * Uses Neon serverless sql tag for database operations
 */

const express = require('express');
const { sql } = require('../../config/database.cjs');
const router = express.Router();

/**
 * GET /api/admin/users
 * Get all users with stats
 */
router.get('/', async (req, res) => {
  try {
    console.log('📊 [AdminAPI] Fetching all users for admin...');

    // Get all users
    const users = await sql`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        status,
        created_at,
        last_login,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    // Calculate stats
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      byRole: {
        individual: users.filter(u => u.role === 'individual').length,
        vendor: users.filter(u => u.role === 'vendor').length,
        admin: users.filter(u => u.role === 'admin').length
      }
    };

    console.log(`✅ [AdminAPI] Found ${users.length} users`);
    console.log('📈 [AdminAPI] Stats:', stats);

    res.json({
      success: true,
      users,
      stats
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

/**
 * GET /api/admin/users/stats
 * Get user statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended,
        COUNT(*) FILTER (WHERE role = 'individual') as individuals,
        COUNT(*) FILTER (WHERE role = 'vendor') as vendors,
        COUNT(*) FILTER (WHERE role = 'admin') as admins
      FROM users
    `;

    const stats = result[0];
    
    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total),
        active: parseInt(stats.active),
        inactive: parseInt(stats.inactive),
        suspended: parseInt(stats.suspended),
        byRole: {
          individual: parseInt(stats.individuals),
          vendor: parseInt(stats.vendors),
          admin: parseInt(stats.admins)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📊 [AdminAPI] Fetching user details for ID: ${id}`);

    const result = await sql`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        status,
        created_at,
        last_login,
        updated_at
      FROM users
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ [AdminAPI] Found user: ${result[0].email}`);

    res.json({
      success: true,
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/users
 * Create a new user
 */
router.post('/', async (req, res) => {
  try {
    const { email, first_name, last_name, phone, role, password } = req.body;

    // Validation
    if (!email || !first_name || !last_name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log(`📊 [AdminAPI] Creating new user: ${email}`);

    const result = await sql`
      INSERT INTO users (email, first_name, last_name, phone, role, password_hash, status)
      VALUES (${email}, ${first_name}, ${last_name}, ${phone || null}, ${role}, ${password || 'changeme'}, 'active')
      RETURNING id, email, first_name, last_name, phone, role, status, created_at
    `;

    console.log(`✅ [AdminAPI] User created successfully: ${result[0].id}`);

    res.status(201).json({
      success: true,
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error creating user:', error);
    
    // Handle duplicate email
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      details: error.message
    });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user details
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`📊 [AdminAPI] Updating user: ${id}`, updates);

    // For now, support specific fields
    const { first_name, last_name, phone, role, status } = updates;

    const result = await sql`
      UPDATE users
      SET 
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        phone = COALESCE(${phone}, phone),
        role = COALESCE(${role}, role),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, phone, role, status, created_at, last_login, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ [AdminAPI] User updated successfully: ${id}`);

    res.json({
      success: true,
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      details: error.message
    });
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Update user status (active/inactive/suspended)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    console.log(`📊 [AdminAPI] Updating user status: ${id} -> ${status}`);

    const result = await sql`
      UPDATE users
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, role, status, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ [AdminAPI] User status updated: ${id} -> ${status}`);

    res.json({
      success: true,
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      details: error.message
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (soft delete recommended)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📊 [AdminAPI] Deleting user: ${id}`);

    // Soft delete by setting status to inactive
    const result = await sql`
      UPDATE users
      SET status = 'inactive', updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`✅ [AdminAPI] User soft-deleted: ${id}`);

    res.json({
      success: true,
      message: 'User deleted successfully',
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      details: error.message
    });
  }
});

module.exports = router;
