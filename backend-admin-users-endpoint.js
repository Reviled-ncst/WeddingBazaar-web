// =============================================================================
// ADMIN USERS ENDPOINTS
// Add these endpoints to backend-deploy/index.js after line 2113
// =============================================================================

// Admin endpoint to get all users with stats
app.get('/api/admin/users', async (req, res) => {
    console.log('👥 [ADMIN] GET /api/admin/users called at', new Date().toISOString());
    
    try {
        // Get all users (excluding password)
        const usersQuery = `
            SELECT 
                id, 
                email, 
                user_type as role, 
                first_name, 
                last_name, 
                phone, 
                created_at,
                email_verified,
                phone_verified,
                avatar_url,
                CASE 
                    WHEN email_verified = true AND phone_verified = true THEN 'active'
                    WHEN email_verified = false OR phone_verified = false THEN 'inactive'
                    ELSE 'active'
                END as status
            FROM users 
            ORDER BY created_at DESC
        `;
        
        const usersResult = await db.query(usersQuery);
        const users = usersResult.rows;
        
        // Calculate stats
        const stats = {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            inactive: users.filter(u => u.status === 'inactive').length,
            suspended: 0,
            admins: users.filter(u => u.role === 'admin').length,
            vendors: users.filter(u => u.role === 'vendor').length,
            individuals: users.filter(u => u.role === 'couple' || u.role === 'individual').length
        };
        
        console.log(`✅ [ADMIN] Returning ${users.length} users with stats:`, stats);
        
        res.json({
            success: true,
            users: users,
            stats: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Failed to fetch users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});

// Admin endpoint to update user status
app.patch('/api/admin/users/:userId/status', async (req, res) => {
    console.log('🔄 [ADMIN] PATCH /api/admin/users/:userId/status called at', new Date().toISOString());
    
    const { userId } = req.params;
    const { status } = req.body;
    
    try {
        let updateQuery;
        if (status === 'active') {
            updateQuery = `
                UPDATE users 
                SET email_verified = true, phone_verified = true, updated_at = NOW()
                WHERE id = $1
                RETURNING id, email, user_type as role, first_name, last_name
            `;
        } else if (status === 'inactive') {
            updateQuery = `
                UPDATE users 
                SET email_verified = false, phone_verified = false, updated_at = NOW()
                WHERE id = $1
                RETURNING id, email, user_type as role, first_name, last_name
            `;
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                message: 'Status must be active or inactive'
            });
        }
        
        const result = await db.query(updateQuery, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                message: `No user found with id ${userId}`
            });
        }
        
        console.log(`✅ [ADMIN] Updated user ${userId} status to ${status}`);
        
        res.json({
            success: true,
            user: result.rows[0],
            message: `User status updated to ${status}`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Failed to update user status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
