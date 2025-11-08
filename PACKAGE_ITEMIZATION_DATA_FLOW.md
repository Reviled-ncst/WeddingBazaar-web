# 📦 Package Itemization - Complete Data Flow

## Visual Guide: From User Click to Database Storage

```
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER SELECTS PACKAGE                                         │
│ Location: Services_Centralized.tsx → ServiceCard                     │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ User clicks "Book Now" on:
                 │ Package: "Luxury Garden Package"
                 │ Price: ₱380,000
                 │ Items: 5 included items
                 │ Add-ons: 2 available
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 2: BOOKING MODAL OPENS                                          │
│ Location: BookingRequestModal.tsx                                    │
│                                                                       │
│ Modal displays:                                                      │
│   ┌─────────────────────────────────────────────┐                   │
│   │ 🎉 Luxury Garden Package                    │                   │
│   │ Base Price: ₱380,000                        │                   │
│   │                                             │                   │
│   │ ✅ Included:                                │                   │
│   │  • Full Venue Setup (x1)                   │                   │
│   │  • Floral Arrangements (x20)               │                   │
│   │  • Premium Tables & Chairs (x150)          │                   │
│   │  • Sound System (x1)                       │                   │
│   │  • Professional Lighting (x1)              │                   │
│   │                                             │                   │
│   │ 🎁 Add-ons Available:                       │                   │
│   │  ☐ Premium Lighting (+₱15,000)             │                   │
│   │  ☐ Extended Hours (+₱20,000)               │                   │
│   │                                             │                   │
│   │ Event Date: [2025-03-15]                   │                   │
│   │ Guest Count: [150]                         │                   │
│   │ Special Requests: [textarea]               │                   │
│   │                                             │                   │
│   │ [Submit Booking Request]                   │                   │
│   └─────────────────────────────────────────────┘                   │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ User fills form and clicks "Submit"
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 3: FRONTEND CREATES BOOKING REQUEST                             │
│ Location: BookingRequestModal.tsx (Lines 258-285)                    │
│                                                                       │
│ JavaScript Object:                                                   │
│ {                                                                    │
│   coupleId: "d4fa3cc5-bd61-4f45-a932-39b6b4f7e5c9",                 │
│   vendorId: "5ed16630-bbf4-4ead-bfe9-d61b4b55b3fa",                 │
│   serviceId: "service-123",                                          │
│   serviceName: "Luxury Garden Package",                              │
│                                                                       │
│   // NEW: Package/itemization data                                   │
│   packageId: "luxury-garden-pkg",                                    │
│   packageName: "Luxury Garden Package",                              │
│   packagePrice: 380000,                                              │
│   packageItems: [                                                    │
│     {                                                                │
│       name: "Full Venue Setup",                                      │
│       description: "Complete garden decoration",                     │
│       quantity: 1,                                                   │
│       included: true                                                 │
│     },                                                               │
│     {                                                                │
│       name: "Floral Arrangements",                                   │
│       description: "Premium roses and orchids",                      │
│       quantity: 20,                                                  │
│       included: true                                                 │
│     },                                                               │
│     // ... 3 more items                                              │
│   ],                                                                 │
│   selectedAddons: [                                                  │
│     {                                                                │
│       id: "addon-1",                                                 │
│       name: "Premium Lighting",                                      │
│       description: "Fairy lights and spotlights",                    │
│       price: 15000,                                                  │
│       quantity: 1                                                    │
│     }                                                                │
│   ],                                                                 │
│   addonTotal: 15000,                                                 │
│   subtotal: 395000,                                                  │
│                                                                       │
│   // Event details                                                   │
│   eventDate: "2025-03-15",                                           │
│   eventTime: "14:00",                                                │
│   guestCount: 150,                                                   │
│   specialRequests: "Need early setup access"                         │
│ }                                                                    │
│                                                                       │
│ Console Log:                                                         │
│ 📦 [ITEMIZATION] Booking request payload: {                          │
│   hasPackageData: true,                                              │
│   packageName: "Luxury Garden Package",                              │
│   itemsCount: 5,                                                     │
│   addonsCount: 1,                                                    │
│   subtotal: 395000                                                   │
│ }                                                                    │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ POST Request to API
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 4: API ENDPOINT RECEIVES REQUEST                                │
│ Location: backend-deploy/routes/bookings.cjs                         │
│ Endpoint: POST /api/bookings/request                                 │
│                                                                       │
│ Backend Log:                                                         │
│ 📝 Creating booking request: {                                       │
│   coupleId: "d4fa3cc5...",                                           │
│   vendorId: "5ed16630...",                                           │
│   packageId: "luxury-garden-pkg",                                    │
│   packageName: "Luxury Garden Package",                              │
│   packagePrice: 380000,                                              │
│   packageItemsCount: 5,                                              │
│   selectedAddonsCount: 1,                                            │
│   addonTotal: 15000,                                                 │
│   subtotal: 395000                                                   │
│ }                                                                    │
│                                                                       │
│ Destructure Request Body (Line 946):                                 │
│ const {                                                              │
│   coupleId, vendorId, serviceId, serviceName, serviceType,           │
│   eventDate, eventTime, ...existing fields,                          │
│   // NEW: Package/itemization fields                                 │
│   packageId, packageName, packagePrice,                              │
│   packageItems, selectedAddons, addonTotal, subtotal                 │
│ } = req.body;                                                        │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ Prepare SQL INSERT
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 5: INSERT INTO DATABASE                                         │
│ Location: backend-deploy/routes/bookings.cjs (Line 1014)             │
│                                                                       │
│ SQL Query:                                                           │
│ INSERT INTO bookings (                                               │
│   couple_id, vendor_id, service_id,                                  │
│   event_date, event_time, event_location,                            │
│   guest_count, special_requests,                                     │
│   service_name, service_type, status,                                │
│   // NEW: Package columns                                            │
│   package_id, package_name, package_price,                           │
│   package_items, selected_addons,                                    │
│   addon_total, subtotal,                                             │
│   created_at, updated_at                                             │
│ ) VALUES (                                                           │
│   'd4fa3cc5-bd61-4f45-a932-39b6b4f7e5c9',      -- couple_id          │
│   '5ed16630-bbf4-4ead-bfe9-d61b4b55b3fa',      -- vendor_id          │
│   'service-123',                                -- service_id         │
│   '2025-03-15',                                 -- event_date         │
│   '14:00',                                      -- event_time         │
│   'Metro Manila Garden Venue',                 -- event_location     │
│   150,                                          -- guest_count        │
│   'Need early setup access',                   -- special_requests   │
│   'Luxury Garden Package',                     -- service_name       │
│   'venue',                                      -- service_type       │
│   'request',                                    -- status             │
│   'luxury-garden-pkg',                          -- package_id         │
│   'Luxury Garden Package',                     -- package_name       │
│   380000,                                       -- package_price      │
│   '[{"name":"Full Venue Setup",...}]',         -- package_items      │
│   '[{"id":"addon-1","name":"Premium..."}]',    -- selected_addons    │
│   15000,                                        -- addon_total        │
│   395000,                                       -- subtotal           │
│   NOW(),                                        -- created_at         │
│   NOW()                                         -- updated_at         │
│ ) RETURNING *;                                                       │
│                                                                       │
│ Note: Arrays are JSON.stringify'd before insertion:                  │
│   JSON.stringify(packageItems)      → JSONB column                   │
│   JSON.stringify(selectedAddons)    → JSONB column                   │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ Database Executes INSERT
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 6: DATA STORED IN NEON POSTGRESQL                               │
│ Table: bookings                                                      │
│                                                                       │
│ New Record Created:                                                  │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ id: 123e4567-e89b-12d3-a456-426614174000                        │  │
│ │ booking_reference: BK-20241220-001                              │  │
│ │ couple_id: d4fa3cc5-bd61-4f45-a932-39b6b4f7e5c9                │  │
│ │ vendor_id: 5ed16630-bbf4-4ead-bfe9-d61b4b55b3fa                │  │
│ │ service_id: service-123                                         │  │
│ │ service_name: Luxury Garden Package                             │  │
│ │ service_type: venue                                             │  │
│ │ status: request                                                 │  │
│ │ event_date: 2025-03-15                                          │  │
│ │ event_time: 14:00                                               │  │
│ │ guest_count: 150                                                │  │
│ │ special_requests: Need early setup access                       │  │
│ │                                                                 │  │
│ │ ===== NEW PACKAGE COLUMNS =====                                 │  │
│ │ package_id: luxury-garden-pkg                                   │  │
│ │ package_name: Luxury Garden Package                             │  │
│ │ package_price: 380000.00                                        │  │
│ │ package_items: [                                                │  │
│ │   {                                                             │  │
│ │     "name": "Full Venue Setup",                                 │  │
│ │     "description": "Complete garden decoration",                │  │
│ │     "quantity": 1,                                              │  │
│ │     "included": true                                            │  │
│ │   },                                                            │  │
│ │   {                                                             │  │
│ │     "name": "Floral Arrangements",                              │  │
│ │     "description": "Premium roses and orchids",                 │  │
│ │     "quantity": 20,                                             │  │
│ │     "included": true                                            │  │
│ │   },                                                            │  │
│ │   ...3 more items                                               │  │
│ │ ]  (JSONB type)                                                 │  │
│ │ selected_addons: [                                              │  │
│ │   {                                                             │  │
│ │     "id": "addon-1",                                            │  │
│ │     "name": "Premium Lighting",                                 │  │
│ │     "description": "Fairy lights and spotlights",               │  │
│ │     "price": 15000,                                             │  │
│ │     "quantity": 1                                               │  │
│ │   }                                                             │  │
│ │ ]  (JSONB type)                                                 │  │
│ │ addon_total: 15000.00                                           │  │
│ │ subtotal: 395000.00                                             │  │
│ │                                                                 │  │
│ │ created_at: 2024-12-20 10:30:00                                 │  │
│ │ updated_at: 2024-12-20 10:30:00                                 │  │
│ └────────────────────────────────────────────────────────────────┘  │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ Success Response Sent Back
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 7: FRONTEND RECEIVES SUCCESS RESPONSE                           │
│ Location: BookingRequestModal.tsx                                    │
│                                                                       │
│ API Response:                                                        │
│ {                                                                    │
│   success: true,                                                     │
│   bookingId: "123e4567-e89b-12d3-a456-426614174000",                │
│   message: "Booking request submitted successfully"                  │
│ }                                                                    │
│                                                                       │
│ Modal shows:                                                         │
│   ┌─────────────────────────────────────────────┐                   │
│   │ ✅ Success!                                 │                   │
│   │                                             │                   │
│   │ Your booking request has been sent to       │                   │
│   │ Luxury Garden Venue.                        │                   │
│   │                                             │                   │
│   │ Booking Reference: BK-20241220-001          │                   │
│   │                                             │                   │
│   │ The vendor will review your request and     │                   │
│   │ send a detailed quote within 24 hours.      │                   │
│   │                                             │                   │
│   │ [View My Bookings]                          │                   │
│   └─────────────────────────────────────────────┘                   │
└────────────────┬─────────────────────────────────────────────────────┘
                 │
                 │ User clicks "View My Bookings"
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 8: BOOKING DISPLAYED IN USER'S BOOKINGS PAGE                    │
│ Location: IndividualBookings.tsx                                     │
│                                                                       │
│ Current Display (Basic):                                             │
│   ┌─────────────────────────────────────────────┐                   │
│   │ 📦 Luxury Garden Package                    │                   │
│   │ 📅 Event Date: March 15, 2025               │                   │
│   │ 👥 Guests: 150                              │                   │
│   │ 🏷️ Status: Awaiting Quote                   │                   │
│   │ 💰 Budget: Not yet quoted                   │                   │
│   │                                             │                   │
│   │ [View Details] [Cancel Request]             │                   │
│   └─────────────────────────────────────────────┘                   │
│                                                                       │
│ FUTURE: Enhanced Display (After UI Update):                          │
│   ┌─────────────────────────────────────────────┐                   │
│   │ 📦 Luxury Garden Package                    │                   │
│   │ 📅 Event Date: March 15, 2025               │                   │
│   │ 👥 Guests: 150                              │                   │
│   │ 🏷️ Status: Awaiting Quote                   │                   │
│   │                                             │                   │
│   │ 💼 Package Details:                         │                   │
│   │   Base Price: ₱380,000                      │                   │
│   │                                             │                   │
│   │   ✅ Included Items (5):                    │                   │
│   │   • Full Venue Setup (x1)                  │                   │
│   │   • Floral Arrangements (x20)              │                   │
│   │   • Premium Tables & Chairs (x150)         │                   │
│   │   • Sound System (x1)                      │                   │
│   │   • Professional Lighting (x1)             │                   │
│   │                                             │                   │
│   │   🎁 Add-ons (1):                           │                   │
│   │   • Premium Lighting: ₱15,000              │                   │
│   │                                             │                   │
│   │   💵 Total: ₱395,000                        │                   │
│   │                                             │                   │
│   │ [View Full Details] [Cancel Request]        │                   │
│   └─────────────────────────────────────────────┘                   │
│                                                                       │
│ To Parse JSONB Data:                                                 │
│ const packageItems = Array.isArray(booking.package_items)            │
│   ? booking.package_items                                            │
│   : JSON.parse(booking.package_items || '[]');                       │
│                                                                       │
│ const selectedAddons = Array.isArray(booking.selected_addons)        │
│   ? booking.selected_addons                                          │
│   : JSON.parse(booking.selected_addons || '[]');                     │
└──────────────────────────────────────────────────────────────────────┘

```

---

## 🎯 Key Technical Points

### 1. Data Type Conversions

| Location | Type | Example |
|----------|------|---------|
| Frontend Object | JavaScript Array | `[{name: "Item", quantity: 1}]` |
| API Request | JavaScript Array | Same as above |
| Backend Processing | JavaScript Array | Same as above |
| Before DB Insert | JSON String | `JSON.stringify([...])` |
| In Database | JSONB | Stored as binary JSON |
| After DB Query | JavaScript Object/String | Depends on driver |
| Frontend Display | JavaScript Array | `JSON.parse(...)` if needed |

### 2. Field Mapping

| Frontend Property | API Body Field | Database Column | Type |
|-------------------|----------------|-----------------|------|
| `selectedPackage.id` | `packageId` | `package_id` | VARCHAR |
| `selectedPackage.name` | `packageName` | `package_name` | VARCHAR |
| `selectedPackage.price` | `packagePrice` | `package_price` | DECIMAL |
| `selectedPackage.items` | `packageItems` | `package_items` | JSONB |
| `selectedPackage.addons` | `selectedAddons` | `selected_addons` | JSONB |
| `calculateAddonTotal()` | `addonTotal` | `addon_total` | DECIMAL |
| `calculateSubtotal()` | `subtotal` | `subtotal` | DECIMAL |

### 3. Status Flow

```
User Action          Backend         Database        Display
-----------          -------         --------        -------
Click "Book Now"  →  Validate     →  INSERT      →  "Request Sent"
                     package data    with JSONB      
                                    
Vendor Response   →  Update       →  UPDATE      →  "Quote Sent"
                     with quote      vendor_notes    + Package details
                                    
User Accepts      →  Confirm      →  UPDATE      →  "Confirmed"
                     booking         status          + Payment options
                                    
Payment Made      →  Create       →  INSERT      →  "Paid"
                     receipt         receipts        + Receipt view
                                    
Service Complete  →  Mark done    →  UPDATE      →  "Completed"
                                     completion      + Review option
```

---

## 🔄 Data Round-Trip Example

```javascript
// FRONTEND (BookingRequestModal.tsx)
const bookingData = {
  packageId: "luxury-garden-pkg",
  packageItems: [
    { name: "Full Venue Setup", quantity: 1, included: true }
  ]
};

// API REQUEST (axios.post)
axios.post('/api/bookings/request', bookingData);

// BACKEND (bookings.cjs)
const { packageId, packageItems } = req.body;
// packageItems is still an array here

// DATABASE INSERT
await sql`
  INSERT INTO bookings (package_id, package_items)
  VALUES (
    ${packageId},
    ${JSON.stringify(packageItems)}  // Convert to JSON string
  )
`;

// DATABASE STORAGE (Neon PostgreSQL)
-- package_id: "luxury-garden-pkg" (VARCHAR)
-- package_items: [{"name":"Full Venue Setup",...}] (JSONB)

// DATABASE QUERY
const bookings = await sql`
  SELECT * FROM bookings WHERE id = ${bookingId}
`;
// bookings[0].package_items might be string or object depending on driver

// FRONTEND DISPLAY (IndividualBookings.tsx)
const packageItems = Array.isArray(booking.package_items)
  ? booking.package_items
  : JSON.parse(booking.package_items || '[]');

// RENDER
packageItems.map(item => (
  <div key={item.name}>
    {item.name} (x{item.quantity})
  </div>
))
```

---

## 📊 Database Schema Visualization

```sql
TABLE: bookings
├── id (UUID, PK)
├── booking_reference (VARCHAR)
├── couple_id (UUID, FK → users.id)
├── vendor_id (UUID, FK → vendors.id)
├── service_id (UUID, FK → services.id)
│
├── Event Details
│   ├── event_date (DATE)
│   ├── event_time (TIME)
│   ├── event_location (VARCHAR)
│   ├── guest_count (INTEGER)
│   └── special_requests (TEXT)
│
├── Service Info
│   ├── service_name (VARCHAR)
│   ├── service_type (VARCHAR)
│   └── status (VARCHAR)
│
├── 📦 NEW: Package/Itemization Fields
│   ├── package_id (VARCHAR 255)
│   ├── package_name (VARCHAR 500)
│   ├── package_price (DECIMAL 12,2)
│   ├── package_items (JSONB) ← Array of items
│   ├── selected_addons (JSONB) ← Array of add-ons
│   ├── addon_total (DECIMAL 12,2)
│   └── subtotal (DECIMAL 12,2)
│
├── Pricing (Legacy)
│   ├── budget_range (VARCHAR)
│   ├── total_amount (DECIMAL)
│   └── total_paid (DECIMAL)
│
└── Timestamps
    ├── created_at (TIMESTAMP)
    └── updated_at (TIMESTAMP)
```

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Browser Console**:
   ```
   📦 [ITEMIZATION] Booking request payload: {
     hasPackageData: true,
     packageName: "Luxury Garden Package",
     itemsCount: 5,
     addonsCount: 1,
     subtotal: 395000
   }
   ```

2. **Backend Logs (Render)**:
   ```
   📝 Creating booking request: { ... }
   💾 Inserting booking with data: {
     packageId: "luxury-garden-pkg",
     packageItemsCount: 5,
     selectedAddonsCount: 1,
     subtotal: 395000
   }
   ✅ Booking request created with ID: 123e4567...
   ```

3. **Database Query**:
   ```sql
   SELECT package_name, package_price, package_items::text, subtotal
   FROM bookings
   WHERE id = '123e4567-e89b-12d3-a456-426614174000';
   
   -- Result:
   -- package_name    | Luxury Garden Package
   -- package_price   | 380000.00
   -- package_items   | [{"name":"Full Venue Setup",...}]
   -- subtotal        | 395000.00
   ```

4. **API Response**:
   ```json
   {
     "success": true,
     "bookingId": "123e4567-e89b-12d3-a456-426614174000",
     "message": "Booking request submitted successfully"
   }
   ```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Complete Implementation - Ready for Deployment
