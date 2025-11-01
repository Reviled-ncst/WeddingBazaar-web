/**
 * 🤖 AUTOMATIC COORDINATOR INTEGRATION
 * 
 * This module automatically creates coordinator_clients and coordinator_weddings
 * records when a couple books a coordinator service.
 * 
 * Triggered by: POST /api/bookings/request (when serviceType === 'Wedding Coordination')
 */

const { sql } = require('../../config/database.cjs');

/**
 * Check if a vendor is a coordinator
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<boolean>}
 */
async function isCoordinator(vendorId) {
  try {
    const result = await sql`
      SELECT business_type 
      FROM vendor_profiles 
      WHERE id::text = ${vendorId}::text OR user_id::text = ${vendorId}::text
      LIMIT 1
    `;
    
    if (result && result.length > 0) {
      const businessType = result[0].business_type?.toLowerCase() || '';
      return businessType.includes('coordinat') || businessType.includes('planning');
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking if vendor is coordinator:', error);
    return false;
  }
}

/**
 * Automatically create coordinator client record when couple books coordinator
 * @param {Object} bookingData - Booking data from the booking request
 * @returns {Promise<Object|null>} Created client record or null
 */
async function autoCreateCoordinatorClient(bookingData) {
  try {
    const {
      couple_id,
      vendor_id,
      couple_name,
      contact_email,
      contact_phone,
      event_date,
      budget_range,
      special_requests
    } = bookingData;
    
    console.log('🤖 AUTO-CREATE: Creating coordinator client for booking:', bookingData.id);
    
    // Check if client already exists for this coordinator
    const existingClient = await sql`
      SELECT id FROM coordinator_clients
      WHERE coordinator_id::text = ${vendor_id}::text
        AND (
          email = ${contact_email}
          OR phone = ${contact_phone}
          OR couple_name = ${couple_name}
        )
      LIMIT 1
    `;
    
    if (existingClient && existingClient.length > 0) {
      console.log('ℹ️ Client already exists for this coordinator, skipping creation');
      return existingClient[0];
    }
    
    // Create new coordinator client
    const client = await sql`
      INSERT INTO coordinator_clients (
        coordinator_id,
        couple_name,
        email,
        phone,
        status,
        budget_range,
        notes,
        last_contact,
        created_at,
        updated_at
      ) VALUES (
        ${vendor_id},
        ${couple_name || 'New Client'},
        ${contact_email || null},
        ${contact_phone || null},
        'lead',
        ${budget_range || null},
        ${special_requests ? `Initial request: ${special_requests}` : 'Auto-created from booking request'},
        NOW(),
        NOW(),
        NOW()
      ) RETURNING *
    `;
    
    console.log('✅ AUTO-CREATE: Coordinator client created:', client[0].id);
    
    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${vendor_id},
        'client_created',
        'New client auto-created from booking request: ${couple_name || 'New Client'}',
        ${JSON.stringify({
          client_id: client[0].id,
          booking_id: bookingData.id,
          source: 'auto_booking',
          timestamp: new Date().toISOString()
        })},
        NOW()
      )
    `;
    
    return client[0];
    
  } catch (error) {
    console.error('❌ AUTO-CREATE: Error creating coordinator client:', error);
    // Don't throw error - booking should still succeed even if client creation fails
    return null;
  }
}

/**
 * Automatically create coordinator wedding record when couple books coordinator
 * @param {Object} bookingData - Booking data from the booking request
 * @param {Object} clientData - Created client data
 * @returns {Promise<Object|null>} Created wedding record or null
 */
async function autoCreateCoordinatorWedding(bookingData, clientData) {
  try {
    const {
      couple_id,
      vendor_id,
      couple_name,
      contact_email,
      contact_phone,
      event_date,
      event_location,
      venue_details,
      guest_count,
      budget_range,
      total_amount,
      special_requests
    } = bookingData;
    
    console.log('🤖 AUTO-CREATE: Creating coordinator wedding for booking:', bookingData.id);
    
    // Parse budget range to estimate budget
    let estimatedBudget = total_amount || 0;
    if (budget_range && !estimatedBudget) {
      // Extract numbers from budget range (e.g., "50k-100k" -> 50000)
      const match = budget_range.match(/(\d+)k?/i);
      if (match) {
        estimatedBudget = parseInt(match[1]) * (budget_range.includes('k') ? 1000 : 1);
      }
    }
    
    // Create wedding record
    const wedding = await sql`
      INSERT INTO coordinator_weddings (
        coordinator_id,
        couple_name,
        couple_email,
        couple_phone,
        wedding_date,
        venue,
        venue_address,
        status,
        progress,
        budget,
        spent,
        guest_count,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${vendor_id},
        ${couple_name || 'New Wedding'},
        ${contact_email || null},
        ${contact_phone || null},
        ${event_date},
        ${event_location || 'TBD'},
        ${venue_details || null},
        'planning',
        0,
        ${estimatedBudget},
        0,
        ${guest_count || null},
        ${special_requests ? `Initial request: ${special_requests}` : 'Auto-created from booking request'},
        NOW(),
        NOW()
      ) RETURNING *
    `;
    
    console.log('✅ AUTO-CREATE: Coordinator wedding created:', wedding[0].id);
    
    // Link client to wedding if client was created
    if (clientData) {
      await sql`
        UPDATE coordinator_clients
        SET wedding_id = ${wedding[0].id},
            status = 'active',
            updated_at = NOW()
        WHERE id = ${clientData.id}
      `;
      console.log('✅ AUTO-CREATE: Linked client to wedding');
    }
    
    // Create default milestones
    const defaultMilestones = [
      { title: 'Initial Consultation', description: 'Meet with couple to discuss vision and requirements', days: 7 },
      { title: 'Venue Selection', description: 'Research and visit potential wedding venues', days: 30 },
      { title: 'Vendor Booking', description: 'Book photographer, caterer, and other key vendors', days: 60 },
      { title: 'Design & Decor', description: 'Finalize design theme and decoration plan', days: 90 },
      { title: 'Final Details', description: 'Confirm all details with vendors and finalize timeline', days: 14 },
      { title: 'Rehearsal', description: 'Conduct wedding rehearsal with wedding party', days: 1 }
    ];
    
    for (const milestone of defaultMilestones) {
      // Calculate due date relative to wedding date
      const dueDate = new Date(event_date);
      dueDate.setDate(dueDate.getDate() - milestone.days);
      
      await sql`
        INSERT INTO wedding_milestones (
          wedding_id,
          title,
          description,
          due_date,
          completed,
          created_at,
          updated_at
        ) VALUES (
          ${wedding[0].id},
          ${milestone.title},
          ${milestone.description},
          ${dueDate.toISOString().split('T')[0]},
          false,
          NOW(),
          NOW()
        )
      `;
    }
    
    console.log(`✅ AUTO-CREATE: Created ${defaultMilestones.length} default milestones`);
    
    // Log activity
    await sql`
      INSERT INTO coordinator_activity_log (
        coordinator_id,
        wedding_id,
        activity_type,
        description,
        metadata,
        created_at
      ) VALUES (
        ${vendor_id},
        ${wedding[0].id},
        'wedding_created',
        'New wedding auto-created from booking request: ${couple_name || 'New Wedding'}',
        ${JSON.stringify({
          wedding_id: wedding[0].id,
          client_id: clientData?.id || null,
          booking_id: bookingData.id,
          source: 'auto_booking',
          timestamp: new Date().toISOString()
        })},
        NOW()
      )
    `;
    
    return wedding[0];
    
  } catch (error) {
    console.error('❌ AUTO-CREATE: Error creating coordinator wedding:', error);
    // Don't throw error - booking should still succeed even if wedding creation fails
    return null;
  }
}

/**
 * Main function: Automatically create coordinator records when booking is created
 * Call this after successful booking creation
 * 
 * @param {Object} booking - Booking record from database
 * @returns {Promise<Object>} Result with created records
 */
async function handleCoordinatorBooking(booking) {
  try {
    console.log('🤖 AUTO-INTEGRATION: Checking if booking is for coordinator...');
    
    // Check if this is a coordinator booking
    const vendorIsCoordinator = await isCoordinator(booking.vendor_id);
    
    if (!vendorIsCoordinator) {
      console.log('ℹ️ Not a coordinator booking, skipping auto-integration');
      return {
        success: false,
        reason: 'not_coordinator',
        message: 'Vendor is not a coordinator'
      };
    }
    
    console.log('✅ Confirmed coordinator booking, proceeding with auto-integration...');
    
    // Prepare booking data
    const bookingData = {
      id: booking.id,
      couple_id: booking.couple_id,
      vendor_id: booking.vendor_id,
      couple_name: booking.couple_name || booking.contact_person,
      contact_email: booking.contact_email,
      contact_phone: booking.contact_phone,
      event_date: booking.event_date,
      event_location: booking.event_location,
      venue_details: booking.venue_details,
      guest_count: booking.guest_count,
      budget_range: booking.budget_range,
      total_amount: booking.total_amount,
      special_requests: booking.special_requests
    };
    
    // Create client record
    const client = await autoCreateCoordinatorClient(bookingData);
    
    // Create wedding record
    const wedding = await autoCreateCoordinatorWedding(bookingData, client);
    
    return {
      success: true,
      client: client,
      wedding: wedding,
      message: 'Coordinator records created successfully'
    };
    
  } catch (error) {
    console.error('❌ AUTO-INTEGRATION: Error handling coordinator booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create coordinator records'
    };
  }
}

module.exports = {
  isCoordinator,
  autoCreateCoordinatorClient,
  autoCreateCoordinatorWedding,
  handleCoordinatorBooking
};
