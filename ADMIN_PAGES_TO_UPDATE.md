# Admin Pages Needing Layout Update

## Pages Using Old AdminHeader (Need to Update to AdminLayout)

### 1. **Admin Bookings** ✅ IN PROGRESS
- **File**: `src/pages/users/admin/bookings/AdminBookings.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "Booking Management"
- **Subtitle**: "Monitor and manage all platform bookings"

### 2. **Admin Analytics** 🔄 PENDING
- **File**: `src/pages/users/admin/analytics/AdminAnalytics.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "Analytics & Reports"
- **Subtitle**: "Comprehensive platform analytics and business insights"

### 3. **Admin Finances** 🔄 PENDING
- **File**: `src/pages/users/admin/finances/AdminFinances.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "Financial Management"
- **Subtitle**: "Track revenue, commissions, and platform financials"

### 4. **Admin Security** 🔄 PENDING
- **File**: `src/pages/users/admin/security/AdminSecurity.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "Security & Compliance"
- **Subtitle**: "Monitor security events and system integrity"

### 5. **Admin Settings** 🔄 PENDING
- **File**: `src/pages/users/admin/settings/AdminSettings.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "Platform Settings"
- **Subtitle**: "Configure system-wide settings and preferences"

### 6. **Admin System Status** 🔄 PENDING
- **File**: `src/pages/users/admin/system-status/AdminSystemStatus.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "System Status"
- **Subtitle**: "Monitor system health and performance"

### 7. **Admin Emergency** 🔄 PENDING
- **File**: `src/pages/users/admin/emergency/AdminEmergency.tsx`
- **Current**: Uses `AdminHeader`
- **Change to**: `AdminLayout`
- **Title**: "Emergency Tools"
- **Subtitle**: "Critical system management and emergency controls"

### 8. **Document Approval** 🔄 PENDING
- **File**: `src/pages/users/admin/documents/DocumentApproval.tsx`
- **Current**: No header (needs to be added)
- **Change to**: `AdminLayout`
- **Title**: "Document Verification"
- **Subtitle**: "Review and approve vendor documentation"

---

## Changes Required for Each File:

### Step 1: Update Import
```typescript
// OLD:
import { AdminHeader } from '../../../../shared/components/layout/AdminHeader';

// NEW:
import { AdminLayout } from '../shared';
```

### Step 2: Update Component Structure
```typescript
// OLD:
return (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
    <AdminHeader />
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="mb-8">
        <h1>Page Title</h1>
        <p>Page subtitle</p>
      </div>
      {/* Content */}
    </div>
  </div>
);

// NEW:
return (
  <AdminLayout title="Page Title" subtitle="Page subtitle">
    {/* Content - remove pt-28, h1, and subtitle p tag */}
  </AdminLayout>
);
```

### Step 3: Remove Redundant Elements
- Remove outer `<div className="min-h-screen...">`
- Remove `<AdminHeader />`
- Remove `pt-28` or `pt-24` padding from container
- Remove manual `<h1>` and `<p>` for title/subtitle
- Keep all other content intact

---

## Testing Checklist

After updating each page:
- [ ] Page loads without errors
- [ ] Sidebar navigation visible
- [ ] No header at top
- [ ] Title and subtitle display correctly
- [ ] All content renders properly
- [ ] No console errors
- [ ] Responsive design works

---

*Update Status: 0/8 Complete*
