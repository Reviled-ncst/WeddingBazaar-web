# DSS, Multi-Service Booking & Group Chat - Complete Implementation Guide

**Generated:** October 19, 2025  
**Status:** Ready to Execute  
**Estimated Time:** 2-3 days full implementation

---

## 🎯 OVERVIEW

This guide provides step-by-step instructions to implement:
1. **DSS (Dynamic Service System) Fields** - Add missing fields to services table
2. **Multi-Service Bookings** - Allow couples to book multiple services at once
3. **Group Chat** - Enable group conversations for wedding coordination

---

## 📋 PRE-REQUISITES

### Required Tools:
- Node.js 18+ installed
- PostgreSQL client (optional, for manual verification)
- Access to Neon database
- Backend deployed to Render
- Frontend on Firebase Hosting

### Required Access:
- Database: CONNECTION_STRING with admin privileges
- Backend: Git push access to Render repository
- Frontend: Firebase deploy permissions

---

## 🚀 PHASE 1: DATABASE MIGRATIONS (1-2 hours)

### Step 1.1: Set Environment Variable

**PowerShell (Windows):**
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-late-breeze-a12v1z62.us-east-2.aws.neon.tech/weddingbazaar?sslmode=require"
```

**Bash (Linux/Mac):**
```bash
export DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-late-breeze-a12v1z62.us-east-2.aws.neon.tech/weddingbazaar?sslmode=require"
```

### Step 1.2: Run All Migrations

**Option A: Run all at once (RECOMMENDED)**
```bash
node run-all-migrations.mjs
```

**Option B: Run individually**
```bash
node migrate-01-dss-fields.mjs
node migrate-02-multi-service-bookings.mjs
node migrate-03-group-chat.mjs
```

### Step 1.3: Verify Migrations

The migration script will automatically verify:
- ✅ All new columns exist
- ✅ All tables created
- ✅ All indexes created
- ✅ All foreign keys established
- ✅ All triggers created

**Manual Verification (Optional):**
```sql
-- Check services table has DSS fields
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' 
  AND column_name IN ('years_in_business', 'service_tier', 'wedding_styles', 'cultural_specialties');

-- Check booking_items table exists
SELECT * FROM information_schema.tables WHERE table_name = 'booking_items';

-- Check conversation_participants table exists
SELECT * FROM information_schema.tables WHERE table_name = 'conversation_participants';
```

---

## 🔧 PHASE 2: BACKEND API UPDATES (4-6 hours)

### Step 2.1: Update Services API

**File:** `backend-deploy/routes/services.cjs`

**Changes Required:**
1. Update POST `/api/services` to accept DSS fields
2. Update PUT `/api/services/:id` to update DSS fields
3. Add GET `/api/services/search` with DSS filtering

**Key Code Addition:**
```javascript
// POST /api/services - Add DSS field support
router.post('/', async (req, res) => {
  const {
    // ... existing fields
    years_in_business, service_tier, wedding_styles,
    cultural_specialties, availability, locationData
  } = req.body;

  const service = await sql`
    INSERT INTO services (
      id, vendor_id, title, category, /* ... */
      years_in_business, service_tier, wedding_styles,
      cultural_specialties, availability, location_data,
      created_at, updated_at
    ) VALUES (
      ${serviceId}, ${vendor_id}, ${title}, ${category}, /* ... */
      ${years_in_business || null}, ${service_tier || null},
      ${wedding_styles || []}, ${cultural_specialties || []},
      ${JSON.stringify(availability) || null}, 
      ${JSON.stringify(locationData) || null},
      NOW(), NOW()
    ) RETURNING *
  `;

  res.json({ success: true, service: service[0] });
});
```

### Step 2.2: Add Multi-Service Booking Endpoint

**File:** `backend-deploy/routes/bookings.cjs`

**Add New Endpoint:**
```javascript
// POST /api/bookings/multi-service
router.post('/multi-service', async (req, res) => {
  const {
    couple_id, customer_name, customer_email, customer_phone,
    event_date, event_time, event_location, guest_count,
    special_requests, services // Array of service objects
  } = req.body;

  // 1. Create main booking
  const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const totalAmount = services.reduce((sum, s) => sum + parseFloat(s.price || 0), 0);

  const booking = await sql`
    INSERT INTO bookings (
      id, couple_id, customer_name, customer_email, customer_phone,
      event_date, event_time, event_location, guest_count,
      special_requests, status, total_amount, created_at, updated_at
    ) VALUES (
      ${bookingId}, ${couple_id}, ${customer_name}, ${customer_email}, ${customer_phone},
      ${event_date}, ${event_time}, ${event_location}, ${guest_count},
      ${special_requests || null}, 'pending', ${totalAmount}, NOW(), NOW()
    ) RETURNING *
  `;

  // 2. Create booking items for each service
  const bookingItems = [];
  for (const service of services) {
    const itemId = `bki-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item = await sql`
      INSERT INTO booking_items (
        id, booking_id, service_id, service_name, service_category,
        vendor_id, vendor_name, quantity, unit_price, total_price,
        dss_snapshot, item_status, created_at, updated_at
      ) VALUES (
        ${itemId}, ${bookingId}, ${service.service_id}, ${service.service_name},
        ${service.category}, ${service.vendor_id}, ${service.vendor_name},
        ${service.quantity || 1}, ${service.price}, ${service.price},
        ${JSON.stringify(service.dss_data || {})}, 'pending', NOW(), NOW()
      ) RETURNING *
    `;
    bookingItems.push(item[0]);
  }

  // 3. Create group conversation
  const conversationId = `conv-${bookingId}`;
  const conversation = await sql`
    INSERT INTO conversations (
      id, creator_id, creator_type, conversation_type,
      group_name, booking_id, status, created_at, updated_at
    ) VALUES (
      ${conversationId}, ${couple_id}, 'couple', 'group',
      ${`Wedding Planning - ${event_date}`}, ${bookingId}, 'active', NOW(), NOW()
    ) RETURNING *
  `;

  // 4. Add participants (couple + all vendors)
  await sql`
    INSERT INTO conversation_participants (
      id, conversation_id, user_id, user_name, user_type, role, joined_at
    ) VALUES (
      ${`cp-${Date.now()}-1`}, ${conversationId}, ${couple_id}, 
      ${customer_name}, 'couple', 'creator', NOW()
    )
  `;

  for (let i = 0; i < services.length; i++) {
    await sql`
      INSERT INTO conversation_participants (
        id, conversation_id, user_id, user_name, user_type, role, joined_at
      ) VALUES (
        ${`cp-${Date.now()}-${i+2}`}, ${conversationId}, ${services[i].vendor_id},
        ${services[i].vendor_name}, 'vendor', 'member', NOW()
      )
      ON CONFLICT (conversation_id, user_id) DO NOTHING
    `;
  }

  res.json({
    success: true,
    booking: booking[0],
    booking_items: bookingItems,
    conversation: conversation[0],
    participants: services.length + 1
  });
});
```

### Step 2.3: Add Group Chat Endpoints

**File:** `backend-deploy/routes/conversations.cjs`

**Add New Endpoints:**
```javascript
// GET /api/conversations/:conversationId/participants
router.get('/:conversationId/participants', async (req, res) => {
  const { conversationId } = req.params;
  
  const participants = await sql`
    SELECT cp.*, u.email, v.business_name
    FROM conversation_participants cp
    LEFT JOIN users u ON cp.user_id = u.id AND cp.user_type = 'couple'
    LEFT JOIN vendors v ON cp.user_id = v.id AND cp.user_type = 'vendor'
    WHERE cp.conversation_id = ${conversationId} AND cp.is_active = true
    ORDER BY cp.joined_at ASC
  `;

  res.json({ success: true, participants, count: participants.length });
});

// POST /api/conversations/:conversationId/participants
router.post('/:conversationId/participants', async (req, res) => {
  const { conversationId } = req.params;
  const { user_id, user_name, user_type, user_avatar } = req.body;

  const participantId = `cp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const participant = await sql`
    INSERT INTO conversation_participants (
      id, conversation_id, user_id, user_name, user_type,
      user_avatar, role, joined_at, is_active
    ) VALUES (
      ${participantId}, ${conversationId}, ${user_id}, ${user_name}, ${user_type},
      ${user_avatar || null}, 'member', NOW(), true
    ) ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET is_active = true, joined_at = NOW()
    RETURNING *
  `;

  res.json({ success: true, participant: participant[0] });
});
```

### Step 2.4: Deploy Backend

```bash
cd backend-deploy
git add .
git commit -m "Add DSS fields, multi-service bookings, and group chat support"
git push render main
```

**Verify Deployment:**
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```

---

## 🎨 PHASE 3: FRONTEND UPDATES (8-12 hours)

### Step 3.1: Major UI Overhaul - AddServiceForm.tsx

The current AddServiceForm.tsx already has DSS fields implemented, but we need to ensure they're properly connected to the backend.

**File:** `src/pages/users/vendor/services/components/AddServiceForm.tsx`

**Key Changes:**
1. Ensure `locationData` is sent (not just `location` string)
2. Verify all DSS fields are in the submission payload
3. Add better error handling for new fields

**Update `handleSubmit` function:**
```typescript
const handleSubmit = async () => {
  // ... validation code ...

  const serviceData = {
    vendor_id: vendorId,
    title: formData.title,
    category: formData.category,
    subcategory: formData.subcategory,
    description: formData.description,
    price: formData.price,
    max_price: formData.max_price,
    price_range: formData.price_range,
    location: formData.location,
    locationData: formData.locationData, // ✅ CRITICAL: Send location data
    images: formData.images,
    tags: formData.tags,
    features: formData.features,
    is_active: formData.is_active,
    featured: formData.featured,
    
    // ✅ DSS FIELDS:
    years_in_business: parseInt(formData.years_in_business) || null,
    service_tier: formData.service_tier || null,
    wedding_styles: formData.wedding_styles,
    cultural_specialties: formData.cultural_specialties,
    availability: formData.availability
  };

  const response = await fetch('/api/services', {
    method: editingService ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData)
  });

  // ... handle response ...
};
```

### Step 3.2: Create Multi-Service Booking Component

**New File:** `src/pages/users/individual/bookings/components/MultiServiceBookingForm.tsx`

```typescript
import React, { useState } from 'react';
import { X, Plus, Calendar, MapPin, Users, Check } from 'lucide-react';

interface ServiceSelection {
  service_id: string;
  service_name: string;
  category: string;
  vendor_id: string;
  vendor_name: string;
  price: number;
  dss_data?: any;
}

export const MultiServiceBookingForm: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [eventDetails, setEventDetails] = useState({
    date: '',
    time: '',
    location: '',
    guestCount: 0
  });

  const handleSubmit = async () => {
    const bookingData = {
      couple_id: currentUser.id,
      customer_name: currentUser.name,
      customer_email: currentUser.email,
      customer_phone: currentUser.phone,
      event_date: eventDetails.date,
      event_time: eventDetails.time,
      event_location: eventDetails.location,
      guest_count: eventDetails.guestCount,
      services: selectedServices
    };

    const response = await fetch('/api/bookings/multi-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    if (response.ok) {
      const data = await response.json();
      // Navigate to group chat
      navigate(`/individual/messages/${data.conversation.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Book Multiple Services</h2>
      
      {/* Service Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Selected Services ({selectedServices.length})</h3>
        {selectedServices.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow mb-3">
            <div>
              <h4 className="font-semibold">{service.service_name}</h4>
              <p className="text-sm text-gray-600">{service.vendor_name} • {service.category}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">₱{service.price.toLocaleString()}</span>
              <button onClick={() => removeService(index)}>
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Event Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={eventDetails.date}
            onChange={(e) => setEventDetails({...eventDetails, date: e.target.value})}
            className="p-3 border rounded-lg"
          />
          <input
            type="time"
            value={eventDetails.time}
            onChange={(e) => setEventDetails({...eventDetails, time: e.target.value})}
            className="p-3 border rounded-lg"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700"
      >
        Book {selectedServices.length} Services • ₱{totalPrice.toLocaleString()}
      </button>
    </div>
  );
};
```

### Step 3.3: Create Group Chat Component

**New File:** `src/pages/shared/messenger/GroupChatMessenger.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Users, Send, Paperclip } from 'lucide-react';

interface Participant {
  user_id: string;
  user_name: string;
  user_type: 'couple' | 'vendor' | 'admin';
  user_avatar?: string;
  is_active: boolean;
}

export const GroupChatMessenger: React.FC<{ conversationId: string }> = ({ conversationId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchParticipants();
    fetchMessages();
  }, [conversationId]);

  const fetchParticipants = async () => {
    const response = await fetch(`/api/conversations/${conversationId}/participants`);
    const data = await response.json();
    setParticipants(data.participants);
  };

  const sendMessage = async () => {
    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: currentUser.id,
        sender_type: currentUser.type,
        sender_name: currentUser.name,
        content: newMessage
      })
    });
    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with Participants */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-semibold">Group Chat</h3>
          <span className="text-sm text-gray-500">({participants.length} participants)</span>
        </div>
        <div className="flex gap-2 mt-2">
          {participants.map(p => (
            <div key={p.user_id} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
              {p.user_name} {p.user_type === 'vendor' && '👔'}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.sender_id === currentUser.id ? 'text-right' : ''}`}>
            <div className="inline-block">
              <div className="text-xs text-gray-500 mb-1">{msg.sender_name}</div>
              <div className={`px-4 py-2 rounded-lg ${
                msg.sender_id === currentUser.id 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="px-6 py-2 bg-rose-600 text-white rounded-lg">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Step 3.4: Deploy Frontend

```bash
npm run build
firebase deploy
```

**Verify Deployment:**
- Visit: https://weddingbazaar-web.web.app
- Test: Add service with DSS fields
- Test: Multi-service booking flow
- Test: Group chat functionality

---

## ✅ TESTING CHECKLIST

### DSS Fields Testing:
- [ ] Can create service with all DSS fields filled
- [ ] Can create service with minimal DSS fields (optional fields empty)
- [ ] DSS fields display correctly in service details
- [ ] Can edit service and update DSS fields
- [ ] Search/filter by service_tier works
- [ ] Search/filter by wedding_styles works
- [ ] Search/filter by cultural_specialties works

### Multi-Service Booking Testing:
- [ ] Can select multiple services from different vendors
- [ ] Total price calculates correctly
- [ ] Booking creates main booking record
- [ ] Booking creates individual booking_items
- [ ] Each vendor sees their booking item
- [ ] Group conversation created automatically
- [ ] All vendors added as participants

### Group Chat Testing:
- [ ] Can see all participants in group chat
- [ ] Can send messages to group
- [ ] All participants receive messages
- [ ] Couple can see all vendor responses
- [ ] Vendors can see messages from couple and other vendors
- [ ] Notifications work for all participants
- [ ] Can add additional participants if needed

---

## 🐛 TROUBLESHOOTING

### Issue: Migration fails with "column already exists"
**Solution:** This is safe to ignore - column was added in previous run. Continue with next migration.

### Issue: Foreign key constraint error
**Solution:** Verify parent tables (bookings, conversations) exist before creating child tables.

### Issue: Frontend gets 500 error when creating service
**Solution:** Check backend logs - likely a field type mismatch. Verify all DSS fields match database column types.

### Issue: Group chat doesn't show all participants
**Solution:** Check conversation_participants table - verify all vendors were added. Check is_active = true.

---

## 📚 REFERENCE DOCUMENTATION

### Database Schema Reference:
- See: `migrations/*.sql` for exact column definitions
- See: `DSS_MULTI_SERVICE_BOOKING_GROUPCHAT_ANALYSIS.md` for complete analysis

### API Endpoint Reference:
```
POST   /api/services                          - Create service with DSS fields
PUT    /api/services/:id                      - Update service with DSS fields
POST   /api/bookings/multi-service            - Create multi-service booking
GET    /api/conversations/:id/participants    - Get group chat participants
POST   /api/conversations/:id/participants    - Add participant to group chat
GET    /api/conversations/:id/messages        - Get group chat messages
POST   /api/conversations/:id/messages        - Send message to group chat
```

---

## 🎯 SUCCESS CRITERIA

### ✅ Phase 1 Complete:
- All 3 migrations run successfully
- Database schema verified
- No errors in migration logs

### ✅ Phase 2 Complete:
- Backend deploys successfully to Render
- All new API endpoints respond correctly
- Backend logs show no errors

### ✅ Phase 3 Complete:
- Frontend deploys successfully to Firebase
- Add Service Form submits with DSS fields
- Multi-service booking flow works end-to-end
- Group chat displays and functions correctly

---

## 📅 TIMELINE ESTIMATE

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Database Migrations | 1-2 hours |
| 2 | Backend API Updates | 4-6 hours |
| 3 | Frontend Components | 8-12 hours |
| 4 | Testing & Debugging | 4-6 hours |
| **TOTAL** | **Complete Implementation** | **17-26 hours (2-3 days)** |

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] Backup production database
- [ ] Test migrations in development environment
- [ ] Review all code changes
- [ ] Update documentation

### Deployment:
- [ ] Run database migrations
- [ ] Deploy backend to Render
- [ ] Test backend API endpoints
- [ ] Deploy frontend to Firebase
- [ ] Smoke test production

### Post-Deployment:
- [ ] Monitor error logs
- [ ] Test critical user flows
- [ ] Gather user feedback
- [ ] Create hotfix branch if needed

---

**Ready to begin implementation! Start with Phase 1: Database Migrations** 🚀
