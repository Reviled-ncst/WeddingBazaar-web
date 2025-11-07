/**
 * Admin Users API Module
 * Handles user management endpoints for admin panel
 * Uses Neon serverless sql tag for database operations
 */

const express = require('express');

// Import database with error handling
let sql;
try {
  console.log('🔍 Loading database module for admin users...');
  const dbModule = require('../../config/database.cjs');
  sql = dbModule.sql;
  console.log('✅ Database module loaded successfully');
  console.log('   - sql type:', typeof sql);
  
  if (!sql || typeof sql !== 'function') {
    throw new Error('Database module did not export a valid sql function');
  }
} catch (error) {
  console.error('❌ Failed to load database module:', error);
  throw error;
}

const router = express.Router();

/**
 * GET /api/admin/users
 * Get all users with stats
 */
router.get('/', async (req, res) => {
  try {
    console.log('📊 [AdminAPI] Fetching all users for admin...');

    // Get all users
    const usersRaw = await sql`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        phone,
        user_type,
        created_at,
        updated_at,
        email_verified,
        phone_verified
      FROM users
      ORDER BY created_at DESC
    `;

    // Transform users to match frontend expectations
    const users = usersRaw.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.user_type === 'couple' ? 'individual' : user.user_type, // Map couple -> individual
      status: user.email_verified ? 'active' : 'inactive', // Derive status from verification
      created_at: user.created_at,
      last_login: user.updated_at, // Use updated_at as last_login proxy
      updated_at: user.updated_at
    }));

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
        COUNT(*) FILTER (WHERE email_verified = true) as active,
        COUNT(*) FILTER (WHERE email_verified = false) as inactive,
        COUNT(*) FILTER (WHERE user_type = 'couple') as couples,
        COUNT(*) FILTER (WHERE user_type = 'vendor') as vendors,
        COUNT(*) FILTER (WHERE user_type = 'admin') as admins
      FROM users
    `;

    const stats = result[0];
    
    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total),
        active: parseInt(stats.active),
        inactive: parseInt(stats.inactive),
        suspended: 0, // Not tracked in current schema
        byRole: {
          individual: parseInt(stats.couples), // Map couple -> individual
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
        user_type,
        created_at,
        updated_at,
        email_verified,
        phone_verified
      FROM users
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Transform to match frontend expectations
    const user = {
      id: result[0].id,
      email: result[0].email,
      first_name: result[0].first_name,
      last_name: result[0].last_name,
      phone: result[0].phone,
      role: result[0].user_type === 'couple' ? 'individual' : result[0].user_type,
      status: result[0].email_verified ? 'active' : 'inactive',
      created_at: result[0].created_at,
      last_login: result[0].updated_at,
      updated_at: result[0].updated_at
    };

    console.log(`✅ [AdminAPI] Found user: ${user.email}`);

    res.json({
      success: true,
      user
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

    // Map frontend role to database user_type
    const user_type = role === 'individual' ? 'couple' : role;

    console.log(`📊 [AdminAPI] Creating new user: ${email} (role: ${role} -> user_type: ${user_type})`);

    // Generate a random ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password || 'changeme', 10);

    const result = await sql`
      INSERT INTO users (id, email, first_name, last_name, phone, user_type, password, email_verified)
      VALUES (${userId}, ${email}, ${first_name}, ${last_name}, ${phone || null}, ${user_type}, ${hashedPassword}, true)
      RETURNING id, email, first_name, last_name, phone, user_type, created_at, email_verified
    `;

    // Transform response
    const newUser = {
      id: result[0].id,
      email: result[0].email,
      first_name: result[0].first_name,
      last_name: result[0].last_name,
      phone: result[0].phone,
      role: result[0].user_type === 'couple' ? 'individual' : result[0].user_type,
      status: result[0].email_verified ? 'active' : 'inactive',
      created_at: result[0].created_at
    };

    console.log(`✅ [AdminAPI] User created successfully: ${newUser.id}`);

    res.status(201).json({
      success: true,
      user: newUser
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

    // Map frontend role to database user_type
    const user_type = role ? (role === 'individual' ? 'couple' : role) : undefined;
    
    // Map status to email_verified
    const email_verified = status === 'active' ? true : (status === 'inactive' ? false : undefined);

    const result = await sql`
      UPDATE users
      SET 
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        phone = COALESCE(${phone}, phone),
        user_type = COALESCE(${user_type}, user_type),
        email_verified = COALESCE(${email_verified}, email_verified),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, phone, user_type, created_at, updated_at, email_verified
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Transform response
    const updatedUser = {
      id: result[0].id,
      email: result[0].email,
      first_name: result[0].first_name,
      last_name: result[0].last_name,
      phone: result[0].phone,
      role: result[0].user_type === 'couple' ? 'individual' : result[0].user_type,
      status: result[0].email_verified ? 'active' : 'inactive',
      created_at: result[0].created_at,
      last_login: result[0].updated_at,
      updated_at: result[0].updated_at
    };

    console.log(`✅ [AdminAPI] User updated successfully: ${id}`);

    res.json({
      success: true,
      user: updatedUser
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

    // Map status to email_verified (suspended not supported in current schema)
    const email_verified = status === 'active';

    const result = await sql`
      UPDATE users
      SET email_verified = ${email_verified}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, user_type, email_verified, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Transform response
    const updatedUser = {
      id: result[0].id,
      email: result[0].email,
      first_name: result[0].first_name,
      last_name: result[0].last_name,
      role: result[0].user_type === 'couple' ? 'individual' : result[0].user_type,
      status: result[0].email_verified ? 'active' : 'inactive',
      updated_at: result[0].updated_at
    };

    console.log(`✅ [AdminAPI] User status updated: ${id} -> ${status}`);

    res.json({
      success: true,
      user: updatedUser
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

    // Soft delete by setting email_verified to false
    const result = await sql`
      UPDATE users
      SET email_verified = false, updated_at = NOW()
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

/**
 * POST /api/admin/users/:id/suspend
 * Suspend a user with duration and reason
 */
router.post('/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const { duration_days, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason is required'
      });
    }

    if (!duration_days || duration_days < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid suspension duration is required'
      });
    }

    console.log(`🛡️ [AdminAPI] Suspending user ${id} for ${duration_days} days`);

    // Calculate suspension end date
    const suspension_end = new Date();
    suspension_end.setDate(suspension_end.getDate() + parseInt(duration_days));

    // Update user to suspended status
    const result = await sql`
      UPDATE users
      SET 
        account_status = 'suspended',
        suspension_end = ${suspension_end.toISOString()},
        suspension_reason = ${reason.trim()},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, account_status, suspension_end, suspension_reason
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log suspension in history (if table exists)
    try {
      await sql`
        INSERT INTO user_suspensions (user_id, reason, suspension_end)
        VALUES (${id}, ${reason.trim()}, ${suspension_end.toISOString()})
      `;
    } catch (historyError) {
      console.warn('⚠️ Could not log suspension history (table may not exist):', historyError.message);
    }

    res.json({
      success: true,
      message: `User suspended for ${duration_days} days`,
      user: result[0],
      suspension_end: suspension_end.toISOString()
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error suspending user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suspend user',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/users/:id/unsuspend
 * Remove suspension from a user
 */
router.post('/:id/unsuspend', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`✅ [AdminAPI] Removing suspension from user ${id}`);

    const result = await sql`
      UPDATE users
      SET 
        account_status = 'active',
        suspension_end = NULL,
        suspension_reason = NULL,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, account_status
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log unsuspension in history (if table exists)
    try {
      await sql`
        UPDATE user_suspensions
        SET removed_at = NOW()
        WHERE user_id = ${id} AND removed_at IS NULL
      `;
    } catch (historyError) {
      console.warn('⚠️ Could not update suspension history:', historyError.message);
    }

    res.json({
      success: true,
      message: 'Suspension removed successfully',
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error removing suspension:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove suspension',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/users/:id/ban
 * Permanently ban a user
 */
router.post('/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Ban reason is required'
      });
    }

    console.log(`🚫 [AdminAPI] Permanently banning user ${id}`);

    const result = await sql`
      UPDATE users
      SET 
        account_status = 'banned',
        ban_reason = ${reason.trim()},
        banned_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, account_status, ban_reason, banned_at
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log ban in history (if table exists)
    try {
      await sql`
        INSERT INTO user_bans (user_id, ban_reason, banned_at)
        VALUES (${id}, ${reason.trim()}, NOW())
      `;
    } catch (historyError) {
      console.warn('⚠️ Could not log ban history (table may not exist):', historyError.message);
    }

    res.json({
      success: true,
      message: 'User banned permanently',
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error banning user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban user',
      details: error.message
    });
  }
});

/**
 * POST /api/admin/users/:id/unban
 * Remove ban from a user
 */
router.post('/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`✅ [AdminAPI] Unbanning user ${id}`);

    const result = await sql`
      UPDATE users
      SET 
        account_status = 'active',
        ban_reason = NULL,
        banned_at = NULL,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, first_name, last_name, account_status
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Log unban in history (if table exists)
    try {
      await sql`
        UPDATE user_bans
        SET unbanned_at = NOW()
        WHERE user_id = ${id} AND unbanned_at IS NULL
      `;
    } catch (historyError) {
      console.warn('⚠️ Could not update ban history:', historyError.message);
    }

    res.json({
      success: true,
      message: 'User unbanned successfully',
      user: result[0]
    });

  } catch (error) {
    console.error('❌ [AdminAPI] Error unbanning user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unban user',
      details: error.message
    });
  }
});

module.exports = router;
