-- Migration: Add Group Chat Support
-- Generated: October 19, 2025
-- Purpose: Enable group conversations with multiple participants

-- Create conversation_participants junction table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id VARCHAR(100) PRIMARY KEY,
  conversation_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- 'couple', 'vendor', 'admin'
  user_avatar TEXT,
  role VARCHAR(50) DEFAULT 'member', -- 'creator', 'member', 'admin'
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  
  -- Foreign key constraint
  CONSTRAINT fk_participant_conversation FOREIGN KEY (conversation_id) 
    REFERENCES conversations(id) ON DELETE CASCADE,
    
  -- Unique constraint: one user can only be in a conversation once
  CONSTRAINT unique_conversation_user UNIQUE(conversation_id, user_id)
);

-- Update messages table for group chat features
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS attachments JSONB,
  ADD COLUMN IF NOT EXISTS reply_to_message_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS read_by TEXT[], -- Array of user IDs who read the message
  ADD COLUMN IF NOT EXISTS reactions JSONB; -- Emoji reactions: {emoji: [userIds]}

-- Add foreign key for reply_to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_message_reply'
  ) THEN
    ALTER TABLE messages 
      ADD CONSTRAINT fk_message_reply 
      FOREIGN KEY (reply_to_message_id) 
      REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_type ON conversation_participants(user_type);
CREATE INDEX IF NOT EXISTS idx_conv_participants_active ON conversation_participants(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_reply ON messages(reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_read_by ON messages USING GIN(read_by);

-- Add comments
COMMENT ON TABLE conversation_participants IS 'Participants in conversations (enables group chats)';
COMMENT ON COLUMN conversation_participants.user_type IS 'User type: couple, vendor, or admin';
COMMENT ON COLUMN conversation_participants.role IS 'Participant role: creator, member, or admin';
COMMENT ON COLUMN conversation_participants.last_read_at IS 'Last time user read messages in this conversation';
COMMENT ON COLUMN messages.attachments IS 'JSON array of file attachments';
COMMENT ON COLUMN messages.reply_to_message_id IS 'ID of message being replied to';
COMMENT ON COLUMN messages.read_by IS 'Array of user IDs who have read this message';
COMMENT ON COLUMN messages.reactions IS 'Emoji reactions from users';

-- Create function to update conversation last_read_at
CREATE OR REPLACE FUNCTION update_participant_last_read()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversation_participants
  SET last_read_at = NEW.created_at
  WHERE conversation_id = NEW.conversation_id 
    AND user_id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_read_at when user sends message
DROP TRIGGER IF EXISTS trigger_update_last_read ON messages;
CREATE TRIGGER trigger_update_last_read
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_last_read();

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Group chat migration completed successfully';
  RAISE NOTICE 'Created table: conversation_participants';
  RAISE NOTICE 'Updated table: messages (added attachments, reply_to_message_id, read_by, reactions)';
  RAISE NOTICE 'Created trigger: trigger_update_last_read';
  RAISE NOTICE 'Added indexes for performance optimization';
END $$;
