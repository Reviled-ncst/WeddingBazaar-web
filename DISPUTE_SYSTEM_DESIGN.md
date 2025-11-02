# 🚨 Dispute & No-Show Reporting System Design

**Date**: November 3, 2025  
**Status**: 🚧 DESIGN PHASE  
**Priority**: HIGH (Trust & Safety Feature)

---

## 📋 OVERVIEW

A comprehensive dispute resolution system that allows both couples and vendors to report issues, no-shows, and service problems. This protects platform users and maintains service quality.

---

## 🎯 USER STORIES

### **As a Couple:**
- I want to report a vendor who didn't show up on my wedding day
- I want to report poor service quality or incomplete work
- I want to request a refund if the vendor failed to deliver
- I want to see the status of my dispute and admin response

### **As a Vendor:**
- I want to report a couple who cancelled last-minute without notice
- I want to report false accusations or unfair reviews
- I want to dispute a chargeback or refund request
- I want to protect my reputation with evidence

### **As an Admin:**
- I want to review all disputes with evidence from both parties
- I want to mediate conflicts and make fair decisions
- I want to issue refunds or penalties based on investigation
- I want to track repeat offenders (both vendors and couples)

---

## 🗄️ DATABASE SCHEMA

### **1. `booking_disputes` Table**
```sql
CREATE TABLE booking_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id),
  reported_against UUID NOT NULL REFERENCES users(id),
  
  -- Dispute Details
  dispute_type VARCHAR(50) NOT NULL CHECK (dispute_type IN (
    'vendor_no_show',
    'couple_no_show', 
    'service_not_delivered',
    'poor_quality',
    'late_arrival',
    'early_departure',
    'breach_of_contract',
    'payment_dispute',
    'false_accusations',
    'other'
  )),
  
  dispute_category VARCHAR(50) NOT NULL CHECK (dispute_category IN (
    'no_show',
    'service_quality',
    'payment',
    'contract',
    'behavior'
  )),
  
  -- Evidence & Description
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Photos, videos, documents
  event_date DATE NOT NULL, -- Date service was supposed to happen
  report_date TIMESTAMP DEFAULT NOW(),
  
  -- Status & Resolution
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Awaiting admin review
    'under_review',      -- Admin is investigating
    'awaiting_response', -- Waiting for other party's response
    'resolved',          -- Dispute resolved
    'rejected',          -- Dispute rejected
    'escalated'          -- Escalated to higher authority
  )),
  
  resolution_type VARCHAR(50) CHECK (resolution_type IN (
    'full_refund',
    'partial_refund',
    'no_refund',
    'vendor_penalty',
    'couple_penalty',
    'mutual_agreement',
    'insufficient_evidence'
  )),
  
  refund_amount DECIMAL(10,2),
  penalty_amount DECIMAL(10,2),
  
  -- Admin Action
  admin_notes TEXT,
  admin_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_disputes_booking ON booking_disputes(booking_id);
CREATE INDEX idx_disputes_reporter ON booking_disputes(reported_by);
CREATE INDEX idx_disputes_status ON booking_disputes(status);
CREATE INDEX idx_disputes_type ON booking_disputes(dispute_type);
CREATE INDEX idx_disputes_event_date ON booking_disputes(event_date);
```

### **2. `dispute_responses` Table (Thread/Chat)**
```sql
CREATE TABLE dispute_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES booking_disputes(id) ON DELETE CASCADE,
  
  -- Response Details
  responder_id UUID NOT NULL REFERENCES users(id),
  responder_role VARCHAR(20) NOT NULL CHECK (responder_role IN ('admin', 'vendor', 'couple')),
  
  message TEXT NOT NULL,
  evidence_urls TEXT[], -- Additional evidence
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_responses_dispute ON dispute_responses(dispute_id);
```

### **3. `user_reputation_scores` Table**
```sql
CREATE TABLE user_reputation_scores (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Score Metrics
  total_disputes_filed INT DEFAULT 0,
  disputes_won INT DEFAULT 0,
  disputes_lost INT DEFAULT 0,
  no_show_count INT DEFAULT 0,
  
  -- Reputation Score (0-100)
  reputation_score INT DEFAULT 100 CHECK (reputation_score >= 0 AND reputation_score <= 100),
  
  -- Status
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspended_until TIMESTAMP,
  
  -- Timestamps
  last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API ENDPOINTS

### **File Disputes (Both Couple & Vendor)**

#### `POST /api/bookings/:bookingId/dispute`
```json
{
  "disputeType": "vendor_no_show",
  "description": "Vendor did not show up on wedding day despite confirmed booking",
  "evidenceUrls": ["cloudinary-url-1", "cloudinary-url-2"],
  "eventDate": "2025-12-15",
  "refundRequested": true,
  "requestedAmount": 50000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute filed successfully. Admin will review within 24-48 hours.",
  "disputeId": "uuid",
  "caseNumber": "DSP-2025-00123",
  "status": "pending"
}
```

---

### **View Dispute Details**

#### `GET /api/disputes/:disputeId`
```json
{
  "success": true,
  "dispute": {
    "id": "uuid",
    "caseNumber": "DSP-2025-00123",
    "bookingId": "uuid",
    "reportedBy": { "id": "uuid", "name": "John Doe", "role": "couple" },
    "reportedAgainst": { "id": "uuid", "name": "Vendor Name", "role": "vendor" },
    "disputeType": "vendor_no_show",
    "description": "...",
    "evidenceUrls": ["url1", "url2"],
    "status": "under_review",
    "reportDate": "2025-11-03T10:00:00Z",
    "responses": [
      {
        "responder": "Admin",
        "message": "We are reviewing your case...",
        "timestamp": "2025-11-03T12:00:00Z"
      }
    ]
  }
}
```

---

### **Add Response to Dispute**

#### `POST /api/disputes/:disputeId/respond`
```json
{
  "message": "Here is additional evidence...",
  "evidenceUrls": ["url3", "url4"]
}
```

---

### **Admin: Resolve Dispute**

#### `POST /api/admin/disputes/:disputeId/resolve`
```json
{
  "resolutionType": "full_refund",
  "refundAmount": 50000,
  "adminNotes": "Evidence clearly shows vendor did not appear. Full refund issued.",
  "penaltyToVendor": 10000
}
```

---

## 🎨 FRONTEND UI COMPONENTS

### **1. Report Issue Button (Couple Side)**

**Location**: `IndividualBookings.tsx` - Show for bookings past event date

```tsx
{/* Report Issue Button - Show after event date has passed */}
{booking.daysUntilEvent < 0 && booking.status !== 'completed' && (
  <button
    onClick={() => handleReportIssue(booking)}
    className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 
               text-white rounded-lg hover:shadow-lg transition-all 
               hover:scale-105 flex items-center justify-center gap-2"
  >
    <AlertTriangle className="w-4 h-4" />
    Report Issue / No-Show
  </button>
)}
```

### **2. Report Dispute Modal**

**New Component**: `ReportDisputeModal.tsx`

```tsx
interface ReportDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  reporterRole: 'couple' | 'vendor';
  onSubmit: (disputeData: DisputeData) => Promise<void>;
}

const ReportDisputeModal: React.FC<ReportDisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
  reporterRole,
  onSubmit
}) => {
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [refundRequested, setRefundRequested] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState(0);
  
  // ... UI for dispute form with:
  // - Dispute type dropdown
  // - Description textarea
  // - Evidence upload (photos/videos)
  // - Refund request checkbox
  // - Submit button
};
```

### **3. Dispute Status View**

**New Component**: `DisputeStatusCard.tsx`

Shows:
- Case number
- Status badge
- Timeline of events
- Admin responses
- Resolution (if any)

---

## 🔔 NOTIFICATION SYSTEM

### **Email Notifications**

1. **Dispute Filed** → Notify admin + other party
2. **Under Review** → Notify reporter
3. **Response Added** → Notify all parties
4. **Resolved** → Notify both parties with resolution details
5. **Refund Processed** → Notify couple

### **In-App Notifications**

- Bell icon badge count
- Toast notifications for status updates
- Email fallback if user not online

---

## 🛡️ BUSINESS RULES

### **When Can Disputes Be Filed?**

1. **After Event Date** - Can report no-show or service issues
2. **Before Event Date** - Can report cancellation or contract breach
3. **Within 30 Days** - Must file within 30 days of event date
4. **One Dispute Per Booking** - Prevent spam

### **Automatic Actions**

1. **3+ No-Shows** → Vendor account suspended
2. **Resolved Against Vendor** → Reputation score -10 points
3. **False Accusations** → Couple reputation score -5 points
4. **Full Refund** → Booking status → 'refunded'

### **Refund Policy**

- **Vendor No-Show**: 100% refund + penalty to vendor
- **Poor Service**: 25-75% refund (admin decision)
- **Couple Cancellation**: Per vendor's cancellation policy

---

## 📊 ADMIN DASHBOARD

### **Dispute Management Panel**

```
/admin/disputes
├── All Disputes (list)
├── Pending Review (urgent)
├── Under Investigation
├── Resolved Cases
└── Statistics
    ├── Total Disputes This Month
    ├── Average Resolution Time
    ├── Refund Amount Issued
    └── Vendor Suspension Count
```

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Backend Foundation** (2-3 days)
- [ ] Create database tables
- [ ] Build API endpoints
- [ ] Add reputation score system

### **Phase 2: Frontend UI** (3-4 days)
- [ ] Report Issue button (couple side)
- [ ] Report Dispute Modal
- [ ] Dispute Status Card
- [ ] Vendor dispute filing (VendorBookings)

### **Phase 3: Admin Panel** (2-3 days)
- [ ] Admin dispute list
- [ ] Review & resolve interface
- [ ] Refund processing integration

### **Phase 4: Notifications** (2 days)
- [ ] Email templates
- [ ] In-app notifications
- [ ] SMS alerts (optional)

### **Phase 5: Testing & Polish** (2 days)
- [ ] End-to-end testing
- [ ] Edge case handling
- [ ] UI/UX improvements

**Total Estimated Time**: 11-14 days

---

## 🔮 FUTURE ENHANCEMENTS

1. **AI-Powered Evidence Analysis** - Auto-detect fake evidence
2. **Mediation Chat** - Real-time chat between parties + admin
3. **Arbitration** - Third-party arbitrators for complex cases
4. **Insurance Integration** - Automatic claims for insured bookings
5. **Escrow System** - Hold payments until service completion

---

## 📝 NEXT STEPS

1. ✅ Design approval (this document)
2. 🚧 Create database migration script
3. 🚧 Build backend API endpoints
4. 🚧 Implement frontend UI components
5. 🚧 Admin panel development
6. 🚧 Testing and deployment

---

**Would you like me to start implementing this system?** 🚀

I can begin with:
1. Database migration script
2. Backend API endpoints
3. Frontend "Report Issue" button + modal
