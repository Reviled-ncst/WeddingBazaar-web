const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Create notifications table if it doesn't exist
async function createNotificationsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Notifications table ready');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
  }
}

// Initialize table on module load
createNotificationsTable();

// Get notifications for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  console.log('🔔 Getting notifications for vendor:', req.params.vendorId);
  
  try {
    const { vendorId } = req.params;
    const { limit = 20, unreadOnly = false } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND user_type = 'vendor'
    `;
    
    if (unreadOnly === 'true') {
      query += ` AND is_read = FALSE`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $2`;
    
    const notifications = await sql(query, [vendorId, parseInt(limit)]);
    
    // If no notifications exist, create some sample ones
    if (notifications.length === 0) {
      console.log('📋 Creating sample notifications for vendor...');
      
      const sampleNotifications = [
        {
          id: `notif-${Date.now()}-1`,
          title: 'New Booking Request',
          message: 'You have a new booking request for your DJ services',
          type: 'booking',
          action_url: '/vendor/bookings'
        },
        {
          id: `notif-${Date.now()}-2`,
          title: 'Profile Update Needed',
          message: 'Please update your business hours and availability',
          type: 'profile',
          action_url: '/vendor/profile'
        },
        {
          id: `notif-${Date.now()}-3`,
          title: 'New Message',
          message: 'You have received a new message from a potential client',
          type: 'message',
          action_url: '/vendor/messages'
        }
      ];
      
      for (const notif of sampleNotifications) {
        await sql`
          INSERT INTO notifications (id, user_id, user_type, title, message, type, action_url, created_at, updated_at)
          VALUES (${notif.id}, ${vendorId}, 'vendor', ${notif.title}, ${notif.message}, ${notif.type}, ${notif.action_url}, NOW(), NOW())
        `;
      }
      
      // Re-fetch notifications
      const newNotifications = await sql(query, [vendorId, parseInt(limit)]);
      
      console.log(`✅ Created ${sampleNotifications.length} sample notifications`);
      
      return res.json({
        success: true,
        notifications: newNotifications,
        count: newNotifications.length,
        unreadCount: newNotifications.filter(n => !n.is_read).length,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Found ${notifications.length} notifications for vendor ${vendorId}`);
    
    res.json({
      success: true,
      notifications: notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.is_read).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get notifications for an individual/couple
router.get('/user/:userId', async (req, res) => {
  console.log('🔔 Getting notifications for user:', req.params.userId);
  
  try {
    const { userId } = req.params;
    const { limit = 20, unreadOnly = false } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND user_type = 'individual'
    `;
    
    if (unreadOnly === 'true') {
      query += ` AND is_read = FALSE`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $2`;
    
    const notifications = await sql(query, [userId, parseInt(limit)]);
    
    console.log(`✅ Found ${notifications.length} notifications for user ${userId}`);
    
    res.json({
      success: true,
      notifications: notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.is_read).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  console.log('✅ Marking notification as read:', req.params.notificationId);
  
  try {
    const { notificationId } = req.params;
    
    await sql`
      UPDATE notifications 
      SET is_read = TRUE, updated_at = NOW()
      WHERE id = ${notificationId}
    `;
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Mark read error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  console.log('➕ Creating new notification:', req.body);
  
  try {
    const {
      userId,
      userType,
      title,
      message,
      type = 'info',
      actionUrl,
      metadata = {}
    } = req.body;
    
    if (!userId || !userType || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, userType, title, and message are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = await sql`
      INSERT INTO notifications (
        id, user_id, user_type, title, message, type, 
        action_url, metadata, created_at, updated_at
      ) VALUES (
        ${notificationId}, ${userId}, ${userType}, ${title}, ${message}, ${type},
        ${actionUrl}, ${JSON.stringify(metadata)}, NOW(), NOW()
      ) RETURNING *
    `;
    
    console.log(`✅ Notification created: ${notificationId}`);
    
    res.json({
      success: true,
      notification: notification[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Create notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
