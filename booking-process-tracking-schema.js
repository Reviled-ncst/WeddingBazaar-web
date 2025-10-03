/**
 * BOOKING PROCESS TRACKING SYSTEM
 * 
 * This script adds comprehensive booking process tracking to the Wedding Bazaar backend.
 * It creates database tables and endpoints to track every step of the booking journey.
 * 
 * Features:
 * - Booking status history tracking
 * - Payment process logging
 * - Quote/proposal tracking
 * - Communication logging
 * - Progress milestones
 * 
 * Tables created:
 * - booking_process_log: Main process tracking table
 * - booking_payments: Payment history and status
 * - booking_communications: All communication between couple and vendor
 */

// Database schema for booking process tracking
const BOOKING_PROCESS_SCHEMA = `
-- Main booking process tracking table
CREATE TABLE IF NOT EXISTS booking_process_log (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  process_step VARCHAR(50) NOT NULL,
  process_status VARCHAR(30) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_by VARCHAR(100),
  created_by_type VARCHAR(20) CHECK (created_by_type IN ('couple', 'vendor', 'admin', 'system')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_booking_process_booking (booking_id),
  INDEX idx_booking_process_step (process_step),
  INDEX idx_booking_process_status (process_status),
  INDEX idx_booking_process_created (created_at)
);

-- Payment tracking table
CREATE TABLE IF NOT EXISTS booking_payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN ('downpayment', 'partial', 'full', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50),
  payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  transaction_id VARCHAR(200),
  provider_reference VARCHAR(200),
  metadata JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_booking_payments_booking (booking_id),
  INDEX idx_booking_payments_status (payment_status),
  INDEX idx_booking_payments_type (payment_type),
  INDEX idx_booking_payments_created (created_at)
);

-- Communication tracking table
CREATE TABLE IF NOT EXISTS booking_communications (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  communication_type VARCHAR(50) NOT NULL CHECK (communication_type IN ('quote', 'message', 'call', 'meeting', 'email', 'contract')),
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('couple', 'vendor', 'admin', 'system')),
  sender_id VARCHAR(100),
  sender_name VARCHAR(200),
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('couple', 'vendor', 'admin', 'system')),
  recipient_id VARCHAR(100),
  subject VARCHAR(500),
  content TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_booking_comm_booking (booking_id),
  INDEX idx_booking_comm_type (communication_type),
  INDEX idx_booking_comm_sender (sender_type, sender_id),
  INDEX idx_booking_comm_created (created_at)
);

-- Add process tracking columns to existing bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS process_stage VARCHAR(50) DEFAULT 'inquiry';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_action VARCHAR(200);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS next_action_by VARCHAR(20) CHECK (next_action_by IN ('couple', 'vendor', 'admin', 'system'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`;

// Process step definitions
const BOOKING_PROCESS_STEPS = {
  INQUIRY: {
    step: 'inquiry',
    description: 'Initial booking request submitted',
    progress: 10,
    next_action: 'Vendor to review and respond to booking request',
    next_action_by: 'vendor'
  },
  VENDOR_REVIEWED: {
    step: 'vendor_reviewed',
    description: 'Vendor reviewed the booking request',
    progress: 20,
    next_action: 'Vendor to send quote or availability confirmation',
    next_action_by: 'vendor'
  },
  QUOTE_SENT: {
    step: 'quote_sent',
    description: 'Vendor sent quote/proposal to couple',
    progress: 30,
    next_action: 'Couple to review and respond to quote',
    next_action_by: 'couple'
  },
  QUOTE_REVIEWED: {
    step: 'quote_reviewed',
    description: 'Couple reviewed the quote',
    progress: 40,
    next_action: 'Couple to accept/decline or negotiate quote',
    next_action_by: 'couple'
  },
  QUOTE_ACCEPTED: {
    step: 'quote_accepted',
    description: 'Couple accepted the quote',
    progress: 50,
    next_action: 'Process downpayment to confirm booking',
    next_action_by: 'couple'
  },
  CONTRACT_SENT: {
    step: 'contract_sent',
    description: 'Contract/agreement sent to couple',
    progress: 60,
    next_action: 'Couple to review and sign contract',
    next_action_by: 'couple'
  },
  DOWNPAYMENT_PENDING: {
    step: 'downpayment_pending',
    description: 'Downpayment processing initiated',
    progress: 70,
    next_action: 'Complete payment processing',
    next_action_by: 'system'
  },
  DOWNPAYMENT_CONFIRMED: {
    step: 'downpayment_confirmed',
    description: 'Downpayment received and confirmed',
    progress: 80,
    next_action: 'Await event date and final payment',
    next_action_by: 'couple'
  },
  FINAL_PAYMENT_DUE: {
    step: 'final_payment_due',
    description: 'Final payment is due',
    progress: 90,
    next_action: 'Process final payment',
    next_action_by: 'couple'
  },
  COMPLETED: {
    step: 'completed',
    description: 'Booking completed successfully',
    progress: 100,
    next_action: 'Service delivery and follow-up',
    next_action_by: 'vendor'
  },
  CANCELLED: {
    step: 'cancelled',
    description: 'Booking was cancelled',
    progress: 0,
    next_action: 'Process refund if applicable',
    next_action_by: 'admin'
  }
};

module.exports = {
  BOOKING_PROCESS_SCHEMA,
  BOOKING_PROCESS_STEPS
};
