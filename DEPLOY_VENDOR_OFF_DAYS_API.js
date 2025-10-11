// 🎯 VENDOR OFF DAYS API - READY TO DEPLOY TO BACKEND
// Add these endpoints to your existing backend server

const express = require('express');
const { Pool } = require('pg');

/**
 * VENDOR OFF DAYS API ENDPOINTS
 * Table: vendor_off_days (already exists in your database!)
 * 
 * Add these routes to your existing backend server
 */

// GET /api/vendors/:vendorId/off-days
// Fetch all off days for a vendor
app.get('/api/vendors/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log(`📅 [API] Fetching off days for vendor: ${vendorId}`);
    
    // Query your existing vendor_off_days table
    const result = await pool.query(`
      SELECT 
        id,
        vendor_id,
        date,
        reason,
        is_recurring,
        recurring_pattern,
        created_at,
        updated_at
      FROM vendor_off_days 
      WHERE vendor_id = $1 
      AND (date >= CURRENT_DATE OR is_recurring = true)
      ORDER BY date ASC
    `, [vendorId]);
    
    const offDays = result.rows.map(row => ({
      id: row.id.toString(),
      vendorId: row.vendor_id,
      date: row.date.toISOString().split('T')[0], // YYYY-MM-DD format
      reason: row.reason || 'Personal time off',
      isRecurring: row.is_recurring || false,
      recurringPattern: row.recurring_pattern,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    console.log(`✅ [API] Found ${offDays.length} off days for vendor ${vendorId}`);
    
    res.json({
      success: true,
      offDays: offDays
    });
    
  } catch (error) {
    console.error('❌ [API] Error fetching vendor off days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch off days',
      error: error.message
    });
  }
});

// POST /api/vendors/:vendorId/off-days
// Create a new off day for a vendor
app.post('/api/vendors/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { date, reason, isRecurring, recurringPattern } = req.body;
    
    console.log(`📝 [API] Creating off day for vendor ${vendorId} on ${date}`);
    
    // Validate required fields
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Check if off day already exists for this date
    const existingCheck = await pool.query(`
      SELECT id FROM vendor_off_days 
      WHERE vendor_id = $1 AND date = $2
    `, [vendorId, date]);
    
    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Off day already exists for this date'
      });
    }
    
    // Insert new off day using your existing table
    const result = await pool.query(`
      INSERT INTO vendor_off_days (
        vendor_id, 
        date, 
        reason, 
        is_recurring, 
        recurring_pattern,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [
      vendorId, 
      date, 
      reason || 'Personal time off', 
      isRecurring || false, 
      recurringPattern || null
    ]);
    
    const newOffDay = result.rows[0];
    
    console.log(`✅ [API] Created off day ${newOffDay.id} for vendor ${vendorId}`);
    
    res.json({
      success: true,
      message: 'Off day created successfully',
      offDay: {
        id: newOffDay.id.toString(),
        vendorId: newOffDay.vendor_id,
        date: newOffDay.date.toISOString().split('T')[0],
        reason: newOffDay.reason,
        isRecurring: newOffDay.is_recurring,
        recurringPattern: newOffDay.recurring_pattern
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Error creating vendor off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create off day',
      error: error.message
    });
  }
});

// DELETE /api/vendors/:vendorId/off-days/:offDayId
// Remove an off day for a vendor
app.delete('/api/vendors/:vendorId/off-days/:offDayId', async (req, res) => {
  try {
    const { vendorId, offDayId } = req.params;
    
    console.log(`🗑️ [API] Deleting off day ${offDayId} for vendor ${vendorId}`);
    
    // Delete from your existing vendor_off_days table
    const result = await pool.query(`
      DELETE FROM vendor_off_days 
      WHERE id = $1 AND vendor_id = $2
      RETURNING *
    `, [offDayId, vendorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Off day not found'
      });
    }
    
    const deletedOffDay = result.rows[0];
    
    console.log(`✅ [API] Deleted off day ${offDayId} for vendor ${vendorId}`);
    
    res.json({
      success: true,
      message: 'Off day deleted successfully',
      deletedOffDay: {
        id: deletedOffDay.id.toString(),
        date: deletedOffDay.date.toISOString().split('T')[0],
        reason: deletedOffDay.reason
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Error deleting vendor off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete off day',
      error: error.message
    });
  }
});

// POST /api/vendors/:vendorId/off-days/bulk
// Create multiple off days at once (for bulk operations)
app.post('/api/vendors/:vendorId/off-days/bulk', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { offDays } = req.body;
    
    console.log(`📦 [API] Creating ${offDays.length} off days for vendor ${vendorId}`);
    
    if (!offDays || !Array.isArray(offDays) || offDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'offDays array is required'
      });
    }
    
    const createdOffDays = [];
    
    // Process each off day
    for (const offDay of offDays) {
      const { date, reason, isRecurring, recurringPattern } = offDay;
      
      if (!date) {
        console.warn(`⚠️ Skipping off day without date:`, offDay);
        continue;
      }
      
      try {
        // Check if already exists
        const existingCheck = await pool.query(`
          SELECT id FROM vendor_off_days 
          WHERE vendor_id = $1 AND date = $2
        `, [vendorId, date]);
        
        if (existingCheck.rows.length > 0) {
          console.warn(`⚠️ Off day already exists for ${date}, skipping`);
          continue;
        }
        
        // Insert the off day
        const result = await pool.query(`
          INSERT INTO vendor_off_days (
            vendor_id, 
            date, 
            reason, 
            is_recurring, 
            recurring_pattern,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `, [
          vendorId, 
          date, 
          reason || 'Personal time off', 
          isRecurring || false, 
          recurringPattern || null
        ]);
        
        const newOffDay = result.rows[0];
        createdOffDays.push({
          id: newOffDay.id.toString(),
          vendorId: newOffDay.vendor_id,
          date: newOffDay.date.toISOString().split('T')[0],
          reason: newOffDay.reason,
          isRecurring: newOffDay.is_recurring,
          recurringPattern: newOffDay.recurring_pattern
        });
        
      } catch (error) {
        console.error(`❌ Error creating off day for ${date}:`, error);
      }
    }
    
    console.log(`✅ [API] Created ${createdOffDays.length} off days for vendor ${vendorId}`);
    
    res.json({
      success: true,
      message: `Created ${createdOffDays.length} off days successfully`,
      offDays: createdOffDays
    });
    
  } catch (error) {
    console.error('❌ [API] Error creating bulk off days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create off days',
      error: error.message
    });
  }
});

// GET /api/vendors/:vendorId/off-days/count
// Get count of off days for analytics
app.get('/api/vendors/:vendorId/off-days/count', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_off_days,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_off_days,
        COUNT(CASE WHEN is_recurring = true THEN 1 END) as recurring_off_days
      FROM vendor_off_days 
      WHERE vendor_id = $1
    `, [vendorId]);
    
    const stats = result.rows[0];
    
    res.json({
      success: true,
      stats: {
        totalOffDays: parseInt(stats.total_off_days),
        upcomingOffDays: parseInt(stats.upcoming_off_days),
        recurringOffDays: parseInt(stats.recurring_off_days)
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Error fetching off days count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch off days count',
      error: error.message
    });
  }
});

/**
 * 🚀 DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Add these routes to your existing backend server
 * 2. Make sure you have the database connection (pool) configured
 * 3. The vendor_off_days table already exists in your database
 * 4. Deploy to Render
 * 5. Test the endpoints
 * 6. Frontend will automatically switch from localStorage to database!
 * 
 * 🎯 ENDPOINTS READY:
 * - GET /api/vendors/:vendorId/off-days
 * - POST /api/vendors/:vendorId/off-days
 * - DELETE /api/vendors/:vendorId/off-days/:offDayId
 * - POST /api/vendors/:vendorId/off-days/bulk
 * - GET /api/vendors/:vendorId/off-days/count
 */

module.exports = {
  // Export functions if needed for testing
};
