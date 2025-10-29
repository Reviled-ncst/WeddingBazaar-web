# 💰 Vendor Wallet System - Visual Flow Diagram

## 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WEDDING BAZAAR WALLET SYSTEM                         │
│                    (PayMongo + Two-Sided Completion)                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: COUPLE BOOKS SERVICE                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Couple → Selects Vendor Service → Creates Booking Request                 │
│           Status: 'request'                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: VENDOR SENDS QUOTE                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Vendor → Reviews Request → Sends Quote (₱50,000)                           │
│           Status: 'quote_sent'                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: COUPLE ACCEPTS & PAYS                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Couple → Accepts Quote → Opens PayMongo Modal                             │
│        → Enters Card Details → Payment Processed                           │
│        → Receipt Created (WB-2025-000123)                                   │
│           Status: 'fully_paid'                                              │
│           Receipt: amount_paid = 5000000 (centavos)                         │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ PENDING BALANCE                                                      │  │
│  │ Booking paid but NOT yet completed                                   │  │
│  │ Vendor can see: "Pending: ₱50,000.00"                                │  │
│  │ Available balance: ₱0.00 (funds locked)                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: SERVICE DELIVERED                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Vendor → Provides Photography Service → Event Completed                   │
│           Wedding Date: 2025-03-15                                          │
│           Status: still 'fully_paid'                                        │
│           Awaiting confirmation...                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: TWO-SIDED COMPLETION (CRITICAL!)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐        ┌─────────────────────────┐            │
│  │ VENDOR CONFIRMS         │        │ COUPLE CONFIRMS         │            │
│  ├─────────────────────────┤        ├─────────────────────────┤            │
│  │ "Mark as Complete" ✓    │   AND  │ "Mark as Complete" ✓    │            │
│  │ vendor_completed = true │        │ couple_completed = true │            │
│  └─────────────────────────┘        └─────────────────────────┘            │
│                                                                             │
│                              ▼                                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ ✅ BOOKING FULLY COMPLETED                                           │  │
│  │ fully_completed = true                                                │  │
│  │ status = 'completed'                                                  │  │
│  │ completed_at = NOW()                                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: FUNDS AVAILABLE IN WALLET                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Backend Wallet API → Queries Database:                                    │
│                                                                             │
│  SELECT SUM(r.amount_paid) as available_balance                            │
│  FROM receipts r                                                            │
│  LEFT JOIN bookings b ON r.booking_id = b.id                               │
│  WHERE r.vendor_id = '2-2025-001'                                           │
│    AND b.status = 'completed'                                               │
│    AND b.fully_completed = true                                             │
│    AND b.vendor_completed = true                                            │
│    AND b.couple_completed = true                                            │
│                                                                             │
│  Result: ₱50,000.00 (5000000 centavos)                                      │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ VENDOR WALLET DASHBOARD                                              │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ Total Earnings:     ₱50,000.00  📈                                   │  │
│  │ Available Balance:  ₱50,000.00  💰 [Withdraw Funds]                  │  │
│  │ Pending Balance:    ₱0.00       ⏱                                    │  │
│  │ Withdrawn:          ₱0.00       💸                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: VENDOR REQUESTS WITHDRAWAL                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Vendor → Clicks "Withdraw Funds"                                          │
│        → Modal Opens                                                        │
│        → Enters Amount: ₱50,000.00                                          │
│        → Selects Method: GCash                                              │
│        → Enters Number: 09171234567                                         │
│        → Submits Request                                                    │
│                                                                             │
│  Backend → Validates amount ≤ available_balance                             │
│          → Creates withdrawal request                                       │
│          → Status: 'pending'                                                │
│          → Notifies admin                                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ WITHDRAWAL REQUEST CREATED                                           │  │
│  │ ID: WD-1234567890                                                     │  │
│  │ Amount: ₱50,000.00                                                    │  │
│  │ Method: GCash (09171234567)                                           │  │
│  │ Status: Pending Admin Approval                                        │  │
│  │ Processing Time: 1-3 business days                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 8: ADMIN PROCESSES WITHDRAWAL                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Admin → Reviews Request                                                   │
│        → Verifies Vendor Identity                                           │
│        → Processes PayMongo Payout OR Manual Bank Transfer                 │
│        → Updates Status: 'completed'                                        │
│        → Records Transaction Reference                                      │
│                                                                             │
│  Database → withdrawal.status = 'completed'                                 │
│           → withdrawal.processed_at = NOW()                                 │
│           → wallet.withdrawn_amount += 50,000.00                            │
│           → wallet.available_balance -= 50,000.00                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP 9: FUNDS RECEIVED                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Vendor → Receives ₱50,000.00 in GCash Account                              │
│         → Email notification sent                                           │
│         → Wallet updated                                                    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ UPDATED WALLET DASHBOARD                                             │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ Total Earnings:     ₱50,000.00  📈                                   │  │
│  │ Available Balance:  ₱0.00       💰                                    │  │
│  │ Pending Balance:    ₱0.00       ⏱                                    │  │
│  │ Withdrawn:          ₱50,000.00  💸 ✅                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  🎉 Transaction Complete!                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌────────────┐       ┌────────────┐       ┌────────────┐       ┌────────────┐
│   Couple   │       │  PayMongo  │       │  Database  │       │   Vendor   │
│  (Client)  │       │  Payment   │       │  (Neon PG) │       │ (Receives) │
└──────┬─────┘       └──────┬─────┘       └──────┬─────┘       └──────┬─────┘
       │                    │                    │                    │
       │ 1. Pay ₱50k       │                    │                    │
       ├───────────────────▶│                    │                    │
       │                    │ 2. Process Payment │                    │
       │                    ├───────────────────▶│                    │
       │                    │                    │                    │
       │                    │ 3. Create Receipt  │                    │
       │                    │    (amount_paid)   │                    │
       │                    ├───────────────────▶│                    │
       │                    │                    │                    │
       │                    │                    │ 4. Update Booking  │
       │                    │                    │    (fully_paid)    │
       │                    │                    ├───────────────────▶│
       │                    │                    │                    │
       │ 5. Confirm Service │                    │                    │
       ├───────────────────────────────────────▶│                    │
       │    Complete ✓      │                    │                    │
       │                    │                    │                    │
       │                    │                    │ 6. Vendor Confirms │
       │                    │                    │◀───────────────────┤
       │                    │                    │    Complete ✓      │
       │                    │                    │                    │
       │                    │                    │ 7. fully_completed │
       │                    │                    │    = true          │
       │                    │                    │                    │
       │                    │                    │ 8. Query Wallet    │
       │                    │                    │◀───────────────────┤
       │                    │                    │    GET /api/wallet │
       │                    │                    │                    │
       │                    │                    │ 9. Return Balance  │
       │                    │                    ├───────────────────▶│
       │                    │                    │    ₱50k available  │
       │                    │                    │                    │
       │                    │                    │ 10. Request        │
       │                    │                    │◀───────────────────┤
       │                    │                    │     Withdrawal     │
       │                    │                    │                    │
       │                    │ 11. Process Payout │                    │
       │                    │◀───────────────────┤                    │
       │                    │    (via PayMongo)  │                    │
       │                    │                    │                    │
       │                    │ 12. Transfer Funds │                    │
       │                    ├───────────────────────────────────────▶│
       │                    │                    │    GCash/Bank      │
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
```

---

## 🔄 State Transitions

```
┌──────────────┐
│   request    │  Initial booking request
└──────┬───────┘
       │ Vendor sends quote
       ▼
┌──────────────┐
│  quote_sent  │  Quote sent to couple
└──────┬───────┘
       │ Couple accepts & pays
       ▼
┌──────────────┐
│  fully_paid  │  Payment received via PayMongo
└──────┬───────┘  Receipt created (amount_paid)
       │          ⚠️ FUNDS IN PENDING BALANCE
       │ Service delivered
       ▼
┌──────────────┐
│ Awaiting     │  Waiting for dual confirmation
│ Confirmation │  vendor_completed = false
└──────┬───────┘  couple_completed = false
       │ Vendor confirms ✓
       │ Couple confirms ✓
       ▼
┌──────────────┐
│  completed   │  Both parties confirmed
└──────┬───────┘  fully_completed = true
       │          ✅ FUNDS IN AVAILABLE BALANCE
       │ Vendor requests withdrawal
       ▼
┌──────────────┐
│ Withdrawal   │  Admin processes payout
│  Requested   │  status = 'pending'
└──────┬───────┘
       │ Admin approves & transfers
       ▼
┌──────────────┐
│ Withdrawal   │  Funds transferred to vendor
│  Completed   │  ✅ FUNDS IN WITHDRAWN AMOUNT
└──────────────┘
```

---

## 💰 Balance Calculation Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                     WALLET BALANCE LOGIC                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Input: vendor_id = '2-2025-001'                                │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TOTAL EARNINGS (All-Time)                                 │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ SELECT SUM(r.amount_paid)                                 │ │
│  │ FROM receipts r                                           │ │
│  │ JOIN bookings b ON r.booking_id = b.id                    │ │
│  │ WHERE r.vendor_id = '2-2025-001'                          │ │
│  │   AND b.status = 'completed'                              │ │
│  │   AND b.fully_completed = true                            │ │
│  │                                                           │ │
│  │ Result: 50000000 centavos (₱500,000.00)                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ PENDING BALANCE (Paid but Not Completed)                  │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ SELECT SUM(r.amount_paid)                                 │ │
│  │ FROM receipts r                                           │ │
│  │ JOIN bookings b ON r.booking_id = b.id                    │ │
│  │ WHERE r.vendor_id = '2-2025-001'                          │ │
│  │   AND b.status IN ('fully_paid', 'paid_in_full')          │ │
│  │   AND b.fully_completed = false                           │ │
│  │                                                           │ │
│  │ Result: 15000000 centavos (₱150,000.00)                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ WITHDRAWN AMOUNT (Already Paid Out)                       │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ SELECT SUM(amount)                                        │ │
│  │ FROM withdrawals                                          │ │
│  │ WHERE vendor_id = '2-2025-001'                            │ │
│  │   AND status = 'completed'                                │ │
│  │                                                           │ │
│  │ Result: 0 centavos (₱0.00)                                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ AVAILABLE BALANCE (Ready for Withdrawal)                  │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Formula:                                                  │ │
│  │ Total Earnings - Withdrawn Amount                         │ │
│  │                                                           │ │
│  │ Calculation:                                              │ │
│  │ ₱500,000.00 - ₱0.00 = ₱500,000.00                         │ │
│  │                                                           │ │
│  │ Result: 50000000 centavos (₱500,000.00)                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**End of Visual Flow Diagram**
