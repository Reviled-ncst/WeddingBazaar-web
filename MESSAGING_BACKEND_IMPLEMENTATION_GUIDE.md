# 🚀 MESSAGING SYSTEM - BACKEND IMPLEMENTATION REQUIRED

## 📋 Current Status

**Frontend Status**: ✅ READY FOR REAL DATA
- Mock data and fallbacks have been removed
- GlobalMessengerContext now expects real API responses
- VendorMessages component integrated with GlobalMessengerContext
- All components properly handle empty states

**Backend Status**: ❌ MESSAGING ENDPOINTS NOT IMPLEMENTED
- Health check: ✅ Working (`/api/health`)
- Messaging endpoints: ❌ Missing (`/api/conversations`)

## 🛠️ Required Backend Implementation

### Database Schema

The backend needs these database tables:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(255) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL DEFAULT 'couple', -- 'couple', 'vendor', 'admin'
  service_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'blocked'
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50) NOT NULL, -- 'couple', 'vendor', 'admin'
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file'
  attachments JSONB, -- Array of attachment URLs
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_by JSONB DEFAULT '[]', -- Array of user IDs who have read this message
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_vendor_id ON conversations(vendor_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

### Required API Endpoints

#### 1. Get Conversations
```typescript
GET /api/conversations?vendorId={vendorId}
GET /api/conversations?userId={userId}

Response:
{
  "success": true,
  "conversations": [
    {
      "id": "uuid",
      "vendorId": "string",
      "vendorName": "string",
      "userId": "string", 
      "userName": "string",
      "userType": "couple",
      "serviceName": "string",
      "status": "active",
      "unreadCount": 0,
      "createdAt": "ISO string",
      "updatedAt": "ISO string",
      "lastMessage": {
        "id": "uuid",
        "content": "string",
        "senderRole": "couple",
        "timestamp": "ISO string"
      }
    }
  ]
}
```

#### 2. Get Messages for Conversation
```typescript
GET /api/conversations/{conversationId}/messages

Response:
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "senderId": "string",
      "senderName": "string", 
      "senderRole": "couple",
      "content": "string",
      "messageType": "text",
      "attachments": [],
      "timestamp": "ISO string",
      "readBy": ["userId1", "userId2"]
    }
  ]
}
```

#### 3. Create Conversation
```typescript
POST /api/conversations

Request Body:
{
  "vendorId": "string",
  "vendorName": "string",
  "userId": "string",
  "userName": "string", 
  "userType": "couple",
  "serviceName": "string",
  "initialMessage": "string"
}

Response:
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "vendorId": "string",
    "vendorName": "string", 
    "userId": "string",
    "userName": "string",
    "userType": "couple",
    "serviceName": "string",
    "status": "active",
    "unreadCount": 1,
    "createdAt": "ISO string",
    "updatedAt": "ISO string"
  }
}
```

#### 4. Send Message
```typescript
POST /api/conversations/{conversationId}/messages

Request Body:
{
  "senderId": "string",
  "senderName": "string",
  "senderRole": "couple",
  "content": "string",
  "messageType": "text",
  "attachments": []
}

Response:
{
  "success": true,
  "message": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "string",
    "senderName": "string",
    "senderRole": "couple", 
    "content": "string",
    "messageType": "text",
    "attachments": [],
    "timestamp": "ISO string",
    "readBy": []
  }
}
```

#### 5. Mark Messages as Read
```typescript
PUT /api/conversations/{conversationId}/read

Request Body:
{
  "userId": "string"
}

Response:
{
  "success": true,
  "unreadCount": 0
}
```

## 📁 Backend File Structure

```
backend/
├── routes/
│   └── messaging.js           # All messaging routes
├── controllers/
│   └── messagingController.js # Business logic for messaging
├── models/
│   ├── Conversation.js        # Conversation model
│   └── Message.js             # Message model
├── middleware/
│   └── auth.js                # Authentication middleware
└── utils/
    └── messageHelpers.js      # Helper functions
```

## 🔧 Frontend Integration

The frontend is already configured to work with these endpoints:

1. **MessagingApiService** (`src/services/api/messagingApiService.ts`)
   - Contains all the API call functions
   - Properly configured with error handling
   - Uses environment variables for API URL

2. **GlobalMessengerContext** (`src/shared/contexts/GlobalMessengerContext.tsx`)
   - Loads conversations on user authentication
   - Handles real-time message updates
   - Manages conversation state

3. **VendorMessages** (`src/pages/users/vendor/messages/VendorMessages.tsx`)
   - Uses GlobalMessengerContext for data
   - Displays conversations and messages
   - Handles sending new messages

## 🚀 Implementation Steps

### Step 1: Database Setup
```sql
-- Run the SQL schema above in your PostgreSQL database
-- Add any additional indexes as needed
```

### Step 2: Backend Routes Implementation
```javascript
// Example route structure
app.get('/api/conversations', requireAuth, getConversations);
app.get('/api/conversations/:id/messages', requireAuth, getMessages);
app.post('/api/conversations', requireAuth, createConversation);
app.post('/api/conversations/:id/messages', requireAuth, sendMessage);
app.put('/api/conversations/:id/read', requireAuth, markAsRead);
```

### Step 3: Testing
1. Deploy backend with messaging endpoints
2. Test with frontend development server
3. Verify all CRUD operations work
4. Test with multiple users and conversations

## 📊 Expected Frontend Behavior After Implementation

Once the backend endpoints are implemented:

1. **Login**: User authenticates and conversations load automatically
2. **Empty State**: Shows "No Messages Yet" when no conversations exist
3. **New Conversation**: Customer can initiate conversation with vendor
4. **Real-time Messaging**: Messages sync between main page and floating chat
5. **Read Status**: Unread counts update when messages are marked as read
6. **Persistence**: Conversations and messages persist across sessions

## 🎯 Success Criteria

- ✅ All API endpoints return proper JSON responses
- ✅ Database stores conversations and messages correctly
- ✅ Frontend loads real conversation data
- ✅ Messages can be sent and received
- ✅ Read status updates properly
- ✅ No 404 errors on messaging endpoints

---

**Note**: The frontend is fully prepared and will work seamlessly once these backend endpoints are implemented. All mock data has been removed and the system is ready for production use.
