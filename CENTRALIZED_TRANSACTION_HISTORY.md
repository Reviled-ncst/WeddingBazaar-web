# 🎯 Centralized Transaction History - Dynamic for Couples & Vendors

## Overview
**ONE page** that dynamically changes based on user role:
- **Couples** → See payment receipts (money they spent)
- **Vendors** → See earnings/wallet transactions (money they earned)

---

## Key Changes Made

### 1. Dynamic User Detection
```typescript
const isVendor = user?.role === 'vendor';
const userType = isVendor ? 'vendor' : 'couple';
```

### 2. Dynamic API Endpoints
```typescript
if (isVendor) {
  // Vendor: Get wallet transactions
  endpoint = `/api/vendor/wallet/transactions?vendorId=${user.vendorId}`;
} else {
  // Couple: Get payment receipts
  endpoint = `/api/payment/receipts/user/${user.id}`;
}
```

### 3. Dynamic Page Title & Description
- **Vendor**: "Earnings History" - "View all your earnings and wallet transactions"
- **Couple**: "Transaction History" - "View all your payment receipts and transaction details"

### 4. Dynamic Statistics Labels
| Stat Card | Couple Label | Vendor Label |
|-----------|--------------|--------------|
| Card 1 | "Total Spent" | "Total Earned" |
| Card 2 | "Total Payments" | "Total Transactions" |
| Card 3 | "Bookings" | "Bookings" |
| Card 4 | "Vendors" | "Customers" |

### 5. Dynamic Empty State
- **Vendor**: "You haven't received any payments yet"
- **Couple**: "You haven't made any payments yet"

---

## How It Works

### For Couples (Individual Users)
1. User logs in with role="couple" or role="individual"
2. Page shows **Transaction History** title
3. Fetches from: `GET /api/payment/receipts/user/:userId`
4. Displays their **payment receipts** (bookings they paid for)
5. Shows **Total Spent**, **vendors** they hired

### For Vendors
1. User logs in with role="vendor"
2. Page shows **Earnings History** title
3. Fetches from: `GET /api/vendor/wallet/transactions?vendorId=:vendorId`
4. Displays their **earnings** (payments they received)
5. Shows **Total Earned**, **customers** who paid them

---

## Data Transformation

### Vendor Wallet Transaction → Receipt Format
```typescript
{
  id: transaction.id,
  receiptNumber: transaction.transaction_id,
  paymentType: transaction.transaction_type, // 'earning', 'withdrawal', etc.
  amount: Math.abs(transaction.amount * 100), // Convert to centavos
  vendorName: user.businessName, // Their own business
  serviceType: transaction.service_name,
  eventDate: transaction.event_date,
  paidByName: transaction.customer_name,
  createdAt: transaction.created_at
}
```

---

## URL Routes

### Current Setup
- `/individual/transactions` → Centralized page (works for both)

### Alternative (if you want separate routes)
- `/individual/transactions` → Couple transactions
- `/vendor/wallet` → Vendor earnings (separate page exists)

**Current Implementation**: ONE centralized page at `/individual/transactions`

---

## Backend Endpoints Used

### For Couples
```
GET /api/payment/receipts/user/:userId
```
Returns:
```json
{
  "success": true,
  "receipts": [ /* payment receipts */ ],
  "statistics": {
    "totalSpent": 1500000,
    "totalSpentFormatted": "₱15,000.00",
    "totalPayments": 3,
    "uniqueBookings": 2,
    "uniqueVendors": 2
  }
}
```

### For Vendors
```
GET /api/vendor/wallet/transactions?vendorId=:vendorId
```
Returns:
```json
{
  "success": true,
  "transactions": [ /* wallet transactions */ ],
  "statistics": { /* similar format */ }
}
```

---

## Testing

### Test as Couple
1. Login with couple account
2. Go to `/individual/transactions`
3. Should see: "Transaction History" title
4. Should see: "Total Spent", "Vendors" labels
5. Should display payment receipts

### Test as Vendor
1. Login with vendor account (2-2025-001)
2. Go to `/individual/transactions`
3. Should see: "Earnings History" title
4. Should see: "Total Earned", "Customers" labels
5. Should display wallet transactions

---

## Files Modified

1. **TransactionHistory.tsx** 
   - Added `isVendor` detection
   - Dynamic endpoint selection
   - Dynamic UI labels
   - Data transformation for vendor transactions

---

## Deployment

```powershell
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

**Status**: 🚧 Building & Deploying...

---

## Benefits

✅ **One Page** - No duplicate code  
✅ **Smart Routing** - Automatically detects user type  
✅ **Consistent UI** - Same design for both user types  
✅ **Easy Maintenance** - One file to update  
✅ **Type Safe** - TypeScript ensures correctness  

---

## Next Steps

1. ✅ Build and deploy
2. 🧪 Test with vendor account
3. 🧪 Test with couple account
4. 📊 Verify data displays correctly for both
5. 🎨 Fine-tune UI based on feedback

---

**Status**: ✅ IMPLEMENTED - Ready for Testing  
**Deployment**: 🚧 In Progress  
**Date**: October 30, 2025
