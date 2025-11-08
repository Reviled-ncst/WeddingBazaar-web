# 📦 Package Itemization - Quick Reference Card

**Last Updated**: November 8, 2025  
**Version**: 1.0  
**Print this for your desk!**

---

## 🎯 What Is This?

A system that captures and stores detailed package information (items, add-ons, prices) when users book wedding services.

---

## 📊 Database Columns (bookings table)

| Column | Type | Example |
|--------|------|---------|
| `package_id` | VARCHAR | "premium-photo-pkg" |
| `package_name` | VARCHAR | "Premium Photography Package" |
| `package_price` | DECIMAL | 150000.00 |
| `package_items` | JSONB | `[{"name":"Full Day",...}]` |
| `selected_addons` | JSONB | `[{"id":"addon-1",...}]` |
| `addon_total` | DECIMAL | 25000.00 |
| `subtotal` | DECIMAL | 175000.00 |

---

## 🔄 Data Flow (30 Seconds)

1. **User** selects package → Modal opens
2. **Modal** sends request → Backend API
3. **Backend** processes → Stores in DB
4. **Database** saves → JSONB format
5. **Display** retrieves → Shows to user

---

## 💻 Code Snippets

### Frontend: Sending Package Data
```typescript
// BookingRequestModal.tsx (Line 283)
const bookingRequest: BookingRequest = {
  package_id: pkg.id,
  package_name: pkg.name,
  package_price: pkg.price,
  package_items: pkg.items,     // Array
  selected_addons: addons,      // Array
  addon_total: calculateTotal(),
  subtotal: price + addonTotal
};
```

### Backend: Receiving & Storing
```javascript
// bookings.cjs (Line 946)
const { packageId, packageName, packagePrice,
        packageItems, selectedAddons, 
        addonTotal, subtotal } = req.body;

// Store in database (Line 1014)
await sql`INSERT INTO bookings (...
  package_items, selected_addons, ...)
  VALUES (..., 
  ${JSON.stringify(packageItems)}, 
  ${JSON.stringify(selectedAddons)}, ...)`;
```

### Database: Querying Package Data
```sql
-- Get booking with package details
SELECT 
  booking_reference,
  package_name,
  package_price,
  jsonb_pretty(package_items),
  addon_total,
  subtotal
FROM bookings
WHERE id = 'booking-id';

-- Extract individual items
SELECT 
  item->>'name' as item_name,
  (item->>'quantity')::int as qty
FROM bookings,
jsonb_array_elements(package_items) as item
WHERE booking_reference = 'BK-20251108-001';
```

### Display: Parsing JSONB
```typescript
// Parse JSONB safely
const parsePackageItems = (booking: Booking) => {
  if (!booking.package_items) return [];
  if (Array.isArray(booking.package_items)) 
    return booking.package_items;
  
  try {
    return JSON.parse(booking.package_items as string);
  } catch {
    return [];
  }
};

// Use in component
const items = parsePackageItems(booking);
items.map(item => (
  <div>{item.name} (x{item.quantity})</div>
));
```

---

## 🧪 Quick Test

```bash
# 1. Test API endpoint
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/request \
  -H "Content-Type: application/json" \
  -d '{"packageName":"Test","packagePrice":100000,...}'

# 2. Check database
SELECT package_name, package_price FROM bookings 
ORDER BY created_at DESC LIMIT 1;

# 3. Verify JSONB
SELECT jsonb_array_length(package_items) FROM bookings 
WHERE id = 'your-booking-id';
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| JSONB returns as string | Use `JSON.parse()` helper |
| Old bookings show null | Check `if (booking.package_name)` |
| TypeScript errors | Import `BookingRequest` type |
| Array not storing | Ensure `JSON.stringify()` in backend |

---

## 📁 File Locations

**Backend**: `backend-deploy/routes/bookings.cjs` (L946, L1014)  
**Frontend**: `src/modules/services/components/BookingRequestModal.tsx` (L283)  
**Types**: `src/shared/types/comprehensive-booking.types.ts` (L325-375)  
**Migration**: `add-package-columns-to-bookings.cjs`

---

## 📚 Documentation

- **Full Guide**: `PACKAGE_ITEMIZATION_IMPLEMENTATION_COMPLETE.md`
- **Summary**: `PACKAGE_ITEMIZATION_SUMMARY.md`
- **Data Flow**: `PACKAGE_ITEMIZATION_DATA_FLOW.md`
- **Testing**: `PACKAGE_ITEMIZATION_TEST_GUIDE.md`
- **Status**: `PACKAGE_ITEMIZATION_FINAL_STATUS.md`

---

## 🚀 Deploy Command

```powershell
.\deploy-package-itemization.ps1
```

**Time**: ~5 minutes  
**Auto-deploys**: Render backend, Firebase frontend

---

## ✅ Checklist (Before Deploy)

- [ ] Database migration run
- [ ] Backend code committed
- [ ] Frontend code committed
- [ ] Types updated
- [ ] No TypeScript errors
- [ ] Documentation reviewed

---

## 🎯 Success Indicators

✅ Console logs show: `📤 [BookingModal] Sending booking request with itemization`  
✅ Database query returns JSONB arrays  
✅ Render logs show: `packageName`, `packageItemsCount`  
✅ No 500 errors in production  

---

## 📞 Help

**Render Logs**: https://dashboard.render.com/web/srv-xxx/logs  
**Database**: Neon Console → SQL Editor  
**Frontend**: Browser DevTools (F12) → Console

---

**PRINT THIS AND KEEP IT HANDY!**
