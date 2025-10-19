/**
 * Wedding Bazaar - Booking Items Routes
 * Multi-service booking support
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Add item to booking (multi-service support)
router.post('/bookings/:bookingId/items', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const {
      service_id,
      service_name,
      service_category,
      vendor_id,
      vendor_name,
      quantity = 1,
      unit_price,
      total_price,
      dss_snapshot,
      item_notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO booking_items (
        booking_id, service_id, service_name, service_category,
        vendor_id, vendor_name, quantity, unit_price, total_price,
        dss_snapshot, item_notes, item_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *
    `, [
      bookingId, service_id, service_name, service_category,
      vendor_id, vendor_name, quantity, unit_price, total_price,
      JSON.stringify(dss_snapshot), item_notes
    ]);

    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Error adding booking item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all items in a booking
router.get('/bookings/:bookingId/items', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(`
      SELECT * FROM booking_items
      WHERE booking_id = $1
      ORDER BY created_at ASC
    `, [bookingId]);

    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Error fetching booking items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking item
router.put('/bookings/:bookingId/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, unit_price, total_price, item_status, item_notes } = req.body;

    const result = await pool.query(`
      UPDATE booking_items
      SET 
        quantity = COALESCE($1, quantity),
        unit_price = COALESCE($2, unit_price),
        total_price = COALESCE($3, total_price),
        item_status = COALESCE($4, item_status),
        item_notes = COALESCE($5, item_notes),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [quantity, unit_price, total_price, item_status, item_notes, itemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, item: result.rows[0] });
  } catch (error) {
    console.error('Error updating booking item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete booking item
router.delete('/bookings/:bookingId/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await pool.query(`
      DELETE FROM booking_items WHERE id = $1 RETURNING *
    `, [itemId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
