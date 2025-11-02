# 🛠️ COORDINATOR CRUD IMPLEMENTATION PLAN

**Date**: December 21, 2024  
**Phase**: CRUD Operations Implementation  
**Status**: 🚧 IN PROGRESS

---

## 📋 OVERVIEW

This document outlines the plan to implement full CRUD (Create, Read, Update, Delete) operations for the Wedding Bazaar Coordinator module across weddings, clients, and vendors.

---

## 🎯 OBJECTIVES

### Primary Goals
1. ✅ Implement CREATE operations (forms/modals)
2. ✅ Implement UPDATE operations (edit forms/modals)
3. ✅ Implement DELETE operations (with confirmation)
4. ✅ Implement DETAIL views (view modals/pages)
5. ✅ Add proper error handling and validation
6. ✅ Ensure all operations connect to backend APIs

### Secondary Goals
1. Add loading states for all operations
2. Add success/error notifications
3. Add form validation
4. Add confirmation dialogs
5. Add optimistic UI updates

---

## 📐 ARCHITECTURE

### Frontend Structure
```
src/pages/users/coordinator/
├── weddings/
│   ├── CoordinatorWeddings.tsx          # Main list view ✅
│   ├── components/
│   │   ├── WeddingCreateModal.tsx       # Create form 🚧
│   │   ├── WeddingEditModal.tsx         # Edit form 🚧
│   │   ├── WeddingDetailsModal.tsx      # View details 🚧
│   │   └── WeddingDeleteDialog.tsx      # Delete confirmation 🚧
│   └── index.ts
├── clients/
│   ├── CoordinatorClients.tsx           # Main list view ✅
│   ├── components/
│   │   ├── ClientCreateModal.tsx        # Create form 🚧
│   │   ├── ClientEditModal.tsx          # Edit form 🚧
│   │   ├── ClientDetailsModal.tsx       # View details 🚧
│   │   └── ClientDeleteDialog.tsx       # Delete confirmation 🚧
│   └── index.ts
├── vendors/
│   ├── CoordinatorVendors.tsx           # Main list view ✅
│   ├── components/
│   │   ├── VendorCreateModal.tsx        # Create form 🚧
│   │   ├── VendorEditModal.tsx          # Edit form 🚧
│   │   ├── VendorDetailsModal.tsx       # View details 🚧
│   │   └── VendorDeleteDialog.tsx       # Delete confirmation 🚧
│   └── index.ts
```

### Backend API Endpoints
```
Weddings:
✅ GET    /api/coordinator/weddings           # List all weddings
🚧 POST   /api/coordinator/weddings           # Create wedding
🚧 GET    /api/coordinator/weddings/:id       # Get wedding details
🚧 PUT    /api/coordinator/weddings/:id       # Update wedding
🚧 DELETE /api/coordinator/weddings/:id       # Delete wedding

Clients:
✅ GET    /api/coordinator/clients             # List all clients
🚧 POST   /api/coordinator/clients             # Create client
🚧 GET    /api/coordinator/clients/:id         # Get client details
🚧 PUT    /api/coordinator/clients/:id         # Update client
🚧 DELETE /api/coordinator/clients/:id         # Delete client

Vendors:
✅ GET    /api/coordinator/vendor-network      # List all vendors
🚧 POST   /api/coordinator/vendor-network      # Add vendor to network
🚧 GET    /api/coordinator/vendor-network/:id  # Get vendor details
🚧 PUT    /api/coordinator/vendor-network/:id  # Update vendor info
🚧 DELETE /api/coordinator/vendor-network/:id  # Remove from network
```

---

## 🔨 IMPLEMENTATION PHASES

### Phase 1: Backend API Endpoints (1-2 hours)
**Priority**: HIGH  
**Status**: 🚧 STARTING NOW

#### 1.1 Weddings CRUD Endpoints
- [ ] POST `/api/coordinator/weddings` - Create wedding
- [ ] GET `/api/coordinator/weddings/:id` - Get wedding details
- [ ] PUT `/api/coordinator/weddings/:id` - Update wedding
- [ ] DELETE `/api/coordinator/weddings/:id` - Delete wedding

#### 1.2 Clients CRUD Endpoints
- [ ] POST `/api/coordinator/clients` - Create client
- [ ] GET `/api/coordinator/clients/:id` - Get client details
- [ ] PUT `/api/coordinator/clients/:id` - Update client
- [ ] DELETE `/api/coordinator/clients/:id` - Delete client

#### 1.3 Vendors CRUD Endpoints
- [ ] POST `/api/coordinator/vendor-network` - Add vendor
- [ ] GET `/api/coordinator/vendor-network/:id` - Get vendor details
- [ ] PUT `/api/coordinator/vendor-network/:id` - Update vendor
- [ ] DELETE `/api/coordinator/vendor-network/:id` - Remove vendor

### Phase 2: Frontend Service Layer (30 minutes)
**Priority**: HIGH  
**Status**: ⏳ WAITING

Update `src/shared/services/coordinatorService.ts`:
- [ ] Add `createWedding()` function
- [ ] Add `updateWedding()` function
- [ ] Add `deleteWedding()` function
- [ ] Add `getWeddingDetails()` function
- [ ] Add similar functions for clients and vendors

### Phase 3: UI Components (2-3 hours)
**Priority**: MEDIUM  
**Status**: ⏳ WAITING

#### 3.1 Wedding Components
- [ ] WeddingCreateModal.tsx
- [ ] WeddingEditModal.tsx
- [ ] WeddingDetailsModal.tsx
- [ ] WeddingDeleteDialog.tsx

#### 3.2 Client Components
- [ ] ClientCreateModal.tsx
- [ ] ClientEditModal.tsx
- [ ] ClientDetailsModal.tsx
- [ ] ClientDeleteDialog.tsx

#### 3.3 Vendor Components
- [ ] VendorCreateModal.tsx (or InviteModal)
- [ ] VendorEditModal.tsx
- [ ] VendorDetailsModal.tsx
- [ ] VendorDeleteDialog.tsx

### Phase 4: Integration & Testing (1 hour)
**Priority**: HIGH  
**Status**: ⏳ WAITING

- [ ] Test create operations
- [ ] Test update operations
- [ ] Test delete operations
- [ ] Test detail views
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test form validation

---

## 📝 DETAILED SPECIFICATIONS

### Wedding CRUD Operations

#### Create Wedding
**Required Fields**:
- Couple names (string)
- Couple email (email)
- Couple phone (string)
- Wedding date (date)
- Venue (string)
- Budget (number)
- Guest count (number)

**Optional Fields**:
- Venue address
- Preferred style
- Notes
- Special requests

**Validation**:
- Wedding date must be in the future
- Budget must be positive number
- Email must be valid format
- Phone must be valid format

#### Update Wedding
**Editable Fields**:
- All fields from create
- Status
- Progress percentage
- Vendors booked count

#### Delete Wedding
**Requirements**:
- Confirmation dialog required
- Soft delete (mark as cancelled)
- Cannot delete if has active bookings

#### View Details
**Display**:
- All wedding information
- Associated milestones
- Assigned vendors
- Payment history
- Timeline

---

### Client CRUD Operations

#### Create Client
**Required Fields**:
- Couple name (string)
- Email (email)
- Phone (string)
- Wedding date (date)

**Optional Fields**:
- Venue
- Budget range
- Preferred style
- Guest count
- Notes

#### Update Client
**Editable Fields**:
- All fields from create
- Status
- Last contact date

#### Delete Client
**Requirements**:
- Confirmation dialog
- Archive instead of hard delete
- Transfer associated data

#### View Details
**Display**:
- Client profile
- Wedding details
- Communication history
- Documents
- Payment status

---

### Vendor Network CRUD Operations

#### Add Vendor to Network
**Required Fields**:
- Business name (string)
- Category (select)
- Email (email)
- Phone (string)

**Optional Fields**:
- Location
- Price range
- Specialties
- Notes
- Is preferred (boolean)

#### Update Vendor Info
**Editable Fields**:
- All fields from add
- Rating (readonly)
- Completed bookings (readonly)
- Revenue (readonly)

#### Remove from Network
**Requirements**:
- Confirmation dialog
- Option to block/unblock
- Preserve historical data

#### View Vendor Details
**Display**:
- Vendor profile
- Performance metrics
- Client reviews
- Booking history
- Revenue data

---

## 🎨 UI/UX SPECIFICATIONS

### Modal Design
```tsx
// Common modal styles
const modalStyles = {
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
  container: 'fixed inset-0 flex items-center justify-center p-4',
  modal: 'bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto',
  header: 'px-6 py-4 border-b border-gray-200',
  body: 'px-6 py-4',
  footer: 'px-6 py-4 border-t border-gray-200 flex justify-end gap-3'
};
```

### Form Layout
- Two-column layout for desktop
- Single-column for mobile
- Clear labels and placeholders
- Inline validation errors
- Required field indicators
- Help text for complex fields

### Button States
- Primary: Pink gradient (`bg-gradient-to-r from-pink-500 to-purple-500`)
- Secondary: White with border
- Danger: Red for delete operations
- Disabled: Grayed out with cursor-not-allowed

### Loading States
- Skeleton loaders for data
- Spinner for operations
- Disabled buttons during submission
- Progress bars for multi-step operations

---

## 🔐 VALIDATION RULES

### Common Validations
```typescript
const validations = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  url: /^https?:\/\/.+/,
  date: (date: string) => new Date(date) > new Date(),
  budget: (amount: number) => amount > 0 && amount < 10000000,
  percentage: (val: number) => val >= 0 && val <= 100
};
```

### Field-Specific Rules
- **Couple Name**: Min 3 chars, max 100 chars
- **Email**: Valid email format, unique in system
- **Phone**: Valid phone format, Philippine format preferred
- **Wedding Date**: Future date, not more than 3 years ahead
- **Budget**: Between ₱10,000 and ₱10,000,000
- **Guest Count**: Between 10 and 1000

---

## 🚨 ERROR HANDLING

### API Errors
```typescript
interface ApiError {
  success: false;
  error: string;
  details?: any;
  statusCode: number;
}

// Error handling pattern
try {
  const result = await createWedding(data);
  if (result.success) {
    showSuccessNotification('Wedding created successfully!');
    closeModal();
    refreshList();
  }
} catch (error: any) {
  if (error.statusCode === 409) {
    showErrorNotification('Wedding with this date already exists');
  } else if (error.statusCode === 400) {
    showValidationErrors(error.details);
  } else {
    showErrorNotification('Failed to create wedding. Please try again.');
  }
}
```

### User-Facing Messages
- **Success**: Toast notification, auto-dismiss after 3s
- **Error**: Alert modal with retry option
- **Validation**: Inline error messages below fields
- **Network**: "Connection lost" banner

---

## 📊 SUCCESS METRICS

### Functionality
- ✅ All CRUD operations working
- ✅ Proper error handling
- ✅ Form validation
- ✅ Loading states
- ✅ Success notifications

### Performance
- ✅ Form submission < 2s
- ✅ List refresh < 1s
- ✅ Modal open/close smooth
- ✅ No UI blocking

### UX
- ✅ Clear feedback for all actions
- ✅ Confirmation for destructive actions
- ✅ Intuitive form layouts
- ✅ Mobile responsive
- ✅ Accessible (ARIA labels)

---

## 📅 TIMELINE

| Phase | Task | Estimated Time | Status |
|-------|------|----------------|--------|
| 1 | Backend - Weddings CRUD | 45 min | 🚧 |
| 1 | Backend - Clients CRUD | 30 min | ⏳ |
| 1 | Backend - Vendors CRUD | 30 min | ⏳ |
| 1 | Backend Testing | 15 min | ⏳ |
| 2 | Frontend Service Layer | 30 min | ⏳ |
| 3 | Wedding UI Components | 60 min | ⏳ |
| 3 | Client UI Components | 45 min | ⏳ |
| 3 | Vendor UI Components | 45 min | ⏳ |
| 4 | Integration & Testing | 60 min | ⏳ |
| 4 | Bug Fixes & Polish | 30 min | ⏳ |

**Total Estimated Time**: 6-7 hours

---

## 🎯 NEXT STEPS

1. **NOW**: Implement backend CRUD endpoints for weddings
2. **NEXT**: Implement backend CRUD endpoints for clients/vendors
3. **THEN**: Update frontend service layer
4. **THEN**: Create UI components
5. **FINALLY**: Test and deploy

---

## 📚 REFERENCES

- Backend: `backend-deploy/routes/coordinator/weddings.cjs`
- Frontend: `src/pages/users/coordinator/weddings/CoordinatorWeddings.tsx`
- Service: `src/shared/services/coordinatorService.ts`
- Types: `src/shared/types/coordinator.types.ts` (to be created)

---

**Last Updated**: December 21, 2024  
**Next Review**: After Phase 1 completion
