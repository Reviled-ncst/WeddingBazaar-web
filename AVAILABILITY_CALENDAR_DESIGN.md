# 📅 Availability System - Design Document

**Feature:** Calendar-Based Vendor Availability  
**Purpose:** Allow vendors to manage their availability dates visually  
**Date:** October 20, 2024

---

## 🎯 Current vs. Proposed System

### ❌ Current Implementation
**What We Have:**
- Simple checkboxes for weekdays/weekends/holidays preferences
- No visual calendar
- No specific date management
- Stored as JSON: `{weekdays: true, weekends: true, holidays: false}`

**Problems:**
- Vendors can't see specific available dates
- No way to block specific dates (e.g., "I'm on vacation Dec 20-30")
- No visual calendar interface
- Doesn't integrate with `vendor_off_days` table

### ✅ Proposed Solution

**Two-Level Availability System:**

#### Level 1: General Availability Preferences (Keep Current)
- Weekdays available? (checkbox)
- Weekends available? (checkbox)
- Holidays available? (checkbox)
- **Purpose:** Quick filtering for clients

#### Level 2: Specific Date Availability (NEW - Calendar)
- Visual calendar showing current month
- Green dates = Available
- Red dates = Blocked/Off-days
- Click to toggle availability
- Navigate between months
- Integrates with `vendor_off_days` table

---

## 🗄️ Database Structure

### Existing Tables

#### 1. `services` table
```sql
availability JSONB  -- General preferences
-- Example: {"weekdays": true, "weekends": true, "holidays": false}
```

#### 2. `vendor_off_days` table (Already Exists!)
```sql
CREATE TABLE vendor_off_days (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  off_date DATE NOT NULL,
  reason TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints Already Available:**
- `GET /api/vendors/:vendorId/off-days` - Get all off-days
- `POST /api/vendors/:vendorId/off-days` - Add single off-day
- `POST /api/vendors/:vendorId/off-days/bulk` - Add multiple off-days
- `DELETE /api/vendors/:vendorId/off-days/:offDayId` - Remove off-day

---

## 🎨 UI Design

### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│  Step 4: DSS Details                                    │
├─────────────────────────────────────────────────────────┤
│  [Years in Business] [Service Tier] [Wedding Styles]   │
│  [Cultural Specialties]                                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  📅 Availability Settings                         │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  General Preferences:                             │ │
│  │  ☑ Weekdays    ☑ Weekends    ☐ Holidays          │ │
│  │                                                   │ │
│  │  Your Availability Calendar:                      │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  < December 2024 >                          │ │ │
│  │  │  ─────────────────────────────────────────  │ │ │
│  │  │  Su Mo Tu We Th Fr Sa                       │ │ │
│  │  │   1  2  3  4  5  6  7  ✓  ✓  ✓  ✗  ✗  ✗  ✓ │ │ │
│  │  │   8  9 10 11 12 13 14  ✓  ✓  ✓  ✓  ✓  ✓  ✓ │ │ │
│  │  │  15 16 17 18 19 20 21  ✓  ✓  ✓  ✗  ✗  ✗  ✗ │ │ │
│  │  │  22 23 24 25 26 27 28  ✗  ✗  ✗  ✗  ✗  ✗  ✗ │ │ │
│  │  │  29 30 31              ✗  ✗  ✗              │ │ │
│  │  │                                             │ │ │
│  │  │  ✓ = Available    ✗ = Blocked             │ │ │
│  │  │  Click dates to toggle                     │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  │                                                   │ │
│  │  Quick Actions:                                   │ │
│  │  [Block Date Range]  [Add Vacation Period]       │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### Phase 1: Basic Calendar View (Recommended First)
**Time Estimate:** 30 minutes

**Features:**
- Display current month calendar
- Show vendor's off-days from database
- Navigate between months
- Visual indicators (green = available, red = blocked)

**Components to Create:**
- `AvailabilityCalendar.tsx` - Main calendar component
- Uses existing `vendor_off_days` API endpoints

### Phase 2: Interactive Date Selection (Enhanced)
**Time Estimate:** 1 hour

**Features:**
- Click dates to toggle availability
- Add off-days directly from calendar
- Remove off-days
- Date range selection (block multiple days at once)
- Reason/notes for blocked dates

### Phase 3: Advanced Features (Optional)
**Time Estimate:** 2 hours

**Features:**
- Recurring off-days (e.g., "Every Sunday")
- Vacation periods with one click
- Sync with external calendars (Google Calendar, etc.)
- Bulk import/export
- Availability templates (e.g., "Summer Schedule", "Holiday Schedule")

---

## 📋 User Stories

### Vendor: Add Service
1. Vendor fills basic service info (Steps 1-3)
2. **Step 4: DSS Details**
   - Sets general preferences (weekdays/weekends)
   - Views calendar showing current availability
   - Clicks dates to mark as unavailable
   - Adds vacation period (Dec 20-30)
   - Calendar updates in real-time
3. Submits form
4. Off-days saved to `vendor_off_days` table
5. General preferences saved to `services.availability`

### Client: Book Service
1. Client views service details
2. Sees "Check Availability" button
3. Calendar pops up showing:
   - Green dates = Vendor available
   - Red dates = Vendor booked/off
   - Gray dates = Past dates
4. Client selects available date
5. Proceeds to booking

---

## 🎨 Visual Design Specs

### Colors
- **Available:** `bg-green-50 border-green-300 text-green-700`
- **Blocked:** `bg-red-50 border-red-300 text-red-700`
- **Today:** `ring-2 ring-blue-500`
- **Selected:** `bg-blue-100 border-blue-400`
- **Past:** `bg-gray-100 text-gray-400`

### Icons
- ✅ Available
- ❌ Blocked/Off
- 📅 Calendar
- 🏖️ Vacation
- 🎄 Holiday

---

## 🔄 Data Flow

### Loading Availability
```
1. Component mounts
2. Fetch vendor's off-days: GET /api/vendors/:vendorId/off-days
3. Store off-days in state
4. Render calendar with off-days marked
5. Apply general preferences (weekdays/weekends)
```

### Blocking a Date
```
1. User clicks date
2. POST /api/vendors/:vendorId/off-days
   Body: { off_date: '2024-12-25', reason: 'Christmas' }
3. Backend saves to vendor_off_days table
4. Response includes new off-day ID
5. Update local state
6. Re-render calendar
```

### Unblocking a Date
```
1. User clicks blocked date
2. DELETE /api/vendors/:vendorId/off-days/:offDayId
3. Backend removes from table
4. Update local state
5. Re-render calendar
```

---

## 🧪 Testing Checklist

- [ ] Calendar displays current month correctly
- [ ] Navigation between months works
- [ ] Off-days load from database
- [ ] Clicking available date blocks it
- [ ] Clicking blocked date unblocks it
- [ ] Date range selection works
- [ ] Vacation period addition works
- [ ] Data persists to database
- [ ] Calendar updates in real-time
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation)

---

## 📚 Dependencies

**NPM Packages (Optional):**
- `react-calendar` - Full-featured calendar component
- `date-fns` - Date manipulation utilities
- `react-day-picker` - Lightweight date picker

**OR Build Custom:**
- Use native Date objects
- Simple month grid layout
- No external dependencies

---

## 🎯 Recommendation

**For Add Service Form:**

**Option A: Full Calendar Integration** (Recommended)
- Show calendar in Step 4
- Let vendors manage availability visually
- Direct integration with `vendor_off_days` table
- Best UX, most intuitive

**Option B: Separate Availability Management Page**
- Keep current simple checkboxes in Add Service Form
- Create dedicated "Manage Availability" page in vendor dashboard
- Full calendar view there
- Good separation of concerns

**Option C: Hybrid Approach** (Best of Both)
- Simple preferences in Add Service Form (current)
- Link to "Manage Full Calendar" that opens modal
- Modal shows full calendar with off-days
- Quick for new services, powerful for detailed management

---

## 🚀 Quick Implementation (Option C - Recommended)

**Step 1:** Keep current checkboxes (5 minutes)
- No changes needed to existing form

**Step 2:** Add "Manage Calendar" button (10 minutes)
```tsx
<button onClick={() => setShowCalendarModal(true)}>
  📅 Manage Full Availability Calendar
</button>
```

**Step 3:** Create Calendar Modal (30 minutes)
- Fetch off-days from API
- Display month view
- Allow date selection
- Save to `vendor_off_days`

**Step 4:** Test and Deploy (15 minutes)

**Total Time:** ~1 hour

---

**What do you prefer?**
1. Full calendar in Add Service Form?
2. Separate availability management page?
3. Hybrid (current + modal)?

Let me know and I'll implement it! 🚀
