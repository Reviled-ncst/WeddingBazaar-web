const express = require('express');
const router = express.Router();

/**
 * Vendor Off-Days Routes - Modular Architecture
 * These routes handle vendor availability/off-days management
 */

// GET /api/vendors/:vendorId/off-days - Get all off days for a vendor
router.get('/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`📅 [VendorOffDays] Fetching off days for vendor: ${vendorId}`);
    
    const { sql } = require('../config/database.cjs');
    
    // Query the vendor_off_days table
    const result = await sql`
      SELECT 
        id,
        vendor_id,
        date,
        reason,
        is_recurring,
        recurring_pattern,
        recurring_end_date,
        is_active,
        created_at,
        updated_at
      FROM vendor_off_days 
      WHERE vendor_id = ${vendorId} 
        AND is_active = true
        AND (date >= CURRENT_DATE OR is_recurring = true)
      ORDER BY date ASC
    `;
    
    const offDays = result.map(row => ({
      id: row.id.toString(),
      vendorId: row.vendor_id,
      date: row.date.toISOString().split('T')[0], // YYYY-MM-DD format
      reason: row.reason || 'Personal time off',
      isRecurring: row.is_recurring || false,
      recurringPattern: row.recurring_pattern,
      recurringEndDate: row.recurring_end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    console.log(`✅ [VendorOffDays] Found ${offDays.length} off days for vendor ${vendorId}`);
    
    res.json({
      success: true,
      vendorId,
      offDays: offDays,
      total: offDays.length
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

// POST /api/vendors/:vendorId/off-days - Add a single off day
router.post('/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { date, reason, isRecurring, recurringPattern, recurringEndDate } = req.body;
    
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
    
    const { sql } = require('../config/database.cjs');
    
    // Check if off day already exists for this date
    const existing = await sql`
      SELECT id FROM vendor_off_days 
      WHERE vendor_id = ${vendorId} AND date = ${date}
    `;
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Off day already exists for this date'
      });
    }
    
    // Insert new off day
    const result = await sql`
      INSERT INTO vendor_off_days (
        vendor_id, 
        date, 
        reason, 
        is_recurring, 
        recurring_pattern,
        recurring_end_date,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${vendorId}, 
        ${date}, 
        ${reason || 'Personal time off'}, 
        ${isRecurring || false}, 
        ${recurringPattern || null},
        ${recurringEndDate || null},
        true,
        NOW(), 
        NOW()
      )
      RETURNING *
    `;
    
    const newOffDay = result[0];
    
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
        recurringEndDate: newOffDay.recurring_end_date,
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

// POST /api/vendors/:vendorId/off-days/bulk - Add multiple off days
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
    
    const { sql } = require('../config/database.cjs');
    const createdOffDays = [];
    const errors = [];
    
    // Process each off day
    for (let i = 0; i < offDays.length; i++) {
      const offDay = offDays[i];
      const { date, reason, isRecurring, recurringPattern, recurringEndDate } = offDay;
      
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
        const existing = await sql`
          SELECT id FROM vendor_off_days 
          WHERE vendor_id = ${vendorId} AND date = ${date}
        `;
        
        if (existing.length > 0) {
          errors.push(`Off day ${i + 1}: Already exists for date ${date}`);
          continue;
        }
        
        // Insert the off day
        const result = await sql`
          INSERT INTO vendor_off_days (
            vendor_id, 
            date, 
            reason, 
            is_recurring, 
            recurring_pattern,
            recurring_end_date,
            is_active,
            created_at,
            updated_at
          ) VALUES (
            ${vendorId}, 
            ${date}, 
            ${reason || 'Personal time off'}, 
            ${isRecurring || false}, 
            ${recurringPattern || null},
            ${recurringEndDate || null},
            true,
            NOW(), 
            NOW()
          )
          RETURNING *
        `;
        
        const newOffDay = result[0];
        createdOffDays.push({
          id: newOffDay.id.toString(),
          vendorId: newOffDay.vendor_id,
          date: newOffDay.date.toISOString().split('T')[0],
          reason: newOffDay.reason,
          isRecurring: newOffDay.is_recurring,
          recurringPattern: newOffDay.recurring_pattern,
          recurringEndDate: newOffDay.recurring_end_date,
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
      errors: errors.length > 0 ? errors : undefined,
      total: createdOffDays.length
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

// DELETE /api/vendors/:vendorId/off-days/:offDayId - Remove a specific off day
router.delete('/:vendorId/off-days/:offDayId', async (req, res) => {
  try {
    const { vendorId, offDayId } = req.params;
    console.log(`🗑️ [VendorOffDays] Deleting off day ${offDayId} for vendor ${vendorId}`);
    
    const { sql } = require('../config/database.cjs');
    
    // Soft delete (set is_active = false)
    const result = await sql`
      UPDATE vendor_off_days 
      SET is_active = false, updated_at = NOW()
      WHERE id = ${offDayId} AND vendor_id = ${vendorId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Off day not found or does not belong to this vendor'
      });
    }
    
    const deletedOffDay = result[0];
    
    console.log(`✅ [VendorOffDays] Deleted off day ${offDayId} for vendor ${vendorId}`);
    
    res.json({
      success: true,
      message: 'Off day removed successfully',
      removedOffDay: {
        id: deletedOffDay.id.toString(),
        vendorId: deletedOffDay.vendor_id,
        date: deletedOffDay.date.toISOString().split('T')[0],
        reason: deletedOffDay.reason
      }
    });
    
  } catch (error) {
    console.error('❌ [VendorOffDays] Error removing off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove off day',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/vendors/:vendorId/off-days/count - Get count of off days for analytics
router.get('/:vendorId/off-days/count', async (req, res) => {
  try {
    const { vendorId } = req.params;
    console.log(`📊 [VendorOffDays] Getting off days count for vendor ${vendorId}`);
    
    const { sql } = require('../config/database.cjs');
    
    const result = await sql`
      SELECT COUNT(*) as total FROM vendor_off_days 
      WHERE vendor_id = ${vendorId} AND is_active = true
    `;
    
    const total = parseInt(result[0].total);

    res.json({
      success: true,
      vendorId,
      count: total,
      analytics: {
        totalOffDays: total,
        dataSource: 'database',
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [VendorOffDays] Error getting off days count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get off days count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
