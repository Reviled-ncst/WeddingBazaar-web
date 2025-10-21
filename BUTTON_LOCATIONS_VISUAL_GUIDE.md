# 📍 RECEIPT & CANCELLATION BUTTONS - VISUAL GUIDE

## Where Are The Buttons?

### 🎯 Location: Individual Bookings Page
**URL:** https://weddingbazaar-web.web.app/individual/bookings

### 📱 In The UI

```
┌────────────────────────────────────────────────────────────────┐
│  MY BOOKINGS                                          [Filter▼]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📸 Photography - Perfect Weddings Co.                   │  │
│  │  ⭐⭐⭐⭐⭐ 4.5                                             │  │
│  │  📅 Dec 25, 2024  📍 Manila Hotel                        │  │
│  │  💰 ₱100,000  |  Status: Deposit Paid ✓                  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  🎨 Action Buttons Section                          │ │  │
│  │  │                                                      │ │  │
│  │  │  [💵 Pay Balance]         ← If balance remaining   │ │  │
│  │  │                                                      │ │  │
│  │  │  [📄 View Receipt]         ← NEW! Purple gradient  │ │  │ ⭐
│  │  │  Shows receipt with:                                │ │  │
│  │  │  - Receipt number                                   │ │  │
│  │  │  - Payment details                                  │ │  │
│  │  │  - Vendor info                                      │ │  │
│  │  │  - Amount breakdown                                 │ │  │
│  │  │                                                      │ │  │
│  │  │  [❌ Request Cancellation] ← NEW! Red border       │ │  │ ⭐
│  │  │  Changes based on status:                           │ │  │
│  │  │  - "Cancel Booking" (request status)               │ │  │
│  │  │  - "Request Cancellation" (other statuses)         │ │  │
│  │  │                                                      │ │  │
│  │  │  [📞 Contact Vendor]       ← Existing button       │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔘 Button Details

### 1. View Receipt Button 📄
```
┌───────────────────────────────────┐
│  📄 View Receipt                  │  ← Purple gradient background
└───────────────────────────────────┘  ← White text
```

**When Visible:**
- ✅ Deposit Paid (`deposit_paid`)
- ✅ Downpayment Paid (`downpayment_paid`)
- ✅ Fully Paid (`fully_paid`, `paid_in_full`)
- ✅ Completed (`completed`)

**When Hidden:**
- ❌ Request/Pending statuses
- ❌ Cancelled
- ❌ No payment made yet

**What It Does:**
- Fetches receipts from: `GET /api/payment/receipts/:bookingId`
- Shows receipt details in modal
- Displays payment history
- Allows print/download

---

### 2. Cancel Button ❌
```
┌───────────────────────────────────┐
│  ❌ Cancel Booking                │  ← For request status
└───────────────────────────────────┘  ← Red border, red text

OR

┌───────────────────────────────────┐
│  ❌ Request Cancellation          │  ← For other statuses
└───────────────────────────────────┘  ← Red border, red text
```

**When Visible:**
- ✅ All statuses EXCEPT:
  - ❌ Cancelled
  - ❌ Completed

**Button Text Changes:**
| Booking Status | Button Text | Action |
|---|---|---|
| `request` | "Cancel Booking" | Direct cancel (no approval) |
| `quote_requested` | "Cancel Booking" | Direct cancel (no approval) |
| `quote_sent` | "Request Cancellation" | Requires approval |
| `confirmed` | "Request Cancellation" | Requires approval |
| `deposit_paid` | "Request Cancellation" | Requires approval |
| `paid_in_full` | "Request Cancellation" | Requires approval |

**What It Does:**
- **Direct Cancel** (request status):
  - Calls: `POST /api/bookings/:bookingId/cancel`
  - Immediately cancels booking
  - No approval needed
  
- **Request Cancel** (other status):
  - Calls: `POST /api/bookings/:bookingId/request-cancellation`
  - Sets status to `pending_cancellation`
  - Requires vendor/admin approval

---

## 📂 File Locations

### Backend Code (DEPLOYED)
```
backend-deploy/
├── routes/
│   ├── payments.cjs
│   │   └── GET /api/payment/receipts/:bookingId  ← Receipt endpoint
│   │
│   └── bookings.cjs
│       ├── POST /api/bookings/:id/cancel          ← Direct cancel
│       └── POST /api/bookings/:id/request-cancellation ← Request cancel
```

### Frontend Code
```
src/
├── shared/
│   └── services/
│       └── bookingActionsService.ts              ← Service functions
│
└── pages/
    └── users/
        └── individual/
            └── bookings/
                └── IndividualBookings.tsx        ← UI implementation
                    Line 1044-1056: View Receipt button
                    Line 1058-1083: Cancel button
```

---

## 🔄 Cancellation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  User Clicks Cancel Button                                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ├── Is status 'request' or 'quote_requested'?
                  │
       ┌──────────┴──────────┐
       │                     │
      YES                   NO
       │                     │
       ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ Direct Cancel    │   │ Request Cancel   │
│ No Approval      │   │ Needs Approval   │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│ Status:          │   │ Status:          │
│ cancelled        │   │ pending_cancel   │
└──────────────────┘   └────────┬─────────┘
                                │
                                ▼
                       ┌────────────────────┐
                       │ Vendor/Admin       │
                       │ Reviews Request    │
                       └────────┬───────────┘
                                │
                     ┌──────────┴──────────┐
                     │                     │
                  Approve                Reject
                     │                     │
                     ▼                     ▼
          ┌────────────────┐    ┌────────────────┐
          │ Status:        │    │ Status:        │
          │ cancelled      │    │ (unchanged)    │
          └────────────────┘    └────────────────┘
```

---

## 🧪 Testing Checklist

### Receipt Button
- [ ] Button visible on paid bookings
- [ ] Button hidden on unpaid bookings
- [ ] Clicking shows loading state
- [ ] Receipt displays correctly
- [ ] All payment details shown
- [ ] Can print/copy receipt

### Cancel Button (Request Status)
- [ ] Shows "Cancel Booking" text
- [ ] Confirmation dialog appears
- [ ] Booking status changes to cancelled
- [ ] UI updates immediately
- [ ] Database reflects change

### Cancel Button (Other Status)
- [ ] Shows "Request Cancellation" text
- [ ] Confirmation dialog appears
- [ ] Booking status changes to pending_cancellation
- [ ] Message about approval shown
- [ ] UI updates immediately
- [ ] Database reflects change

---

## 🚀 Quick Test Commands

### Test Receipt Endpoint
```bash
curl https://weddingbazaar-web.onrender.com/api/payment/receipts/BOOKING-ID
```

### Test Cancel Endpoint
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/BOOKING-ID/cancel \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER-ID","reason":"Test cancellation"}'
```

### Test Request Cancel Endpoint
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/BOOKING-ID/request-cancellation \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER-ID","reason":"Test cancellation request"}'
```

---

## 📖 Documentation References

- **Full Documentation:** `.github/copilot-instructions.md`
- **Implementation Summary:** `RECEIPT_AND_CANCELLATION_COMPLETE.md`
- **Database Schema:** Lines 404-570 in copilot-instructions.md
- **API Endpoints:** Lines 572-676 in copilot-instructions.md
- **Deployment Guide:** Lines 737-856 in copilot-instructions.md

---

**Last Updated:** October 21, 2025  
**Status:** Backend deployed ✅ | Frontend UI ready ✅ | Handlers pending ⏳
