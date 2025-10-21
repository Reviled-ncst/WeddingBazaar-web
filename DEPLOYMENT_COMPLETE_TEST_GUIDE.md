# 🚀 DEPLOYMENT COMPLETE - Testing Guide

## ✅ What's Deployed

### Frontend ✅ LIVE
- **URL**: https://weddingbazaarph.web.app
- **Status**: Deployed successfully
- **Changes**: Services availability fix (React object rendering error fixed)

### Backend ✅ DEPLOYING
- **URL**: https://weddingbazaar-web.onrender.com
- **Status**: Auto-deploying from GitHub (check Render logs)
- **Changes**: New quote sending endpoint with itemization support

## ⚠️ CRITICAL: Run Database Migration First!

Before testing the quote system, you MUST run the database migration:

### Quick Method (Copy-Paste into Neon SQL Editor):

```sql
-- Step 1: Add Quote Fields to Bookings Table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_price NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quoted_deposit NUMERIC(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_itemization JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_valid_until TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_bookings_quote_sent_date 
ON bookings(quote_sent_date) WHERE quote_sent_date IS NOT NULL;

-- Step 2: Create Date Tracking Table
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

CREATE INDEX IF NOT EXISTS idx_booking_dates_vendor ON booking_dates(vendor_id, event_date);
CREATE INDEX IF NOT EXISTS idx_booking_dates_status ON booking_dates(status) WHERE status = 'booked';

-- Step 3: Create Availability View
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

### Verify Migration:
```sql
-- Check columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('quoted_price', 'quoted_deposit', 'quote_itemization');

-- Should return 3 rows
```

## 🧪 Testing Steps

### 1. Test Services Page (Already Fixed) ✅
1. Go to: https://weddingbazaarph.web.app/individual/services
2. **Expected**: Page loads without crashing
3. **Before**: React error about rendering object with keys `{seasons, holidays, weekdays, weekends}`
4. **After**: Availability displays as string or "Available"

### 2. Test Quote Sending Endpoint (NEW)

**Wait for Render deployment to complete** (~2-3 minutes after push)

```bash
# Test the new send-quote endpoint
curl -X PUT https://weddingbazaar-web.onrender.com/api/bookings/YOUR_BOOKING_ID/send-quote \
  -H "Content-Type: application/json" \
  -d '{
    "quotedPrice": 50000,
    "quotedDeposit": 15000,
    "itemization": {
      "items": [
        {
          "name": "Wedding Photography Package",
          "description": "8 hours coverage + album",
          "quantity": 1,
          "unitPrice": 50000,
          "total": 50000
        }
      ],
      "subtotal": 50000,
      "total": 50000,
      "deposit": 15000
    },
    "vendorNotes": "Test quote from API",
    "validityDays": 30
  }'
```

**Expected Response**:
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
  }
}
```

### 3. Test Quote Viewing (Enhanced Bookings)

```bash
# Get booking with quote data
curl https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001
```

**Look for**:
- `quoted_price`: 50000
- `quoted_deposit`: 15000
- `quote_itemization`: { items: [...], subtotal, total }
- `quote_sent_date`: timestamp
- `quote_valid_until`: timestamp

### 4. Check Render Deployment Status

1. Go to: https://dashboard.render.com
2. Find your "weddingbazaar-web" service
3. Check "Events" tab for deployment status
4. **Look for**: "Deploy succeeded" or "Deploy live"
5. Check logs for errors

### 5. Verify Database Changes

In Neon SQL Editor:
```sql
-- Check quote fields
SELECT id, quoted_price, quoted_deposit, quote_sent_date 
FROM bookings 
WHERE quoted_price IS NOT NULL 
LIMIT 5;

-- Check booking_dates table exists
SELECT COUNT(*) FROM booking_dates;
```

## 🔍 What to Look For

### Services Page ✅
- ✅ No React errors in console
- ✅ Services load and display properly
- ✅ Availability shows as text (not object)

### Quote System (After Migration) 🆕
- ✅ Vendor can send quote via new endpoint
- ✅ Quote price stored in `quoted_price` field
- ✅ Itemization stored in `quote_itemization` JSONB
- ✅ Couple sees quote in bookings list
- ✅ Enhanced bookings endpoint returns quote data

### Backend Health ✅
```bash
# Check backend is running
curl https://weddingbazaar-web.onrender.com/api/health

# Expected: { "status": "ok", ... }
```

## 🐛 If Something's Wrong

### Services still crashing?
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear cache and reload

### Quote endpoint returns 404?
- Check Render deployment completed
- Verify backend is running: `/api/health`
- Check Render logs for errors

### Database migration fails?
- Check if columns already exist (that's OK)
- Verify you're running in correct database
- Check Neon connection

## 📊 Current URLs

- **Frontend**: https://weddingbazaarph.web.app
- **Backend**: https://weddingbazaar-web.onrender.com
- **Backend Health**: https://weddingbazaar-web.onrender.com/api/health
- **Render Dashboard**: https://dashboard.render.com
- **Neon Dashboard**: https://console.neon.tech

## ✅ Success Checklist

- [ ] Services page loads without errors
- [ ] Database migration completed successfully
- [ ] Render backend deployment succeeded
- [ ] New `/send-quote` endpoint accessible
- [ ] Quote data stored in database
- [ ] Enhanced bookings returns quote fields

## 🎯 Next Steps After Testing

1. **If quote system works**: Update frontend to use new endpoint in VendorBookings
2. **If date tracking needed**: Implement date blocking on booking confirmation
3. **If itemization needed**: Add itemization builder UI for vendors

---

**Deployment Time**: ${new Date().toISOString()}
**Frontend**: ✅ Deployed
**Backend**: 🔄 Deploying (check Render)
**Database**: ⏳ Awaiting migration
