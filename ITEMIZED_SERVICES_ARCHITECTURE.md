# Itemized Booking Services - Architecture & Implementation

## Overview
Wedding Bazaar bookings support **itemized service breakdowns**, allowing vendors to send detailed quotes with multiple line items instead of just a single total price.

## Example: Photography Package Quote
```
Wedding Photography Quote
├─ Wedding Day Photography (8 hours) ... ₱35,000
├─ Engagement Shoot ..................... ₱15,000
├─ Photo Album (50 pages) ............... ₱10,000
├─ USB with edited photos ............... ₱2,000
├─ Drone Photography .................... ₱8,000
└─ TOTAL: .............................. ₱70,000
```

---

## Data Architecture

### Storage Strategy
Itemized services are stored in **two places** for flexibility:

1. **`vendor_notes` field** (TEXT/JSONB in database)
   - Stores complete quote data as JSON string
   - Includes: `serviceItems`, `pricing`, `terms`, `validUntil`, etc.
   - Primary source of truth
   
2. **`service_items` field** (parsed array in TypeScript)
   - Automatically parsed from `vendor_notes` for easier access
   - Available in `Booking` interface for type safety
   - No database column needed (computed field)

### vendor_notes JSON Structure
```typescript
{
  quoteNumber: "Q-1234567890",
  serviceItems: [
    {
      id: 1,
      name: "Wedding Day Photography (8 hours)",
      description: "Complete wedding coverage from preparation to reception",
      category: "Photography Services",
      quantity: 1,
      unitPrice: 35000,
      total: 35000
    },
    {
      id: 2,
      name: "Engagement Shoot",
      description: "Pre-wedding engagement photo session",
      category: "Photography Services",
      quantity: 1,
      unitPrice: 15000,
      total: 15000
    }
    // ... more items
  ],
  pricing: {
    subtotal: 70000,
    tax: 0,
    total: 70000,
    downpayment: 21000,  // 30%
    balance: 49000       // 70%
  },
  paymentTerms: {
    downpayment: 30,
    balance: 70
  },
  validUntil: "2025-02-15",
  terms: "30% deposit required...",
  message: "Custom message from vendor",
  timestamp: "2025-01-31T10:30:00Z"
}
```

---

## TypeScript Interfaces

### comprehensive-booking.types.ts
```typescript
export interface Booking {
  // ...other fields
  
  // Itemized services (parsed from vendor_notes)
  service_items?: Array<{
    id: string | number;
    name: string;
    description?: string;
    category?: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  
  vendor_notes?: string; // Raw JSON string
  
  // ...other fields
}
```

### booking.types.ts (Individual Bookings)
```typescript
export interface Booking {
  // ...other fields
  
  // Itemized services
  serviceItems?: Array<{
    id: string | number;
    name: string;
    description?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  vendorNotes?: string | null;
  
  // ...other fields
}
```

---

## Data Flow

### 1. Vendor Sends Quote (SendQuoteModal.tsx)
```typescript
const quoteData = {
  quoteNumber: `Q-${Date.now()}`,
  serviceItems: [
    {
      id: '1',
      name: 'Wedding Photography',
      description: '8 hours coverage',
      quantity: 1,
      unitPrice: 35000,
      total: 35000
    }
    // ... more items
  ],
  pricing: {
    subtotal: 70000,
    total: 70000,
    downpayment: 21000,
    balance: 49000
  }
};

// Send to backend
await fetch('/api/bookings/:id/status', {
  method: 'PATCH',
  body: JSON.stringify({
    status: 'quote_sent',
    vendor_notes: JSON.stringify(quoteData)
  })
});
```

### 2. Backend Stores Quote
```sql
UPDATE bookings 
SET 
  status = 'quote_sent',
  vendor_notes = '{"quoteNumber":"Q-...","serviceItems":[...]}'
WHERE id = ?;
```

### 3. Backend Returns Booking
```sql
SELECT 
  *,
  vendor_notes  -- ⭐ Include in SELECT
FROM bookings
WHERE couple_id = ?;
```

### 4. Frontend Mapper Parses serviceItems (booking-data-mapping.ts)
```typescript
export function mapDatabaseBookingToUI(dbBooking: DatabaseBooking): UIBooking {
  return {
    // ...other fields
    
    vendorNotes: dbBooking.vendor_notes,
    
    // ⭐ Automatically parse serviceItems from vendor_notes
    serviceItems: (() => {
      if (dbBooking.vendor_notes) {
        try {
          const parsed = JSON.parse(dbBooking.vendor_notes);
          if (parsed.serviceItems && Array.isArray(parsed.serviceItems)) {
            return parsed.serviceItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description,
              category: item.category,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }));
          }
        } catch (error) {
          console.error('Failed to parse serviceItems');
        }
      }
      return undefined;
    })()
  };
}
```

### 5. Client Displays Items (QuoteDetailsModal.tsx)
```typescript
// Option 1: Use pre-parsed serviceItems (preferred)
{booking.serviceItems?.map(item => (
  <tr key={item.id}>
    <td>{item.name}</td>
    <td>{item.quantity}</td>
    <td>₱{item.unitPrice.toLocaleString()}</td>
    <td>₱{item.total.toLocaleString()}</td>
  </tr>
))}

// Option 2: Parse vendorNotes directly (fallback)
{(() => {
  const parsed = JSON.parse(booking.vendorNotes);
  return parsed.serviceItems.map(item => ...)
})()}
```

---

## Component Usage

### QuoteDetailsModal.tsx
Displays itemized quote to clients:

```tsx
<div className="service-breakdown">
  <h3>Service Breakdown</h3>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      {booking.serviceItems?.map(item => (
        <tr key={item.id}>
          <td>
            <div className="font-bold">{item.name}</div>
            <div className="text-sm text-gray-600">{item.description}</div>
          </td>
          <td>{item.quantity}</td>
          <td>₱{item.unitPrice.toLocaleString()}</td>
          <td className="font-bold">₱{item.total.toLocaleString()}</td>
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan={3}>Subtotal:</td>
        <td>₱{subtotal.toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>
</div>
```

### SendQuoteModal.tsx
Allows vendors to create itemized quotes:

```tsx
// Vendor can add/remove/edit service items
const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
  {
    id: '1',
    name: 'Wedding Photography',
    description: '8 hours coverage',
    quantity: 1,
    unitPrice: 35000,
    total: 35000,
    category: 'Photography Services'
  }
]);

// Add item button
<button onClick={() => addQuoteItem()}>
  + Add Service Item
</button>

// Each item has editable fields
{quoteItems.map((item, index) => (
  <div key={item.id}>
    <input 
      value={item.name}
      onChange={(e) => updateItem(index, 'name', e.target.value)}
    />
    <input 
      type="number"
      value={item.quantity}
      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
    />
    <input 
      type="number"
      value={item.unitPrice}
      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
    />
    <div>Total: ₱{item.total.toLocaleString()}</div>
  </div>
))}
```

---

## Benefits

### For Clients
- ✅ **Transparency**: See exactly what they're paying for
- ✅ **Comparison**: Easier to compare quotes from different vendors
- ✅ **Flexibility**: Can discuss/negotiate individual items
- ✅ **Trust**: Detailed breakdown builds confidence

### For Vendors
- ✅ **Professional**: Detailed quotes look more professional
- ✅ **Customization**: Can tailor packages to client needs
- ✅ **Upselling**: Easier to present optional add-ons
- ✅ **Clarity**: Reduces misunderstandings about what's included

### For Platform
- ✅ **Competitive**: Professional quote system
- ✅ **Scalable**: Works for all service types
- ✅ **Data-rich**: Can analyze popular services, pricing trends
- ✅ **User Experience**: Better than single-line quotes

---

## Default Templates by Service Category

### Photography & Videography
```typescript
[
  { name: 'Wedding Day Photography (8 hours)', unitPrice: 35000 },
  { name: 'Wedding Videography', unitPrice: 25000 },
  { name: 'Engagement Shoot', unitPrice: 15000 },
  { name: 'Photo Album (50 pages)', unitPrice: 10000 },
  { name: 'USB with Edited Photos', unitPrice: 2000 }
]
```

### Catering
```typescript
[
  { name: 'Wedding Catering (per guest)', unitPrice: 800, quantity: 100 },
  { name: 'Cocktail Hour Appetizers', unitPrice: 2500 },
  { name: 'Wedding Cake', unitPrice: 5000 },
  { name: 'Champagne Service', unitPrice: 1500 }
]
```

### DJ & Music
```typescript
[
  { name: 'DJ Services (6 hours)', unitPrice: 15000 },
  { name: 'Sound System Rental', unitPrice: 5000 },
  { name: 'LED Lighting Package', unitPrice: 8000 },
  { name: 'Wireless Microphones (2)', unitPrice: 2000 }
]
```

See `SendQuoteModal.tsx` lines 83-1100 for complete template definitions.

---

## Testing

### Test Case 1: Create Itemized Quote
1. Log in as vendor
2. Open booking in "Quote Requested" status
3. Click "Send Quote"
4. Add 3+ service items with different prices
5. Submit quote
6. Verify `vendor_notes` is stored in database

### Test Case 2: View Itemized Quote
1. Log in as couple
2. Navigate to Individual Bookings
3. Find booking with "Quote Received" status
4. Click "View Quote"
5. Verify all service items display in table
6. Verify subtotal matches sum of items

### Test Case 3: Empty State
1. View booking with no `vendor_notes`
2. Verify empty state message appears
3. No errors in console

### Test Case 4: Malformed Data
1. Database has invalid JSON in `vendor_notes`
2. View quote
3. Verify graceful fallback to mock data
4. Warning logged in console

---

## Backend Requirements

### Database
```sql
-- vendor_notes column (already exists in most deployments)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS vendor_notes TEXT;

-- Or use JSONB for better querying:
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS vendor_notes JSONB;

-- Example query to extract specific items:
SELECT 
  id,
  vendor_notes->>'quoteNumber' as quote_number,
  jsonb_array_length(vendor_notes->'serviceItems') as item_count
FROM bookings
WHERE vendor_notes IS NOT NULL;
```

### API Endpoints
```javascript
// PATCH /api/bookings/:id/status
// Must accept and store vendor_notes
app.patch('/api/bookings/:id/status', async (req, res) => {
  const { status, vendor_notes } = req.body;
  await db.query(
    'UPDATE bookings SET status = $1, vendor_notes = $2 WHERE id = $3',
    [status, vendor_notes, id]
  );
});

// GET /api/bookings/couple/:userId
// Must return vendor_notes
app.get('/api/bookings/couple/:userId', async (req, res) => {
  const result = await db.query(
    'SELECT *, vendor_notes FROM bookings WHERE couple_id = $1',
    [userId]
  );
  res.json({ bookings: result.rows });
});
```

---

## Future Enhancements

### Phase 1: Rich Item Details
- [ ] Add images to service items
- [ ] Add duration/time slots per item
- [ ] Add location/venue requirements per item

### Phase 2: Dynamic Pricing
- [ ] Per-guest pricing (e.g., catering)
- [ ] Seasonal pricing adjustments
- [ ] Bulk discounts for packages

### Phase 3: Client Customization
- [ ] Allow clients to select/deselect optional items
- [ ] Request modifications to specific items
- [ ] Compare multiple vendor quotes side-by-side

### Phase 4: Analytics
- [ ] Track popular service combinations
- [ ] Analyze pricing trends per category
- [ ] Identify upsell opportunities

---

## Related Files

### Core Types
- `src/shared/types/comprehensive-booking.types.ts` - Main Booking interface with service_items
- `src/pages/users/individual/bookings/types/booking.types.ts` - Client-side Booking interface

### Data Mapping
- `src/shared/utils/booking-data-mapping.ts` - Parses vendor_notes → serviceItems array

### UI Components
- `src/pages/users/vendor/bookings/components/SendQuoteModal.tsx` - Create itemized quotes
- `src/pages/users/individual/bookings/components/QuoteDetailsModal.tsx` - View itemized quotes

### Documentation
- [QUOTE_ITEMIZATION_FIX_COMPLETE.md](./QUOTE_ITEMIZATION_FIX_COMPLETE.md)
- [VENDOR_NOTES_BACKEND_VERIFICATION.md](./VENDOR_NOTES_BACKEND_VERIFICATION.md)
- [QUOTE_ITEMIZATION_COMPLETE_INVESTIGATION.md](./QUOTE_ITEMIZATION_COMPLETE_INVESTIGATION.md)

---

**Last Updated:** 2025-01-31  
**Status:** ✅ Fully Implemented in Frontend | ⏳ Backend Verification Pending  
**Production URL:** https://weddingbazaarph.web.app
