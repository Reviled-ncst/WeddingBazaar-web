const express = require('express');
const router = express.Router();
const { sql } = require('../config/database.cjs');
const { authenticateToken, requireAdmin } = require('../middleware/auth.cjs');
const { 
  sendVerificationApprovedEmail, 
  sendVerificationRejectedEmail,
  sendVerificationPendingEmail 
} = require('../services/verificationEmailService.cjs');

// Helper function to log audit trail
async function logAudit(verificationId, userId, action, performedBy, oldStatus, newStatus, notes, req) {
  try {
    await sql`
      INSERT INTO verification_audit_log (
        verification_id, user_id, action, performed_by, 
        old_status, new_status, notes, ip_address, user_agent
      ) VALUES (
        ${verificationId}, ${userId}, ${action}, ${performedBy},
        ${oldStatus}, ${newStatus}, ${notes},
        ${req.ip || req.headers['x-forwarded-for'] || 'unknown'},
        ${req.headers['user-agent'] || 'unknown'}
      )
    `;
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

// ===================================================================
// POST /api/verification/upload-document
// Upload identity document and extracted OCR data
// ===================================================================
router.post('/upload-document', authenticateToken, async (req, res) => {
  console.log('📄 [POST /api/verification/upload-document] Request received');
  
  try {
    const { 
      userId, 
      documentType, 
      imageUrl, 
      extractedData 
    } = req.body;
    
    // Validation
    if (!userId || !documentType || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, documentType, imageUrl'
      });
    }
    
    // Valid document types
    const validTypes = ['passport', 'drivers_license', 'national_id'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document type. Must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Check if user exists
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Parse extracted data
    const name = extractedData?.name || null;
    const idNumber = extractedData?.idNumber || null;
    const dob = extractedData?.dateOfBirth || null;
    const rawText = extractedData?.rawText || '';
    const confidence = extractedData?.confidence || 0;
    
    // Insert or update verification record
    const verification = await sql`
      INSERT INTO user_verifications (
        user_id, document_type, document_image_url,
        extracted_name, extracted_id_number, extracted_dob,
        extracted_raw_text, document_confidence, status, submitted_at
      ) VALUES (
        ${userId}, ${documentType}, ${imageUrl},
        ${name}, ${idNumber}, ${dob},
        ${rawText}, ${confidence}, 'pending', NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        document_type = ${documentType},
        document_image_url = ${imageUrl},
        extracted_name = ${name},
        extracted_id_number = ${idNumber},
        extracted_dob = ${dob},
        extracted_raw_text = ${rawText},
        document_confidence = ${confidence},
        status = 'pending',
        submitted_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;
    
    // Log audit trail
    await logAudit(
      verification[0].id,
      userId,
      'submitted',
      userId,
      null,
      'pending',
      'Document submitted for verification',
      req
    );
    
    console.log('✅ [POST /api/verification/upload-document] Document uploaded successfully');
    
    // Send email notification
    const user = await sql`SELECT email, first_name, last_name FROM users WHERE id = ${userId}`;
    if (user.length > 0) {
      await sendVerificationPendingEmail(
        user[0].email,
        user[0].first_name || 'User'
      );
    }
    
    res.json({ 
      success: true, 
      verification: verification[0],
      message: 'Document submitted for review. You will be notified within 24-48 hours.'
    });
    
  } catch (error) {
    console.error('❌ [POST /api/verification/upload-document] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      message: error.message
    });
  }
});

// ===================================================================
// POST /api/verification/save-face
// Save face recognition descriptor
// ===================================================================
router.post('/save-face', authenticateToken, async (req, res) => {
  console.log('👤 [POST /api/verification/save-face] Request received');
  
  try {
    const { userId, faceDescriptor, confidence } = req.body;
    
    // Validation
    if (!userId || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, faceDescriptor'
      });
    }
    
    // Check if user exists
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`;
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Convert face descriptor to JSON string
    const descriptorJson = JSON.stringify(faceDescriptor);
    const faceConfidence = confidence || 100;
    
    // Insert or update verification record
    const verification = await sql`
      INSERT INTO user_verifications (
        user_id, face_descriptor, face_verified, 
        face_verified_at, face_confidence, status
      ) VALUES (
        ${userId}, ${descriptorJson}, true, NOW(), ${faceConfidence}, 'pending'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        face_descriptor = ${descriptorJson},
        face_verified = true,
        face_verified_at = NOW(),
        face_confidence = ${faceConfidence},
        updated_at = NOW()
      RETURNING *
    `;
    
    // Update user table directly
    await sql`
      UPDATE users
      SET face_verified = true
      WHERE id = ${userId}
    `;
    
    // Log audit trail
    await logAudit(
      verification[0].id,
      userId,
      'face_verified',
      userId,
      null,
      null,
      'Face recognition descriptor saved',
      req
    );
    
    console.log('✅ [POST /api/verification/save-face] Face descriptor saved successfully');
    
    res.json({ 
      success: true, 
      message: 'Face recognition enabled successfully'
    });
    
  } catch (error) {
    console.error('❌ [POST /api/verification/save-face] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save face descriptor',
      message: error.message
    });
  }
});

// ===================================================================
// GET /api/verification/status/:userId
// Get verification status for a user
// ===================================================================
router.get('/status/:userId', authenticateToken, async (req, res) => {
  console.log('📊 [GET /api/verification/status/:userId] Request received');
  
  try {
    const { userId } = req.params;
    
    // Get verification status
    const verification = await sql`
      SELECT 
        v.*,
        u.email,
        u.first_name,
        u.last_name,
        u.is_verified as user_verified,
        u.verification_level
      FROM user_verifications v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.user_id = ${userId}
    `;
    
    if (verification.length === 0) {
      return res.json({
        success: true,
        verified: false,
        status: 'not_submitted',
        message: 'No verification record found'
      });
    }
    
    console.log('✅ [GET /api/verification/status/:userId] Status retrieved');
    
    res.json({
      success: true,
      verified: verification[0].status === 'approved',
      verification: {
        ...verification[0],
        // Don't send sensitive data
        face_descriptor: undefined,
        extracted_raw_text: undefined
      }
    });
    
  } catch (error) {
    console.error('❌ [GET /api/verification/status/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get verification status',
      message: error.message
    });
  }
});

// ===================================================================
// GET /api/verification/pending
// Get all pending verifications (Admin only)
// ===================================================================
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  console.log('📋 [GET /api/verification/pending] Request received');
    
    const { limit = 50, offset = 0 } = req.query;
    
    const verifications = await sql`
      SELECT 
        v.*,
        u.email,
        u.first_name,
        u.last_name,
        u.profile_image,
        u.created_at as user_created_at
      FROM user_verifications v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.status = 'pending'
      ORDER BY v.submitted_at ASC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;
    
    const total = await sql`
      SELECT COUNT(*) as count
      FROM user_verifications
      WHERE status = 'pending'
    `;
    
    console.log(`✅ [GET /api/verification/pending] Found ${verifications.length} pending verifications`);
    
    res.json({
      success: true,
      verifications: verifications.map(v => ({
        ...v,
        face_descriptor: undefined // Don't send face descriptors
      })),
      total: parseInt(total[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('❌ [GET /api/verification/pending] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending verifications',
      message: error.message
    });
  }
});

// ===================================================================
// POST /api/verification/approve
// Approve a verification (Admin only)
// ===================================================================
router.post('/approve', authenticateToken, requireAdmin, async (req, res) => {
  console.log('✅ [POST /api/verification/approve] Request received');
  
  try {
    const { verificationId, notes } = req.body;
    const adminId = req.userId; // Get from authenticated user
    
    // Validation
    if (!verificationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: verificationId'
      });
    }
    
    // Get current verification
    const current = await sql`
      SELECT * FROM user_verifications WHERE id = ${verificationId}
    `;
    
    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }
    
    const oldStatus = current[0].status;
    
    // Update verification status
    const updated = await sql`
      UPDATE user_verifications
      SET 
        status = 'approved',
        document_verified = CASE 
          WHEN document_image_url IS NOT NULL THEN true 
          ELSE document_verified 
        END,
        verified_by = ${adminId},
        admin_notes = ${notes || ''},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${verificationId}
      RETURNING *
    `;
    
    // Update user table
    await sql`
      UPDATE users
      SET 
        document_verified = CASE 
          WHEN ${updated[0].document_verified} THEN true 
          ELSE document_verified 
        END,
        is_verified = true,
        verification_level = CASE
          WHEN ${updated[0].face_verified} AND ${updated[0].document_verified} THEN 'full'
          WHEN ${updated[0].document_verified} THEN 'document'
          WHEN ${updated[0].face_verified} THEN 'face'
          ELSE verification_level
        END
      WHERE id = ${current[0].user_id}
    `;
    
    // Log audit trail
    await logAudit(
      verificationId,
      current[0].user_id,
      'approved',
      adminId,
      oldStatus,
      'approved',
      notes || 'Verification approved',
      req
    );
    
    console.log('✅ [POST /api/verification/approve] Verification approved');
    
    // Send email notification to user
    const user = await sql`SELECT email, first_name, last_name FROM users WHERE id = ${current[0].user_id}`;
    if (user.length > 0) {
      await sendVerificationApprovedEmail(
        user[0].email,
        user[0].first_name || 'User'
      );
    }
    
    res.json({
      success: true,
      message: 'Verification approved successfully',
      verification: updated[0]
    });
    
  } catch (error) {
    console.error('❌ [POST /api/verification/approve] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve verification',
      message: error.message
    });
  }
});

// ===================================================================
// POST /api/verification/reject
// Reject a verification (Admin only)
// ===================================================================
router.post('/reject', authenticateToken, requireAdmin, async (req, res) => {
  console.log('❌ [POST /api/verification/reject] Request received');
  
  try {
    const { verificationId, reason, notes } = req.body;
    const adminId = req.userId; // Get from authenticated user
    
    // Validation
    if (!verificationId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: verificationId, reason'
      });
    }
    
    // Get current verification
    const current = await sql`
      SELECT * FROM user_verifications WHERE id = ${verificationId}
    `;
    
    if (current.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }
    
    const oldStatus = current[0].status;
    
    // Update verification status
    const updated = await sql`
      UPDATE user_verifications
      SET 
        status = 'rejected',
        rejection_reason = ${reason},
        verified_by = ${adminId},
        admin_notes = ${notes || ''},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${verificationId}
      RETURNING *
    `;
    
    // Log audit trail
    await logAudit(
      verificationId,
      current[0].user_id,
      'rejected',
      adminId,
      oldStatus,
      'rejected',
      `${reason}. ${notes || ''}`,
      req
    );
    
    console.log('✅ [POST /api/verification/reject] Verification rejected');
    
    // Send email notification to user
    const user = await sql`SELECT email, first_name, last_name FROM users WHERE id = ${current[0].user_id}`;
    if (user.length > 0) {
      await sendVerificationRejectedEmail(
        user[0].email,
        user[0].first_name || 'User',
        reason
      );
    }
    
    res.json({
      success: true,
      message: 'Verification rejected',
      verification: updated[0]
    });
    
  } catch (error) {
    console.error('❌ [POST /api/verification/reject] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject verification',
      message: error.message
    });
  }
});

// ===================================================================
// GET /api/verification/statistics
// Get verification statistics (Admin only)
// ===================================================================
router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  console.log('📊 [GET /api/verification/statistics] Request received');
  
  try {
    const stats = await sql`SELECT * FROM verification_statistics`;
    
    console.log('✅ [GET /api/verification/statistics] Statistics retrieved');
    
    res.json({
      success: true,
      statistics: stats[0] || {}
    });
    
  } catch (error) {
    console.error('❌ [GET /api/verification/statistics] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

// ===================================================================
// GET /api/verification/audit/:verificationId
// Get audit trail for a verification (Admin only)
// ===================================================================
router.get('/audit/:verificationId', authenticateToken, requireAdmin, async (req, res) => {
  console.log('📜 [GET /api/verification/audit/:verificationId] Request received');
  
  try {
    const { verificationId } = req.params;
    
    const audit = await sql`
      SELECT 
        a.*,
        u.email as performed_by_email,
        u.first_name,
        u.last_name
      FROM verification_audit_log a
      LEFT JOIN users u ON a.performed_by = u.id
      WHERE a.verification_id = ${verificationId}
      ORDER BY a.created_at DESC
    `;
    
    console.log(`✅ [GET /api/verification/audit/:verificationId] Found ${audit.length} audit entries`);
    
    res.json({
      success: true,
      audit
    });
    
  } catch (error) {
    console.error('❌ [GET /api/verification/audit/:verificationId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audit trail',
      message: error.message
    });
  }
});

module.exports = router;
