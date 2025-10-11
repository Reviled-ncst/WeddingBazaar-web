// routes/vendorOffDays.js
// Vendor Off Days API Routes - ADD THIS FILE TO YOUR BACKEND

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Use your existing database connection
// Assuming you have a database connection available
// If you use a different connection method, adjust accordingly

/**
 * GET /api/vendors/:vendorId/off-days
 * Fetch all off days for a specific vendor
 */
router.get('/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log(`📅 [VendorOffDays] Fetching off days for vendor: ${vendorId}`);
    
    // Query the vendor_off_days table (which already exists in your database)
    const query = `
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
    `;
    
    // Use your existing database connection method
    // Replace 'db' with your actual database connection variable
    const result = await db.query(query, [vendorId]);
    
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
    
    console.log(`✅ [VendorOffDays] Found ${offDays.length} off days for vendor ${vendorId}`);
    
    res.json({
      success: true,
      offDays: offDays
    });
    
  } catch (error) {
    console.error('❌ [VendorOffDays] Error fetching off days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch off days',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/vendors/:vendorId/off-days
 * Create a new off day for a vendor
 */
router.post('/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { date, reason, isRecurring, recurringPattern } = req.body;
    
    console.log(`📝 [VendorOffDays] Creating off day for vendor ${vendorId} on ${date}`);
    
    // Validate required fields
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format'
      });
    }
    
    // Check if off day already exists for this date
    const existingQuery = `
      SELECT id FROM vendor_off_days 
      WHERE vendor_id = $1 AND date = $2
    `;
    const existingResult = await db.query(existingQuery, [vendorId, date]);
    
    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Off day already exists for this date'
      });
    }
    
    // Insert new off day into the existing vendor_off_days table
    const insertQuery = `
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
    `;
    
    const insertResult = await db.query(insertQuery, [
      vendorId, 
      date, 
      reason || 'Personal time off', 
      isRecurring || false, 
      recurringPattern || null
    ]);
    
    const newOffDay = insertResult.rows[0];
    
    console.log(`✅ [VendorOffDays] Created off day ${newOffDay.id} for vendor ${vendorId}`);
    
    res.status(201).json({
      success: true,
      message: 'Off day created successfully',
      offDay: {
        id: newOffDay.id.toString(),
        vendorId: newOffDay.vendor_id,
        date: newOffDay.date.toISOString().split('T')[0],
        reason: newOffDay.reason,
        isRecurring: newOffDay.is_recurring,
        recurringPattern: newOffDay.recurring_pattern,
        createdAt: newOffDay.created_at,
        updatedAt: newOffDay.updated_at
      }
    });
    
  } catch (error) {
    console.error('❌ [VendorOffDays] Error creating off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create off day',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/vendors/:vendorId/off-days/:offDayId
 * Remove an off day for a vendor
 */
router.delete('/:vendorId/off-days/:offDayId', async (req, res) => {
  try {
    const { vendorId, offDayId } = req.params;
    
    console.log(`🗑️ [VendorOffDays] Deleting off day ${offDayId} for vendor ${vendorId}`);
    
    // Delete from the vendor_off_days table
    const deleteQuery = `
      DELETE FROM vendor_off_days 
      WHERE id = $1 AND vendor_id = $2
      RETURNING *
    `;
    
    const result = await db.query(deleteQuery, [offDayId, vendorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Off day not found or does not belong to this vendor'
      });
    }
    
    const deletedOffDay = result.rows[0];
    
    console.log(`✅ [VendorOffDays] Deleted off day ${offDayId} for vendor ${vendorId}`);
    
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
    console.error('❌ [VendorOffDays] Error deleting off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete off day',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/vendors/:vendorId/off-days/bulk
 * Create multiple off days at once (for bulk operations)
 */
router.post('/:vendorId/off-days/bulk', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { offDays } = req.body;
    
    console.log(`📦 [VendorOffDays] Creating ${offDays?.length || 0} off days for vendor ${vendorId}`);
    
    if (!offDays || !Array.isArray(offDays) || offDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'offDays array is required and must not be empty'
      });
    }
    
    const createdOffDays = [];
    const errors = [];
    
    // Process each off day
    for (let i = 0; i < offDays.length; i++) {
      const offDay = offDays[i];
      const { date, reason, isRecurring, recurringPattern } = offDay;
      
      try {
        if (!date) {
          errors.push(`Off day ${i + 1}: Date is required`);
          continue;
        }
        
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
          errors.push(`Off day ${i + 1}: Invalid date format (use YYYY-MM-DD)`);
          continue;
        }
        
        // Check if already exists
        const existingQuery = `
          SELECT id FROM vendor_off_days 
          WHERE vendor_id = $1 AND date = $2
        `;
        const existingResult = await db.query(existingQuery, [vendorId, date]);
        
        if (existingResult.rows.length > 0) {
          errors.push(`Off day ${i + 1}: Already exists for date ${date}`);
          continue;
        }
        
        // Insert the off day
        const insertQuery = `
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
        `;
        
        const insertResult = await db.query(insertQuery, [
          vendorId, 
          date, 
          reason || 'Personal time off', 
          isRecurring || false, 
          recurringPattern || null
        ]);
        
        const newOffDay = insertResult.rows[0];
        createdOffDays.push({
          id: newOffDay.id.toString(),
          vendorId: newOffDay.vendor_id,
          date: newOffDay.date.toISOString().split('T')[0],
          reason: newOffDay.reason,
          isRecurring: newOffDay.is_recurring,
          recurringPattern: newOffDay.recurring_pattern,
          createdAt: newOffDay.created_at,
          updatedAt: newOffDay.updated_at
        });
        
      } catch (error) {
        console.error(`❌ Error creating off day ${i + 1} for ${date}:`, error);
        errors.push(`Off day ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`✅ [VendorOffDays] Created ${createdOffDays.length} off days for vendor ${vendorId}`);
    
    res.status(createdOffDays.length > 0 ? 201 : 400).json({
      success: createdOffDays.length > 0,
      message: `Created ${createdOffDays.length} off days successfully`,
      offDays: createdOffDays,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('❌ [VendorOffDays] Error creating bulk off days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create off days',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/vendors/:vendorId/off-days/count
 * Get count of off days for analytics
 */
router.get('/:vendorId/off-days/count', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log(`📊 [VendorOffDays] Getting off days count for vendor ${vendorId}`);
    
    const query = `
      SELECT 
        COUNT(*) as total_off_days,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_off_days,
        COUNT(CASE WHEN is_recurring = true THEN 1 END) as recurring_off_days
      FROM vendor_off_days 
      WHERE vendor_id = $1
    `;
    
    const result = await db.query(query, [vendorId]);
    const stats = result.rows[0];
    
    console.log(`✅ [VendorOffDays] Stats for vendor ${vendorId}:`, stats);
    
    res.json({
      success: true,
      stats: {
        totalOffDays: parseInt(stats.total_off_days),
        upcomingOffDays: parseInt(stats.upcoming_off_days),
        recurringOffDays: parseInt(stats.recurring_off_days)
      }
    });
    
  } catch (error) {
    console.error('❌ [VendorOffDays] Error fetching off days count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch off days count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
