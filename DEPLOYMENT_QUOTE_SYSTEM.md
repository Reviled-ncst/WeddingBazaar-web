# Quote System & Date Tracking Deployment Guide

## 🚀 Deployment Steps for Render.com

### Step 1: Deploy Backend Code ✅ READY

1. **Commit and push the changes**:
```bash
git add backend-deploy/routes/bookings.cjs
git add add-quote-fields-migration.cjs
git add create-booking-dates-table.cjs
git add QUOTE_SYSTEM_ENHANCEMENT_GUIDE.md
git commit -m "feat: Add quote itemization and date unavailability tracking"
git push origin main
```

2. **Render will auto-deploy** - Wait for deployment to complete

3. **Verify deployment**:
   - Check Render logs for successful build
   - Test health endpoint: `https://weddingbazaar-web.onrender.com/api/health`

### Step 2: Run Database Migrations

#### Option A: Using Render Shell (Recommended)
1. Go to Render dashboard → Your service → Shell tab
2. Run migrations:
```bash
node add-quote-fields-migration.cjs
node create-booking-dates-table.cjs
```

#### Option B: Using Local Connection to Neon
1. Set DATABASE_URL in your local `.env`:
```bash
DATABASE_URL=your_neon_connection_string
```

2. Run migrations locally:
```bash
node add-quote-fields-migration.cjs
node create-booking-dates-table.cjs
```

#### Option C: Using Neon SQL Editor
1. Log into Neon dashboard
2. Go to SQL Editor
3. Run this SQL:

```sql
-- Migration 1: Add Quote Fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_deposit NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_itemization JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_valid_until TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_bookings_quote_sent_date 
ON bookings(quote_sent_date) 
WHERE quote_sent_date IS NOT NULL;

-- Migration 2: Create Booking Dates Table
CREATE TABLE IF NOT EXISTS booking_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) NOT NULL,
  booking_id BIGINT,
  event_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'booked',
  time_slot VARCHAR(20) DEFAULT 'full_day',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_vendor_date_slot UNIQUE(vendor_id, event_date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_booking_dates_vendor 
ON booking_dates(vendor_id, event_date);

CREATE INDEX IF NOT EXISTS idx_booking_dates_status 
ON booking_dates(status) 
WHERE status = 'booked';

CREATE INDEX IF NOT EXISTS idx_booking_dates_booking 
ON booking_dates(booking_id) 
WHERE booking_id IS NOT NULL;

-- Create availability view
CREATE OR REPLACE VIEW vendor_availability AS
SELECT 
  bd.vendor_id,
  bd.event_date,
  bd.time_slot,
  bd.status,
  bd.booking_id,
  bd.notes,
  b.couple_name,
  b.service_type,
  v.business_name as vendor_name
FROM booking_dates bd
LEFT JOIN bookings b ON bd.booking_id = b.id
LEFT JOIN vendors v ON bd.vendor_id = v.vendor_id
WHERE bd.status = 'booked'
ORDER BY bd.event_date ASC;
```

### Step 3: Verify Database Changes

```sql
-- Check quote fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings'
AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization', 'quote_sent_date', 'quote_valid_until');

-- Check booking_dates table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'booking_dates'
ORDER BY ordinal_position;

-- Verify view created
SELECT * FROM vendor_availability LIMIT 5;
```

### Step 4: Test Quote Sending Endpoint

```bash
# Test send quote with itemization
curl -X PUT https://weddingbazaar-web.onrender.com/api/bookings/YOUR_BOOKING_ID/send-quote \
  -H "Content-Type: application/json" \
  -d '{
    "quotedPrice": 50000,
    "quotedDeposit": 15000,
    "itemization": {
      "items": [
        {
          "name": "Wedding Photography Package",
          "description": "8 hours coverage + digital album",
          "quantity": 1,
          "unitPrice": 45000,
          "total": 45000
        },
        {
          "name": "Engagement Shoot",
          "description": "2 hours pre-wedding session",
          "quantity": 1,
          "unitPrice": 5000,
          "total": 5000
        }
      ],
      "subtotal": 50000,
      "discount": 0,
      "total": 50000,
      "deposit": 15000,
      "depositPercentage": 30,
      "notes": "Balance due 1 week before event",
      "validUntil": "2026-01-15"
    },
    "vendorNotes": "Thank you for your interest! Here is your customized quote.",
    "validityDays": 30
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Quote sent successfully to couple",
  "booking": {
    "id": "YOUR_BOOKING_ID",
    "status": "quote_sent",
    "quoted_price": 50000,
    "quoted_deposit": 15000,
    "quote_itemization": { ... }
  },
  "quote": {
    "totalPrice": 50000,
    "depositAmount": 15000,
    "depositPercentage": 30,
    "validUntil": "2025-11-20T...",
    "itemsCount": 2
  }
}
```

### Step 5: Test Quote Retrieval

```bash
# Get booking with quote details
curl https://weddingbazaar-web.onrender.com/api/bookings/YOUR_BOOKING_ID
```

Should return booking with:
- `quoted_price`: 50000
- `quoted_deposit`: 15000
- `quote_itemization`: { items: [...], subtotal, total, ... }
- `quote_sent_date`: timestamp
- `quote_valid_until`: timestamp

## 🧪 Testing Checklist

### Backend Testing
- [ ] Migrations run without errors
- [ ] All new columns exist in bookings table
- [ ] booking_dates table created successfully
- [ ] Indexes created for performance
- [ ] vendor_availability view working

### Quote System Testing
- [ ] Vendor can send quote via PUT /bookings/:id/send-quote
- [ ] quoted_price stored in database
- [ ] quoted_deposit calculated and stored
- [ ] quote_itemization JSONB stored correctly
- [ ] quote_sent_date and quote_valid_until set
- [ ] Couple sees quote in enhanced bookings endpoint
- [ ] Quote displays in frontend (after frontend update)

### Date Tracking Testing (Future)
- [ ] Date blocked when booking confirmed
- [ ] Vendor can manually block dates
- [ ] Check availability endpoint works
- [ ] Double-booking prevented
- [ ] Calendar shows unavailable dates

## 📝 What Changed

### Database Schema
**bookings table** - New columns:
- `quoted_price` NUMERIC(10,2) - Total quoted price
- `quoted_deposit` NUMERIC(10,2) - Deposit amount
- `quote_itemization` JSONB - Service breakdown
- `quote_sent_date` TIMESTAMP - When quote sent
- `quote_valid_until` TIMESTAMP - Quote expiration

**New table: booking_dates**:
- Tracks booked/blocked dates for vendors
- Prevents double-booking
- Supports time slot granularity

**New view: vendor_availability**:
- Shows all booked dates for vendors
- Includes booking and couple information

### API Endpoints
**New endpoint**: `PUT /api/bookings/:bookingId/send-quote`
- Accepts itemization structure
- Calculates deposit automatically (default 30%)
- Sets quote expiration date
- Updates booking with all quote data

### Backend Logic
- Quote sending now updates `quoted_price`, `quoted_deposit`, and `quote_itemization`
- Enhanced bookings endpoint returns quote fields
- Status mapping maintains compatibility

## 🔄 Frontend Integration (Next Steps)

### Update VendorBookings.tsx
Need to create itemization builder UI:
```tsx
// Quote form with itemization
const [quoteItems, setQuoteItems] = useState([
  { name: '', description: '', quantity: 1, unitPrice: 0 }
]);

const addQuoteItem = () => {
  setQuoteItems([...quoteItems, { name: '', description: '', quantity: 1, unitPrice: 0 }]);
};

const calculateTotal = () => {
  return quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
};

// Submit quote
const handleSendQuote = async () => {
  const total = calculateTotal();
  const deposit = Math.round(total * 0.3);
  
  await fetch(`/api/bookings/${bookingId}/send-quote`, {
    method: 'PUT',
    body: JSON.stringify({
      quotedPrice: total,
      quotedDeposit: deposit,
      itemization: {
        items: quoteItems,
        subtotal: total,
        discount: 0,
        total,
        deposit,
        depositPercentage: 30
      },
      vendorNotes: notes,
      validityDays: 30
    })
  });
};
```

### Update IndividualBookings.tsx
Display itemized quote:
```tsx
{booking.quote_itemization && (
  <div className="quote-breakdown">
    <h3>Service Breakdown</h3>
    {booking.quote_itemization.items.map((item, idx) => (
      <div key={idx}>
        <span>{item.name}</span>
        <span>₱{item.total.toLocaleString()}</span>
      </div>
    ))}
    <div>Total: ₱{booking.quoted_price.toLocaleString()}</div>
    <div>Deposit (30%): ₱{booking.quoted_deposit.toLocaleString()}</div>
  </div>
)}
```

## 🚨 Troubleshooting

### Migration fails with "column already exists"
This is fine - it means migration was run before. Verify with:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('quoted_price', 'quoted_deposit');
```

### Quote not showing in frontend
1. Check backend response includes quote fields
2. Verify `booking-data-mapping.ts` maps quote fields
3. Check console logs for mapping errors

### Date blocking not working
1. Verify booking_dates table exists
2. Check booking confirmation triggers date block
3. Verify vendor_id format matches bookings table

## 📞 Support

If issues persist:
1. Check Render logs for backend errors
2. Check browser console for frontend errors
3. Verify database schema matches expected structure
4. Test API endpoints directly with curl/Postman

## 🎯 Success Criteria

✅ Database migrations complete
✅ New endpoint returns quote data
✅ Quoted price stored in database (not just notes)
✅ Itemization accessible via API
✅ Frontend can display itemized quotes
✅ Date tracking table ready for implementation
✅ No breaking changes to existing flows
