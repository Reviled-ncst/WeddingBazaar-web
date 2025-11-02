# ✅ DISPUTE SYSTEM - IMPLEMENTATION CHECKLIST

**Created**: November 3, 2025  
**Status**: 📋 READY FOR IMPLEMENTATION  
**Priority**: HIGH (Trust & Safety Feature)

---

## 📦 DELIVERABLES CREATED

- ✅ `DISPUTE_SYSTEM_DESIGN.md` - Full system design document
- ✅ `create-dispute-system-tables.sql` - Database migration script
- ✅ `DISPUTE_SYSTEM_UI_MOCKUP.md` - UI/UX design and flow

---

## 🎯 FEATURES TO IMPLEMENT

### **Core Features:**
1. ✅ Report Issue Button (Couple & Vendor)
2. ✅ Dispute Filing Modal (with evidence upload)
3. ✅ Dispute Status Tracking
4. ✅ Admin Resolution Interface
5. ✅ Reputation Score System
6. ✅ Email Notifications

### **Database:**
- `booking_disputes` - Main dispute records
- `dispute_responses` - Thread/chat between parties
- `user_reputation_scores` - Track user reliability

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Database Setup** (30 mins)
```bash
# Run this in Neon SQL Console:
# Copy contents of create-dispute-system-tables.sql
```

**Tables Created:**
- ✅ `booking_disputes`
- ✅ `dispute_responses`
- ✅ `user_reputation_scores`
- ✅ View: `dispute_summary`
- ✅ Function: `generate_case_number()`
- ✅ Function: `update_reputation_score()`

---

### **Phase 2: Backend API** (4-6 hours)

**New File**: `backend-deploy/routes/disputes.cjs`

**Endpoints to Create:**
```
POST   /api/bookings/:bookingId/dispute        # File dispute
GET    /api/disputes/:disputeId                # Get dispute details
POST   /api/disputes/:disputeId/respond        # Add response
GET    /api/disputes/user/:userId              # User's disputes
GET    /api/disputes/booking/:bookingId        # Check if dispute exists

# Admin only
GET    /api/admin/disputes                     # List all disputes
POST   /api/admin/disputes/:disputeId/resolve  # Resolve dispute
PATCH  /api/admin/disputes/:disputeId/status   # Update status
```

---

### **Phase 3: Frontend Components** (6-8 hours)

**New Components:**

1. **`ReportDisputeModal.tsx`**
   - Location: `src/shared/components/modals/`
   - Features: Issue type selector, description, evidence upload
   - Props: `booking`, `reporterRole`, `onSubmit`

2. **`DisputeStatusCard.tsx`**
   - Location: `src/shared/components/disputes/`
   - Features: Case number, status badge, timeline
   - Props: `dispute`, `onViewDetails`

3. **`DisputeDetailsModal.tsx`**
   - Location: `src/shared/components/modals/`
   - Features: Full dispute view, responses, evidence gallery
   - Props: `dispute`, `onAddResponse`, `onClose`

4. **`DisputeResponseForm.tsx`**
   - Location: `src/shared/components/disputes/`
   - Features: Text input, evidence upload
   - Props: `disputeId`, `onSubmit`

**Modified Components:**

1. **`IndividualBookings.tsx`**
   ```tsx
   // Add Report Issue button
   {booking.daysUntilEvent < 0 && (
     <button onClick={() => handleReportIssue(booking)}>
       ⚠️ Report Issue / No-Show
     </button>
   )}
   ```

2. **`VendorBookingsSecure.tsx`**
   ```tsx
   // Add dispute badge
   {booking.hasDispute && (
     <div className="bg-red-100 text-red-700">
       🚨 Dispute Filed - Case #{booking.disputeCaseNumber}
     </div>
   )}
   ```

---

### **Phase 4: Admin Panel** (4-6 hours)

**New Page**: `src/pages/users/admin/disputes/AdminDisputes.tsx`

**Features:**
- List all disputes (filterable by status)
- Search by case number, client, vendor
- Quick actions (resolve, reject, escalate)
- Dispute details view
- Resolution interface

---

### **Phase 5: API Service Layer** (2 hours)

**New File**: `src/services/api/disputeApiService.ts`

```typescript
export const disputeApiService = {
  fileDispute: async (bookingId, disputeData) => {...},
  getDispute: async (disputeId) => {...},
  getUserDisputes: async (userId) => {...},
  addResponse: async (disputeId, responseData) => {...},
  
  // Admin only
  getAllDisputes: async (filters) => {...},
  resolveDispute: async (disputeId, resolution) => {...}
};
```

---

### **Phase 6: Notifications** (3-4 hours)

**Email Templates:**
1. `dispute-filed-couple.html`
2. `dispute-notification-vendor.html`
3. `dispute-update.html`
4. `dispute-resolved.html`

**Implementation:**
- Create email service helper
- Send notifications on key events
- In-app notification badges

---

### **Phase 7: Testing** (2-3 hours)

**Test Scenarios:**
1. ✅ Couple files dispute for no-show
2. ✅ Vendor responds with counter-evidence
3. ✅ Admin reviews and resolves
4. ✅ Refund is processed
5. ✅ Reputation scores updated
6. ✅ Email notifications sent

---

## 📊 ESTIMATED TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Database Setup | 30 mins | 🚧 Ready |
| 2 | Backend API | 4-6 hrs | ⏳ Pending |
| 3 | Frontend Components | 6-8 hrs | ⏳ Pending |
| 4 | Admin Panel | 4-6 hrs | ⏳ Pending |
| 5 | API Service | 2 hrs | ⏳ Pending |
| 6 | Notifications | 3-4 hrs | ⏳ Pending |
| 7 | Testing | 2-3 hrs | ⏳ Pending |
| **TOTAL** | **Full Implementation** | **22-30 hrs** | **3-4 days** |

---

## 🎯 QUICK START (Minimal MVP - 6-8 hours)

For a **working prototype today**, implement:

1. ✅ Database tables (30 mins)
2. ✅ File dispute endpoint (1 hour)
3. ✅ Get dispute endpoint (30 mins)
4. ✅ Report Issue button + modal (2-3 hours)
5. ✅ Dispute status card (1 hour)
6. ✅ Basic admin list (1 hour)

**MVP Features:**
- Couple can report no-show
- Dispute is saved to database
- Admin can see disputes
- Status updates work

---

## 🚦 NEXT STEPS

**Option 1: Full Implementation**
- Start with Phase 1 (Database)
- Complete all phases in 3-4 days
- Production-ready system

**Option 2: MVP First**
- Deploy minimal working version
- Test with real users
- Add advanced features iteratively

**Option 3: Vendor Type Fix First**
- Wait for Render deployment
- Test vendor type persistence
- Then implement dispute system

---

## 💡 RECOMMENDATION

I recommend **Option 3**:
1. First, verify the vendor type fix is working (deployment pending)
2. Then implement dispute system MVP (1 day)
3. Polish and add advanced features (2-3 days)

**What would you like to do?** 🤔
