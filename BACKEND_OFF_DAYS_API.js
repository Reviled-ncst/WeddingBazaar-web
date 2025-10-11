// Backend API endpoints for vendor off days - ADD TO BACKEND

/**
 * Vendor Off Days API Endpoints
 * Add these to your backend server (Node.js/Express)
 */

// GET /api/vendors/:vendorId/off-days
app.get('/api/vendors/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Query database for vendor off days
    const offDays = await db.query(`
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
    
    res.json({
      success: true,
      offDays: offDays.rows.map(row => ({
        id: row.id.toString(),
        vendorId: row.vendor_id,
        date: row.date.toISOString().split('T')[0], // YYYY-MM-DD
        reason: row.reason,
        isRecurring: row.is_recurring,
        recurringPattern: row.recurring_pattern,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching vendor off days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch off days'
    });
  }
});

// POST /api/vendors/:vendorId/off-days
app.post('/api/vendors/:vendorId/off-days', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { date, reason, isRecurring, recurringPattern } = req.body;
    
    // Validate input
    if (!date || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Date and reason are required'
      });
    }
    
    // Insert into database
    const result = await db.query(`
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
    `, [vendorId, date, reason, isRecurring || false, recurringPattern || null]);
    
    const newOffDay = result.rows[0];
    
    res.json({
      success: true,
      message: 'Off day added successfully',
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
    console.error('Error adding vendor off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add off day'
    });
  }
});

// DELETE /api/vendors/:vendorId/off-days/:offDayId
app.delete('/api/vendors/:vendorId/off-days/:offDayId', async (req, res) => {
  try {
    const { vendorId, offDayId } = req.params;
    
    // Delete from database
    const result = await db.query(`
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
    
    res.json({
      success: true,
      message: 'Off day removed successfully'
    });
  } catch (error) {
    console.error('Error removing vendor off day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove off day'
    });
  }
});

// POST /api/vendors/:vendorId/off-days/bulk
app.post('/api/vendors/:vendorId/off-days/bulk', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { offDays } = req.body;
    
    if (!Array.isArray(offDays) || offDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Off days array is required'
      });
    }
    
    // Insert multiple off days
    const insertPromises = offDays.map(offDay => 
      db.query(`
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
        offDay.date, 
        offDay.reason, 
        offDay.isRecurring || false, 
        offDay.recurringPattern || null
      ])
    );
    
    const results = await Promise.all(insertPromises);
    
    res.json({
      success: true,
      message: `${results.length} off days added successfully`,
      offDays: results.map(result => {
        const row = result.rows[0];
        return {
          id: row.id.toString(),
          vendorId: row.vendor_id,
          date: row.date.toISOString().split('T')[0],
          reason: row.reason,
          isRecurring: row.is_recurring,
          recurringPattern: row.recurring_pattern
        };
      })
    });
  } catch (error) {
    console.error('Error adding bulk off days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add off days'
    });
  }
});

/*
DATABASE SCHEMA - Add this table to your database:

CREATE TABLE vendor_off_days (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  reason TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(20), -- 'weekly', 'monthly', 'yearly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_vendor_off_days_vendor (vendor_id),
  INDEX idx_vendor_off_days_date (date),
  
  -- Unique constraint to prevent duplicate off days
  UNIQUE(vendor_id, date)
);
*/
